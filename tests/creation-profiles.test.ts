import assert from 'node:assert/strict'
import test from 'node:test'
import { isCharacterDraft } from '../src/drafts/draft-inputs.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { loadDraftLibrary, saveDraftLibrary, withSavedDraft, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { rowanCharacter } from './fixtures/rowan-pike.ts'

test('Rowan Pike completes standard Gangrel fledgling creation', () => {
  const { sheet, path, pending, starting } = evaluateCharacter(rowanCharacter)
  assert.equal(path.complete, true)
  assert.ok(Object.values(pending).every(issues => issues.length === 0))
  assert.equal(sheet.draft, false)
  assert.equal(sheet.identity.ageProfile, 'Fledgling')
  assert.equal(sheet.identity.generation, 12)
  assert.equal(sheet.identity.predator, undefined)
  assert.deepEqual(sheet.tracks, { health: 8, willpower: 5, humanity: 7, bloodPotency: 1, baneSeverity: 2, bloodSurge: 2 })
  assert.deepEqual(sheet.disciplines, [
    { name: 'Fortitude', rating: 2, powers: ['Resilience', 'Toughness'] },
    { name: 'Protean', rating: 1, powers: ['Eyes of the Beast'] },
  ])
  assert.equal(starting.advantageBudget.limit, 7)
  assert.equal(starting.flawBudget.limit, 2)
  assert.equal(sheet.advantageDots, 7)
  assert.equal(sheet.flawDots, 2)
  assert.equal(sheet.xpSpent, 0)
  assert.equal(sheet.xpRemaining, 0)
  const brief = makeStorytellerBrief(rowanCharacter)
  assert.match(brief, /Age profile:\*\* Fledgling/)
  assert.match(brief, /0 XP spent · 0 XP remaining/)
  assert.doesNotMatch(brief, /Predator Type:\*\* Unassigned/)
})

test('switching profiles pauses Predator Type and XP choices without deleting them', () => {
  assert.equal(maraCharacter.ageProfile, undefined)
  assert.equal(evaluateCharacter(maraCharacter).ageProfile, 'neonate')
  const fledgling = editCharacter(maraCharacter, { type: 'age-profile', profile: 'fledgling' })
  const { sheet, path, traits, starting, pending } = evaluateCharacter(fledgling)
  assert.equal(path.predator, undefined)
  assert.equal(traits.specialties.predatorGrant, undefined)
  assert.equal(sheet.tracks.humanity, 7)
  assert.equal(sheet.advantageDots, 7)
  assert.equal(sheet.disciplines.find(discipline => discipline.name === 'Potence')?.rating, 1)
  assert.deepEqual(starting.entries, [])
  assert.equal(starting.final.skills.stealth ?? 0, 0)
  assert.equal(starting.final.skills.drive, 1)
  assert.deepEqual(pending.clan, [])
  assert.deepEqual(pending.starting, [])
  assert.equal(fledgling.clanPath, maraCharacter.clanPath)
  assert.equal(fledgling.starting, maraCharacter.starting)
  const back = editCharacter(fledgling, { type: 'age-profile', profile: 'neonate' })
  assert.deepEqual(evaluateCharacter(back).sheet, evaluateCharacter(maraCharacter).sheet)
})

test('the versioned fledgling backup keeps paused choices and the browser library still reads v1 neonates', () => {
  const mara = { id: 'mara', name: 'Mara Vale', step: 'review' as const, character: maraCharacter }
  const legacyLibrary = { activeId: mara.id, drafts: [mara] }
  let raw = JSON.stringify({ schemaVersion: 1, ruleset: 'vtm-v5', ...legacyLibrary })
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  assert.deepEqual(loadDraftLibrary(storage).library, legacyLibrary)
  const legacyBackup = JSON.stringify({ format: 'vtm-character-creator-draft', schemaVersion: 1, ruleset: 'vtm-v5', draft: mara })
  const restoredMara = readDraftBackup(legacyBackup).draft
  assert.ok(restoredMara)
  assert.equal(evaluateCharacter(restoredMara.character).sheet.tracks.humanity, 6)
  assert.equal(evaluateCharacter(restoredMara.character).sheet.identity.ageProfile, 'Neonate')

  const rowan = { id: 'rowan', name: 'Rowan Pike', step: 'review' as const, character: rowanCharacter }
  const saved = saveDraftLibrary(storage, withSavedDraft(legacyLibrary, rowan), raw)
  assert.ok(saved.saved)
  assert.equal(JSON.parse(raw).schemaVersion, 2)
  assert.deepEqual(loadDraftLibrary(storage).library.drafts, [mara, rowan])
  const backup = serializeDraftDownload(rowan)
  assert.equal(JSON.parse(backup).schemaVersion, 2)
  const restored = readDraftBackup(backup).draft
  assert.ok(restored)
  assert.deepEqual(restored.character, rowanCharacter)
  assert.equal(restored.step, 'review')
  assert.deepEqual(evaluateCharacter(restored.character).sheet, evaluateCharacter(rowanCharacter).sheet)
  const switched = { ...mara, character: editCharacter(maraCharacter, { type: 'age-profile', profile: 'fledgling' }) }
  const paused = readDraftBackup(serializeDraftDownload(switched)).draft
  assert.ok(paused)
  assert.deepEqual(paused.character.starting.purchases, maraCharacter.starting.purchases)
  assert.match(readDraftBackup(backup.replace('"schemaVersion": 2', '"schemaVersion": 1')).issue ?? '', /version/)
  assert.equal(isCharacterDraft({ ...rowanCharacter, ageProfile: 'unknown' }), false)
})

test('fledgling build links include the profile while equivalent neonate inputs retain v1 bytes', () => {
  const fledgling = editCharacter(maraCharacter, { type: 'age-profile', profile: 'fledgling' })
  const hash = encodeBuildLink(fledgling)
  assert.ok(hash)
  const payload = JSON.parse(Buffer.from(hash.slice(buildLinkPrefix.length), 'base64url').toString('utf8'))
  assert.equal(payload.version, 2)
  assert.equal(payload.mechanics.ageProfile, 'fledgling')
  assert.equal(payload.mechanics.clanPath.predatorType, '')
  assert.deepEqual(payload.mechanics.starting.purchases, [])
  const decoded = decodeBuildLink(hash)
  assert.ok('draft' in decoded, decoded.issue)
  assert.equal(evaluateCharacter(decoded.draft).path.predator, undefined)
  assert.equal(evaluateCharacter(decoded.draft).starting.profile.xp, 0)

  const legacy = encodeBuildLink(maraCharacter)
  assert.ok(legacy)
  const explicit = encodeBuildLink(editCharacter(maraCharacter, { type: 'age-profile', profile: 'neonate' }))
  assert.equal(explicit, legacy)
  const old = decodeBuildLink(legacy)
  assert.ok('draft' in old, old.issue)
  assert.equal(old.draft.ageProfile, undefined)
  assert.equal(evaluateCharacter(old.draft).sheet.identity.predator, 'Alleycat')
  assert.equal(evaluateCharacter(old.draft).sheet.xpRemaining, 0)
})
