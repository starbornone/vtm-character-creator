import { domainRatings, domainTraits, type CoterieMember, type CoteriePlan } from '../rules/coterie-plan.ts'
import type { GetStorage } from './browser-drafts.ts'
import { draftRuleset } from './draft-backup.ts'
import { isRecord } from './draft-inputs.ts'

export const coteriePlansKey = 'vtm-character-creator:coterie-plans'
const schemaVersion = 1
const format = 'vtm-character-creator-coterie-plan'

interface SavedPlan { id: string; plan: CoteriePlan }
type Result<T> = { value: T; issue?: never } | { value?: never; issue: string }
interface Library { plans: SavedPlan[]; saved: string | null }

function hasKeys(value: unknown, required: readonly string[], optional?: string): value is Record<string, unknown> {
  return isRecord(value) && required.every(key => Object.hasOwn(value, key))
    && Object.keys(value).every(key => required.includes(key) || key === optional)
}

function isName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isMember(value: unknown): value is CoterieMember {
  if (!hasKeys(value, ['id', 'name'], 'relationships') || !isName(value.id) || !isName(value.name)) return false
  const relationships = value.relationships
  return relationships === undefined || (hasKeys(relationships, ['contacts', 'connections'])
    && Array.isArray(relationships.contacts) && relationships.contacts.every(isName)
    && Array.isArray(relationships.connections) && relationships.connections.every(edge =>
      hasKeys(edge, ['from', 'label', 'to']) && isName(edge.from) && isName(edge.label) && isName(edge.to)))
}

function isPlan(value: unknown): value is CoteriePlan {
  if (!hasKeys(value, ['name', 'purpose', 'domain', 'members']) || !isName(value.name) || typeof value.purpose !== 'string') return false
  const { domain, members } = value
  return hasKeys(domain, ['name', 'notes', ...domainTraits.map(trait => trait.id)])
    && typeof domain.name === 'string' && typeof domain.notes === 'string'
    && domainTraits.every(({ id }) => domainRatings.some(rating => rating === domain[id]))
    && Array.isArray(members) && members.every(isMember) && new Set(members.map(member => member.id)).size === members.length
}

function isSavedPlan(value: unknown): value is SavedPlan {
  return hasKeys(value, ['id', 'plan']) && isName(value.id) && isPlan(value.plan)
}

export function loadCoteriePlans(getStorage: GetStorage): Result<Library> {
  try {
    const saved = getStorage().getItem(coteriePlansKey)
    if (saved === null) return { value: { plans: [], saved } }
    const value: unknown = JSON.parse(saved)
    if (hasKeys(value, ['schemaVersion', 'ruleset', 'plans']) && value.schemaVersion === schemaVersion && value.ruleset === draftRuleset
      && Array.isArray(value.plans) && value.plans.every(isSavedPlan) && new Set(value.plans.map(plan => plan.id)).size === value.plans.length
      && new Set(value.plans.map(({ plan }) => plan.name.trim().toLowerCase())).size === value.plans.length) {
      return { value: { plans: value.plans, saved } }
    }
  } catch {
    return { issue: 'Could not read saved coterie plans. Browser storage was left untouched.' }
  }
  return { issue: 'Saved coterie plans are invalid or use an unsupported version.' }
}

function hasPlanName(plans: readonly SavedPlan[], name: string, id?: string) {
  return plans.some(entry => entry.id !== id && entry.plan.name.trim().toLowerCase() === name.trim().toLowerCase())
}

export function suggestCoterieCopyName(plans: readonly SavedPlan[], original: string) {
  if (!hasPlanName(plans, original)) return original
  let name = `${original} (copy)`
  let number = 2
  while (hasPlanName(plans, name)) name = `${original} (copy ${number++})`
  return name
}

export function saveCoteriePlan(getStorage: GetStorage, library: Library, plan: CoteriePlan, id: string, replace: boolean): Result<Library> {
  const named = { ...plan, name: plan.name.trim() }
  if (!named.name) return { issue: 'Enter a coterie plan name.' }
  if (!isPlan(named) || !isName(id)) return { issue: 'The coterie plan contains invalid fields.' }
  if (hasPlanName(library.plans, named.name, replace ? id : undefined)) return { issue: 'A coterie plan with that name already exists.' }
  const existing = library.plans.some(entry => entry.id === id)
  if (existing !== replace) return { issue: 'Could not identify the plan to save. Reopen the planner and try again.' }
  const entry = { id, plan: named }
  const plans = replace ? library.plans.map(stored => stored.id === id ? entry : stored) : [...library.plans, entry]
  try {
    const storage = getStorage()
    if (storage.getItem(coteriePlansKey) !== library.saved) return { issue: 'Saved coterie plans changed. Download your current handoff before reloading.' }
    const saved = JSON.stringify({ schemaVersion, ruleset: draftRuleset, plans })
    storage.setItem(coteriePlansKey, saved)
    return { value: { plans, saved } }
  } catch {
    return { issue: 'Could not save this plan in your browser. You can still download its handoff.' }
  }
}

export function serializeCoterieHandoff(plan: CoteriePlan) {
  return JSON.stringify({ format, schemaVersion, ruleset: draftRuleset, plan }, null, 2) + '\n'
}

export function readCoterieHandoff(raw: string): Result<CoteriePlan> {
  let value: unknown
  try {
    value = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch {
    return { issue: 'This file is not valid JSON.' }
  }
  if (!hasKeys(value, ['format', 'schemaVersion', 'ruleset', 'plan']) || value.format !== format) return { issue: 'Choose a Coterie and Domain handoff file.' }
  if (value.schemaVersion !== schemaVersion || value.ruleset !== draftRuleset) return { issue: 'This handoff uses an unsupported version or ruleset.' }
  if (!isPlan(value.plan)) return { issue: 'This handoff contains invalid plan details.' }
  return { value: value.plan }
}
