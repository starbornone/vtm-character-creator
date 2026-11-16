import { useReducer } from 'react'
import { traitGroups } from '@/catalog/traits'
import { AllocationEditor } from '@/components/AllocationEditor'
import { ClanPathEditor } from '@/components/ClanPathEditor'
import { SpecialtyEditor } from '@/components/SpecialtyEditor'
import { evaluateClanPath, initialClanPath, type ClanPathDraft } from '@/rules/clan-path'
import { editTraits, evaluateTraitLedger, initialTraitDraft, skillDistributionIds, skillDistributions, type TraitAction } from '@/rules/trait-ledger'

const attributeGroups = traitGroups.map(({ name, attributes }) => ({ name, ids: attributes }))
const skillGroups = traitGroups.map(({ name, skills }) => ({ name, ids: skills }))
const initialDraft = { traits: initialTraitDraft, clanPath: initialClanPath }

type CharacterAction = TraitAction | { type: 'clan-path'; update: Partial<ClanPathDraft> }

function editDraft(draft: typeof initialDraft, action: CharacterAction) {
  return action.type === 'clan-path'
    ? { ...draft, clanPath: { ...draft.clanPath, ...action.update } }
    : { ...draft, traits: editTraits(draft.traits, action) }
}

export function App() {
  const [draft, dispatch] = useReducer(editDraft, initialDraft)
  const path = evaluateClanPath(draft.clanPath)
  const { attributes, skills, specialties, health, willpower } = evaluateTraitLedger(draft.traits, path.grantedSpecialty)
  const { predatorGrant } = specialties

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-12">
      <header className="border-l-2 border-primary pl-4 sm:pl-5">
        <p className="text-sm font-medium text-muted-foreground">Vampire: The Masquerade Fifth Edition</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Character Creator</h1>
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
        values={draft.traits.attributes}
        allocation={attributes}
        onChange={(id, rating) => dispatch({ type: 'attribute', id, rating })}
      />
      <AllocationEditor
        kind="skills"
        groups={skillGroups}
        values={draft.traits.skills}
        allocation={skills}
        skillGrant={predatorGrant?.kind === 'skill-dot' && path.predator ? { skill: predatorGrant.skill, source: path.predator.name } : undefined}
        onChange={(id, rating) => dispatch({ type: 'skill', id, rating })}
      >
        <label className="grid gap-1.5 text-sm">
          Skill distribution
          <select
            className="ledger-field"
            value={draft.traits.distribution}
            onChange={event => {
              const distribution = skillDistributionIds.find(id => id === event.target.value)
              if (distribution) dispatch({ type: 'distribution', distribution })
            }}
          >
            {skillDistributionIds.map(id => <option key={id} value={id}>{skillDistributions[id].name}</option>)}
          </select>
        </label>
      </AllocationEditor>
      <SpecialtyEditor draft={draft.traits} specialties={specialties} dispatch={dispatch} />
      <ClanPathEditor draft={draft.clanPath} path={path} predatorGrant={predatorGrant} onChange={update => dispatch({ type: 'clan-path', update })} />
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <a className="text-foreground underline underline-offset-4 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300" href="https://astralarchives.games/">
          Return to Astral Archives
        </a>
        <p>V5 Core Rulebook, pp. 136, 155–171</p>
      </footer>
    </main>
  )
}
