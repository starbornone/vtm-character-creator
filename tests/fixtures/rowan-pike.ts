import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Standard-clan fledgling fixture in docs/v5-rules.md.
export const rowanCharacter: CharacterDraft = {
  ageProfile: 'fledgling',
  concept: {
    name: 'Rowan Pike', concept: 'Night courier', chronicle: 'Last Stop at the River', embraced: '2024',
    ambition: 'Keep a safe route through the city', desire: 'Deliver the lost letter before dawn',
  },
  relationships: {
    sire: 'Lena Moss', coterie: '', tenets: 'Protect those who shelter you.',
    convictions: [{ conviction: 'Never abandon a companion', touchstone: 'Taylor Reed, a living courier' }],
  },
  traits: {
    distribution: 'balanced',
    attributes: {
      strength: 2, dexterity: 3, stamina: 3,
      charisma: 2, manipulation: 1, composure: 3,
      intelligence: 2, wits: 4, resolve: 2,
    },
    skills: {
      athletics: 3, awareness: 3, survival: 3,
      'animal-ken': 2, brawl: 2, insight: 2, stealth: 2, streetwise: 2,
      craft: 1, drive: 1, etiquette: 1, investigation: 1, medicine: 1, melee: 1, persuasion: 1,
    },
    firstDotSpecialties: { craft: 'Saddlery' },
    freeSpecialty: { skill: 'survival', name: 'Urban trails' },
  },
  clanPath: {
    clan: 'gangrel', twoDotDiscipline: 'fortitude', oneDotDiscipline: 'protean',
    clanPowers: { fortitude: { 1: 'resilience', 2: 'toughness' }, protean: { 1: 'eyes-of-the-beast' } },
    predatorType: '', predatorDiscipline: '', predatorSpecialty: '', predatorPowers: {},
  },
  starting: {
    generation: 12, advantages: { haven: 2, mask: 2, resources: 3 }, flaws: ['stake-bait'], purchases: [],
  },
}
