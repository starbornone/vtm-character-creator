import { evaluateCharacter, guideSteps, type CharacterDraft } from '../rules/character-guide.ts'

export const briefNarrativeSections = {
  identity: 'Character identity and chronicle',
  motivations: 'Ambition and Desire',
  convictions: 'Convictions and Touchstones',
  relationships: 'Sire, coterie, and Chronicle Tenets',
  custom: 'Custom names and Storyteller notes',
} as const

export type BriefNarrative = Partial<Record<keyof typeof briefNarrativeSections, boolean>>

function inline(value: string | number) {
  return String(value).trim().replace(/\s*[\r\n]+\s*/g, ' ')
    .replace(/([\\`*_{}\[\]<>|~:&])/g, '\\$1')
}

type Detail = readonly [label: string, value: string | number | undefined]

function details(rows: readonly Detail[]) {
  return rows.flatMap(([label, value]) => value === undefined || value === '' ? [] : [`- **${label}:** ${inline(value)}`])
}

export function makeStorytellerBrief(draft: CharacterDraft, narrative: BriefNarrative = {}) {
  const { sheet, pending, starting } = evaluateCharacter(draft, { includeCustomText: narrative.custom === true })
  const { identity, tracks, relationships, thinBlood } = sheet
  const lines = ['# Storyteller Brief', '', 'Vampire: The Masquerade · Fifth Edition', '']

  function section(heading: string, content: readonly string[]) {
    if (content.length > 0) lines.push(heading, '', ...content, '')
  }

  if (narrative.identity) section('## Character Identity', details([
    ['Name', identity.name], ['Concept', identity.concept], ['Chronicle', identity.chronicle], ['Embraced', identity.embraced],
  ]))

  section('## Mechanics', details([
    ['Age profile', identity.ageProfile], ['Clan', identity.clan ?? 'Unassigned'],
    ['Predator Type', starting.profile.predatorAllowed ? identity.predator ?? 'Unassigned' : undefined],
    ['Generation', identity.generation ? `${identity.generation}th` : 'Unassigned'],
    ['Source pack', sheet.sourcePack], ['Clan Bane', sheet.bane], ['Compulsion', sheet.compulsion],
  ]))

  section('### Tracks', details([
    ['Health', tracks.health ?? 'Unassigned'], ['Willpower', tracks.willpower ?? 'Unassigned'],
    ['Humanity', tracks.humanity], ['Blood Potency', tracks.bloodPotency],
    ['Bane Severity', tracks.baneSeverity], ['Blood Surge dice', tracks.bloodSurge],
  ]))

  lines.push('### Attributes & Skills', '')
  for (const group of sheet.traitGroups) {
    const attributes = group.attributes.map(({ name, rating }) => `${name} ${rating ?? '—'}`)
    const skills = group.skills.map(({ name, rating, specialties }) =>
      `${name} ${rating ?? '—'}${specialties.length ? ` (${specialties.map(inline).join(', ')})` : ''}`)
    section(`#### ${group.name}`, [
      `- **Attributes:** ${attributes.join(', ')}`,
      `- **Skills:** ${skills.join(', ')}`,
    ])
  }

  const disciplines = sheet.disciplines.map(({ name, rating, powers }) =>
    `- **${name} ${rating}**${powers.length ? ` · ${powers.join(', ')}` : ''}`)
  if (thinBlood?.alchemy) {
    const { rating, method, formula } = thinBlood.alchemy
    disciplines.push(`- **Thin-blood Alchemy ${rating}** · ${method.name} · ${formula.name}`)
  }
  if (sheet.ritual) disciplines.push(`- **Starting Ritual:** ${sheet.ritual.name} (Core p. ${sheet.ritual.page})`)
  section('### Disciplines', disciplines.length ? disciplines : ['No Disciplines assigned.'])

  section('### Advantages & Flaws', [
    `${sheet.advantageDots} Advantage dots · ${sheet.flawDots} Flaw dots`, '',
    ...sheet.advantages.map(option => `- **Advantage:** ${inline(option.name)} · ${option.dots} ${option.dots === 1 ? 'dot' : 'dots'} · ${inline(option.source)}`),
    ...sheet.flaws.map(option => `- **Flaw:** ${inline(option.name)} · ${option.dots} ${option.dots === 1 ? 'dot' : 'dots'}${option.source ? ` · ${inline(option.source)}` : ''}`),
  ])

  if (thinBlood) section('### Thin-blood Merits & Flaws', [
    ...thinBlood.merits.map(option => `- **Merit:** ${option.name}`),
    ...thinBlood.flaws.map(option => `- **Flaw:** ${option.name}${option.id === 'clan-curse' && thinBlood.cursedClan ? ` (${thinBlood.cursedClan})` : ''}`),
  ])

  section('### Starting XP', [
    `${sheet.xpSpent} XP spent · ${sheet.xpRemaining} XP remaining`, '',
    ...sheet.purchases.map(entry => `- ${inline(entry.label)} · ${entry.cost} XP`),
  ])

  const rulings: string[] = []
  for (const step of guideSteps) {
    if (step.id === 'clan' || step.id === 'traits' || step.id === 'starting') {
      for (const issue of pending[step.id]) rulings.push(`- **${step.title}:** ${inline(issue)}`)
    }
  }
  for (const entry of starting.entries) {
    if (entry.issue) rulings.push(`- **XP purchase:** ${inline(entry.label)} · ${inline(entry.issue)}`)
  }
  for (const review of new Set(sheet.reviews)) rulings.push(`- **Storyteller review:** ${inline(review)}`)
  section('## Open Rulings', rulings.length ? rulings : ['None outstanding.'])

  if (narrative.motivations) section('## Ambition & Desire', details([['Ambition', identity.ambition], ['Desire', identity.desire]]))
  if (narrative.convictions) section('## Convictions & Touchstones', relationships.convictions.flatMap(pair =>
    pair.conviction || pair.touchstone
      ? [`- **Conviction:** ${inline(pair.conviction || 'Unassigned')} · **Touchstone:** ${inline(pair.touchstone || 'Unassigned')}`] : [],
  ))
  if (narrative.relationships) section('## Relationships & Chronicle Tenets', details([
    ['Sire', relationships.sire], ['Coterie', relationships.coterie], ['Chronicle Tenets', relationships.tenets],
  ]))

  return lines.join('\n')
}
