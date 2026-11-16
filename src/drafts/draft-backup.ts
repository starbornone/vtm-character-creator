import { guideSteps, type CharacterDraft, type GuideStep } from '../rules/character-guide.ts'
import { defaultAgeProfile } from '../rules/creation-profiles.ts'
import { isCharacterDraft, isRecord } from './draft-inputs.ts'

const legacyDraftSchemaVersion = 1
const profiledDraftSchemaVersion = 2
export const draftRuleset = 'vtm-v5'
const backupFormat = 'vtm-character-creator-draft'

export interface DraftSnapshot {
  name: string
  step: GuideStep
  character: CharacterDraft
}

export function draftSchemaVersionFor(snapshots: readonly DraftSnapshot[]) {
  return snapshots.some(({ character }) => character.ageProfile && character.ageProfile !== defaultAgeProfile)
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

type BackupResult = { draft: DraftSnapshot; issue?: never } | { draft?: never; issue: string }

export function readDraftBackup(raw: string): BackupResult {
  let value: unknown
  try {
    value = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch {
    return { issue: 'This file is not valid JSON.' }
  }

  if (!isRecord(value) || value.format !== backupFormat) return { issue: 'Choose a Character Creator draft backup.' }
  if (value.schemaVersion !== legacyDraftSchemaVersion && value.schemaVersion !== profiledDraftSchemaVersion) return { issue: 'This draft backup version is unsupported.' }
  if (value.ruleset !== draftRuleset) return { issue: 'This draft backup uses an unsupported ruleset.' }
  if (!isDraftSnapshot(value.draft)) return { issue: 'The draft name, guide step, or character inputs are missing or invalid.' }
  if (value.schemaVersion !== draftSchemaVersionFor([value.draft])) return { issue: 'The age profile does not match this draft backup version.' }

  const { name, step, character } = value.draft
  return { draft: { name: name.trim(), step, character } }
}
