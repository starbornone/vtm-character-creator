import { allDisciplinePowers, clanChoices, predatorChoices } from '../catalog/clan-path.ts'
import { playersGuide } from '../catalog/source-packs.ts'
import type { ClanPathDraft } from './clan-path.ts'
import type { Purchase } from './starting-xp.ts'

const guidePowerIds = new Set(Object.values(allDisciplinePowers).flat().filter(power => power.sourcePack === playersGuide.id).map(power => power.id))

export function usesPlayersGuideSelections(path: ClanPathDraft, purchases: readonly Purchase[]) {
  return clanChoices.some(option => option.id === path.clan && option.sourcePack === playersGuide.id)
    || predatorChoices.some(option => option.id === path.predatorType && option.sourcePack === playersGuide.id)
    || Object.values(path.clanPowers).some(slots => Object.values(slots).some(id => guidePowerIds.has(id)))
    || Object.values(path.predatorPowers).some(id => guidePowerIds.has(id))
    || purchases.some(purchase => purchase.kind === 'discipline' && guidePowerIds.has(purchase.power))
}
