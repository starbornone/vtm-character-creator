import type { evaluateCharacter } from '@/rules/character-guide'

type Sheet = ReturnType<typeof evaluateCharacter>['sheet']
type Detail = readonly [label: string, value: string | number | undefined]

function Details({ rows }: { rows: readonly Detail[] }) {
  return <dl className="sheet-details">
    {rows.filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => (
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
    ))}
  </dl>
}

export function CharacterSheet({ sheet, mechanicalOnly = false }: { sheet: Sheet; mechanicalOnly?: boolean }) {
  const { identity, tracks, relationships, thinBlood } = sheet
  const tracksAndExperience: Detail[] = [
    ['Health', tracks.health ?? '—'], ['Willpower', tracks.willpower ?? '—'], ['Humanity', tracks.humanity],
    ['Blood Potency', tracks.bloodPotency], ['Bane Severity', tracks.baneSeverity], ['Blood Surge dice', tracks.bloodSurge],
    ['XP remaining', sheet.xpRemaining],
  ]
  return (
    <article className="character-sheet" aria-labelledby="sheet-name">
      <header className="sheet-header">
        <div>
          <p className="sheet-caption">Vampire: The Masquerade · Fifth Edition</p>
          <h2 id="sheet-name">{mechanicalOnly ? 'Mechanical sheet' : identity.name || 'Unnamed character'}</h2>
          {!mechanicalOnly && identity.concept && <p className="sheet-concept">{identity.concept}</p>}
        </div>
        {sheet.draft && <p className="sheet-draft">Draft · Open choices</p>}
      </header>
      <Details rows={[
        ['Chronicle', mechanicalOnly ? undefined : identity.chronicle], ['Age profile', identity.ageProfile], ['Clan', identity.clan], ['Predator Type', identity.predator],
        ['Generation', identity.generation && `${identity.generation}th`], ['Embraced', mechanicalOnly ? undefined : identity.embraced],
        ['Clan Bane', sheet.bane], ['Compulsion', sheet.compulsion],
      ]} />
      <dl className="sheet-tracks" aria-label="Character tracks">
        {tracksAndExperience.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <section aria-labelledby="sheet-traits">
        <h3 id="sheet-traits">Attributes &amp; Skills</h3>
        <div className="sheet-trait-grid">
          {sheet.traitGroups.map(group => <section key={group.name}>
            <h4>{group.name}</h4>
            <dl className="sheet-ratings sheet-attributes">
              {group.attributes.map(trait => <div key={trait.name}><dt>{trait.name}</dt><dd>{trait.rating ?? '—'}</dd></div>)}
            </dl>
            <dl className="sheet-ratings">
              {group.skills.map(skill => <div key={skill.name}>
                <dt>{skill.name}{skill.specialties.length > 0 && <span className="sheet-specialties">{skill.specialties.join(', ')}</span>}</dt>
                <dd>{skill.rating ?? '—'}</dd>
              </div>)}
            </dl>
          </section>)}
        </div>
      </section>

      <div className="sheet-two-col">
        <section aria-labelledby="sheet-disciplines">
          <h3 id="sheet-disciplines">Disciplines</h3>
          <ul className="sheet-list">
            {sheet.disciplines.map(discipline => <li key={discipline.name}>
              <strong>{discipline.name} {discipline.rating}</strong>
              {discipline.powers.length > 0 && <span> {discipline.powers.join(', ')}</span>}
            </li>)}
          </ul>
          {thinBlood?.alchemy && <p><strong>Thin-blood Alchemy {thinBlood.alchemy.rating}</strong> · {thinBlood.alchemy.method.name} · {thinBlood.alchemy.formula.name}</p>}
          {sheet.ritual && <p><strong>Starting Ritual</strong> {sheet.ritual.name} · Core p. {sheet.ritual.page}</p>}
          <h3>Starting XP</h3>
          <p>{sheet.xpSpent} spent · {sheet.xpRemaining} remaining</p>
          <ol className="sheet-list" aria-label="Applied XP purchases">
            {sheet.purchases.map((entry, index) => <li key={index}>{entry.label} · {entry.cost} XP</li>)}
          </ol>
        </section>
        <section aria-labelledby="sheet-advantages">
          <h3 id="sheet-advantages">Advantages &amp; Flaws</h3>
          <p>{sheet.advantageDots} Advantage dots · {sheet.flawDots} Flaw dots</p>
          <ul className="sheet-list" aria-label="Advantages">
            {sheet.advantages.map((option, index) => <li key={index}>{option.name} {option.dots} · {option.source}</li>)}
          </ul>
          <ul className="sheet-list" aria-label="Flaws">
            {sheet.flaws.map((option, index) => <li key={index}>{option.name} · {option.dots} Flaw {option.dots === 1 ? 'dot' : 'dots'}{option.source && ` · ${option.source}`}</li>)}
          </ul>
          {thinBlood && <>
            <h3>Thin-blood Merits &amp; Flaws</h3>
            <ul className="sheet-list">
              {thinBlood.merits.length > 0 && <li><strong>Merits</strong> · {thinBlood.merits.map(option => option.name).join(', ')}</li>}
              {thinBlood.flaws.length > 0 && <li><strong>Flaws</strong> · {thinBlood.flaws.map(option => option.id === 'clan-curse' && thinBlood.cursedClan ? `Clan Curse (${thinBlood.cursedClan})` : option.name).join(', ')}</li>}
            </ul>
          </>}
        </section>
      </div>

      {!mechanicalOnly && <section aria-labelledby="sheet-story">
        <h3 id="sheet-story">Beliefs &amp; Relationships</h3>
        <Details rows={[
          ['Ambition', identity.ambition], ['Desire', identity.desire], ['Sire', relationships.sire],
          ['Coterie', relationships.coterie], ['Chronicle Tenets', relationships.tenets],
        ]} />
        {relationships.convictions.some(pair => pair.conviction || pair.touchstone) && <ul className="sheet-list" aria-label="Convictions and Touchstones">
          {relationships.convictions.map((pair, index) => (pair.conviction || pair.touchstone) && <li key={index}>
            <strong>Conviction</strong> {pair.conviction || '—'} · <strong>Touchstone</strong> {pair.touchstone || '—'}
          </li>)}
        </ul>}
      </section>}
      {sheet.reviews.length > 0 && <section aria-labelledby="sheet-storyteller">
        <h3 id="sheet-storyteller">Storyteller Review</h3>
        <ul className="sheet-list">{sheet.reviews.map(note => <li key={note}>{note}</li>)}</ul>
      </section>}
    </article>
  )
}
