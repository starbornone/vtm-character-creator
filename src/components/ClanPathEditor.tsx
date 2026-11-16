import { alleycat, brujah, disciplines, type DisciplineId } from '@/catalog/clan-path'
import { traitLabel } from '@/catalog/traits'
import type { ClanPathDraft, evaluateClanPath, PowerSlot } from '@/rules/clan-path'
import type { evaluateTraitLedger } from '@/rules/trait-ledger'
import { Card, CardContent } from '@/components/ui/card'

interface ChoiceProps {
  label: string
  value: string
  choices: readonly { id: string; label: string; disabled?: boolean }[]
  onChange: (id: string) => void
  disabled?: boolean
  invalid?: boolean
}

function Choice({ label, value, choices, onChange, disabled, invalid }: ChoiceProps) {
  const id = `choice-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <div className="grid min-w-0 gap-1.5 text-sm">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="ledger-field w-full" value={value} disabled={disabled} aria-invalid={invalid || undefined} onChange={event => onChange(event.target.value)}>
        <option value="">Choose…</option>
        {value && !choices.some(choice => choice.id === value) && <option value={value}>Unavailable selection ({value})</option>}
        {choices.map(choice => <option key={choice.id} value={choice.id} disabled={choice.disabled}>{choice.label}</option>)}
      </select>
    </div>
  )
}

function PowerChoice({ slot, label, onChange }: { slot: PowerSlot; label: string; onChange: (id: string) => void }) {
  const choices = slot.options.filter(power => power.level <= slot.rank || power.id === slot.selectedId).map(power => ({
    id: power.id,
    label: `${power.name} · Level ${power.level}${power.issue === 'amalgam' && power.amalgam ? ` · Requires ${disciplines[power.amalgam.discipline]} ${power.amalgam.dots}`
      : power.issue === 'duplicate' ? ' · Already chosen' : power.issue === 'level' ? ' · Rating too low' : ''}`,
    disabled: Boolean(power.issue) && power.id !== slot.selectedId,
  }))

  return (
    <div className="min-w-0 space-y-1">
      <Choice label={label} value={slot.selectedId} choices={choices} invalid={Boolean(slot.issue)} onChange={onChange} />
      {slot.issue && <p className="text-xs text-rose-300">Choose an eligible power for this dot.</p>}
      {slot.selectedPower && <p className="text-xs text-muted-foreground">Core p. {slot.selectedPower.page}</p>}
    </div>
  )
}

interface ClanPathEditorProps {
  draft: ClanPathDraft
  path: ReturnType<typeof evaluateClanPath>
  predatorGrant: ReturnType<typeof evaluateTraitLedger>['specialties']['predatorGrant']
  finalRatings?: Partial<Record<DisciplineId, number>>
  onChange: (update: Partial<ClanPathDraft>) => void
}

const disciplineChoices = (ids: readonly DisciplineId[], excluded?: string) => ids.map(id => ({ id, label: disciplines[id], disabled: id === excluded }))

export function ClanPathEditor({ draft, path, predatorGrant, finalRatings, onChange }: ClanPathEditorProps) {
  const { clan, predator, clanSlots, predatorSlot, humanity, ledger } = path
  const grantLabel = predatorGrant && (predatorGrant.kind === 'skill-dot'
    ? `${traitLabel(predatorGrant.skill)} +1 · Skill dot from ${predator?.name}`
    : `${traitLabel(predatorGrant.skill)} (${predatorGrant.name})${predatorGrant.kind === 'pending' ? ' · Resolve the overfilled Skill rating' : ' · Specialty'}`)

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="clan-path-heading">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 id="clan-path-heading" className="text-2xl font-semibold tracking-tight">Clan &amp; Predator Type</h2>
          <p role="status" className="mt-1 text-sm text-muted-foreground">
            {path.complete && predatorGrant?.kind !== 'pending' ? 'Clan and Predator Type choices complete' : 'Choose a clan, Predator Type, and their grants.'}
          </p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Clan</legend>
            <Choice label="Starting clan" value={draft.clan} choices={[{ id: brujah.id, label: brujah.name }]} onChange={clan => onChange({ clan })} />
            {clan && (
              <>
                <p className="text-sm text-muted-foreground">Bane · {clan.bane}<br />Compulsion · {clan.compulsion}</p>
                <p className="text-xs text-muted-foreground">{clan.source}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice label="Two-dot Discipline" value={draft.twoDotDiscipline} choices={disciplineChoices(clan.disciplines, draft.oneDotDiscipline)} onChange={twoDotDiscipline => onChange({ twoDotDiscipline })} />
                  <Choice label="One-dot Discipline" value={draft.oneDotDiscipline} choices={disciplineChoices(clan.disciplines, draft.twoDotDiscipline)} onChange={oneDotDiscipline => onChange({ oneDotDiscipline })} />
                </div>
                {clanSlots.map(slot => <PowerChoice
                  key={`${slot.discipline}-${slot.rank}`}
                  slot={slot}
                  label={`${disciplines[slot.discipline]} power for dot ${slot.rank}`}
                  onChange={power => onChange({ clanPowers: { ...draft.clanPowers, [slot.discipline]: { ...draft.clanPowers[slot.discipline], [slot.rank]: power } } })}
                />)}
              </>
            )}
          </fieldset>

          <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Predator Type</legend>
            <Choice label="Starting Predator Type" value={draft.predatorType} choices={[{ id: alleycat.id, label: alleycat.name }]} disabled={!clan} onChange={predatorType => onChange({ predatorType })} />
            {!clan && <p className="text-sm text-muted-foreground">Choose a clan to unlock this choice.</p>}
            {predator && (
              <>
                <ul className="space-y-1 text-sm text-muted-foreground" aria-label={`${predator.name} grants`}>
                  <li>{predator.advantage.name} · {predator.advantage.dots} Advantage dots</li>
                  <li>Humanity {humanity.total} · Base {humanity.base} − {Math.abs(humanity.adjustment)} from {predator.name}</li>
                  {grantLabel && <li>{grantLabel}</li>}
                </ul>
                <p className="text-xs text-muted-foreground">{predator.source}</p>
                <Choice label="Predator Specialty" value={draft.predatorSpecialty} choices={predator.specialties.map(({ skill, name }) => ({ id: skill, label: `${traitLabel(skill)} (${name})` }))} invalid={predatorGrant?.kind === 'pending'} onChange={predatorSpecialty => onChange({ predatorSpecialty })} />
                <Choice label="Predator Discipline" value={draft.predatorDiscipline} choices={disciplineChoices(predator.disciplines)} onChange={predatorDiscipline => onChange({ predatorDiscipline })} />
                {draft.predatorDiscipline && !predatorSlot && <p className="text-sm text-muted-foreground">Assign both clan Disciplines to determine the granted power’s rank.</p>}
                {predatorSlot && <PowerChoice
                  slot={predatorSlot}
                  label={`${predator.name} ${disciplines[predatorSlot.discipline]} power for dot ${predatorSlot.rank}`}
                  onChange={power => onChange({ predatorPowers: { ...draft.predatorPowers, [predatorSlot.discipline]: power } })}
                />}
              </>
            )}
          </fieldset>
        </div>

        {clan && <dl aria-label="Discipline totals" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ledger.map(row => {
            const total = finalRatings?.[row.discipline] ?? row.total
            const xpDots = total - row.total
            return <div className="rounded-lg bg-background/60 px-3 py-2" key={row.discipline}>
              <dt className="font-medium">{disciplines[row.discipline]}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{total} total · {clan.name} {row.clanDots} · {predator?.name ?? 'Predator Type'} {row.predatorDots}{xpDots > 0 && ` · XP +${xpDots}`}</dd>
            </div>
          })}
        </dl>}
      </CardContent>
    </Card>
  )
}
