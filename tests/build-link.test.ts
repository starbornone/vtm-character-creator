import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRestoredDraft, type DraftLibrary } from '../src/drafts/browser-drafts.ts'
import { evaluateCharacter, initialCharacterDraft, type CharacterDraft } from '../src/rules/character-guide.ts'
import { buildLinkPrefix, decodeBuildLink, encodeBuildLink } from '../src/sharing/build-link.ts'
import { maraCharacter } from './fixtures/mara-vale.ts'

function payloadFor(draft: CharacterDraft) {
  const hash = encodeBuildLink(draft)
  assert.ok(hash)
  const raw = Buffer.from(hash.slice(buildLinkPrefix.length), 'base64url').toString('utf8')
  return { hash, raw, payload: JSON.parse(raw) }
}

test('Mara’s build link keeps catalog mechanics and XP, with a fresh narrative on the receiving side', () => {
  const { hash, raw, payload } = payloadFor(maraCharacter)
  const text = [...Object.values(maraCharacter.concept), maraCharacter.relationships.sire, maraCharacter.relationships.tenets,
    maraCharacter.relationships.convictions[0].conviction, maraCharacter.relationships.convictions[0].touchstone, 'Carpentry', 'Climbing']
  for (const value of text.filter(Boolean)) assert.ok(!raw.includes(value), value)
  assert.match(hash, /^#build=[A-Za-z0-9_-]+$/)
  assert.deepEqual(Object.keys(payload.mechanics), ['traits', 'clanPath', 'starting'])
  assert.equal(payload.mechanics.traits.freeSpecialtySkill, 'athletics')
  assert.deepEqual(payload.omitted, ['specialty-names'])
  const result = decodeBuildLink(hash)
  assert.ok('draft' in result, result.issue)
  assert.deepEqual(result.draft.concept, initialCharacterDraft.concept)
  assert.deepEqual(result.draft.relationships, initialCharacterDraft.relationships)
  const actual = evaluateCharacter(result.draft).sheet
  const expected = evaluateCharacter(maraCharacter).sheet
  assert.deepEqual(actual.tracks, expected.tracks)
  assert.deepEqual(actual.disciplines, expected.disciplines)
  assert.deepEqual(actual.advantages, expected.advantages)
  assert.deepEqual(actual.purchases, expected.purchases)
  assert.deepEqual(actual.traitGroups[0].skills.find(skill => skill.name === 'Brawl')?.specialties, ['Grappling'])
})

test('all custom text is omitted, including notes, manual options, power IDs and XP Specialty names', () => {
  const draft: CharacterDraft = {
    ...maraCharacter,
    traits: { ...maraCharacter.traits, firstDotSpecialties: { craft: 'private-craft' }, freeSpecialty: { skill: 'athletics', name: 'private-athletics' } },
    clanPath: {
      ...maraCharacter.clanPath, clan: 'manual', predatorType: 'manual', predatorSpecialtyName: 'private-scene',
      manualClan: { name: 'private-clan', source: 'private-clan-book', disciplines: ['potence'], bane: 'private-bane', compulsion: 'private-compulsion' },
      manualPredator: { name: 'private-predator', source: 'private-predator-book', advantage: { name: 'private-grant', dots: 2 } },
      ritual: 'private-ritual',
      predatorChoices: { 'private-grant-key': { 'private-grant-option': 1 } },
      predatorPowers: { potence: 'private-unused-power' },
    },
    starting: {
      ...maraCharacter.starting,
      manualOptions: [{ kind: 'advantage', name: 'private-benefit', source: 'private-benefit-book', dots: 2 }],
      purchases: [
        { kind: 'specialty', id: 'brawl', name: 'private-brawl' },
        { kind: 'skill', id: 'science', to: 1, specialty: 'private-science' },
        { kind: 'skill', id: 'drive', to: 2, specialty: 'private-extra-text' },
        { kind: 'discipline', id: 'potence', to: 2, power: 'private-purchased-power' },
      ],
    },
  }
  const { raw, hash, payload } = payloadFor(draft)
  assert.ok(!raw.includes('private-'))
  assert.deepEqual(payload.mechanics.starting.purchases, [{ kind: 'skill', id: 'drive', to: 2 }])
  assert.deepEqual(payload.omitted, ['manual-clan', 'manual-predator', 'specialty-names', 'manual-options', 'specialty-purchases'])
  assert.ok('draft' in decodeBuildLink(hash))
})

test('catalog Predator choices and partial builds survive without requiring narrative', () => {
  const draft: CharacterDraft = { ...initialCharacterDraft, clanPath: {
    ...initialCharacterDraft.clanPath, clan: 'toreador', predatorType: 'osiris', predatorDiscipline: 'presence',
    predatorSpecialty: 'occult', predatorSpecialtyName: 'private tradition',
    predatorChoices: { 'osiris-advantages': { fame: 2, herd: 1 }, 'osiris-flaws': { enemy: 2 } },
  } }
  const result = decodeBuildLink(payloadFor(draft).hash)
  assert.ok('draft' in result, result.issue)
  assert.equal(result.draft.starting.generation, undefined)
  assert.equal(result.draft.clanPath.predatorSpecialty, 'occult')
  assert.equal(result.draft.clanPath.predatorSpecialtyName, undefined)
  assert.deepEqual(result.draft.clanPath.predatorChoices, draft.clanPath.predatorChoices)
  assert.equal(evaluateCharacter(result.draft).sheet.identity.predator, 'Osiris')
})

test('malformed, unsupported, and tampered links are rejected', () => {
  const { payload } = payloadFor(maraCharacter)
  const pack = (value: unknown) => buildLinkPrefix + Buffer.from(JSON.stringify(value)).toString('base64url')
  for (const hash of ['', '#build=', '#build=no+padding', '#build=' + 'x'.repeat(12001),
    pack({ ...payload, version: 2 }), pack({ ...payload, ruleset: 'vtm-v6' }),
    pack({ ...payload, extra: 'unallowlisted' }), pack({ ...payload, omitted: ['specialty-names', 'specialty-names'] }),
    pack({ ...payload, mechanics: { ...payload.mechanics, clanPath: { ...payload.mechanics.clanPath, clan: 'unknown' } } }),
    pack({ ...payload, mechanics: { ...payload.mechanics, starting: {
      ...payload.mechanics.starting, purchases: [{ kind: 'skill', id: 'stealth', to: 1, specialty: 'unallowlisted' }],
    } } }),
  ]) assert.ok(decodeBuildLink(hash).issue, hash.slice(0, 80))
})

test('saving a shared build creates a separate local draft from its sanitized inputs', () => {
  const original = { id: 'mara', name: 'Mara Vale', character: maraCharacter, step: 'review' as const }
  const library: DraftLibrary = { activeId: original.id, drafts: [original] }
  const result = decodeBuildLink(payloadFor(maraCharacter).hash)
  assert.ok('draft' in result, result.issue)
  const copy = appendRestoredDraft(library, { name: 'Shared build', character: result.draft, step: 'concept' }, 'shared')
  assert.ok(copy.library)
  assert.equal(copy.library.activeId, 'shared')
  assert.deepEqual(copy.library.drafts[0], original)
  assert.equal(copy.library.drafts[1].character.concept.name, '')
  assert.equal(copy.library.drafts[1].step, 'concept')
})
