import { disciplineIds } from '../catalog/clan-path.ts'
import { advantageIds, flawIds } from '../catalog/starting-options.ts'
import { skillIds } from '../catalog/traits.ts'
import type { CharacterDraft } from '../rules/character-guide.ts'
import { ageProfileIds, ageProfiles, defaultAgeProfile, type AgeProfile } from '../rules/creation-profiles.ts'
import { attributeIds } from '../rules/starting-xp.ts'
import { ratings, skillDistributionIds, specialtySkills } from '../rules/trait-ledger.ts'

type JsonRecord = Record<string, unknown>

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isString = (value: unknown): value is string => typeof value === 'string'
const isInteger = (value: unknown): value is number => Number.isSafeInteger(value)

function oneOf(value: unknown, options: readonly (string | number)[]) {
  return (typeof value === 'string' || typeof value === 'number') && options.includes(value)
}

function strings(value: JsonRecord, ...keys: string[]) {
  return keys.every(key => isString(value[key]))
}

function mapOf(value: unknown, check: (entry: unknown) => boolean, keys?: readonly string[]) {
  return isRecord(value) && Object.entries(value).every(([key, entry]) => (!keys || keys.includes(key)) && check(entry))
}

function isDotGrant(value: unknown) {
  return isRecord(value) && strings(value, 'name') && isInteger(value.dots)
}

function isClanPath(value: unknown) {
  if (!isRecord(value) || !strings(value, 'clan', 'twoDotDiscipline', 'oneDotDiscipline', 'predatorType', 'predatorDiscipline', 'predatorSpecialty')) return false
  const { clanPowers, predatorPowers, predatorSpecialtyName, predatorChoices, ritual, manualClan, manualPredator } = value
  return mapOf(clanPowers, slots => mapOf(slots, isString, ['1', '2']), disciplineIds)
    && mapOf(predatorPowers, isString, disciplineIds)
    && (predatorChoices === undefined || mapOf(predatorChoices, choice => mapOf(choice, isInteger)))
    && (predatorSpecialtyName === undefined || isString(predatorSpecialtyName))
    && (ritual === undefined || isString(ritual))
    && (manualClan === undefined || (isRecord(manualClan) && strings(manualClan, 'name', 'source', 'bane', 'compulsion')
      && Array.isArray(manualClan.disciplines) && manualClan.disciplines.every(isString)))
    && (manualPredator === undefined || (isRecord(manualPredator) && strings(manualPredator, 'name', 'source')
      && (manualPredator.advantage === undefined || isDotGrant(manualPredator.advantage))
      && (manualPredator.flaw === undefined || isDotGrant(manualPredator.flaw))
      && (manualPredator.humanityChange === undefined || isInteger(manualPredator.humanityChange))))
}

function isPurchase(value: unknown) {
  if (!isRecord(value)) return false
  switch (value.kind) {
    case 'attribute': return oneOf(value.id, attributeIds) && isInteger(value.to)
    case 'skill': return oneOf(value.id, skillIds) && isInteger(value.to) && (value.specialty === undefined || isString(value.specialty))
    case 'specialty': return oneOf(value.id, skillIds) && isString(value.name)
    case 'discipline': return oneOf(value.id, disciplineIds) && isInteger(value.to) && isString(value.power)
    case 'advantage': return oneOf(value.id, advantageIds) && isInteger(value.to)
    case 'blood-potency': return oneOf(value.to, [1, 2, 3])
    default: return false
  }
}

function isStarting(value: unknown, profile: AgeProfile) {
  return isRecord(value)
    && (value.generation === undefined || oneOf(value.generation, profile.generations))
    && mapOf(value.advantages, isInteger, advantageIds)
    && Array.isArray(value.flaws) && value.flaws.every(id => oneOf(id, flawIds))
    && Array.isArray(value.purchases) && value.purchases.every(isPurchase)
    && (value.manualOptions === undefined || (Array.isArray(value.manualOptions) && value.manualOptions.every(option =>
      isRecord(option) && oneOf(option.kind, ['advantage', 'flaw']) && strings(option, 'name', 'source') && isInteger(option.dots))))
}

// Check the stored input shape. The rules evaluator handles unfinished and invalid choices.
export function isCharacterDraft(value: unknown): value is CharacterDraft {
  if (!isRecord(value)) return false
  const { ageProfile, concept, relationships, traits, clanPath, starting } = value
  const selectedProfile = ageProfileIds.find(id => id === ageProfile)
  if (ageProfile !== undefined && !selectedProfile) return false
  return isRecord(concept) && strings(concept, 'name', 'concept', 'chronicle', 'embraced', 'ambition', 'desire')
    && isRecord(relationships) && strings(relationships, 'sire', 'coterie', 'tenets')
    && Array.isArray(relationships.convictions) && relationships.convictions.every(pair => isRecord(pair) && strings(pair, 'conviction', 'touchstone'))
    && isRecord(traits) && oneOf(traits.distribution, skillDistributionIds)
    && mapOf(traits.attributes, value => oneOf(value, ratings), attributeIds)
    && mapOf(traits.skills, value => oneOf(value, ratings), skillIds)
    && mapOf(traits.firstDotSpecialties, isString, specialtySkills)
    && isRecord(traits.freeSpecialty) && (traits.freeSpecialty.skill === '' || oneOf(traits.freeSpecialty.skill, skillIds))
    && isString(traits.freeSpecialty.name) && isClanPath(clanPath) && isStarting(starting, ageProfiles[selectedProfile ?? defaultAgeProfile])
}
