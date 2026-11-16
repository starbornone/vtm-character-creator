import { useEffect, useReducer, useRef, useState } from 'react'
import { traitGroups } from '@/catalog/traits'
import { AllocationEditor } from '@/components/AllocationEditor'
import { CharacterSheet } from '@/components/CharacterSheet'
import { ClanPathEditor } from '@/components/ClanPathEditor'
import { ConceptEditor, RelationshipEditor } from '@/components/NarrativeEditors'
import { SpecialtyEditor } from '@/components/SpecialtyEditor'
import { StartingExperienceEditor } from '@/components/StartingExperienceEditor'
import { StartingOptionsEditor } from '@/components/StartingOptionsEditor'
import { editCharacter, evaluateCharacter, guideSteps, initialCharacterDraft, type GuideStep } from '@/rules/character-guide'
import { skillDistributionIds, skillDistributions } from '@/rules/trait-ledger'

const attributeGroups = traitGroups.map(({ name, attributes }) => ({ name, ids: attributes }))
const skillGroups = traitGroups.map(({ name, skills }) => ({ name, ids: skills }))
const editSteps = guideSteps.filter(step => step.id !== 'review')

export function App() {
  const [draft, dispatch] = useReducer(editCharacter, initialCharacterDraft)
  const [step, setStep] = useState<GuideStep>('concept')
  const panel = useRef<HTMLDivElement>(null)
  const shouldFocus = useRef(false)
  const { path, traits, starting, tracks, sheet, pending } = evaluateCharacter(draft)
  const { attributes, skills, specialties } = traits
  const { health, willpower } = tracks
  const { predatorGrant } = specialties
  const index = guideSteps.findIndex(option => option.id === step)
  const previous = guideSteps[index - 1]
  const next = guideSteps[index + 1]
  const openSteps = editSteps.filter(option => pending[option.id].length > 0)

  useEffect(() => {
    if (shouldFocus.current) {
      panel.current?.focus()
      shouldFocus.current = false
    }
  }, [step])

  function goTo(target: GuideStep) {
    if (target === step) return
    shouldFocus.current = true
    setStep(target)
  }

  return (
    <main className="creator-shell mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-12">
      <header className="border-l-2 border-primary pl-4 print:hidden sm:pl-5">
        <p className="text-sm font-medium text-muted-foreground">Vampire: The Masquerade Fifth Edition</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Character Creator</h1>
      </header>

      <nav aria-label="Character creation steps" className="print:hidden">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {guideSteps.map(option => <li key={option.id}>
            <button type="button" className="guide-button h-full w-full text-left" aria-current={option.id === step ? 'step' : undefined} onClick={() => goTo(option.id)}>{option.title}</button>
          </li>)}
        </ol>
      </nav>

      <div ref={panel} tabIndex={-1} role="region" aria-label={`${guideSteps[index].title} step`} className="space-y-4 focus:outline-none print:hidden">
        {step === 'concept' && <ConceptEditor draft={draft.concept} onChange={update => dispatch({ type: 'concept', update })} />}
        {step === 'traits' && <>
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
        </>}
        {step === 'clan' && <ClanPathEditor draft={draft.clanPath} path={path} predatorGrant={predatorGrant} finalRatings={starting.final.disciplines} onChange={update => dispatch({ type: 'clan-path', update })} />}
        {step === 'starting' && <>
            <StartingOptionsEditor draft={draft.starting} build={starting} onChange={update => dispatch({ type: 'starting', update })} />
            <StartingExperienceEditor build={starting} purchases={draft.starting.purchases} onChange={purchases => dispatch({ type: 'starting', update: { purchases } })} />
        </>}
        {step === 'relationships' && <RelationshipEditor draft={draft.relationships} onChange={update => dispatch({ type: 'relationships', update })} />}
        {step === 'review' && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-7" aria-labelledby="review-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="review-heading" className="text-2xl font-semibold tracking-tight">Review &amp; Print</h2>
                <p className="mt-1 text-sm text-muted-foreground">{sheet.draft ? 'Open choices remain. The printed sheet will be marked Draft.' : 'All starting choices are resolved.'}</p>
              </div>
              <button type="button" className="guide-button guide-button-primary" onClick={() => window.print()}>Print character sheet</button>
            </div>
            {openSteps.length > 0 && <ul aria-label="Open choices" className="grid gap-3 sm:grid-cols-2">
              {openSteps.map(option => <li key={option.id} className="rounded-lg border border-border px-3 py-2">
                <button type="button" className="font-medium text-rose-300 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-rose-300" onClick={() => goTo(option.id)}>{option.title}</button>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {pending[option.id].map(issue => <li key={issue}>{issue}</li>)}
                </ul>
              </li>)}
            </ul>}
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>{previous && <button type="button" className="guide-button" onClick={() => goTo(previous.id)}>Back to {previous.title}</button>}</div>
          <p className="text-sm text-muted-foreground">{editSteps.length - openSteps.length} of {editSteps.length} sections complete</p>
          {next && <button type="button" className="guide-button guide-button-primary" onClick={() => goTo(next.id)}>Continue to {next.title}</button>}
        </div>
      </div>

      <div className={step === 'review' ? 'sheet-panel' : 'sheet-panel hidden'}><CharacterSheet sheet={sheet} /></div>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground print:hidden">
        <a className="text-foreground underline underline-offset-4 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300" href="https://astralarchives.games/">
          Return to Astral Archives
        </a>
        <p>V5 Core Rulebook, pp. 130–137, 155–216</p>
      </footer>
    </main>
  )
}
