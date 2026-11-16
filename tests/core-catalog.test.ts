import assert from 'node:assert/strict'
import test from 'node:test'
import { coreClans, corePredators, disciplinePowers } from '../src/catalog/clan-path.ts'
import { evaluateCharacter } from '../src/rules/character-guide.ts'
import { evaluateClanPath, initialClanPath, predatorRestriction, type ClanPathDraft } from '../src/rules/clan-path.ts'
import { quotePurchase } from '../src/rules/starting-xp.ts'
import { maraCharacter, maraClanPath } from './fixtures/mara-vale.ts'

function selectPath(clanId: string, predatorId: string, updates: Partial<ClanPathDraft> = {}) {
  const clan = coreClans.find(option => option.id === clanId)!
  const predator = corePredators.find(option => option.id === predatorId)!
  const [twoDotDiscipline, oneDotDiscipline] = clan.disciplines
  const clanPowers = {
    [twoDotDiscipline]: { 1: disciplinePowers[twoDotDiscipline][0].id, 2: disciplinePowers[twoDotDiscipline][1].id },
    [oneDotDiscipline]: { 1: disciplinePowers[oneDotDiscipline][0].id },
  }
  const predatorDiscipline = predator.disciplines.find(id => id !== 'blood-sorcery' || clanId === 'tremere')!
  const predatorRank = predatorDiscipline === twoDotDiscipline ? 3 : predatorDiscipline === oneDotDiscipline ? 2 : 1
  const predatorPower = disciplinePowers[predatorDiscipline].find(power => power.level <= predatorRank && !power.amalgam
    && !Object.values(clanPowers[predatorDiscipline] ?? {}).includes(power.id))!
  return {
    ...initialClanPath, clan: clanId, predatorType: predatorId, twoDotDiscipline, oneDotDiscipline, clanPowers,
    predatorDiscipline, predatorSpecialty: predator.specialties[0].skill, predatorSpecialtyName: 'Local Theater',
    predatorPowers: { [predatorDiscipline]: predatorPower.id },
    ...updates,
  }
}

test('all seven core clans and ten Predator Types lead to a complete set of path choices', () => {
  assert.deepEqual(coreClans.map(clan => clan.id), ['brujah', 'gangrel', 'malkavian', 'nosferatu', 'toreador', 'tremere', 'ventrue'])
  const cases = [
    ['brujah', 'alleycat', 6, 0, 3, 0],
    ['tremere', 'bagger', 7, 0, 3, 2],
    ['gangrel', 'blood-leech', 6, 1, 0, 4],
    ['malkavian', 'cleaver', 7, 0, 2, 1],
    ['ventrue', 'consensualist', 8, 0, 0, 2],
    ['gangrel', 'farmer', 8, 0, 0, 2],
    ['toreador', 'osiris', 7, 0, 3, 2],
    ['nosferatu', 'sandman', 7, 0, 1, 0],
    ['ventrue', 'scene-queen', 7, 0, 2, 1],
    ['toreador', 'siren', 7, 0, 2, 1],
  ] as const
  assert.deepEqual(cases.map(([, predator]) => predator), corePredators.map(predator => predator.id))
  for (const [clan, predator, humanity, potency, advantages, flaws] of cases) {
    const path = evaluateClanPath(selectPath(clan, predator, {
      predatorChoices: {
        'blood-leech-flaw': { shunned: 2 },
        'osiris-advantages': { fame: 2, herd: 1 },
        'osiris-flaws': { enemy: 1, garlic: 1 },
        'scene-queen-flaw': { disliked: 1 },
      },
    }))
    assert.equal(path.complete, true, `${clan} / ${predator}`)
    assert.equal(path.humanity.total, humanity)
    assert.equal(path.bloodPotencyChange, potency)
    assert.equal(path.advantages.reduce((sum, grant) => sum + grant.dots, 0), advantages)
    assert.equal(path.flaws.reduce((sum, grant) => sum + grant.dots, 0), flaws)
    assert.match(path.clan!.source, /^Core p/)
    assert.match(path.predator!.source, /^Core p/)
    assert.equal(path.ledger.reduce((sum, row) => sum + row.total, 0), 4)
  }
})

