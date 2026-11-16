import { useState } from 'react'
import { disciplinePowers, disciplines, type DisciplineId } from '@/catalog/clan-path'
import { advantageIds, startingAdvantages } from '@/catalog/starting-options'
import { skillIds, traitLabel } from '@/catalog/traits'
import { Card, CardContent } from '@/components/ui/card'
import { attributeIds, neonate, purchaseLabel, quotePurchase, type evaluateStartingBuild, type Purchase } from '@/rules/starting-xp'
import { specialtySkills } from '@/rules/trait-ledger'

type Build = ReturnType<typeof evaluateStartingBuild>
const categories = {
  skill: 'Skill', attribute: 'Attribute', specialty: 'Specialty', discipline: 'Clan Discipline', advantage: 'Advantage', 'blood-potency': 'Blood Potency',
} satisfies Record<Purchase['kind'], string>
const kinds = Object.keys(categories) as Purchase['kind'][]
const disciplineIds = Object.keys(disciplines) as DisciplineId[]

function targets(kind: Purchase['kind']) {
  switch (kind) {
    case 'skill':
    case 'specialty': return skillIds.map(id => ({ id, name: traitLabel(id) }))
    case 'attribute': return attributeIds.map(id => ({ id, name: traitLabel(id) }))
    case 'discipline': return disciplineIds.map(id => ({ id, name: disciplines[id] }))
    case 'advantage': return advantageIds.map(id => ({ id, name: startingAdvantages[id].name }))
    case 'blood-potency': return []
  }
}

function purchaseFor(kind: Purchase['kind'], target: string, name: string, state: Build['final']): Purchase | undefined {
  switch (kind) {
    case 'skill': {
      const id = skillIds.find(id => id === target)
      if (id) return { kind, id, to: (state.skills[id] ?? 0) + 1, specialty: name }
      break
    }
    case 'attribute': {
      const id = attributeIds.find(id => id === target)
      if (id) return { kind, id, to: (state.attributes[id] ?? 0) + 1 }
      break
    }
    case 'specialty': {
      const id = skillIds.find(id => id === target)
      if (id) return { kind, id, name }
      break
    }
    case 'discipline': {
      const id = disciplineIds.find(id => id === target)
      if (id) return { kind, id, to: (state.disciplines[id] ?? 0) + 1, power: name }
      break
    }
    case 'advantage': {
      const id = advantageIds.find(id => id === target)
      const to = id && startingAdvantages[id].dots.find(dots => dots > (state.advantages[id] ?? 0))
      if (id && to) return { kind, id, to }
      break
    }
    case 'blood-potency':
      if (state.bloodPotency < neonate.maxBloodPotency) return { kind, to: state.bloodPotency === 1 ? 2 : 3 }
  }
}

const actionClass = 'rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:opacity-40'

export function StartingExperienceEditor({ build, purchases, onChange }: {
  build: Build
  purchases: readonly Purchase[]
  onChange: (purchases: Purchase[]) => void
}) {
  const [kind, setKind] = useState<Purchase['kind']>('skill')
  const [target, setTarget] = useState('')
  const [name, setName] = useState('')
  const purchase = purchaseFor(kind, target, name, build.final)
  const quote = purchase ? quotePurchase(build.final, purchase) : undefined
  const needsName = kind === 'specialty' || (purchase?.kind === 'skill' && purchase.to === 1 && specialtySkills.some(id => id === purchase.id))
  const powers = purchase?.kind === 'discipline' ? disciplinePowers[purchase.id].filter(power => power.level <= purchase.to && !build.final.powers.includes(power.id)) : []

  function move(index: number, offset: number) {
    const next = [...purchases]
    const [entry] = next.splice(index, 1)
    next.splice(index + offset, 0, entry)
    onChange(next)
  }

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="starting-xp-heading">
      <CardContent className="space-y-4 p-5 sm:p-7">
        <div>
          <h2 id="starting-xp-heading" className="text-2xl font-semibold tracking-tight">Starting XP</h2>
          <p role="status" className="mt-1 text-sm text-muted-foreground">{build.final.remaining} / {neonate.xp} XP remaining</p>
        </div>
        <div className="grid items-end gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">Purchase type
            <select className="ledger-field" value={kind} onChange={event => {
              const selected = kinds.find(item => item === event.target.value)
              if (selected) setKind(selected)
              setTarget('')
              setName('')
            }}>
              {kinds.map(id => <option key={id} value={id}>{categories[id]}</option>)}
            </select>
          </label>
          {kind !== 'blood-potency' && <label className="grid gap-1 text-sm">Purchase target
            <select className="ledger-field" value={target} onChange={event => { setTarget(event.target.value); setName('') }}>
              <option value="">Choose…</option>
              {targets(kind).map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </label>}
          {needsName && <label className="grid gap-1 text-sm">{kind === 'skill' ? 'Granted first-dot Specialty' : 'Purchased Specialty name'}
            <input className="ledger-field" value={name} onChange={event => setName(event.target.value)} />
          </label>}
          {purchase?.kind === 'discipline' && <label className="grid gap-1 text-sm">New Discipline power
            <select className="ledger-field" value={name} onChange={event => setName(event.target.value)}>
              <option value="">Choose…</option>
              {powers.map(power => <option key={power.id} value={power.id}>{power.name} · Core p. {power.page}</option>)}
            </select>
          </label>}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
            <button type="button" className={actionClass} disabled={!purchase || Boolean(quote?.issue)} onClick={() => {
              if (purchase && !quote?.issue) onChange([...purchases, purchase])
              setName('')
            }}>Add purchase</button>
            <p className="text-sm text-muted-foreground" role="status">
              {purchase && quote?.cost !== undefined && `${purchaseLabel(purchase)} · ${quote.cost} XP. `}{quote?.issue ?? (!purchase && target ? 'This option is already at its maximum.' : '')}
            </p>
          </div>
        </div>
        {build.entries.length > 0 && <ol aria-label="Ordered XP purchases" className="space-y-2">
          {build.entries.map((entry, index) => <li key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 px-3 py-2">
            <div>
              <p className="font-medium">{entry.label}</p>
              <p className={`text-sm ${entry.issue ? 'text-rose-300' : 'text-muted-foreground'}`}>{entry.issue ?? `${entry.cost} XP · ${entry.remaining} left`}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={actionClass} aria-label={`Move ${entry.label} earlier`} disabled={index === 0} onClick={() => move(index, -1)}>Earlier</button>
              <button type="button" className={actionClass} aria-label={`Move ${entry.label} later`} disabled={index === purchases.length - 1} onClick={() => move(index, 1)}>Later</button>
              <button type="button" className={actionClass} aria-label={`Remove ${entry.label}`} onClick={() => onChange(purchases.filter((_, offset) => offset !== index))}>Remove</button>
            </div>
          </li>)}
        </ol>}
      </CardContent>
    </Card>
  )
}
