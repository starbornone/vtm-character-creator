import { coreClans, corePredators, disciplineIds, disciplines, startingRituals, type DisciplineId, type DotGrant } from '@/catalog/clan-path'
import { traitLabel } from '@/catalog/traits'
import { manualOptionId, predatorRestriction, type ClanPathDraft, type evaluateClanPath, type ManualClan, type ManualPredator, type PowerSlot } from '@/rules/clan-path'
import type { evaluateTraitLedger } from '@/rules/trait-ledger'
import { CatalogSelect } from '@/components/CatalogSelect'
import { Card, CardContent } from '@/components/ui/card'

type Path = ReturnType<typeof evaluateClanPath>

const manualChoice = { id: manualOptionId, label: 'Manual entry', source: 'Storyteller review' }
const clanChoices = [...coreClans.map(clan => ({ id: clan.id, label: clan.name, source: clan.source })), manualChoice]
const disciplineChoices = (ids: readonly DisciplineId[], excluded?: string) => ids.map(id => ({ id, label: disciplines[id], disabled: id === excluded }))
const ritualChoices = startingRituals.map(ritual => ({ id: ritual.id, label: ritual.name, source: `Core p. ${ritual.page}` }))
const emptyClan: ManualClan = { name: '', source: '', disciplines: [], bane: '', compulsion: '' }
const emptyPredator: ManualPredator = { name: '', source: '' }
const emptyGrant: DotGrant = { name: '', dots: 0 }

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid min-w-0 gap-1.5 text-sm">
    {label}
    <input className="ledger-field w-full" value={value} onChange={event => onChange(event.target.value)} />
  </label>
}

function ManualClanFields({ entry, onChange }: { entry: ManualClan; onChange: (entry: ManualClan) => void }) {
  return <div className="space-y-3 rounded-md border border-border p-3">
    <TextField label="Manual clan name" value={entry.name} onChange={name => onChange({ ...entry, name })} />
    <TextField label="Clan source or Storyteller note" value={entry.source} onChange={source => onChange({ ...entry, source })} />
    <TextField label="Bane (optional)" value={entry.bane} onChange={bane => onChange({ ...entry, bane })} />
    <TextField label="Compulsion (optional)" value={entry.compulsion} onChange={compulsion => onChange({ ...entry, compulsion })} />
    <fieldset>
      <legend className="mb-1.5 text-sm">Choose three clan Disciplines</legend>
      <div className="grid gap-2 min-[410px]:grid-cols-2">
        {disciplineIds.map(id => {
          const checked = entry.disciplines.includes(id)
          return <label className="flex items-center gap-2 text-sm" key={id}>
            <input type="checkbox" className="size-4 accent-rose-300" checked={checked} disabled={!checked && entry.disciplines.length >= 3} onChange={event => onChange({
              ...entry, disciplines: event.target.checked ? [...entry.disciplines, id] : entry.disciplines.filter(value => value !== id),
            })} />
            {disciplines[id]}
          </label>
        })}
      </div>
    </fieldset>
  </div>
}

