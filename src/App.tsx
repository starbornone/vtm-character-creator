import { useReducer } from 'react'
import { traitGroups } from '@/catalog/traits'
import { AllocationEditor } from '@/components/AllocationEditor'
import { SpecialtyEditor } from '@/components/SpecialtyEditor'
import { editTraits, evaluateTraitLedger, initialTraitDraft, skillDistributionIds, skillDistributions } from '@/rules/trait-ledger'

const attributeGroups = traitGroups.map(({ name, attributes }) => ({ name, ids: attributes }))
const skillGroups = traitGroups.map(({ name, skills }) => ({ name, ids: skills }))

export function App() {
  const [draft, dispatch] = useReducer(editTraits, initialTraitDraft)
  const { attributes, skills, specialties, health, willpower } = evaluateTraitLedger(draft)

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-12">
      <header className="border-l-2 border-primary pl-4 sm:pl-5">
        <p className="text-sm font-medium text-muted-foreground">Vampire: The Masquerade Fifth Edition</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Attribute &amp; Skill Ledger</h1>
      </header>

      <dl aria-live="polite" className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-r border-border px-4 py-3 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">Health</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums">{health.total ?? '—'}</dd>
          <dd className="mt-1 text-sm text-muted-foreground">Stamina ({health.stamina ?? '—'}) + 3</dd>
        </div>
        <div className="px-4 py-3 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">Willpower</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums">{willpower.total ?? '—'}</dd>
          <dd className="mt-1 text-sm text-muted-foreground">Composure ({willpower.composure ?? '—'}) + Resolve ({willpower.resolve ?? '—'})</dd>
        </div>
      </dl>

      <AllocationEditor
        kind="attributes"
        groups={attributeGroups}
        values={draft.attributes}
        allocation={attributes}
        onChange={(id, rating) => dispatch({ type: 'attribute', id, rating })}
      />
      <AllocationEditor
        kind="skills"
        groups={skillGroups}
        values={draft.skills}
        allocation={skills}
        onChange={(id, rating) => dispatch({ type: 'skill', id, rating })}
      >
        <label className="grid gap-1.5 text-sm">
          Skill distribution
          <select
            className="ledger-field"
            value={draft.distribution}
            onChange={event => {
              const distribution = skillDistributionIds.find(id => id === event.target.value)
              if (distribution) dispatch({ type: 'distribution', distribution })
            }}
          >
            {skillDistributionIds.map(id => <option key={id} value={id}>{skillDistributions[id].name}</option>)}
          </select>
        </label>
      </AllocationEditor>
      <SpecialtyEditor draft={draft} specialties={specialties} dispatch={dispatch} />
      <p className="text-sm text-muted-foreground">V5 Core Rulebook, pp. 136, 155–171</p>
    </main>
  )
}
