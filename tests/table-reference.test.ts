import assert from 'node:assert/strict'
import test from 'node:test'
import { allDisciplinePowers, disciplineIds, disciplines } from '../src/catalog/clan-path.ts'
import { powerSource } from '../src/catalog/source-packs.ts'
import { searchTableReference } from '../src/rules/table-reference.ts'

test('the reference has cited entries for all four roadmap topics', () => {
  const entries = searchTableReference('')
  const ids = entries.map(entry => entry.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ['age-profiles', 'attributes', 'skills', 'xp-costs', 'discipline-powers', 'health', 'willpower', 'humanity', 'blood-potency']) {
    assert.ok(ids.includes(id), id)
  }
  assert.ok(entries.every(entry => /^(Core|Player’s Guide) pp?\. \d/.test(entry.source)))
  assert.deepEqual(searchTableReference('  '), entries)
  assert.deepEqual(searchTableReference('unlisted rule nowhere'), [])
})

test('search matches across titles, details, aliases, and printed pages', () => {
  assert.deepEqual(searchTableReference('137 EXPERIENCE points').map(entry => entry.id), ['xp-costs'])
  assert.deepEqual(searchTableReference('RÉSILIENCE stamina').map(entry => entry.id), ['health'])
  assert.deepEqual(searchTableReference('composure willpower').map(entry => entry.id), ['willpower'])
  assert.deepEqual(searchTableReference("presence 76 player's guide").map(entry => entry.id), ['chimerstry'])
  assert.deepEqual(searchTableReference('spark-of-rage').map(entry => entry.id), ['spark-of-rage'])
  assert.ok(searchTableReference('thin blood ancilla').some(entry => entry.id === 'age-profiles'))
})

test('every supported Amalgam and named prerequisite comes from its catalog entry', () => {
  const entries = new Map(searchTableReference('').map(entry => [entry.id, entry]))
  for (const id of disciplineIds) for (const power of allDisciplinePowers[id]) {
    if (!power.amalgam && !power.prerequisite) continue
    const entry = entries.get(power.id)
    assert.ok(entry, power.name)
    assert.equal(entry.source, powerSource(power))
    const details = Object.fromEntries((entry.details ?? []).map(({ label, value }) => [label, value]))
    assert.equal(details['Minimum rating'], `${disciplines[id]} ${power.level}`)
    if (power.amalgam) assert.equal(details.Amalgam, `${disciplines[power.amalgam.discipline]} ${power.amalgam.dots}`)
    if (power.prerequisite) assert.equal(details['Required power'], power.prerequisite.name)
  }
})
