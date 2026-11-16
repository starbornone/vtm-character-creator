import { useRef, useState } from 'react'
import { editCharacter, initialCharacterDraft, type CharacterAction, type GuideStep } from '../rules/character-guide.ts'
import {
  browserStorage, draftNameError, loadDraftLibrary, saveDraftLibrary, serializeDraftDownload, withSavedDraft,
  type DraftLibrary, type DraftSnapshot, type NamedDraft,
} from './browser-drafts.ts'

type OpenDraft = DraftSnapshot & { id?: string }

interface DraftSession {
  library: DraftLibrary
  saved: string | null
  open: OpenDraft
  dirty: boolean
  issue?: string
}

const blankDraft: OpenDraft = { name: '', step: 'concept', character: initialCharacterDraft }

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

  function persist(current: DraftSession, library: DraftLibrary, open: OpenDraft, keepOnError = false) {
    const result = saveDraftLibrary(browserStorage, library, current.saved)
    if (result.issue !== undefined) {
      show({ ...current, ...(keepOnError ? { open, dirty: true } : {}), issue: result.issue })
      return false
    }
    show({ library, saved: result.saved, open, dirty: false })
    return true
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
    const id = current.open.id ?? crypto.getRandomValues(new Uint32Array(4)).join('-')
    saveNamed(current, { ...current.open, id, name: trimmed })
  }

  function switchDraft(id: string | null) {
    const current = latest.current
    if (id === current.open.id) return false
    const open = id === null ? blankDraft : current.library.drafts.find(draft => draft.id === id)
    if (!open) return false
    if (current.dirty && !window.confirm('Leave this draft and discard its unsaved changes?')) return false
    // A blank session has no active pointer to clear.
    if (id === null && current.library.activeId === null) {
      show({ ...current, open, dirty: false })
      return true
    }
    return persist(current, { ...current.library, activeId: id }, open)
  }

  function download() {
    const { open } = latest.current
    const name = open.name || open.character.concept.name.trim() || 'Untitled draft'
    const file = new Blob([serializeDraftDownload({ name, step: open.step, character: open.character })], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    const stem = name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80)
    link.href = url
    link.download = `${stem || 'character'}-draft.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return { ...session, dispatch, goTo, save, switchDraft, download }
}
