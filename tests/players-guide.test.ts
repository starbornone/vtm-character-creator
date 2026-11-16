import assert from 'node:assert/strict'
import test from 'node:test'
import { playersGuide, playersGuideDisabled } from '../src/catalog/source-packs.ts'
import { loadDraftLibrary, saveDraftLibrary, type GetStorage } from '../src/drafts/browser-drafts.ts'
import { readDraftBackup, serializeDraftDownload } from '../src/drafts/draft-backup.ts'
import { editCharacter, evaluateCharacter } from '../src/rules/character-guide.ts'
import { quotePurchase } from '../src/rules/starting-xp.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { eliasCharacter } from './fixtures/elias-voss.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

const complete = evaluateCharacter(eliasCharacter)
const backup = { name: 'Elias Voss', step: 'review' as const, character: eliasCharacter }
const wrappedLink = (payload: unknown) => buildLinkPrefix + Buffer.from(JSON.stringify(payload)).toString('base64url')

test('Elias Voss completes a mixed Core and Player’s Guide creation', () => {
  const { path, sheet, starting } = complete
  assert.ok(path.complete)
  assert.equal(sheet.draft, false)
  assert.equal(sheet.sourcePack, playersGuide.name)
  assert.equal(sheet.identity.clan, 'Ministry')
  assert.equal(sheet.bane, 'Abhors the Light')
  assert.equal(sheet.compulsion, 'Transgression')
  assert.equal(sheet.identity.predator, 'Extortionist')
  assert.deepEqual(sheet.tracks, { health: 6, willpower: 5, humanity: 7, bloodPotency: 1, baneSeverity: 2, bloodSurge: 2 })
  assert.deepEqual(sheet.disciplines, [
    { name: 'Obfuscate', rating: 3, powers: ['Cloak of Shadows', 'Mask of a Thousand Faces', 'Chimerstry'] },
    { name: 'Potence', rating: 1, powers: ['Lethal Body'] },
    { name: 'Presence', rating: 1, powers: ['Awe'] },
  ])
  assert.equal(starting.advantageBudget.used, 7)
  assert.equal(starting.final.advantages.resources, 4)
  assert.equal(sheet.advantageDots, 10)
  assert.equal(sheet.flawDots, 4)
  assert.ok(sheet.advantages.some(grant => grant.name === 'Contacts' && grant.dots === 2 && grant.source === 'Extortionist'))
  assert.ok(sheet.flaws.some(grant => grant.name === 'Enemy (Escaped victim)' && grant.dots === 2 && grant.source === 'Extortionist'))
  assert.equal(sheet.xpSpent, 15)
  assert.equal(sheet.xpRemaining, 0)
})

test('source options enforce Predator choices and the Obfuscate Amalgam prerequisites', () => {
  const missing = evaluateCharacter(editCharacter(eliasCharacter, { type: 'clan-path', update: {
    predatorChoices: { 'extortionist-backgrounds': { contacts: 1, resources: 1 } },
    oneDotDiscipline: 'protean',
  } }))
  assert.ok(missing.path.clanSlots.some(slot => slot.selectedId === 'chimerstry' && slot.issue === 'amalgam'))
  assert.ok(missing.pending.clan.some(issue => issue.includes('Extortionist Backgrounds')))
  assert.ok(missing.pending.clan.some(issue => issue.includes('Extortionist Enemy')))

  for (const [predatorType, predatorDiscipline, predatorSpecialty, grant] of [
    ['montero', 'obfuscate', 'stealth', 'Retainers'],
    ['pursuer', 'auspex', 'investigation', 'Bloodhound'],
  ] as const) {
    const next = evaluateCharacter(editCharacter(eliasCharacter, { type: 'clan-path', update: {
      predatorType, predatorDiscipline, predatorSpecialty,
      predatorPowers: { obfuscate: 'mask-of-a-thousand-faces', auspex: 'heightened-senses' },
    } }))
    assert.ok(next.path.complete)
    assert.equal(next.sheet.tracks.humanity, 6)
    assert.ok(next.sheet.advantages.some(entry => entry.name === grant))
  }

  const asAncilla = editCharacter(eliasCharacter, { type: 'age-profile', profile: 'ancilla' })
  const base = editCharacter(asAncilla, { type: 'starting', update: { purchases: [] } })
  const fata = { kind: 'discipline', id: 'obfuscate', to: 3, power: 'fata-morgana' } as const
  const presence = { kind: 'discipline', id: 'presence', to: 2, power: 'lingering-kiss' } as const
  assert.match(quotePurchase(evaluateCharacter(base).starting.final, fata).issue ?? '', /Amalgam/)
  const learned = editCharacter(base, { type: 'starting', update: { purchases: [presence, fata] } })
  const { starting } = evaluateCharacter(learned)
  assert.deepEqual(starting.entries.map(({ cost, issue }) => [cost, issue]), [[10, undefined], [15, undefined]])
  const asFledgling = evaluateCharacter(editCharacter(eliasCharacter, { type: 'age-profile', profile: 'fledgling' }))
  assert.equal(asFledgling.path.predator, undefined)
})

