import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRestoredDraft, loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { characterEndpoint, endpointKey, endpointLabel, recordedEndpoints, removeMapPerson, type RelationshipMapDraft } from '../src/rules/relationship-map.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

const mira = { kind: 'person', id: 'person-mira' } as const
const jo = { kind: 'touchstone', name: maraCharacter.relationships.convictions[0].touchstone } as const
const map: RelationshipMapDraft = {
  people: [{ id: mira.id, name: 'Mira Blackwell' }],
  connections: [
    { id: 'connection-1', from: characterEndpoint, to: mira, label: 'Owes a favor' },
    { id: 'connection-2', from: mira, to: jo, label: 'Knows the stage manager' },
  ],
}
const character = editCharacter(maraCharacter, { type: 'relationship-map', map })
const draft = { name: 'Mara Vale and her allies', step: 'relationships', character } as const

test('recorded endpoints follow the draft and preserve identity after reordering Touchstones', () => {
  const first = { conviction: 'Keep my word', touchstone: 'Jo Reyes' }
  const second = { conviction: 'Keep the doors open', touchstone: 'Ada Rose' }
  const seeded = { ...maraCharacter.relationships, coterie: 'Night Shift', convictions: [first, second] }
  const seeds = recordedEndpoints(seeded)
  assert.deepEqual(seeds.map(endpoint => endpointLabel(endpoint, '', map)), ['Inez Varga (Sire)', 'Night Shift (Coterie)', 'Jo Reyes (Touchstone)', 'Ada Rose (Touchstone)'])
  assert.deepEqual(recordedEndpoints({ ...seeded, convictions: [second, first] }).map(endpointKey).sort(), seeds.map(endpointKey).sort())
  const revised = editCharacter(character, { type: 'relationships', update: { convictions: [second] } })
  const earlierEndpoint = revised.relationshipMap?.connections[1].to
  assert.deepEqual(earlierEndpoint, jo)
  assert.ok(earlierEndpoint && !recordedEndpoints(revised.relationships).some(endpoint => endpointKey(endpoint) === endpointKey(earlierEndpoint)))
  assert.equal(endpointLabel(jo, '', map), `${jo.name} (Touchstone)`)
  assert.deepEqual(evaluateCharacter(character).sheet, evaluateCharacter(maraCharacter).sheet)
})

test('removing a person removes only that person and their connections', () => {
  const unrelated = { id: 'connection-3', from: characterEndpoint, to: jo, label: 'Looks after' }
  assert.deepEqual(removeMapPerson({ ...map, connections: [...map.connections, unrelated] }, mira.id), { people: [], connections: [unrelated] })
  assert.equal(editCharacter(character, { type: 'relationship-map', map: removeMapPerson(map, mira.id) }).relationshipMap, undefined)
  assert.equal(character.relationshipMap?.connections.length, 2)
})

test('version seven backup and browser reload preserve the map alongside a legacy draft', () => {
  const file = serializeDraftDownload(draft)
  const envelope = JSON.parse(file)
  assert.equal(envelope.schemaVersion, 7)
  assert.equal(JSON.parse(serializeDraftDownload({ ...draft, character: maraCharacter })).schemaVersion, 1)
  const preview = readDraftBackup(file)
  assert.deepEqual(preview.draft, draft)
  assert.ok(preview.draft)
  const original = { ...draft, id: 'original' }
  const legacy = { ...original, id: 'legacy', name: 'Original Mara', character: maraCharacter }
  const library = { activeId: original.id, drafts: [legacy, original] }
  let raw: string | null = null
  const storage: GetStorage = () => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } })
  const before = saveDraftLibrary(storage, library, null)
  assert.ok(before.saved)
  assert.deepEqual(loadDraftLibrary(storage).library, library)
  const copy = appendRestoredDraft(library, { ...preview.draft, name: 'Mara copy' }, 'copy')
  assert.ok(copy.library)
  assert.ok(saveDraftLibrary(storage, copy.library, before.saved).saved)
  const restored = loadDraftLibrary(storage).library
  assert.equal(restored.activeId, 'copy')
  assert.deepEqual(restored.drafts.slice(0, 2), library.drafts)
  assert.equal(restored.drafts[2].step, 'relationships')
  assert.deepEqual(restored.drafts[2].character.relationshipMap, map)
  assert.match(readDraftBackup(JSON.stringify({ ...envelope, schemaVersion: 6 })).issue ?? '', /do not match/)
})

test('malformed graphs and unavailable sources are rejected before restoring', () => {
  const envelope = JSON.parse(serializeDraftDownload(draft))
  const [first] = map.connections
  const invalid = [
    { ...map, people: [...map.people, ...map.people] },
    { ...map, people: [] },
    { ...map, connections: [{ ...first, to: first.from }] },
    { ...map, connections: [{ ...first, label: '  ' }] },
    { ...map, connections: [...map.connections, first] },
    { ...map, connections: [{ ...first, from: { kind: 'touchstone', name: 0 } }] },
  ]
  for (const relationshipMap of invalid) {
    const file = JSON.stringify({ ...envelope, draft: { ...draft, character: { ...character, relationshipMap } } })
    assert.match(readDraftBackup(file).issue ?? '', /invalid/)
  }
  const unavailable = readDraftBackup(serializeDraftDownload({ ...draft, character: { ...character, sourcePacks: ['future-pack'] } }))
  assert.ok(unavailable.issue !== undefined)
  assert.deepEqual(unavailable.unavailableSources, ['future-pack'])
})

test('the mechanical link stays identical with a map and rejects injected relationship data', () => {
  const hash = encodeBuildLink(character)
  assert.ok(hash)
  assert.equal(hash, encodeBuildLink(maraCharacter))
  const raw = atob(hash.slice(buildLinkPrefix.length).replaceAll('-', '+').replaceAll('_', '/'))
  assert.doesNotMatch(raw, /Mira Blackwell|Jo Reyes|Owes a favor|relationshipMap/)
  const decoded = decodeBuildLink(hash)
  assert.equal(decoded.issue, undefined)
  assert.equal(decoded.draft.relationshipMap, undefined)
  const payload = JSON.parse(raw)
  payload.mechanics.relationshipMap = map
  const injected = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  assert.match(decodeBuildLink(buildLinkPrefix + injected).issue ?? '', /invalid/)
})
