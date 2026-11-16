import assert from 'node:assert/strict'
import test from 'node:test'
import { playersGuide, playersGuideDisabled } from '../src/catalog/source-packs.ts'
import { appendRestoredDraft, draftLibraryKey, loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { chroniclePresetChanges, chroniclePresetsKey, loadChroniclePresets, saveChroniclePreset } from '../src/drafts/chronicle-presets.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { chronicleSettings, editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { eliasCharacter } from './fixtures/elias-voss.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'
import { rowanCharacter } from './fixtures/rowan-pike.ts'

function testStorage() {
  const data = new Map<string, string>()
  const storage: GetStorage = () => ({
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value) },
  })
  return { storage, data }
}

test('a preview identifies only changed fields and leaves drafts and storage untouched', () => {
  const { data, storage } = testStorage()
  const before = chronicleSettings(maraCharacter)
  const preset = { chronicle: 'After the Last Ferry', tenets: before.tenets, sourcePacks: [playersGuide.id] }
  assert.deepEqual(chroniclePresetChanges(before, preset), [
    { field: 'Chronicle', before: maraCharacter.concept.chronicle, after: 'After the Last Ferry' },
    { field: 'Rule sources', before: 'Core', after: 'Core, Player’s Guide' },
  ])
  assert.deepEqual(chroniclePresetChanges(preset, preset), [])
  assert.deepEqual(chronicleSettings(maraCharacter), before)
  assert.deepEqual(loadChroniclePresets(storage), { presets: [] })
  assert.equal(data.size, 0)
})

test('one named preset applies independently to two drafts and its settings survive backup restore', () => {
  const { data, storage } = testStorage()
  const settings = chronicleSettings(eliasCharacter)
  assert.equal(saveChroniclePreset(storage, '  Port chronicle  ', settings).issue, undefined)
  const preset = loadChroniclePresets(storage).presets?.[0]
  assert.deepEqual(preset, { ...settings, name: 'Port chronicle' })
  assert.ok(preset)

  const mara = editCharacter(maraCharacter, { type: 'chronicle-preset', settings: preset })
  const rowan = editCharacter(rowanCharacter, { type: 'chronicle-preset', settings: preset })
  for (const [updated, original] of [[mara, maraCharacter], [rowan, rowanCharacter]] as const) {
    assert.deepEqual(chronicleSettings(updated), settings)
    assert.deepEqual(updated.concept, { ...original.concept, chronicle: settings.chronicle })
    assert.deepEqual(updated.relationships, { ...original.relationships, tenets: settings.tenets })
    assert.equal(updated.traits, original.traits)
    assert.equal(updated.clanPath, original.clanPath)
    assert.equal(updated.starting, original.starting)
    assert.equal(updated.ageProfile, original.ageProfile)
  }

  const first = { id: 'mara', name: 'Mara', step: 'concept', character: mara } as const
  const second = { id: 'rowan', name: 'Rowan', step: 'concept', character: rowan } as const
  assert.ok(saveDraftLibrary(storage, { activeId: second.id, drafts: [first, second] }, null).saved)
  const reopened = loadDraftLibrary(storage)
  assert.deepEqual(reopened.library.drafts.map(({ character }) => chronicleSettings(character)), [settings, settings])
  const file = serializeDraftDownload(second)
  assert.doesNotMatch(file, /Port chronicle/)
  const { draft } = readDraftBackup(file)
  assert.ok(draft)
  const copy = appendRestoredDraft(reopened.library, { ...draft, name: 'Rowan (copy)' }, 'copy')
  assert.ok(copy.library)
  assert.ok(saveDraftLibrary(storage, copy.library, reopened.saved).saved)
  const restored = loadDraftLibrary(storage).library
  assert.equal(restored.activeId, 'copy')
  assert.deepEqual(restored.drafts.slice(0, 2), reopened.library.drafts)
  assert.deepEqual(chronicleSettings(restored.drafts[2].character), settings)
  assert.equal(data.size, 2)
  assert.ok(data.has(draftLibraryKey) && data.has(chroniclePresetsKey))

  const hash = encodeBuildLink(rowan)
  assert.ok(hash)
  const linked = decodeBuildLink(hash)
  assert.equal(linked.issue, undefined)
  assert.deepEqual(chronicleSettings(linked.draft), { chronicle: '', tenets: '', sourcePacks: settings.sourcePacks })
})

test('a Core-only preset clears optional sources while preserving saved choices for review', () => {
  const settings = { chronicle: '', tenets: '', sourcePacks: [] }
  const preview = chroniclePresetChanges(chronicleSettings(eliasCharacter), settings)
  assert.deepEqual(preview.find(change => change.field === 'Rule sources'), { field: 'Rule sources', before: 'Core, Player’s Guide', after: 'Core' })
  const updated = editCharacter(eliasCharacter, { type: 'chronicle-preset', settings })
  assert.deepEqual(chronicleSettings(updated), settings)
  assert.equal(updated.clanPath, eliasCharacter.clanPath)
  assert.ok(evaluateCharacter(updated).sourceIssues.includes(playersGuideDisabled))
  const backup = readDraftBackup(serializeDraftDownload({ name: 'Elias', step: 'concept', character: updated }))
  assert.ok(backup.draft)
  assert.deepEqual(chronicleSettings(backup.draft.character), settings)
})

test('duplicate, unavailable, and corrupt storage cannot overwrite saved presets', () => {
  const { storage, data } = testStorage()
  const settings = chronicleSettings(maraCharacter)
  assert.match(saveChroniclePreset(storage, ' ', settings).issue ?? '', /name/)
  assert.ok(saveChroniclePreset(storage, 'First', settings).presets)
  const saved = data.get(chroniclePresetsKey)
  assert.match(saveChroniclePreset(storage, ' FIRST ', settings).issue ?? '', /already exists/)
  const blocked: GetStorage = () => ({ ...storage(), setItem() { throw new DOMException('Test quota error', 'QuotaExceededError') } })
  assert.match(saveChroniclePreset(blocked, 'Second', settings).issue ?? '', /Could not save/)
  assert.equal(data.get(chroniclePresetsKey), saved)
  const unsupported = JSON.stringify({ ...JSON.parse(saved ?? ''), schemaVersion: 2 })
  data.set(chroniclePresetsKey, unsupported)
  assert.match(saveChroniclePreset(storage, 'Second', settings).issue ?? '', /unsupported version/)
  assert.equal(data.get(chroniclePresetsKey), unsupported)
})
