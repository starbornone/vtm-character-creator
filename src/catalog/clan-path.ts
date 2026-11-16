import type { SkillId } from './traits.ts'

export const disciplines = {
  animalism: 'Animalism',
  auspex: 'Auspex',
  'blood-sorcery': 'Blood Sorcery',
  celerity: 'Celerity',
  dominate: 'Dominate',
  fortitude: 'Fortitude',
  obfuscate: 'Obfuscate',
  potence: 'Potence',
  presence: 'Presence',
  protean: 'Protean',
} as const

export type DisciplineId = keyof typeof disciplines
export const disciplineIds = Object.keys(disciplines) as DisciplineId[]

export interface DisciplinePower {
  id: string
  name: string
  level: 1 | 2 | 3 | 4
  page: number
  amalgam?: { discipline: DisciplineId; dots: number }
  prerequisite?: { id: string; name: string }
}

function power(id: string, name: string, level: DisciplinePower['level'], page: number, requirements?: Pick<DisciplinePower, 'amalgam' | 'prerequisite'>): DisciplinePower {
  return { id, name, level, page, ...requirements }
}

// Core pp. 244–274. The ancilla starting XP budget can reach rank 4.
export const disciplinePowers: Record<DisciplineId, readonly DisciplinePower[]> = {
  animalism: [
    power('bond-famulus', 'Bond Famulus', 1, 245),
    power('sense-the-beast', 'Sense the Beast', 1, 245),
    power('feral-whispers', 'Feral Whispers', 2, 246),
    power('animal-succulence', 'Animal Succulence', 3, 246),
    power('quell-the-beast', 'Quell the Beast', 3, 246),
    power('unliving-hive', 'Unliving Hive', 3, 246, { amalgam: { discipline: 'obfuscate', dots: 2 } }),
    power('subsume-the-spirit', 'Subsume the Spirit', 4, 247),
  ],
  auspex: [
    power('heightened-senses', 'Heightened Senses', 1, 249),
    power('sense-the-unseen', 'Sense the Unseen', 1, 249),
    power('premonition', 'Premonition', 2, 249),
    power('scry-the-soul', 'Scry the Soul', 3, 249),
    power('share-the-senses', 'Share the Senses', 3, 250),
    power('spirits-touch', 'Spirit’s Touch', 4, 250),
  ],
  'blood-sorcery': [
    power('corrosive-vitae', 'Corrosive Vitae', 1, 272),
    power('a-taste-for-blood', 'A Taste for Blood', 1, 272),
    power('extinguish-vitae', 'Extinguish Vitae', 2, 273),
    power('blood-of-potency', 'Blood of Potency', 3, 273),
    power('scorpions-touch', 'Scorpion’s Touch', 3, 273),
    power('theft-of-vitae', 'Theft of Vitae', 4, 274),
  ],
  celerity: [
    power('cats-grace', 'Cat’s Grace', 1, 252),
    power('rapid-reflexes', 'Rapid Reflexes', 1, 253),
    power('fleetness', 'Fleetness', 2, 253),
    power('blink', 'Blink', 3, 253),
    power('traversal', 'Traversal', 3, 253),
    power('draught-of-elegance', 'Draught of Elegance', 4, 254),
    power('unerring-aim', 'Unerring Aim', 4, 254, { amalgam: { discipline: 'auspex', dots: 2 } }),
  ],
  dominate: [
    power('cloud-memory', 'Cloud Memory', 1, 256),
    power('compel', 'Compel', 1, 256),
    power('mesmerize', 'Mesmerize', 2, 256),
    power('dementation', 'Dementation', 2, 256, { amalgam: { discipline: 'obfuscate', dots: 2 } }),
    power('the-forgetful-mind', 'The Forgetful Mind', 3, 257),
    power('submerged-directive', 'Submerged Directive', 3, 257),
    power('rationalize', 'Rationalize', 4, 257),
  ],
  fortitude: [
    power('resilience', 'Resilience', 1, 258),
    power('unswayable-mind', 'Unswayable Mind', 1, 258),
    power('toughness', 'Toughness', 2, 258),
    power('enduring-beasts', 'Enduring Beasts', 2, 258, { amalgam: { discipline: 'animalism', dots: 1 } }),
    power('defy-bane', 'Defy Bane', 3, 259),
    power('fortify-the-inner-facade', 'Fortify the Inner Façade', 3, 259),
    power('draught-of-endurance', 'Draught of Endurance', 4, 259),
  ],
  obfuscate: [
    power('cloak-of-shadows', 'Cloak of Shadows', 1, 261),
    power('silence-of-death', 'Silence of Death', 1, 261),
    power('unseen-passage', 'Unseen Passage', 2, 261),
    power('ghost-in-the-machine', 'Ghost in the Machine', 3, 262),
    power('mask-of-a-thousand-faces', 'Mask of a Thousand Faces', 3, 262),
    power('conceal', 'Conceal', 4, 262, { amalgam: { discipline: 'auspex', dots: 3 } }),
    power('vanish', 'Vanish', 4, 262, { prerequisite: { id: 'cloak-of-shadows', name: 'Cloak of Shadows' } }),
  ],
  potence: [
    power('lethal-body', 'Lethal Body', 1, 264),
    power('soaring-leap', 'Soaring Leap', 1, 264),
    power('prowess', 'Prowess', 2, 264),
    power('brutal-feed', 'Brutal Feed', 3, 264),
    power('spark-of-rage', 'Spark of Rage', 3, 265, { amalgam: { discipline: 'presence', dots: 3 } }),
    power('uncanny-grip', 'Uncanny Grip', 3, 265),
    power('draught-of-might', 'Draught of Might', 4, 265),
  ],
  presence: [
    power('awe', 'Awe', 1, 267),
    power('daunt', 'Daunt', 1, 267),
    power('lingering-kiss', 'Lingering Kiss', 2, 267),
    power('dread-gaze', 'Dread Gaze', 3, 267),
    power('entrancement', 'Entrancement', 3, 268),
    power('irresistible-voice', 'Irresistible Voice', 4, 268, { amalgam: { discipline: 'dominate', dots: 1 } }),
    power('summon', 'Summon', 4, 268),
  ],
  protean: [
    power('eyes-of-the-beast', 'Eyes of the Beast', 1, 269),
    power('weight-of-the-feather', 'Weight of the Feather', 1, 269),
    power('feral-weapons', 'Feral Weapons', 2, 270),
    power('earth-meld', 'Earth Meld', 3, 270),
    power('shapechange', 'Shapechange', 3, 270),
    power('metamorphosis', 'Metamorphosis', 4, 271, { prerequisite: { id: 'shapechange', name: 'Shapechange' } }),
  ],
}

