import { skillIds, type AttributeId, type SkillId } from '../catalog/traits.ts'

export const ratings = [4, 3, 2, 1] as const
export type Rating = (typeof ratings)[number]
export type TraitRatings<Id extends string> = Partial<Record<Id, Rating | undefined>>

// V5 Core Rulebook, p. 136. Each capacity counts traits at exactly that rating.
export const attributeCapacity = { 4: 1, 3: 3, 2: 4, 1: 1 }
export const skillDistributions = {
  'jack-of-all-trades': { name: 'Jack of All Trades', capacity: { 4: 0, 3: 1, 2: 8, 1: 10 } },
  balanced: { name: 'Balanced', capacity: { 4: 0, 3: 3, 2: 5, 1: 7 } },
  specialist: { name: 'Specialist', capacity: { 4: 1, 3: 3, 2: 3, 1: 3 } },
} as const
export type SkillDistribution = keyof typeof skillDistributions
export const skillDistributionIds = Object.keys(skillDistributions) as SkillDistribution[]

// The first dot grants a Specialty (Core pp. 145, 159–171).
export const specialtySkills = ['academics', 'craft', 'performance', 'science'] as const
type SpecialtySkill = (typeof specialtySkills)[number]

export interface TraitDraft {
  attributes: TraitRatings<AttributeId>
  skills: TraitRatings<SkillId>
  distribution: SkillDistribution
  firstDotSpecialties: Partial<Record<SpecialtySkill, string>>
  freeSpecialty: { skill: SkillId | ''; name: string }
}

export const initialTraitDraft: TraitDraft = {
  attributes: {},
  skills: {},
  distribution: 'balanced',
  firstDotSpecialties: {},
  freeSpecialty: { skill: '', name: '' },
}

export type TraitAction =
  | { type: 'attribute'; id: AttributeId; rating: Rating | undefined }
  | { type: 'skill'; id: SkillId; rating: Rating | undefined }
  | { type: 'distribution'; distribution: SkillDistribution }
  | { type: 'first-dot-specialty'; skill: SpecialtySkill; name: string }
  | { type: 'free-specialty-skill'; skill: SkillId | '' }
  | { type: 'free-specialty-name'; name: string }

export function editTraits(draft: TraitDraft, action: TraitAction): TraitDraft {
  switch (action.type) {
    case 'attribute':
      return { ...draft, attributes: { ...draft.attributes, [action.id]: action.rating } }
    case 'skill':
      return { ...draft, skills: { ...draft.skills, [action.id]: action.rating } }
    case 'distribution':
      return { ...draft, distribution: action.distribution }
    case 'first-dot-specialty':
      return { ...draft, firstDotSpecialties: { ...draft.firstDotSpecialties, [action.skill]: action.name } }
    case 'free-specialty-skill':
      return { ...draft, freeSpecialty: { ...draft.freeSpecialty, skill: action.skill } }
    case 'free-specialty-name':
      return { ...draft, freeSpecialty: { ...draft.freeSpecialty, name: action.name } }
  }
}

export interface RatingSlot {
  rating: Rating
  used: number
  capacity: number
  remaining: number
}

interface GrantedSpecialty {
  skill: SkillId
  name: string
}

function evaluateAllocation(values: TraitRatings<string>, capacity: Record<Rating, number>) {
  const assigned = Object.values(values)
  const slots: RatingSlot[] = ratings.map(rating => {
    const used = assigned.filter(value => value === rating).length
    return { rating, used, capacity: capacity[rating], remaining: capacity[rating] - used }
  })

  return {
    slots,
    open: slots.reduce((count, slot) => count + Math.max(slot.remaining, 0), 0),
    excess: slots.reduce((count, slot) => count + Math.max(-slot.remaining, 0), 0),
  }
}

function evaluateSpecialties(draft: TraitDraft, skillSlots: readonly RatingSlot[], grant?: GrantedSpecialty) {
  const overfilled = new Set(skillSlots.filter(slot => slot.remaining < 0).map(slot => slot.rating))
  const ratedSkills = skillIds.filter(id => draft.skills[id] !== undefined)
  const eligibleSkills = ratedSkills.filter(id => {
    const rating = draft.skills[id]
    return rating !== undefined && !overfilled.has(rating)
  })
  // Core p. 149. A Predator Type grants a dot in an unrated Skill instead of a Specialty.
  const firstDotSlots = specialtySkills.filter(id => draft.skills[id] !== undefined || grant?.skill === id).map(skill => ({
    skill,
    name: (draft.firstDotSpecialties[skill] ?? '').trim(),
    active: eligibleSkills.includes(skill) || (grant?.skill === skill && draft.skills[skill] === undefined),
  }))
  const firstDotGrant = firstDotSlots.find(slot => slot.skill === grant?.skill)
  const predatorGrant = grant && {
    ...grant,
    kind: draft.skills[grant.skill] === undefined ? 'skill-dot' as const
      : !eligibleSkills.includes(grant.skill) || Boolean(firstDotGrant
        && ((grant.skill !== 'craft' && draft.skills[grant.skill] === 1) || firstDotGrant.name.toLowerCase() === grant.name.toLowerCase()))
        ? 'pending' as const : 'specialty' as const,
  }
  const { skill, name } = draft.freeSpecialty
  const firstDot = firstDotSlots.find(slot => slot.skill === skill)
  const selectedRating = skill ? draft.skills[skill] : undefined
  const choiceName = name.trim()
  const predatorSpecialty = predatorGrant?.kind === 'specialty' && predatorGrant.skill === skill ? predatorGrant : undefined
  const reservedNames = [firstDot?.name, predatorSpecialty?.name]
  let issue: 'unrated' | 'overfilled' | 'limit' | 'duplicate' | undefined

  // Core pp. 159–160. Craft can have more Specialties than its rating.
  if (skill && selectedRating === undefined) issue = 'unrated'
  else if (skill && !eligibleSkills.includes(skill)) issue = 'overfilled'
  else if (selectedRating !== undefined && skill !== 'craft' && Number(Boolean(firstDot)) + Number(Boolean(predatorSpecialty)) >= selectedRating) issue = 'limit'
  else if (choiceName && reservedNames.some(value => value?.toLowerCase() === choiceName.toLowerCase())) issue = 'duplicate'

  const completed = firstDotSlots.filter(slot => slot.active && slot.name).length + Number(Boolean(skill && choiceName && !issue))
  return { firstDotSlots, eligibleSkills, freeIssue: issue, completed, total: firstDotSlots.length + 1, predatorGrant }
}

export function deriveTracks(attributes: Partial<Record<AttributeId, number>>) {
  // Core pp. 136, 155–157. Wait for each contributing Attribute in a partial draft.
  const { stamina, composure, resolve } = attributes
  return {
    health: { stamina, total: stamina === undefined ? undefined : stamina + 3 },
    willpower: { composure, resolve, total: composure === undefined || resolve === undefined ? undefined : composure + resolve },
  }
}

export function evaluateTraitLedger(draft: TraitDraft, grantedSpecialty?: GrantedSpecialty) {
  const attributes = evaluateAllocation(draft.attributes, attributeCapacity)
  const skills = evaluateAllocation(draft.skills, skillDistributions[draft.distribution].capacity)
  const specialties = evaluateSpecialties(draft, skills.slots, grantedSpecialty)
  return { attributes, skills, specialties, ...deriveTracks(draft.attributes) }
}
