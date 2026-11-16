import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRestoredDraft, loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { evaluateThinBlood, type ThinBloodDraft } from '../src/rules/thin-blood.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { irisCharacter } from './fixtures/iris-calder.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { nessaCharacter } from './fixtures/nessa-reed.ts'

const irisChoices = irisCharacter.clanPath.thinBlood!
const irisSheet = evaluateCharacter(irisCharacter).sheet

test('Iris Calder completes Thin-blood creation with the hand-checked sheet', () => {
  const { sheet, path, starting } = evaluateCharacter(irisCharacter)
  assert.ok(path.complete)
  assert.equal(sheet.draft, false)
  assert.deepEqual(starting.profile.generations, [14, 15, 16])
  assert.equal(sheet.identity.generation, 15)
  assert.equal(sheet.identity.ageProfile, 'Fledgling')
  assert.equal(sheet.identity.clan, 'Thin-blood')
  assert.equal(sheet.identity.predator, undefined)
  assert.equal(sheet.bane, 'Violent Temper')
  assert.equal(sheet.compulsion, undefined)
  assert.deepEqual(sheet.tracks, { health: 7, willpower: 5, humanity: 7, bloodPotency: 0, baneSeverity: 1, bloodSurge: 1 })
  assert.deepEqual(sheet.disciplines, [{ name: 'Fortitude', rating: 1, powers: ['Resilience'] }])
  assert.equal(sheet.thinBlood?.cursedClan, 'Brujah')
  assert.deepEqual(sheet.thinBlood?.merits.map(option => option.name), ['Discipline Affinity', 'Thin-blood Alchemist'])
  assert.deepEqual(sheet.thinBlood?.flaws.map(option => option.name), ['Bestial Temper', 'Clan Curse'])
  assert.equal(sheet.thinBlood?.alchemy?.rating, 1)
  assert.equal(sheet.thinBlood?.alchemy?.method.name, 'Fixatio')
  assert.equal(sheet.thinBlood?.alchemy?.formula.name, 'Haze')
  assert.equal(sheet.advantageDots, 7)
  assert.equal(sheet.flawDots, 2)
  assert.equal(sheet.xpSpent, 0)
  assert.equal(sheet.xpRemaining, 0)
  assert.match(makeStorytellerBrief(irisCharacter), /Thin-blood Alchemy 1\*\* · Fixatio · Haze/)
})

test('Thin-bloods need one to three matched picks and honor Core incompatibilities', () => {
  assert.match(evaluateThinBlood().issues.join(' '), /one to three/)
  assert.match(evaluateThinBlood({ merits: ['lifelike'], flaws: ['baby-teeth', 'bestial-temper'] }).issues.join(' '), /same number/)
  assert.match(evaluateThinBlood({
    merits: ['lifelike', 'day-drinker', 'catenating-blood', 'camarilla-contact'],
    flaws: ['baby-teeth', 'branded-by-the-camarilla', 'bestial-temper', 'vitae-dependency'],
  }).issues.join(' '), /one to three/)
  for (const [merit, flaw] of [
    ['lifelike', 'dead-flesh'], ['vampiric-resilience', 'mortal-frailty'], ['anarch-comrades', 'shunned-by-the-anarchs'],
  ] as const) {
    assert.match(evaluateThinBlood({ merits: [merit], flaws: [flaw] }).issues.join(' '), /conflicts/)
  }
  const allowed = evaluateThinBlood({ merits: ['camarilla-contact'], flaws: ['branded-by-the-camarilla'] })
  assert.deepEqual(allowed.issues, [])
})

test('Clan Curse and the two optional paths require their eligible choices', () => {
  const curse: ThinBloodDraft = { merits: ['day-drinker'], flaws: ['clan-curse'] }
  assert.match(evaluateThinBlood(curse).issues.join(' '), /Choose a Core clan Bane/)
  for (const clan of ['brujah', 'gangrel']) {
    assert.match(evaluateThinBlood({ ...curse, curseClan: clan }).issues.join(' '), /Requires Bestial Temper/)
  }
  assert.match(evaluateThinBlood({ ...curse, curseClan: 'tremere' }).issues.join(' '), /Requires Catenating Blood/)
  assert.equal(evaluateThinBlood({ ...curse, merits: ['catenating-blood'], curseClan: 'tremere' }).curse?.id, 'tremere')
  const higher = evaluateThinBlood({ ...irisChoices, formula: 'envelop', affinityPower: 'toughness' })
  assert.equal(higher.alchemy, undefined)
  assert.equal(higher.affinity, undefined)
  assert.match(higher.issues.join(' '), /level-one power/)
  assert.match(higher.issues.join(' '), /level-one formula/)
  const paused = evaluateThinBlood({ ...irisChoices, merits: ['camarilla-contact'], flaws: ['baby-teeth'] })
  assert.equal(paused.alchemy, undefined)
  assert.equal(paused.affinity, undefined)
  assert.equal(paused.curse, undefined)
  const noCurse = evaluateCharacter(editCharacter(irisCharacter, { type: 'clan-path', update: {
    thinBlood: { ...irisChoices, flaws: ['bestial-temper', 'baby-teeth'] },
  } }))
  assert.equal(noCurse.sheet.tracks.baneSeverity, 0)
})

