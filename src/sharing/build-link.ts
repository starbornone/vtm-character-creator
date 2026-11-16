import { coreClans, corePredators, disciplineIds, disciplinePowers, startingRituals } from '../catalog/clan-path.ts'
import { advantageIds, flawIds, startingAdvantages } from '../catalog/starting-options.ts'
import { skillIds } from '../catalog/traits.ts'
import { isCharacterDraft, isRecord } from '../drafts/draft-inputs.ts'
import { draftRuleset } from '../drafts/draft-backup.ts'
import { evaluateClanPath, manualOptionId } from '../rules/clan-path.ts'
import { initialCharacterDraft, type CharacterDraft } from '../rules/character-guide.ts'
import { ageProfileIds, ageProfiles, defaultAgeProfile, generationForProfile } from '../rules/creation-profiles.ts'
import { attributeIds, type Purchase } from '../rules/starting-xp.ts'
import { ratings, skillDistributionIds, specialtySkills } from '../rules/trait-ledger.ts'

export const buildLinkPrefix = '#build='
const legacyVersion = 1
const profiledVersion = 2
const maxTokenLength = 12000

export const omittedChoices = {
  'manual-clan': 'Choose a clan or re-enter the manual clan.',
  'manual-predator': 'Choose a Predator Type or re-enter the manual Predator Type.',
  'specialty-names': 'Supply the free-text Specialty names.',
  'manual-options': 'Re-enter the manual Advantages and Flaws.',
  'specialty-purchases': 'Re-enter starting XP purchases that require a Specialty name.',
} as const

type Omission = keyof typeof omittedChoices
const omissionIds = Object.keys(omittedChoices) as Omission[]

function selectedId<Id extends string>(ids: readonly Id[], value: unknown) {
  return ids.find(id => id === value)
}

function supportedPurchase(purchase: Purchase, maxDiscipline: number, maxBloodPotency: number): Purchase | undefined {
  switch (purchase.kind) {
    case 'attribute': {
      const id = selectedId(attributeIds, purchase.id)
      if (id && Number.isInteger(purchase.to) && purchase.to >= 2 && purchase.to <= 5) return { kind: 'attribute', id, to: purchase.to }
      break
    }
    case 'skill': {
      const id = selectedId(skillIds, purchase.id)
      if (id && Number.isInteger(purchase.to) && purchase.to >= 1 && purchase.to <= 5
        && !(purchase.to === 1 && specialtySkills.some(skill => skill === id))) return { kind: 'skill', id, to: purchase.to }
      break
    }
    case 'discipline': {
      const id = selectedId(disciplineIds, purchase.id)
      const power = id && disciplinePowers[id].find(option => option.id === purchase.power && option.level <= maxDiscipline)
      if (id && power && Number.isInteger(purchase.to) && purchase.to >= 1 && purchase.to <= maxDiscipline) return { kind: 'discipline', id, to: purchase.to, power: power.id }
      break
    }
    case 'advantage': {
      const id = selectedId(advantageIds, purchase.id)
      if (id && startingAdvantages[id].dots.includes(purchase.to)) return { kind: 'advantage', id, to: purchase.to }
      break
    }
    case 'blood-potency':
      if (purchase.to >= 2 && purchase.to <= maxBloodPotency) return { kind: 'blood-potency', to: purchase.to }
  }
}

function projectBuild(draft: CharacterDraft) {
  const profile = ageProfiles[draft.ageProfile ?? defaultAgeProfile]
  const maxDiscipline = draft.ageProfile === 'ancilla' ? 4 : 3
  const path = evaluateClanPath(draft.clanPath, true, profile)
  const clan = coreClans.find(option => option.id === path.clan?.id)
  const predator = clan && corePredators.find(option => option.id === path.predator?.id)
  const clanPowers: CharacterDraft['clanPath']['clanPowers'] = {}
  if (clan) for (const slot of path.clanSlots) {
    const power = disciplinePowers[slot.discipline].find(option => option.id === slot.selectedId)?.id
    if (power) clanPowers[slot.discipline] = { ...clanPowers[slot.discipline], [slot.rank]: power }
  }
  const predatorSlot = predator ? path.predatorSlot : undefined
  const predatorPower = predatorSlot && disciplinePowers[predatorSlot.discipline].find(power => power.id === predatorSlot.selectedId)?.id
  const predatorChoices = predator ? Object.fromEntries(path.grantChoices.map(choice => [
    choice.id, Object.fromEntries(choice.rows.filter(row => row.ratings.includes(row.dots)).map(row => [row.id, row.dots])),
  ])) : {}
  const attributes = Object.fromEntries(attributeIds.flatMap(id => ratings.some(rating => rating === draft.traits.attributes[id]) ? [[id, draft.traits.attributes[id]]] : []))
  const skills = Object.fromEntries(skillIds.flatMap(id => ratings.some(rating => rating === draft.traits.skills[id]) ? [[id, draft.traits.skills[id]]] : []))
  const advantages = Object.fromEntries(advantageIds.flatMap(id => {
    const dots = draft.starting.advantages[id]
    return dots !== undefined && startingAdvantages[id].dots.includes(dots) ? [[id, dots]] : []
  }))

  // Every exported value is a catalog ID, a bounded rating, or an enum.
  return {
    ageProfile: draft.ageProfile === defaultAgeProfile ? undefined : draft.ageProfile,
    traits: {
      distribution: selectedId(skillDistributionIds, draft.traits.distribution) ?? initialCharacterDraft.traits.distribution,
      attributes, skills, freeSpecialtySkill: selectedId(skillIds, draft.traits.freeSpecialty.skill) ?? '',
    },
    clanPath: {
      clan: clan?.id ?? '',
      twoDotDiscipline: clan ? path.twoDot ?? '' : '',
      oneDotDiscipline: clan ? path.oneDot ?? '' : '',
      clanPowers,
      predatorType: predator?.id ?? '',
      predatorDiscipline: predator ? selectedId(path.predatorDisciplines, draft.clanPath.predatorDiscipline) ?? '' : '',
      predatorSpecialty: predator?.specialties.find(option => option.skill === draft.clanPath.predatorSpecialty)?.skill ?? '',
      predatorPowers: predatorSlot && predatorPower ? { [predatorSlot.discipline]: predatorPower } : {},
      predatorChoices,
      ritual: startingRituals.find(option => option.id === draft.clanPath.ritual)?.id ?? '',
    },
    starting: {
      generation: generationForProfile(profile, draft.starting.generation),
      advantages, flaws: flawIds.filter(id => draft.starting.flaws.includes(id)),
      purchases: profile.xp > 0 ? draft.starting.purchases.flatMap(purchase => supportedPurchase(purchase, maxDiscipline, profile.maxBloodPotency) ?? []) : [],
    },
  }
}

