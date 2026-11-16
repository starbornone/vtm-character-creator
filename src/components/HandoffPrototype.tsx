import { Download, Inbox, Send, X } from 'lucide-react'
import { useReducer, useRef, useState, type ReactNode } from 'react'
import maraBackup from '../../docs/examples/mara-vale-handoff-draft.json?raw'
import { rowanCharacter } from '../../tests/fixtures/rowan-pike.ts'
import { BriefNarrativeOptions } from '@/components/StorytellerBrief'
import { readDraftBackup } from '@/drafts/draft-backup'
import { chronicle, editWorkspace, exportHandoff, initialWorkspace, players, statusLabels, visibleHandoffs,
  type Handoff, type HandoffAction, type Player, type Role, type Workspace } from '@/prototype/handoff-review'
import { downloadTextFile } from '@/sharing/download-text'
import { makeStorytellerBrief, type BriefNarrative } from '@/sharing/storyteller-brief'

const mara = readDraftBackup(maraBackup).draft?.character
const playerIds = ['mara', 'rowan'] as const
type Dispatch = (action: HandoffAction) => void

function HandoffCard({ handoff, onExport, children }: {
  handoff: Handoff; onExport: () => void; children?: ReactNode
}) {
  return <article className="space-y-3 rounded-lg border border-border bg-background p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">{players[handoff.player]}</h3>
      <span role="status" className="rounded-md border border-border px-2 py-1 text-sm">{statusLabels[handoff.status]}</span>
    </div>
    {handoff.response && <p className="wrap-break-word whitespace-pre-wrap text-sm"><span className="font-medium">Storyteller response</span><br />{handoff.response}</p>}
    <details className="text-sm">
      <summary className="cursor-pointer font-medium">Read submitted brief</summary>
      <textarea aria-label={`${players[handoff.player]} submitted brief`} readOnly value={handoff.markdown} className="ledger-field mt-2 min-h-40 w-full font-mono" />
    </details>
    <button type="button" className="guide-button guide-action" onClick={onExport}><Download aria-hidden="true" />Export handoff JSON</button>
    {children}
  </article>
}

function ReviewForm({ handoff, act }: { handoff: Handoff; act: Dispatch }) {
  const [response, setResponse] = useState(handoff.response)
  const review = (decision: 'accepted' | 'changes-requested') => act({
    type: 'review', role: 'storyteller', player: handoff.player, revision: handoff.revision, decision, response,
  })
  return <div className="space-y-2 border-t border-border pt-3">
    <label className="grid gap-1 text-sm">Review response
      <textarea className="ledger-field w-full" rows={2} value={response} onChange={event => setResponse(event.target.value)} />
    </label>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="guide-button" onClick={() => review('changes-requested')}>Request changes</button>
      <button type="button" className="guide-button guide-button-primary" onClick={() => review('accepted')}>Accept</button>
    </div>
  </div>
}

function PlayerPreview({ player, fixed, replacing, send, cancel }: {
  player: Player; fixed: boolean; replacing: boolean; send: (markdown: string) => void; cancel: () => void
}) {
  const [narrative, setNarrative] = useState<BriefNarrative>({})
  const source = player === 'mara' ? mara : rowanCharacter
  if (!source) return <p role="alert">The fictional draft could not be loaded.</p>
  const draft = player === 'mara' && fixed ? {
    ...source, starting: { ...source.starting, purchases: [...source.starting.purchases, { kind: 'skill' as const, id: 'drive' as const, to: 2 }] },
  } : source
  const markdown = makeStorytellerBrief(draft, narrative)
  return <section aria-labelledby="prototype-preview" className="space-y-3 rounded-lg border border-border p-3 sm:p-4">
    <h3 id="prototype-preview" className="font-semibold">Preview handoff</h3>
    <p className="text-sm text-muted-foreground">The Storyteller can read and download this exact snapshot with its review.</p>
    <BriefNarrativeOptions narrative={narrative} onChange={setNarrative} />
    <textarea aria-label="Handoff Markdown preview" readOnly value={markdown} className="ledger-field min-h-48 w-full font-mono" />
    <div className="flex flex-wrap gap-2">
      <button type="button" className="guide-button guide-action guide-button-primary" onClick={() => send(markdown)}>
        <Send aria-hidden="true" />{replacing ? 'Send replacement' : 'Send handoff'}
      </button>
      <button type="button" className="guide-button" onClick={cancel}>Cancel preview</button>
    </div>
  </section>
}

