export const playersGuide = { id: 'players-guide', name: 'Player’s Guide' } as const

export function isSourcePacks(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 16 && new Set(value).size === value.length
    && value.every(id => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 64)
}

export const playersGuideDisabled = 'The Player’s Guide source pack is disabled. Enable it under Concept to use its saved selections.'

export function powerSource(power: { page: number; sourcePack?: string }) {
  return `${power.sourcePack === playersGuide.id ? playersGuide.name : 'Core'} p. ${power.page}`
}

export function unavailableSourcePacks(packs: readonly string[]) {
  return packs.filter(id => id !== playersGuide.id)
}

export function sourceEnabled(sources: readonly string[], option: { sourcePack?: string }) {
  return !option.sourcePack || sources.includes(option.sourcePack)
}

export function unavailableSourceMessage(packs: readonly string[]) {
  return `Unavailable source packs: ${packs.join(', ')}. Open this in a creator that supports those packs.`
}
