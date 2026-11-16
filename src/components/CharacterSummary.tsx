import { ChevronDown, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { evaluateCharacter } from '@/rules/character-guide'

type Sheet = ReturnType<typeof evaluateCharacter>['sheet']

export function CharacterSummary({ sheet, predatorAllowed, completedSections, totalSections }: {
  sheet: Sheet
  predatorAllowed: boolean
  completedSections: number
  totalSections: number
}) {
  const [open, setOpen] = useState(false)
  const { identity, tracks, xpRemaining } = sheet
  const ratings = [
    ['Health', tracks.health ?? '—'],
    ['Willpower', tracks.willpower ?? '—'],
    ['Humanity', tracks.humanity],
    ['Blood Potency', tracks.bloodPotency],
  ] as const

  return (
    <aside aria-label="Character summary" className="min-w-0 lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1">
      <Card className="gap-0 py-0">
        <h2 className="hidden items-center gap-2 px-4 pt-4 font-semibold lg:flex">
          <ClipboardList className="size-4" aria-hidden="true" />Character summary
        </h2>
        <button type="button" aria-expanded={open} aria-controls="character-summary-values"
          className="guide-button flex w-full items-center gap-2 border-0 px-4 py-3 text-left focus-visible:-outline-offset-2 lg:hidden"
          onClick={() => setOpen(value => !value)}>
          <ClipboardList className="size-4 shrink-0" aria-hidden="true" />Character summary
          <ChevronDown aria-hidden="true" className={`ml-auto size-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
        <CardContent id="character-summary-values" className={`${open ? 'block' : 'hidden'} space-y-3 px-4 pb-4 lg:block lg:pt-3`}>
          {identity.name && <p className="wrap-break-word font-semibold">{identity.name}</p>}
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Age profile</dt><dd>{identity.ageProfile}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Clan or blood status</dt><dd className="min-w-0 text-right wrap-break-word">{identity.clan ?? 'Unassigned'}</dd></div>
            {predatorAllowed && <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Predator Type</dt><dd className="min-w-0 text-right wrap-break-word">{identity.predator ?? 'Unassigned'}</dd></div>}
          </dl>
          <dl className="grid grid-cols-2 gap-2">
            {ratings.map(([label, value]) => <div key={label} className="rounded-md border border-border px-2.5 py-1.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>)}
          </dl>
          <dl className="text-sm">
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Starting XP remaining</dt><dd className="font-semibold tabular-nums">{xpRemaining}</dd></div>
          </dl>
          <p className="border-t border-border pt-2 text-sm text-muted-foreground">{completedSections} of {totalSections} sections complete</p>
        </CardContent>
      </Card>
    </aside>
  )
}
