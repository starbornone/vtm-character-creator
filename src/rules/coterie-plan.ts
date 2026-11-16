import type { NamedDraft } from '../drafts/browser-drafts.ts'
import { emptyRelationshipMap, endpointLabel, recordedEndpoints } from './relationship-map.ts'

export const domainTraits = [
  { id: 'chasse', name: 'Chasse', description: 'Hunting grounds' },
  { id: 'lien', name: 'Lien', description: 'Local ties' },
  { id: 'portillon', name: 'Portillon', description: 'Security' },
] as const
export const domainRatings = [0, 1, 2, 3, 4, 5] as const
type DomainRating = typeof domainRatings[number]

export interface CoterieMember {
  id: string
  name: string
  relationships?: {
    contacts: string[]
    connections: { from: string; label: string; to: string }[]
  }
}

export interface CoteriePlan {
  name: string
  purpose: string
  domain: { name: string; notes: string } & Record<typeof domainTraits[number]['id'], DomainRating>
  members: CoterieMember[]
}

export const emptyCoteriePlan: CoteriePlan = {
  name: '', purpose: '', domain: { name: '', notes: '', chasse: 0, lien: 0, portillon: 0 }, members: [],
}

export function memberFromDraft(draft: NamedDraft, id: string, includeRelationships: boolean): CoterieMember {
  const { character } = draft
  const name = character.concept.name.trim() || draft.name
  if (!includeRelationships) return { id, name }
  const map = character.relationshipMap ?? emptyRelationshipMap
  const contacts = [
    ...recordedEndpoints(character.relationships).map(endpoint => endpointLabel(endpoint, name, map)),
    ...map.people.map(person => person.name),
  ]
  const connections = map.connections.map(({ from, label, to }) => ({
    from: endpointLabel(from, name, map), label, to: endpointLabel(to, name, map),
  }))
  return contacts.length || connections.length ? { id, name, relationships: { contacts, connections } } : { id, name }
}
