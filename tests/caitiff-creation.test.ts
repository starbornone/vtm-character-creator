import assert from 'node:assert/strict'
import test from 'node:test'
import { disciplineIds } from '../src/catalog/clan-path.ts'
import { appendRestoredDraft, loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { quotePurchase, type Purchase } from '../src/rules/starting-xp.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { nessaCharacter } from './fixtures/nessa-reed.ts'

const completed = evaluateCharacter(nessaCharacter)
const withoutPurchases = editCharacter(nessaCharacter, { type: 'starting', update: { purchases: [] } })
const animalism = { kind: 'discipline', id: 'animalism', to: 1, power: 'bond-famulus', caitiffLearning: true } as const

test('Nessa Reed completes Caitiff creation with the expected tracks, grants, and XP', () => {
  const { path, starting, sheet } = completed
  assert.ok(path.complete)
  assert.equal(sheet.draft, false)
  assert.equal(sheet.identity.clan, 'Caitiff')
  assert.equal(sheet.identity.ageProfile, 'Neonate')
  assert.equal(sheet.identity.generation, 13)
  assert.equal(sheet.identity.predator, 'Bagger')
  assert.equal(sheet.bane, undefined)
  assert.equal(sheet.compulsion, undefined)
  assert.deepEqual(sheet.tracks, { health: 8, willpower: 5, humanity: 7, bloodPotency: 1, baneSeverity: 2, bloodSurge: 2 })
  assert.deepEqual(sheet.disciplines, [
    { name: 'Fortitude', rating: 2, powers: ['Resilience', 'Toughness'] },
    { name: 'Obfuscate', rating: 1, powers: ['Cloak of Shadows'] },
    { name: 'Presence', rating: 2, powers: ['Awe', 'Lingering Kiss'] },
  ])
  assert.deepEqual(starting.advantageBudget, { used: 7, limit: 7, remaining: 0 })
  assert.deepEqual(starting.flawBudget, { used: 2, limit: 2, remaining: 0 })
  assert.ok(sheet.advantages.some(grant => grant.name === 'Iron Gullet' && grant.dots === 3 && grant.source === 'Bagger'))
  assert.ok(sheet.flaws.some(grant => grant.name === 'Enemy' && grant.dots === 2 && grant.source === 'Bagger'))
  assert.ok(sheet.flaws.some(grant => grant.name === 'Suspect' && grant.dots === 1 && grant.source === 'Caitiff'))
  assert.equal(sheet.advantageDots, 10)
  assert.equal(sheet.flawDots, 5)
  assert.deepEqual(starting.entries.map(({ cost, remaining }) => [cost, remaining]), [[12, 3], [3, 0]])
  assert.equal(sheet.xpSpent, 15)
  assert.match(makeStorytellerBrief(nessaCharacter), /Suspect · 1 dot · Caitiff/)
})

test('Caitiff can freely choose two distinct Core Disciplines and retain Predator restrictions', () => {
  assert.deepEqual(completed.path.clan?.disciplines, disciplineIds)
  const duplicate = evaluateCharacter(editCharacter(nessaCharacter, { type: 'clan-path', update: { oneDotDiscipline: 'fortitude' } }))
  assert.equal(duplicate.path.oneDot, undefined)
  assert.match(duplicate.pending.clan[0], /two distinct/)
  const sorcerer = evaluateCharacter(editCharacter(nessaCharacter, { type: 'clan-path', update: {
    oneDotDiscipline: 'blood-sorcery', ritual: 'blood-walk', predatorDiscipline: 'blood-sorcery',
    clanPowers: { ...nessaCharacter.clanPath.clanPowers, 'blood-sorcery': { 1: 'a-taste-for-blood' } },
  } }))
  assert.equal(sorcerer.starting.final.disciplines['blood-sorcery'], 1)
  assert.equal(sorcerer.sheet.ritual?.id, 'blood-walk')
  assert.ok(!sorcerer.path.predatorDisciplines.includes('blood-sorcery'))
  const fledgling = evaluateCharacter(editCharacter(nessaCharacter, { type: 'age-profile', profile: 'fledgling' }))
  assert.equal(fledgling.path.predator, undefined)
  assert.equal(fledgling.sheet.flawDots, 3)
  assert.deepEqual(fledgling.starting.entries, [])
  const ancilla = evaluateCharacter(editCharacter(nessaCharacter, { type: 'age-profile', profile: 'ancilla' }))
  assert.equal(ancilla.starting.flawBudget.limit, 4)
  assert.equal(ancilla.sheet.xpRemaining, 20)
})

test('Caitiff pay 6 XP times the new rank for base, Predator, and newly learned Disciplines', () => {
  const state = evaluateCharacter(withoutPurchases).starting.final
  assert.deepEqual(quotePurchase(state, { kind: 'discipline', id: 'obfuscate', to: 2, power: 'unseen-passage' }), { cost: 12, issue: undefined })
  const needsBlood: Purchase = { kind: 'discipline', id: 'animalism', to: 1, power: 'bond-famulus' }
  const missing = quotePurchase(state, needsBlood)
  assert.equal(missing.cost, 6)
  assert.match(missing.issue ?? '', /blood-tasting/)
  assert.deepEqual(quotePurchase(state, animalism), { cost: 6, issue: undefined })
  const rejected = evaluateCharacter(editCharacter(withoutPurchases, { type: 'starting', update: { purchases: [needsBlood] } }))
  assert.equal(rejected.sheet.xpRemaining, 15)
  assert.equal(rejected.starting.final.disciplines.animalism, 0)
  const learned = evaluateCharacter(editCharacter(withoutPurchases, { type: 'starting', update: { purchases: [animalism] } }))
  assert.equal(learned.starting.final.disciplines.animalism, 1)
  assert.equal(learned.sheet.xpRemaining, 9)
  assert.match(quotePurchase(learned.starting.final, { kind: 'discipline', id: 'animalism', to: 2, power: 'feral-whispers' }).issue ?? '', /Not enough starting XP/)
})

test('Caitiff cannot buy positive Status and cannot claim Suspect twice', () => {
  const manualOptions = [
    { kind: 'advantage', name: 'Status (Camarilla)', dots: 2, source: 'Core p. 194' },
    { kind: 'flaw', name: 'Suspect', dots: 1, source: 'Core p. 194' },
  ] as const
  const { starting, sheet, pending } = evaluateCharacter(editCharacter(nessaCharacter, {
    type: 'starting', update: { manualOptions: [...manualOptions] },
  }))
  assert.match(starting.manualOptions[0].issue ?? '', /positive Status/)
  assert.match(starting.manualOptions[1].issue ?? '', /already appears/)
  assert.equal(sheet.advantageDots, 10)
  assert.equal(sheet.flawDots, 5)
  assert.ok(pending.starting.some(issue => /manual Advantages and Flaws/.test(issue)))
  const path = evaluateCharacter(editCharacter(nessaCharacter, { type: 'clan-path', update: {
    predatorType: 'manual', manualPredator: { name: 'Custom', source: 'Table', advantage: { name: 'Anarch Status', dots: 1 } },
  } })).path
  assert.match(path.predatorIssue ?? '', /positive Status/)
  assert.equal(path.advantages.length, 0)
})

test('a Caitiff backup restores as a separate named draft alongside its v1 predecessors', () => {
  const legacy = { id: 'mara', name: 'Mara', step: 'review' as const, character: maraCharacter }
  const prior = { activeId: legacy.id, drafts: [legacy] }
  let raw = JSON.stringify({ schemaVersion: 1, ruleset: 'vtm-v5', ...prior })
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  assert.deepEqual(loadDraftLibrary(storage).library, prior)
  const backup = serializeDraftDownload({ name: 'Nessa', step: 'review', character: nessaCharacter })
  assert.equal(JSON.parse(backup).schemaVersion, 3)
  assert.ok(readDraftBackup(backup.replace('"schemaVersion": 3', '"schemaVersion": 2')).issue)
  const result = readDraftBackup(backup)
  assert.ok(result.draft, result.issue)
  const restored = appendRestoredDraft(prior, result.draft, 'nessa')
  assert.ok(restored.library, restored.issue)
  assert.ok(saveDraftLibrary(storage, restored.library, raw).saved)
  const saved = loadDraftLibrary(storage).library
  assert.equal(saved.activeId, 'nessa')
  assert.deepEqual(saved.drafts[0], legacy)
  assert.equal(saved.drafts[1].step, 'review')
  assert.deepEqual(evaluateCharacter(saved.drafts[1].character).sheet, completed.sheet)
})

test('version 3 links carry Caitiff and checked learning without authored text', () => {
  const learning = editCharacter(withoutPurchases, { type: 'starting', update: { purchases: [animalism] } })
  const backup = serializeDraftDownload({ name: 'Nessa', step: 'starting', character: learning })
  assert.deepEqual(readDraftBackup(backup).draft?.character.starting.purchases, [animalism])
  assert.ok(readDraftBackup(backup.replace('"caitiffLearning": true', '"caitiffLearning": "yes"')).issue)
  const link = encodeBuildLink(learning)
  assert.ok(link)
  const payload = JSON.parse(Buffer.from(link.slice(buildLinkPrefix.length), 'base64url').toString())
  assert.equal(payload.version, 3)
  assert.equal(payload.mechanics.clanPath.clan, 'caitiff')
  assert.equal(payload.mechanics.starting.purchases[0].caitiffLearning, true)
  assert.ok(!/Nessa Reed|Safecracking|Mae Bell/.test(JSON.stringify(payload)))
  const opened = decodeBuildLink(link)
  assert.ok('draft' in opened, opened.issue)
  assert.equal(evaluateCharacter(opened.draft).starting.final.disciplines.animalism, 1)
  const nonDefault = encodeBuildLink(editCharacter(learning, { type: 'age-profile', profile: 'ancilla' }))
  assert.ok(nonDefault)
  const ancilla = decodeBuildLink(nonDefault)
  assert.ok('draft' in ancilla, ancilla.issue)
  assert.equal(ancilla.draft.ageProfile, 'ancilla')
})
