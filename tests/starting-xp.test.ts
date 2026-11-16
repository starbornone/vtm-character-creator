import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluateClanPath } from '../src/rules/clan-path.ts'
import { evaluateStartingBuild, initialStartingDraft, type StartingDraft } from '../src/rules/starting-xp.ts'
import { deriveTracks, evaluateTraitLedger } from '../src/rules/trait-ledger.ts'
import { mara, maraClanPath, maraStarting } from './fixtures/mara-vale.ts'

function evaluate(draft: StartingDraft, clan = maraClanPath, traits = mara) {
  const path = evaluateClanPath(clan)
  return evaluateStartingBuild(draft, traits, evaluateTraitLedger(traits, path.grantedSpecialty), path)
}

test('Mara reaches the hand-checked budgets, tracks, and purchase totals', () => {
  const build = evaluate(maraStarting)
  assert.deepEqual(build.advantageBudget, { used: 7, limit: 7, remaining: 0 })
  assert.deepEqual(build.flawBudget, { used: 2, limit: 2, remaining: 0 })
  assert.equal(build.predatorAdvantage, 3)
  assert.equal(build.totalAdvantageDots, 10)
  assert.equal(build.generation, 13)
  assert.equal(build.humanity, 6)
  assert.equal(build.bloodPotency, 1)
  assert.equal(build.baneSeverity, 2)
  assert.equal(build.bloodSurge, 2)
  assert.deepEqual(build.entries.map(({ cost, remaining }) => [cost, remaining]), [[3, 12], [6, 6], [6, 0]])
  assert.equal(build.final.skills.stealth, 2)
  assert.equal(build.final.skills.drive, 2)
  assert.equal(mara.skills.stealth, undefined)
  assert.equal(deriveTracks(build.final.attributes).health.total, 6)
  assert.equal(deriveTracks(build.final.attributes).willpower.total, 5)
})

test('out-of-order and unaffordable purchases keep their place without spending XP', () => {
  const [one, two, drive] = maraStarting.purchases
  const build = evaluate({ ...maraStarting, purchases: [two, one, drive, { kind: 'blood-potency', to: 2 }, { kind: 'skill', id: 'drive', to: 3 }] })
  assert.deepEqual(build.entries.map(entry => entry.remaining), [15, 12, 6, 6, 6])
  assert.match(build.entries[0].issue ?? '', /one dot at a time/)
  assert.equal(build.entries[3].cost, 20)
  assert.match(build.entries[3].issue ?? '', /Not enough/)
  assert.match(build.entries[4].issue ?? '', /Not enough/)
  assert.equal(build.final.skills.stealth, 1)
  assert.equal(build.final.skills.drive, 2)
  assert.equal(build.bloodPotency, 1)
})

test('conflicting Flaws and Unbondable remain recorded and use no base budget', () => {
  const lingeringKiss = { ...maraClanPath, clanPowers: { ...maraClanPath.clanPowers, presence: { 1: 'awe', 2: 'lingering-kiss' } } }
  const build = evaluate({ ...initialStartingDraft, advantages: { haven: 1, unbondable: 5 }, flaws: ['no-haven', 'stake-bait'] }, lingeringKiss)
  assert.match(build.advantages.find(option => option.id === 'unbondable')?.issue ?? '', /Lingering Kiss/)
  assert.match(build.flaws.find(option => option.id === 'no-haven')?.issue ?? '', /conflicts/i)
  assert.equal(build.advantageBudget.used, 1)
  assert.equal(build.flawBudget.used, 2)

  const updated = evaluate({ ...initialStartingDraft, flaws: ['no-haven'], purchases: [{ kind: 'advantage', id: 'haven', to: 1 }] })
  assert.match(updated.entries[0].issue ?? '', /selected Flaw/)
  assert.equal(updated.final.remaining, 15)
})

test('XP Attribute and Advantage dots stay separate from base budgets', () => {
  const build = evaluate({ ...maraStarting, purchases: [{ kind: 'attribute', id: 'composure', to: 3 }, { kind: 'advantage', id: 'haven', to: 2 }] })
  assert.equal(deriveTracks(build.final.attributes).willpower.total, 6)
  assert.equal(build.entries[0].cost, 15)
  assert.match(build.entries[1].issue ?? '', /Not enough/)
  const advantage = evaluate({ ...maraStarting, purchases: [{ kind: 'advantage', id: 'haven', to: 2 }] })
  assert.equal(advantage.advantageBudget.used, 7)
  assert.equal(advantage.totalAdvantageDots, 11)
  assert.equal(advantage.final.remaining, 12)
})

test('the XP replay respects Predator Skill dots, Specialty limits, and Discipline powers', () => {
  const traits = { ...mara, skills: { ...mara.skills, brawl: undefined } }
  const build = evaluate({ ...initialStartingDraft, purchases: [
    { kind: 'skill', id: 'brawl', to: 2 },
    { kind: 'skill', id: 'science', to: 1, specialty: 'Physics' },
    { kind: 'specialty', id: 'science', name: 'Chemistry' },
    { kind: 'discipline', id: 'celerity', to: 1, power: 'cats-grace' },
  ] }, maraClanPath, traits)
  assert.equal(build.final.skills.brawl, 2)
  assert.deepEqual(build.final.specialties.science, ['Physics'])
  assert.match(build.entries[2].issue ?? '', /limit/)
  assert.equal(build.final.disciplines.celerity, 1)
  assert.equal(build.final.remaining, 1)

  const unbondable = evaluate({ ...initialStartingDraft, advantages: { unbondable: 5 }, purchases: [{ kind: 'discipline', id: 'presence', to: 3, power: 'lingering-kiss' }] })
  assert.match(unbondable.entries[0].issue ?? '', /Unbondable/)
  assert.equal(unbondable.final.remaining, 15)

  const presence = evaluate({ ...initialStartingDraft, purchases: [{ kind: 'discipline', id: 'presence', to: 3, power: 'dread-gaze' }] })
  assert.equal(presence.final.disciplines.presence, 3)
  assert.equal(presence.final.remaining, 0)
})

test('XP stays pending when a Skill allocation becomes overfilled', () => {
  const draft: StartingDraft = { ...initialStartingDraft, purchases: [{ kind: 'skill', id: 'athletics', to: 1 }] }
  const build = evaluate(draft, maraClanPath, { ...mara, distribution: 'jack-of-all-trades' })
  assert.match(build.entries[0].issue ?? '', /Resolve this Skill/)
  assert.equal(build.final.remaining, 15)
})
