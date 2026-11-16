import { allDisciplinePowers, caitiffOption, clanChoices, coreClans, predatorChoices, disciplineIds, disciplinePowers, startingRituals, thinBloodOption } from '../catalog/clan-path.ts'
import { isSourcePacks, playersGuide, unavailableSourceMessage, unavailableSourcePacks } from '../catalog/source-packs.ts'
import { alchemyMethods, startingFormulae } from '../catalog/thin-blood.ts'
import { advantageIds, flawIds, startingAdvantages } from '../catalog/starting-options.ts'
import { skillIds } from '../catalog/traits.ts'
import { isCharacterDraft, isRecord } from '../drafts/draft-inputs.ts'
import { draftRuleset } from '../drafts/draft-backup.ts'
import { evaluateClanPath, manualOptionId } from '../rules/clan-path.ts'
import { initialCharacterDraft, type CharacterDraft } from '../rules/character-guide.ts'
import { usesPlayersGuideSelections } from '../rules/creation-sources.ts'
import { ageProfileIds, ageProfiles, defaultAgeProfile, generationForProfile, thinBloodProfile } from '../rules/creation-profiles.ts'
import { attributeIds, type Purchase } from '../rules/starting-xp.ts'
import type { ThinBloodDraft } from '../rules/thin-blood.ts'
import { ratings, skillDistributionIds, specialtySkills } from '../rules/trait-ledger.ts'

export const buildLinkPrefix = '#build='
const legacyVersion = 1
const profiledVersion = 2
const caitiffVersion = 3
const thinBloodVersion = 4
const sourceVersion = 5
const buildVersions = [legacyVersion, profiledVersion, caitiffVersion, thinBloodVersion, sourceVersion]
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

