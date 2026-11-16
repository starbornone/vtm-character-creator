import assert from 'node:assert/strict'
import { test } from 'node:test'
import { editCharacter, evaluateCharacter, guideSteps, initialCharacterDraft } from '../src/rules/character-guide.ts'
import { maraCharacter, maraClanPath } from './fixtures/mara-vale.ts'

test('choosing Clan and Predator Type first previews a grant that updates as Skills are assigned', () => {
  assert.deepEqual(guideSteps.slice(0, 3).map(step => step.id), ['concept', 'clan', 'traits'])
  const clanFirst = editCharacter(initialCharacterDraft, { type: 'clan-path', update: maraClanPath })
  const brawl = (draft: typeof initialCharacterDraft) => evaluateCharacter(draft).sheet.traitGroups
    .flatMap(group => group.skills).find(skill => skill.name === 'Brawl')
  assert.deepEqual(brawl(clanFirst), { name: 'Brawl', rating: 1, specialties: [] })
  const allocated = editCharacter(clanFirst, { type: 'skill', id: 'brawl', rating: 3 })
  assert.deepEqual(brawl(allocated), { name: 'Brawl', rating: 3, specialties: ['Grappling'] })
  const cleared = editCharacter(allocated, { type: 'skill', id: 'brawl', rating: undefined })
  assert.deepEqual(brawl(cleared), brawl(clanFirst))
})

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

test('open choices target distinct editors and the last correction clears Draft', () => {
  const empty = evaluateCharacter(initialCharacterDraft)
  assert.equal(empty.sheet.draft, true)
  assert.ok(Object.values(empty.pending).every(issues => issues.length > 0))
  assert.equal(empty.sheet.tracks.health, undefined)

  const noTouchstone = editCharacter(maraCharacter, { type: 'relationships', update: { convictions: [{ conviction: 'Keep my word', touchstone: '   ' }] } })
  const changed = editCharacter(noTouchstone, { type: 'concept', update: { ambition: '', desire: '' } })
  const review = evaluateCharacter(changed)
  assert.equal(review.sheet.draft, true)
  assert.deepEqual(review.openChoices.concept.map(issue => issue.target), [
    { step: 'concept', id: 'concept-ambition' },
    { step: 'concept', id: 'concept-desire' },
  ])
  const finalIssue = evaluateCharacter(noTouchstone)
  assert.equal(finalIssue.sheet.draft, true)
  assert.deepEqual(Object.entries(finalIssue.pending).filter(([, issues]) => issues.length > 0).map(([step]) => step), ['relationships'])
  assert.deepEqual(finalIssue.openChoices.relationships.map(issue => issue.target), [{ step: 'relationships', id: 'touchstone-0' }])
  assert.equal(review.sheet.relationships.convictions[0].touchstone, '')
  const resolved = editCharacter(noTouchstone, { type: 'relationships', update: { convictions: maraCharacter.relationships.convictions } })
  assert.equal(evaluateCharacter(resolved).sheet.draft, false)
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
