import assert from 'node:assert/strict'
import test from 'node:test'
import { initialCharacterDraft, type CharacterDraft } from '../src/rules/character-guide.ts'
import { makeStorytellerBrief } from '../src/sharing/storyteller-brief.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

test('the default brief keeps evaluated mechanics and omits authored text', () => {
  const brief = makeStorytellerBrief(maraCharacter)
  for (const token of [
    'Fifth Edition', '**Clan:** Brujah', '**Predator Type:** Alleycat', '**Generation:** 13th',
    '**Health:** 6', 'Brawl 3 (Grappling)', '**Potence 2** · Lethal Body, Prowess', 'Criminal Contacts · 3 dots · Alleycat',
    '15 XP spent · 0 XP remaining', 'Stealth 2 · 6 XP', '## Open Rulings\n\nNone outstanding.',
  ]) assert.ok(brief.includes(token), token)
  for (const text of [
    ...Object.values(maraCharacter.concept), maraCharacter.relationships.sire, maraCharacter.relationships.tenets,
    maraCharacter.relationships.convictions[0].conviction, maraCharacter.relationships.convictions[0].touchstone, 'Carpentry', 'Climbing',
  ]) assert.ok(!brief.includes(text), text)
  assert.ok(brief.endsWith('\n'))
})

test('each narrative section is included only when selected', () => {
  const identityOnly = makeStorytellerBrief(maraCharacter, { identity: true })
  assert.match(identityOnly, /## Character Identity[\s\S]+Mara Vale[\s\S]+Last Call at the Lyric/)
  assert.doesNotMatch(identityOnly, /Ambition & Desire|Jo Reyes|Inez Varga|Carpentry/)
  const storyOnly = makeStorytellerBrief(maraCharacter, { motivations: true, convictions: true, relationships: true })
  for (const token of ['Secure a permanent home', 'Find the missing stagehand', 'Keep my word', 'Jo Reyes', 'Inez Varga', 'Protect people who depend on you.']) {
    assert.ok(storyOnly.includes(token), token)
  }
  assert.doesNotMatch(storyOnly, /Mara Vale|Last Call at the Lyric|Carpentry|Climbing/)
})

test('manual mechanics retain their dots and ruling flags while custom names and notes are opt-in', () => {
  const draft: CharacterDraft = {
    ...maraCharacter,
    clanPath: {
      ...maraCharacter.clanPath, clan: 'manual', predatorType: 'manual', predatorSpecialtyName: 'Private bout',
      manualClan: { name: 'Private clan', source: 'Private clan notes', disciplines: ['celerity', 'potence', 'presence'], bane: 'Private bane', compulsion: 'Private compulsion' },
      manualPredator: { name: 'Private feeding style', source: 'Private feeding notes', advantage: { name: 'Private contacts', dots: 2 }, flaw: { name: 'Private ally debt', dots: 1 } },
    },
    starting: {
      ...maraCharacter.starting,
      advantages: { ...maraCharacter.starting.advantages, beautiful: 0 },
      manualOptions: [{ kind: 'advantage', name: 'Private merit', source: 'Private merit notes', dots: 2 }],
      purchases: [
        { kind: 'specialty', id: 'brawl', name: 'Private XP Specialty' },
        { kind: 'skill', id: 'science', to: 1, specialty: 'Private scientific field' },
      ],
    },
  }
  const brief = makeStorytellerBrief(draft)
  assert.doesNotMatch(brief, /Private|Carpentry|Climbing/)
  assert.match(brief, /9 Advantage dots · 3 Flaw dots/)
  assert.match(brief, /Manual Flaw · 1 dot · Manual Predator Type/)
  assert.match(brief, /6 XP spent · 9 XP remaining/)
  assert.match(brief, /Review the manual clan with the Storyteller/)
  assert.match(brief, /Review a manual advantage with the Storyteller/)
  const detailed = makeStorytellerBrief(draft, { custom: true })
  for (const token of ['Private clan notes', 'Private bane', 'Private compulsion', 'Private feeding notes', 'Private contacts', 'Private ally debt', 'Private merit notes', 'Private XP Specialty', 'Private scientific field']) {
    assert.ok(detailed.includes(token), token)
  }
  assert.doesNotMatch(detailed, /Mara Vale|Jo Reyes/)
})

test('an unfinished brief reports mechanical choices and rejected XP separately from totals', () => {
  const draft: CharacterDraft = {
    ...initialCharacterDraft,
    starting: {
      ...initialCharacterDraft.starting, purchases: [{ kind: 'specialty', id: 'brawl', name: 'Private XP Specialty' }],
    },
  }
  const brief = makeStorytellerBrief(draft)
  assert.match(brief, /\*\*Health:\*\* Unassigned/)
  assert.match(brief, /0 XP spent · 15 XP remaining/)
  assert.match(brief, /## Open Rulings[\s\S]+Choose a clan\./)
  assert.match(brief, /\*\*XP purchase:\*\* Brawl Specialty · This Skill needs at least one dot\./)
  assert.doesNotMatch(brief, /Private XP Specialty|fill in character name/i)
})

test('opt-in text is escaped before becoming Markdown', () => {
  const draft = {
    ...maraCharacter, concept: {
      ...maraCharacter.concept, name: '[Name](https://example.test)', concept: 'First line\n## Embedded <img>',
    },
  }
  const brief = makeStorytellerBrief(draft, { identity: true })
  assert.doesNotMatch(brief, /\[Name\]\(https:|\n## Embedded| <img>/)
  assert.ok(brief.includes('First line ## Embedded \\<img\\>'))
})
