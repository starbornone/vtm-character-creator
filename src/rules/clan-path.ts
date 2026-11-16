import { alleycat, brujah, disciplinePowers, type DisciplineId, type DisciplinePower } from '../catalog/clan-path.ts'

export interface ClanPathDraft {
  clan: string
  twoDotDiscipline: string
  oneDotDiscipline: string
  clanPowers: Partial<Record<DisciplineId, Partial<Record<1 | 2, string>>>>
  predatorType: string
  predatorDiscipline: string
  predatorSpecialty: string
  predatorPowers: Partial<Record<DisciplineId, string>>
}

export const initialClanPath: ClanPathDraft = {
  clan: '',
  twoDotDiscipline: '',
  oneDotDiscipline: '',
  clanPowers: {},
  predatorType: '',
  predatorDiscipline: '',
  predatorSpecialty: '',
  predatorPowers: {},
}

type DisciplineRatings = Record<DisciplineId, number>
type PowerIssue = 'wrong-discipline' | 'level' | 'duplicate' | 'amalgam'

export interface PowerSlot {
  discipline: DisciplineId
  rank: 1 | 2 | 3
  selectedId: string
  options: readonly (DisciplinePower & { issue: PowerIssue | undefined })[]
  selectedPower: DisciplinePower | undefined
  issue: PowerIssue | undefined
}

function powerSlot(
  discipline: DisciplineId,
  rank: PowerSlot['rank'],
  selectedId: string,
  ratings: DisciplineRatings,
  previousSlots: readonly PowerSlot[],
): PowerSlot {
  // Core p. 244. A dot buys a distinct power at its new rating or lower.
  const options = disciplinePowers[discipline].map(power => {
    let issue: PowerIssue | undefined
    if (power.level > rank) issue = 'level'
    else if (previousSlots.some(slot => slot.selectedPower?.id === power.id)) issue = 'duplicate'
    else if (power.amalgam && ratings[power.amalgam.discipline] < power.amalgam.dots) issue = 'amalgam'
    return { ...power, issue }
  })
  const selected = options.find(power => power.id === selectedId)
  return {
    discipline, rank, selectedId, options,
    selectedPower: selected?.issue ? undefined : selected,
    issue: selected ? selected.issue : selectedId ? 'wrong-discipline' : undefined,
  }
}

export function evaluateClanPath(draft: ClanPathDraft) {
  const clan = draft.clan === brujah.id ? brujah : undefined
  const twoDot = clan?.disciplines.find(id => id === draft.twoDotDiscipline)
  const oneDot = clan?.disciplines.find(id => id === draft.oneDotDiscipline && id !== twoDot)
  const clanRatings: DisciplineRatings = { celerity: 0, potence: 0, presence: 0 }
  if (twoDot) clanRatings[twoDot] = 2
  if (oneDot) clanRatings[oneDot] = 1

  const clanSlots: PowerSlot[] = []
  for (const discipline of clan?.disciplines ?? []) {
    for (const rank of [1, 2] as const) {
      if (rank > clanRatings[discipline]) break
      clanSlots.push(powerSlot(discipline, rank, draft.clanPowers[discipline]?.[rank] ?? '', clanRatings, clanSlots))
    }
  }

  const predator = clan && draft.predatorType === alleycat.id ? alleycat : undefined
  const grantedSpecialty = predator?.specialties.find(option => option.skill === draft.predatorSpecialty)
  const predatorDiscipline = predator?.disciplines.find(id => id === draft.predatorDiscipline)
  const disciplineGrant = twoDot && oneDot ? predatorDiscipline : undefined
  const totalRatings = { ...clanRatings }
  let predatorSlot: PowerSlot | undefined
  if (disciplineGrant) {
    const rank = clanRatings[disciplineGrant] === 2 ? 3 : clanRatings[disciplineGrant] === 1 ? 2 : 1
    totalRatings[disciplineGrant] = rank
    predatorSlot = powerSlot(disciplineGrant, rank, draft.predatorPowers[disciplineGrant] ?? '', totalRatings, clanSlots)
  }

  const ledger = (clan?.disciplines ?? []).map(discipline => ({
    discipline,
    clanDots: clanRatings[discipline],
    predatorDots: Number(discipline === disciplineGrant),
    total: totalRatings[discipline],
  }))
  return {
    clan, twoDot, oneDot, clanSlots, predator, grantedSpecialty, disciplineGrant, predatorSlot, ledger,
    humanity: { base: 7, adjustment: predator?.humanityChange ?? 0, total: 7 + (predator?.humanityChange ?? 0) },
    complete: clanSlots.length === 3 && clanSlots.every(slot => slot.selectedPower) && Boolean(predatorSlot?.selectedPower && grantedSpecialty),
  }
}
