import { BookOpen, Search, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { searchTableReference } from '@/rules/table-reference'

export function TableReference() {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const results = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const entries = searchTableReference(query)

  function open() {
    dialog.current?.showModal()
    search.current?.focus()
    search.current?.select()
  }

  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" className="guide-button guide-action bg-background/85" onClick={open}>
      <BookOpen aria-hidden="true" />V5 table reference
    </button>
    <dialog ref={dialog} aria-labelledby="table-reference-title" onClose={() => trigger.current?.focus()}
      className="fixed inset-0 m-auto max-h-none w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/70 print:hidden">
      <div className="flex max-h-[min(44rem,calc(100dvh-1.5rem))] flex-col">
        <div className="space-y-3 border-b border-border p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="table-reference-title" className="text-lg font-semibold sm:text-2xl">V5 table reference</h2>
            <button type="button" className="guide-button guide-action" onClick={() => dialog.current?.close()}>
              <X aria-hidden="true" />Close
            </button>
          </div>
          <label className="grid gap-1 text-sm">Search rules
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
              <input ref={search} type="search" className="ledger-field w-full pl-9 text-base" placeholder="Try Willpower, Amalgam, or 137"
                value={query} onKeyDown={event => {
                  if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
                    // The native search field can consume Escape to clear its value.
                    event.preventDefault()
                    dialog.current?.close()
                  }
                }} onChange={event => {
                  setQuery(event.target.value)
                  if (results.current) results.current.scrollTop = 0
                }} />
            </span>
          </label>
          <p role="status" className="text-sm text-muted-foreground">
            {entries.length === 0 ? 'No rules match. Try a different term.' : `${entries.length} ${entries.length === 1 ? 'rule' : 'rules'}`}
          </p>
        </div>
        {entries.length > 0 && <div ref={results} role="region" aria-label="Reference results" tabIndex={0}
          className="min-h-0 overflow-y-auto overscroll-contain p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-300 sm:p-5">
          <ul className="space-y-3">
            {entries.map(({ id, title, summary, source, details, link }) => <li key={id} className="space-y-2 rounded-lg border border-border bg-background px-3 py-2.5 sm:px-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{summary}</p>
              {details && <dl className="divide-y divide-border text-sm">
                {details.map(({ label, value }) => <div key={label} className="grid gap-0.5 py-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-3">
                  <dt className="font-medium">{label}</dt><dd>{value}</dd>
                </div>)}
              </dl>}
              <p className="text-sm text-muted-foreground">{source}</p>
              {link && <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-block rounded text-sm text-rose-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-rose-300">
                {link.label}
              </a>}
            </li>)}
          </ul>
        </div>}
      </div>
    </dialog>
  </>
}
