const standardClan = { generations: [12, 13], bloodPotency: 1, maxBloodPotency: 3, advantages: 7, flaws: 2 } as const

// Core pp. 136–137, 140, 149, 175, and 214.
export const ageProfiles = {
  neonate: { ...standardClan, name: 'Neonate', xp: 15, predatorAllowed: true },
  fledgling: { ...standardClan, name: 'Fledgling', xp: 0, predatorAllowed: false },
} as const

export type AgeProfileId = keyof typeof ageProfiles
export type AgeProfile = (typeof ageProfiles)[AgeProfileId]
export type StartingGeneration = AgeProfile['generations'][number]
export const ageProfileIds = Object.keys(ageProfiles) as AgeProfileId[]
export const defaultAgeProfile: AgeProfileId = 'neonate'
