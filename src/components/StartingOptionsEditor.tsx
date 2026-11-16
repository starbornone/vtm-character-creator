import { advantageIds, flawIds, startingAdvantages, startingFlaws } from '@/catalog/starting-options'
import { Card, CardContent } from '@/components/ui/card'
import type { evaluateStartingBuild, ManualStartingOption, StartingDraft } from '@/rules/starting-xp'

type Build = ReturnType<typeof evaluateStartingBuild>

function BudgetStatus({ budget }: { budget: Build['advantageBudget'] }) {
  return (
    <p role="status" className={budget.remaining < 0 ? 'text-sm text-rose-300' : 'text-sm text-muted-foreground'}>
      {budget.used} / {budget.limit} dots · {budget.remaining < 0 ? `${-budget.remaining} over` : `${budget.remaining} left`}
    </p>
  )
}

function ManualOptions({ options, evaluated, onChange }: {
  options: ManualStartingOption[]
  evaluated: Build['manualOptions']
  onChange: (options: ManualStartingOption[]) => void
}) {
  function edit(index: number, update: Partial<ManualStartingOption>) {
    onChange(options.map((entry, position) => position === index ? { ...entry, ...update } : entry))
  }

  return <fieldset className="space-y-3 rounded-lg border border-border px-4 pb-4">
    <legend className="px-1.5 text-sm font-semibold">Manual Advantages &amp; Flaws</legend>
    <p className="text-sm text-muted-foreground">These entries use the base dot budgets and appear on the sheet for Storyteller review.</p>
    {options.map((option, index) => <fieldset key={index} className="grid min-w-0 gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
      <legend className="px-1 text-sm">Manual entry {index + 1}</legend>
      <label className="grid gap-1 text-sm">Type
        <select className="ledger-field" value={option.kind} onChange={event => {
          const kind = event.target.value === 'flaw' ? 'flaw' : 'advantage'
          edit(index, { kind, dots: kind === 'flaw' ? Math.min(option.dots, 2) : option.dots })
        }}>
          <option value="advantage">Advantage</option>
          <option value="flaw">Flaw</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">Dots
        <select className="ledger-field" value={option.dots} onChange={event => edit(index, { dots: Number(event.target.value) })}>
          {[1, 2, 3, 4, 5].slice(0, option.kind === 'flaw' ? 2 : 5).map(rating => <option key={rating}>{rating}</option>)}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-sm">Name
        <input className="ledger-field w-full" value={option.name} onChange={event => edit(index, { name: event.target.value })} />
      </label>
      <label className="grid min-w-0 gap-1 text-sm">Source or Storyteller note
        <input className="ledger-field w-full" value={option.source} onChange={event => edit(index, { source: event.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button type="button" className="guide-button" aria-label={`Remove manual entry ${index + 1}`} onClick={() => onChange(options.filter((_, position) => position !== index))}>Remove</button>
        {evaluated[index]?.issue && <span className="text-sm text-rose-300">{evaluated[index].issue}</span>}
      </div>
    </fieldset>)}
    <button type="button" className="guide-button" onClick={() => onChange([...options, { kind: 'advantage', name: '', dots: 1, source: '' }])}>Add manual entry</button>
  </fieldset>
}

export function StartingOptionsEditor({ draft, build, onChange }: {
  draft: StartingDraft
  build: Build
  onChange: (update: Partial<StartingDraft>) => void
}) {
  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="starting-options-heading">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="starting-options-heading" className="text-2xl font-semibold tracking-tight">Advantages &amp; Flaws</h2>
          <label className="grid gap-1 text-sm">
            Generation
            <select className="ledger-field" value={build.generation ?? ''} aria-invalid={Boolean(build.generationIssue) || undefined} aria-describedby={build.generationIssue ? 'generation-issue' : undefined} onChange={event => onChange({ generation: build.profile.generations.find(value => String(value) === event.target.value) })}>
              <option value="">Choose…</option>
              {build.profile.generations.map(value => <option key={value} value={value}>{value}th</option>)}
            </select>
          </label>
        </div>
        {build.generationIssue && <p id="generation-issue" role="status" className="text-sm text-rose-300">{build.generationIssue}</p>}
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Starting vampire totals">
          {[
            { name: 'Humanity', value: build.humanity },
            { name: 'Blood Potency', value: build.bloodPotency },
            { name: 'Bane Severity', value: build.baneSeverity },
            { name: 'Blood Surge dice', value: build.bloodSurge },
          ].map(({ name, value }) => <div key={name} className="rounded-lg bg-background/60 px-3 py-2">
            <dt className="text-xs text-muted-foreground">{name}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>)}
        </dl>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-2 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Base Advantages</legend>
            <BudgetStatus budget={build.advantageBudget} />
            {advantageIds.map(id => {
              const option = startingAdvantages[id]
              const issue = build.advantages.find(entry => entry.id === id)?.issue
              return <div key={id} className="rounded-md border border-border/70 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`base-${id}`} className="text-sm">{option.name}</label>
                  <select id={`base-${id}`} className="ledger-field w-18" value={draft.advantages[id] ?? 0} aria-invalid={Boolean(issue) || undefined} aria-describedby={issue ? `issue-${id}` : undefined} onChange={event => onChange({ advantages: { ...draft.advantages, [id]: Number(event.target.value) } })}>
                    <option value="0">0</option>
                    {option.dots.map(dots => <option key={dots} value={dots}>{dots}</option>)}
                  </select>
                </div>
                {issue && <p id={`issue-${id}`} className="mt-1 text-xs text-rose-300">{issue}</p>}
                <p className="text-xs text-muted-foreground">Core p. {option.page}</p>
              </div>
            })}
            <p className="text-sm text-muted-foreground">{build.totalAdvantageDots} total Advantage dots{build.predatorAdvantage ? ` · ${build.predatorAdvantage} from Predator Type` : ''}{build.xpAdvantageDots ? ` · ${build.xpAdvantageDots} from XP` : ''}</p>
          </fieldset>
          <fieldset className="min-w-0 space-y-2 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Base Flaws</legend>
            <BudgetStatus budget={build.flawBudget} />
            {flawIds.map(id => {
              const flaw = startingFlaws[id]
              const issue = build.flaws.find(entry => entry.id === id)?.issue
              return <div key={id} className="rounded-md border border-border/70 px-3 py-2">
                <label className="flex min-h-8 items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300" checked={draft.flaws.includes(id)} aria-invalid={Boolean(issue) || undefined} aria-describedby={issue ? `issue-${id}` : undefined} onChange={event => onChange({ flaws: event.target.checked ? [...draft.flaws, id] : draft.flaws.filter(selected => selected !== id) })} />
                  {flaw.name} · {flaw.dots} {flaw.dots === 1 ? 'dot' : 'dots'}
                </label>
                {issue && <p id={`issue-${id}`} className="text-xs text-rose-300">{issue}</p>}
                <p className="text-xs text-muted-foreground">Core p. {flaw.page}</p>
              </div>
            })}
          </fieldset>
        </div>
        <ManualOptions options={draft.manualOptions ?? []} evaluated={build.manualOptions} onChange={manualOptions => onChange({ manualOptions })} />
      </CardContent>
    </Card>
  )
}
