import type { SkillId } from './traits.ts'

export const disciplines = {
  celerity: 'Celerity',
  potence: 'Potence',
  presence: 'Presence',
} as const

export type DisciplineId = keyof typeof disciplines

export interface DisciplinePower {
  id: string
  name: string
  level: 1 | 2 | 3
  page: number
  amalgam?: { discipline: DisciplineId; dots: number }
}

// Core pp. 252–268. These levels cover the dots available in this path, including starting XP.
export const disciplinePowers: Record<DisciplineId, readonly DisciplinePower[]> = {
  celerity: [
    { id: 'cats-grace', name: 'Cat’s Grace', level: 1, page: 252 },
    { id: 'rapid-reflexes', name: 'Rapid Reflexes', level: 1, page: 253 },
    { id: 'fleetness', name: 'Fleetness', level: 2, page: 253 },
    { id: 'blink', name: 'Blink', level: 3, page: 253 },
    { id: 'traversal', name: 'Traversal', level: 3, page: 253 },
  ],
  potence: [
    { id: 'lethal-body', name: 'Lethal Body', level: 1, page: 264 },
    { id: 'soaring-leap', name: 'Soaring Leap', level: 1, page: 264 },
    { id: 'prowess', name: 'Prowess', level: 2, page: 264 },
    { id: 'brutal-feed', name: 'Brutal Feed', level: 3, page: 264 },
    { id: 'spark-of-rage', name: 'Spark of Rage', level: 3, page: 265, amalgam: { discipline: 'presence', dots: 3 } },
    { id: 'uncanny-grip', name: 'Uncanny Grip', level: 3, page: 265 },
  ],
  presence: [
    { id: 'awe', name: 'Awe', level: 1, page: 267 },
    { id: 'daunt', name: 'Daunt', level: 1, page: 267 },
    { id: 'lingering-kiss', name: 'Lingering Kiss', level: 2, page: 267 },
    { id: 'dread-gaze', name: 'Dread Gaze', level: 3, page: 268 },
    { id: 'entrancement', name: 'Entrancement', level: 3, page: 268 },
  ],
}

export const brujah = {
  id: 'brujah',
  name: 'Brujah',
  disciplines: ['celerity', 'potence', 'presence'],
  bane: 'Violent Temper',
  compulsion: 'Rebellion',
  source: 'Core pp. 65–67, 210',
} as const

export const alleycat = {
  id: 'alleycat',
  name: 'Alleycat',
  disciplines: ['celerity', 'potence'],
  specialties: [
    { skill: 'brawl', name: 'Grappling' },
    { skill: 'intimidation', name: 'Stickups' },
  ] satisfies readonly { skill: SkillId; name: string }[],
  humanityChange: -1,
  advantage: { name: 'Criminal Contacts', dots: 3 },
  source: 'Core pp. 149, 175–176',
} as const
