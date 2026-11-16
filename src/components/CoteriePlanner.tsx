import { Download, FileText, FolderOpen, Map, Plus, Save, Upload, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { CoterieHandoffSummary, CoteriePlanEditor } from '@/components/CoteriePlanEditor'
import { browserStorage, type NamedDraft } from '@/drafts/browser-drafts'
import { loadCoteriePlans, readCoterieHandoff, saveCoteriePlan, serializeCoterieHandoff, suggestCoterieCopyName } from '@/drafts/coterie-plans'
import { emptyCoteriePlan, type CoteriePlan } from '@/rules/coterie-plan'
import { downloadTextFile } from '@/sharing/download-text'

type Preview = { kind: 'export'; plan: CoteriePlan } | { kind: 'restore'; plan: CoteriePlan; name: string }

function focusHeading(heading: HTMLHeadingElement | null) {
  heading?.focus()
}

export function CoteriePlanner({ drafts }: { drafts: readonly NamedDraft[] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const fileChooser = useRef<HTMLInputElement>(null)
  const handoffButton = useRef<HTMLButtonElement>(null)
  const request = useRef(0)
  const [library, setLibrary] = useState(() => loadCoteriePlans(browserStorage))
  const [plan, setPlan] = useState(emptyCoteriePlan)
  const [activeId, setActiveId] = useState<string>()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState<Preview>()
  const [issue, setIssue] = useState<string>()
  const [status, setStatus] = useState('')
  const [reading, setReading] = useState(false)
  const savedPlans = library.value?.plans ?? []
  const savedPlan = savedPlans.find(entry => entry.id === activeId)?.plan ?? emptyCoteriePlan
  const selectedPlan = savedPlans.find(entry => entry.id === selectedId)
  const dirty = JSON.stringify(plan) !== JSON.stringify(savedPlan)

  function canReplace() {
    return !dirty || window.confirm('Leave this plan and discard its unsaved changes?')
  }

  function setOpen(next: CoteriePlan, id?: string) {
    setPlan(next)
    setActiveId(id)
    setSelectedId(id ?? '')
    setIssue(undefined)
    setStatus('')
  }

  function save(next: CoteriePlan, id?: string) {
    setStatus('')
    if (!library.value) return
    const savedId = id ?? crypto.randomUUID()
    const result = saveCoteriePlan(browserStorage, library.value, next, savedId, Boolean(id))
    if (result.issue !== undefined) {
      setIssue(result.issue)
      return
    }
    setLibrary(result)
    setOpen({ ...next, name: next.name.trim() }, savedId)
    setPreview(undefined)
    setStatus(`Saved ${next.name.trim()}.`)
  }

  function closePreview() {
    const control = preview?.kind === 'export' ? handoffButton : fileChooser
    setPreview(undefined)
    setIssue(undefined)
    // The export opener is mounted again on the next render.
    requestAnimationFrame(() => control.current?.focus())
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    const current = ++request.current
    setPreview(undefined)
    setIssue(undefined)
    setStatus('')
    setReading(true)
    try {
      const result = readCoterieHandoff(await file.text())
      if (current !== request.current) return
      if (result.issue !== undefined) setIssue(result.issue)
      else setPreview({ kind: 'restore', plan: result.value, name: suggestCoterieCopyName(savedPlans, result.value.name) })
    } catch {
      if (current === request.current) setIssue('Could not read this handoff file.')
    } finally {
      if (current === request.current) setReading(false)
    }
  }

  function download(next: CoteriePlan) {
    const stem = next.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80)
    downloadTextFile(serializeCoterieHandoff(next), `${stem || 'coterie'}-plan.json`, 'application/json')
  }

  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" className="guide-button guide-action bg-background/85" onClick={() => dialog.current?.showModal()}>
      <Map aria-hidden="true" />Coterie &amp; Domain
    </button>
    <dialog ref={dialog} aria-labelledby="coterie-planner-title" onClose={() => {
      request.current++
      setReading(false)
      setPreview(undefined)
      trigger.current?.focus()
    }} className="fixed inset-0 m-auto max-h-none w-[calc(100%-1.5rem)] max-w-4xl overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/70 print:hidden">
      <div className="flex max-h-[min(52rem,calc(100dvh-1.5rem))] flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border p-3 sm:p-5">
          <h2 id="coterie-planner-title" className="text-lg font-semibold sm:text-2xl">Coterie &amp; Domain planner</h2>
          <button type="button" className="guide-button guide-action" onClick={() => dialog.current?.close()}><X aria-hidden="true" />Close</button>
        </header>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid min-w-36 flex-1 gap-1 text-sm">Saved plans
              <select className="ledger-field w-full" value={selectedId} disabled={reading || !savedPlans.length} onChange={event => setSelectedId(event.target.value)}>
                <option value="">{savedPlans.length ? 'Choose a plan…' : 'No saved plans'}</option>
                {savedPlans.map(({ id, plan }) => <option key={id} value={id}>{plan.name}</option>)}
              </select>
            </label>
            <button type="button" className="guide-button guide-action disabled:opacity-50" disabled={reading || !selectedPlan} onClick={() => {
              if (!selectedPlan || !canReplace()) return
              setOpen(selectedPlan.plan, selectedPlan.id)
              setPreview(undefined)
            }}><FolderOpen aria-hidden="true" />Open plan</button>
            <button type="button" className="guide-button guide-action disabled:opacity-50" disabled={reading} onClick={() => {
              if (!canReplace()) return
              setOpen(emptyCoteriePlan)
              setPreview(undefined)
            }}><Plus aria-hidden="true" />New plan</button>
            <label className="guide-button guide-action cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rose-300">
              <Upload aria-hidden="true" />Choose coterie JSON
              <input ref={fileChooser} type="file" accept=".json,application/json" className="sr-only" onChange={chooseFile} />
            </label>
          </div>
          {preview ? <section aria-labelledby="coterie-handoff-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
            <h3 ref={focusHeading} tabIndex={-1} id="coterie-handoff-heading" className="font-semibold">{preview.kind === 'export' ? 'Coterie handoff preview' : 'Restore coterie plan preview'}</h3>
            <CoterieHandoffSummary plan={preview.plan} />
            {preview.kind === 'restore' && <label className="grid max-w-md gap-1 text-sm">New plan name
              <input className="ledger-field" value={preview.name} onChange={event => {
                setPreview({ ...preview, name: event.target.value })
                setIssue(undefined)
              }} />
            </label>}
          </section> :
            <CoteriePlanEditor key={activeId ?? 'new'} plan={plan} drafts={drafts} onChange={next => {
              setPlan(next)
              setStatus('')
            }} />}
        </div>
        <div className="space-y-2 border-t border-border p-3 sm:px-5">
          {(issue ?? library.issue) && <p role="alert" className="text-sm text-rose-300">{issue ?? library.issue}</p>}
          <p role="status" className={reading || status ? 'text-sm text-muted-foreground' : 'sr-only'}>{reading ? 'Reading handoff…' : status}</p>
          <div className="flex flex-wrap gap-2">
            {preview ? <>
              {preview.kind === 'export'
                ? <button type="button" className="guide-button guide-action guide-button-primary" onClick={() => download(preview.plan)}><Download aria-hidden="true" />Download coterie JSON</button>
                : <button type="button" className="guide-button guide-action guide-button-primary disabled:opacity-50" disabled={!library.value || !preview.name.trim()} onClick={() => {
                  if (canReplace()) save({ ...preview.plan, name: preview.name })
                }}><Save aria-hidden="true" />Restore as new plan</button>}
              <button type="button" className="guide-button" onClick={closePreview}>Cancel preview</button>
            </> : <>
              <button type="button" className="guide-button guide-action guide-button-primary disabled:opacity-50" disabled={reading || !library.value || !plan.name.trim()}
                onClick={() => save(plan, activeId)}><Save aria-hidden="true" />Save plan</button>
              <button ref={handoffButton} type="button" className="guide-button guide-action disabled:opacity-50" disabled={reading || !plan.name.trim()} onClick={() => {
                setIssue(undefined)
                setPreview({ kind: 'export', plan: { ...plan, name: plan.name.trim() } })
              }}><FileText aria-hidden="true" />Preview handoff</button>
            </>}
          </div>
        </div>
      </div>
    </dialog>
  </>
}