function PlayerView({ player, workspace, act, onExport, fixed, fix }: {
  player: Player; workspace: Workspace; act: Dispatch; onExport: () => void; fixed: boolean; fix: () => void
}) {
  const [preview, setPreview] = useState(false)
  const [confirmWithdrawal, setConfirmWithdrawal] = useState(false)
  const membership = workspace.memberships[player]
  const [handoff] = visibleHandoffs(workspace, player)
  if (membership === 'none') return <p className="text-sm text-muted-foreground">No active invitation.</p>
  if (membership === 'invited') return <button type="button" className="guide-button guide-button-primary"
    onClick={() => act({ type: 'join', role: player, player })}>Accept invitation</button>

  return <div className="space-y-3">
    {handoff ? <HandoffCard handoff={handoff} onExport={onExport}>
      {confirmWithdrawal ? <div className="space-y-2">
        <p className="text-sm">Withdrawal removes the shared brief and the Storyteller response.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="guide-button guide-button-primary" onClick={() => {
            act({ type: 'withdraw', role: player, player, revision: handoff.revision })
            setConfirmWithdrawal(false)
            setPreview(false)
          }}>Confirm withdrawal</button>
          <button type="button" className="guide-button" onClick={() => setConfirmWithdrawal(false)}>Keep handoff</button>
        </div>
      </div> : <button type="button" className="guide-button" onClick={() => setConfirmWithdrawal(true)}>Withdraw handoff</button>}
    </HandoffCard> : <p role="status" className="text-sm text-muted-foreground">No handoff submitted.</p>}
    {player === 'mara' && handoff?.status === 'changes-requested' && !fixed && <button type="button" className="guide-button" onClick={fix}>
      Spend 6 XP on Drive in sample draft
    </button>}
    {preview ? <PlayerPreview player={player} fixed={fixed} replacing={Boolean(handoff)} cancel={() => setPreview(false)} send={markdown => {
      act({ type: 'submit', role: player, player, markdown, revision: handoff?.revision })
      setPreview(false)
    }} /> : <button type="button" className="guide-button guide-button-primary" onClick={() => setPreview(true)}>
      {handoff ? 'Preview replacement' : 'Preview handoff'}
    </button>}
  </div>
}

export function HandoffPrototype() {
  const [role, setRole] = useState<Role>('storyteller')
  const [fixed, setFixed] = useState(false)
  const [{ workspace, issue }, act] = useReducer((state: ReturnType<typeof editWorkspace>, action: HandoffAction) => editWorkspace(state.workspace, action), { workspace: initialWorkspace })
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  function download(player: Player) {
    const json = exportHandoff(workspace, role, player)
    if (json) downloadTextFile(json, `${player}-handoff.json`, 'application/json')
  }

  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" className="guide-button guide-action bg-background/85" onClick={() => dialog.current?.showModal()}>
      <Inbox aria-hidden="true" />Handoff prototype
    </button>
    <dialog ref={dialog} aria-labelledby="prototype-title" onClose={() => trigger.current?.focus()}
      className="fixed inset-0 m-auto max-h-none w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/70 print:hidden">
      <div className="flex max-h-[min(52rem,calc(100dvh-1.5rem))] flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border p-3 sm:p-5">
          <h2 id="prototype-title" className="text-lg font-semibold sm:text-2xl">Private handoff prototype</h2>
          <button type="button" className="guide-button guide-action" onClick={() => dialog.current?.close()}><X aria-hidden="true" />Close</button>
        </header>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <p className="text-sm text-muted-foreground">Use fictional roles to try the review flow. Reloading resets the demo.</p>
          <label className="grid max-w-xs gap-1 text-sm">Fictional role
            <select value={role} className="ledger-field" onChange={event => {
              const next = event.target.value
              if (next === 'storyteller' || next === 'mara' || next === 'rowan') setRole(next)
            }}>
              <option value="storyteller">Storyteller</option>
              {playerIds.map(player => <option key={player} value={player}>{players[player]}</option>)}
            </select>
          </label>
          {issue && <p role="alert" className="text-sm text-rose-300">{issue}</p>}
          {(role === 'storyteller' || workspace.memberships[role] !== 'none') && <h3 className="font-semibold">{chronicle}</h3>}
          {role === 'storyteller' ? <>
            <ul aria-label="Invitations" className="space-y-2">
              {playerIds.map(player => {
                const membership = workspace.memberships[player]
                const type = membership === 'invited' ? 'revoke' : 'invite'
                return <li key={player} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <span>{players[player]}{membership === 'member' && ' · Member'}</span>
                  {membership !== 'member' && <button type="button" className="guide-button" onClick={() => act({ type, role, player })}>
                    {type === 'invite' ? `Invite ${players[player]}` : `Revoke invitation for ${players[player]}`}
                  </button>}
                </li>
              })}
            </ul>
            {visibleHandoffs(workspace, role).length === 0 && <p className="text-sm text-muted-foreground">No handoffs to review.</p>}
            {visibleHandoffs(workspace, role).map(handoff => <HandoffCard key={handoff.player} handoff={handoff} onExport={() => download(handoff.player)}>
              <ReviewForm key={handoff.revision} handoff={handoff} act={act} />
            </HandoffCard>)}
          </> : <PlayerView key={role} player={role} workspace={workspace} act={act} onExport={() => download(role)} fixed={fixed} fix={() => setFixed(true)} />}
        </div>
      </div>
    </dialog>
  </>
}
