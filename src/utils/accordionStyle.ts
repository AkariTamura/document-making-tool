export type AccordionStyle = 'simple' | 'boxed'

export function normalizeAccordionStyle (raw: unknown): AccordionStyle | null {
  const v = String(raw ?? '').trim()
  if (v === 'simple' || v === 'boxed') return v
  return null
}

export function resolveAccordionStyle (raw: unknown, fallback: AccordionStyle = 'boxed'): AccordionStyle {
  return normalizeAccordionStyle(raw) ?? fallback
}
