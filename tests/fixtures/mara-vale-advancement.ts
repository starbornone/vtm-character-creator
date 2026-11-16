import type { AdvancementDraft } from '../../src/rules/advancement.ts'
import { maraCharacter } from './mara-vale.ts'

// Hand-checked in docs/v5-rules.md against the finished Mara Vale fixture.
export const maraAdvancement: AdvancementDraft = {
  awards: [20, 25, 10],
  purchases: [
    { kind: 'discipline', id: 'presence', to: 3, power: 'dread-gaze' },
    { kind: 'discipline', id: 'potence', to: 3, power: 'spark-of-rage' },
    { kind: 'attribute', id: 'stamina', to: 4 },
    { kind: 'specialty', id: 'stealth', name: 'Catwalks' },
  ],
}

export const advancedMara = { ...maraCharacter, advancement: maraAdvancement }
