import { useReducer } from 'react'
import { traitGroups } from '@/catalog/traits'
import { AllocationEditor } from '@/components/AllocationEditor'
import { ClanPathEditor } from '@/components/ClanPathEditor'
import { SpecialtyEditor } from '@/components/SpecialtyEditor'
import { StartingExperienceEditor } from '@/components/StartingExperienceEditor'
import { StartingOptionsEditor } from '@/components/StartingOptionsEditor'
import { evaluateClanPath, initialClanPath, type ClanPathDraft } from '@/rules/clan-path'
import { evaluateStartingBuild, initialStartingDraft, type StartingDraft } from '@/rules/starting-xp'
import { deriveTracks, editTraits, evaluateTraitLedger, initialTraitDraft, skillDistributionIds, skillDistributions, type TraitAction } from '@/rules/trait-ledger'

const attributeGroups = traitGroups.map(({ name, attributes }) => ({ name, ids: attributes }))
const skillGroups = traitGroups.map(({ name, skills }) => ({ name, ids: skills }))
const initialDraft = { traits: initialTraitDraft, clanPath: initialClanPath, starting: initialStartingDraft }

type CharacterAction = TraitAction | { type: 'clan-path'; update: Partial<ClanPathDraft> } | { type: 'starting'; update: Partial<StartingDraft> }

function editDraft(draft: typeof initialDraft, action: CharacterAction) {
  if (action.type === 'clan-path') return { ...draft, clanPath: { ...draft.clanPath, ...action.update } }
  if (action.type === 'starting') return { ...draft, starting: { ...draft.starting, ...action.update } }
  return { ...draft, traits: editTraits(draft.traits, action) }
}

export function App() {
  const [draft, dispatch] = useReducer(editDraft, initialDraft)
  const path = evaluateClanPath(draft.clanPath)
  const traits = evaluateTraitLedger(draft.traits, path.grantedSpecialty)
  const { attributes, skills, specialties } = traits
  const starting = evaluateStartingBuild(draft.starting, draft.traits, traits, path)
  const { health, willpower } = deriveTracks(starting.final.attributes)
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
          <dd className="mt-1 text-sm text-muted-foreground">Stamina ({health.stamina ?? '—'}) + 3{health.total !== traits.health.total ? ' · includes XP' : ''}</dd>
        </div>
        <div className="px-4 py-3 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">Willpower</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums">{willpower.total ?? '—'}</dd>
          <dd className="mt-1 text-sm text-muted-foreground">Composure ({willpower.composure ?? '—'}) + Resolve ({willpower.resolve ?? '—'}){willpower.total !== traits.willpower.total ? ' · includes XP' : ''}</dd>
        </div>
      </dl>

      <AllocationEditor
        kind="attributes"
        groups={attributeGroups}
        values={draft.traits.attributes}
        allocation={attributes}
        finalRatings={starting.final.attributes}
        onChange={(id, rating) => dispatch({ type: 'attribute', id, rating })}
      />
      <AllocationEditor
        kind="skills"
        groups={skillGroups}
        values={draft.traits.skills}
        allocation={skills}
        finalRatings={starting.final.skills}
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
      <ClanPathEditor draft={draft.clanPath} path={path} predatorGrant={predatorGrant} finalRatings={starting.final.disciplines} onChange={update => dispatch({ type: 'clan-path', update })} />
      <StartingOptionsEditor draft={draft.starting} build={starting} onChange={update => dispatch({ type: 'starting', update })} />
      <StartingExperienceEditor build={starting} purchases={draft.starting.purchases} onChange={purchases => dispatch({ type: 'starting', update: { purchases } })} />
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <a className="text-foreground underline underline-offset-4 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300" href="https://astralarchives.games/">
          Return to Astral Archives
        </a>
        <p>V5 Core Rulebook, pp. 130–137, 155–216</p>
      </footer>
    </main>
  )
}
