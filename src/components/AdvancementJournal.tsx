import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ExperiencePurchases } from '@/components/StartingExperienceEditor'
import { Card, CardContent } from '@/components/ui/card'
import { emptyAdvancement, isXpAward, type evaluateAdvancement, type AdvancementDraft } from '@/rules/advancement'

export function AdvancementJournal({ journal = emptyAdvancement, result, creationComplete, onChange }: {
  journal?: AdvancementDraft
  result?: ReturnType<typeof evaluateAdvancement>
  creationComplete: boolean
  onChange: (journal: AdvancementDraft) => void
}) {
  const [amount, setAmount] = useState('')
  const earned = result?.earned ?? 0
  const award = Number(amount)
  const awardValid = isXpAward(award) && Number.isSafeInteger(earned + award)

  return (
    <Card className="gap-0 py-0" role="region" aria-labelledby="advancement-heading">
      <CardContent className="space-y-4 p-5 sm:p-7">
        <div>
          <h2 id="advancement-heading" className="text-2xl font-semibold tracking-tight">XP Advancement Journal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Record XP earned in play and spend it on the completed character.</p>
        </div>
        {!creationComplete && <p className="text-sm text-muted-foreground">
          {result ? 'The journal is paused. Close the open creation choices to resume it.' : 'Finish the creation choices to start tracking advancement.'}
        </p>}
        {(creationComplete || result) && <p role="status" className="text-sm font-medium">
          {earned} XP earned · {result?.spent ?? 0} spent · {result?.remaining ?? 0} remaining
        </p>}
        {creationComplete && <>
          <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
            event.preventDefault()
            if (awardValid) {
              onChange({ ...journal, awards: [...journal.awards, award] })
              setAmount('')
            }
          }}>
            <label className="grid min-w-0 gap-1 text-sm">XP award
              <input className="ledger-field w-full" type="number" min={1} max={Number.MAX_SAFE_INTEGER - earned} step={1}
                value={amount} onChange={event => setAmount(event.target.value)} />
            </label>
            <button className="guide-button guide-action disabled:opacity-50" type="submit" disabled={!awardValid}>
              <Plus aria-hidden="true" />Record XP
            </button>
          </form>
          {journal.awards.length > 0 && <ol aria-label="XP awards" className="flex flex-wrap gap-2">
            {journal.awards.map((value, index) => <li key={index} className="flex items-center gap-2 rounded-md border border-border px-3 py-1">
              <span className="text-sm">+{value} XP</span>
              <button type="button" className="guide-action rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-rose-300"
                aria-label={`Remove XP award ${index + 1} of ${value} XP`}
                onClick={() => onChange({ ...journal, awards: journal.awards.filter((_, offset) => offset !== index) })}>
                <Trash2 aria-hidden="true" />
              </button>
            </li>)}
          </ol>}
          {result && <ExperiencePurchases state={result.final} entries={result.entries} purchases={journal.purchases} advancing
            onChange={purchases => onChange({ ...journal, purchases })} />}
        </>}
      </CardContent>
    </Card>
  )
}
