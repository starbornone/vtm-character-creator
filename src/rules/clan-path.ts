import {
  allDisciplinePowers, caitiffOption, clanChoices, disciplineIds, predatorChoices, thinBloodOption,
  type ClanOption, type DisciplineId, type DisciplinePower, type DotGrant, type PredatorOption,
} from '../catalog/clan-path.ts'
import { sourceEnabled } from '../catalog/source-packs.ts'
import { skillIds } from '../catalog/traits.ts'
import { ageProfiles, thinBloodProfile, type AgeProfile } from './creation-profiles.ts'
import { evaluateThinBlood, type ThinBloodDraft } from './thin-blood.ts'

export const manualOptionId = 'manual'

const suspect = { name: 'Suspect', dots: 1 }
export const caitiffStatusIssue = 'Caitiff cannot take positive Status during character creation. Core p. 107.'

export function isStatusAdvantage(name: string) {
  return /\bstatus\b/i.test(name)
}

export interface ManualClan {
  name: string
  source: string
  disciplines: string[]
  bane: string
  compulsion: string
}

export interface ManualPredator {
  name: string
  source: string
  advantage?: DotGrant
  flaw?: DotGrant
  humanityChange?: number
}

export interface ClanPathDraft {
  clan: string
  twoDotDiscipline: string
  oneDotDiscipline: string
  clanPowers: Partial<Record<DisciplineId, Partial<Record<1 | 2, string>>>>
  predatorType: string
  predatorDiscipline: string
  predatorSpecialty: string
  predatorSpecialtyName?: string
  predatorPowers: Partial<Record<DisciplineId, string>>
  predatorChoices?: Record<string, Readonly<Record<string, number>>>
  ritual?: string
  manualClan?: ManualClan
  manualPredator?: ManualPredator
  thinBlood?: ThinBloodDraft
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

type DisciplineRatings = Partial<Record<DisciplineId, number>>
type PowerIssue = 'wrong-discipline' | 'level' | 'duplicate' | 'amalgam' | 'source'

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
  sourcePacks: readonly string[],
): PowerSlot {
  // Core p. 244. A dot buys a distinct power at its new rating or lower.
  const options = allDisciplinePowers[discipline].filter(power => sourceEnabled(sourcePacks, power) || power.id === selectedId).map(power => {
    let issue: PowerIssue | undefined
    if (!sourceEnabled(sourcePacks, power)) issue = 'source'
    else if (power.level > rank) issue = 'level'
    else if (previousSlots.some(slot => slot.selectedPower?.id === power.id)) issue = 'duplicate'
    else if (power.amalgam && (ratings[power.amalgam.discipline] ?? 0) < power.amalgam.dots) issue = 'amalgam'
    return { ...power, issue }
  })
  const selected = options.find(power => power.id === selectedId)
  return {
    discipline, rank, selectedId, options,
    selectedPower: selected?.issue ? undefined : selected,
    issue: selected ? selected.issue : selectedId ? 'wrong-discipline' : undefined,
  }
}

function manualClanOption(entry?: ManualClan): ClanOption | undefined {
  if (!entry?.name.trim() || !entry.source.trim()) return
  const valid = disciplineIds.filter(id => entry.disciplines.includes(id))
  if (valid.length !== 3 || entry.disciplines.length !== 3) return
  return { id: manualOptionId, name: entry.name.trim(), source: entry.source.trim(), disciplines: valid, bane: entry.bane.trim(), compulsion: entry.compulsion.trim() }
}

function readManualGrant(grant?: DotGrant) {
  if (!grant || (!grant.name.trim() && grant.dots === 0)) return
  if (!grant.name.trim() || !Number.isInteger(grant.dots) || grant.dots < 1 || grant.dots > 5) return false
  return { name: grant.name.trim(), dots: grant.dots }
}

