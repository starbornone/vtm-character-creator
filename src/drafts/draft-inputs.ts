import { disciplineIds } from '../catalog/clan-path.ts'
import { isSourcePacks } from '../catalog/source-packs.ts'
import { thinBloodFlaws, thinBloodMerits } from '../catalog/thin-blood.ts'
import { advantageIds, flawIds } from '../catalog/starting-options.ts'
import { skillIds } from '../catalog/traits.ts'
import { isXpAward } from '../rules/advancement.ts'
import type { CharacterDraft } from '../rules/character-guide.ts'
import { ageProfileIds, startingGenerations } from '../rules/creation-profiles.ts'
import { endpointKey, isRecordedMapKind, type MapEndpoint } from '../rules/relationship-map.ts'
import { attributeIds, bloodPotencyRatings } from '../rules/starting-xp.ts'
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

function isThinBlood(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.merits) || !Array.isArray(value.flaws)) return false
  const { merits, flaws } = value
  return merits.every(id => thinBloodMerits.some(option => option.id === id)) && new Set(merits).size === merits.length
    && flaws.every(id => thinBloodFlaws.some(option => option.id === id)) && new Set(flaws).size === flaws.length
    && ['curseClan', 'affinity', 'affinityPower', 'method', 'formula'].every(key => value[key] === undefined || isString(value[key]))
}

function isClanPath(value: unknown) {
  if (!isRecord(value) || !strings(value, 'clan', 'twoDotDiscipline', 'oneDotDiscipline', 'predatorType', 'predatorDiscipline', 'predatorSpecialty')) return false
  const { clanPowers, predatorPowers, predatorSpecialtyName, predatorChoices, ritual, manualClan, manualPredator, thinBlood } = value
  return mapOf(clanPowers, slots => mapOf(slots, isString, ['1', '2']), disciplineIds)
    && mapOf(predatorPowers, isString, disciplineIds)
    && (predatorChoices === undefined || mapOf(predatorChoices, choice => mapOf(choice, isInteger)))
    && (predatorSpecialtyName === undefined || isString(predatorSpecialtyName))
    && (ritual === undefined || isString(ritual))
    && (thinBlood === undefined || isThinBlood(thinBlood))
    && (manualClan === undefined || (isRecord(manualClan) && strings(manualClan, 'name', 'source', 'bane', 'compulsion')
      && Array.isArray(manualClan.disciplines) && manualClan.disciplines.every(isString)))
    && (manualPredator === undefined || (isRecord(manualPredator) && strings(manualPredator, 'name', 'source')
      && (manualPredator.advantage === undefined || isDotGrant(manualPredator.advantage))
      && (manualPredator.flaw === undefined || isDotGrant(manualPredator.flaw))
      && (manualPredator.humanityChange === undefined || isInteger(manualPredator.humanityChange))))
}

function isPurchase(value: unknown, advancing = false) {
  if (!isRecord(value)) return false
  switch (value.kind) {
    case 'attribute': return oneOf(value.id, attributeIds) && isInteger(value.to)
    case 'skill': return oneOf(value.id, skillIds) && isInteger(value.to) && (value.specialty === undefined || isString(value.specialty))
    case 'specialty': return oneOf(value.id, skillIds) && isString(value.name)
    case 'discipline': return oneOf(value.id, disciplineIds) && isInteger(value.to) && isString(value.power)
      && (value.caitiffLearning === undefined || (value.to === 1 && value.caitiffLearning === true))
      && (value.outOfClanLearning === undefined || (advancing && value.to === 1 && value.outOfClanLearning === true && value.caitiffLearning === undefined))
    case 'advantage': return oneOf(value.id, advantageIds) && isInteger(value.to)
    case 'blood-potency': return oneOf(value.to, bloodPotencyRatings)
    default: return false
  }
}

function isStarting(value: unknown) {
  return isRecord(value)
    && (value.generation === undefined || oneOf(value.generation, startingGenerations))
    && mapOf(value.advantages, isInteger, advantageIds)
    && Array.isArray(value.flaws) && value.flaws.every(id => oneOf(id, flawIds))
    && Array.isArray(value.purchases) && value.purchases.every(purchase => isPurchase(purchase))
    && (value.manualOptions === undefined || (Array.isArray(value.manualOptions) && value.manualOptions.every(option =>
      isRecord(option) && oneOf(option.kind, ['advantage', 'flaw']) && strings(option, 'name', 'source') && isInteger(option.dots))))
}

function isAdvancement(value: unknown) {
  return isRecord(value) && Array.isArray(value.awards) && value.awards.every(isXpAward)
    && Number.isSafeInteger(value.awards.reduce((sum, award) => sum + award, 0))
    && Array.isArray(value.purchases) && value.purchases.every(purchase => isPurchase(purchase, true))
}

function isMapId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value)
}

function isMapText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isMapEndpoint(value: unknown, people: ReadonlySet<string>): value is MapEndpoint {
  if (!isRecord(value)) return false
  if (value.kind === 'character') return true
  if (value.kind === 'person') return isMapId(value.id) && people.has(value.id)
  return isRecordedMapKind(value.kind) && isMapText(value.name)
}

function isRelationshipMap(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.people) || !Array.isArray(value.connections)) return false
  const people = new Set<string>()
  for (const person of value.people) {
    if (!isRecord(person) || !isMapId(person.id) || !isMapText(person.name) || people.has(person.id)) return false
    people.add(person.id)
  }
  const connections = new Set<string>()
  for (const edge of value.connections) {
    if (!isRecord(edge) || !isMapId(edge.id) || !isMapText(edge.label) || connections.has(edge.id)
      || !isMapEndpoint(edge.from, people) || !isMapEndpoint(edge.to, people) || endpointKey(edge.from) === endpointKey(edge.to)) return false
    connections.add(edge.id)
  }
  return true
}

// Check the stored input shape. The rules evaluator handles unfinished and invalid choices.
export function isCharacterDraft(value: unknown): value is CharacterDraft {
  if (!isRecord(value)) return false
  const { ageProfile, sourcePacks, concept, relationships, relationshipMap, traits, clanPath, starting, advancement } = value
  const selectedProfile = ageProfileIds.find(id => id === ageProfile)
  if (ageProfile !== undefined && !selectedProfile) return false
  if (sourcePacks !== undefined && !isSourcePacks(sourcePacks)) return false
  return isRecord(concept) && strings(concept, 'name', 'concept', 'chronicle', 'embraced', 'ambition', 'desire')
    && isRecord(relationships) && strings(relationships, 'sire', 'coterie', 'tenets')
    && Array.isArray(relationships.convictions) && relationships.convictions.every(pair => isRecord(pair) && strings(pair, 'conviction', 'touchstone'))
    && isRecord(traits) && oneOf(traits.distribution, skillDistributionIds)
    && mapOf(traits.attributes, value => oneOf(value, ratings), attributeIds)
    && mapOf(traits.skills, value => oneOf(value, ratings), skillIds)
    && mapOf(traits.firstDotSpecialties, isString, specialtySkills)
    && isRecord(traits.freeSpecialty) && (traits.freeSpecialty.skill === '' || oneOf(traits.freeSpecialty.skill, skillIds))
    && isString(traits.freeSpecialty.name) && isClanPath(clanPath) && isStarting(starting)
    && (advancement === undefined || isAdvancement(advancement))
    && (relationshipMap === undefined || isRelationshipMap(relationshipMap))
}