test('turning a pack off suspends its saved options and preserves previous Core results', () => {
  const suspended = editCharacter(eliasCharacter, { type: 'players-guide', enabled: false })
  const evaluated = evaluateCharacter(suspended)
  assert.equal(evaluated.sheet.identity.clan, undefined)
  assert.equal(evaluated.sheet.identity.predator, undefined)
  assert.deepEqual(evaluated.sourceIssues, [playersGuideDisabled])
  assert.equal(evaluated.sheet.advantageDots, 7)
  assert.equal(evaluated.sheet.xpSpent, 0)
  const reenabled = editCharacter(suspended, { type: 'players-guide', enabled: true })
  assert.deepEqual(evaluateCharacter(reenabled).sheet, complete.sheet)

  const known = evaluateCharacter(editCharacter(suspended, { type: 'clan-path', update: { clan: 'caitiff', predatorType: '' } }))
  assert.equal(known.path.clan?.id, 'caitiff')
  assert.ok(known.path.clanSlots.some(slot => slot.selectedId === 'chimerstry' && slot.issue === 'source'))
  const { sourcePack, ...withPack } = evaluateCharacter(editCharacter(maraCharacter, { type: 'players-guide', enabled: true })).sheet
  assert.equal(sourcePack, playersGuide.name)
  assert.deepEqual(withPack, evaluateCharacter(maraCharacter).sheet)
  assert.equal(JSON.parse(serializeDraftDownload({ ...backup, character: maraCharacter })).schemaVersion, 1)
})

test('enabled and disabled selections round-trip through backups, saved drafts, and build links', () => {
  for (const character of [eliasCharacter, editCharacter(eliasCharacter, { type: 'players-guide', enabled: false })]) {
    const raw = serializeDraftDownload({ ...backup, character })
    assert.equal(JSON.parse(raw).schemaVersion, 5)
    const restored = readDraftBackup(raw)
    assert.ok(restored.draft, restored.issue)
    assert.deepEqual(evaluateCharacter(restored.draft.character).sheet, evaluateCharacter(character).sheet)

    let stored: string | null = null
    const storage: GetStorage = () => ({ getItem: () => stored, setItem: (_key, next) => { stored = next } })
    assert.ok(saveDraftLibrary(storage, { activeId: 'elias', drafts: [{ id: 'elias', ...restored.draft }] }, stored).saved)
    const saved = loadDraftLibrary(storage).library.drafts[0]
    assert.deepEqual(saved.character.sourcePacks, character.sourcePacks)
    assert.equal(saved.character.clanPath.clan, 'ministry')

    const link = encodeBuildLink(character)
    assert.ok(link)
    const json = Buffer.from(link.slice(buildLinkPrefix.length), 'base64url').toString()
    assert.ok(!/Elias Voss|Negotiation|Tess Lark/.test(json))
    const payload = JSON.parse(json)
    assert.equal(payload.version, 5)
    assert.deepEqual(payload.mechanics.sourcePacks, character.sourcePacks ?? [])
    const decoded = decodeBuildLink(link)
    assert.ok('draft' in decoded, decoded.issue)
    const sheet = evaluateCharacter(decoded.draft)
    assert.deepEqual(sheet.sourceIssues, evaluateCharacter(character).sourceIssues)
    assert.deepEqual(sheet.sheet.disciplines, evaluateCharacter(character).sheet.disciplines)
  }
})

test('unavailable sources return an explicit preview result without restorable inputs', () => {
  const parsed = JSON.parse(serializeDraftDownload(backup))
  parsed.draft.character.sourcePacks.push('future-catalog')
  parsed.draft.character.clanPath.clan = 'future-clan'
  const result = readDraftBackup(JSON.stringify(parsed))
  assert.ok(result.issue)
  assert.match(result.issue, /Unavailable source packs: future-catalog/)
  assert.deepEqual(result.unavailableSources, ['future-catalog'])
  assert.equal(result.draft, undefined)

  const link = encodeBuildLink(eliasCharacter)
  assert.ok(link)
  const payload = JSON.parse(Buffer.from(link.slice(buildLinkPrefix.length), 'base64url').toString())
  payload.mechanics.sourcePacks.push('future-catalog')
  payload.mechanics.clanPath.clan = 'future-clan'
  const decoded = decodeBuildLink(wrappedLink(payload))
  assert.ok('unavailableSources' in decoded && decoded.unavailableSources)
  assert.deepEqual(decoded.unavailableSources, ['future-catalog'])
  assert.ok(!('draft' in decoded))
  payload.mechanics.sourcePacks = ['invalid manifest!']
  assert.ok(!('unavailableSources' in decodeBuildLink(wrappedLink(payload))))
})
