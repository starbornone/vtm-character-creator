import { caitiffOption, thinBloodOption } from '../catalog/clan-path.ts'
import { isSourcePacks, unavailableSourceMessage, unavailableSourcePacks } from '../catalog/source-packs.ts'
import { usesPlayersGuideSelections } from '../rules/creation-sources.ts'
import { guideSteps, type CharacterDraft, type GuideStep } from '../rules/character-guide.ts'
import { ageProfiles, defaultAgeProfile, generationForProfile } from '../rules/creation-profiles.ts'
import { isCharacterDraft, isRecord } from './draft-inputs.ts'

const legacyDraftSchemaVersion = 1
const profiledDraftSchemaVersion = 2
const caitiffDraftSchemaVersion = 3
const thinBloodDraftSchemaVersion = 4
const sourceDraftSchemaVersion = 5
const advancementDraftSchemaVersion = 6
const relationshipMapDraftSchemaVersion = 7
const draftSchemaVersions = [legacyDraftSchemaVersion, profiledDraftSchemaVersion, caitiffDraftSchemaVersion, thinBloodDraftSchemaVersion, sourceDraftSchemaVersion, advancementDraftSchemaVersion, relationshipMapDraftSchemaVersion]
export const draftRuleset = 'vtm-v5'
const backupFormat = 'vtm-character-creator-draft'

export interface DraftSnapshot {
  name: string
  step: GuideStep
  character: CharacterDraft
}

export function draftSchemaVersionFor(snapshots: readonly DraftSnapshot[]) {
  if (snapshots.some(({ character }) => character.relationshipMap !== undefined)) return relationshipMapDraftSchemaVersion
  if (snapshots.some(({ character }) => character.advancement !== undefined)) return advancementDraftSchemaVersion
  if (snapshots.some(({ character }) => character.sourcePacks !== undefined || usesPlayersGuideSelections(character.clanPath, character.starting.purchases))) {
    return sourceDraftSchemaVersion
  }
  if (snapshots.some(({ character: { clanPath, starting } }) =>
    clanPath.clan === thinBloodOption.id || clanPath.thinBlood !== undefined || (starting.generation ?? 0) >= 14)) {
    return thinBloodDraftSchemaVersion
  }
  if (snapshots.some(({ character: { clanPath, starting } }) =>
    clanPath.clan === caitiffOption.id
    || starting.purchases.some(purchase => purchase.kind === 'discipline' && purchase.caitiffLearning))) {
    return caitiffDraftSchemaVersion
  }
  return snapshots.some(({ character: { ageProfile, starting } }) =>
    (ageProfile ?? defaultAgeProfile) !== defaultAgeProfile
    || (starting.generation !== undefined && !generationForProfile(ageProfiles.neonate, starting.generation))
    || starting.purchases.some(purchase => purchase.kind === 'blood-potency' && purchase.to === 4))
    ? profiledDraftSchemaVersion : legacyDraftSchemaVersion
}

export function isDraftSnapshot(value: unknown): value is DraftSnapshot {
  return isRecord(value)
    && typeof value.name === 'string' && value.name.trim().length > 0
    && guideSteps.some(step => step.id === value.step)
    && isCharacterDraft(value.character)
}

export function serializeDraftDownload(draft: DraftSnapshot): string {
  const { name, step, character } = draft
  return JSON.stringify({
    format: backupFormat, schemaVersion: draftSchemaVersionFor([draft]), ruleset: draftRuleset,
    draft: { name, step, character },
  }, null, 2) + '\n'
}

type BackupResult = { draft: DraftSnapshot; issue?: never } | { draft?: never; issue: string; unavailableSources?: string[] }

export function readDraftBackup(raw: string): BackupResult {
  let value: unknown
  try {
    value = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch {
    return { issue: 'This file is not valid JSON.' }
  }

  if (!isRecord(value) || value.format !== backupFormat) return { issue: 'Choose a Character Creator draft backup.' }
  const { schemaVersion } = value
  if (typeof schemaVersion !== 'number' || !draftSchemaVersions.includes(schemaVersion)) return { issue: 'This draft backup version is unsupported.' }
  if (value.ruleset !== draftRuleset) return { issue: 'This draft backup uses an unsupported ruleset.' }
  if (schemaVersion >= sourceDraftSchemaVersion && isRecord(value.draft) && isRecord(value.draft.character)) {
    const packs = value.draft.character.sourcePacks
    const unavailable = isSourcePacks(packs) ? unavailableSourcePacks(packs) : []
    if (unavailable.length) return { issue: unavailableSourceMessage(unavailable), unavailableSources: unavailable }
  }
  if (!isDraftSnapshot(value.draft)) return { issue: 'The draft name, guide step, or character inputs are missing or invalid.' }
  if (schemaVersion !== draftSchemaVersionFor([value.draft])) return { issue: 'The character inputs do not match this draft backup version.' }

  const { name, step, character } = value.draft
  return { draft: { name: name.trim(), step, character } }
}