export const startingRituals = [
  { id: 'blood-walk', name: 'Blood Walk', page: 276 },
  { id: 'clinging-of-the-insect', name: 'Clinging of the Insect', page: 276 },
  { id: 'craft-bloodstone', name: 'Craft Bloodstone', page: 276 },
  { id: 'wake-with-evenings-freshness', name: 'Wake with Evening’s Freshness', page: 276 },
  { id: 'ward-against-ghouls', name: 'Ward Against Ghouls', page: 277 },
] as const

export interface ClanOption {
  id: string
  name: string
  disciplines: readonly DisciplineId[]
  bane: string
  compulsion: string
  source: string
}

export const coreClans: readonly ClanOption[] = [
  { id: 'brujah', name: 'Brujah', disciplines: ['celerity', 'potence', 'presence'], bane: 'Violent Temper', compulsion: 'Rebellion', source: 'Core pp. 65–67, 210' },
  { id: 'gangrel', name: 'Gangrel', disciplines: ['animalism', 'fortitude', 'protean'], bane: 'Bestial Features', compulsion: 'Feral Impulses', source: 'Core pp. 69–73, 210' },
  { id: 'malkavian', name: 'Malkavian', disciplines: ['auspex', 'dominate', 'obfuscate'], bane: 'Fractured Perspective', compulsion: 'Delusion', source: 'Core pp. 75–79, 210' },
  { id: 'nosferatu', name: 'Nosferatu', disciplines: ['animalism', 'obfuscate', 'potence'], bane: 'Repulsiveness', compulsion: 'Cryptophilia', source: 'Core pp. 81–85, 210' },
  { id: 'toreador', name: 'Toreador', disciplines: ['auspex', 'celerity', 'presence'], bane: 'Aesthetic Fixation', compulsion: 'Obsession', source: 'Core pp. 87–91, 211' },
  { id: 'tremere', name: 'Tremere', disciplines: ['auspex', 'blood-sorcery', 'dominate'], bane: 'Deficient Blood', compulsion: 'Perfectionism', source: 'Core pp. 93–97, 211' },
  { id: 'ventrue', name: 'Ventrue', disciplines: ['dominate', 'fortitude', 'presence'], bane: 'Rarefied Tastes', compulsion: 'Arrogance', source: 'Core pp. 99–103, 211' },
]

