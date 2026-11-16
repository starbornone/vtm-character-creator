import assert from 'node:assert/strict'
import test from 'node:test'
import {
  draftLibraryKey, draftNameError, loadDraftLibrary, saveDraftLibrary, withSavedDraft,
  type DraftLibrary, type GetStorage, type NamedDraft,
} from '../src/drafts/browser-drafts.ts'
import { serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { evaluateCharacter, initialCharacterDraft } from '../src/rules/character-guide.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

const maraDraft: NamedDraft = { id: 'mara', name: 'Mara Vale', step: 'review', character: maraCharacter }

function memoryStorage(initial: string | null = null) {
  let raw = initial
  let blocked = false
  const storage: GetStorage = () => ({
    getItem(key: string) {
      assert.equal(key, draftLibraryKey)
      return raw
    },
    setItem(key: string, value: string) {
      assert.equal(key, draftLibraryKey)
      if (blocked) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      raw = value
    },
  })
  return { storage, block: (value: boolean) => { blocked = value } }
}

test('named incomplete and complete characters restore their own step and active draft', () => {
  const { storage } = memoryStorage()
  const first = loadDraftLibrary(storage)
  const other: NamedDraft = {
    id: 'second', name: 'Second character', step: 'clan', character: {
      ...initialCharacterDraft, clanPath: {
        ...initialCharacterDraft.clanPath, clan: 'manual',
        manualClan: { name: 'House Vale', source: 'Table notes', disciplines: [], bane: '', compulsion: '' },
      },
    },
  }
  const library = withSavedDraft(withSavedDraft(first.library, maraDraft), other)
  assert.ok(saveDraftLibrary(storage, library, first.saved).saved)

  const restored = loadDraftLibrary(storage)
  assert.equal(restored.library.activeId, 'second')
  assert.deepEqual(restored.library.drafts.map(({ id, name, step }) => ({ id, name, step })), [
    { id: 'mara', name: 'Mara Vale', step: 'review' }, { id: 'second', name: 'Second character', step: 'clan' },
  ])
  const savedOther = restored.library.drafts[1]
  assert.equal(savedOther.character.starting.generation, undefined)
  assert.equal(savedOther.character.clanPath.manualClan?.source, 'Table notes')
  assert.equal(evaluateCharacter(savedOther.character).sheet.draft, true)
  assert.deepEqual(restored.library.drafts[0].character, maraCharacter)
  assert.equal(evaluateCharacter(restored.library.drafts[0].character).sheet.draft, false)

  const renamed = withSavedDraft(restored.library, { ...savedOther, name: 'WIP', step: 'traits' })
  assert.ok(saveDraftLibrary(storage, renamed, restored.saved).saved)
  assert.equal(loadDraftLibrary(storage).library.drafts.length, 2)
  assert.equal(loadDraftLibrary(storage).library.drafts[1].name, 'WIP')
  const active = loadDraftLibrary(storage)
  assert.ok(saveDraftLibrary(storage, { ...active.library, activeId: null }, active.saved).saved)
  assert.equal(loadDraftLibrary(storage).library.activeId, null)
  assert.equal(draftNameError(active.library, 'mara vale'), 'A draft with that name already exists.')
})

test('quota failures leave the last saved draft intact and the current draft can be downloaded and retried', () => {
  const { storage, block } = memoryStorage()
  const library = withSavedDraft({ activeId: null, drafts: [] }, maraDraft)
  const first = saveDraftLibrary(storage, library, null)
  assert.ok(first.saved)
  const updated = { ...maraDraft, step: 'relationships' as const, character: {
    ...maraCharacter, concept: { ...maraCharacter.concept, desire: 'Find a quieter refuge tonight' },
  } }
  const unsaved = withSavedDraft(library, updated)
  block(true)
  assert.match(saveDraftLibrary(storage, unsaved, first.saved).issue ?? '', /Could not save/)
  assert.equal(loadDraftLibrary(storage).library.drafts[0].character.concept.desire, maraCharacter.concept.desire)
  const exported = JSON.parse(serializeDraftDownload({ name: updated.name, step: updated.step, character: updated.character }))
  assert.equal(exported.draft.character.concept.desire, 'Find a quieter refuge tonight')
  assert.equal(exported.draft.step, 'relationships')
  assert.equal(exported.schemaVersion, 1)
  assert.equal(exported.ruleset, 'vtm-v5')
  block(false)
  assert.ok(saveDraftLibrary(storage, unsaved, first.saved).saved)
  assert.equal(loadDraftLibrary(storage).library.drafts[0].step, 'relationships')
})

test('blocked, malformed and unsupported storage falls back without overwriting saved data', () => {
  const blocked = () => { throw new DOMException('Denied', 'SecurityError') }
  const next: DraftLibrary = { activeId: 'mara', drafts: [maraDraft] }
  assert.match(loadDraftLibrary(blocked).issue ?? '', /Could not open/)
  assert.match(saveDraftLibrary(blocked, next, null).issue ?? '', /Could not save/)
  const envelope = (updates: Record<string, unknown>) => JSON.stringify({ schemaVersion: 1, ruleset: 'vtm-v5', ...next, ...updates })
  const invalid = [
    '{bad', envelope({ schemaVersion: 2 }), envelope({ ruleset: 'other' }),
    envelope({ activeId: 'absent' }), envelope({ drafts: [maraDraft, maraDraft] }),
    envelope({ drafts: [{ ...maraDraft, step: 'missing' }] }),
    envelope({ drafts: [{ ...maraDraft, character: { ...maraCharacter, traits: { ...maraCharacter.traits, distribution: 'missing' } } }] }),
    envelope({ drafts: [{ ...maraDraft, character: { ...maraCharacter, starting: { ...maraCharacter.starting, purchases: [{ kind: 'skill', id: 'invalid', to: 1 }] } } }] }),
  ]
  for (const raw of invalid) {
    const { storage } = memoryStorage(raw)
    const current = loadDraftLibrary(storage)
    assert.equal(current.library.activeId, null)
    assert.match(current.issue ?? '', /could not be read/)
    assert.match(saveDraftLibrary(storage, next, current.saved).issue ?? '', /before reloading/)
    assert.equal(storage().getItem(draftLibraryKey), raw)
  }
})

test('an earlier view cannot overwrite drafts saved by another tab', () => {
  const { storage } = memoryStorage()
  const staleView = loadDraftLibrary(storage)
  const updated = withSavedDraft(staleView.library, maraDraft)
  assert.ok(saveDraftLibrary(storage, updated, staleView.saved).saved)
  const stale = withSavedDraft(staleView.library, { ...maraDraft, id: 'stale' })
  assert.match(saveDraftLibrary(storage, stale, staleView.saved).issue ?? '', /changed/)
  assert.equal(loadDraftLibrary(storage).library.activeId, 'mara')
})
