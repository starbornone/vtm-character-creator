import assert from 'node:assert/strict'
import { test } from 'node:test'
import { skillIds, traitGroups } from '../src/catalog/traits.ts'
import { editTraits, evaluateTraitLedger, initialTraitDraft, type TraitDraft } from '../src/rules/trait-ledger.ts'
import { mara } from './fixtures/mara-vale.ts'

test('Mara Vale fills both distributions and derives her Health and Willpower', () => {
  const ledger = evaluateTraitLedger(mara)

  assert.deepEqual(ledger.attributes.slots.map(slot => slot.used), [1, 3, 4, 1])
  assert.deepEqual(ledger.skills.slots.map(slot => slot.used), [0, 3, 5, 7])
  assert.equal(ledger.attributes.open + ledger.attributes.excess, 0)
  assert.equal(ledger.skills.open + ledger.skills.excess, 0)
  assert.deepEqual(ledger.health, { stamina: 3, total: 6 })
  assert.deepEqual(ledger.willpower, { composure: 2, resolve: 3, total: 5 })
  assert.deepEqual(ledger.specialties.firstDotSlots, [{ skill: 'craft', name: 'Carpentry', active: true }])
  assert.equal(ledger.specialties.freeIssue, undefined)
  assert.equal(ledger.specialties.completed, 2)
  assert.equal(ledger.specialties.total, 2)
})

test('empty draft leaves all slots open and exposes each Core Skill distribution', () => {
  assert.equal(traitGroups.flatMap(group => [...group.attributes]).length, 9)
  assert.equal(new Set(skillIds).size, 27)

  const empty = evaluateTraitLedger(initialTraitDraft)
  assert.equal(empty.attributes.open, 9)
  assert.equal(empty.skills.open, 15)
  assert.equal(empty.specialties.completed, 0)
  assert.equal(empty.health.total, undefined)
  assert.equal(empty.willpower.total, undefined)
  assert.deepEqual(evaluateTraitLedger({ ...initialTraitDraft, distribution: 'jack-of-all-trades' }).skills.slots.map(slot => slot.remaining), [0, 1, 8, 10])
  assert.deepEqual(evaluateTraitLedger({ ...initialTraitDraft, distribution: 'specialist' }).skills.slots.map(slot => slot.remaining), [1, 3, 3, 3])

  const partial = editTraits(initialTraitDraft, { type: 'attribute', id: 'stamina', rating: 2 })
  assert.equal(evaluateTraitLedger(partial).health.total, 5)
  assert.equal(evaluateTraitLedger(partial).willpower.total, undefined)
})

test('changing distribution preserves conflicting picks and suspends their Specialties', () => {
  const switched = editTraits(mara, { type: 'distribution', distribution: 'jack-of-all-trades' })
  const ledger = evaluateTraitLedger(switched)

  assert.deepEqual(switched.skills, mara.skills)
  assert.equal(ledger.skills.open, 6)
  assert.equal(ledger.skills.excess, 2)
  assert.equal(ledger.specialties.eligibleSkills.includes('athletics'), false)
  assert.equal(ledger.specialties.freeIssue, 'overfilled')
  assert.equal(ledger.specialties.completed, 1)
  assert.deepEqual(evaluateTraitLedger(editTraits(switched, { type: 'distribution', distribution: 'balanced' })), evaluateTraitLedger(mara))
})

test('a cleared Skill suspends its free Specialty and reassigning the dot restores it', () => {
  const cleared = editTraits(mara, { type: 'skill', id: 'athletics', rating: undefined })
  assert.deepEqual(cleared.freeSpecialty, mara.freeSpecialty)
  assert.equal(evaluateTraitLedger(cleared).specialties.freeIssue, 'unrated')
  assert.equal(evaluateTraitLedger(editTraits(cleared, { type: 'skill', id: 'athletics', rating: 3 })).specialties.completed, 2)
})

test('first-dot grants remain separate, with Craft exempt from the rating limit', () => {
  const draft: TraitDraft = {
    ...initialTraitDraft,
    skills: { academics: 1, craft: 1, performance: 1, science: 1 },
    firstDotSpecialties: { academics: 'History', craft: 'Carpentry', performance: 'Acting', science: 'Physics' },
    freeSpecialty: { skill: 'craft', name: 'Sewing' },
  }

  assert.equal(evaluateTraitLedger(draft).specialties.completed, 5)
  assert.equal(evaluateTraitLedger(editTraits(draft, { type: 'free-specialty-name', name: ' CARPENTRY ' })).specialties.freeIssue, 'duplicate')
  assert.equal(evaluateTraitLedger(editTraits(draft, { type: 'free-specialty-skill', skill: 'academics' })).specialties.freeIssue, 'limit')

  const cleared = editTraits(draft, { type: 'skill', id: 'craft', rating: undefined })
  assert.equal(evaluateTraitLedger(cleared).specialties.firstDotSlots.some(slot => slot.skill === 'craft'), false)
  assert.equal(evaluateTraitLedger(editTraits(cleared, { type: 'skill', id: 'craft', rating: 1 })).specialties.completed, 5)
})
