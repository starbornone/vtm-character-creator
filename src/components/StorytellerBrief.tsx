import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { downloadTextFile } from '@/sharing/download-text'
import { briefNarrativeSections, makeStorytellerBrief, type BriefNarrative } from '@/sharing/storyteller-brief'
import type { CharacterDraft } from '@/rules/character-guide'

const narrativeFields = Object.keys(briefNarrativeSections) as (keyof BriefNarrative)[]

export function StorytellerBrief({ draft }: { draft: CharacterDraft }) {
  const [open, setOpen] = useState(false)
  const [narrative, setNarrative] = useState<BriefNarrative>({})
  const markdown = open ? makeStorytellerBrief(draft, narrative) : ''

  return (
    <div className="space-y-3">
      <button type="button" className="guide-button guide-action" aria-expanded={open} onClick={() => setOpen(!open)}>
        <FileText aria-hidden="true" />Storyteller brief
      </button>
      {open && <section aria-labelledby="brief-preview-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
        <fieldset className="space-y-2">
          <legend className="font-medium">Include in the brief</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {narrativeFields.map(id => <label key={id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-rose-300" checked={narrative[id] === true} onChange={event => {
                const checked = event.target.checked
                setNarrative(current => ({ ...current, [id]: checked }))
              }} />
              {briefNarrativeSections[id]}
            </label>)}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="brief-preview-heading" className="font-semibold">Markdown preview</h3>
          <button type="button" className="guide-button guide-action guide-button-primary" onClick={() =>
            downloadTextFile(markdown, 'storyteller-brief.md', 'text/markdown;charset=utf-8')
          }><Download aria-hidden="true" />Download Markdown</button>
        </div>
        <textarea aria-label="Storyteller brief Markdown" readOnly value={markdown}
          className="ledger-field min-h-72 w-full resize-y font-mono text-sm leading-relaxed" />
      </section>}
    </div>
  )
}
