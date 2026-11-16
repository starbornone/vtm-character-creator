import { readCoterieHandoff } from './coterie-plans.ts'
import { readDraftBackup } from './draft-backup.ts'

export function readDraftRestoreFile(raw: string): ReturnType<typeof readDraftBackup> {
  const result = readDraftBackup(raw)
  if (result.issue !== undefined && readCoterieHandoff(raw).value) {
    return { issue: 'This is a coterie handoff. Open Coterie & Domain and select Choose coterie JSON.' }
  }
  return result
}

export function readCoterieRestoreFile(raw: string): ReturnType<typeof readCoterieHandoff> {
  const result = readCoterieHandoff(raw)
  if (result.issue !== undefined && readDraftBackup(raw).draft) {
    return { issue: 'This is a character draft backup. Open Browser drafts and select Choose JSON backup.' }
  }
  return result
}
