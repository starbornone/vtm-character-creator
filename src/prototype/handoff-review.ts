export const players = { mara: 'Mara Vale', rowan: 'Rowan Pike' } as const
export type Player = keyof typeof players
export type Role = Player | 'storyteller'
type Membership = 'none' | 'invited' | 'member'
export type Decision = 'accepted' | 'changes-requested'

export interface Handoff {
  player: Player
  revision: number
  markdown: string
  status: 'awaiting-review' | Decision
  response: string
}

export interface Workspace {
  memberships: Record<Player, Membership>
  handoffs: Partial<Record<Player, Handoff>>
  nextRevision: number
}

export const chronicle = 'Last Call at the Lyric'
export const initialWorkspace: Workspace = { memberships: { mara: 'none', rowan: 'none' }, handoffs: {}, nextRevision: 1 }

export const statusLabels = { 'awaiting-review': 'Awaiting review', accepted: 'Accepted', 'changes-requested': 'Changes requested' }

export type HandoffAction = { role: Role; player: Player } & (
  | { type: 'invite' | 'revoke' | 'join' }
  | { type: 'submit'; markdown: string; revision: number | undefined }
  | { type: 'review'; revision: number; decision: Decision; response: string }
  | { type: 'withdraw'; revision: number }
)

export function visibleHandoffs(workspace: Workspace, role: Role) {
  if (role === 'storyteller') return Object.values(workspace.handoffs)
  const own = workspace.handoffs[role]
  return workspace.memberships[role] === 'member' && own ? [own] : []
}

export function editWorkspace(workspace: Workspace, action: HandoffAction): { workspace: Workspace; issue?: string } {
  const { role, player } = action
  const owner = role === 'storyteller'
  const own = role === player
  const membership = workspace.memberships[player]
  const handoff = workspace.handoffs[player]
  const denied = { workspace, issue: 'This action is unavailable for the selected role.' }
  const stale = { workspace, issue: 'The handoff changed. Reopen it before continuing.' }
  const setMember = (value: Membership) => ({ ...workspace, memberships: { ...workspace.memberships, [player]: value } })
  const withoutHandoff = (next: Workspace) => {
    const handoffs = { ...next.handoffs }
    delete handoffs[player]
    return { workspace: { ...next, handoffs } }
  }

  switch (action.type) {
    case 'invite': return owner && membership === 'none' ? { workspace: setMember('invited') } : denied
    case 'revoke': return owner && membership === 'invited' ? { workspace: setMember('none') } : denied
    case 'join': return own && membership === 'invited' ? { workspace: setMember('member') } : denied
    case 'submit': {
      if (!own || membership !== 'member' || !action.markdown.trim()) return denied
      if (action.revision !== handoff?.revision) return stale
      const revision = workspace.nextRevision
      return { workspace: { ...workspace, nextRevision: revision + 1, handoffs: {
        ...workspace.handoffs, [player]: { player, revision, markdown: action.markdown, status: 'awaiting-review', response: '' },
      } } }
    }
    case 'review':
      if (!owner || membership !== 'member') return denied
      if (!handoff || action.revision !== handoff.revision) return stale
      return { workspace: { ...workspace, handoffs: {
        ...workspace.handoffs, [player]: { ...handoff, status: action.decision, response: action.response.trim() },
      } } }
    case 'withdraw':
      if (!own || membership !== 'member') return denied
      return handoff && action.revision === handoff.revision ? withoutHandoff(workspace) : stale
  }
}

export function exportHandoff(workspace: Workspace, role: Role, player: Player) {
  const handoff = visibleHandoffs(workspace, role).find(entry => entry.player === player)
  if (!handoff) return undefined
  const { markdown, status, response } = handoff
  return JSON.stringify({ format: 'vtm-storyteller-handoff', schemaVersion: 1, ruleset: 'vtm-v5', chronicle, markdown, status, response }, null, 2) + '\n'
}
