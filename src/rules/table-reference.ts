import { allDisciplinePowers, disciplineIds, disciplines } from '../catalog/clan-path.ts'
import { powerSource } from '../catalog/source-packs.ts'
import { traitLabel } from '../catalog/traits.ts'
import { ageProfileIds, ageProfiles, thinBloodProfile, type CreationProfile } from './creation-profiles.ts'
import { bloodEffects, experienceCosts } from './starting-xp.ts'
import { attributeCapacity, ratings, skillDistributionIds, skillDistributions, specialtySkills, type Rating } from './trait-ledger.ts'

interface ReferenceEntry {
  id: string
  title: string
  summary: string
  source: string
  details?: { label: string; value: string }[]
  keywords?: string
  link?: { label: string; href: string }
}

function allocation(capacity: Record<Rating, number>) {
  return ratings.filter(rating => capacity[rating] > 0).map(rating => `${capacity[rating]} at ${rating} dots`).join(', ')
}

function profileBudget(profile: CreationProfile) {
  return `${profile.generations.map(generation => `${generation}th`).join(' / ')} Generation · ${profile.advantages} Advantage dots · ${profile.flaws} Flaw dots · ${profile.xp} starting XP`
}

const costs = experienceCosts
const newRating = (multiplier: number) => `New rating × ${multiplier} XP`
const rules: ReferenceEntry[] = [
  {
    id: 'age-profiles', title: 'Age profiles and starting budgets', source: 'Core pp. 136–140, 148–149',
    summary: 'Use the budget for the character’s age and blood status. Keep Predator Type grants separate from base dots.',
    keywords: 'generation merits flaws backgrounds Caitiff clan creation allocation',
    details: [
      ...ageProfileIds.map(id => ({ label: ageProfiles[id].name, value: profileBudget(ageProfiles[id]) })),
      { label: 'Thin-blood fledgling', value: profileBudget(thinBloodProfile) },
    ],
  },
  {
    id: 'attributes', title: 'Starting Attribute dots', source: 'Core p. 136, pp. 155–157',
    summary: `Fill the nine Attribute slots with ${allocation(attributeCapacity)}. Each number counts Attributes at that exact rating.`,
    keywords: 'allocation distribution physical social mental',
  },
  {
    id: 'skills', title: 'Starting Skill distributions', source: 'Core p. 136',
    summary: 'Pick one distribution. Skills outside its slots start at zero before grants.',
    keywords: 'allocation starting dots',
    details: skillDistributionIds.map(id => ({ label: skillDistributions[id].name, value: allocation(skillDistributions[id].capacity) })),
  },
  {
    id: 'specialties', title: 'Starting Specialties', source: 'Core pp. 136, 145, 159–171',
    summary: `Choose a free Specialty for one rated Skill. ${specialtySkills.map(traitLabel).join(', ')} each get a Specialty with their first dot. Most Skills allow one Specialty per dot. Craft can exceed that limit.`,
    keywords: 'specialty free first dot',
  },
  {
    id: 'predator-grants', title: 'Predator Type grants', source: 'Core pp. 136, 149, 175–178',
    summary: 'Neonates and ancillae choose an eligible Predator Type. Its grants sit outside base budgets. A Specialty grant for a Skill with zero dots gives one Skill dot instead.',
    keywords: 'feeding skill dot specialty generation fledgling thin-blood',
  },
  {
    id: 'xp-costs', title: 'XP costs', source: 'Core pp. 107, 137, 183, 214, 244',
    summary: 'Buy rating increases in order. Starting XP and XP earned in play have separate balances in the creator.',
    keywords: 'experience points advancement price upgrade thin-blood discipline affinity',
    details: [
      { label: 'Attribute', value: newRating(costs.attribute) },
      { label: 'Skill', value: newRating(costs.skill) },
      { label: 'Specialty', value: `${costs.specialty} XP` },
      { label: 'Clan Discipline', value: newRating(costs.clanDiscipline) },
      { label: 'Caitiff Discipline', value: newRating(costs.caitiffDiscipline) },
      { label: 'Out-of-clan Discipline or Thin-blood Affinity', value: newRating(costs.otherDiscipline) },
      { label: 'Advantage', value: `${costs.advantagePerDot} XP per dot added` },
      { label: 'Blood Potency', value: newRating(costs.bloodPotency) },
    ],
  },
  {
    id: 'discipline-powers', title: 'Discipline power prerequisites', source: 'Core pp. 107, 231, 244',
    summary: 'Choose a distinct power at or below each new Discipline rating. Meet any Amalgam rating or required earlier power at the point of purchase. Confirm the learning requirements for a first Caitiff or new out-of-clan Discipline.',
    keywords: 'clan disciplines advancement learning blood tasting order',
  },
  {
    id: 'health', title: 'Health and Resilience', source: 'Core pp. 136, 155, 258',
    summary: 'Start with Stamina + 3. If you know Resilience, add your current Fortitude rating to Health as well.',
    keywords: 'derived track attribute physical',
  },
  {
    id: 'willpower', title: 'Willpower', source: 'Core p. 136, pp. 156–157',
    summary: 'Add current Composure and Resolve to get maximum Willpower.',
    keywords: 'derived track attribute mental',
  },
  {
    id: 'humanity', title: 'Starting Humanity', source: 'Core pp. 136–140, 149, 175–178',
    summary: `Fledglings, Thin-bloods, and neonates start from Humanity ${ageProfiles.neonate.humanity}. Ancillae start from ${ageProfiles.ancilla.humanity}. Apply any Humanity adjustment from the chosen Predator Type.`,
    keywords: 'derived track base humanity',
  },
  {
    id: 'blood-potency', title: 'Blood Potency, Blood Surge, and Bane Severity', source: 'Core pp. 214, 216 · Renegade Blood Potency correction',
    summary: 'Generation caps Blood Potency. The creator uses the corrected Blood Surge and Bane Severity values shown here. A Thin-blood with Clan Curse has Bane Severity 1.',
    keywords: 'derived track errata generation clan bane thin-blood',
    details: Object.entries(bloodEffects).map(([rating, { bloodSurge, baneSeverity }]) => ({
      label: `Blood Potency ${rating}`, value: `Blood Surge +${bloodSurge} ${bloodSurge === 1 ? 'die' : 'dice'} · Bane Severity ${baneSeverity}`,
    })),
    link: { label: 'Blood Potency correction (PDF)', href: 'https://renegadegamestudios.com/content/File%20Storage%20for%20site/VTM/BloodPotencyTable.pdf' },
  },
  ...disciplineIds.flatMap(id => allDisciplinePowers[id].flatMap(power => {
    const { amalgam, prerequisite } = power
    if (!amalgam && !prerequisite) return []
    const details = [{ label: 'Minimum rating', value: `${disciplines[id]} ${power.level}` }]
    if (amalgam) details.push({ label: 'Amalgam', value: `${disciplines[amalgam.discipline]} ${amalgam.dots}` })
    if (prerequisite) details.push({ label: 'Required power', value: prerequisite.name })
    return [{
      id: power.id, title: power.name, source: powerSource(power),
      summary: power.sourcePack ? 'Enable the Player’s Guide source pack to choose this power.' : 'Meet these requirements when choosing this power.',
      keywords: 'discipline prerequisite power', details,
    }]
  })),
]

function normalizeSearch(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

const searchableRules = rules.map(entry => ({
  entry, text: normalizeSearch([entry.title, entry.summary, entry.source, entry.keywords,
    ...(entry.details?.flatMap(({ label, value }) => [label, value]) ?? [])].join(' ')),
}))

export function searchTableReference(query: string) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  return searchableRules.filter(({ text }) => terms.every(term => text.includes(term))).map(({ entry }) => entry)
}
