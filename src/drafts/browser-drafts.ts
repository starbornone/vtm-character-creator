import { guideSteps, type CharacterDraft, type GuideStep } from '../rules/character-guide.ts'
import { isCharacterDraft, isRecord } from './draft-inputs.ts'

export const draftLibraryKey = 'vtm-character-creator:drafts'
const schemaVersion = 1
const ruleset = 'vtm-v5'

export interface DraftSnapshot {
  name: string
  step: GuideStep
  character: CharacterDraft
}

export interface NamedDraft extends DraftSnapshot {
  id: string
}

export interface DraftLibrary {
  activeId: string | null
  drafts: NamedDraft[]
}

// Resolve storage inside the read/write try blocks. The browser can throw on property access.
export type GetStorage = () => Pick<Storage, 'getItem' | 'setItem'>

export const browserStorage: GetStorage = () => window.localStorage

const emptyLibrary: DraftLibrary = { activeId: null, drafts: [] }

function isNamedDraft(value: unknown): value is NamedDraft {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0
    && typeof value.name === 'string' && value.name.trim().length > 0
    && guideSteps.some(step => step.id === value.step)
    && isCharacterDraft(value.character)
}

function parseLibrary(raw: string): DraftLibrary | undefined {
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.schemaVersion !== schemaVersion || value.ruleset !== ruleset) return
    const { activeId, drafts } = value
    if (!Array.isArray(drafts) || !drafts.every(isNamedDraft) || new Set(drafts.map(draft => draft.id)).size !== drafts.length) return
    if (activeId !== null && (typeof activeId !== 'string' || !drafts.some(draft => draft.id === activeId))) return
    return { activeId, drafts }
  } catch {
    return undefined
  }
}

export function loadDraftLibrary(getStorage: GetStorage): { library: DraftLibrary; saved: string | null; issue?: string } {
  try {
    const saved = getStorage().getItem(draftLibraryKey)
    if (saved === null) return { library: emptyLibrary, saved }
    const library = parseLibrary(saved)
    if (library) return { library, saved }
    return { library: emptyLibrary, saved: null, issue: 'Saved drafts could not be read. Browser storage was left untouched.' }
  } catch {
    return { library: emptyLibrary, saved: null, issue: 'Could not open browser draft storage.' }
  }
}

export function saveDraftLibrary(getStorage: GetStorage, library: DraftLibrary, previous: string | null): { saved: string; issue?: never } | { saved?: never; issue: string } {
  try {
    const storage = getStorage()
    if (storage.getItem(draftLibraryKey) !== previous) {
      return { issue: 'Browser drafts changed or could not be read. Download your current draft before reloading.' }
    }
    const saved = JSON.stringify({ schemaVersion, ruleset, ...library })
    storage.setItem(draftLibraryKey, saved)
    return { saved }
  } catch {
    return { issue: 'Could not save in this browser. Your changes are still open here. Retry saving or download this draft.' }
  }
}

export function draftNameError(library: DraftLibrary, name: string, id?: string) {
  if (!name) return 'Enter a draft name.'
  if (library.drafts.some(draft => draft.id !== id && draft.name.trim().toLowerCase() === name.toLowerCase())) return 'A draft with that name already exists.'
}

export function withSavedDraft(library: DraftLibrary, draft: NamedDraft): DraftLibrary {
  const exists = library.drafts.some(entry => entry.id === draft.id)
  return { activeId: draft.id, drafts: exists ? library.drafts.map(entry => entry.id === draft.id ? draft : entry) : [...library.drafts, draft] }
}

export function serializeDraftDownload(draft: DraftSnapshot): string {
  return JSON.stringify({ format: 'vtm-character-creator-draft', schemaVersion, ruleset, draft }, null, 2) + '\n'
}
