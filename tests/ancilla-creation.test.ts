import assert from 'node:assert/strict'
import test from 'node:test'
import { loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { quotePurchase } from '../src/rules/starting-xp.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { silasCharacter } from './fixtures/silas-ward.ts'

const completeSilas = evaluateCharacter(silasCharacter)

test('Silas Ward reaches the hand-checked ancilla sheet and starting budgets', () => {
  const { sheet, starting } = completeSilas
  assert.equal(sheet.draft, false)
  assert.equal(sheet.identity.ageProfile, 'Ancilla')
  assert.equal(sheet.identity.generation, 11)
  assert.equal(sheet.identity.predator, 'Sandman')
  assert.deepEqual(sheet.tracks, { health: 5, willpower: 5, humanity: 6, bloodPotency: 2, baneSeverity: 2, bloodSurge: 2 })
  assert.equal(starting.final.maxBloodPotency, 4)
  assert.deepEqual(starting.advantageBudget, { used: 9, limit: 9, remaining: 0 })
  assert.deepEqual(starting.flawBudget, { used: 4, limit: 4, remaining: 0 })
  assert.equal(sheet.advantageDots, 10)
  assert.equal(sheet.flawDots, 4)
  assert.deepEqual(sheet.disciplines, [
    { name: 'Auspex', rating: 4, powers: ['Heightened Senses', 'Premonition', 'Scry the Soul', 'Spirit’s Touch'] },
    { name: 'Celerity', rating: 2, powers: ['Cat’s Grace', 'Fleetness'] },
  ])
  assert.deepEqual(starting.entries.map(({ cost, remaining, issue }) => [cost, remaining, issue]), [[15, 20, undefined], [20, 0, undefined]])
  assert.equal(sheet.xpSpent, 35)
  assert.equal(sheet.xpRemaining, 0)
  assert.match(makeStorytellerBrief(silasCharacter), /\*\*Age profile:\*\* Ancilla/)
  assert.equal(evaluateCharacter({ ...silasCharacter, starting: { ...silasCharacter.starting, generation: 10 } }).sheet.identity.generation, 10)
})

test('ancilla journal order controls rank-four powers and replays when restored', () => {
  const purchases = [...silasCharacter.starting.purchases].reverse()
  const reordered = editCharacter(silasCharacter, { type: 'starting', update: { purchases } })
  const { starting, sheet, pending } = evaluateCharacter(reordered)
  assert.match(starting.entries[0].issue ?? '', /one dot at a time/)
  assert.equal(starting.entries[1].remaining, 20)
  assert.equal(sheet.xpSpent, 15)
  assert.equal(starting.final.disciplines.auspex, 3)
  assert.ok(!starting.final.powers.includes('spirits-touch'))
  assert.ok(pending.starting.includes('Resolve ineligible XP purchases.'))
  assert.deepEqual(evaluateCharacter(editCharacter(reordered, {
    type: 'starting', update: { purchases: purchases.reverse() },
  })).sheet, completeSilas.sheet)
})

test('ancilla blood and Humanity stack with Predator effects and constrain Farmer', () => {
  const starting = { ...silasCharacter.starting, purchases: [] }
  const bloodLeech = evaluateCharacter({
    ...silasCharacter, starting,
    clanPath: { ...silasCharacter.clanPath, predatorType: 'blood-leech' },
  })
  assert.deepEqual(bloodLeech.path.humanity, { base: 6, adjustment: -1, total: 5 })
  assert.equal(bloodLeech.starting.bloodPotency, 3)
  assert.deepEqual(quotePurchase(bloodLeech.starting.final, { kind: 'blood-potency', to: 4 }), {
    cost: 40, issue: 'Not enough starting XP.',
  })
  const purchase = { kind: 'blood-potency', to: 3 } as const
  const potentiated = evaluateCharacter({ ...silasCharacter, starting: { ...starting, purchases: [purchase] } })
  assert.equal(potentiated.starting.bloodPotency, 3)
  assert.equal(potentiated.starting.baneSeverity, 3)
  assert.equal(potentiated.sheet.xpRemaining, 5)
  const farmer = evaluateCharacter({
    ...silasCharacter, starting: { ...starting, purchases: [purchase] },
    clanPath: { ...silasCharacter.clanPath, predatorType: 'farmer' },
  })
  assert.equal(farmer.path.predator?.id, 'farmer')
  assert.equal(farmer.starting.humanity, 7)
  assert.equal(farmer.starting.bloodPotency, 2)
  assert.equal(farmer.starting.final.remaining, 35)
  assert.match(farmer.starting.entries[0].issue ?? '', /Farmer requires Blood Potency below 3/)
})

test('rank-four power prerequisites are checked against earlier journal entries', () => {
  const gangrel: typeof silasCharacter = { ...silasCharacter,
    clanPath: { ...silasCharacter.clanPath, clan: 'gangrel', twoDotDiscipline: 'protean', oneDotDiscipline: 'fortitude',
      clanPowers: { protean: { 1: 'eyes-of-the-beast', 2: 'feral-weapons' }, fortitude: { 1: 'resilience' } },
    },
    starting: { ...silasCharacter.starting, purchases: [
      { kind: 'discipline', id: 'protean', to: 3, power: 'earth-meld' },
      { kind: 'discipline', id: 'protean', to: 4, power: 'metamorphosis' },
    ] },
  }
  const invalid = evaluateCharacter(gangrel)
  assert.match(invalid.starting.entries[1].issue ?? '', /Requires Shapechange/)
  assert.equal(invalid.starting.final.disciplines.protean, 3)
  const valid = editCharacter(gangrel, { type: 'starting', update: {
    purchases: [{ kind: 'discipline', id: 'protean', to: 3, power: 'shapechange' }, gangrel.starting.purchases[1]],
  } })
  assert.equal(evaluateCharacter(valid).starting.final.disciplines.protean, 4)
})

test('switching profile revalidates Generation, budgets and XP while full drafts keep the selections', () => {
  const asNeonate = editCharacter(silasCharacter, { type: 'age-profile', profile: 'neonate' })
  const younger = evaluateCharacter(asNeonate)
  assert.equal(younger.starting.generation, undefined)
  assert.match(younger.pending.starting[0], /11th Generation is unavailable for Neonate/)
  assert.equal(younger.starting.advantageBudget.remaining, -2)
  assert.equal(younger.starting.flawBudget.remaining, -2)
  assert.equal(younger.starting.final.disciplines.auspex, 3)
  assert.match(younger.starting.entries[1].issue ?? '', /Not enough starting XP/)
  const asFledgling = editCharacter(asNeonate, { type: 'age-profile', profile: 'fledgling' })
  assert.equal(evaluateCharacter(asFledgling).sheet.identity.predator, undefined)
  assert.deepEqual(evaluateCharacter(asFledgling).starting.entries, [])
  assert.equal(asFledgling.starting, silasCharacter.starting)
  assert.deepEqual(evaluateCharacter(editCharacter(asFledgling, { type: 'age-profile', profile: 'ancilla' })).sheet, completeSilas.sheet)
  const mara = evaluateCharacter(editCharacter(maraCharacter, { type: 'age-profile', profile: 'ancilla' }))
  assert.match(mara.pending.starting[0], /13th Generation is unavailable for Ancilla/)
  assert.equal(mara.starting.advantageBudget.remaining, 2)
  assert.equal(mara.starting.flawBudget.remaining, 2)
  assert.equal(mara.sheet.tracks.humanity, 5)
  assert.equal(mara.sheet.xpRemaining, 20)

  const draft = { id: 'silas', name: 'Silas as neonate', step: 'review' as const, character: asNeonate }
  const backup = serializeDraftDownload(draft)
  assert.equal(JSON.parse(backup).schemaVersion, 2)
  assert.deepEqual(readDraftBackup(serializeDraftDownload({ ...draft, character: silasCharacter })).draft?.character, silasCharacter)
  assert.deepEqual(readDraftBackup(backup).draft?.character, asNeonate)
  assert.ok(readDraftBackup(backup.replace('"schemaVersion": 2', '"schemaVersion": 1')).issue)
  let raw: string | null = null
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  assert.ok(saveDraftLibrary(storage, { activeId: draft.id, drafts: [draft] }, raw).saved)
  const resumed = loadDraftLibrary(storage).library.drafts[0]
  assert.equal(resumed.step, 'review')
  assert.deepEqual(evaluateCharacter(editCharacter(resumed.character, { type: 'age-profile', profile: 'ancilla' })).sheet, completeSilas.sheet)
})

test('ancilla links round-trip rank-four mechanics and leave a paused Generation out', () => {
  const hash = encodeBuildLink(silasCharacter)
  assert.ok(hash)
  const payload = JSON.parse(Buffer.from(hash.slice(buildLinkPrefix.length), 'base64url').toString())
  assert.equal(payload.version, 2)
  assert.equal(payload.mechanics.ageProfile, 'ancilla')
  assert.equal(payload.mechanics.starting.generation, 11)
  assert.ok(!JSON.stringify(payload).includes('Silas Ward'))
  const result = decodeBuildLink(hash)
  assert.ok('draft' in result, result.issue)
  assert.equal(evaluateCharacter(result.draft).starting.final.disciplines.auspex, 4)
  assert.equal(evaluateCharacter(result.draft).sheet.xpRemaining, 0)
  const switched = editCharacter(silasCharacter, { type: 'age-profile', profile: 'neonate' })
  const neonateHash = encodeBuildLink(switched)
  assert.ok(neonateHash)
  const reopened = decodeBuildLink(neonateHash)
  assert.ok('draft' in reopened, reopened.issue)
  assert.equal(reopened.draft.starting.generation, undefined)
  assert.deepEqual(reopened.draft.starting.purchases, [silasCharacter.starting.purchases[0]])
})
