import { Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function FieldHelp({ id, label, text }: { id: string; label: string; text: string }) {
  const [visibility, setVisibility] = useState<'hidden' | 'hint' | 'pinned'>('hidden')
  const help = useRef<HTMLSpanElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const visible = visibility !== 'hidden'

  useEffect(() => {
    if (!visible) return

    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !help.current?.contains(event.target)) setVisibility('hidden')
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setVisibility('hidden')
    }

    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [visible])

  return (
    <span ref={help} className="inline-flex" onPointerEnter={event => {
      if (event.pointerType === 'mouse') setVisibility(current => current === 'pinned' ? current : 'hint')
    }} onPointerLeave={() => {
      if (!trigger.current?.matches(':focus-visible')) setVisibility(current => current === 'hint' ? 'hidden' : current)
    }}>
      <button ref={trigger} type="button" aria-label={`About ${label}`} aria-describedby={id}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
        onFocus={() => setVisibility('hint')} onBlur={() => setVisibility('hidden')}
        onClick={() => setVisibility(current => current === 'pinned' ? 'hidden' : 'pinned')}>
        <Info aria-hidden="true" className="size-4" />
      </button>
      <span id={id} role="tooltip" hidden={!visible}
        className="absolute left-0 top-full z-20 w-72 max-w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed font-normal text-foreground shadow-lg">
        {text}
      </span>
    </span>
  )
}
