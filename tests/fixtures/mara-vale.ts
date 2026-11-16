import type { ClanPathDraft } from '../../src/rules/clan-path.ts'
import type { TraitDraft } from '../../src/rules/trait-ledger.ts'

// The first playable path in docs/v5-rules.md.
export const mara: TraitDraft = {
  distribution: 'balanced',
  attributes: {
    strength: 4, dexterity: 2, stamina: 3,
    charisma: 3, manipulation: 2, composure: 2,
    intelligence: 1, wits: 2, resolve: 3,
  },
  skills: {
    athletics: 3, brawl: 3, streetwise: 3,
    awareness: 2, insight: 2, intimidation: 2, larceny: 2, persuasion: 2,
    craft: 1, drive: 1, etiquette: 1, investigation: 1, melee: 1, subterfuge: 1, technology: 1,
  },
  firstDotSpecialties: { craft: 'Carpentry' },
  freeSpecialty: { skill: 'athletics', name: 'Climbing' },
}

export const maraClanPath: ClanPathDraft = {
  clan: 'brujah',
  twoDotDiscipline: 'presence',
  oneDotDiscipline: 'potence',
  clanPowers: { presence: { 1: 'awe', 2: 'daunt' }, potence: { 1: 'lethal-body' } },
  predatorType: 'alleycat',
  predatorDiscipline: 'potence',
  predatorSpecialty: 'brawl',
  predatorPowers: { potence: 'prowess' },
}
