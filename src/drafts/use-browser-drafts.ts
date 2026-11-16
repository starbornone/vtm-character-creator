import { useRef, useState } from 'react'
import { editCharacter, initialCharacterDraft, type CharacterAction, type GuideStep } from '../rules/character-guide.ts'
import { downloadTextFile } from '../sharing/download-text.ts'
import {
  activeDrafts, appendRestoredDraft, archiveSavedDraft, browserStorage, draftNameError, loadDraftLibrary, reopenArchivedDraft, saveDraftLibrary, withSavedDraft,
  type DraftLibrary, type NamedDraft,
} from './browser-drafts.ts'
import { serializeDraftDownload, type DraftSnapshot } from './draft-backup.ts'

type OpenDraft = DraftSnapshot & { id?: string }

interface DraftSession {
  library: DraftLibrary
  saved: string | null
  open: OpenDraft
  dirty: boolean
  issue?: string
}

const blankDraft: OpenDraft = { name: '', step: 'concept', character: initialCharacterDraft }
const newDraftId = () => crypto.getRandomValues(new Uint32Array(4)).join('-')
const canLeaveDraft = (session: DraftSession) => !session.dirty || window.confirm('Leave this draft and discard its unsaved changes?')

function startSession(): DraftSession {
  const result = loadDraftLibrary(browserStorage)
  const open = result.library.drafts.find(draft => draft.id === result.library.activeId) ?? blankDraft
  return { ...result, open, dirty: false }
}

export function useBrowserDrafts() {
  const [session, setSession] = useState(startSession)
  // Event handlers work from the latest snapshot even if React batches renders.
  const latest = useRef(session)

  function show(next: DraftSession) {
    latest.current = next
    setSession(next)
  }

  function writeLibrary(current: DraftSession, library: DraftLibrary, open?: OpenDraft) {
    const result = saveDraftLibrary(browserStorage, library, current.saved)
    if (result.issue !== undefined) return result.issue
    show(open ? { library, saved: result.saved, open, dirty: false } : { ...current, library, saved: result.saved })
  }

  function persist(current: DraftSession, library: DraftLibrary, open: OpenDraft, keepOnError = false) {
    const issue = writeLibrary(current, library, open)
    if (issue === undefined) return true
    show({ ...current, ...(keepOnError ? { open, dirty: true } : {}), issue })
    return false
  }

  function saveNamed(current: DraftSession, open: NamedDraft) {
    return persist(current, withSavedDraft(current.library, open), open, true)
  }

  function editOpen(update: Partial<Pick<OpenDraft, 'step' | 'character'>>) {
    const current = latest.current
    const open = { ...current.open, ...update }
    if (open.id) saveNamed(current, { ...open, id: open.id })
    else show({ ...current, open, dirty: current.dirty || update.character !== undefined })
  }

  function dispatch(action: CharacterAction) {
    editOpen({ character: editCharacter(latest.current.open.character, action) })
  }

  function goTo(step: GuideStep) {
    if (step !== latest.current.open.step) editOpen({ step })
  }

  function save(name: string) {
    const current = latest.current
    const trimmed = name.trim()
    const issue = draftNameError(current.library, trimmed, current.open.id)
    if (issue) return issue
    const id = current.open.id ?? newDraftId()
    saveNamed(current, { ...current.open, id, name: trimmed })
  }

  function switchDraft(id: string | null) {
    const current = latest.current
    if (id === current.open.id) return false
    const open = id === null ? blankDraft : activeDrafts(current.library).find(draft => draft.id === id)
    if (!open) return false
    if (!canLeaveDraft(current)) return false
    // A blank session has no active pointer to clear.
    if (id === null && current.library.activeId === null) {
      show({ ...current, open, dirty: false })
      return true
    }
    return persist(current, { ...current.library, activeId: id }, open)
  }

  function restore(snapshot: DraftSnapshot): { restored: boolean; issue?: string } {
    const current = latest.current
    const copy = appendRestoredDraft(current.library, snapshot, newDraftId())
    if (!copy.draft) return { restored: false, issue: copy.issue }
    if (!canLeaveDraft(current)) return { restored: false }
    const restored = persist(current, copy.library, copy.draft)
    return restored ? { restored } : { restored, issue: latest.current.issue }
  }

  function duplicate(name: string) {
    const current = latest.current
    if (!current.library.drafts.some(draft => draft.id === current.open.id)) return 'Save the current draft before duplicating it.'
    const copy = appendRestoredDraft(current.library, { ...current.open, name }, newDraftId())
    if (!copy.draft) return copy.issue
    return writeLibrary(current, copy.library, copy.draft)
  }

  function archive(id: string) {
    const current = latest.current
    const isOpen = current.open.id === id
    const draft = isOpen ? { ...current.open, id } : current.library.drafts.find(entry => entry.id === id)
    const library = draft && archiveSavedDraft(current.library, draft)
    if (!draft || !library) return { changed: false, issue: 'This draft is no longer available to archive.' }
    const issue = draftNameError(current.library, draft.name, id) ?? writeLibrary(current, library, isOpen ? blankDraft : undefined)
    return { changed: issue === undefined, issue }
  }

  function reopen(id: string) {
    const current = latest.current
    const reopened = reopenArchivedDraft(current.library, id)
    if (!reopened) return { changed: false, issue: 'This draft is no longer in the archive.' }
    if (!canLeaveDraft(current)) return { changed: false }
    const issue = writeLibrary(current, reopened.library, reopened.draft)
    return { changed: issue === undefined, issue }
  }

  function download() {
    const { open } = latest.current
    const name = open.name || open.character.concept.name.trim() || 'Untitled draft'
    const stem = name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80)
    downloadTextFile(serializeDraftDownload({ name, step: open.step, character: open.character }), `${stem || 'character'}-draft.json`, 'application/json')
  }

  return { ...session, dispatch, goTo, save, switchDraft, download, restore, duplicate, archive, reopen }
}
