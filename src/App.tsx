import { ArrowLeft, ArrowRight, BookOpen, Compass, Droplets, FileText, NotebookPen, Printer, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { playersGuide } from '@/catalog/source-packs'
import { traitGroups } from '@/catalog/traits'
import { AllocationEditor } from '@/components/AllocationEditor'
import { CharacterSheet } from '@/components/CharacterSheet'
import { ClanPathEditor } from '@/components/ClanPathEditor'
import { DraftControls } from '@/components/DraftControls'
import { ConceptEditor, RelationshipEditor } from '@/components/NarrativeEditors'
import { ShareBuildControls, SharedBuild } from '@/components/SharedBuild'
import { SpecialtyEditor } from '@/components/SpecialtyEditor'
import { StartingExperienceEditor } from '@/components/StartingExperienceEditor'
import { StartingOptionsEditor } from '@/components/StartingOptionsEditor'
import { StorytellerBrief } from '@/components/StorytellerBrief'
import { useBrowserDrafts } from '@/drafts/use-browser-drafts'
import { evaluateCharacter, guideSteps, type GuideStep } from '@/rules/character-guide'
import { skillDistributionIds, skillDistributions } from '@/rules/trait-ledger'
import { buildLinkPrefix } from '@/sharing/build-link'

const attributeGroups = traitGroups.map(({ name, attributes }) => ({ name, ids: attributes }))
const skillGroups = traitGroups.map(({ name, skills }) => ({ name, ids: skills }))
const editSteps = guideSteps.filter(step => step.id !== 'review')
const stepIcons = {
  concept: NotebookPen,
  clan: Droplets,
  traits: SlidersHorizontal,
  starting: Compass,
  relationships: UsersRound,
  review: FileText,
}

export function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const drafts = useBrowserDrafts()

  useEffect(() => {
    const update = () => setHash(window.location.hash)
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  function closePreview() {
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState(window.history.state, '', url)
    setHash('')
  }

  if (hash.startsWith(buildLinkPrefix)) return (
    <SharedBuild key={hash} hash={hash} library={drafts.library} onClose={closePreview} onSave={snapshot => {
      const result = drafts.restore(snapshot)
      if (result.restored) closePreview()
      return result
    }} />
  )
  return <CharacterCreator drafts={drafts} />
}

function CharacterCreator({ drafts }: { drafts: ReturnType<typeof useBrowserDrafts> }) {
  const { character: draft, step, id, name } = drafts.open
  const { dispatch } = drafts
  const panel = useRef<HTMLDivElement>(null)
  const shouldFocus = useRef(false)
  const { ageProfile, path, traits, starting, tracks, sheet, pending, sourceIssues } = evaluateCharacter(draft)
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
    drafts.goTo(target)
  }

  return (
    <main className="creator-shell mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-8 sm:py-12">
      <header className="border-l-2 border-primary pl-4 print:hidden sm:pl-5">
        <p className="text-sm font-medium text-muted-foreground">Vampire: The Masquerade Fifth Edition</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Character Creator</h1>
      </header>

      <DraftControls
        library={drafts.library}
        activeId={id}
        name={name}
        dirty={drafts.dirty}
        issue={drafts.issue}
        onSave={drafts.save}
        onSwitch={draftId => {
          if (!drafts.switchDraft(draftId)) return false
          requestAnimationFrame(() => panel.current?.focus())
          return true
        }}
        onDownload={drafts.download}
        onRestore={snapshot => {
          const result = drafts.restore(snapshot)
          if (result.restored) requestAnimationFrame(() => panel.current?.focus())
          return result
        }}
      />

      <nav aria-label="Character creation steps" className="print:hidden">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {guideSteps.map(option => {
            const Icon = stepIcons[option.id]
            return <li key={option.id}>
              <button type="button" className="guide-button guide-action h-full w-full text-left max-[360px]:gap-1 max-[360px]:px-1" aria-current={option.id === step ? 'step' : undefined} onClick={() => goTo(option.id)}>
                <Icon aria-hidden="true" />
                {option.title}
              </button>
            </li>
          })}
        </ol>
      </nav>

      <div ref={panel} tabIndex={-1} role="region" aria-label={`${guideSteps[index].title} step`} className="space-y-4 focus:outline-none print:hidden">
        {step === 'concept' && <>
          <ConceptEditor draft={draft.concept} onChange={update => dispatch({ type: 'concept', update })}
            ageProfile={ageProfile} onAgeProfile={profile => dispatch({ type: 'age-profile', profile })} />
          <fieldset className="space-y-2 rounded-xl border border-border bg-card p-5 sm:p-7">
            <legend className="px-2 font-semibold"><span className="guide-action"><BookOpen aria-hidden="true" />Rule sources</span></legend>
            <label className="flex min-h-9 items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                checked={path.sourcePacks.includes(playersGuide.id)} onChange={event => dispatch({ type: 'players-guide', enabled: event.target.checked })} />
              Enable Player’s Guide
            </label>
            <p className="text-sm text-muted-foreground">Core is always available. The Player’s Guide adds selected clans, Predator Types, and powers to this draft.</p>
            {sourceIssues.map(issue => <p key={issue} role="status" className="text-sm text-rose-300">{issue}</p>)}
          </fieldset>
        </>}
        {step === 'traits' && <>
            <dl aria-live="polite" className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-r border-border px-4 py-3 sm:px-6">
                <dt className="text-sm font-medium text-muted-foreground">Health</dt>
                <dd className="mt-1 text-3xl font-semibold tabular-nums">{health.total ?? '—'}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">Stamina ({health.stamina ?? '—'}) + 3{health.resilience > 0 ? ` + Resilience (${health.resilience})` : ''}{health.stamina !== traits.health.stamina ? ' · includes XP' : ''}</dd>
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
        {step === 'clan' && <ClanPathEditor draft={draft.clanPath} path={path} predatorGrant={predatorGrant} finalRatings={starting.final.disciplines} useFledgling={() => dispatch({ type: 'age-profile', profile: 'fledgling' })} onChange={update => dispatch({ type: 'clan-path', update })} />}
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
                <p className="mt-1 text-sm text-muted-foreground">{sheet.draft ? 'Open choices remain. The printed sheet will be marked Draft.' : sheet.reviews.length ? 'Starting choices are filled in. See the Storyteller review notes on the sheet.' : 'All starting choices are resolved.'}</p>
              </div>
              <button type="button" className="guide-button guide-action guide-button-primary" onClick={() => window.print()}><Printer aria-hidden="true" />Print character sheet</button>
            </div>
            <ShareBuildControls key={id ?? 'unnamed'} draft={draft} />
            <StorytellerBrief key={`brief-${id ?? 'unnamed'}`} draft={draft} />
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
          <div>{previous && <button type="button" className="guide-button guide-action" onClick={() => goTo(previous.id)}><ArrowLeft aria-hidden="true" />Back to {previous.title}</button>}</div>
          <p className="text-sm text-muted-foreground">{editSteps.length - openSteps.length} of {editSteps.length} sections complete</p>
          {next && <button type="button" className="guide-button guide-action guide-button-primary" onClick={() => goTo(next.id)}>Continue to {next.title}<ArrowRight aria-hidden="true" /></button>}
        </div>
      </div>

      <div className={step === 'review' ? 'sheet-panel' : 'sheet-panel hidden'}><CharacterSheet sheet={sheet} /></div>

    </main>
  )
}
