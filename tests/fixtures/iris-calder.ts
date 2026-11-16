import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Core Thin-blood fixture in docs/v5-rules.md.
export const irisCharacter: CharacterDraft = {
  ageProfile: 'fledgling',
  concept: {
    name: 'Iris Calder', concept: 'Night bicycle mechanic', chronicle: 'The Last Ferry', embraced: '2025',
    ambition: 'Keep a safe workshop for the duskborn', desire: 'Find the missing courier before sunrise',
  },
  traits: {
    attributes: { strength: 2, dexterity: 4, stamina: 3, charisma: 2, manipulation: 1, composure: 3, intelligence: 3, wits: 2, resolve: 2 },
    distribution: 'balanced',
    skills: {
      craft: 3, drive: 3, streetwise: 3,
      awareness: 2, brawl: 2, investigation: 2, science: 2, stealth: 2,
      athletics: 1, insight: 1, larceny: 1, medicine: 1, persuasion: 1, survival: 1, technology: 1,
    },
    firstDotSpecialties: { craft: 'Bicycle repair', science: 'Materials' },
    freeSpecialty: { skill: 'stealth', name: 'Back lanes' },
  },
  clanPath: {
    clan: 'thin-blood', twoDotDiscipline: '', oneDotDiscipline: '', clanPowers: {},
    predatorType: '', predatorDiscipline: '', predatorSpecialty: '', predatorPowers: {},
    thinBlood: {
      merits: ['discipline-affinity', 'thin-blood-alchemist'],
      flaws: ['bestial-temper', 'clan-curse'],
      curseClan: 'brujah', affinity: 'fortitude', affinityPower: 'resilience', method: 'fixatio', formula: 'haze',
    },
  },
  starting: { generation: 15, advantages: { haven: 2, mask: 2, resources: 3 }, flaws: ['stake-bait'], purchases: [] },
  relationships: {
    sire: '', coterie: '', tenets: 'Leave a light on for those coming home.',
    convictions: [{ conviction: 'Never strand a fellow traveler', touchstone: 'Avery Chen, a living ferry dispatcher' }],
  },
}
