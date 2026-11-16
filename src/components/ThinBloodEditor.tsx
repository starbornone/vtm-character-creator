import { coreClans, disciplineIds, disciplinePowers, disciplines } from '@/catalog/clan-path'
import { alchemyMethods, startingFormulae, thinBloodFlaws, thinBloodMerits } from '@/catalog/thin-blood'
import { CatalogSelect } from '@/components/CatalogSelect'
import { curseRestriction, type evaluateThinBlood, type ThinBloodDraft } from '@/rules/thin-blood'

function TraitChoices<Id extends string>({ title, options, selected, onChange }: {
  title: string
  options: readonly { id: Id; name: string; page: number }[]
  selected: Id[]
  onChange: (selection: Id[]) => void
}) {
  return <fieldset className="space-y-1 rounded-md border border-border p-2.5">
    <legend className="px-1 text-sm font-semibold">{title} ({selected.length})</legend>
    {options.map(({ id, name, page }) => <label key={id} className="flex min-h-8 flex-wrap items-center gap-x-2 text-sm">
      <input type="checkbox" className="size-4 accent-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300" checked={selected.includes(id)}
        onChange={event => onChange(event.target.checked ? [...selected, id] : selected.filter(value => value !== id))} />
      {name} <span className="text-xs text-muted-foreground" aria-hidden="true">Core p. {page}</span>
    </label>)}
  </fieldset>
}

const methodChoices = alchemyMethods.map(({ id, name, page }) => ({ id, label: name, source: `Core p. ${page}` }))
const formulaChoices = startingFormulae.map(({ id, name, page }) => ({ id, label: name, source: `Core p. ${page}` }))
const affinityChoices = disciplineIds.map(id => ({ id, label: disciplines[id] }))

export function ThinBloodEditor({ draft, rules, ageIssue, useFledgling, onChange }: {
  draft: ThinBloodDraft
  rules: ReturnType<typeof evaluateThinBlood>
  ageIssue?: string
  useFledgling: () => void
  onChange: (update: Partial<ThinBloodDraft>) => void
}) {
  const affinity = disciplineIds.find(id => id === draft.affinity)
  const powers = affinity ? disciplinePowers[affinity].filter(power => power.level === 1)
    .map(({ id, name, page }) => ({ id, label: name, source: `Core p. ${page}` })) : []

  return <>
    {ageIssue && <div className="space-y-2">
      <p className="text-sm text-rose-300">{ageIssue}</p>
      <button type="button" className="guide-button" onClick={useFledgling}>Set age to Fledgling</button>
    </div>}
    <p className="text-sm text-muted-foreground">Choose one to three Merits with an equal number of Flaws. These choices sit outside the base dot budgets.</p>
    <div className="grid gap-3 min-[465px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <TraitChoices title="Thin-blood Merits" options={thinBloodMerits} selected={draft.merits} onChange={merits => onChange({ merits })} />
      <TraitChoices title="Thin-blood Flaws" options={thinBloodFlaws} selected={draft.flaws} onChange={flaws => onChange({ flaws })} />
    </div>
    {draft.flaws.includes('clan-curse') && <CatalogSelect label="Clan Curse Bane" value={draft.curseClan ?? ''} invalid={!rules.curse} onChange={curseClan => onChange({ curseClan })}
      choices={coreClans.map(clan => {
        const reason = curseRestriction(clan.id, draft)
        return { id: clan.id, label: `${clan.name} · ${clan.bane}${reason ? ` · ${reason}` : ''}`, source: 'Core p. 183', disabled: Boolean(reason) }
      })} />}
    {draft.merits.includes('discipline-affinity') && <fieldset className="space-y-2 rounded-md border border-border p-2.5">
      <legend className="px-1 text-sm font-semibold">Discipline Affinity (1 dot)</legend>
      <CatalogSelect label="Affinity Discipline" value={draft.affinity ?? ''} choices={affinityChoices} onChange={affinity => onChange({ affinity })} />
      <CatalogSelect label="Affinity power" value={draft.affinityPower ?? ''} choices={powers} disabled={!affinity} onChange={affinityPower => onChange({ affinityPower })} />
    </fieldset>}
    {draft.merits.includes('thin-blood-alchemist') && <fieldset className="space-y-2 rounded-md border border-border p-2.5">
      <legend className="px-1 text-sm font-semibold">Thin-blood Alchemy (1 dot)</legend>
      <CatalogSelect label="Distillation method" value={draft.method ?? ''} choices={methodChoices} onChange={method => onChange({ method })} />
      <CatalogSelect label="Starting formula" value={draft.formula ?? ''} choices={formulaChoices} onChange={formula => onChange({ formula })} />
    </fieldset>}
    {rules.issues.length > 0 && <ul aria-live="polite" className="space-y-1 text-sm text-rose-300">
      {rules.issues.map(issue => <li key={issue}>{issue}</li>)}
    </ul>}
  </>
}
