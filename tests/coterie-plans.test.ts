import assert from 'node:assert/strict'
import test from 'node:test'
import { draftLibraryKey, loadDraftLibrary, saveDraftLibrary, type GetStorage, type NamedDraft } from '../src/drafts/browser-drafts.ts'
import { coteriePlansKey, loadCoteriePlans, readCoterieHandoff, saveCoteriePlan, serializeCoterieHandoff, suggestCoterieCopyName } from '../src/drafts/coterie-plans.ts'
import { serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { readCoterieRestoreFile, readDraftRestoreFile } from '../src/drafts/restore-file.ts'
import { emptyCoteriePlan, memberFromDraft, type CoteriePlan } from '../src/rules/coterie-plan.ts'
import { characterEndpoint } from '../src/rules/relationship-map.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { rowanCharacter } from './fixtures/rowan-pike.ts'

const mara: NamedDraft = { id: 'mara-local', name: 'Mara draft', step: 'relationships', character: {
  ...maraCharacter,
  relationshipMap: {
    people: [{ id: 'mira', name: 'Mira Blackwell' }],
    connections: [{ id: 'favor', from: characterEndpoint, to: { kind: 'person', id: 'mira' }, label: 'Owes a favor' }],
  },
} }
const rowan = { id: 'rowan-local', name: 'Rowan draft', step: 'review', character: rowanCharacter } as const
const plan: CoteriePlan = {
  name: 'The Night Shift', purpose: 'Keep the harbor safe.',
  domain: { name: 'Old Wharf', notes: 'East pier to the canal.', chasse: 2, lien: 1, portillon: 3 },
  members: [memberFromDraft(mara, 'member-1', true), memberFromDraft(rowan, 'member-2', false)],
}

function testStorage() {
  const bytes = new Map<string, string>()
  const storage: GetStorage = () => ({ getItem: key => bytes.get(key) ?? null, setItem: (key, value) => { bytes.set(key, value) } })
  return { bytes, storage }
}

test('members carry only a name by default and copy relationship labels only when requested', () => {
  assert.deepEqual(memberFromDraft(mara, 'member-1', false), { id: 'member-1', name: 'Mara Vale' })
  assert.deepEqual(plan.members[0].relationships, {
    contacts: ['Inez Varga (Sire)', 'Jo Reyes, the living stage manager (Touchstone)', 'Mira Blackwell'],
    connections: [{ from: 'Mara Vale', label: 'Owes a favor', to: 'Mira Blackwell' }],
  })
  assert.equal(plan.members[1].relationships, undefined)
  const handoff = serializeCoterieHandoff(plan)
  assert.doesNotMatch(handoff, /mara-local|rowan-local|Lena Moss|starting|convictions|ageProfile/)
  assert.deepEqual(readCoterieHandoff(handoff).value, plan)
})

test('a saved plan exports, previews, and restores as a separate copy without touching character storage', () => {
  const { bytes, storage } = testStorage()
  const characters = { activeId: rowan.id, drafts: [mara, rowan] }
  const original = saveDraftLibrary(storage, characters, null)
  assert.ok(original.saved)
  const start = loadCoteriePlans(storage)
  assert.ok(start.value)
  const stored = saveCoteriePlan(storage, start.value, plan, 'plan-1', false)
  assert.ok(stored.value)
  assert.equal(bytes.get(draftLibraryKey), original.saved)
  const reloaded = loadCoteriePlans(storage)
  assert.ok(reloaded.value)
  const handoff = serializeCoterieHandoff(reloaded.value.plans[0].plan)
  const preview = readCoterieHandoff(handoff)
  assert.ok(preview.value)
  assert.equal(bytes.get(coteriePlansKey), stored.value.saved)
  const name = suggestCoterieCopyName(reloaded.value.plans, preview.value.name)
  assert.equal(name, 'The Night Shift (copy)')
  const restored = saveCoteriePlan(storage, reloaded.value, { ...preview.value, name }, 'plan-2', false)
  assert.ok(restored.value)
  assert.deepEqual(loadCoteriePlans(storage).value?.plans, [
    { id: 'plan-1', plan }, { id: 'plan-2', plan: { ...plan, name } },
  ])
  assert.equal(bytes.get(draftLibraryKey), original.saved)
  assert.deepEqual(loadDraftLibrary(storage).library, characters)
})

test('invalid and foreign transfers cannot become plans', () => {
  const envelope = JSON.parse(serializeCoterieHandoff(plan))
  assert.match(readCoterieHandoff('{').issue ?? '', /valid JSON/)
  assert.match(readCoterieHandoff(JSON.stringify({ ...envelope, format: 'vtm-character-creator-draft' })).issue ?? '', /handoff file/)
  assert.match(readCoterieHandoff(JSON.stringify({ ...envelope, schemaVersion: 2 })).issue ?? '', /unsupported/)
  for (const invalid of [
    { ...plan, domain: { ...plan.domain, chasse: 6 } },
    { ...plan, members: [...plan.members, plan.members[0]] },
    { ...plan, members: [{ ...plan.members[0], character: mara.character }] },
    { ...plan, members: [{ ...plan.members[0], relationships: { contacts: ['Name'], connections: [{ from: 'Name' }] } }] },
  ]) {
    assert.match(readCoterieHandoff(JSON.stringify({ ...envelope, plan: invalid })).issue ?? '', /invalid plan/)
  }
})

test('restore controls recognize only valid files meant for the other tool', () => {
  const characterBackup = serializeDraftDownload(mara)
  const coterieHandoff = serializeCoterieHandoff(plan)
  const draftResult = readDraftRestoreFile(coterieHandoff)
  const planResult = readCoterieRestoreFile(characterBackup)
  assert.equal(draftResult.draft, undefined)
  assert.match(draftResult.issue ?? '', /Coterie & Domain.*Choose coterie JSON/)
  assert.equal(planResult.value, undefined)
  assert.match(planResult.issue ?? '', /Browser drafts.*Choose JSON backup/)

  const invalidDraft = JSON.stringify({ ...JSON.parse(characterBackup), draft: {} })
  const invalidPlan = JSON.stringify({ ...JSON.parse(coterieHandoff), plan: {} })
  assert.match(readDraftRestoreFile(invalidPlan).issue ?? '', /Choose a Character Creator draft backup/)
  assert.match(readCoterieRestoreFile(invalidDraft).issue ?? '', /Choose a Coterie and Domain handoff file/)
  assert.match(readDraftRestoreFile(invalidDraft).issue ?? '', /missing or invalid/)
  assert.match(readCoterieRestoreFile(invalidPlan).issue ?? '', /invalid plan details/)
  assert.match(readDraftRestoreFile('{').issue ?? '', /not valid JSON/)
  assert.match(readCoterieRestoreFile('{').issue ?? '', /not valid JSON/)
})

test('plan edits reject duplicate names, stale writers, colliding copy IDs, and failed writes', () => {
  const { bytes, storage } = testStorage()
  const start = loadCoteriePlans(storage)
  assert.ok(start.value)
  const initial = saveCoteriePlan(storage, start.value, plan, 'plan-1', false)
  assert.ok(initial.value)
  const edited = { ...plan, purpose: 'New shared purpose' }
  const change = saveCoteriePlan(storage, initial.value, edited, 'plan-1', true)
  assert.ok(change.value)
  assert.match(saveCoteriePlan(storage, initial.value, { ...plan, name: 'Another plan' }, 'plan-2', false).issue ?? '', /changed/)
  assert.match(saveCoteriePlan(storage, change.value, plan, 'plan-2', false).issue ?? '', /already exists/)
  assert.match(saveCoteriePlan(storage, change.value, { ...plan, name: 'Another plan' }, 'plan-1', false).issue ?? '', /identify/)
  const blocked: GetStorage = () => ({ ...storage(), setItem() { throw new Error('Quota reached') } })
  assert.match(saveCoteriePlan(blocked, change.value, { ...emptyCoteriePlan, name: 'New' }, 'plan-2', false).issue ?? '', /Could not save/)
  assert.equal(bytes.get(coteriePlansKey), change.value.saved)
})
