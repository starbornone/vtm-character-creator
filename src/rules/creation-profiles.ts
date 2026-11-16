const standardClan = { generations: [12, 13], bloodPotency: 1, maxBloodPotency: 3, humanity: 7, advantages: 7, flaws: 2 } as const

// Core pp. 136–137, 140, 149, 175, and 214.
export const ageProfiles = {
  fledgling: { ...standardClan, name: 'Fledgling', xp: 0, predatorAllowed: false },
  neonate: { ...standardClan, name: 'Neonate', xp: 15, predatorAllowed: true },
  ancilla: { name: 'Ancilla', generations: [10, 11], bloodPotency: 2, maxBloodPotency: 4, humanity: 6, advantages: 9, flaws: 4, xp: 35, predatorAllowed: true },
} as const

export type AgeProfileId = keyof typeof ageProfiles
export type AgeProfile = (typeof ageProfiles)[AgeProfileId]
// Thin-bloods use the Fledgling age with their own Generation and Blood Potency ranges.
export const thinBloodProfile = { ...ageProfiles.fledgling, generations: [14, 15, 16], bloodPotency: 0, maxBloodPotency: 0 } as const
export type CreationProfile = AgeProfile | typeof thinBloodProfile
export type StartingGeneration = CreationProfile['generations'][number]
export const ageProfileIds = Object.keys(ageProfiles) as AgeProfileId[]
export const defaultAgeProfile: AgeProfileId = 'neonate'
export const startingGenerations = [...new Set([...Object.values(ageProfiles), thinBloodProfile].flatMap(profile => [...profile.generations]))]

export function generationForProfile(profile: CreationProfile, generation: StartingGeneration | undefined) {
  return profile.generations.find(allowed => allowed === generation)
}
