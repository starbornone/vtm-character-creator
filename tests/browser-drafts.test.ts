import assert from 'node:assert/strict'
import test from 'node:test'
import {
  activeDrafts, appendRestoredDraft, archiveSavedDraft, draftLibraryKey, draftNameError, loadDraftLibrary, reopenArchivedDraft, saveDraftLibrary, suggestCopyName, withSavedDraft,
  type DraftLibrary, type GetStorage, type NamedDraft,
} from '../src/drafts/browser-drafts.ts'
import { serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter, initialCharacterDraft } from '../src/rules/character-guide.ts'
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

test('archiving the active draft keeps its working inputs and step and reopening keeps the same ID', () => {
  const { storage } = memoryStorage()
  const other = { ...maraDraft, name: 'Another draft', id: 'other' }
  const library = { activeId: maraDraft.id, drafts: [maraDraft, other] }
  const { saved } = saveDraftLibrary(storage, library, null)
  assert.ok(saved)
  const working = { ...maraDraft, step: 'relationships' as const, character: editCharacter(maraCharacter, {
    type: 'concept', update: { desire: 'Test a different approach' },
  }) }
  const archived = archiveSavedDraft(library, working)
  assert.ok(archived)
  assert.ok(saveDraftLibrary(storage, archived, saved).saved)
  const reloaded = loadDraftLibrary(storage)
  assert.equal(reloaded.library.activeId, null)
  assert.deepEqual(activeDrafts(reloaded.library), [other])
  assert.match(draftNameError(reloaded.library, maraDraft.name) ?? '', /already exists/)
  const newSave = withSavedDraft(reloaded.library, other)
  const imported = appendRestoredDraft(newSave, { ...other, name: 'Imported draft' }, 'imported')
  assert.ok(imported.library)
  assert.deepEqual(imported.library.archivedIds, [maraDraft.id])
  const reopened = reopenArchivedDraft(reloaded.library, maraDraft.id)
  assert.ok(reopened)
  assert.deepEqual(reopened.draft, working)
  assert.ok(saveDraftLibrary(storage, reopened.library, reloaded.saved).saved)
  assert.deepEqual(loadDraftLibrary(storage).library, { activeId: maraDraft.id, drafts: [working, other] })
})

test('failed archive and reopen writes leave the browser library intact', () => {
  const { storage, block } = memoryStorage()
  const library = withSavedDraft({ activeId: null, drafts: [] }, maraDraft)
  const { saved } = saveDraftLibrary(storage, library, null)
  assert.ok(saved)
  const archived = archiveSavedDraft(library, maraDraft)
  assert.ok(archived)
  block(true)
  assert.match(saveDraftLibrary(storage, archived, saved).issue ?? '', /Could not save/)
  assert.equal(loadDraftLibrary(storage).saved, saved)
  block(false)
  const result = saveDraftLibrary(storage, archived, saved)
  assert.ok(result.saved)
  const reopened = reopenArchivedDraft(archived, maraDraft.id)
  assert.ok(reopened)
  assert.match(saveDraftLibrary(storage, reopened.library, saved).issue ?? '', /Browser drafts changed/)
  block(true)
  assert.match(saveDraftLibrary(storage, reopened.library, result.saved).issue ?? '', /Could not save/)
  assert.equal(loadDraftLibrary(storage).saved, result.saved)
})

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

test('a draft copy keeps the working inputs and step and saves separately from the original', () => {
  const { storage, block } = memoryStorage()
  const library = withSavedDraft({ activeId: null, drafts: [] }, maraDraft)
  const { saved } = saveDraftLibrary(storage, library, null)
  assert.ok(saved)

  const desire = 'Try a different approach'
  const working = {
    ...maraDraft, step: 'relationships' as const,
    character: editCharacter(maraDraft.character, { type: 'concept', update: { desire } }),
  }
  const name = suggestCopyName(library, working.name)
  const copy = appendRestoredDraft(library, { ...working, name }, 'mara-copy')
  assert.ok(copy.draft)
  block(true)
  assert.match(saveDraftLibrary(storage, copy.library, saved).issue ?? '', /Could not save/)
  assert.equal(storage().getItem(draftLibraryKey), saved)
  assert.deepEqual(loadDraftLibrary(storage).library, library)

  block(false)
  const created = saveDraftLibrary(storage, copy.library, saved)
  assert.ok(created.saved)
  const reloaded = loadDraftLibrary(storage)
  assert.equal(reloaded.library.activeId, 'mara-copy')
  assert.equal(suggestCopyName(reloaded.library, working.name), 'Mara Vale (copy 2)')
  assert.deepEqual(reloaded.library.drafts, [maraDraft, { ...working, id: 'mara-copy', name: 'Mara Vale (copy)' }])

  const edited = withSavedDraft(reloaded.library, { ...copy.draft, step: 'traits' })
  assert.ok(saveDraftLibrary(storage, edited, reloaded.saved).saved)
  const reopened = loadDraftLibrary(storage)
  assert.deepEqual(reopened.library.drafts[0], maraDraft)
  assert.equal(reopened.library.drafts[1].step, 'traits')
  assert.equal(reopened.library.drafts[1].character.concept.desire, desire)
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
    envelope({ archivedIds: ['missing'] }), envelope({ archivedIds: ['mara'] }),
    envelope({ activeId: null, archivedIds: ['mara', 'mara'] }),
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