test('unsupported ages, Generation and backgrounds are flagged while old picks stay in the draft', () => {
  for (const age of ['neonate', 'ancilla'] as const) {
    const wrong = evaluateCharacter(editCharacter(irisCharacter, { type: 'age-profile', profile: age }))
    assert.match(wrong.pending.clan[0], /requires the Fledgling/)
    assert.equal(wrong.sheet.draft, true)
    assert.equal(wrong.sheet.tracks.bloodPotency, 0)
    assert.equal(wrong.starting.profile.xp, 0)
  }
  const switched = editCharacter(maraCharacter, { type: 'clan-path', update: { clan: 'thin-blood', thinBlood: irisChoices } })
  const wrong = evaluateCharacter(editCharacter(switched, { type: 'starting', update: {
    advantages: { unbondable: 5 },
    manualOptions: ['Bond Resistance', 'Mawla (Anarchs)', 'Retainers', 'Camarilla Status'].map(name =>
      ({ kind: 'advantage', name, source: 'Core', dots: 1 })),
  } }))
  assert.match(wrong.pending.starting[0], /13th Generation is unavailable for Thin-bloods/)
  assert.equal(wrong.sheet.identity.generation, undefined)
  assert.equal(wrong.path.predator, undefined)
  assert.equal(wrong.path.twoDot, undefined)
  assert.equal(wrong.starting.entries.length, 0)
  assert.equal(wrong.starting.advantageBudget.used, 0)
  assert.ok(wrong.starting.manualOptions.every(option => option.issue?.includes('Mawla')))
  const back = editCharacter(switched, { type: 'clan-path', update: { clan: 'brujah' } })
  assert.deepEqual(evaluateCharacter(back).sheet, evaluateCharacter(maraCharacter).sheet)
  assert.deepEqual(back.clanPath.thinBlood, irisChoices)
})

test('version four backups restore a Thin-blood as a separate draft and keep older drafts', () => {
  const legacy = { id: 'mara', name: 'Mara', step: 'review' as const, character: maraCharacter }
  const caitiff = { id: 'nessa', name: 'Nessa', step: 'review' as const, character: nessaCharacter }
  const prior = { activeId: caitiff.id, drafts: [legacy, caitiff] }
  let raw = JSON.stringify({ schemaVersion: 3, ruleset: 'vtm-v5', ...prior })
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  assert.deepEqual(loadDraftLibrary(storage).library, prior)
  const backup = serializeDraftDownload({ name: 'Iris', step: 'review', character: irisCharacter })
  assert.equal(JSON.parse(backup).schemaVersion, 4)
  assert.ok(readDraftBackup(backup.replace('"schemaVersion": 4', '"schemaVersion": 3')).issue)
  assert.ok(readDraftBackup(backup.replace('"discipline-affinity",', '"not-an-option",')).issue)
  const result = readDraftBackup(backup)
  assert.ok(result.draft, result.issue)
  const restored = appendRestoredDraft(prior, result.draft, 'iris')
  assert.ok(restored.library, restored.issue)
  assert.ok(saveDraftLibrary(storage, restored.library, raw).saved)
  const saved = loadDraftLibrary(storage).library
  assert.deepEqual(saved.drafts.slice(0, 2), [legacy, caitiff])
  assert.equal(saved.activeId, 'iris')
  assert.equal(saved.drafts[2].step, 'review')
  assert.deepEqual(evaluateCharacter(saved.drafts[2].character).sheet, irisSheet)
})

test('Thin-blood build links carry alchemy, Bane and permanent Affinity without narrative text', () => {
  const link = encodeBuildLink(irisCharacter)
  assert.ok(link)
  const json = Buffer.from(link.slice(buildLinkPrefix.length), 'base64url').toString()
  const payload = JSON.parse(json)
  assert.equal(payload.version, 4)
  assert.equal(payload.mechanics.clanPath.clan, 'thin-blood')
  assert.equal(payload.mechanics.clanPath.thinBlood.formula, 'haze')
  assert.ok(!/Iris Calder|Bicycle repair|Avery Chen/.test(json))
  const decoded = decodeBuildLink(link)
  assert.ok('draft' in decoded, decoded.issue)
  const restored = evaluateCharacter(decoded.draft).sheet
  assert.deepEqual(restored.thinBlood, irisSheet.thinBlood)
  assert.deepEqual(restored.disciplines, irisSheet.disciplines)
  assert.deepEqual(restored.tracks, irisSheet.tracks)
  payload.version = 2
  const downgraded = buildLinkPrefix + Buffer.from(JSON.stringify(payload)).toString('base64url')
  assert.ok(decodeBuildLink(downgraded).issue)
})
