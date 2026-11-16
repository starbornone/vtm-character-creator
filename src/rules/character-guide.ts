import { disciplineIds, disciplinePowers, disciplines, startingRituals } from '../catalog/clan-path.ts'
import { advantageIds, startingAdvantages, startingFlaws } from '../catalog/starting-options.ts'
import { traitGroups, traitLabel } from '../catalog/traits.ts'
import { evaluateClanPath, initialClanPath, manualOptionId, type ClanPathDraft } from './clan-path.ts'
import { evaluateStartingBuild, initialStartingDraft, neonate, type StartingDraft } from './starting-xp.ts'
import { deriveTracks, editTraits, evaluateTraitLedger, initialTraitDraft, type TraitAction, type TraitDraft } from './trait-ledger.ts'

export const guideSteps = [
  { id: 'concept', title: 'Concept' },
  { id: 'clan', title: 'Clan & Predator Type' },
  { id: 'traits', title: 'Attributes & Skills' },
  { id: 'starting', title: 'Advantages & XP' },
  { id: 'relationships', title: 'Relationships' },
  { id: 'review', title: 'Review & Print' },
] as const

export type GuideStep = (typeof guideSteps)[number]['id']
export type EditStep = Exclude<GuideStep, 'review'>

export interface ConceptDraft {
  name: string
  concept: string
  chronicle: string
  embraced: string
  ambition: string
  desire: string
}

export interface RelationshipDraft {
  sire: string
  coterie: string
  tenets: string
  convictions: { conviction: string; touchstone: string }[]
}

export const maxConvictions = 3

export interface CharacterDraft {
  concept: ConceptDraft
  relationships: RelationshipDraft
  traits: TraitDraft
  clanPath: ClanPathDraft
  starting: StartingDraft
}

export const initialCharacterDraft: CharacterDraft = {
  concept: { name: '', concept: '', chronicle: '', embraced: '', ambition: '', desire: '' },
  relationships: { sire: '', coterie: '', tenets: '', convictions: [{ conviction: '', touchstone: '' }] },
  traits: initialTraitDraft,
  clanPath: initialClanPath,
  starting: initialStartingDraft,
}

export type CharacterAction = TraitAction
  | { type: 'concept'; update: Partial<ConceptDraft> }
  | { type: 'relationships'; update: Partial<RelationshipDraft> }
  | { type: 'clan-path'; update: Partial<ClanPathDraft> }
  | { type: 'starting'; update: Partial<StartingDraft> }

export function editCharacter(draft: CharacterDraft, action: CharacterAction): CharacterDraft {
  switch (action.type) {
    case 'concept': return { ...draft, concept: { ...draft.concept, ...action.update } }
    case 'relationships': return { ...draft, relationships: { ...draft.relationships, ...action.update } }
    case 'clan-path': return { ...draft, clanPath: { ...draft.clanPath, ...action.update } }
    case 'starting': return { ...draft, starting: { ...draft.starting, ...action.update } }
    default: return { ...draft, traits: editTraits(draft.traits, action) }
  }
}

const conceptFields = [
  { key: 'name', label: 'Character name' },
  { key: 'concept', label: 'Concept' },
  { key: 'ambition', label: 'Ambition' },
  { key: 'desire', label: 'Desire' },
] as const

