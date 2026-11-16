import type { CharacterDraft } from '../../src/rules/character-guide.ts'

// Standard-clan ancilla fixture in docs/v5-rules.md.
export const silasCharacter: CharacterDraft = {
  ageProfile: 'ancilla',
  concept: {
    name: 'Silas Ward', concept: 'Night archivist', chronicle: 'The Uncatalogued City', embraced: '1912',
    ambition: 'Preserve the city’s missing histories', desire: 'Return the missing ledger to its curator',
  },
  traits: {
    attributes: { strength: 1, dexterity: 3, stamina: 2, charisma: 3, manipulation: 2, composure: 3, intelligence: 4, wits: 2, resolve: 2 },
    distribution: 'balanced',
    skills: {
      academics: 3, investigation: 3, stealth: 3,
      awareness: 2, etiquette: 2, insight: 2, occult: 2, persuasion: 2,
      athletics: 1, craft: 1, drive: 1, larceny: 1, medicine: 1, politics: 1, streetwise: 1,
    },
    firstDotSpecialties: { academics: 'Local history', craft: 'Bookbinding' },
    freeSpecialty: { skill: 'investigation', name: 'Provenance' },
  },
  clanPath: {
    clan: 'toreador', twoDotDiscipline: 'celerity', oneDotDiscipline: 'auspex',
    clanPowers: { celerity: { 1: 'cats-grace', 2: 'fleetness' }, auspex: { 1: 'heightened-senses' } },
    predatorType: 'sandman', predatorDiscipline: 'auspex', predatorSpecialty: 'stealth',
    predatorPowers: { auspex: 'premonition' },
  },
  starting: {
    generation: 11, advantages: { mask: 2, resources: 2, unbondable: 5 }, flaws: ['stake-bait', 'ugly', 'no-haven'],
    purchases: [
      { kind: 'discipline', id: 'auspex', to: 3, power: 'scry-the-soul' },
      { kind: 'discipline', id: 'auspex', to: 4, power: 'spirits-touch' },
    ],
  },
  relationships: {
    sire: 'Helen Finch', coterie: '', tenets: 'Give back what was entrusted to you.',
    convictions: [{ conviction: 'Preserve the truth', touchstone: 'Imani Cole, a living book conservator' }],
  },
}
