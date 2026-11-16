import { disciplinePowers, disciplines, type DisciplineId } from '../catalog/clan-path.ts'
import { advantageIds, startingAdvantages, startingFlaws, type AdvantageId, type FlawId } from '../catalog/starting-options.ts'
import { skillIds, traitGroups, traitLabel, type AttributeId, type SkillId } from '../catalog/traits.ts'
import type { evaluateClanPath } from './clan-path.ts'
import { specialtySkills, type evaluateTraitLedger, type TraitDraft } from './trait-ledger.ts'

export const neonate = { generations: [12, 13], bloodPotency: 1, maxBloodPotency: 3, xp: 15, advantages: 7, flaws: 2 } as const
export const attributeIds = traitGroups.flatMap(({ attributes }): readonly AttributeId[] => attributes)

// Core p. 216 and Renegade's Blood Potency Correction.
const bloodEffects = {
  1: { baneSeverity: 2, bloodSurge: 2 },
  2: { baneSeverity: 2, bloodSurge: 2 },
  3: { baneSeverity: 3, bloodSurge: 3 },
}
type BloodPotency = keyof typeof bloodEffects

export type Purchase =
  | { kind: 'attribute'; id: AttributeId; to: number }
  | { kind: 'skill'; id: SkillId; to: number; specialty?: string }
  | { kind: 'specialty'; id: SkillId; name: string }
  | { kind: 'discipline'; id: DisciplineId; to: number; power: string }
  | { kind: 'advantage'; id: AdvantageId; to: number }
  | { kind: 'blood-potency'; to: BloodPotency }

export interface StartingDraft {
  generation: (typeof neonate.generations)[number] | undefined
  advantages: Partial<Record<AdvantageId, number>>
  flaws: FlawId[]
  purchases: Purchase[]
  manualOptions?: ManualStartingOption[]
}

export interface ManualStartingOption {
  kind: 'advantage' | 'flaw'
  name: string
  dots: number
  source: string
}

export const initialStartingDraft: StartingDraft = { generation: undefined, advantages: {}, flaws: [], purchases: [] }

type ClanPath = ReturnType<typeof evaluateClanPath>
type TraitLedger = ReturnType<typeof evaluateTraitLedger>

function budget(used: number, limit: number) {
  return { used, limit, remaining: limit - used }
}

function flawConflict(id: FlawId, advantage: AdvantageId) {
  const flaw = startingFlaws[id]
  return 'conflictsWith' in flaw && flaw.conflictsWith === advantage
}

