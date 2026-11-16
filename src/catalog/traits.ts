// V5 Core Rulebook, Renegade second printing, pp. 152, 155–171.
export const traitGroups = [
  {
    name: 'Physical',
    attributes: ['strength', 'dexterity', 'stamina'],
    skills: ['athletics', 'brawl', 'craft', 'drive', 'firearms', 'larceny', 'melee', 'stealth', 'survival'],
  },
  {
    name: 'Social',
    attributes: ['charisma', 'manipulation', 'composure'],
    skills: ['animal-ken', 'etiquette', 'insight', 'intimidation', 'leadership', 'performance', 'persuasion', 'streetwise', 'subterfuge'],
  },
  {
    name: 'Mental',
    attributes: ['intelligence', 'wits', 'resolve'],
    skills: ['academics', 'awareness', 'finance', 'investigation', 'medicine', 'occult', 'politics', 'science', 'technology'],
  },
] as const

export type AttributeId = (typeof traitGroups)[number]['attributes'][number]
export type SkillId = (typeof traitGroups)[number]['skills'][number]

export const skillIds = traitGroups.flatMap(({ skills }): readonly SkillId[] => skills)

export function traitLabel(id: AttributeId | SkillId) {
  return id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
}