function ManualGrantFields({ label, grant, onChange }: { label: string; grant: DotGrant; onChange: (grant: DotGrant) => void }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
    <TextField label={`${label} name (optional)`} value={grant.name} onChange={name => onChange({ ...grant, name })} />
    <label className="grid gap-1.5 text-sm">
      {label} dots
      <select className="ledger-field" value={grant.dots} onChange={event => onChange({ ...grant, dots: Number(event.target.value) })}>
        {[0, 1, 2, 3, 4, 5].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
  </div>
}

function ManualPredatorFields({ entry, onChange }: { entry: ManualPredator; onChange: (entry: ManualPredator) => void }) {
  return <div className="space-y-3 rounded-md border border-border p-3">
    <TextField label="Manual Predator Type name" value={entry.name} onChange={name => onChange({ ...entry, name })} />
    <TextField label="Predator Type source or Storyteller note" value={entry.source} onChange={source => onChange({ ...entry, source })} />
    <ManualGrantFields label="Granted Advantage" grant={entry.advantage ?? emptyGrant} onChange={advantage => onChange({ ...entry, advantage })} />
    <ManualGrantFields label="Granted Flaw" grant={entry.flaw ?? emptyGrant} onChange={flaw => onChange({ ...entry, flaw })} />
    <label className="grid gap-1.5 text-sm">
      Humanity adjustment
      <select className="ledger-field" value={entry.humanityChange ?? 0} onChange={event => onChange({ ...entry, humanityChange: Number(event.target.value) })}>
        <option value="-1">−1 Humanity</option>
        <option value="0">No change</option>
        <option value="1">+1 Humanity</option>
      </select>
    </label>
  </div>
}

function PowerChoice({ slot, label, onChange }: { slot: PowerSlot; label: string; onChange: (id: string) => void }) {
  const choices = slot.options.filter(power => power.level <= slot.rank || power.id === slot.selectedId).map(power => ({
    id: power.id,
    label: `${power.name} · Level ${power.level}${power.issue === 'amalgam' && power.amalgam ? ` · Requires ${disciplines[power.amalgam.discipline]} ${power.amalgam.dots}`
      : power.issue === 'duplicate' ? ' · Already chosen' : power.issue === 'level' ? ' · Rating too low' : ''}`,
    source: `Core p. ${power.page}`,
    disabled: Boolean(power.issue) && power.id !== slot.selectedId,
  }))

  return (
    <div className="min-w-0 space-y-1">
      <CatalogSelect label={label} value={slot.selectedId} choices={choices} invalid={Boolean(slot.issue)} onChange={onChange} />
      {slot.issue && <p className="text-xs text-rose-300">Choose an eligible power for this dot.</p>}
    </div>
  )
}

function PredatorGrantChoice({ choice, onChange }: { choice: Path['grantChoices'][number]; onChange: (selection: Record<string, number>) => void }) {
  if (choice.mode === 'one') return <CatalogSelect
    label={choice.label}
    value={choice.rows.find(row => row.dots === choice.dots)?.id ?? ''}
    choices={choice.rows.map(row => ({ id: row.id, label: `${row.name} · ${choice.dots} ${choice.dots === 1 ? 'dot' : 'dots'}` }))}
    onChange={id => onChange(id ? { [id]: choice.dots } : {})}
  />
  return <fieldset className="space-y-2 rounded-md border border-border p-3">
    <legend className="px-1 text-sm font-semibold">{choice.label}</legend>
    <p role="status" className="text-sm text-muted-foreground">{choice.used} / {choice.dots} dots allocated</p>
    {choice.rows.map(row => <label className="flex items-center justify-between gap-2 text-sm" key={row.id}>
      {row.name}
      <select className="ledger-field" value={row.dots} onChange={event => onChange({
        ...Object.fromEntries(choice.rows.map(option => [option.id, option.dots])),
        [row.id]: Number(event.target.value),
      })}>
        {[0, ...row.ratings].map(dots => <option key={dots}>{dots}</option>)}
      </select>
    </label>)}
  </fieldset>
}

interface ClanPathEditorProps {
  draft: ClanPathDraft
  path: Path
  predatorGrant: ReturnType<typeof evaluateTraitLedger>['specialties']['predatorGrant']
  finalRatings: Partial<Record<DisciplineId, number>>
  onChange: (update: Partial<ClanPathDraft>) => void
}

export function ClanPathEditor({ draft, path, predatorGrant, finalRatings, onChange }: ClanPathEditorProps) {
  const { clan, predator, clanSlots, predatorSlot, humanity, ledger } = path
  const { predatorAllowed } = path.profile
  const grantLabel = predatorGrant && (predatorGrant.kind === 'skill-dot'
    ? `${traitLabel(predatorGrant.skill)} +1 · Skill dot while the Skill is unrated`
    : `${traitLabel(predatorGrant.skill)} (${predatorGrant.name})${predatorGrant.kind === 'pending' ? ' · Resolve the Skill rating or competing Specialty' : ' · Specialty'}`)
  const predatorChoices = [...corePredators.map(option => {
    const reason = predatorRestriction(clan?.id, option.id)
    return { id: option.id, label: reason ? `${option.name} · ${reason}` : option.name, source: option.source, disabled: Boolean(reason) }
  }), manualChoice]
  const grantSummary = [
    ...path.advantages.map(grant => `${grant.name} · ${grant.dots} Advantage dots`),
    ...path.flaws.map(grant => `${grant.name} · ${grant.dots} Flaw ${grant.dots === 1 ? 'dot' : 'dots'}`),
    humanity.adjustment !== 0 ? `Humanity ${humanity.total} · Base ${humanity.base} ${humanity.adjustment < 0 ? '−' : '+'} ${Math.abs(humanity.adjustment)}` : '',
    path.bloodPotencyChange ? `Blood Potency +${path.bloodPotencyChange}` : '',
    grantLabel,
  ].filter(Boolean)

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="clan-path-heading">
      <CardContent className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 id="clan-path-heading" className="text-2xl font-semibold tracking-tight">Clan &amp; Predator Type</h2>
          <p role="status" className="mt-1 text-sm text-muted-foreground">
            {!predatorAllowed
              ? (path.complete ? 'Fledgling clan choices complete' : 'Choose a clan and assign its Disciplines and powers.')
              : (path.complete && predatorGrant?.kind !== 'pending' ? 'Clan and Predator Type choices complete' : 'Choose a clan, Predator Type, and their grants.')}
          </p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Clan</legend>
            <CatalogSelect searchable label="Starting clan" value={draft.clan} choices={clanChoices} onChange={clan => onChange({ clan })} />
            {draft.clan === manualOptionId && <ManualClanFields entry={draft.manualClan ?? emptyClan} onChange={manualClan => onChange({ manualClan })} />}
            {clan && (
              <>
                <p className="text-sm text-muted-foreground">Bane · {clan.bane || '—'}<br />Compulsion · {clan.compulsion || '—'}</p>
                <p className="text-xs text-muted-foreground">{clan.source}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CatalogSelect label="Two-dot Discipline" value={draft.twoDotDiscipline} choices={disciplineChoices(clan.disciplines, draft.oneDotDiscipline)} onChange={twoDotDiscipline => onChange({ twoDotDiscipline })} />
                  <CatalogSelect label="One-dot Discipline" value={draft.oneDotDiscipline} choices={disciplineChoices(clan.disciplines, draft.twoDotDiscipline)} onChange={oneDotDiscipline => onChange({ oneDotDiscipline })} />
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

          {predatorAllowed ? <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Predator Type</legend>
            <CatalogSelect searchable label="Starting Predator Type" value={draft.predatorType} choices={predatorChoices} disabled={!clan} invalid={Boolean(path.predatorIssue)} onChange={predatorType => onChange({ predatorType })} />
            {!clan && <p className="text-sm text-muted-foreground">Choose a clan to unlock this choice.</p>}
            {path.predatorIssue && <p className="text-sm text-rose-300">{path.predatorIssue}</p>}
            {draft.predatorType === manualOptionId && clan && <ManualPredatorFields entry={draft.manualPredator ?? emptyPredator} onChange={manualPredator => onChange({ manualPredator })} />}
            {predator && (
              <>
                <p className="text-xs text-muted-foreground">{predator.source}</p>
                <CatalogSelect
                  label="Predator Specialty"
                  value={draft.predatorSpecialty}
                  choices={predator.specialties.map(({ skill, name }) => ({ id: skill, label: `${traitLabel(skill)} (${name})` }))}
                  invalid={predatorGrant?.kind === 'pending'}
                  searchable={predator.id === manualOptionId}
                  onChange={predatorSpecialty => onChange({ predatorSpecialty })}
                />
                {path.specialtyOption?.custom && <TextField label="Predator Specialty name" value={draft.predatorSpecialtyName ?? ''} onChange={predatorSpecialtyName => onChange({ predatorSpecialtyName })} />}
                <p className="text-xs text-muted-foreground">As you assign Skills, this grant updates to a Specialty for a rated Skill or a bonus dot for an unrated Skill.</p>
                <CatalogSelect label="Predator Discipline" value={draft.predatorDiscipline} choices={disciplineChoices(path.predatorDisciplines)} onChange={predatorDiscipline => onChange({ predatorDiscipline })} />
                {path.predatorDisciplines.includes(draft.predatorDiscipline as DisciplineId) && !predatorSlot && <p className="text-sm text-muted-foreground">Assign both clan Disciplines to determine the granted power’s rank.</p>}
                {predatorSlot && <PowerChoice
                  slot={predatorSlot}
                  label={`${predator.name} ${disciplines[predatorSlot.discipline]} power for dot ${predatorSlot.rank}`}
                  onChange={power => onChange({ predatorPowers: { ...draft.predatorPowers, [predatorSlot.discipline]: power } })}
                />}
                {path.grantChoices.map(choice => <PredatorGrantChoice key={choice.id} choice={choice} onChange={selection => onChange({
                  predatorChoices: { ...draft.predatorChoices, [choice.id]: selection },
                })} />)}
                {grantSummary.length > 0 && <ul className="space-y-1 text-sm text-muted-foreground" aria-label={`${predator.name} grants`}>
                  {grantSummary.map((summary, index) => <li key={index}>{summary}</li>)}
                </ul>}
              </>
            )}
          </fieldset> : <fieldset className="min-w-0 space-y-2 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Predator Type</legend>
            <p className="text-sm text-muted-foreground">The fledgling’s feeding style develops in play. Core pp. 149, 175.</p>
            {draft.predatorType && <p className="text-sm text-muted-foreground">Your Predator Type choices are paused for this profile.</p>}
          </fieldset>}
        </div>

        {!!finalRatings['blood-sorcery'] && <CatalogSelect label="Starting Blood Sorcery Ritual (optional)" value={draft.ritual ?? ''} choices={ritualChoices} onChange={ritual => onChange({ ritual })} />}
        {path.reviews.length > 0 && <ul className="space-y-1 text-sm text-muted-foreground" aria-label="Storyteller review">
          {path.reviews.map(note => <li key={note}>{note}</li>)}
        </ul>}
        {clan && <dl aria-label="Discipline totals" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ledger.map(row => {
            const total = finalRatings[row.discipline] ?? row.total
            const xpDots = total - row.total
            return <div className="rounded-lg bg-background/60 px-3 py-2" key={row.discipline}>
              <dt className="font-medium">{disciplines[row.discipline]}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{total} total · {clan.name} {row.clanDots}{predatorAllowed && ` · ${predator?.name ?? 'Predator Type'} ${row.predatorDots}`}{xpDots > 0 && ` · XP +${xpDots}`}</dd>
            </div>
          })}
        </dl>}
      </CardContent>
    </Card>
  )
}
