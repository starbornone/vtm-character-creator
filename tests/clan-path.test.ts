import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluateClanPath, initialClanPath } from '../src/rules/clan-path.ts'
import { evaluateTraitLedger, initialTraitDraft } from '../src/rules/trait-ledger.ts'
import { mara, maraClanPath } from './fixtures/mara-vale.ts'

test('Mara completes the Brujah and Alleycat choices with their source-specific grants', () => {
  const path = evaluateClanPath(maraClanPath)
  assert.equal(path.complete, true)
  assert.equal(path.clan?.bane, 'Violent Temper')
  assert.equal(path.clan?.compulsion, 'Rebellion')
  assert.deepEqual(path.ledger, [
    { discipline: 'celerity', clanDots: 0, predatorDots: 0, total: 0 },
    { discipline: 'potence', clanDots: 1, predatorDots: 1, total: 2 },
    { discipline: 'presence', clanDots: 2, predatorDots: 0, total: 2 },
  ])
  assert.deepEqual(path.clanSlots.map(slot => slot.selectedPower?.id), ['lethal-body', 'awe', 'daunt'])
  assert.equal(path.predatorSlot?.selectedPower?.id, 'prowess')
  assert.deepEqual(path.humanity, { base: 7, adjustment: -1, total: 6 })
  assert.deepEqual(path.advantages, [{ name: 'Criminal Contacts', dots: 3 }])
  const traits = evaluateTraitLedger(mara, path.grantedSpecialty)
  assert.deepEqual(traits.specialties.predatorGrant, { skill: 'brawl', name: 'Grappling', kind: 'specialty' })
  assert.equal(traits.skills.open, 0)
  assert.equal(traits.specialties.completed, 2)
})

test('clearing clan or Predator Type suspends its grants without discarding choices', () => {
  assert.equal(evaluateClanPath(initialClanPath).complete, false)
  const noClan = evaluateClanPath({ ...maraClanPath, clan: '' })
  assert.equal(noClan.predator, undefined)
  assert.equal(noClan.predatorSlot, undefined)
  assert.deepEqual(noClan.ledger, [])
  const noPredator = evaluateClanPath({ ...maraClanPath, predatorType: '' })
  assert.equal(noPredator.predatorSlot, undefined)
  assert.equal(noPredator.grantedSpecialty, undefined)
  assert.equal(noPredator.humanity.total, 7)
  assert.equal(evaluateClanPath(maraClanPath).predatorSlot?.selectedPower?.id, 'prowess')
})

test('base allocation changes revalidate the saved Predator power at its new rank', () => {
  const path = evaluateClanPath({ ...maraClanPath, oneDotDiscipline: 'celerity' })
  assert.equal(path.predatorSlot?.rank, 1)
  assert.equal(path.predatorSlot?.selectedId, 'prowess')
  assert.equal(path.predatorSlot?.issue, 'level')
  assert.equal(path.predatorSlot?.selectedPower, undefined)
  assert.equal(path.complete, false)

  const duplicateDiscipline = evaluateClanPath({ ...maraClanPath, oneDotDiscipline: 'presence' })
  assert.equal(duplicateDiscipline.oneDot, undefined)
  assert.equal(duplicateDiscipline.predatorSlot, undefined)
})

test('power slots exclude repeated powers and enforce Amalgam ratings', () => {
  const path = evaluateClanPath({
    ...maraClanPath,
    twoDotDiscipline: 'potence', oneDotDiscipline: 'presence',
    clanPowers: { potence: { 1: 'lethal-body', 2: 'lethal-body' }, presence: { 1: 'awe' } },
    predatorPowers: { potence: 'spark-of-rage' },
  })
  assert.equal(path.clanSlots.find(slot => slot.rank === 2)?.issue, 'duplicate')
  assert.equal(path.predatorSlot?.rank, 3)
  assert.equal(path.predatorSlot?.issue, 'amalgam')
  assert.equal(path.predatorSlot?.options.find(power => power.id === 'uncanny-grip')?.issue, undefined)
  assert.equal(path.complete, false)

  const celerity = evaluateClanPath({ ...maraClanPath, predatorDiscipline: 'celerity', predatorPowers: { celerity: 'rapid-reflexes' } })
  assert.equal(celerity.predatorSlot?.rank, 1)
  assert.equal(celerity.predatorSlot?.selectedPower?.id, 'rapid-reflexes')
  assert.equal(celerity.complete, true)
})

test('an unrated Skill receives a separate dot and a rated Skill receives the chosen Specialty', () => {
  const path = evaluateClanPath({ ...maraClanPath, predatorSpecialty: 'intimidation' })
  const unrated = evaluateTraitLedger(initialTraitDraft, path.grantedSpecialty)
  assert.deepEqual(unrated.specialties.predatorGrant, { skill: 'intimidation', name: 'Stickups', kind: 'skill-dot' })
  assert.equal(unrated.skills.open, 15)
  assert.equal(unrated.specialties.eligibleSkills.includes('intimidation'), false)

  const rated = evaluateTraitLedger({
    ...initialTraitDraft,
    skills: { intimidation: 1 },
    freeSpecialty: { skill: 'intimidation', name: 'Interrogation' },
  }, path.grantedSpecialty)
  assert.equal(rated.specialties.predatorGrant?.kind, 'specialty')
  assert.equal(rated.specialties.freeIssue, 'limit')
  const repeated = evaluateTraitLedger({ ...mara, freeSpecialty: { skill: 'intimidation', name: ' STICKUPS ' } }, path.grantedSpecialty)
  assert.equal(repeated.specialties.freeIssue, 'duplicate')
})
