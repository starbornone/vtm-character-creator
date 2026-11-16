import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRestoredDraft, loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { irisCharacter } from './fixtures/iris-calder.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { advancedMara, maraAdvancement } from './fixtures/mara-vale-advancement.ts'

test('Mara advances from the completed sheet with a separate 55 XP budget', () => {
  const { sheet, starting, advancement, tracks } = evaluateCharacter(advancedMara)
  const original = evaluateCharacter(maraCharacter)
  assert.ok(advancement)
  assert.deepEqual(starting, original.starting)
  assert.equal(tracks.health.total, 6)
  assert.equal(sheet.tracks.health, 7)
  assert.equal(sheet.xpSpent, 15)
  assert.equal(sheet.xpRemaining, 0)
  assert.equal(sheet.draft, false)
  assert.deepEqual(advancement.entries.map(({ cost, remaining, issue }) => [cost, remaining, issue]), [
    [15, 40, undefined], [15, 25, undefined], [20, 5, undefined], [3, 2, undefined],
  ])
  assert.equal(sheet.advancement?.earned, 55)
  assert.equal(sheet.advancement?.spent, 53)
  assert.equal(sheet.advancement?.remaining, 2)
  assert.deepEqual(sheet.disciplines.find(discipline => discipline.name === 'Potence'), {
    name: 'Potence', rating: 3, powers: ['Lethal Body', 'Prowess', 'Spark of Rage'],
  })
  assert.equal(advancement.final.skills.stealth, 2)
  assert.deepEqual(advancement.final.specialties.stealth, ['Catwalks'])
})

test('reordering, removing, and restoring awards or prerequisites replays the journal', () => {
  const [presence, potence, ...later] = maraAdvancement.purchases
  const reordered = { ...advancedMara, advancement: { ...maraAdvancement, purchases: [potence, presence, ...later] } }
  const removed = { ...advancedMara, advancement: { ...maraAdvancement, purchases: [potence, ...later] } }
  for (const [draft, remaining] of [[reordered, 17], [removed, 32]] as const) {
    const { advancement, sheet } = evaluateCharacter(draft)
    assert.match(advancement?.entries[0].issue ?? '', /Amalgam prerequisite/)
    assert.equal(advancement?.remaining, remaining)
    assert.equal(sheet.advancement?.pendingPurchases, 1)
    assert.equal(sheet.draft, false)
  }
  const underfunded = editCharacter(advancedMara, { type: 'advancement', journal: { ...maraAdvancement, awards: [20, 10] } })
  const { advancement, sheet } = evaluateCharacter(underfunded)
  assert.equal(advancement?.remaining, 0)
  assert.match(advancement?.entries[2].issue ?? '', /earned XP/)
  assert.equal(sheet.tracks.health, 6)
  assert.equal(sheet.advancement?.pendingPurchases, 2)
  assert.equal(evaluateCharacter(editCharacter(underfunded, { type: 'advancement', journal: maraAdvancement })).advancement?.remaining, 2)
})

test('a creation edit pauses advancement and closing the choice reapplies it', () => {
  const incomplete = editCharacter(advancedMara, { type: 'concept', update: { desire: '' } })
  const paused = evaluateCharacter(incomplete)
  assert.equal(paused.sheet.draft, true)
  assert.equal(paused.advancement?.paused, true)
  assert.equal(paused.sheet.advancement?.remaining, 55)
  assert.equal(paused.sheet.advancement?.pendingPurchases, 4)
  assert.equal(paused.sheet.tracks.health, 6)
  const resumed = editCharacter(incomplete, { type: 'concept', update: { desire: maraCharacter.concept.desire } })
  assert.deepEqual(evaluateCharacter(resumed).sheet, evaluateCharacter(advancedMara).sheet)
})

