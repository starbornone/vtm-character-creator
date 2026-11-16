import { guideSteps, type CharacterDraft, type GuideStep } from '../rules/character-guide.ts'
import { isCharacterDraft, isRecord } from './draft-inputs.ts'

export const draftSchemaVersion = 1
export const draftRuleset = 'vtm-v5'
const backupFormat = 'vtm-character-creator-draft'

export interface DraftSnapshot {
  name: string
  step: GuideStep
  character: CharacterDraft
}

export function isDraftSnapshot(value: unknown): value is DraftSnapshot {
  return isRecord(value)
    && typeof value.name === 'string' && value.name.trim().length > 0
    && guideSteps.some(step => step.id === value.step)
    && isCharacterDraft(value.character)
}

export function serializeDraftDownload({ name, step, character }: DraftSnapshot): string {
  return JSON.stringify({
    format: backupFormat, schemaVersion: draftSchemaVersion, ruleset: draftRuleset,
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
  if (value.schemaVersion !== draftSchemaVersion) return { issue: 'This draft backup version is unsupported.' }
  if (value.ruleset !== draftRuleset) return { issue: 'This draft backup uses an unsupported ruleset.' }
  if (!isDraftSnapshot(value.draft)) return { issue: 'The draft name, guide step, or character inputs are missing or invalid.' }

  const { name, step, character } = value.draft
  return { draft: { name: name.trim(), step, character } }
}
