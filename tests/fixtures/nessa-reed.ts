import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Core Caitiff fixture in docs/v5-rules.md.
export const nessaCharacter: CharacterDraft = {
  ageProfile: 'neonate',
  concept: {
    name: 'Nessa Reed', concept: 'Night-shift locksmith', chronicle: 'Keys to the Floodgate', embraced: '2006',
    ambition: 'Keep a refuge open to the clanless', desire: 'Find the owner of the brass key',
  },
  traits: {
    attributes: { strength: 2, dexterity: 2, stamina: 3, charisma: 3, manipulation: 2, composure: 2, intelligence: 1, wits: 4, resolve: 3 },
    distribution: 'balanced',
    skills: {
      awareness: 3, stealth: 3, streetwise: 3,
      athletics: 2, insight: 2, larceny: 2, persuasion: 2, subterfuge: 2,
      'animal-ken': 1, brawl: 1, etiquette: 1, investigation: 1, medicine: 1, occult: 1, survival: 1,
    },
    firstDotSpecialties: {},
    freeSpecialty: { skill: 'larceny', name: 'Safecracking' },
  },
  clanPath: {
    clan: 'caitiff', twoDotDiscipline: 'fortitude', oneDotDiscipline: 'presence',
    clanPowers: { fortitude: { 1: 'resilience', 2: 'toughness' }, presence: { 1: 'awe' } },
    predatorType: 'bagger', predatorDiscipline: 'obfuscate', predatorSpecialty: 'streetwise',
    predatorPowers: { obfuscate: 'cloak-of-shadows' },
  },
  starting: {
    generation: 13, advantages: { haven: 2, mask: 2, resources: 3 }, flaws: ['stake-bait'],
    purchases: [
      { kind: 'discipline', id: 'presence', to: 2, power: 'lingering-kiss' },
      { kind: 'skill', id: 'drive', to: 1 },
    ],
  },
  relationships: {
    sire: '', coterie: '', tenets: 'Leave a way out for those in danger.',
    convictions: [{ conviction: 'Keep your doors open to the desperate', touchstone: 'Mae Bell, a living shelter coordinator' }],
  },
}