test('Predator eligibility and invalidated grant choices leave the saved inputs intact', () => {
  const bagger = selectPath('tremere', 'bagger')
  assert.equal(evaluateClanPath(bagger).disciplineGrant, 'blood-sorcery')
  assert.equal(evaluateClanPath({ ...bagger, clan: 'ventrue' }).predator, undefined)
  assert.match(predatorRestriction('ventrue', 'farmer') ?? '', /Ventrue/)
  assert.match(predatorRestriction('gangrel', 'farmer', 3) ?? '', /below 3/)
  assert.deepEqual(evaluateClanPath({ ...bagger, clan: 'brujah' }).predatorDisciplines, ['obfuscate'])
  assert.equal(evaluateClanPath({ ...bagger, clan: 'brujah' }).disciplineGrant, undefined)
  assert.equal(evaluateClanPath(bagger).disciplineGrant, 'blood-sorcery')

  const osiris = evaluateClanPath(selectPath('toreador', 'osiris', { predatorChoices: {
    'osiris-advantages': { fame: 2, herd: 2 },
    'osiris-flaws': { 'stake-bait': 1, enemy: 1 },
  } }))
  assert.equal(osiris.complete, false)
  assert.deepEqual(osiris.advantages, [])
  assert.deepEqual(osiris.flaws, [])
  const siren = evaluateClanPath(selectPath('nosferatu', 'siren'))
  assert.deepEqual(siren.advantages, [])
  assert.deepEqual(siren.clanFlaws, [{ name: 'Repulsive', dots: 2 }])
  assert.match(siren.reviews[0], /Siren’s Beautiful/)
})

test('Tremere Bagger finishes the guide with a Ritual and separate Predator Type grants', () => {
  const clanPath = selectPath('tremere', 'bagger', { ritual: 'blood-walk' })
  const { sheet, pending } = evaluateCharacter({ ...maraCharacter, clanPath })
  assert.deepEqual(pending.clan, [])
  assert.equal(sheet.draft, false)
  assert.equal(sheet.ritual?.name, 'Blood Walk')
  assert.equal(sheet.advantages.find(grant => grant.source === 'Bagger')?.name, 'Iron Gullet')
  assert.deepEqual(sheet.flaws.find(grant => grant.source === 'Bagger'), { name: 'Enemy', dots: 2, source: 'Bagger' })
  assert.equal(sheet.flawDots, 4)
  assert.equal(sheet.xpRemaining, 0)
})

test('Blood Leech and out-of-clan Predator Disciplines feed starting tracks and XP rules', () => {
  const clanPath = {
    ...maraClanPath, predatorType: 'blood-leech', predatorDiscipline: 'protean', predatorSpecialty: 'brawl',
    predatorChoices: { 'blood-leech-flaw': { diablerist: 2 } },
    predatorPowers: { protean: 'eyes-of-the-beast' },
  }
  const noPurchases = { ...maraCharacter.starting, purchases: [] }
  const purchase = { kind: 'discipline', id: 'protean', to: 2, power: 'feral-weapons' } as const
  const { starting } = evaluateCharacter({ ...maraCharacter, clanPath, starting: noPurchases })
  assert.equal(starting.bloodPotency, 2)
  assert.equal(starting.humanity, 6)
  assert.equal(quotePurchase(starting.final, purchase).cost, 14)
  assert.equal(quotePurchase(starting.final, { kind: 'blood-potency', to: 3 }).cost, 30)
  const { sheet } = evaluateCharacter({ ...maraCharacter, clanPath, starting: { ...noPurchases, purchases: [purchase] } })
  assert.deepEqual(sheet.disciplines.find(discipline => discipline.name === 'Protean'), { name: 'Protean', rating: 2, powers: ['Eyes of the Beast', 'Feral Weapons'] })
  assert.equal(sheet.xpRemaining, 1)
})

