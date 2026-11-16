import { Card, CardContent } from '@/components/ui/card'
import { maxConvictions, type ConceptDraft, type RelationshipDraft } from '@/rules/character-guide'

function NarrativeField({ label, value, onChange, multiline = false }: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label}
      {multiline
        ? <textarea className="ledger-field min-h-18 resize-y" rows={2} value={value} onChange={event => onChange(event.target.value)} />
        : <input className="ledger-field" type="text" value={value} onChange={event => onChange(event.target.value)} />}
    </label>
  )
}

export function ConceptEditor({ draft, onChange }: { draft: ConceptDraft; onChange: (update: Partial<ConceptDraft>) => void }) {
  return (
    <Card role="region" aria-labelledby="concept-heading" className="gap-0 py-0">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 id="concept-heading" className="text-2xl font-semibold tracking-tight">Concept</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start with who your character was in life and what keeps them going now.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NarrativeField label="Character name" value={draft.name} onChange={name => onChange({ name })} />
          <NarrativeField label="Concept" value={draft.concept} onChange={concept => onChange({ concept })} />
          <NarrativeField label="Chronicle (optional)" value={draft.chronicle} onChange={chronicle => onChange({ chronicle })} />
          <NarrativeField label="Embraced (optional)" value={draft.embraced} onChange={embraced => onChange({ embraced })} />
          <NarrativeField label="Ambition" multiline value={draft.ambition} onChange={ambition => onChange({ ambition })} />
          <NarrativeField label="Desire" multiline value={draft.desire} onChange={desire => onChange({ desire })} />
        </div>
      </CardContent>
    </Card>
  )
}

export function RelationshipEditor({ draft, onChange }: { draft: RelationshipDraft; onChange: (update: Partial<RelationshipDraft>) => void }) {
  function updatePair(index: number, field: 'conviction' | 'touchstone', value: string) {
    onChange({ convictions: draft.convictions.map((pair, offset) => offset === index ? { ...pair, [field]: value } : pair) })
  }

  return (
    <Card role="region" aria-labelledby="relationships-heading" className="gap-0 py-0">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 id="relationships-heading" className="text-2xl font-semibold tracking-tight">Relationships</h2>
          <p className="mt-1 text-sm text-muted-foreground">Write one to three Convictions. Pair each with a living human who embodies it.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NarrativeField label="Sire (optional)" value={draft.sire} onChange={sire => onChange({ sire })} />
          <NarrativeField label="Coterie (optional)" value={draft.coterie} onChange={coterie => onChange({ coterie })} />
        </div>
        <NarrativeField label="Chronicle Tenets (optional)" multiline value={draft.tenets} onChange={tenets => onChange({ tenets })} />
        {draft.convictions.map((pair, index) => (
          <fieldset key={index} className="space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Conviction and Touchstone {index + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <NarrativeField label={`Conviction ${index + 1}`} value={pair.conviction} onChange={value => updatePair(index, 'conviction', value)} />
              <NarrativeField label={`Touchstone ${index + 1}`} value={pair.touchstone} onChange={value => updatePair(index, 'touchstone', value)} />
            </div>
            {draft.convictions.length > 1 && <button type="button" className="guide-button" onClick={() => onChange({ convictions: draft.convictions.filter((_, offset) => offset !== index) })} aria-label={`Remove Conviction and Touchstone ${index + 1}`}>Remove pair</button>}
          </fieldset>
        ))}
        {draft.convictions.length < maxConvictions && <button type="button" className="guide-button" onClick={() => onChange({ convictions: [...draft.convictions, { conviction: '', touchstone: '' }] })}>Add Conviction and Touchstone</button>}
      </CardContent>
    </Card>
  )
}
