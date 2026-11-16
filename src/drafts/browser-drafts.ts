import { draftRuleset, draftSchemaVersionFor, isDraftSnapshot, type DraftSnapshot } from './draft-backup.ts'
import { isRecord } from './draft-inputs.ts'

export const draftLibraryKey = 'vtm-character-creator:drafts'

export interface NamedDraft extends DraftSnapshot {
  id: string
}

export interface DraftLibrary {
  activeId: string | null
  drafts: NamedDraft[]
  archivedIds?: string[]
}

// Resolve storage inside the read/write try blocks. The browser can throw on property access.
export type GetStorage = () => Pick<Storage, 'getItem' | 'setItem'>

export const browserStorage: GetStorage = () => window.localStorage

const emptyLibrary: DraftLibrary = { activeId: null, drafts: [] }

function isNamedDraft(value: unknown): value is NamedDraft {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 && isDraftSnapshot(value)
}

function parseLibrary(raw: string): DraftLibrary | undefined {
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.ruleset !== draftRuleset) return
    const { activeId, drafts, archivedIds } = value
    if (!Array.isArray(drafts) || !drafts.every(isNamedDraft)) return
    const draftIds = new Set(drafts.map(draft => draft.id))
    if (draftIds.size !== drafts.length) return
    if (value.schemaVersion !== draftSchemaVersionFor(drafts)) return
    if (activeId !== null && (typeof activeId !== 'string' || !draftIds.has(activeId))) return
    if (archivedIds === undefined) return { activeId, drafts }
    if (!Array.isArray(archivedIds) || !archivedIds.every((id): id is string => typeof id === 'string' && draftIds.has(id))
      || new Set(archivedIds).size !== archivedIds.length
      || (activeId !== null && archivedIds.includes(activeId))) return
    return { activeId, drafts, archivedIds }
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
    const saved = JSON.stringify({ schemaVersion: draftSchemaVersionFor(library.drafts), ruleset: draftRuleset, ...library })
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
  return { ...library, activeId: draft.id, drafts: exists ? library.drafts.map(entry => entry.id === draft.id ? draft : entry) : [...library.drafts, draft] }
}

export function activeDrafts(library: DraftLibrary) {
  return library.drafts.filter(draft => !library.archivedIds?.includes(draft.id))
}

export function archiveSavedDraft(library: DraftLibrary, draft: NamedDraft): DraftLibrary | undefined {
  if (library.archivedIds?.includes(draft.id) || !library.drafts.some(entry => entry.id === draft.id)) return
  return {
    activeId: library.activeId === draft.id ? null : library.activeId,
    drafts: library.drafts.map(entry => entry.id === draft.id ? draft : entry),
    archivedIds: [...(library.archivedIds ?? []), draft.id],
  }
}

export function reopenArchivedDraft(library: DraftLibrary, id: string) {
  const draft = library.drafts.find(entry => entry.id === id)
  if (!draft || !library.archivedIds?.includes(id)) return
  const remaining = library.archivedIds.filter(archivedId => archivedId !== id)
  return { draft, library: { ...library, activeId: id, archivedIds: remaining.length ? remaining : undefined } }
}

export function suggestRestoreName(library: DraftLibrary, original: string) {
  if (!draftNameError(library, original)) return original
  return suggestCopyName(library, original)
}

export function suggestCopyName(library: DraftLibrary, original: string) {
  let copy = `${original} (copy)`
  let number = 2
  while (draftNameError(library, copy)) copy = `${original} (copy ${number++})`
  return copy
}

export function appendRestoredDraft(library: DraftLibrary, snapshot: DraftSnapshot, id: string) {
  const name = snapshot.name.trim()
  const issue = draftNameError(library, name)
  if (issue) return { issue }
  if (library.drafts.some(draft => draft.id === id)) return { issue: 'Could not assign a fresh draft ID. Try again.' }
  const draft: NamedDraft = { name, step: snapshot.step, character: snapshot.character, id }
  return { draft, library: { ...library, activeId: id, drafts: [...library.drafts, draft] } }
}
