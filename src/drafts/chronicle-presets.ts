import { isSourcePacks, playersGuide } from '../catalog/source-packs.ts'
import type { ChronicleSettings } from '../rules/character-guide.ts'
import type { GetStorage } from './browser-drafts.ts'
import { draftRuleset } from './draft-backup.ts'
import { isRecord } from './draft-inputs.ts'

export const chroniclePresetsKey = 'vtm-character-creator:chronicle-presets'
const schemaVersion = 1

export interface ChroniclePreset extends ChronicleSettings {
  name: string
}

type PresetResult = { presets: ChroniclePreset[]; issue?: never } | { presets?: never; issue: string }

function isChroniclePreset(value: unknown): value is ChroniclePreset {
  return isRecord(value) && typeof value.name === 'string' && Boolean(value.name) && value.name === value.name.trim()
    && typeof value.chronicle === 'string' && typeof value.tenets === 'string' && isSourcePacks(value.sourcePacks)
}

export function loadChroniclePresets(getStorage: GetStorage): PresetResult {
  try {
    const raw = getStorage().getItem(chroniclePresetsKey)
    if (raw === null) return { presets: [] }
    const value: unknown = JSON.parse(raw)
    if (isRecord(value) && value.schemaVersion === schemaVersion && value.ruleset === draftRuleset
      && Array.isArray(value.presets) && value.presets.every(isChroniclePreset)
      && new Set(value.presets.map(preset => preset.name.toLowerCase())).size === value.presets.length) {
      return { presets: value.presets }
    }
  } catch {
    return { issue: 'Could not read chronicle presets in this browser.' }
  }
  return { issue: 'Saved chronicle presets are invalid or use an unsupported version.' }
}

export function saveChroniclePreset(getStorage: GetStorage, name: string, settings: ChronicleSettings): PresetResult {
  const preset = { ...settings, name: name.trim() }
  if (!preset.name) return { issue: 'Enter a preset name.' }
  // Read the current list at save time so a preset saved elsewhere is kept.
  const current = loadChroniclePresets(getStorage)
  if (!current.presets) return current
  if (current.presets.some(saved => saved.name.toLowerCase() === preset.name.toLowerCase())) {
    return { issue: 'A chronicle preset with that name already exists.' }
  }
  const presets = [...current.presets, preset]
  try {
    getStorage().setItem(chroniclePresetsKey, JSON.stringify({ schemaVersion, ruleset: draftRuleset, presets }))
    return { presets }
  } catch {
    return { issue: 'Could not save this chronicle preset. Retry when browser storage is available.' }
  }
}

function sourceNames(sourcePacks: readonly string[]) {
  return ['Core', ...sourcePacks.map(id => id === playersGuide.id ? playersGuide.name : id)].join(', ')
}

export function chroniclePresetChanges(current: ChronicleSettings, preset: ChronicleSettings) {
  const changes = [
    { field: 'Chronicle', before: current.chronicle, after: preset.chronicle },
    { field: 'Chronicle Tenets', before: current.tenets, after: preset.tenets },
  ].filter(change => change.before !== change.after)
  const sourcesChanged = current.sourcePacks.length !== preset.sourcePacks.length
    || current.sourcePacks.some(id => !preset.sourcePacks.includes(id))
  if (sourcesChanged) changes.push({ field: 'Rule sources', before: sourceNames(current.sourcePacks), after: sourceNames(preset.sourcePacks) })
  return changes
}
