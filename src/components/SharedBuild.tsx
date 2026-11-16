import { ArrowLeft, Copy, FilePlus, Link2 } from 'lucide-react'
import { useState } from 'react'
import { CharacterSheet } from '@/components/CharacterSheet'
import { suggestRestoreName, type DraftLibrary } from '@/drafts/browser-drafts'
import type { DraftSnapshot } from '@/drafts/draft-backup'
import { evaluateCharacter, guideSteps, type CharacterDraft } from '@/rules/character-guide'
import { decodeBuildLink, encodeBuildLink, omittedChoices } from '@/sharing/build-link'

export function ShareBuildControls({ draft }: { draft: CharacterDraft }) {
  const [showLink, setShowLink] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const hash = showLink ? encodeBuildLink(draft) : undefined
  const url = hash ? new URL(window.location.origin) : undefined
  if (url && hash) {
    url.pathname = window.location.pathname
    url.hash = hash
  }
  const link = url?.href

  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopyStatus('Build link copied.')
    } catch {
      setCopyStatus('Select the link and copy it manually.')
    }
  }

  return <div className="space-y-2">
    <button type="button" className="guide-button guide-action" aria-expanded={showLink} onClick={() => {
      setShowLink(!showLink)
      setCopyStatus('')
    }}><Link2 aria-hidden="true" />Share mechanical build</button>
    {showLink && (link
      ? <div className="flex flex-wrap items-end gap-2 rounded-md border border-border p-3">
          <label className="grid min-w-0 flex-1 gap-1 text-sm">
            Mechanical build link
            <input className="ledger-field w-full" readOnly value={link} onFocus={event => event.currentTarget.select()} />
          </label>
          <button type="button" className="guide-button guide-action" onClick={copy}><Copy aria-hidden="true" />Copy link</button>
          <p className="w-full text-sm text-muted-foreground">Anyone with the link can view the included mechanics. Names, notes, and other free text stay in your draft.</p>
          <p role="status" className={copyStatus ? 'w-full text-sm text-muted-foreground' : 'sr-only'}>{copyStatus}</p>
        </div>
      : <p role="alert" className="text-sm text-rose-300">This build is too large for a link. Use a JSON backup to share the full draft.</p>)}
  </div>
}

interface SharedBuildProps {
  hash: string
  library: DraftLibrary
  onClose: () => void
  onSave: (draft: DraftSnapshot) => { restored: boolean; issue?: string }
}

const mechanicalSteps = guideSteps.filter(step => step.id === 'clan' || step.id === 'traits' || step.id === 'starting')

export function SharedBuild({ hash, library, onClose, onSave }: SharedBuildProps) {
  const [name, setName] = useState(() => suggestRestoreName(library, 'Shared build'))
  const [saveIssue, setSaveIssue] = useState<string>()
  const decoded = decodeBuildLink(hash)
  const returnButton = <button type="button" className="guide-button guide-action print:hidden" onClick={onClose}><ArrowLeft aria-hidden="true" />Return to character creator</button>

  if (decoded.issue !== undefined) return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold">Shared mechanical build</h1>
      {decoded.unavailableSources && <h2 className="font-medium">Unavailable sources</h2>}
      <p role="alert" className="break-words text-rose-300">{decoded.issue}</p>
      {returnButton}
    </main>
  )

  const { sheet, pending } = evaluateCharacter(decoded.draft)
  const openSteps = mechanicalSteps.filter(step => pending[step.id].length > 0)

  return (
    <main className="creator-shell mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-12">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5 print:hidden sm:p-7" aria-labelledby="shared-build-heading">
        <h1 id="shared-build-heading" className="text-3xl font-semibold">Shared mechanical build</h1>
        <p className="text-sm text-muted-foreground">Read-only preview. Save a copy to add a character name, story, and relationships.</p>
        {decoded.omitted.length > 0 && <div>
          <h2 className="font-medium">Choices to re-enter</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {decoded.omitted.map(id => <li key={id}>{omittedChoices[id]}</li>)}
          </ul>
        </div>}
        {openSteps.length > 0 && <div>
          <h2 className="font-medium">Open mechanical choices</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {openSteps.map(step => <li key={step.id}>
              {step.title}
              <ul className="list-disc pl-5">{pending[step.id].map(issue => <li key={issue}>{issue}</li>)}</ul>
            </li>)}
          </ul>
        </div>}
        <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
          event.preventDefault()
          const result = onSave({ name, character: decoded.draft, step: 'concept' })
          if (!result.restored) setSaveIssue(result.issue)
        }}>
          <label className="grid min-w-40 gap-1 text-sm">New draft name
            <input className="ledger-field w-full" value={name} onChange={event => { setName(event.target.value); setSaveIssue(undefined) }} />
          </label>
          <button type="submit" className="guide-button guide-action guide-button-primary"><FilePlus aria-hidden="true" />Save as new draft</button>
          {returnButton}
          {saveIssue && <p role="alert" className="w-full text-sm text-rose-300">{saveIssue}</p>}
        </form>
      </section>
      <div className="sheet-panel"><CharacterSheet mechanicalOnly sheet={{ ...sheet, draft: openSteps.length > 0 }} /></div>
    </main>
  )
}
