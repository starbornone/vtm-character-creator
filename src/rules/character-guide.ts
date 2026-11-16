import { allDisciplinePowers, disciplineIds, disciplines, startingRituals } from '../catalog/clan-path.ts'
import { playersGuide, playersGuideDisabled, unavailableSourceMessage, unavailableSourcePacks } from '../catalog/source-packs.ts'
import { advantageIds, startingAdvantages, startingFlaws } from '../catalog/starting-options.ts'
import { traitGroups, traitLabel } from '../catalog/traits.ts'
import { evaluateAdvancement, type AdvancementDraft } from './advancement.ts'
import { evaluateClanPath, initialClanPath, manualOptionId, type ClanPathDraft } from './clan-path.ts'
import { ageProfiles, defaultAgeProfile, type AgeProfileId } from './creation-profiles.ts'
import type { RelationshipMapDraft } from './relationship-map.ts'
import { bloodEffects, evaluateStartingBuild, initialStartingDraft, type StartingDraft } from './starting-xp.ts'
import { deriveTracks, editTraits, evaluateTraitLedger, initialTraitDraft, type TraitAction, type TraitDraft } from './trait-ledger.ts'

export const guideSteps = [
  { id: 'concept', title: 'Concept' },
  { id: 'clan', title: 'Clan & Predator' },
  { id: 'traits', title: 'Attributes & Skills' },
  { id: 'starting', title: 'Advantages & XP' },
  { id: 'relationships', title: 'Relationships' },
  { id: 'review', title: 'Review & Print' },
] as const

export type GuideStep = (typeof guideSteps)[number]['id']
export type EditStep = Exclude<GuideStep, 'review'>

export interface ReviewTarget {
  step: EditStep
  id: string
}

interface OpenChoice {
  message: string
  target: ReviewTarget
}

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

export interface ChronicleSettings {
  chronicle: string
  tenets: string
  sourcePacks: string[]
}

export const maxConvictions = 3

export interface CharacterDraft {
  ageProfile?: AgeProfileId
  sourcePacks?: string[]
  concept: ConceptDraft
  relationships: RelationshipDraft
  relationshipMap?: RelationshipMapDraft
  traits: TraitDraft
  clanPath: ClanPathDraft
  starting: StartingDraft
  advancement?: AdvancementDraft
}

export const initialCharacterDraft: CharacterDraft = {
  ageProfile: defaultAgeProfile,
  concept: { name: '', concept: '', chronicle: '', embraced: '', ambition: '', desire: '' },
  relationships: { sire: '', coterie: '', tenets: '', convictions: [{ conviction: '', touchstone: '' }] },
  traits: initialTraitDraft,
  clanPath: initialClanPath,
  starting: initialStartingDraft,
}

export type CharacterAction = TraitAction
  | { type: 'players-guide'; enabled: boolean }
  | { type: 'age-profile'; profile: AgeProfileId }
  | { type: 'chronicle-preset'; settings: ChronicleSettings }
  | { type: 'concept'; update: Partial<ConceptDraft> }
  | { type: 'relationships'; update: Partial<RelationshipDraft> }
  | { type: 'relationship-map'; map: RelationshipMapDraft }
  | { type: 'clan-path'; update: Partial<ClanPathDraft> }
  | { type: 'starting'; update: Partial<StartingDraft> }
  | { type: 'advancement'; journal: AdvancementDraft }

export function editCharacter(draft: CharacterDraft, action: CharacterAction): CharacterDraft {
  switch (action.type) {
    case 'players-guide': {
      const packs = (draft.sourcePacks ?? []).filter(id => id !== playersGuide.id)
      if (action.enabled) packs.push(playersGuide.id)
      return { ...draft, sourcePacks: packs.length ? packs : undefined }
    }
    case 'age-profile': return { ...draft, ageProfile: action.profile }
    case 'chronicle-preset': {
      const { chronicle, tenets, sourcePacks } = action.settings
      return {
        ...draft,
        concept: { ...draft.concept, chronicle },
        relationships: { ...draft.relationships, tenets },
        sourcePacks: sourcePacks.length ? [...sourcePacks] : undefined,
      }
    }
    case 'concept': return { ...draft, concept: { ...draft.concept, ...action.update } }
    case 'relationships': return { ...draft, relationships: { ...draft.relationships, ...action.update } }
    case 'relationship-map': return { ...draft, relationshipMap: action.map.people.length || action.map.connections.length ? action.map : undefined }
    case 'clan-path': return { ...draft, clanPath: { ...draft.clanPath, ...action.update } }
    case 'starting': return { ...draft, starting: { ...draft.starting, ...action.update } }
    case 'advancement': return { ...draft, advancement: action.journal.awards.length || action.journal.purchases.length ? action.journal : undefined }
    default: return { ...draft, traits: editTraits(draft.traits, action) }
  }
}