export const caitiffOption = {
  id: 'caitiff', name: 'Caitiff', disciplines: disciplineIds,
  bane: '', compulsion: '', source: 'Core pp. 107, 136–137, 148, 194',
} satisfies ClanOption

export const clanChoices = [...coreClans, caitiffOption]

export interface SpecialtyOption {
  skill: SkillId
  name: string
  custom?: boolean
}

export interface DotGrant {
  name: string
  dots: number
}

interface GrantChoiceOption {
  id: string
  name: string
  fixed?: number
}

interface GrantChoice {
  id: string
  label: string
  kind: 'advantage' | 'flaw'
  options: readonly GrantChoiceOption[]
  dots: number
  mode: 'one' | 'split'
}

export interface PredatorOption {
  id: string
  name: string
  disciplines: readonly DisciplineId[]
  specialties: readonly SpecialtyOption[]
  humanityChange?: number
  bloodPotencyChange?: 1
  advantages?: readonly DotGrant[]
  flaws?: readonly DotGrant[]
  choices?: readonly GrantChoice[]
  source: string
}

export const corePredators: readonly PredatorOption[] = [
  {
    id: 'alleycat', name: 'Alleycat', source: 'Core pp. 149, 175–176',
    disciplines: ['celerity', 'potence'], specialties: [{ skill: 'brawl', name: 'Grappling' }, { skill: 'intimidation', name: 'Stickups' }],
    humanityChange: -1, advantages: [{ name: 'Criminal Contacts', dots: 3 }],
  },
  {
    id: 'bagger', name: 'Bagger', source: 'Core p. 176',
    disciplines: ['blood-sorcery', 'obfuscate'], specialties: [{ skill: 'larceny', name: 'Lockpicking' }, { skill: 'streetwise', name: 'Black Market' }],
    advantages: [{ name: 'Iron Gullet', dots: 3 }], flaws: [{ name: 'Enemy', dots: 2 }],
  },
  {
    id: 'blood-leech', name: 'Blood Leech', source: 'Core p. 176',
    disciplines: ['celerity', 'protean'], specialties: [{ skill: 'brawl', name: 'Kindred' }, { skill: 'stealth', name: 'Against Kindred' }],
    humanityChange: -1, bloodPotencyChange: 1, flaws: [{ name: 'Prey Exclusion (Mortals)', dots: 2 }],
    choices: [{ id: 'blood-leech-flaw', label: 'Blood Leech Flaw', kind: 'flaw', options: [
      { id: 'diablerist', name: 'Dark Secret (Diablerist)' }, { id: 'shunned', name: 'Shunned' },
    ], dots: 2, mode: 'one' }],
  },
  {
    id: 'cleaver', name: 'Cleaver', source: 'Core p. 177',
    disciplines: ['dominate', 'animalism'], specialties: [{ skill: 'persuasion', name: 'Gaslighting' }, { skill: 'subterfuge', name: 'Coverups' }],
    advantages: [{ name: 'Herd', dots: 2 }], flaws: [{ name: 'Dark Secret (Cleaver)', dots: 1 }],
  },
  {
    id: 'consensualist', name: 'Consensualist', source: 'Core p. 177',
    disciplines: ['auspex', 'fortitude'], specialties: [{ skill: 'medicine', name: 'Phlebotomy' }, { skill: 'persuasion', name: 'Victims' }],
    humanityChange: 1, flaws: [{ name: 'Dark Secret (Masquerade Breacher)', dots: 1 }, { name: 'Prey Exclusion (Nonconsenting)', dots: 1 }],
  },
  {
    id: 'farmer', name: 'Farmer', source: 'Core p. 177',
    disciplines: ['animalism', 'protean'], specialties: [{ skill: 'animal-ken', name: 'Specific Animal', custom: true }, { skill: 'survival', name: 'Hunting' }],
    humanityChange: 1, flaws: [{ name: 'Farmer', dots: 2 }],
  },
  {
    id: 'osiris', name: 'Osiris', source: 'Core p. 177',
    disciplines: ['blood-sorcery', 'presence'], specialties: [{ skill: 'occult', name: 'Specific Tradition', custom: true }, { skill: 'performance', name: 'Specific Entertainment Field', custom: true }],
    choices: [
      { id: 'osiris-advantages', label: 'Osiris Advantages', kind: 'advantage', options: [
        { id: 'fame', name: 'Fame' }, { id: 'herd', name: 'Herd' },
      ], dots: 3, mode: 'split' },
      {
        id: 'osiris-flaws', label: 'Osiris Flaws', kind: 'flaw', dots: 2, mode: 'split',
        options: [
          { id: 'enemy', name: 'Enemy' },
          { id: 'ultraviolet', name: 'Folkloric Bane (Ultraviolet Light)', fixed: 1 },
          { id: 'silver', name: 'Folkloric Bane (Silver)', fixed: 1 },
          { id: 'holy-water', name: 'Folkloric Bane (Holy Water)', fixed: 1 },
          { id: 'garlic', name: 'Folkloric Block (Garlic)', fixed: 1 },
          { id: 'running-water', name: 'Folkloric Block (Running Water)', fixed: 1 },
          { id: 'invitation', name: 'Folkloric Block (Invitation)', fixed: 1 },
          { id: 'holy-symbols', name: 'Folkloric Block (Holy Symbols)', fixed: 1 },
          { id: 'white-animals', name: 'Folkloric Block (White Animals)', fixed: 1 },
          { id: 'wild-roses', name: 'Folkloric Block (Wild Roses)', fixed: 1 },
          { id: 'spilled-seeds', name: 'Folkloric Block (Spilled Seeds)', fixed: 1 },
          { id: 'stake-bait', name: 'Stake Bait', fixed: 2 },
          { id: 'stigmata', name: 'Stigmata', fixed: 1 },
        ],
      },
    ],
  },
  {
    id: 'sandman', name: 'Sandman', source: 'Core p. 177',
    disciplines: ['auspex', 'obfuscate'], specialties: [{ skill: 'medicine', name: 'Anesthetics' }, { skill: 'stealth', name: 'Break-in' }],
    advantages: [{ name: 'Resources', dots: 1 }],
  },
  {
    id: 'scene-queen', name: 'Scene Queen', source: 'Core p. 178',
    disciplines: ['dominate', 'potence'], specialties: [{ skill: 'etiquette', name: 'Specific Scene', custom: true }, { skill: 'leadership', name: 'Specific Scene', custom: true }, { skill: 'streetwise', name: 'Specific Scene', custom: true }],
    advantages: [{ name: 'Fame', dots: 1 }, { name: 'Contacts', dots: 1 }],
    choices: [{ id: 'scene-queen-flaw', label: 'Scene Queen Flaw', kind: 'flaw', options: [
      { id: 'disliked', name: 'Disliked (Outside the Scene)' }, { id: 'prey-exclusion', name: 'Prey Exclusion (Different Scene)' },
    ], dots: 1, mode: 'one' }],
  },
  {
    id: 'siren', name: 'Siren', source: 'Core p. 178',
    disciplines: ['fortitude', 'presence'], specialties: [{ skill: 'persuasion', name: 'Seduction' }, { skill: 'subterfuge', name: 'Seduction' }],
    advantages: [{ name: 'Beautiful', dots: 2 }], flaws: [{ name: 'Enemy', dots: 1 }],
  },
]
