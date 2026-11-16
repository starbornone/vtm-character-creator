import { disciplineIds } from '../catalog/clan-path.ts'
import { replayPurchases, type ExperienceState, type Purchase } from './starting-xp.ts'

export interface AdvancementDraft {
  awards: number[]
  purchases: Purchase[]
}

export const emptyAdvancement: AdvancementDraft = { awards: [], purchases: [] }

export function isXpAward(amount: unknown): amount is number {
  return typeof amount === 'number' && Number.isSafeInteger(amount) && amount > 0
}

export function evaluateAdvancement(draft: AdvancementDraft, baseline: ExperienceState, complete: boolean, includeCustomText: boolean) {
  const earned = draft.awards.reduce((sum, award) => sum + award, 0)
  // Replay from a fresh copy so creation budgets and ratings remain available to the guide.
  const final: ExperienceState = {
    ...baseline,
    attributes: { ...baseline.attributes }, skills: { ...baseline.skills }, specialties: { ...baseline.specialties },
    disciplines: { ...baseline.disciplines }, powers: [...baseline.powers], advantages: { ...baseline.advantages },
    readyDisciplines: baseline.isThinBlood ? baseline.readyDisciplines : disciplineIds,
    remaining: earned,
  }
  const entries = complete ? replayPurchases(final, draft.purchases, includeCustomText, true) : []
  const pendingPurchases = draft.purchases.length - entries.filter(entry => !entry.issue).length
  return { final, entries, earned, spent: earned - final.remaining, remaining: final.remaining, pendingPurchases, paused: !complete }
}