test('new out-of-clan Disciplines require confirmation and Thin-bloods can advance only their Affinity', () => {
  const { advancement, sheet } = evaluateCharacter({ ...maraCharacter, advancement: { awards: [70], purchases: [
    { kind: 'discipline', id: 'fortitude', to: 1, power: 'resilience' },
    { kind: 'discipline', id: 'fortitude', to: 1, power: 'resilience', outOfClanLearning: true },
    { kind: 'discipline', id: 'celerity', to: 1, power: 'cats-grace' },
    { kind: 'blood-potency', to: 2 }, { kind: 'blood-potency', to: 3 }, { kind: 'blood-potency', to: 4 },
  ] } })
  assert.match(advancement?.entries[0].issue ?? '', /blood-tasting/)
  assert.match(advancement?.entries[5].issue ?? '', /Generation limit/)
  assert.deepEqual(sheet.advancement?.purchases.map(purchase => purchase.cost), [7, 5, 20, 30])
  assert.equal(sheet.tracks.health, 7)
  assert.equal(sheet.tracks.bloodPotency, 3)
  assert.equal(sheet.tracks.bloodSurge, 3)
  assert.equal(sheet.tracks.baneSeverity, 3)

  const thinBlood = evaluateCharacter({ ...irisCharacter, advancement: { awards: [30], purchases: [
    { kind: 'discipline', id: 'fortitude', to: 2, power: 'toughness' },
    { kind: 'discipline', id: 'auspex', to: 1, power: 'heightened-senses', outOfClanLearning: true },
    { kind: 'blood-potency', to: 1 },
  ] } })
  assert.deepEqual(thinBlood.sheet.advancement?.purchases.map(purchase => purchase.cost), [14])
  assert.match(thinBlood.advancement?.entries[1].issue ?? '', /Discipline Affinity/)
  assert.match(thinBlood.advancement?.entries[2].issue ?? '', /Generation limit/)
  assert.equal(thinBlood.sheet.tracks.health, 8)
})

test('advancement survives a backup round-trip and reload alongside a legacy draft', () => {
  const original = { id: 'original', name: 'Mara Vale', step: 'review', character: advancedMara } as const
  const legacy = { ...original, id: 'legacy', name: 'Mara at creation', character: maraCharacter }
  let raw: string | null = null
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  const library = { activeId: original.id, drafts: [legacy, original] }
  const first = saveDraftLibrary(storage, library, null)
  assert.ok(first.saved)
  assert.deepEqual(loadDraftLibrary(storage).library, library)

  const backup = serializeDraftDownload(original)
  assert.equal(JSON.parse(backup).schemaVersion, 6)
  const { draft } = readDraftBackup(backup)
  assert.ok(draft)
  const copy = appendRestoredDraft(library, { ...draft, name: 'Mara Vale (copy)' }, 'copy')
  assert.ok(copy.library)
  assert.ok(saveDraftLibrary(storage, copy.library, first.saved).saved)
  const reopened = loadDraftLibrary(storage).library
  assert.equal(reopened.activeId, 'copy')
  assert.deepEqual(reopened.drafts.slice(0, 2), [legacy, original])
  assert.equal(reopened.drafts[2].step, 'review')
  assert.deepEqual(evaluateCharacter(reopened.drafts[2].character).sheet, evaluateCharacter(advancedMara).sheet)
  const malformed = (awards: unknown[]) => JSON.stringify({ ...JSON.parse(backup), draft: { ...draft, character: {
    ...advancedMara, advancement: { ...maraAdvancement, awards },
  } } })
  for (const awards of [[-3], [1.5], ['20'], [Number.MAX_SAFE_INTEGER, 1]]) assert.match(readDraftBackup(malformed(awards)).issue ?? '', /invalid/)
  assert.match(readDraftBackup(JSON.stringify({ ...JSON.parse(backup), schemaVersion: 5 })).issue ?? '', /do not match/)
  const unavailable = serializeDraftDownload({ ...original, character: { ...advancedMara, sourcePacks: ['future-pack'] } })
  const rejected = readDraftBackup(unavailable)
  assert.ok(rejected.issue !== undefined)
  assert.deepEqual(rejected.unavailableSources, ['future-pack'])
})

test('the brief reports advancement separately and mechanical links retain the creation build', () => {
  const brief = makeStorytellerBrief(advancedMara)
  assert.match(brief, /### Starting XP\n\n15 XP spent · 0 XP remaining/)
  assert.match(brief, /### Advancement XP\n\n55 XP earned · 53 XP spent · 2 XP remaining/)
  assert.doesNotMatch(brief, /Catwalks/)
  assert.match(makeStorytellerBrief(advancedMara, { custom: true }), /Catwalks/)
  const hash = encodeBuildLink(advancedMara)
  assert.ok(hash)
  assert.equal(hash, encodeBuildLink(maraCharacter))
  const decoded = decodeBuildLink(hash)
  assert.ok(decoded.issue === undefined)
  assert.equal(decoded.draft.advancement, undefined)
})
