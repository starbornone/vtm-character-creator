import type { RelationshipDraft } from './character-guide.ts'

const recordedKinds = ['sire', 'coterie', 'touchstone'] as const
type RecordedKind = typeof recordedKinds[number]

export type MapEndpoint = { kind: 'character' } | { kind: 'person'; id: string } | { kind: RecordedKind; name: string }

export interface RelationshipMapDraft {
  people: { id: string; name: string }[]
  connections: { id: string; from: MapEndpoint; to: MapEndpoint; label: string }[]
}

export const emptyRelationshipMap: RelationshipMapDraft = { people: [], connections: [] }
export const characterEndpoint = { kind: 'character' } as const
const labels: Record<RecordedKind, string> = { sire: 'Sire', coterie: 'Coterie', touchstone: 'Touchstone' }

export function endpointKey(endpoint: MapEndpoint) {
  if (endpoint.kind === 'character') return endpoint.kind
  if (endpoint.kind === 'person') return `person:${endpoint.id}`
  return `${endpoint.kind}:${endpoint.name.trim().toLowerCase()}`
}

export function recordedEndpoints(draft: RelationshipDraft) {
  const endpoints = new Map<string, MapEndpoint & { kind: RecordedKind }>()
  const record = (kind: RecordedKind, text: string) => {
    const name = text.trim()
    if (!name) return
    const endpoint = { kind, name }
    endpoints.set(endpointKey(endpoint), endpoint)
  }
  record('sire', draft.sire)
  record('coterie', draft.coterie)
  for (const { touchstone } of draft.convictions) record('touchstone', touchstone)
  return [...endpoints.values()]
}

export function endpointLabel(endpoint: MapEndpoint, characterName: string, map: RelationshipMapDraft) {
  if (endpoint.kind === 'character') return characterName.trim() || 'Your character'
  if (endpoint.kind === 'person') return map.people.find(person => person.id === endpoint.id)?.name ?? 'Unknown person'
  return `${endpoint.name} (${labels[endpoint.kind]})`
}

export function removeMapPerson(map: RelationshipMapDraft, id: string): RelationshipMapDraft {
  const key = endpointKey({ kind: 'person', id })
  return {
    people: map.people.filter(person => person.id !== id),
    connections: map.connections.filter(({ from, to }) => endpointKey(from) !== key && endpointKey(to) !== key),
  }
}

export function isRecordedMapKind(value: unknown): value is RecordedKind {
  return recordedKinds.some(kind => kind === value)
}
