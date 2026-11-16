import { Search } from 'lucide-react'
import { useId, useState } from 'react'

export interface CatalogChoice {
  id: string
  label: string
  source?: string
  disabled?: boolean
}

interface ChoiceProps {
  id?: string
  label: string
  value: string
  choices: readonly CatalogChoice[]
  onChange: (id: string) => void
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
}

export function CatalogSelect({ id: fieldId, label, value, choices, onChange, disabled, invalid, searchable }: ChoiceProps) {
  const generatedId = useId()
  const id = fieldId ?? generatedId
  const [query, setQuery] = useState('')
  const words = query.toLowerCase().trim().split(/\s+/)
  const matches = choices.filter(choice => words.every(word => `${choice.label} ${choice.source ?? ''}`.toLowerCase().includes(word)))
  const selected = choices.find(choice => choice.id === value)
  const shown = selected && !matches.includes(selected) ? [selected, ...matches] : matches

  return (
    <div className="grid min-w-0 gap-1.5 text-sm">
      {searchable && <label className="grid min-w-0 gap-1.5">
        <span className="text-muted-foreground">Search {label.toLowerCase()}</span>
        <span className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <input type="search" className="ledger-field w-full pl-8" value={query} disabled={disabled} onChange={event => setQuery(event.target.value)} />
        </span>
      </label>}
      <label htmlFor={id}>{label}</label>
      <select id={id} className="ledger-field w-full" value={value} disabled={disabled} aria-invalid={invalid || undefined} onChange={event => {
        onChange(event.target.value)
        setQuery('')
      }}>
        <option value="">Choose…</option>
        {value && !selected && <option value={value}>Unavailable selection ({value})</option>}
        {shown.map(choice => <option key={choice.id} value={choice.id} disabled={choice.disabled}>{choice.label}{choice.source ? ` · ${choice.source}` : ''}</option>)}
      </select>
      {searchable && query.trim() && matches.length === 0 && <p className="text-xs text-muted-foreground" role="status">No matching options.</p>}
    </div>
  )
}
