import { ChevronDown, Copy, Download, FilePlus, FolderOpen, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { suggestCopyName, type DraftLibrary } from '@/drafts/browser-drafts'
import type { DraftSnapshot } from '@/drafts/draft-backup'
import { BackupRestore } from '@/components/BackupRestore'
import { Card, CardContent } from '@/components/ui/card'

interface DraftControlsProps {
  library: DraftLibrary
  activeId?: string
  name: string
  dirty: boolean
  issue?: string
  onSave: (name: string) => string | undefined
  onSwitch: (id: string | null) => boolean
  onDownload: () => void
  onRestore: (draft: DraftSnapshot) => { restored: boolean; issue?: string }
  onDuplicate: (name: string) => string | undefined
}

export function DraftControls(props: DraftControlsProps) {
  const { activeId, dirty, issue } = props
  const status = issue ?? (activeId && !dirty ? 'Saved in this browser. Changes autosave.' : 'Name this draft to turn on autosave.')

  return (
    <Card className="gap-0 py-0 print:hidden" role="region" aria-labelledby="draft-controls-heading">
      <details className="group">
        <summary aria-labelledby="draft-controls-heading" aria-describedby="draft-controls-status"
          className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-300 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span id="draft-controls-heading" className="font-semibold">Browser drafts</span>
            <span id="draft-controls-status" role="status" className={issue ? 'text-rose-300' : 'text-muted-foreground'}>{status}</span>
          </span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        <DraftFields key={activeId ?? 'unnamed'} {...props} />
      </details>
    </Card>
  )
}

function DraftFields({ library, activeId, name, dirty, issue, onSave, onSwitch, onDownload, onRestore, onDuplicate }: DraftControlsProps) {
  const [label, setLabel] = useState(name)
  const [selectedId, setSelectedId] = useState(library.activeId ?? '')
  const [nameIssue, setNameIssue] = useState<string>()

  return (
    <CardContent className="space-y-3 border-t border-border p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-2">
        <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
          event.preventDefault()
          const error = onSave(label)
          setNameIssue(error)
          if (!error) setLabel(label.trim())
        }}>
          <label className="grid min-w-40 flex-1 gap-1 text-sm">
            Draft name
            <input className="ledger-field w-full" value={label} onChange={event => {
              setLabel(event.target.value)
              setNameIssue(undefined)
            }} aria-invalid={Boolean(nameIssue) || undefined} aria-describedby={nameIssue ? 'draft-name-error' : undefined} />
          </label>
          <button type="submit" className="guide-button guide-action"><Save aria-hidden="true" />{issue ? 'Retry save' : 'Save draft'}</button>
          {nameIssue && <p id="draft-name-error" role="alert" className="w-full text-sm text-rose-300">{nameIssue}</p>}
        </form>

        <div className="flex flex-wrap items-end gap-2">
          <label className="grid min-w-40 flex-1 gap-1 text-sm">
            Saved drafts
            <select className="ledger-field w-full" value={selectedId} disabled={!library.drafts.length} onChange={event => setSelectedId(event.target.value)}>
              <option value="">{library.drafts.length ? 'Choose a draft' : 'No saved drafts'}</option>
              {library.drafts.map(draft => <option key={draft.id} value={draft.id}>{draft.name}</option>)}
            </select>
          </label>
          <button type="button" className="guide-button guide-action disabled:opacity-50" disabled={!selectedId || selectedId === activeId} onClick={() => onSwitch(selectedId)}><FolderOpen aria-hidden="true" />Open draft</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="guide-button guide-action disabled:opacity-50" disabled={!activeId && !dirty} onClick={() => {
          if (onSwitch(null)) {
            setLabel('')
            setNameIssue(undefined)
            setSelectedId('')
          }
        }}><FilePlus aria-hidden="true" />New draft</button>
        <button type="button" className="guide-button guide-action" onClick={onDownload}><Download aria-hidden="true" />Download current draft</button>
        <BackupRestore library={library} onRestore={onRestore} />
        {library.drafts.some(draft => draft.id === activeId) && (
          <DuplicateDraft suggestedName={suggestCopyName(library, name)} onDuplicate={onDuplicate} />
        )}
      </div>
    </CardContent>
  )
}

function focusCopyName(input: HTMLInputElement | null) {
  input?.focus()
}

function DuplicateDraft({ suggestedName, onDuplicate }: {
  suggestedName: string
  onDuplicate: DraftControlsProps['onDuplicate']
}) {
  const [name, setName] = useState<string>()
  const [issue, setIssue] = useState<string>()
  const trigger = useRef<HTMLButtonElement>(null)

  function cancel() {
    setName(undefined)
    setIssue(undefined)
    trigger.current?.focus()
  }

  return <>
    <button ref={trigger} type="button" className="guide-button guide-action" aria-expanded={name !== undefined}
      onClick={() => name === undefined ? setName(suggestedName) : cancel()}>
      <Copy aria-hidden="true" />Duplicate draft
    </button>
    {name !== undefined && (
      <form className="flex w-full flex-wrap items-end gap-2 rounded-lg border border-border p-3 sm:p-4"
        aria-label="Duplicate current draft" onSubmit={event => {
          event.preventDefault()
          setIssue(onDuplicate(name))
        }}>
        <label className="grid min-w-40 flex-1 gap-1 text-sm">
          Copy name
          <input ref={focusCopyName} className="ledger-field w-full" value={name}
            aria-describedby={issue ? 'draft-copy-issue' : undefined} onChange={event => {
              setName(event.target.value)
              setIssue(undefined)
            }} />
        </label>
        <button type="submit" className="guide-button guide-button-primary">Save copy</button>
        <button type="button" className="guide-button" onClick={cancel}>Cancel copy</button>
        {issue && <p id="draft-copy-issue" role="alert" className="w-full text-sm text-rose-300">{issue}</p>}
      </form>
    )}
  </>
}
