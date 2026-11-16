import { coreClans, disciplineIds, disciplinePowers, type DisciplineId } from '../catalog/clan-path.ts'
import { alchemyMethods, startingFormulae, thinBloodFlaws, thinBloodMerits } from '../catalog/thin-blood.ts'

export interface ThinBloodDraft {
  merits: (typeof thinBloodMerits)[number]['id'][]
  flaws: (typeof thinBloodFlaws)[number]['id'][]
  curseClan?: string
  affinity?: string
  affinityPower?: string
  method?: string
  formula?: string
}

export const initialThinBlood: ThinBloodDraft = { merits: [], flaws: [] }

const conflictingTraits = [
  ['lifelike', 'dead-flesh', 'Lifelike conflicts with Dead Flesh.'],
  ['vampiric-resilience', 'mortal-frailty', 'Vampiric Resilience conflicts with Mortal Frailty.'],
  ['anarch-comrades', 'shunned-by-the-anarchs', 'Anarch Comrades conflicts with Shunned by the Anarchs.'],
] as const

export const thinBloodBackgroundIssue = 'Thin-bloods cannot buy Bonding, Mawla, Retainers, or Status during creation. Core p. 149.'

export function isRestrictedThinBloodOption(name: string) {
  return /\b(bonding|bondslave|bond junkie|bond resistance|short bond|long bond|unbondable|mawla|retainers?|status|suspect|shunned)\b/i.test(name)
}

export function curseRestriction(id: string, draft: ThinBloodDraft) {
  if ((id === 'brujah' || id === 'gangrel') && !draft.flaws.includes('bestial-temper')) return 'Requires Bestial Temper.'
  if (id === 'tremere' && !draft.merits.includes('catenating-blood')) return 'Requires Catenating Blood.'
}

export function evaluateThinBlood(draft: ThinBloodDraft = initialThinBlood) {
  const merits = thinBloodMerits.filter(({ id }) => draft.merits.includes(id))
  const flaws = thinBloodFlaws.filter(({ id }) => draft.flaws.includes(id))
  const issues: string[] = []
  if (merits.length < 1 || merits.length > 3 || merits.length !== flaws.length) {
    issues.push('Choose one to three Thin-blood Merits and the same number of Thin-blood Flaws.')
  }
  for (const [merit, flaw, message] of conflictingTraits) {
    if (draft.merits.includes(merit) && draft.flaws.includes(flaw)) issues.push(message)
  }

  let curse: (typeof coreClans)[number] | undefined
  if (draft.flaws.includes('clan-curse')) {
    const clan = coreClans.find(({ id }) => id === draft.curseClan)
    const issue = clan && curseRestriction(clan.id, draft)
    if (!clan) issues.push('Choose a Core clan Bane for Clan Curse.')
    else if (issue) issues.push(`Clan Curse · ${clan.name}: ${issue}`)
    else curse = clan
  }

  let affinity: { discipline: DisciplineId; power: (typeof disciplinePowers)[DisciplineId][number] } | undefined
  if (draft.merits.includes('discipline-affinity')) {
    const discipline = disciplineIds.find(id => id === draft.affinity)
    const power = discipline && disciplinePowers[discipline].find(option => option.id === draft.affinityPower && option.level === 1)
    if (discipline && power) affinity = { discipline, power }
    else issues.push('Choose one Core Discipline and a level-one power for Discipline Affinity.')
  }

  let alchemy: { rating: 1; method: (typeof alchemyMethods)[number]; formula: (typeof startingFormulae)[number] } | undefined
  if (draft.merits.includes('thin-blood-alchemist')) {
    const method = alchemyMethods.find(({ id }) => id === draft.method)
    const formula = startingFormulae.find(({ id }) => id === draft.formula)
    if (method && formula) alchemy = { rating: 1, method, formula }
    else issues.push('Choose a distillation method and a level-one formula for Thin-blood Alchemist.')
  }

  return { merits, flaws, curse, affinity, alchemy, issues }
}