test('Fortitude Resilience adds Health, and a Sandman Resources grant combines with base and XP dots', () => {
  const clanPath = {
    ...maraClanPath, clan: 'ventrue', twoDotDiscipline: 'fortitude', oneDotDiscipline: 'dominate',
    clanPowers: { fortitude: { 1: 'resilience', 2: 'toughness' }, dominate: { 1: 'compel' } },
    predatorType: 'sandman', predatorDiscipline: 'auspex', predatorSpecialty: 'stealth', predatorPowers: { auspex: 'heightened-senses' },
  } satisfies ClanPathDraft
  const { sheet, starting } = evaluateCharacter({ ...maraCharacter, clanPath, starting: {
    ...maraCharacter.starting, purchases: [{ kind: 'advantage', id: 'resources', to: 4 }],
  } })
  assert.equal(sheet.tracks.health, 8)
  assert.equal(starting.advantageBudget.used, 7)
  assert.equal(starting.final.advantages.resources, 4)
  assert.equal(starting.entries[0].cost, 3)
  assert.deepEqual(sheet.advantages.filter(option => option.name === 'Resources'), [
    { name: 'Resources', dots: 3, source: 'Base + XP' }, { name: 'Resources', dots: 1, source: 'Sandman' },
  ])
})

test('Osiris can grant an unrated Performance dot and the corresponding first-dot Specialty', () => {
  const clanPath = selectPath('toreador', 'osiris', { predatorSpecialty: 'performance', predatorSpecialtyName: 'Stage Magic' })
  const traits = { ...maraCharacter.traits, firstDotSpecialties: { ...maraCharacter.traits.firstDotSpecialties, performance: 'Puppetry' } }
  const { sheet } = evaluateCharacter({ ...maraCharacter, clanPath, traits })
  assert.deepEqual(sheet.traitGroups.flatMap(group => group.skills).find(skill => skill.name === 'Performance'), {
    name: 'Performance', rating: 1, specialties: ['Puppetry'],
  })
})

test('manual clan, Predator Type, Advantage and Flaw appear on the final sheet for Storyteller review', () => {
  const clanPath = {
    ...maraClanPath, clan: 'manual', predatorType: 'manual', predatorSpecialtyName: 'Grappling',
    manualClan: { name: 'House Vale', source: 'Chronicle notes', disciplines: ['celerity', 'potence', 'presence'], bane: 'Cold Iron', compulsion: 'Vows' },
    manualPredator: { name: 'Night Courier', source: 'Session zero', advantage: { name: 'Courier Contacts', dots: 2 }, flaw: { name: 'Old Rival', dots: 1 } },
  } satisfies ClanPathDraft
  const { sheet, starting } = evaluateCharacter({ ...maraCharacter, clanPath, starting: {
    ...maraCharacter.starting, advantages: { ...maraCharacter.starting.advantages, beautiful: 0 }, flaws: [],
    manualOptions: [
      { kind: 'advantage', name: ' Theater Access ', dots: 2, source: 'Chronicle notes' },
      { kind: 'flaw', name: 'Broken Oath', dots: 2, source: 'Session zero' },
    ],
  } })
  assert.equal(sheet.draft, false)
  assert.equal(sheet.identity.clan, 'House Vale')
  assert.equal(sheet.identity.predator, 'Night Courier')
  assert.equal(sheet.reviews.length, 4)
  assert.equal(sheet.advantageDots, 9)
  assert.equal(sheet.flawDots, 3)
  assert.equal(starting.advantageBudget.used, 7)
  assert.equal(starting.flawBudget.used, 2)

  const incomplete = evaluateCharacter({ ...maraCharacter, clanPath: { ...clanPath, manualClan: { ...clanPath.manualClan, source: '' } }, starting: {
    ...maraCharacter.starting, manualOptions: [{ kind: 'advantage', name: ' resources ', dots: 2, source: 'My notes' }],
  } })
  assert.equal(incomplete.sheet.draft, true)
  assert.equal(incomplete.path.clan, undefined)
  assert.match(incomplete.starting.manualOptions[0].issue ?? '', /already appears/)
  assert.equal(incomplete.starting.advantageBudget.used, 7)
})
