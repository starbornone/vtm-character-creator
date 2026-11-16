import { useRef, useState } from 'react'
import { editCharacter, initialCharacterDraft, type CharacterAction, type GuideStep } from '../rules/character-guide.ts'
import { downloadTextFile } from '../sharing/download-text.ts'
import {
  appendRestoredDraft, browserStorage, draftNameError, loadDraftLibrary, saveDraftLibrary, withSavedDraft,
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
    const id = current.open.id ?? newDraftId()
    saveNamed(current, { ...current.open, id, name: trimmed })
  }

  function switchDraft(id: string | null) {
    const current = latest.current
    if (id === current.open.id) return false
    const open = id === null ? blankDraft : current.library.drafts.find(draft => draft.id === id)
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

  function download() {
    const { open } = latest.current
    const name = open.name || open.character.concept.name.trim() || 'Untitled draft'
    const stem = name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80)
    downloadTextFile(serializeDraftDownload({ name, step: open.step, character: open.character }), `${stem || 'character'}-draft.json`, 'application/json')
  }

  return { ...session, dispatch, goTo, save, switchDraft, download, restore }
}