export function encodeBuildLink(draft: CharacterDraft) {
  const profile = ageProfiles[draft.ageProfile ?? defaultAgeProfile]
  const omitted: Omission[] = []
  if (draft.clanPath.clan === manualOptionId) omitted.push('manual-clan')
  if (profile.predatorAllowed && draft.clanPath.predatorType === manualOptionId) omitted.push('manual-predator')
  if (draft.traits.freeSpecialty.name.trim() || Object.values(draft.traits.firstDotSpecialties).some(name => name?.trim())
    || (profile.predatorAllowed && draft.clanPath.predatorSpecialtyName?.trim())) omitted.push('specialty-names')
  if (draft.starting.manualOptions?.length) omitted.push('manual-options')
  if (profile.xp > 0 && draft.starting.purchases.some(purchase => purchase.kind === 'specialty' ||
    (purchase.kind === 'skill' && purchase.to === 1 && specialtySkills.some(skill => skill === purchase.id)))) omitted.push('specialty-purchases')

  const mechanics = projectBuild(draft)
  const version = mechanics.ageProfile ? profiledVersion : legacyVersion
  const payload = { version, ruleset: draftRuleset, mechanics, omitted }
  const token = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  return token.length <= maxTokenLength ? buildLinkPrefix + token : undefined
}

export function decodeBuildLink(hash: string): { draft: CharacterDraft; omitted: Omission[]; issue?: never } | { issue: string } {
  const token = hash.startsWith(buildLinkPrefix) ? hash.slice(buildLinkPrefix.length) : ''
  const invalid = { issue: 'This build link is incomplete or invalid.' }
  if (token.length > maxTokenLength || !/^[A-Za-z0-9_-]+$/.test(token)) return invalid
  try {
    const value: unknown = JSON.parse(atob(token.replaceAll('-', '+').replaceAll('_', '/')))
    if (!isRecord(value) || !isRecord(value.mechanics) || !Array.isArray(value.omitted) || Object.keys(value).length !== 4) return invalid
    if ((value.version !== legacyVersion && value.version !== profiledVersion) || value.ruleset !== draftRuleset) return { issue: 'This build link uses an unsupported version or ruleset.' }
    const { ageProfile, traits, clanPath, starting } = value.mechanics
    if (value.version === legacyVersion ? ageProfile !== undefined : !ageProfileIds.some(id => id !== defaultAgeProfile && id === ageProfile)) return invalid
    if (!isRecord(traits)) return invalid
    const draft: unknown = {
      ...(ageProfile ? { ageProfile } : {}),
      concept: initialCharacterDraft.concept,
      relationships: initialCharacterDraft.relationships,
      traits: {
        attributes: traits.attributes, skills: traits.skills, distribution: traits.distribution,
        freeSpecialty: { skill: traits.freeSpecialtySkill, name: '' }, firstDotSpecialties: {},
      },
      clanPath, starting,
    }
    if (!isCharacterDraft(draft)) return invalid
    // Require the projected mechanics to match the payload, including absence of free-text fields.
    if (JSON.stringify(projectBuild(draft)) !== JSON.stringify(value.mechanics)) return invalid
    const flags: unknown[] = value.omitted
    const omitted = omissionIds.filter(id => flags.includes(id))
    if (omitted.length !== flags.length) return invalid
    return { draft, omitted }
  } catch {
    return invalid
  }
}
