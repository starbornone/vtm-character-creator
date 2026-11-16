import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { traitLabel, type AttributeId, type SkillId } from '@/catalog/traits'
import { ratings, type evaluateTraitLedger, type Rating, type TraitRatings } from '@/rules/trait-ledger'

interface AllocationEditorProps<Id extends AttributeId | SkillId> {
  kind: 'attributes' | 'skills'
  groups: readonly { name: string; ids: readonly Id[] }[]
  values: TraitRatings<Id>
  allocation: ReturnType<typeof evaluateTraitLedger>['attributes']
  onChange: (id: Id, rating: Rating | undefined) => void
  skillGrant?: { skill: SkillId; source: string }
  children?: ReactNode
}

export function AllocationEditor<Id extends AttributeId | SkillId>({
  kind, groups, values, allocation, onChange, skillGrant, children,
}: AllocationEditorProps<Id>) {
  const { slots, open, excess } = allocation
  const heading = kind === 'attributes' ? 'Attributes' : 'Skills'
  const status = open === 0 && excess === 0 ? 'Allocation complete' : `${open} open · ${excess} over capacity`

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby={`${kind}-heading`}>
      <CardContent className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id={`${kind}-heading`} className="text-2xl font-semibold tracking-tight">{heading}</h2>
            <p role="status" className="mt-1 text-sm tabular-nums text-muted-foreground">{status}</p>
          </div>
          {children}
        </div>
        <ul aria-label={`${heading} slots by rating`} className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {slots.filter(slot => slot.capacity > 0 || slot.used > 0).map(slot => (
            <li key={slot.rating} className="rounded-lg bg-background/60 px-3 py-2">
              <p className="font-medium">{slot.rating} {slot.rating === 1 ? 'dot' : 'dots'}</p>
              <p className={`mt-0.5 text-xs tabular-nums ${slot.remaining < 0 ? 'text-rose-300' : 'text-muted-foreground'}`}>
                {slot.used} / {slot.capacity} used · {slot.remaining < 0 ? `${-slot.remaining} over` : `${slot.remaining} left`}
              </p>
            </li>
          ))}
        </ul>
        {excess > 0 && (
          <p className="mt-3 text-sm text-rose-300" id={`${kind}-overfilled`}>
            Change or clear a rating in each overfilled group to fit the distribution.
          </p>
        )}
        <div className="mt-5 grid gap-5 lg:grid-cols-3 lg:gap-4">
          {groups.map(group => (
            <fieldset key={group.name} className="min-w-0 rounded-lg border border-border px-3 pb-1">
              <legend className="px-1.5 text-sm font-semibold text-muted-foreground">{group.name}</legend>
              <div className="divide-y divide-border/70">
                {group.ids.map(id => {
                  const current = values[id]
                  const overfilled = slots.some(slot => slot.rating === current && slot.remaining < 0)

                  return (
                    <div key={id} className="flex min-h-12 items-center justify-between gap-2 py-1.5">
                      <div>
                        <label htmlFor={id} className="text-sm font-medium">{traitLabel(id)}</label>
                        {id === skillGrant?.skill && <p className="text-xs text-muted-foreground">1 total · {skillGrant.source} +1</p>}
                      </div>
                      <select
                        id={id}
                        className="ledger-field min-w-18"
                        aria-invalid={overfilled || undefined}
                        aria-describedby={overfilled ? `${kind}-overfilled` : undefined}
                        value={current ?? ''}
                        onChange={event => onChange(id, ratings.find(rating => String(rating) === event.target.value))}
                      >
                        <option value="">{kind === 'skills' ? '0' : 'Unassigned'}</option>
                        {slots.map(slot => (
                          <option key={slot.rating} value={slot.rating} disabled={slot.remaining <= 0 && slot.rating !== current}>
                            {slot.rating}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
