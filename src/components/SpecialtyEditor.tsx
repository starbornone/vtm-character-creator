import type { Dispatch } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { skillIds, traitLabel } from '@/catalog/traits'
import type { evaluateTraitLedger, TraitAction, TraitDraft } from '@/rules/trait-ledger'

const specialtyIssues = {
  unrated: 'Assign at least one dot to this Skill to use its Specialty.',
  overfilled: 'Resolve the overfilled rating before using this Specialty.',
  limit: 'This Skill already has as many granted Specialties as dots. Raise the Skill or choose another.',
  duplicate: 'Choose a different name from the Specialty already granted on this Skill.',
}

interface SpecialtyEditorProps {
  draft: TraitDraft
  specialties: ReturnType<typeof evaluateTraitLedger>['specialties']
  dispatch: Dispatch<TraitAction>
}

export function SpecialtyEditor({ draft, specialties, dispatch }: SpecialtyEditorProps) {
  const { firstDotSlots, eligibleSkills, freeIssue, completed, total } = specialties
  const selectedSkill = draft.freeSpecialty.skill
  const hasInactiveSelection = selectedSkill && !eligibleSkills.includes(selectedSkill)

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="specialties-heading">
      <CardContent className="p-5 sm:p-7">
        <h2 id="specialties-heading" className="text-2xl font-semibold tracking-tight">Specialties</h2>
        <p role="status" className="mt-1 text-sm text-muted-foreground">{completed} of {total} named and eligible</p>
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">Free Specialty</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                Skill for free Specialty
                <select
                  className="ledger-field w-full"
                  value={selectedSkill}
                  disabled={eligibleSkills.length === 0 && !selectedSkill}
                  aria-invalid={Boolean(freeIssue) || undefined}
                  aria-describedby={freeIssue ? 'free-specialty-issue' : undefined}
                  onChange={event => dispatch({ type: 'free-specialty-skill', skill: skillIds.find(id => id === event.target.value) ?? '' })}
                >
                  <option value="">{eligibleSkills.length > 0 ? 'Choose a Skill' : 'Assign a Skill rating first'}</option>
                  {hasInactiveSelection && <option value={selectedSkill}>{traitLabel(selectedSkill)} (inactive)</option>}
                  {eligibleSkills.map(id => <option key={id} value={id}>{traitLabel(id)}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                Free Specialty name
                <input
                  className="ledger-field w-full"
                  value={draft.freeSpecialty.name}
                  disabled={!selectedSkill}
                  onChange={event => dispatch({ type: 'free-specialty-name', name: event.target.value })}
                />
              </label>
            </div>
            {freeIssue && <p id="free-specialty-issue" className="text-sm text-rose-300">{specialtyIssues[freeIssue]}</p>}
          </fieldset>
          <fieldset className="min-w-0 space-y-3 rounded-lg border border-border px-4 pb-4">
            <legend className="px-1.5 text-sm font-semibold">First-dot Specialties</legend>
            {firstDotSlots.length === 0 && (
              <p className="text-sm text-muted-foreground">Academics, Craft, Performance, and Science each grant a Specialty with their first dot.</p>
            )}
            {firstDotSlots.map(({ skill, active }) => (
              <label key={skill} className="grid gap-1.5 text-sm">
                {traitLabel(skill)} Specialty
                <input
                  className="ledger-field w-full"
                  value={draft.firstDotSpecialties[skill] ?? ''}
                  disabled={!active}
                  onChange={event => dispatch({ type: 'first-dot-specialty', skill, name: event.target.value })}
                />
                {!active && <span className="text-rose-300">Resolve this Skill’s rating to use its Specialty.</span>}
              </label>
            ))}
          </fieldset>
        </div>
      </CardContent>
    </Card>
  )
}
