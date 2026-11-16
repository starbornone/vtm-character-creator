import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { downloadTextFile } from '@/sharing/download-text'
import { briefNarrativeSections, buildStorytellerBrief, noOpenRulings, type BriefNarrative } from '@/sharing/storyteller-brief'
import type { CharacterDraft } from '@/rules/character-guide'

const narrativeFields = Object.keys(briefNarrativeSections) as (keyof BriefNarrative)[]

export function BriefNarrativeOptions({ narrative, onChange }: { narrative: BriefNarrative; onChange: (next: BriefNarrative) => void }) {
  return <fieldset className="space-y-2">
    <legend className="font-medium">Include in the brief</legend>
    <div className="grid gap-2 sm:grid-cols-2">
      {narrativeFields.map(id => <label key={id} className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300" checked={narrative[id] === true}
          onChange={event => onChange({ ...narrative, [id]: event.target.checked })} />
        {briefNarrativeSections[id]}
      </label>)}
    </div>
  </fieldset>
}

export function StorytellerBrief({ draft }: { draft: CharacterDraft }) {
  const [open, setOpen] = useState(false)
  const [narrative, setNarrative] = useState<BriefNarrative>({})
  const brief = open ? buildStorytellerBrief(draft, narrative) : undefined

  return (
    <div className="space-y-3">
      <button type="button" className="guide-button guide-action" aria-expanded={open} aria-controls={open ? 'brief-preview' : undefined} onClick={() => setOpen(!open)}>
        <FileText aria-hidden="true" />Storyteller brief
      </button>
      {brief && <section id="brief-preview" aria-labelledby="brief-preview-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
        <BriefNarrativeOptions narrative={narrative} onChange={setNarrative} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="brief-preview-heading" className="font-semibold">Markdown preview</h3>
          <button type="button" className="guide-button guide-action guide-button-primary" onClick={() =>
            downloadTextFile(brief.markdown, 'storyteller-brief.md', 'text/markdown;charset=utf-8')
          }><Download aria-hidden="true" />Download Markdown</button>
        </div>
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section aria-labelledby="brief-rulings-heading" className="min-w-0 space-y-2 rounded-md border border-border bg-background/60 p-3 text-sm">
            <h4 id="brief-rulings-heading" className="font-semibold">Open Rulings</h4>
            {brief.rulings.length ? (
              <ul className="list-disc space-y-2 pl-4 wrap-break-word">
                {brief.rulings.map(({ label, text }, index) =>
                  <li key={index}><span className="font-medium">{label}:</span> {text}</li>)}
              </ul>
            ) : <p className="text-muted-foreground">{noOpenRulings}</p>}
          </section>
          <textarea aria-label="Storyteller brief Markdown" readOnly value={brief.markdown}
            className="ledger-field min-h-72 w-full resize-y font-mono text-sm leading-relaxed" />
        </div>
      </section>}
    </div>
  )
}