export function chronicleSettings(draft: CharacterDraft): ChronicleSettings {
  return { chronicle: draft.concept.chronicle, tenets: draft.relationships.tenets, sourcePacks: draft.sourcePacks ?? [] }
}

const conceptFields = [
  { key: 'name', label: 'Character name' },
  { key: 'concept', label: 'Concept' },
  { key: 'ambition', label: 'Ambition' },
  { key: 'desire', label: 'Desire' },
] as const

export function evaluateCharacter(draft: CharacterDraft, { includeCustomText = true } = {}) {
  const ageProfile = draft.ageProfile ?? defaultAgeProfile
  const age = ageProfiles[ageProfile]
  const sourcePacks = draft.sourcePacks ?? []
  const path = evaluateClanPath(draft.clanPath, includeCustomText, age, sourcePacks)
  const { profile, thinBlood } = path
  const traits = evaluateTraitLedger(draft.traits, path.grantedSpecialty)
  const starting = evaluateStartingBuild(draft.starting, draft.traits, traits, path, includeCustomText)
  const unavailablePacks = unavailableSourcePacks(sourcePacks)
  const sourceIssues = [
    ...(unavailablePacks.length ? [unavailableSourceMessage(unavailablePacks)] : []),
    ...(path.sourceUnavailable || starting.entries.some(entry => entry.issue === playersGuideDisabled) ? [playersGuideDisabled] : []),
  ]
  const openChoices: Record<EditStep, OpenChoice[]> = {
    concept: [], traits: [], clan: [], starting: [], relationships: [],
  }
  function add(section: EditStep, message: string, id: string, step = section) {
    openChoices[section].push({ message, target: { step, id } })
  }
  for (const { key, label } of conceptFields) {
    if (!draft.concept[key].trim()) add('concept', `Fill in ${label.toLowerCase()}.`, `concept-${key}`)
  }
  if (traits.attributes.open || traits.attributes.excess) add('traits', 'Complete the Attribute allocation.', 'attributes-heading')
  if (traits.skills.open || traits.skills.excess) add('traits', 'Complete the Skill distribution.', 'skills-heading')
  if (traits.specialties.completed < traits.specialties.total) add('traits', 'Name all eligible starting Specialties.', 'specialties-heading')

  for (const issue of sourceIssues) {
    add('clan', issue, issue === playersGuideDisabled ? 'enable-players-guide' : 'rule-sources', 'concept')
  }
  if (!path.clan) {
    if (draft.clanPath.clan === manualOptionId) {
      add('clan', 'Name the manual clan, add its source or note, and choose three distinct Disciplines.', 'manual-clan')
    } else add('clan', 'Choose a clan.', 'starting-clan')
  } else if (thinBlood) {
    if (path.ageIssue) add('clan', path.ageIssue, 'use-fledgling')
    for (const { message, id } of thinBlood.openChoices) add('clan', message, id)
  } else {
    const missingPower = path.clanSlots.find(slot => !slot.selectedPower)
    const disciplineTarget = path.clanSlots.length < 3
      ? (path.clanSlots.some(slot => slot.rank === 2) ? 'one-dot-discipline' : 'two-dot-discipline')
      : missingPower && `clan-power-${missingPower.discipline}-${missingPower.rank}`
    if (disciplineTarget) add('clan', path.isCaitiff ? 'Assign two distinct starting Disciplines and their powers.' : 'Assign both clan Disciplines and their powers.', disciplineTarget)
    if (profile.predatorAllowed) {
      if (!path.predator) {
        if (path.predatorIssue) add('clan', path.predatorIssue, 'starting-predator')
        else if (draft.clanPath.predatorType === manualOptionId) {
          add('clan', 'Complete the manual Predator Type’s name, source or note, and any grant details.', 'manual-predator')
        } else add('clan', 'Choose a Predator Type.', 'starting-predator')
      } else {
        if (!path.predatorSlot?.selectedPower) {
          const selectedDiscipline = path.predatorDisciplines.some(id => id === draft.clanPath.predatorDiscipline)
          const target = path.predatorSlot ? 'predator-power'
            : selectedDiscipline && disciplineTarget ? disciplineTarget : 'predator-discipline'
          add('clan', 'Choose the granted Discipline and an eligible power.', target)
        }
        if (!path.grantedSpecialty || traits.specialties.predatorGrant?.kind === 'pending') {
          add('clan', 'Resolve the Predator Type’s Specialty or Skill dot.', path.specialtyOption?.custom && !path.grantedSpecialty ? 'predator-specialty-name' : 'predator-specialty')
        }
        for (const choice of path.grantChoices) {
          if (!choice.complete) add('clan', `Complete the ${choice.label} grant.`, `predator-grant-${choice.id}`)
        }
      }
    }
  }

  if (!starting.generation) add('starting', starting.generationIssue ?? 'Choose a Generation.', 'starting-generation')
  if (starting.advantageBudget.remaining !== 0 || starting.advantages.some(option => option.issue)) add('starting', 'Resolve the base Advantage choices and their budget.', 'base-advantages')
  if (starting.flawBudget.remaining !== 0 || starting.flaws.some(option => option.issue)) add('starting', 'Resolve the base Flaw choices and their budget.', 'base-flaws')
  const manualIssue = starting.manualOptions.findIndex(option => option.issue)
  if (manualIssue >= 0) add('starting', 'Resolve incomplete or duplicate manual Advantages and Flaws.', `manual-starting-${manualIssue}`)
  const xpIssue = starting.entries.findIndex(entry => entry.issue)
  if (xpIssue >= 0) add('starting', 'Resolve ineligible XP purchases.', `starting-purchase-${xpIssue}`)
  if (starting.final.remaining > 0) add('starting', 'Spend the remaining starting XP.', 'starting-xp-heading')

  const convictions = draft.relationships.convictions.map(pair => ({ conviction: pair.conviction.trim(), touchstone: pair.touchstone.trim() }))
  const incompletePair = convictions.findIndex(pair => !pair.conviction || !pair.touchstone)
  if (convictions.length < 1 || convictions.length > maxConvictions || incompletePair >= 0) {
    const target = convictions.length < 1 ? 'add-conviction'
      : convictions.length > maxConvictions ? `remove-conviction-${maxConvictions}`
      : `${convictions[incompletePair].conviction ? 'touchstone' : 'conviction'}-${incompletePair}`
    add('relationships', 'Complete one to three Convictions with a Touchstone for each.', target)
  }

  const pending = Object.fromEntries(Object.entries(openChoices).map(([section, choices]) =>
    [section, choices.map(choice => choice.message)])) as Record<EditStep, string[]>
  const creationDraft = Object.values(openChoices).some(issues => issues.length > 0)
  const advancement = draft.advancement && evaluateAdvancement(draft.advancement, starting.final, !creationDraft, includeCustomText)
  const final = advancement?.final ?? starting.final
  function characterTracks(state: typeof final) {
    const base = deriveTracks(state.attributes)
    const resilience = state.powers.includes('resilience') ? state.disciplines.fortitude ?? 0 : 0
    return { ...base, health: {
      ...base.health, resilience, total: base.health.total === undefined ? undefined : base.health.total + resilience,
    } }
  }
  const tracks = characterTracks(starting.final)
  const currentTracks = advancement && !advancement.paused ? characterTracks(final) : tracks
  const effects = bloodEffects[final.bloodPotency]
  const ritual = starting.final.disciplines['blood-sorcery'] ? startingRituals.find(option => option.id === draft.clanPath.ritual) : undefined
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
      ageProfile: age.name,
    },
    relationships: { sire: draft.relationships.sire.trim(), coterie: draft.relationships.coterie.trim(), tenets: draft.relationships.tenets.trim(), convictions },
    tracks: {
      health: currentTracks.health.total, willpower: currentTracks.willpower.total,
      humanity: starting.humanity, bloodPotency: final.bloodPotency, baneSeverity: thinBlood?.curse ? 1 : effects.baneSeverity, bloodSurge: effects.bloodSurge,
    },
    bane: hideClanText ? undefined : thinBlood?.curse?.bane || path.clan?.bane || undefined,
    compulsion: hideClanText ? undefined : path.clan?.compulsion || undefined,
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
      const powers = allDisciplinePowers[id].filter(power => final.powers.includes(power.id)).map(power => power.name)
      return rating > 0 ? [{ name: disciplines[id], rating, powers }] : []
    }),
    ritual,
    ...(sourcePacks.includes(playersGuide.id) ? { sourcePack: playersGuide.name } : {}),
    thinBlood: thinBlood && {
      merits: thinBlood.merits, flaws: thinBlood.flaws, alchemy: thinBlood.alchemy,
      cursedClan: thinBlood.curse?.name,
    },
    reviews: [...path.reviews, ...manualOptions.map(option => includeCustomText
      ? `Manual ${option.kind === 'advantage' ? 'Advantage' : 'Flaw'}: ${option.name} (${option.source}).`
      : `Review a manual ${option.kind} with the Storyteller.`)],
    advantages: advantageIds.flatMap(id => {
      const dots = (final.advantages[id] ?? 0) - starting.grantedAdvantages[id]
      if (!dots) return []
      const base = starting.advantages.find(option => option.id === id && !option.issue)?.dots ?? 0
      const startingDots = (starting.final.advantages[id] ?? 0) - starting.grantedAdvantages[id]
      const sources = [base && 'Base', startingDots > base && 'XP', dots > startingDots && 'Advancement XP'].filter(Boolean)
      return [{ name: startingAdvantages[id].name, dots, source: sources.join(' + ') }]
    }).concat(
      path.advantages.map(({ name, dots }) => ({ name: hidePredatorText ? 'Manual Advantage' : name, dots, source: predatorName ?? 'Predator Type' })),
      manualOptions.filter(option => option.kind === 'advantage').map(({ name, dots }) => ({ name: includeCustomText ? name : 'Manual Advantage', dots, source: 'Manual · Base' })),
    ),
    flaws: [
      ...final.flaws.map(id => ({ ...startingFlaws[id], source: undefined })),
      ...path.flaws.map(({ name, dots }) => ({ name: hidePredatorText ? 'Manual Flaw' : name, dots, source: predatorName })),
      ...path.clanFlaws.map(grant => ({ ...grant, source: thinBlood?.curse ? 'Clan Curse' : path.clan?.name })),
      ...manualOptions.filter(option => option.kind === 'flaw').map(({ name, dots }) => ({ name: includeCustomText ? name : 'Manual Flaw', dots, source: 'Manual · Base' })),
    ],
    advantageDots: starting.totalAdvantageDots + advantageIds.reduce((sum, id) => sum + (final.advantages[id] ?? 0) - (starting.final.advantages[id] ?? 0), 0),
    flawDots: starting.flawBudget.used + [...path.flaws, ...path.clanFlaws].reduce((sum, flaw) => sum + flaw.dots, 0),
    xpSpent: profile.xp - starting.final.remaining,
    xpRemaining: starting.final.remaining,
    purchases: starting.entries.filter(entry => !entry.issue),
    advancement: advancement && {
      earned: advancement.earned, spent: advancement.spent, remaining: advancement.remaining, paused: advancement.paused,
      purchases: advancement.entries.filter(entry => !entry.issue),
      pendingPurchases: advancement.pendingPurchases,
    },
    draft: creationDraft,
  }
  return { ageProfile, path, traits, starting, advancement, tracks, sheet, pending, openChoices, sourceIssues }
}
