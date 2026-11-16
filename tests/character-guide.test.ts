import assert from 'node:assert/strict'
import { test } from 'node:test'
import { editCharacter, evaluateCharacter, initialCharacterDraft } from '../src/rules/character-guide.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

test('Mara’s reviewed sheet combines her story, starting choices, and final mechanics', () => {
  const { sheet, pending } = evaluateCharacter(maraCharacter)
  assert.equal(sheet.draft, false)
  assert.ok(Object.values(pending).every(issues => issues.length === 0))
  assert.equal(sheet.identity.name, 'Mara Vale')
  assert.equal(sheet.identity.chronicle, 'Last Call at the Lyric')
  assert.equal(sheet.identity.generation, 13)
  assert.equal(sheet.relationships.sire, 'Inez Varga')
  assert.deepEqual(sheet.relationships.convictions, [{ conviction: 'Keep my word', touchstone: 'Jo Reyes, the living stage manager' }])
  assert.deepEqual(sheet.tracks, { health: 6, willpower: 5, humanity: 6, bloodPotency: 1, baneSeverity: 2, bloodSurge: 2 })
  assert.deepEqual(sheet.disciplines, [
    { name: 'Potence', rating: 2, powers: ['Lethal Body', 'Prowess'] },
    { name: 'Presence', rating: 2, powers: ['Awe', 'Daunt'] },
  ])
  assert.equal(sheet.advantageDots, 10)
  assert.equal(sheet.flawDots, 2)
  assert.deepEqual(sheet.advantages.find(entry => entry.source === 'Alleycat'), { name: 'Criminal Contacts', dots: 3, source: 'Alleycat' })
  assert.equal(sheet.xpRemaining, 0)
  assert.deepEqual(sheet.purchases.map(entry => entry.cost), [3, 6, 6])
  const physical = sheet.traitGroups.find(group => group.name === 'Physical')
  assert.equal(physical?.skills.find(skill => skill.name === 'Stealth')?.rating, 2)
  assert.equal(physical?.skills.find(skill => skill.name === 'Drive')?.rating, 2)
  assert.deepEqual(physical?.skills.find(skill => skill.name === 'Brawl')?.specialties, ['Grappling'])
})

test('incomplete choices route back to their steps and mark the sheet Draft', () => {
  const empty = evaluateCharacter(initialCharacterDraft)
  assert.equal(empty.sheet.draft, true)
  assert.ok(Object.values(empty.pending).every(issues => issues.length > 0))
  assert.equal(empty.sheet.tracks.health, undefined)

  const changed = editCharacter(maraCharacter, { type: 'relationships', update: { convictions: [{ conviction: 'Keep my word', touchstone: '   ' }] } })
  const review = evaluateCharacter(changed)
  assert.equal(review.sheet.draft, true)
  assert.deepEqual(Object.entries(review.pending).filter(([, issues]) => issues.length > 0).map(([step]) => step), ['relationships'])
  assert.equal(review.sheet.relationships.convictions[0].touchstone, '')
  assert.equal(evaluateCharacter(maraCharacter).sheet.draft, false)
})

test('the sheet excludes inactive picks and invalid journal entries', () => {
  const traits = { ...maraCharacter.traits, distribution: 'jack-of-all-trades' as const }
  const [first, second, third] = maraCharacter.starting.purchases
  const review = evaluateCharacter({ ...maraCharacter, traits, starting: { ...maraCharacter.starting, purchases: [second, first, third] } })
  assert.equal(review.sheet.draft, true)
  assert.ok(review.pending.traits.length)
  assert.ok(review.pending.starting.length)
  const skills = review.sheet.traitGroups.flatMap(group => group.skills)
  assert.equal(skills.find(skill => skill.name === 'Athletics')?.rating, undefined)
  assert.deepEqual(skills.find(skill => skill.name === 'Athletics')?.specialties, [])
  assert.deepEqual(review.sheet.purchases.map(entry => entry.label), ['Stealth 1', 'Drive 2'])
  assert.equal(review.sheet.xpRemaining, 6)
})
