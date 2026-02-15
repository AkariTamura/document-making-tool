import type { JsonExport } from '../types/models'

const normText = (s: string) => (s || '').replace(/\s+/g, ' ').trim()

export function buildJsonExportFromRenderedHtml (renderedHtml: string): JsonExport {
  const story: JsonExport['story'] = []

  if (!renderedHtml) return { story }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div id="__root">${renderedHtml}</div>`, 'text/html')
    const root = doc.getElementById('__root')
    if (!root) return { story }

    const push = (data: string, style: string) => {
      const d = normText(data)
      if (!d) return
      story.push({ data: d, style })
    }

    const children = Array.from(root.children) as HTMLElement[]
    children.forEach((el) => {
      const tag = (el.tagName || '').toLowerCase()

      if (tag === 'details' && el.classList.contains('accordion')) {
        const summary = normText(el.querySelector('summary')?.textContent || '')
        const body = normText(el.querySelector('.accordion-body')?.textContent || '')
        const data = summary && body ? `${summary}\n${body}` : (summary || body)
        push(data, 'accordion')
        return
      }

      if (tag === 'h1') return push(el.textContent || '', 'h1')
      if (tag === 'h2') return push(el.textContent || '', 'h2')
      if (tag === 'h3') return push(el.textContent || '', 'h3')
      if (tag === 'p') return push(el.textContent || '', 'p')

      push(el.textContent || '', tag || 'unknown')
    })

    return { story }
  } catch {
    return { story }
  }
}
