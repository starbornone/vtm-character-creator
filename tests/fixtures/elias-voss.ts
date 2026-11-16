import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Mixed Core and Player's Guide fixture in docs/v5-rules.md.
export const eliasCharacter: CharacterDraft = {
  ageProfile: 'neonate',
  sourcePacks: ['players-guide'],
  concept: {
    name: 'Elias Voss', concept: 'Night market broker', chronicle: 'The Closing Bell', embraced: '2001',
    ambition: 'Keep the market in local hands', desire: 'Return a borrowed key before dawn',
  },
  traits: {
    attributes: { strength: 2, dexterity: 3, stamina: 3, charisma: 4, manipulation: 2, composure: 3, intelligence: 1, wits: 2, resolve: 2 },
    distribution: 'balanced',
    skills: {
      larceny: 3, persuasion: 3, stealth: 3,
      awareness: 2, insight: 2, intimidation: 2, streetwise: 2, subterfuge: 2,
      athletics: 1, brawl: 1, drive: 1, etiquette: 1, investigation: 1, medicine: 1, occult: 1,
    },
    firstDotSpecialties: {},
    freeSpecialty: { skill: 'persuasion', name: 'Negotiation' },
  },
  clanPath: {
    clan: 'ministry', twoDotDiscipline: 'obfuscate', oneDotDiscipline: 'presence',
    clanPowers: { obfuscate: { 1: 'cloak-of-shadows', 2: 'chimerstry' }, presence: { 1: 'awe' } },
    predatorType: 'extortionist', predatorDiscipline: 'potence', predatorSpecialty: 'larceny',
    predatorPowers: { potence: 'lethal-body' },
    predatorChoices: { 'extortionist-backgrounds': { contacts: 2, resources: 1 }, 'extortionist-enemy': { 'escaped-victim': 2 } },
  },
  starting: {
    generation: 13, advantages: { haven: 2, mask: 2, resources: 3 }, flaws: ['stake-bait'],
    purchases: [{ kind: 'discipline', id: 'obfuscate', to: 3, power: 'mask-of-a-thousand-faces' }],
  },
  relationships: {
    sire: '', coterie: '', tenets: 'Keep bargains made in good faith.',
    convictions: [{ conviction: 'Keep the market open to outsiders', touchstone: 'Tess Lark, a living stallholder' }],
  },
}
