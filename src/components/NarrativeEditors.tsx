import { Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { FieldHelp } from '@/components/FieldHelp'
import { Card, CardContent } from '@/components/ui/card'
import { maxConvictions, type ConceptDraft, type RelationshipDraft } from '@/rules/character-guide'
import { ageProfileIds, ageProfiles, type AgeProfileId } from '@/rules/creation-profiles'

const ageProfileDescriptions: Record<AgeProfileId, string> = {
  neonate: 'An established young vampire with a Predator Type and 15 starting XP.',
  fledgling: 'A recently Embraced vampire with 0 starting XP. Predator Type is left open for play.',
  ancilla: 'An older vampire with a Predator Type, 35 starting XP, and additional Advantage and Flaw dots.',
}

const conceptHelp = {
  concept: 'A short phrase that captures who your character is. For example, “A former paramedic who still tries to save lives.”',
  chronicle: 'The name of the ongoing story or campaign this character belongs to. Leave it blank if your group hasn’t named it.',
  embraced: 'When your character became a vampire. A year or approximate date is enough. Your chosen age profile sets the creation rules.',
  ambition: 'A long-term goal with a concrete outcome. For example, “Win control of the waterfront.”',
  desire: 'A short-term goal your character can pursue this session. It can change from session to session. For example, “Find out who followed me home.”',
}

function NarrativeField({ label, value, onChange, multiline = false, help }: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  help?: string
}) {
  const id = useId()
  const helpId = help ? `${id}-help` : undefined

  return (
    <div className="grid min-w-0 gap-1.5 text-sm">
      <div className="relative flex min-h-8 items-center gap-1.5">
        <label htmlFor={id}>{label}</label>
        {help && helpId && <FieldHelp id={helpId} label={label.replace(' (optional)', '')} text={help} />}
      </div>
      {multiline
        ? <textarea id={id} aria-describedby={helpId} className="ledger-field min-h-18 resize-y" rows={2} value={value} onChange={event => onChange(event.target.value)} />
        : <input id={id} aria-describedby={helpId} className="ledger-field" type="text" value={value} onChange={event => onChange(event.target.value)} />}
    </div>
  )
}

export function ConceptEditor({ draft, onChange, ageProfile, onAgeProfile }: {
  draft: ConceptDraft
  onChange: (update: Partial<ConceptDraft>) => void
  ageProfile: AgeProfileId
  onAgeProfile: (profile: AgeProfileId) => void
}) {
  return (
    <Card role="region" aria-labelledby="concept-heading" className="gap-0 overflow-visible py-0">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 id="concept-heading" className="text-2xl font-semibold tracking-tight">Concept</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start with who your character was in life and what keeps them going now.</p>
        </div>
        <div className="space-y-2">
          <label className="grid gap-1.5 text-sm sm:max-w-xs">
            Age profile
            <select className="ledger-field" value={ageProfile} aria-describedby="age-profile-summary" onChange={event => {
              const selected = ageProfileIds.find(id => id === event.target.value)
              if (selected) onAgeProfile(selected)
            }}>
              {ageProfileIds.map(id => <option key={id} value={id}>{ageProfiles[id].name}</option>)}
            </select>
          </label>
          <p id="age-profile-summary" className="text-sm text-muted-foreground">
            {ageProfileDescriptions[ageProfile]}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NarrativeField label="Character name" value={draft.name} onChange={name => onChange({ name })} />
          <NarrativeField label="Concept" help={conceptHelp.concept} value={draft.concept} onChange={concept => onChange({ concept })} />
          <NarrativeField label="Chronicle (optional)" help={conceptHelp.chronicle} value={draft.chronicle} onChange={chronicle => onChange({ chronicle })} />
          <NarrativeField label="Embraced (optional)" help={conceptHelp.embraced} value={draft.embraced} onChange={embraced => onChange({ embraced })} />
          <NarrativeField label="Ambition" help={conceptHelp.ambition} multiline value={draft.ambition} onChange={ambition => onChange({ ambition })} />
          <NarrativeField label="Desire" help={conceptHelp.desire} multiline value={draft.desire} onChange={desire => onChange({ desire })} />
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
            {draft.convictions.length > 1 && <button type="button" className="guide-button guide-action" onClick={() => onChange({ convictions: draft.convictions.filter((_, offset) => offset !== index) })} aria-label={`Remove Conviction and Touchstone ${index + 1}`}><Trash2 aria-hidden="true" />Remove pair</button>}
          </fieldset>
        ))}
        {draft.convictions.length < maxConvictions && <button type="button" className="guide-button guide-action" onClick={() => onChange({ convictions: [...draft.convictions, { conviction: '', touchstone: '' }] })}><Plus aria-hidden="true" />Add Conviction and Touchstone</button>}
      </CardContent>
    </Card>
  )
}