function evaluateOptions(draft: StartingDraft, path: ClanPath, hasLingeringKiss: boolean) {
  const grantedAdvantages = Object.fromEntries(advantageIds.map(id => [
    id, path.advantages.filter(grant => grant.name === startingAdvantages[id].name).reduce((sum, grant) => sum + grant.dots, 0),
  ])) as Record<AdvantageId, number>
  const grantedFlaws = [...path.flaws, ...path.clanFlaws]
  const advantages = advantageIds.flatMap(id => {
    const dots = draft.advantages[id] ?? 0
    if (dots === 0) return []
    const issue = id === 'unbondable' && hasLingeringKiss ? 'Unbondable conflicts with Lingering Kiss.'
      : id === 'beautiful' && path.clan?.id === 'nosferatu' ? 'The Nosferatu Bane prohibits the Beautiful Merit.'
      : !startingAdvantages[id].dots.includes(dots) ? 'Choose a listed rating.'
      : !startingAdvantages[id].dots.includes(dots + grantedAdvantages[id]) ? 'The selected dots and existing grant exceed the listed ratings.' : undefined
    return [{ id, dots, issue }]
  })
  const active = advantages.filter(option => !option.issue)
  const flaws = [...new Set(draft.flaws)].map(id => ({
    id, dots: startingFlaws[id].dots,
    issue: grantedFlaws.some(flaw => flaw.name === startingFlaws[id].name) ? 'Already granted by the clan or Predator Type.'
      : id === 'ugly' && path.clan?.id === 'nosferatu' ? 'The Nosferatu Bane already imposes Repulsive.'
      : active.some(option => flawConflict(id, option.id)) ? 'Conflicts with a selected Advantage.'
      : advantageIds.some(advantage => grantedAdvantages[advantage] && flawConflict(id, advantage)) ? 'Conflicts with a granted Advantage.' : undefined,
  }))
  const manualOptions = (draft.manualOptions ?? []).map((option, index, entries) => {
    const name = option.name.trim()
    const source = option.source.trim()
    const normalized = name.toLowerCase()
    const known = option.kind === 'advantage' ? [...Object.values(startingAdvantages), ...path.advantages] : [...Object.values(startingFlaws), ...grantedFlaws]
    const duplicate = known.some(entry => entry.name.toLowerCase() === normalized)
      || entries.some((entry, position) => position !== index && entry.kind === option.kind && entry.name.trim().toLowerCase() === normalized)
    const issue = !name || !source ? 'Enter a name and source or Storyteller note.'
      : !Number.isInteger(option.dots) || option.dots < 1 || option.dots > (option.kind === 'advantage' ? 5 : 2) ? 'Choose a valid starting dot rating.'
      : duplicate ? 'This option already appears in the catalog, grants, or manual entries.' : undefined
    return { ...option, name, source, issue }
  })
  const manualDots = (kind: ManualStartingOption['kind']) => manualOptions.reduce((sum, option) => sum + (option.kind === kind && !option.issue ? option.dots : 0), 0)
  return {
    advantages,
    flaws,
    manualOptions,
    grantedAdvantages,
    advantageBudget: budget(active.reduce((sum, option) => sum + option.dots, manualDots('advantage')), neonate.advantages),
    flawBudget: budget(flaws.filter(option => !option.issue).reduce((sum, option) => sum + option.dots, manualDots('flaw')), neonate.flaws),
  }
}

interface ExperienceState {
  attributes: Partial<Record<AttributeId, number>>
  skills: Partial<Record<SkillId, number>>
  unresolvedSkills: SkillId[]
  specialties: Partial<Record<SkillId, string[]>>
  disciplines: Partial<Record<DisciplineId, number>>
  powers: string[]
  readyDisciplines: DisciplineId[]
  clanDisciplines: readonly DisciplineId[]
  looksRestricted: boolean
  advantages: Partial<Record<AdvantageId, number>>
  flaws: FlawId[]
  bloodPotency: BloodPotency
  remaining: number
}

function startExperience(traits: TraitDraft, ledger: TraitLedger, path: ClanPath, options: ReturnType<typeof evaluateOptions>): ExperienceState {
  const slots = path.predatorSlot ? [...path.clanSlots, path.predatorSlot] : path.clanSlots
  const specialties: ExperienceState['specialties'] = {}
  const addSpecialty = (skill: SkillId, name: string) => { specialties[skill] = [...(specialties[skill] ?? []), name] }
  for (const slot of ledger.specialties.firstDotSlots) if (slot.active) addSpecialty(slot.skill, slot.name)
  const free = traits.freeSpecialty
  if (free.skill && !ledger.specialties.freeIssue) addSpecialty(free.skill, free.name.trim())
  const grant = ledger.specialties.predatorGrant
  if (grant?.kind === 'specialty') addSpecialty(grant.skill, grant.name)
  const skills: ExperienceState['skills'] = Object.fromEntries(ledger.specialties.eligibleSkills.map(id => [id, traits.skills[id]]))
  if (grant?.kind === 'skill-dot') skills[grant.skill] = 1
  const advantages = { ...options.grantedAdvantages }
  for (const option of options.advantages) if (!option.issue) advantages[option.id] += option.dots

  return {
    attributes: { ...traits.attributes }, skills, specialties,
    unresolvedSkills: skillIds.filter(id => traits.skills[id] !== undefined && skills[id] === undefined),
    disciplines: Object.fromEntries(path.ledger.map(row => [row.discipline, row.total])),
    powers: slots.flatMap(slot => slot.selectedPower ? [slot.selectedPower.id] : []),
    readyDisciplines: path.ledger.filter(row => slots.every(slot => slot.discipline !== row.discipline || slot.selectedPower)).map(row => row.discipline),
    clanDisciplines: path.clan?.disciplines ?? [],
    looksRestricted: path.clan?.id === 'nosferatu',
    advantages,
    flaws: options.flaws.filter(option => !option.issue).map(({ id }) => id),
    bloodPotency: path.bloodPotencyChange ? 2 : neonate.bloodPotency, remaining: neonate.xp,
  }
}

