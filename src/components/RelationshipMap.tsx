import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { RelationshipDraft } from '@/rules/character-guide'
import {
  characterEndpoint, emptyRelationshipMap, endpointKey, endpointLabel, recordedEndpoints, removeMapPerson,
  type MapEndpoint, type RelationshipMapDraft,
} from '@/rules/relationship-map'

export function RelationshipMap({ characterName, relationships, map = emptyRelationshipMap, onChange }: {
  characterName: string
  relationships: RelationshipDraft
  map?: RelationshipMapDraft
  onChange: (map: RelationshipMapDraft) => void
}) {
  const [personName, setPersonName] = useState('')
  const [from, setFrom] = useState('character')
  const [to, setTo] = useState('')
  const [connectionLabel, setConnectionLabel] = useState('')
  const [status, setStatus] = useState('')
  const personInput = useRef<HTMLInputElement>(null)
  const connectionInput = useRef<HTMLSelectElement>(null)
  const recorded = recordedEndpoints(relationships)
  const endpoints = new Map<string, MapEndpoint>()
  for (const endpoint of [characterEndpoint, ...recorded]) endpoints.set(endpointKey(endpoint), endpoint)
  for (const { id } of map.people) endpoints.set(endpointKey({ kind: 'person', id }), { kind: 'person', id })
  const fromKey = endpoints.has(from) ? from : 'character'
  const toKey = endpoints.has(to) && to !== fromKey ? to : ''
  const labelFor = (endpoint: MapEndpoint) => endpointLabel(endpoint, characterName, map)
  const optionFor = ([key, endpoint]: [string, MapEndpoint]) => <option key={key} value={key}>{labelFor(endpoint)}</option>

  function addPerson() {
    const name = personName.trim()
    if (!name) return
    onChange({ ...map, people: [...map.people, { id: crypto.randomUUID(), name }] })
    setPersonName('')
    setStatus(`Added ${name}.`)
    personInput.current?.focus()
  }

  function addConnection() {
    const start = endpoints.get(fromKey)
    const end = endpoints.get(toKey)
    const label = connectionLabel.trim()
    if (!start || !end || !label) return
    onChange({ ...map, connections: [...map.connections, { id: crypto.randomUUID(), from: start, to: end, label }] })
    setConnectionLabel('')
    setTo('')
    setStatus(`Added connection ${label}.`)
    connectionInput.current?.focus()
  }

  return <Card className="gap-0 py-0" role="region" aria-labelledby="relationship-map-title">
    <CardContent className="space-y-5 p-5 sm:p-7">
      <div>
        <h2 id="relationship-map-title" className="text-2xl font-semibold tracking-tight">Relationship Map</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your sire, coterie, and Touchstones appear here as you fill in Relationships.</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-3 sm:p-4">
        <p className="mx-auto w-fit break-words rounded-md border border-primary bg-card px-4 py-2 text-center font-semibold">{labelFor(characterEndpoint)}</p>
        {recorded.length > 0 && <>
          <span aria-hidden="true" className="mx-auto block h-4 w-px bg-primary" />
          <ul aria-label="Recorded relationships" className="grid gap-2 rounded-md border-t border-primary/60 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {recorded.map(endpoint => <li key={endpointKey(endpoint)} className="min-w-0 break-words rounded-md border border-border px-3 py-2 text-sm">{labelFor(endpoint)}</li>)}
          </ul>
        </>}
      </div>
      <section aria-labelledby="map-people-title" className="space-y-3">
        <h3 id="map-people-title" className="font-semibold">People</h3>
        <form className="flex flex-wrap items-end gap-2" onSubmit={event => { event.preventDefault(); addPerson() }}>
          <label className="grid min-w-36 flex-1 gap-1 text-sm">Person’s name
            <input ref={personInput} className="ledger-field" value={personName} onChange={event => setPersonName(event.target.value)} />
          </label>
          <button type="submit" className="guide-button guide-action disabled:opacity-50" disabled={!personName.trim()}><Plus aria-hidden="true" />Add person</button>
        </form>
        {map.people.length > 0 && <ul className="grid gap-2 md:grid-cols-2">
          {map.people.map(({ id, name }) => <li key={id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
            <span className="min-w-0 break-words text-sm">{name}</span>
            <button type="button" className="guide-button guide-action" aria-label={`Remove ${name} and their connections`} onClick={() => {
              onChange(removeMapPerson(map, id))
              setStatus(`Removed ${name} and their connections.`)
              personInput.current?.focus()
            }}><Trash2 aria-hidden="true" />Remove</button>
          </li>)}
        </ul>}
      </section>
      <section aria-labelledby="map-connections-title" className="space-y-3">
        <h3 id="map-connections-title" className="font-semibold">Connections</h3>
        {endpoints.size > 1 ? <form className="grid items-end gap-2 md:grid-cols-2 lg:grid-cols-4" onSubmit={event => { event.preventDefault(); addConnection() }}>
          <label className="grid min-w-0 gap-1 text-sm">From
            <select ref={connectionInput} className="ledger-field w-full" value={fromKey} onChange={event => {
              setFrom(event.target.value)
              if (event.target.value === to) setTo('')
            }}>{[...endpoints].map(optionFor)}</select>
          </label>
          <label className="grid min-w-0 gap-1 text-sm">To
            <select className="ledger-field w-full" value={toKey} onChange={event => setTo(event.target.value)}>
              <option value="">Choose a person…</option>
              {[...endpoints].filter(([key]) => key !== fromKey).map(optionFor)}
            </select>
          </label>
          <label className="grid min-w-0 gap-1 text-sm">Connection label
            <input className="ledger-field" value={connectionLabel} onChange={event => setConnectionLabel(event.target.value)} />
          </label>
          <button type="submit" className="guide-button guide-action justify-self-start disabled:opacity-50" disabled={!toKey || !connectionLabel.trim()}><Plus aria-hidden="true" />Add connection</button>
        </form> : <p className="text-sm text-muted-foreground">Add a person or record a relationship to make a connection.</p>}
        {map.connections.length > 0 && <ol className="space-y-2">
          {map.connections.map(({ id, from, to, label }) => <li key={id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="min-w-0 break-words font-medium">{labelFor(from)}{!endpoints.has(endpointKey(from)) && ' · Earlier entry'}</span>
              <span className="guide-action min-w-0 break-words text-muted-foreground"><ArrowRight aria-hidden="true" />{label}</span>
              <span className="min-w-0 break-words font-medium">{labelFor(to)}{!endpoints.has(endpointKey(to)) && ' · Earlier entry'}</span>
            </div>
            <button type="button" className="guide-button guide-action" aria-label={`Remove connection ${label} from ${labelFor(from)} to ${labelFor(to)}`} onClick={() => {
              onChange({ ...map, connections: map.connections.filter(edge => edge.id !== id) })
              setStatus(`Removed connection ${label}.`)
              const nextControl = connectionInput.current ?? personInput.current
              nextControl?.focus()
            }}><Trash2 aria-hidden="true" />Remove</button>
          </li>)}
        </ol>}
      </section>
      <p role="status" className="sr-only">{status}</p>
    </CardContent>
  </Card>
}