function supportedPurchase(purchase: Purchase, maxDiscipline: number, maxBloodPotency: number, isCaitiff: boolean): Purchase | undefined {
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
      const power = id && allDisciplinePowers[id].find(option => option.id === purchase.power && option.level <= maxDiscipline)
      if (id && power && Number.isInteger(purchase.to) && purchase.to >= 1 && purchase.to <= maxDiscipline) {
        const confirmed = isCaitiff && purchase.to === 1 && purchase.caitiffLearning === true
        return { kind: 'discipline', id, to: purchase.to, power: power.id, ...(confirmed ? { caitiffLearning: true } : {}) }
      }
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

function projectThinBlood(draft: ThinBloodDraft | undefined, path: NonNullable<ReturnType<typeof evaluateClanPath>['thinBlood']>) {
  const hasAlchemy = path.merits.some(({ id }) => id === 'thin-blood-alchemist')
  const hasAffinity = path.merits.some(({ id }) => id === 'discipline-affinity')
  const affinity = hasAffinity ? selectedId(disciplineIds, draft?.affinity) : undefined
  return {
    merits: path.merits.map(({ id }) => id),
    flaws: path.flaws.map(({ id }) => id),
    curseClan: path.flaws.some(({ id }) => id === 'clan-curse') ? coreClans.find(({ id }) => id === draft?.curseClan)?.id : undefined,
    affinity,
    affinityPower: affinity ? disciplinePowers[affinity].find(power => power.id === draft?.affinityPower && power.level === 1)?.id : undefined,
    method: hasAlchemy ? alchemyMethods.find(({ id }) => id === draft?.method)?.id : undefined,
    formula: hasAlchemy ? startingFormulae.find(({ id }) => id === draft?.formula)?.id : undefined,
  }
}

function projectBuild(draft: CharacterDraft) {
  const age = ageProfiles[draft.ageProfile ?? defaultAgeProfile]
  const maxDiscipline = draft.ageProfile === 'ancilla' ? 4 : 3
  // Resolve known catalog IDs for transport even when their pack is turned off in the draft.
  const path = evaluateClanPath(draft.clanPath, true, age, [playersGuide.id])
  const { profile, thinBlood } = path
  const clan = clanChoices.find(option => option.id === path.clan?.id)
  const predator = clan && predatorChoices.find(option => option.id === path.predator?.id)
  const clanPowers: CharacterDraft['clanPath']['clanPowers'] = {}
  if (clan && !thinBlood) for (const slot of path.clanSlots) {
    const power = allDisciplinePowers[slot.discipline].find(option => option.id === slot.selectedId)?.id
    if (power) clanPowers[slot.discipline] = { ...clanPowers[slot.discipline], [slot.rank]: power }
  }
  const predatorSlot = predator ? path.predatorSlot : undefined
  const predatorPower = predatorSlot && allDisciplinePowers[predatorSlot.discipline].find(power => power.id === predatorSlot.selectedId)?.id
  const grants = predator ? Object.fromEntries(path.grantChoices.map(choice => [
    choice.id, Object.fromEntries(choice.rows.filter(row => row.ratings.includes(row.dots)).map(row => [row.id, row.dots])),
  ])) : {}
  const attributes = Object.fromEntries(attributeIds.flatMap(id => ratings.some(rating => rating === draft.traits.attributes[id]) ? [[id, draft.traits.attributes[id]]] : []))
  const skills = Object.fromEntries(skillIds.flatMap(id => ratings.some(rating => rating === draft.traits.skills[id]) ? [[id, draft.traits.skills[id]]] : []))
  const advantages = Object.fromEntries(advantageIds.flatMap(id => {
    const dots = draft.starting.advantages[id]
    return dots !== undefined && startingAdvantages[id].dots.includes(dots) ? [[id, dots]] : []
  }))

  const clanPath = {
    clan: clan?.id ?? '',
    twoDotDiscipline: clan ? path.twoDot ?? '' : '',
    oneDotDiscipline: clan ? path.oneDot ?? '' : '',
    clanPowers,
    predatorType: predator?.id ?? '',
    predatorDiscipline: predator ? selectedId(path.predatorDisciplines, draft.clanPath.predatorDiscipline) ?? '' : '',
    predatorSpecialty: predator?.specialties.find(option => option.skill === draft.clanPath.predatorSpecialty)?.skill ?? '',
    predatorPowers: predatorSlot && predatorPower ? { [predatorSlot.discipline]: predatorPower } : {},
    predatorChoices: grants,
    ritual: !thinBlood || thinBlood.affinity?.discipline === 'blood-sorcery'
      ? startingRituals.find(option => option.id === draft.clanPath.ritual)?.id ?? '' : '',
    thinBlood: thinBlood ? projectThinBlood(draft.clanPath.thinBlood, thinBlood) : undefined,
  }
  const purchases = profile.xp > 0
    ? draft.starting.purchases.flatMap(purchase => supportedPurchase(purchase, maxDiscipline, profile.maxBloodPotency, path.isCaitiff) ?? []) : []
  const sourcePacks = draft.sourcePacks ?? (usesPlayersGuideSelections(clanPath, purchases) ? [] : undefined)

  // Every exported value is a catalog ID, a bounded rating, or an enum.
  return {
    ageProfile: draft.ageProfile === defaultAgeProfile ? undefined : draft.ageProfile,
    sourcePacks,
    traits: {
      distribution: selectedId(skillDistributionIds, draft.traits.distribution) ?? initialCharacterDraft.traits.distribution,
      attributes, skills, freeSpecialtySkill: selectedId(skillIds, draft.traits.freeSpecialty.skill) ?? '',
    },
    clanPath,
    starting: {
      generation: generationForProfile(profile, draft.starting.generation),
      advantages, flaws: flawIds.filter(id => draft.starting.flaws.includes(id)),
      purchases,
    },
  }
}

function formatVersion(clanId: unknown, ageProfile: unknown, sourcePacks: unknown) {
  if (sourcePacks !== undefined) return sourceVersion
  if (clanId === thinBloodOption.id) return thinBloodVersion
  if (clanId === caitiffOption.id) return caitiffVersion
  return ageProfile === undefined ? legacyVersion : profiledVersion
}

export function encodeBuildLink(draft: CharacterDraft) {
  const profile = draft.clanPath.clan === thinBloodOption.id ? thinBloodProfile : ageProfiles[draft.ageProfile ?? defaultAgeProfile]
  const omitted: Omission[] = []
  if (draft.clanPath.clan === manualOptionId) omitted.push('manual-clan')
  if (profile.predatorAllowed && draft.clanPath.predatorType === manualOptionId) omitted.push('manual-predator')
  if (draft.traits.freeSpecialty.name.trim() || Object.values(draft.traits.firstDotSpecialties).some(name => name?.trim())
    || (profile.predatorAllowed && draft.clanPath.predatorSpecialtyName?.trim())) omitted.push('specialty-names')
  if (draft.starting.manualOptions?.length) omitted.push('manual-options')
  if (profile.xp > 0 && draft.starting.purchases.some(purchase => purchase.kind === 'specialty' ||
    (purchase.kind === 'skill' && purchase.to === 1 && specialtySkills.some(skill => skill === purchase.id)))) omitted.push('specialty-purchases')

  const mechanics = projectBuild(draft)
  const version = formatVersion(mechanics.clanPath.clan, mechanics.ageProfile, mechanics.sourcePacks)
  const payload = { version, ruleset: draftRuleset, mechanics, omitted }
  const token = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  return token.length <= maxTokenLength ? buildLinkPrefix + token : undefined
}

export function decodeBuildLink(hash: string): { draft: CharacterDraft; omitted: Omission[]; issue?: never } | { issue: string; unavailableSources?: string[] } {
  const token = hash.startsWith(buildLinkPrefix) ? hash.slice(buildLinkPrefix.length) : ''
  const invalid = { issue: 'This build link is incomplete or invalid.' }
  if (token.length > maxTokenLength || !/^[A-Za-z0-9_-]+$/.test(token)) return invalid
  try {
    const value: unknown = JSON.parse(atob(token.replaceAll('-', '+').replaceAll('_', '/')))
    if (!isRecord(value) || !isRecord(value.mechanics) || !Array.isArray(value.omitted) || Object.keys(value).length !== 4) return invalid
    if (!buildVersions.some(version => version === value.version) || value.ruleset !== draftRuleset) return { issue: 'This build link uses an unsupported version or ruleset.' }
    const { ageProfile, sourcePacks, traits, clanPath, starting } = value.mechanics
    if (!isRecord(traits) || !isRecord(clanPath)) return invalid
    if (ageProfile !== undefined && !ageProfileIds.some(id => id !== defaultAgeProfile && id === ageProfile)) return invalid
    if (value.version !== formatVersion(clanPath.clan, ageProfile, sourcePacks)) return invalid
    if (sourcePacks !== undefined) {
      if (!isSourcePacks(sourcePacks)) return invalid
      const unavailable = unavailableSourcePacks(sourcePacks)
      if (unavailable.length) return { issue: unavailableSourceMessage(unavailable), unavailableSources: unavailable }
    }
    const draft: unknown = {
      ...(ageProfile ? { ageProfile } : {}),
      ...(sourcePacks === undefined ? {} : { sourcePacks }),
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