export function evaluateCharacter(draft: CharacterDraft, { includeCustomText = true } = {}) {
  const path = evaluateClanPath(draft.clanPath, includeCustomText)
  const traits = evaluateTraitLedger(draft.traits, path.grantedSpecialty)
  const starting = evaluateStartingBuild(draft.starting, draft.traits, traits, path, includeCustomText)
  const baseTracks = deriveTracks(starting.final.attributes)
  const resilience = starting.final.powers.includes('resilience') ? starting.final.disciplines.fortitude ?? 0 : 0
  const tracks = { ...baseTracks, health: {
    ...baseTracks.health, resilience, total: baseTracks.health.total === undefined ? undefined : baseTracks.health.total + resilience,
  } }

  const pending: Record<EditStep, string[]> = {
    concept: conceptFields.filter(({ key }) => !draft.concept[key].trim()).map(({ label }) => `Fill in ${label.toLowerCase()}.`),
    traits: [], clan: [], starting: [], relationships: [],
  }
  if (traits.attributes.open || traits.attributes.excess) pending.traits.push('Complete the Attribute allocation.')
  if (traits.skills.open || traits.skills.excess) pending.traits.push('Complete the Skill distribution.')
  if (traits.specialties.completed < traits.specialties.total) pending.traits.push('Name all eligible starting Specialties.')

  if (!path.clan) pending.clan.push(draft.clanPath.clan === manualOptionId
    ? 'Name the manual clan, add its source or note, and choose three distinct Disciplines.' : 'Choose a clan.')
  else {
    if (path.clanSlots.length < 3 || path.clanSlots.some(slot => !slot.selectedPower)) pending.clan.push('Assign both clan Disciplines and their powers.')
    if (!path.predator) pending.clan.push(path.predatorIssue ?? (draft.clanPath.predatorType === manualOptionId
      ? 'Complete the manual Predator Type’s name, source or note, and any grant details.' : 'Choose a Predator Type.'))
    else {
      if (!path.predatorSlot?.selectedPower) pending.clan.push('Choose the granted Discipline and an eligible power.')
      if (!path.grantedSpecialty || traits.specialties.predatorGrant?.kind === 'pending') pending.clan.push('Resolve the Predator Type’s Specialty or Skill dot.')
      for (const choice of path.grantChoices) if (!choice.complete) pending.clan.push(`Complete the ${choice.label} grant.`)
    }
  }

  if (!starting.generation) pending.starting.push('Choose a Generation.')
  if (starting.advantageBudget.remaining !== 0 || starting.advantages.some(option => option.issue)) pending.starting.push('Resolve the base Advantage choices and their budget.')
  if (starting.flawBudget.remaining !== 0 || starting.flaws.some(option => option.issue)) pending.starting.push('Resolve the base Flaw choices and their budget.')
  if (starting.manualOptions.some(option => option.issue)) pending.starting.push('Resolve incomplete or duplicate manual Advantages and Flaws.')
  if (starting.entries.some(entry => entry.issue)) pending.starting.push('Resolve ineligible XP purchases.')
  if (starting.final.remaining > 0) pending.starting.push('Spend the remaining starting XP.')

  const convictions = draft.relationships.convictions.map(pair => ({ conviction: pair.conviction.trim(), touchstone: pair.touchstone.trim() }))
  if (convictions.length < 1 || convictions.length > maxConvictions || convictions.some(pair => !pair.conviction || !pair.touchstone)) {
    pending.relationships.push('Complete one to three Convictions with a Touchstone for each.')
  }

  const { final } = starting
  const ritual = final.disciplines['blood-sorcery'] ? startingRituals.find(option => option.id === draft.clanPath.ritual) : undefined
  const manualOptions = starting.manualOptions.filter(option => !option.issue)
  const hideClanText = !includeCustomText && path.clan?.id === manualOptionId
  const hidePredatorText = !includeCustomText && path.predator?.id === manualOptionId
  const predatorName = hidePredatorText ? 'Manual Predator Type' : path.predator?.name
  const fixedSpecialty = !path.specialtyOption?.custom && traits.specialties.predatorGrant?.kind === 'specialty'
    ? traits.specialties.predatorGrant : undefined
  const sheet = {
    identity: {
      name: draft.concept.name.trim(), concept: draft.concept.concept.trim(), chronicle: draft.concept.chronicle.trim(),
      embraced: draft.concept.embraced.trim(), ambition: draft.concept.ambition.trim(), desire: draft.concept.desire.trim(),
      clan: hideClanText ? 'Manual clan' : path.clan?.name, predator: predatorName, generation: starting.generation,
    },
    relationships: { sire: draft.relationships.sire.trim(), coterie: draft.relationships.coterie.trim(), tenets: draft.relationships.tenets.trim(), convictions },
    tracks: {
      health: tracks.health.total, willpower: tracks.willpower.total,
      humanity: starting.humanity, bloodPotency: starting.bloodPotency, baneSeverity: starting.baneSeverity, bloodSurge: starting.bloodSurge,
    },
    bane: hideClanText ? undefined : path.clan?.bane,
    compulsion: hideClanText ? undefined : path.clan?.compulsion,
    traitGroups: traitGroups.map(group => ({
      name: group.name,
      attributes: group.attributes.map(id => ({ name: traitLabel(id), rating: final.attributes[id] })),
      skills: group.skills.map(id => {
        const specialties = (final.specialties[id] ?? []).filter(Boolean)
        const catalogNames = fixedSpecialty?.skill === id ? [fixedSpecialty.name] : []
        return {
          name: traitLabel(id), rating: final.unresolvedSkills.includes(id) ? undefined : (final.skills[id] ?? 0),
          specialties: includeCustomText ? specialties : specialties.map(name => catalogNames.includes(name) ? name : 'Custom Specialty'),
        }
      }),
    })),
    disciplines: disciplineIds.flatMap(id => {
      const rating = final.disciplines[id] ?? 0
      const powers = disciplinePowers[id].filter(power => final.powers.includes(power.id)).map(power => power.name)
      return rating > 0 ? [{ name: disciplines[id], rating, powers }] : []
    }),
    ritual,
    reviews: [...path.reviews, ...manualOptions.map(option => includeCustomText
      ? `Manual ${option.kind === 'advantage' ? 'Advantage' : 'Flaw'}: ${option.name} (${option.source}).`
      : `Review a manual ${option.kind} with the Storyteller.`)],
    advantages: advantageIds.flatMap(id => {
      const dots = (final.advantages[id] ?? 0) - starting.grantedAdvantages[id]
      if (!dots) return []
      const base = starting.advantages.find(option => option.id === id && !option.issue)?.dots ?? 0
      return [{ name: startingAdvantages[id].name, dots, source: dots > base ? (base ? 'Base + XP' : 'XP') : 'Base' }]
    }).concat(
      path.advantages.map(({ name, dots }) => ({ name: hidePredatorText ? 'Manual Advantage' : name, dots, source: predatorName ?? 'Predator Type' })),
      manualOptions.filter(option => option.kind === 'advantage').map(({ name, dots }) => ({ name: includeCustomText ? name : 'Manual Advantage', dots, source: 'Manual · Base' })),
    ),
    flaws: [
      ...final.flaws.map(id => ({ ...startingFlaws[id], source: undefined })),
      ...path.flaws.map(({ name, dots }) => ({ name: hidePredatorText ? 'Manual Flaw' : name, dots, source: predatorName })),
      ...path.clanFlaws.map(grant => ({ ...grant, source: path.clan?.name })),
      ...manualOptions.filter(option => option.kind === 'flaw').map(({ name, dots }) => ({ name: includeCustomText ? name : 'Manual Flaw', dots, source: 'Manual · Base' })),
    ],
    advantageDots: starting.totalAdvantageDots,
    flawDots: starting.flawBudget.used + [...path.flaws, ...path.clanFlaws].reduce((sum, flaw) => sum + flaw.dots, 0),
    xpSpent: neonate.xp - final.remaining,
    xpRemaining: final.remaining,
    purchases: starting.entries.filter(entry => !entry.issue),
    draft: Object.values(pending).some(issues => issues.length > 0),
  }
  return { path, traits, starting, tracks, sheet, pending }
}
