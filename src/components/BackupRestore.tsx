import { useRef, useState, type ChangeEvent } from 'react'
import { suggestRestoreName, type DraftLibrary } from '@/drafts/browser-drafts'
import { readDraftBackup, type DraftSnapshot } from '@/drafts/draft-backup'
import { evaluateCharacter, guideSteps } from '@/rules/character-guide'

interface BackupRestoreProps {
  library: DraftLibrary
  onRestore: (draft: DraftSnapshot) => { restored: boolean; issue?: string }
}

type Selection =
  | { status: 'reading' }
  | { status: 'error' | 'unavailable'; issue: string }
  | { status: 'preview'; draft: DraftSnapshot; name: string; issue?: string }

function focusPreview(heading: HTMLHeadingElement | null) {
  heading?.focus()
}

export function BackupRestore({ library, onRestore }: BackupRestoreProps) {
  const [selection, setSelection] = useState<Selection>()
  const request = useRef(0)
  const chooser = useRef<HTMLInputElement>(null)

  function cancel() {
    request.current++
    setSelection(undefined)
    chooser.current?.focus()
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    // Allow the same file to be chosen again after a rejection or cancel.
    event.currentTarget.value = ''
    if (!file) return
    const current = ++request.current
    setSelection({ status: 'reading' })
    try {
      const result = readDraftBackup(await file.text())
      if (current !== request.current) return
      if (result.issue !== undefined) setSelection({ status: result.unavailableSources ? 'unavailable' : 'error', issue: result.issue })
      else setSelection({ status: 'preview', draft: result.draft, name: suggestRestoreName(library, result.draft.name) })
    } catch {
      if (current === request.current) setSelection({ status: 'error', issue: 'Could not read this backup file. Choose it again to retry.' })
    }
  }

  function restore() {
    if (selection?.status !== 'preview') return
    const result = onRestore({ ...selection.draft, name: selection.name })
    if (result.restored) setSelection(undefined)
    else setSelection({ ...selection, issue: result.issue })
  }

  return (
    <>
      <label className="guide-button cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rose-300">
        Choose JSON backup
        <input ref={chooser} type="file" accept=".json,application/json" className="sr-only" onChange={chooseFile} />
      </label>
      {selection?.status === 'reading' && (
        <div className="flex w-full items-center gap-3">
          <p role="status" className="text-sm text-muted-foreground">Reading backup…</p>
          <button type="button" className="guide-button" onClick={cancel}>Cancel restore</button>
        </div>
      )}
      {selection?.status === 'error' && <p role="alert" className="w-full text-sm text-rose-300">{selection.issue}</p>}
      {selection?.status === 'unavailable' && (
        <section aria-labelledby="unavailable-backup-heading" className="w-full space-y-3 rounded-lg border border-border p-3 sm:p-4">
          <h3 ref={focusPreview} tabIndex={-1} id="unavailable-backup-heading" className="font-semibold">Backup preview</h3>
          <p role="alert" className="break-words text-sm text-rose-300">{selection.issue}</p>
          <button type="button" className="guide-button" onClick={cancel}>Cancel restore</button>
        </section>
      )}
      {selection?.status === 'preview' && (
        <section aria-labelledby="backup-preview-heading" className="w-full min-w-0 space-y-3 rounded-lg border border-border p-3 sm:p-4">
          <h3 ref={focusPreview} tabIndex={-1} id="backup-preview-heading" className="font-semibold">Backup preview</h3>
          <BackupSummary draft={selection.draft} />
          <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
            event.preventDefault()
            restore()
          }}>
            <label className="grid min-w-40 flex-1 gap-1 text-sm">
              New draft name
              <input className="ledger-field w-full" value={selection.name} onChange={event => {
                setSelection({ ...selection, name: event.target.value, issue: undefined })
              }} />
            </label>
            <button type="submit" className="guide-button guide-button-primary">Restore as new draft</button>
            <button type="button" className="guide-button" onClick={cancel}>Cancel restore</button>
            {selection.issue && <p role="alert" className="w-full text-sm text-rose-300">{selection.issue}</p>}
          </form>
        </section>
      )}
    </>
  )
}

function BackupSummary({ draft }: { draft: DraftSnapshot }) {
  const { sheet, pending, sourceIssues } = evaluateCharacter(draft.character)
  const step = guideSteps.find(option => option.id === draft.step)
  const openSteps = guideSteps.filter(option => option.id !== 'review' && pending[option.id].length > 0)
  const details = [
    ['Backup name', draft.name],
    ['Character', sheet.identity.name || 'Unnamed character'],
    ['Concept', sheet.identity.concept],
    ['Age profile', sheet.identity.ageProfile],
    ['Clan', sheet.identity.clan],
    ['Predator Type', sheet.identity.predator],
    ['Source pack', sheet.sourcePack],
    ['Resume at', step?.title],
    ['Status', sheet.draft ? `Draft · ${openSteps.length} open ${openSteps.length === 1 ? 'section' : 'sections'}` : 'Complete'],
  ]
  return (
    <>
      <dl className="grid gap-2 break-words text-sm sm:grid-cols-2">
        {details.filter(([, value]) => value).map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {sourceIssues.map(issue => <p key={issue} role="status" className="text-sm text-rose-300">{issue}</p>)}
      {sheet.reviews.length > 0 && <p className="text-sm text-muted-foreground">Includes Storyteller review notes.</p>}
    </>
  )
}
