import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Hand-checked Ravnos creation fixture in docs/v5-rules.md.
export const lenaCharacter: CharacterDraft = {
  ageProfile: 'neonate',
  sourcePacks: ['players-guide'],
  concept: {
    name: 'Lena Ortiz', concept: 'Touring lighting technician', chronicle: 'After the Last Encore', embraced: '2014',
    ambition: 'Keep the touring crew together', desire: 'Recover the missing lighting rig',
  },
  traits: {
    attributes: { strength: 1, dexterity: 3, stamina: 3, charisma: 4, manipulation: 2, composure: 3, intelligence: 2, wits: 2, resolve: 2 },
    distribution: 'balanced',
    skills: {
      persuasion: 3, stealth: 3, technology: 3,
      awareness: 2, drive: 2, insight: 2, streetwise: 2, subterfuge: 2,
      athletics: 1, brawl: 1, etiquette: 1, investigation: 1, larceny: 1, medicine: 1, occult: 1,
    },
    firstDotSpecialties: {},
    freeSpecialty: { skill: 'technology', name: 'Stage lighting' },
  },
  clanPath: {
    clan: 'ravnos', twoDotDiscipline: 'obfuscate', oneDotDiscipline: 'presence',
    clanPowers: { obfuscate: { 1: 'cloak-of-shadows', 2: 'chimerstry' }, presence: { 1: 'awe' } },
    predatorType: 'siren', predatorDiscipline: 'presence', predatorSpecialty: 'persuasion',
    predatorPowers: { presence: 'daunt' },
  },
  starting: {
    generation: 13, advantages: { haven: 2, mask: 2, resources: 3 }, flaws: ['stake-bait'],
    purchases: [{ kind: 'discipline', id: 'obfuscate', to: 3, power: 'fata-morgana' }],
  },
  relationships: {
    sire: '', coterie: '', tenets: 'Bring everyone home after the show.',
    convictions: [{ conviction: 'Always pay the crew first', touchstone: 'Ruth Navarro, a living stage electrician' }],
  },
}
