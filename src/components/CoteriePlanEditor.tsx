import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { NamedDraft } from '@/drafts/browser-drafts'
import { domainRatings, domainTraits, memberFromDraft, type CoteriePlan } from '@/rules/coterie-plan'

export function CoterieMemberDetails({ member }: { member: CoteriePlan['members'][number] }) {
  return <div className="min-w-0 break-words">
    <p className="font-medium">{member.name}</p>
    {member.relationships && <div className="mt-1 space-y-2 text-sm text-muted-foreground">
      {member.relationships.contacts.length > 0 && <ul aria-label="Copied people">
        {member.relationships.contacts.map((contact, index) => <li key={index}>{contact}</li>)}
      </ul>}
      {member.relationships.connections.length > 0 && <ul aria-label="Copied connections">
        {member.relationships.connections.map(({ from, label, to }, index) => <li key={index}>{from} → {to} · {label}</li>)}
      </ul>}
    </div>}
  </div>
}

export function CoteriePlanEditor({ plan, drafts, onChange }: {
  plan: CoteriePlan
  drafts: readonly NamedDraft[]
  onChange: (plan: CoteriePlan) => void
}) {
  const [memberName, setMemberName] = useState('')
  const [draftId, setDraftId] = useState('')
  const [includeRelationships, setIncludeRelationships] = useState(false)
  const choice = drafts.find(draft => draft.id === draftId)
  const changeDomain = (update: Partial<CoteriePlan['domain']>) => onChange({ ...plan, domain: { ...plan.domain, ...update } })

  return <div className="space-y-4">
    <section aria-labelledby="plan-coterie-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
      <h3 id="plan-coterie-heading" className="font-semibold">Coterie</h3>
      <label className="grid gap-1 text-sm">Coterie plan name
        <input className="ledger-field" value={plan.name} onChange={event => onChange({ ...plan, name: event.target.value })} />
      </label>
      <label className="grid gap-1 text-sm">Shared purpose
        <textarea className="ledger-field resize-y" rows={2} value={plan.purpose} onChange={event => onChange({ ...plan, purpose: event.target.value })} />
      </label>
    </section>
    <section aria-labelledby="plan-members-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
      <h3 id="plan-members-heading" className="font-semibold">Members</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <form className="space-y-2" onSubmit={event => {
          event.preventDefault()
          if (!choice) return
          onChange({ ...plan, members: [...plan.members, memberFromDraft(choice, crypto.randomUUID(), includeRelationships)] })
          setDraftId('')
          setIncludeRelationships(false)
        }}>
          <label className="grid gap-1 text-sm">Character draft
            <select className="ledger-field w-full" value={choice?.id ?? ''} onChange={event => {
              setDraftId(event.target.value)
              setIncludeRelationships(false)
            }}>
              <option value="">{drafts.length ? 'Choose a saved draft…' : 'No saved character drafts'}</option>
              {drafts.map(draft => <option key={draft.id} value={draft.id}>{draft.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-rose-300" disabled={!choice} checked={Boolean(choice && includeRelationships)}
              onChange={event => setIncludeRelationships(event.target.checked)} />
            Include Relationship Map details
          </label>
          <button type="submit" className="guide-button guide-action disabled:opacity-50" disabled={!choice}><Plus aria-hidden="true" />Add from draft</button>
        </form>
        <form className="space-y-2" onSubmit={event => {
          event.preventDefault()
          const name = memberName.trim()
          if (!name) return
          onChange({ ...plan, members: [...plan.members, { id: crypto.randomUUID(), name }] })
          setMemberName('')
        }}>
          <label className="grid gap-1 text-sm">Member name
            <input className="ledger-field" value={memberName} onChange={event => setMemberName(event.target.value)} />
          </label>
          <button type="submit" className="guide-button guide-action disabled:opacity-50" disabled={!memberName.trim()}><Plus aria-hidden="true" />Add member</button>
        </form>
      </div>
      {plan.members.length > 0 && <ul aria-label="Coterie members" className="space-y-2">
        {plan.members.map(member => <li key={member.id} className="flex min-w-0 flex-wrap items-start justify-between gap-2 rounded-md border border-border bg-background p-3">
          <CoterieMemberDetails member={member} />
          <button type="button" className="guide-button guide-action" aria-label={`Remove ${member.name} from plan`}
            onClick={() => onChange({ ...plan, members: plan.members.filter(entry => entry.id !== member.id) })}>
            <Trash2 aria-hidden="true" />Remove
          </button>
        </li>)}
      </ul>}
    </section>
    <section aria-labelledby="plan-domain-heading" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
      <h3 id="plan-domain-heading" className="font-semibold">Domain</h3>
      <label className="grid gap-1 text-sm">Domain name
        <input className="ledger-field" value={plan.domain.name} onChange={event => changeDomain({ name: event.target.value })} />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {domainTraits.map(({ id, name, description }) => <div key={id} className="grid gap-1 text-sm">
          <label htmlFor={`domain-${id}`}>{name}</label>
          <select id={`domain-${id}`} className="ledger-field" aria-describedby={`domain-${id}-description`} value={plan.domain[id]} onChange={event => {
            const rating = domainRatings.find(value => String(value) === event.target.value)
            if (rating !== undefined) changeDomain({ [id]: rating })
          }}>
            {domainRatings.map(rating => <option key={rating} value={rating}>{rating === 0 ? '0 dots' : `${rating} ${rating === 1 ? 'dot' : 'dots'}`}</option>)}
          </select>
          <span id={`domain-${id}-description`} className="text-muted-foreground">{description}</span>
        </div>)}
      </div>
      <label className="grid gap-1 text-sm">Domain notes
        <textarea className="ledger-field resize-y" rows={3} value={plan.domain.notes} onChange={event => changeDomain({ notes: event.target.value })} />
      </label>
      <p className="text-sm text-muted-foreground">Record ratings agreed at the table. Core pp. 195–196.</p>
    </section>
  </div>
}

export function CoterieHandoffSummary({ plan }: { plan: CoteriePlan }) {
  return <div className="space-y-3 break-words">
    <h4 className="font-semibold">{plan.name}</h4>
    {plan.purpose.trim() && <p className="whitespace-pre-wrap text-sm">{plan.purpose}</p>}
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      {plan.domain.name.trim() && <div><dt className="text-muted-foreground">Domain</dt><dd>{plan.domain.name}</dd></div>}
      {domainTraits.map(({ id, name }) => <div key={id}><dt className="text-muted-foreground">{name}</dt><dd>{plan.domain[id]}</dd></div>)}
      {plan.domain.notes.trim() && <div className="sm:col-span-2"><dt className="text-muted-foreground">Domain notes</dt><dd className="whitespace-pre-wrap">{plan.domain.notes}</dd></div>}
    </dl>
    {plan.members.length > 0 && <ul aria-label="Handoff members" className="space-y-2">
      {plan.members.map(member => <li key={member.id} className="rounded-md border border-border bg-background p-3"><CoterieMemberDetails member={member} /></li>)}
    </ul>}
  </div>
}
