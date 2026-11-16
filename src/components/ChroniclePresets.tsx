import { Check, ChevronDown, ListChecks, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { unavailableSourceMessage, unavailableSourcePacks } from '@/catalog/source-packs'
import { Card, CardContent } from '@/components/ui/card'
import { browserStorage } from '@/drafts/browser-drafts'
import { chroniclePresetChanges, loadChroniclePresets, saveChroniclePreset, type ChroniclePreset } from '@/drafts/chronicle-presets'
import type { ChronicleSettings } from '@/rules/character-guide'

function focusPreview(heading: HTMLHeadingElement | null) {
  heading?.focus()
}

export function ChroniclePresets({ settings, onApply }: {
  settings: ChronicleSettings
  onApply: (preset: ChronicleSettings) => void
}) {
  const [library, setLibrary] = useState(() => loadChroniclePresets(browserStorage))
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const [preview, setPreview] = useState<ChroniclePreset>()
  const [saveIssue, setSaveIssue] = useState<string>()
  const [status, setStatus] = useState('')
  const previewButton = useRef<HTMLButtonElement>(null)
  const choice = library.presets?.find(preset => preset.name === selected)
  const changes = preview ? chroniclePresetChanges(settings, preview) : []
  const unavailable = preview ? unavailableSourcePacks(preview.sourcePacks) : []
  const disablesSource = preview && settings.sourcePacks.some(id => !preview.sourcePacks.includes(id))

  function save() {
    setStatus('')
    const result = saveChroniclePreset(browserStorage, name, settings)
    setSaveIssue(result.issue)
    if (result.issue !== undefined) return
    setLibrary(result)
    setStatus(`Saved ${name.trim()} as a chronicle preset.`)
    setName('')
  }

  function closePreview() {
    setPreview(undefined)
    previewButton.current?.focus()
  }

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="chronicle-presets-heading">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-300 sm:px-7 [&::-webkit-details-marker]:hidden">
          <span id="chronicle-presets-heading" className="font-semibold">Chronicle presets</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        <CardContent className="space-y-4 border-t border-border px-5 py-4 sm:px-7">
          <p className="text-sm text-muted-foreground">Reuse the chronicle name, Chronicle Tenets from Relationships, and rule sources across drafts in this browser.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <form className="flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); save() }}>
              <label className="grid min-w-40 flex-1 gap-1 text-sm">Preset name
                <input className="ledger-field w-full" value={name} onChange={event => { setName(event.target.value); setSaveIssue(undefined) }} />
              </label>
              <button type="submit" className="guide-button guide-action"><Save aria-hidden="true" />Save current settings</button>
            </form>
            <div className="flex flex-wrap items-end gap-2">
              <label className="grid min-w-40 flex-1 gap-1 text-sm">Saved presets
                <select className="ledger-field w-full" disabled={!library.presets?.length} value={selected} onChange={event => {
                  setSelected(event.target.value)
                  setPreview(undefined)
                  setStatus('')
                }}>
                  <option value="">{library.presets?.length ? 'Choose a preset' : 'No saved presets'}</option>
                  {library.presets?.map(preset => <option key={preset.name}>{preset.name}</option>)}
                </select>
              </label>
              <button type="button" className="guide-button guide-action disabled:opacity-50" disabled={!choice} ref={previewButton}
                aria-expanded={Boolean(preview)} onClick={() => {
                  if (preview) closePreview()
                  else { setPreview(choice); setStatus('') }
                }}><ListChecks aria-hidden="true" />Preview preset</button>
            </div>
          </div>
          {(saveIssue ?? library.issue) && <p role="alert" className="text-sm text-rose-300">{saveIssue ?? library.issue}</p>}
          <p role="status" className={status ? 'text-sm text-muted-foreground' : 'sr-only'}>{status}</p>
          {preview && <section className="space-y-3 rounded-lg border border-border p-3 sm:p-4" aria-labelledby="chronicle-preview-heading">
            <h3 ref={focusPreview} tabIndex={-1} id="chronicle-preview-heading" className="font-semibold">Chronicle preset preview</h3>
            <p className="break-words text-sm text-muted-foreground">{preview.name}</p>
            {changes.length ? <dl className="space-y-3">
              {changes.map(({ field, before, after }) => <div key={field} className="space-y-1 rounded-md border border-border px-3 py-2 text-sm">
                <dt className="font-medium">{field}</dt>
                <dd className="grid gap-2 break-words sm:grid-cols-2">
                  <div className="min-w-0"><p className="text-muted-foreground">Current</p><p className="whitespace-pre-wrap">{before.trim() ? before : 'Blank'}</p></div>
                  <div className="min-w-0"><p className="text-muted-foreground">Preset</p><p className="whitespace-pre-wrap">{after.trim() ? after : 'Blank'}</p></div>
                </dd>
              </div>)}
            </dl> : <p className="text-sm text-muted-foreground">These settings already match this draft.</p>}
            {unavailable.length > 0 && <p role="alert" className="break-words text-sm text-rose-300">{unavailableSourceMessage(unavailable)}</p>}
            {disablesSource && <p className="text-sm text-muted-foreground">Choices from disabled sources stay in the draft and may need review.</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="guide-button guide-action guide-button-primary disabled:opacity-50"
                disabled={!changes.length || Boolean(unavailable.length)} onClick={() => {
                  onApply(preview)
                  setStatus(`Applied ${preview.name} to this draft.`)
                  closePreview()
                }}><Check aria-hidden="true" />Apply preset</button>
              <button type="button" className="guide-button" onClick={closePreview}>Cancel preview</button>
            </div>
          </section>}
        </CardContent>
      </details>
    </Card>
  )
}
