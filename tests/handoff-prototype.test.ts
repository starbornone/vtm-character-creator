import assert from 'node:assert/strict'
import test from 'node:test'
import { editWorkspace, exportHandoff, initialWorkspace, visibleHandoffs, type HandoffAction } from '../src/prototype/handoff-review.ts'

function demo() {
  let workspace = initialWorkspace
  return {
    act(action: HandoffAction) {
      const result = editWorkspace(workspace, action)
      workspace = result.workspace
      return result.issue
    },
    get workspace() { return workspace },
  }
}

test('invitations are scoped to a player and can be revoked or redeemed once', () => {
  const { act } = demo()
  assert.ok(act({ type: 'join', role: 'mara', player: 'mara' }))
  assert.equal(act({ type: 'invite', role: 'storyteller', player: 'mara' }), undefined)
  assert.ok(act({ type: 'join', role: 'rowan', player: 'mara' }))
  assert.equal(act({ type: 'revoke', role: 'storyteller', player: 'mara' }), undefined)
  assert.ok(act({ type: 'join', role: 'mara', player: 'mara' }))
  assert.equal(act({ type: 'invite', role: 'storyteller', player: 'mara' }), undefined)
  assert.equal(act({ type: 'join', role: 'mara', player: 'mara' }), undefined)
  assert.ok(act({ type: 'join', role: 'mara', player: 'mara' }))
})

test('two players can submit independently while the Storyteller reviews both', () => {
  const state = demo()
  for (const player of ['mara', 'rowan'] as const) {
    assert.equal(state.act({ type: 'invite', role: 'storyteller', player }), undefined)
    assert.equal(state.act({ type: 'join', role: player, player }), undefined)
    assert.equal(state.act({ type: 'submit', role: player, player, markdown: `# ${player} submitted brief`, revision: undefined }), undefined)
  }
  assert.deepEqual(visibleHandoffs(state.workspace, 'storyteller').map(handoff => handoff.player), ['mara', 'rowan'])
  assert.deepEqual(visibleHandoffs(state.workspace, 'rowan').map(handoff => handoff.player), ['rowan'])
  assert.equal(exportHandoff(state.workspace, 'rowan', 'mara'), undefined)
  assert.ok(state.act({ type: 'withdraw', role: 'mara', player: 'rowan', revision: 2 }))
  assert.ok(state.act({ type: 'review', role: 'mara', player: 'mara', revision: 1, decision: 'accepted', response: '' }))
  assert.equal(state.act({ type: 'review', role: 'storyteller', player: 'rowan', revision: 2, decision: 'accepted', response: 'Ready to play' }), undefined)
  const json = exportHandoff(state.workspace, 'rowan', 'rowan')
  assert.ok(json)
  assert.deepEqual(JSON.parse(json), {
    format: 'vtm-storyteller-handoff', schemaVersion: 1, ruleset: 'vtm-v5', chronicle: 'Last Call at the Lyric',
    markdown: '# rowan submitted brief', status: 'accepted', response: 'Ready to play',
  })
  assert.equal(json, exportHandoff(state.workspace, 'storyteller', 'rowan'))
})

test('replacing clears the review, rejects stale actions and withdrawal removes the shared copy', () => {
  const state = demo()
  const player = 'mara'
  state.act({ type: 'invite', role: 'storyteller', player })
  state.act({ type: 'join', role: player, player })
  state.act({ type: 'submit', role: player, player, markdown: '6 XP remaining', revision: undefined })
  state.act({ type: 'review', role: 'storyteller', player, revision: 1, decision: 'changes-requested', response: 'Spend the remaining XP' })
  assert.match(exportHandoff(state.workspace, player, player) ?? '', /Spend the remaining XP/)
  assert.equal(state.act({ type: 'submit', role: player, player, markdown: '0 XP remaining', revision: 1 }), undefined)
  assert.deepEqual(state.workspace.handoffs[player], { player, revision: 2, markdown: '0 XP remaining', status: 'awaiting-review', response: '' })
  assert.match(state.act({ type: 'review', role: 'storyteller', player, revision: 1, decision: 'accepted', response: '' }) ?? '', /changed/)
  assert.match(state.act({ type: 'withdraw', role: player, player, revision: 1 }) ?? '', /changed/)
  assert.equal(state.act({ type: 'withdraw', role: player, player, revision: 2 }), undefined)
  assert.deepEqual(visibleHandoffs(state.workspace, 'storyteller'), [])
  assert.equal(exportHandoff(state.workspace, player, player), undefined)
  assert.equal(state.workspace.memberships[player], 'member')
})
