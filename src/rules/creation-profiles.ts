const standardClan = { generations: [12, 13], bloodPotency: 1, maxBloodPotency: 3, humanity: 7, advantages: 7, flaws: 2 } as const

// Core pp. 136–137, 140, 149, 175, and 214.
export const ageProfiles = {
  neonate: { ...standardClan, name: 'Neonate', xp: 15, predatorAllowed: true },
  fledgling: { ...standardClan, name: 'Fledgling', xp: 0, predatorAllowed: false },
  ancilla: { name: 'Ancilla', generations: [10, 11], bloodPotency: 2, maxBloodPotency: 4, humanity: 6, advantages: 9, flaws: 4, xp: 35, predatorAllowed: true },
} as const

export type AgeProfileId = keyof typeof ageProfiles
export type AgeProfile = (typeof ageProfiles)[AgeProfileId]
export type StartingGeneration = AgeProfile['generations'][number]
export const ageProfileIds = Object.keys(ageProfiles) as AgeProfileId[]
export const defaultAgeProfile: AgeProfileId = 'neonate'
export const startingGenerations = [...new Set(Object.values(ageProfiles).flatMap(profile => [...profile.generations]))]

export function generationForProfile(profile: AgeProfile, generation: StartingGeneration | undefined) {
  return profile.generations.find(allowed => allowed === generation)
}
