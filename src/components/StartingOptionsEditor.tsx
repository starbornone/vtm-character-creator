import { advantageIds, flawIds, startingAdvantages, startingFlaws } from '@/catalog/starting-options'
import { Card, CardContent } from '@/components/ui/card'
import { neonate, type evaluateStartingBuild, type StartingDraft } from '@/rules/starting-xp'

type Build = ReturnType<typeof evaluateStartingBuild>

function BudgetStatus({ budget }: { budget: Build['advantageBudget'] }) {
  return (
    <p role="status" className={budget.remaining < 0 ? 'text-sm text-rose-300' : 'text-sm text-muted-foreground'}>
      {budget.used} / {budget.limit} dots · {budget.remaining < 0 ? `${-budget.remaining} over` : `${budget.remaining} left`}
    </p>
  )
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
            <select className="ledger-field" value={draft.generation ?? ''} onChange={event => onChange({ generation: neonate.generations.find(value => String(value) === event.target.value) })}>
              <option value="">Choose…</option>
              {neonate.generations.map(value => <option key={value} value={value}>{value}th</option>)}
            </select>
          </label>
        </div>
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
      </CardContent>
    </Card>
  )
}