export function purchaseLabel(purchase: Purchase, includeCustomText = true) {
  switch (purchase.kind) {
    case 'specialty': return includeCustomText ? `${traitLabel(purchase.id)} (${purchase.name.trim()})` : `${traitLabel(purchase.id)} Specialty`
    case 'attribute': return `${traitLabel(purchase.id)} ${purchase.to}`
    case 'skill': return `${traitLabel(purchase.id)} ${purchase.to}${purchase.to === 1 && purchase.specialty?.trim() ? ` · First-dot Specialty${includeCustomText ? ` ${purchase.specialty.trim()}` : ''}` : ''}`
    case 'discipline': return `${disciplines[purchase.id]} ${purchase.to} · ${disciplinePowers[purchase.id].find(power => power.id === purchase.power)?.name ?? 'Choose a power'}`
    case 'advantage': return `${startingAdvantages[purchase.id].name} ${purchase.to}`
    case 'blood-potency': return `Blood Potency ${purchase.to}`
  }
}

// Quote and apply use the same rule, including the remaining budget at this point in the journal.
export function quotePurchase(state: ExperienceState, purchase: Purchase): { cost?: number; issue?: string } {
  const checkBudget = (cost: number) => ({ cost, issue: cost > state.remaining ? 'Not enough starting XP.' : undefined })
  switch (purchase.kind) {
    case 'attribute': {
      const current = state.attributes[purchase.id]
      if (!current) return { issue: 'Assign the starting Attribute first.' }
      if (purchase.to !== current + 1 || purchase.to > 5) return { issue: 'Raise the Attribute one dot at a time, up to 5.' }
      return checkBudget(purchase.to * 5)
    }
    case 'skill': {
      if (state.unresolvedSkills.includes(purchase.id)) return { issue: 'Resolve this Skill’s base allocation first.' }
      const current = state.skills[purchase.id] ?? 0
      if (purchase.to !== current + 1 || purchase.to > 5) return { issue: 'Raise the Skill one dot at a time, up to 5.' }
      if (current === 0 && specialtySkills.some(id => id === purchase.id) && !purchase.specialty?.trim()) return { issue: 'Name the Specialty granted by the first dot.' }
      return checkBudget(purchase.to * 3)
    }
    case 'specialty': {
      if (state.unresolvedSkills.includes(purchase.id)) return { issue: 'Resolve this Skill’s base allocation first.' }
      const rating = state.skills[purchase.id]
      const existing = state.specialties[purchase.id] ?? []
      const name = purchase.name.trim().toLowerCase()
      if (!rating) return { issue: 'This Skill needs at least one dot.' }
      if (!name) return { issue: 'Name the Specialty.' }
      if (existing.some(value => value.toLowerCase() === name)) return { issue: 'This Skill already has that Specialty.' }
      if (purchase.id !== 'craft' && existing.length >= rating) return { issue: 'This Skill has reached its Specialty limit.' }
      return checkBudget(3)
    }
    case 'discipline': {
      const current = state.disciplines[purchase.id]
      if (current === undefined || !state.readyDisciplines.includes(purchase.id)) return { issue: 'Choose a clan Discipline or complete its Predator Type power first.' }
      if (purchase.to !== current + 1 || purchase.to > 5) return { issue: 'Raise the Discipline one dot at a time, up to 5.' }
      const price = checkBudget(purchase.to * (state.clanDisciplines.includes(purchase.id) ? 5 : 7))
      if (price.issue) return price
      const power = disciplinePowers[purchase.id].find(option => option.id === purchase.power)
      if (!power || power.level > purchase.to || state.powers.includes(power.id)) return { ...price, issue: 'Choose an eligible new power for this dot.' }
      if (power.amalgam && (state.disciplines[power.amalgam.discipline] ?? 0) < power.amalgam.dots) return { ...price, issue: 'This power’s Amalgam prerequisite is unmet.' }
      if (power.id === 'lingering-kiss' && state.advantages.unbondable) return { ...price, issue: 'Lingering Kiss conflicts with Unbondable.' }
      return price
    }
    case 'advantage': {
      if (purchase.id === 'beautiful' && state.looksRestricted) return { issue: 'The Nosferatu Bane prohibits the Beautiful Merit.' }
      const option = startingAdvantages[purchase.id]
      const current = state.advantages[purchase.id] ?? 0
      if (option.dots.find(dots => dots > current) !== purchase.to) return { issue: 'Choose the next listed Advantage rating.' }
      if (state.flaws.some(id => flawConflict(id, purchase.id))) return { issue: 'This Advantage conflicts with a selected Flaw.' }
      if (purchase.id === 'unbondable' && state.powers.includes('lingering-kiss')) return { issue: 'Unbondable conflicts with Lingering Kiss.' }
      return checkBudget(3 * (purchase.to - current))
    }
    case 'blood-potency':
      if (purchase.to !== state.bloodPotency + 1 || purchase.to > neonate.maxBloodPotency) return { issue: 'Raise Blood Potency one dot at a time, within the Generation limit.' }
      return checkBudget(purchase.to * 10)
  }
}