function manualPredatorOption(entry?: ManualPredator): PredatorOption | undefined {
  if (!entry?.name.trim() || !entry.source.trim()) return
  const advantage = readManualGrant(entry.advantage)
  const flaw = readManualGrant(entry.flaw)
  const humanityChange = entry.humanityChange ?? 0
  if (advantage === false || flaw === false || ![-1, 0, 1].includes(humanityChange)) return
  return {
    id: manualOptionId, name: entry.name.trim(), source: entry.source.trim(), humanityChange,
    disciplines: disciplineIds,
    specialties: skillIds.map(skill => ({ skill, name: 'Specify Specialty', custom: true })),
    advantages: advantage ? [advantage] : [], flaws: flaw ? [flaw] : [],
  }
}

export function predatorRestriction(clanId: string | undefined, predatorId: string, bloodPotency = 1) {
  if (clanId === 'ventrue' && (predatorId === 'bagger' || predatorId === 'farmer')) return 'Unavailable to Ventrue.'
  if (predatorId === 'farmer' && bloodPotency >= 3) return 'Farmer requires Blood Potency below 3.'
}

export function evaluateClanPath(draft: ClanPathDraft, includeCustomText = true, age: AgeProfile = ageProfiles.neonate, sourcePacks: readonly string[] = []) {
  const clanOption = draft.clan === manualOptionId ? manualClanOption(draft.manualClan) : clanChoices.find(option => option.id === draft.clan)
  const clanUnavailable = Boolean(clanOption && !sourceEnabled(sourcePacks, clanOption))
  const clan = clanUnavailable ? undefined : clanOption
  const isCaitiff = clan?.id === caitiffOption.id
  const thinBlood = clan?.id === thinBloodOption.id ? evaluateThinBlood(draft.thinBlood) : undefined
  const profile = thinBlood ? thinBloodProfile : age
  const ageIssue = thinBlood && age.name !== 'Fledgling' ? 'Thin-blood creation requires the Fledgling age profile. Core p. 140.' : undefined
  const hasNosferatuBane = clan?.id === 'nosferatu' || thinBlood?.curse?.id === 'nosferatu'
  const twoDot = clan?.disciplines.find(id => id === draft.twoDotDiscipline)
  const oneDot = clan?.disciplines.find(id => id === draft.oneDotDiscipline && id !== twoDot)
  const clanRatings: DisciplineRatings = {}
  if (twoDot) clanRatings[twoDot] = 2
  if (oneDot) clanRatings[oneDot] = 1

  const clanSlots: PowerSlot[] = []
  for (const discipline of clan?.disciplines ?? []) {
    for (const rank of [1, 2] as const) {
      if (rank > (clanRatings[discipline] ?? 0)) break
      clanSlots.push(powerSlot(discipline, rank, draft.clanPowers[discipline]?.[rank] ?? '', clanRatings, clanSlots, sourcePacks))
    }
  }

  const affinity = thinBlood?.affinity
  if (affinity) {
    clanRatings[affinity.discipline] = 1
    clanSlots.push(powerSlot(affinity.discipline, 1, affinity.power.id, clanRatings, clanSlots, sourcePacks))
  }

  const predatorOption = draft.predatorType === manualOptionId
    ? manualPredatorOption(draft.manualPredator) : predatorChoices.find(option => option.id === draft.predatorType)
  const predatorUnavailable = Boolean(profile.predatorAllowed && predatorOption && !sourceEnabled(sourcePacks, predatorOption))
  const predatorIssue = profile.predatorAllowed && !predatorUnavailable
    ? (isCaitiff && predatorOption?.advantages?.some(grant => isStatusAdvantage(grant.name))
      ? caitiffStatusIssue : predatorRestriction(clan?.id, draft.predatorType, profile.bloodPotency))
    : undefined
  const predator = profile.predatorAllowed && clan && !predatorIssue && !predatorUnavailable ? predatorOption : undefined
  const specialtyOption = predator?.specialties.find(option => option.skill === draft.predatorSpecialty)
  const specialtyName = specialtyOption?.custom ? (draft.predatorSpecialtyName ?? '').trim() : specialtyOption?.name
  const grantedSpecialty = specialtyOption && specialtyName ? { skill: specialtyOption.skill, name: specialtyName } : undefined
  // Core pp. 176–177 reserve the two named Blood Sorcery grants for Tremere.
  const predatorDisciplines = predator?.disciplines.filter(id => id !== 'blood-sorcery' || clan?.id === 'tremere' || predator.id === manualOptionId) ?? []
  const predatorDiscipline = predatorDisciplines.find(id => id === draft.predatorDiscipline)
  const disciplineGrant = twoDot && oneDot ? predatorDiscipline : undefined
  const totalRatings = { ...clanRatings }
  let predatorSlot: PowerSlot | undefined
  if (disciplineGrant) {
    const rank = clanRatings[disciplineGrant] === 2 ? 3 : clanRatings[disciplineGrant] === 1 ? 2 : 1
    totalRatings[disciplineGrant] = rank
    predatorSlot = powerSlot(disciplineGrant, rank, draft.predatorPowers[disciplineGrant] ?? '', totalRatings, clanSlots, sourcePacks)
  }

  const reviews: string[] = []
  if (clan?.id === manualOptionId) reviews.push(includeCustomText ? `Manual clan: ${clan.name} (${clan.source}).` : 'Review the manual clan with the Storyteller.')
  if (predator?.id === manualOptionId) reviews.push(includeCustomText ? `Manual Predator Type: ${predator.name} (${predator.source}).` : 'Review the manual Predator Type with the Storyteller.')
  const advantages = [...(predator?.advantages ?? [])]
  const flaws = [...(predator?.flaws ?? [])]
  if (clan?.id === 'nosferatu' && predator?.id === 'siren') {
    advantages.splice(0, advantages.length)
    reviews.push('Nosferatu cannot gain the Siren’s Beautiful Merit. Review the grant with the Storyteller (Core pp. 85, 178).')
  }

  const grantChoices = (predator?.choices ?? []).map(choice => {
    const saved = draft.predatorChoices?.[choice.id] ?? {}
    const rows = choice.options.map(({ id, name, fixed }) => {
      const ratings = choice.mode === 'one' ? [choice.dots] : [1, 2, 3].filter(dots => dots <= choice.dots && (!fixed || dots === fixed))
      return { id, name, ratings, dots: saved[id] ?? 0 }
    })
    const used = rows.reduce((sum, row) => sum + row.dots, 0)
    const complete = used === choice.dots && rows.every(row => row.dots === 0 || row.ratings.includes(row.dots))
    if (complete) {
      const target = choice.kind === 'advantage' ? advantages : flaws
      for (const { name, dots } of rows) if (dots > 0) target.push({ name, dots })
    }
    return { ...choice, rows, used, complete }
  })

  const lane = new Set(clan?.disciplines ?? [])
  if (disciplineGrant) lane.add(disciplineGrant)
  if (affinity) lane.add(affinity.discipline)
  const ledger = [...lane].map(discipline => ({
    discipline,
    clanDots: thinBlood ? 0 : clanRatings[discipline] ?? 0,
    predatorDots: Number(discipline === disciplineGrant),
    total: totalRatings[discipline] ?? 0,
  }))
  return {
    sourcePacks, clanUnavailable, predatorUnavailable,
    sourceUnavailable: clanUnavailable || predatorUnavailable || predatorSlot?.issue === 'source' || clanSlots.some(slot => slot.issue === 'source'),
    profile, clan, isCaitiff, thinBlood, ageIssue, hasNosferatuBane, twoDot, oneDot, clanSlots, predator, predatorIssue, predatorDisciplines, specialtyOption, grantedSpecialty,
    disciplineGrant, predatorSlot, ledger, advantages, flaws, grantChoices, reviews,
    clanFlaws: isCaitiff ? [suspect] : hasNosferatuBane ? [{ name: 'Repulsive', dots: 2 }] : [],
    bloodPotencyChange: predator?.bloodPotencyChange ?? 0,
    humanity: { base: profile.humanity, adjustment: predator?.humanityChange ?? 0, total: profile.humanity + (predator?.humanityChange ?? 0) },
    complete: thinBlood ? !ageIssue && thinBlood.issues.length === 0 : clanSlots.length === 3 && clanSlots.every(slot => slot.selectedPower)
      && (!profile.predatorAllowed || (Boolean(predatorSlot?.selectedPower && grantedSpecialty) && grantChoices.every(choice => choice.complete))),
  }
}
