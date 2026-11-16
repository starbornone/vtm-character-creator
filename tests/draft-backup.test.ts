import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRestoredDraft, loadDraftLibrary, saveDraftLibrary, suggestRestoreName, type DraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload, type DraftSnapshot } from '../src/drafts/draft-backup.ts'
import { evaluateCharacter, initialCharacterDraft } from '../src/rules/character-guide.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

const complete: DraftSnapshot = { name: 'Mara Vale', step: 'review', character: maraCharacter }
const partial: DraftSnapshot = { name: 'Unfinished neonate', step: 'clan', character: {
  ...initialCharacterDraft,
  concept: { ...initialCharacterDraft.concept, name: 'Ada', concept: 'Restorer of rare books' },
  clanPath: {
    ...initialCharacterDraft.clanPath,
    clan: 'manual',
    manualClan: { name: 'House Ada', source: 'Table notes', disciplines: [], bane: '', compulsion: '' },
  },
} }

function testStorage() {
  let raw: string | null = null
  let blocked = false
  const storage: GetStorage = () => ({
    getItem: () => raw,
    setItem(_key, value) {
      if (blocked) throw new DOMException('Test quota error', 'QuotaExceededError')
      raw = value
    },
  })
  return { storage, block: () => { blocked = true } }
}

test('the complete Mara Vale backup restores as a fresh draft and retains the complete sheet', () => {
  const { storage } = testStorage()
  const original = { ...complete, id: 'original' }
  const library: DraftLibrary = { activeId: original.id, drafts: [original] }
  const first = saveDraftLibrary(storage, library, null)
  assert.ok(first.saved)

  const download = serializeDraftDownload(original)
  const envelope = JSON.parse(download)
  assert.equal(envelope.format, 'vtm-character-creator-draft')
  assert.equal(envelope.schemaVersion, 1)
  assert.equal(envelope.ruleset, 'vtm-v5')
  assert.equal(envelope.draft.id, undefined)
  const preview = readDraftBackup(download)
  assert.deepEqual(preview.draft, complete)
  assert.equal(loadDraftLibrary(storage).saved, first.saved)
  assert.equal(suggestRestoreName(library, complete.name), 'Mara Vale (copy)')
  assert.ok(preview.draft)

  const copy = appendRestoredDraft(library, { ...preview.draft, name: 'Mara Vale (copy)' }, 'copy')
  assert.ok(copy.library && copy.draft)
  assert.ok(saveDraftLibrary(storage, copy.library, first.saved).saved)
  const restored = loadDraftLibrary(storage).library
  assert.equal(restored.activeId, 'copy')
  assert.deepEqual(restored.drafts[0], original)
  assert.equal(restored.drafts[1].step, 'review')
  assert.deepEqual(evaluateCharacter(restored.drafts[1].character).sheet, evaluateCharacter(maraCharacter).sheet)
  assert.equal(evaluateCharacter(restored.drafts[1].character).sheet.draft, false)
})

test('an unfinished backup round-trips omitted values and incomplete choices and resumes at its saved step', () => {
  const { storage } = testStorage()
  const initial = loadDraftLibrary(storage)
  // Windows and other editors can add a UTF-8 BOM to the JSON file.
  const preview = readDraftBackup('\uFEFF' + serializeDraftDownload(partial))
  assert.ok(preview.draft)
  assert.equal(serializeDraftDownload(preview.draft), serializeDraftDownload(partial))
  assert.equal(preview.draft.character.starting.generation, undefined)
  assert.equal(evaluateCharacter(preview.draft.character).sheet.draft, true)
  const copy = appendRestoredDraft(initial.library, preview.draft, 'unfinished-copy')
  assert.ok(copy.library)
  assert.ok(saveDraftLibrary(storage, copy.library, initial.saved).saved)
  const restored = loadDraftLibrary(storage).library.drafts[0]
  assert.equal(restored.step, 'clan')
  assert.equal(restored.character.clanPath.manualClan?.name, 'House Ada')
  assert.equal(restored.character.concept.name, 'Ada')
})

test('bad JSON, foreign formats, version mismatches, and invalid nested inputs are rejected', () => {
  const valid = JSON.parse(serializeDraftDownload(complete))
  const withDraft = (draft: unknown) => JSON.stringify({ ...valid, draft })
  const invalid = [
    ['{bad', /valid JSON/],
    ['[]', /Character Creator/],
    [JSON.stringify({ ...valid, format: 'other' }), /Character Creator/],
    [JSON.stringify({ ...valid, schemaVersion: 2 }), /version/],
    [JSON.stringify({ ...valid, ruleset: 'vtm-v6' }), /ruleset/],
    [withDraft(undefined), /inputs/],
    [withDraft({ ...complete, name: '  ' }), /inputs/],
    [withDraft({ ...complete, step: 'missing' }), /inputs/],
    [withDraft({ ...complete, character: { ...maraCharacter, relationships: { ...maraCharacter.relationships, convictions: [null] } } }), /inputs/],
    [withDraft({ ...complete, character: { ...maraCharacter, traits: { ...maraCharacter.traits, attributes: { stamina: '3' } } } }), /inputs/],
    [withDraft({ ...complete, character: { ...maraCharacter, starting: { ...maraCharacter.starting, purchases: [{ kind: 'advantage', id: 'unknown', to: 2 }] } } }), /inputs/],
  ] as const
  for (const [file, issue] of invalid) {
    const result = readDraftBackup(file)
    assert.match(result.issue ?? '', issue)
    assert.equal(result.draft, undefined)
  }
})

test('restore protects existing IDs and names and leaves the library unchanged on write failure', () => {
  const { storage, block } = testStorage()
  const original = { ...complete, id: 'original' }
  const previous: DraftLibrary = {
    activeId: original.id,
    drafts: [original, { ...complete, name: 'Mara Vale (copy)', id: 'first-copy' }],
  }
  const first = saveDraftLibrary(storage, previous, null)
  assert.ok(first.saved)
  assert.equal(suggestRestoreName(previous, 'mara vale'), 'mara vale (copy 2)')
  assert.match(appendRestoredDraft(previous, { ...complete, name: '  MARA VALE  ' }, 'new').issue ?? '', /already exists/)
  assert.match(appendRestoredDraft(previous, partial, 'original').issue ?? '', /fresh draft ID/)
  const copy = appendRestoredDraft(previous, partial, 'new')
  assert.ok(copy.library)
  block()
  assert.match(saveDraftLibrary(storage, copy.library, first.saved).issue ?? '', /Could not save/)
  assert.deepEqual(loadDraftLibrary(storage).library, previous)
})