// The evaluator owns these copies. Invalid journal entries have no effect on them.
function applyPurchase(state: ExperienceState, purchase: Purchase, cost: number) {
  state.remaining -= cost
  switch (purchase.kind) {
    case 'attribute': state.attributes[purchase.id] = purchase.to; break
    case 'skill':
      state.skills[purchase.id] = purchase.to
      if (purchase.to === 1 && specialtySkills.some(id => id === purchase.id) && purchase.specialty) state.specialties[purchase.id] = [purchase.specialty.trim()]
      break
    case 'specialty': state.specialties[purchase.id] = [...(state.specialties[purchase.id] ?? []), purchase.name.trim()]; break
    case 'discipline': state.disciplines[purchase.id] = purchase.to; state.powers.push(purchase.power); break
    case 'advantage': state.advantages[purchase.id] = purchase.to; break
    case 'blood-potency': state.bloodPotency = purchase.to; break
  }
}

export function evaluateStartingBuild(draft: StartingDraft, traits: TraitDraft, ledger: TraitLedger, path: ClanPath, includeCustomText = true) {
  const hasLingeringKiss = path.clanSlots.some(slot => slot.selectedPower?.id === 'lingering-kiss') || path.predatorSlot?.selectedPower?.id === 'lingering-kiss'
  const options = evaluateOptions(draft, path, hasLingeringKiss)
  const final = startExperience(traits, ledger, path, options)
  const entries = draft.purchases.map(purchase => {
    const quote = quotePurchase(final, purchase)
    if (!quote.issue && quote.cost !== undefined) applyPurchase(final, purchase, quote.cost)
    return { ...quote, label: purchaseLabel(purchase, includeCustomText), remaining: final.remaining }
  })
  const predatorAdvantage = path.advantages.reduce((sum, grant) => sum + grant.dots, 0)
  const trackedGrants = Object.values(options.grantedAdvantages).reduce((sum, dots) => sum + dots, 0)
  const manualAdvantageDots = options.manualOptions.reduce((sum, option) => sum + (option.kind === 'advantage' && !option.issue ? option.dots : 0), 0)
  const purchasedAdvantageDots = Object.values(final.advantages).reduce((sum, dots) => sum + dots, manualAdvantageDots) - trackedGrants
  const totalAdvantageDots = purchasedAdvantageDots + predatorAdvantage
  const xpAdvantageDots = purchasedAdvantageDots - options.advantageBudget.used
  return {
    ...options, final, entries, predatorAdvantage, xpAdvantageDots, totalAdvantageDots,
    generation: draft.generation, humanity: path.humanity.total,
    bloodPotency: final.bloodPotency, ...bloodEffects[final.bloodPotency],
  }
}
