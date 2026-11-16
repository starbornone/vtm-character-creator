// V5 Core Rulebook, Renegade second printing, pp. 179–193.
export const startingAdvantages = {
  beautiful: { name: 'Beautiful', dots: [2], page: 179 },
  haven: { name: 'Haven', dots: [1, 2, 3], page: 188 },
  mask: { name: 'Mask', dots: [1, 2], page: 192 },
  resources: { name: 'Resources', dots: [1, 2, 3, 4, 5], page: 193 },
  unbondable: { name: 'Unbondable', dots: [5], page: 181 },
} satisfies Record<string, { name: string; dots: readonly number[]; page: number }>

export type AdvantageId = keyof typeof startingAdvantages
export const advantageIds = Object.keys(startingAdvantages) as AdvantageId[]

export const startingFlaws = {
  'stake-bait': { name: 'Stake Bait', dots: 2, page: 182 },
  ugly: { name: 'Ugly', dots: 1, page: 179, conflictsWith: 'beautiful' },
  'no-haven': { name: 'No Haven', dots: 1, page: 188, conflictsWith: 'haven' },
  destitute: { name: 'Destitute', dots: 1, page: 193, conflictsWith: 'resources' },
} satisfies Record<string, { name: string; dots: number; page: number; conflictsWith?: AdvantageId }>

export type FlawId = keyof typeof startingFlaws
export const flawIds = Object.keys(startingFlaws) as FlawId[]
