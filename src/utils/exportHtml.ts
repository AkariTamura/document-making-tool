import type { Character } from '../types/models'
import { normalizeHexColor, darkenColor } from './color'
import { resolveAccordionStyle } from './accordionStyle'

type BuildExportHtmlOptions = {
  renderedHtml: string
  characters: Character[]
  title?: string
  accordionInitiallyOpen?: boolean
  documentStyle?: {
    themeAccent?: string
    docBg?: string
    // 旧キー(accordionStyle)互換を残しつつ、新キーを優先
    accordionDefaultStyle?: string
    accordionStyle?: string
    docFont?: string
    twoColumnWidthPercent?: number
    headingStyle?: string
    headingH1?: string
    headingH2?: string
    headingH3?: string

    headingFontH1?: string
    headingFontH2?: string
    headingFontH3?: string

    headingAccentH1?: string
    headingAccentH2?: string
    headingAccentH3?: string

    headingTextH1?: string
    headingTextH2?: string
    headingTextH3?: string

    headingBgH1?: string
    headingBgH2?: string
    headingBgH3?: string
  }
}

const getFontFamilyForKey = (font: string): string => {
  if (font === 'gothic') {
    return '"Yu Gothic","Meiryo","Hiragino Sans",system-ui,-apple-system,"Segoe UI",sans-serif'
  }
  if (font === 'mincho') {
    return '"Yu Mincho","Hiragino Mincho ProN","MS Mincho","Times New Roman",serif'
  }
  if (font === 'serif') {
    return 'Georgia,"Times New Roman",serif'
  }
  if (font === 'mono') {
    return 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
  }
  return 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
}

const resolveHeadingFontVar = (v: string | undefined): string => {
  const raw = String(v || '').trim()
  if (!raw || raw === 'inherit') return 'inherit'
  return getFontFamilyForKey(raw)
}

const resolveColor = (v: string | undefined, fallback: string): string => {
  const parsed = normalizeHexColor(String(v || '').trim())
  return parsed || fallback
}

function normalizeAccordionOpenState (html: string, open: boolean): string {
  if (!html) return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div id="__root">${html}</div>`, 'text/html')
    const root = doc.getElementById('__root')
    if (!root) return html

    const details = root.querySelectorAll('details.accordion')
    details.forEach((d) => {
      try {
        ;(d as HTMLDetailsElement).open = open
      } catch {}

      try {
        if (open) d.setAttribute('open', '')
        else d.removeAttribute('open')
      } catch {}
    })

    return root.innerHTML
  } catch {
    // fallback: best-effort only
    if (open) return html
    return html.replace(/<details(\s+[^>]*class=["'][^"']*\baccordion\b[^"']*["'][^>]*)\s+open(\s|>)/gi, '<details$1$2')
  }
}

export function buildExportHtmlDocument (opts: BuildExportHtmlOptions): string {
  const title = opts.title || 'エクスポートされたドキュメント'
  const accordionInitiallyOpen = !!opts.accordionInitiallyOpen

  const themeAccent = resolveColor(opts.documentStyle?.themeAccent, '#b0b0b0')
  const docBg = resolveColor(opts.documentStyle?.docBg, '#f9fafb')

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const v = normalizeHexColor(String(hex || '').trim())
    if (!v) return null
    const h = v.startsWith('#') ? v.slice(1) : v
    if (h.length !== 6) return null
    const r = Number.parseInt(h.slice(0, 2), 16)
    const g = Number.parseInt(h.slice(2, 4), 16)
    const b = Number.parseInt(h.slice(4, 6), 16)
    if (![r, g, b].every((n) => Number.isFinite(n))) return null
    return { r, g, b }
  }

  const rgb = hexToRgb(themeAccent) || { r: 176, g: 176, b: 176 }
  const luma = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  const themeContrast = luma > 0.62 ? '#111827' : '#ffffff'
  const contrastRgb = hexToRgb(themeContrast) || { r: 255, g: 255, b: 255 }

  const accordionStyle = resolveAccordionStyle(opts.documentStyle?.accordionDefaultStyle ?? opts.documentStyle?.accordionStyle, 'boxed')

  const twoColumnWidthPercent = Number(opts.documentStyle?.twoColumnWidthPercent)

  const docFont = String(opts.documentStyle?.docFont || 'system')
  const fallbackHeading = String(opts.documentStyle?.headingStyle || 'classic')
  const headingH1 = String(opts.documentStyle?.headingH1 || fallbackHeading)
  const headingH2 = String(opts.documentStyle?.headingH2 || fallbackHeading)
  const headingH3 = String(opts.documentStyle?.headingH3 || fallbackHeading)

  const styleVars: Record<string, string> = {
    '--theme-accent': themeAccent,
    '--doc-bg': docBg,
    '--two-col-left': Number.isFinite(twoColumnWidthPercent) && twoColumnWidthPercent > 0 ? `${Math.max(10, Math.min(90, twoColumnWidthPercent))}%` : '50%',
    '--h1-accent': resolveColor(opts.documentStyle?.headingAccentH1, '#2563eb'),
    '--h1-text': resolveColor(opts.documentStyle?.headingTextH1, '#111827'),
    '--h1-bg': resolveColor(opts.documentStyle?.headingBgH1, '#eef2ff'),
    '--h1-font': resolveHeadingFontVar(opts.documentStyle?.headingFontH1),

    '--h2-accent': resolveColor(opts.documentStyle?.headingAccentH2, '#2563eb'),
    '--h2-text': resolveColor(opts.documentStyle?.headingTextH2, '#111827'),
    '--h2-bg': resolveColor(opts.documentStyle?.headingBgH2, '#f3f4f6'),
    '--h2-font': resolveHeadingFontVar(opts.documentStyle?.headingFontH2),

    '--h3-accent': resolveColor(opts.documentStyle?.headingAccentH3, '#9ca3af'),
    '--h3-text': resolveColor(opts.documentStyle?.headingTextH3, '#374151'),
    '--h3-bg': resolveColor(opts.documentStyle?.headingBgH3, '#ffffff'),
    '--h3-font': resolveHeadingFontVar(opts.documentStyle?.headingFontH3)
  }

  const styleVarsAttr = Object.entries(styleVars)
    .map(([k, v]) => `${k}:${escapeHtml(String(v || ''))}`)
    .join(';')

  const exportedCharacters = (opts.characters || [])
    .map((c) => ({
      key: c?.key,
      name: c?.name || '',
      displayMode: c?.displayMode || 'plain',
      textColor: c?.textColor || '',
      backgroundColor: c?.backgroundColor || ''
    }))
    .filter((c) => !!c.key)

  const bodyHtmlForExport = normalizeAccordionOpenState(opts.renderedHtml || '', accordionInitiallyOpen)
  const dataJson = JSON.stringify({
    characters: exportedCharacters,
    documentStyle: {
      themeAccent,
      docBg,
      accordionStyle,
      docFont,
      twoColumnWidthPercent: Number.isFinite(twoColumnWidthPercent) ? twoColumnWidthPercent : undefined,
      headingH1,
      headingH2,
      headingH3,
      headingFontH1: String(opts.documentStyle?.headingFontH1 || ''),
      headingFontH2: String(opts.documentStyle?.headingFontH2 || ''),
      headingFontH3: String(opts.documentStyle?.headingFontH3 || ''),

      headingAccentH1: resolveColor(opts.documentStyle?.headingAccentH1, '#2563eb'),
      headingAccentH2: resolveColor(opts.documentStyle?.headingAccentH2, '#2563eb'),
      headingAccentH3: resolveColor(opts.documentStyle?.headingAccentH3, '#9ca3af'),

      headingTextH1: resolveColor(opts.documentStyle?.headingTextH1, '#111827'),
      headingTextH2: resolveColor(opts.documentStyle?.headingTextH2, '#111827'),
      headingTextH3: resolveColor(opts.documentStyle?.headingTextH3, '#374151'),

      headingBgH1: resolveColor(opts.documentStyle?.headingBgH1, '#eef2ff'),
      headingBgH2: resolveColor(opts.documentStyle?.headingBgH2, '#f3f4f6'),
      headingBgH3: resolveColor(opts.documentStyle?.headingBgH3, '#ffffff'),
      styleVars
    },
    sourceHtml: bodyHtmlForExport
  })

  // Prevent breaking out of script tag if the content includes "</script>"
  const safeDataJson = dataJson.replace(/</g, '\\u003c')

  const docBgForExport = docBg || '#ffffff'
  const appBgDarker = darkenColor(docBgForExport, 0.04)
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    html,body{height:100%;}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:${docBgForExport};color:#111827;}
    .export-app{min-height:100%;padding:16px;--sidebar-width:350px;--sidebar-collapsed:30px;--sidebar-offset:var(--sidebar-width);background:${docBgForExport};}
    .export-app.is-sidebar-closed{--sidebar-offset:var(--sidebar-collapsed);}

    .export-sidebar-shell{position:fixed;left:0;top:0;bottom:0;z-index:100;width:var(--sidebar-offset);transition:width 0.22s ease;background:${docBgForExport};}
    .export-app.is-sidebar-closed .export-sidebar-shell{background:var(--theme-accent,#2563eb);border-right:none;}
    /* サイドバー本体は幅を維持しつつ、左端マイナスへ飛ばして収納 */
    .export-sidebar-inner{position:absolute;left:0;top:0;bottom:0;width:var(--sidebar-width);max-width:84vw;background:${docBgForExport};border-right:1px solid #e5e7eb;box-shadow:0 12px 30px rgba(15,23,42,0.14);padding:0;box-sizing:border-box;overflow:auto;transform:translateX(0);transition:transform 0.22s ease;}
    .export-sidebar-content{min-height:100%;display:flex;flex-direction:column;gap:10px;padding:12px 44px 12px 14px;box-sizing:border-box;}
    .export-app.is-sidebar-closed .export-sidebar-inner{transform:translateX(calc(-1 * (var(--sidebar-width) + 16px)));}

    /* toggle button (open: × / closed: hamburger) */
    .export-sidebar-close{position:absolute;right:0;top:0;z-index:999;width:42px;height:42px;padding:0;border-right:none;border-radius:0;border:1px solid rgba(var(--theme-accent-rgb,37,99,235),0.9);background:var(--theme-accent,#2563eb);color:#ffffff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:20px;line-height:1;box-shadow:0 8px 18px rgba(15,23,42,0.18);}
    .export-sidebar-close:hover{filter:brightness(0.95);}

    /* closed: show as hamburger on collapsed strip */
    .export-app.is-sidebar-closed .export-sidebar-close{left:0;right:auto;top:0;width:var(--sidebar-collapsed);height:56px;border-radius:0;border:0;border-right:none;box-shadow:none;color:var(--theme-contrast,#ffffff);font-size:0;}
    .export-app.is-sidebar-closed .export-sidebar-close::before{content:"";width:16px;height:2px;display:block;background:currentColor;border-radius:2px;box-shadow:0 -5px 0 currentColor, 0 5px 0 currentColor;}
    .export-app.is-sidebar-closed .export-sidebar-close::after{content:none;}

    .export-main{min-width:0;background:${docBgForExport};border-radius:12px;margin-left:calc(var(--sidebar-collapsed) + 16px);transition:margin-left 0.22s ease;}
    .export-app:not(.is-sidebar-closed) .export-main{margin-left:calc(var(--sidebar-width) + 16px);}

    .export-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
    .export-tab{border:1px solid #e5e7eb;background:#f9fafb;color:#374151;border-radius:999px;padding:6px 10px;font-size:12px;cursor:pointer;}
    .export-tab.active{background:var(--theme-accent,#2563eb);border-color:var(--theme-accent,#2563eb);color:#fff;}

    .export-panel{display:none;flex-direction:column;gap:8px;}
    .export-panel.active{display:flex;}
    .export-h2{margin:0;font-size:14px;font-weight:600;color:#111827;}
    .export-desc{margin:0;font-size:11px;color:#6b7280;}

    .toc-list{display:flex;flex-direction:column;gap:6px;}
    .toc-item{border:none;background:transparent;padding:2px 0;border-radius:6px;text-align:left;cursor:pointer;color:#111827;font-size:12px;}
    .toc-item:hover{text-decoration:underline;text-underline-offset:3px;}
    .toc-item.lvl-1{font-size:14px;}
    .toc-item.lvl-2{font-size:12px;padding-left:12px;}
    .toc-item.lvl-3{font-size:12px;padding-left:24px;}

    .char-list{display:flex;flex-direction:column;gap:8px;}
    .char-row{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center;}
    .char-key{font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .char-input{border-radius:999px;border:1px solid #d1d5db;padding:6px 10px;font-size:12px;min-width:0;}
    .char-input:focus{outline:none;border-color:var(--theme-accent,#2563eb);box-shadow:0 0 0 1px rgba(37,99,235,0.25);}
      .export-doc{background:var(--doc-bg,#f9fafb);border-radius:8px;padding:18px 20px 24px;border:none;}
      .export-doc > *{position:relative;}
      .export-doc > *::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,0.04);opacity:0;pointer-events:none;border-radius:inherit;}
      .export-doc > *:hover::before{opacity:1;}
      .copy-popover{position:fixed;z-index:9999;padding:6px 12px;border-radius:999px;border:1px solid rgba(15,23,42,0.15);background:rgba(255,255,255,0.96);box-shadow:0 10px 24px rgba(15,23,42,0.16);font-size:12px;color:#111827;cursor:pointer;display:none;}
      .copy-popover:hover{filter:brightness(0.96);}
    .export-doc .two-col-block{position:relative;display:flex;gap:var(--two-col-gap,16px);align-items:stretch;margin:10px 0 12px;}
    .export-doc .two-col-block>.two-col-col{min-width:0;}
    .export-doc .two-col-block>.two-col-col.col-left{flex:0 0 var(--two-col-left,50%);}
    .export-doc .two-col-block>.two-col-col.col-right{flex:1 1 0;}
    .export-doc .two-col-block[data-divider="1"]::after{content:"";position:absolute;top:0;bottom:0;width:1px;background:var(--two-col-divider,#e5e7eb);left:calc(var(--two-col-left,50%) + (var(--two-col-gap,16px) / 2));pointer-events:none;}
    @media (max-width:720px){.export-doc .two-col-block{flex-direction:column;}.export-doc .two-col-block>.two-col-col.col-left{flex:1 1 auto;}}
    .char-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#6b7280;}
    .char-token{display:inline-flex;align-items:center;gap:4px;padding:0 6px;margin:0 1px;border-radius:999px;background:rgba(var(--theme-accent-rgb,176,176,176),0.12);border:1px solid rgba(var(--theme-accent-rgb,176,176,176),0.35);color:var(--theme-accent,#b0b0b0);font-size:0.95em;line-height:1.4;white-space:nowrap;user-select:none;-webkit-user-select:none;}
    .char-token[data-wrapped="true"]:before{content:"{{";color:var(--theme-accent,#b0b0b0);}
    .char-token[data-wrapped="true"]:after{content:"}}";color:var(--theme-accent,#b0b0b0);}

    .export-doc[data-doc-font="system"]{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
    .export-doc[data-doc-font="gothic"]{font-family:"Yu Gothic","Meiryo","Hiragino Sans",system-ui,-apple-system,"Segoe UI",sans-serif;}
    .export-doc[data-doc-font="mincho"]{font-family:"Yu Mincho","Hiragino Mincho ProN","MS Mincho","Times New Roman",serif;}
    .export-doc[data-doc-font="serif"]{font-family:Georgia,"Times New Roman",serif;}
    .export-doc[data-doc-font="mono"]{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}

    h1,h2,h3{font-family:inherit;margin:0 0 8px;color:#111827;}
    /* classic (default) */
    .export-doc h1{font-size:24px;font-family:var(--h1-font,inherit);color:var(--h1-text,#111827);border-bottom:2px solid var(--h1-accent,#2563eb);padding-bottom:6px;margin-bottom:16px;clear:both;}
    .export-doc h2{font-size:18px;font-family:var(--h2-font,inherit);color:var(--h2-text,#111827);border-left:4px solid var(--h2-accent,#2563eb);padding-left:8px;margin-top:18px;margin-bottom:10px;clear:both;}
    .export-doc h3{font-size:16px;font-family:var(--h3-font,inherit);color:var(--h3-text,#374151);margin-top:14px;margin-bottom:6px;clear:both;}

    /* simple (H1/H2/H3 individually) */
    .export-doc[data-heading-h1="simple"] h1{border-bottom:none;padding-bottom:0;margin-bottom:14px;}
    .export-doc[data-heading-h2="simple"] h2{border-left:none;padding-left:0;margin-top:16px;margin-bottom:8px;}
    .export-doc[data-heading-h3="simple"] h3{color:var(--h3-text,#111827);font-weight:600;margin-top:12px;}

    /* marker (H1/H2/H3 individually) */
    .export-doc[data-heading-h1="marker"] h1{border-bottom:none;padding:8px 10px;background:var(--h1-bg,#eef2ff);border-bottom:2px solid var(--h1-accent,#2563eb);border-radius:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="marker"] h2{border-left:6px solid var(--h2-accent,#2563eb);padding:6px 10px;background:var(--h2-bg,#f3f4f6);border-radius:8px;}
    .export-doc[data-heading-h3="marker"] h3{border-left:4px solid var(--h3-accent,#9ca3af);padding:4px 8px 4px 10px;background:var(--h3-bg,transparent);border-radius:6px;color:var(--h3-text,#111827);}

    /* backward compatibility */
    .export-doc[data-heading-style="simple"] h1{border-bottom:none;padding-bottom:0;margin-bottom:14px;}
    .export-doc[data-heading-style="simple"] h2{border-left:none;padding-left:0;margin-top:16px;margin-bottom:8px;}
    .export-doc[data-heading-style="simple"] h3{color:var(--h3-text,#111827);font-weight:600;margin-top:12px;}
    .export-doc[data-heading-style="marker"] h1{border-bottom:none;padding:8px 10px;background:var(--h1-bg,#eef2ff);border-bottom:2px solid var(--h1-accent,#2563eb);border-radius:8px;margin-bottom:16px;}
    .export-doc[data-heading-style="marker"] h2{border-left:6px solid var(--h2-accent,#2563eb);padding:6px 10px;background:var(--h2-bg,#f3f4f6);border-radius:8px;}
    .export-doc[data-heading-style="marker"] h3{border-left:4px solid var(--h3-accent,#9ca3af);padding:4px 8px 4px 10px;background:var(--h3-bg,transparent);border-radius:6px;color:var(--h3-text,#111827);}

    /* heading styles (full set) */
    .export-doc[data-heading-h1="underline-solid"] h1{border-bottom:2px solid var(--h1-accent,#2563eb);padding-bottom:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="underline-solid"] h2{border-bottom:2px solid var(--h2-accent,#2563eb);padding-bottom:6px;margin-bottom:12px;}
    .export-doc[data-heading-h3="underline-solid"] h3{border-bottom:1px solid var(--h3-accent,#9ca3af);padding-bottom:4px;margin-bottom:10px;}

    .export-doc[data-heading-h1="underline-dotted"] h1{border-bottom:3px dotted var(--h1-accent,#2563eb);padding-bottom:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="underline-dotted"] h2{border-bottom:2px dotted var(--h2-accent,#2563eb);padding-bottom:6px;margin-bottom:12px;}
    .export-doc[data-heading-h3="underline-dotted"] h3{border-bottom:2px dotted var(--h3-accent,#9ca3af);padding-bottom:4px;margin-bottom:10px;}

    .export-doc[data-heading-h1="underline-double"] h1{border-bottom:4px double var(--h1-accent,#2563eb);padding-bottom:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="underline-double"] h2{border-bottom:3px double var(--h2-accent,#2563eb);padding-bottom:6px;margin-bottom:12px;}
    .export-doc[data-heading-h3="underline-double"] h3{border-bottom:3px double var(--h3-accent,#9ca3af);padding-bottom:4px;margin-bottom:10px;}

    .export-doc[data-heading-h1="underline-dashed"] h1{border-bottom:3px dashed var(--h1-accent,#2563eb);padding-bottom:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="underline-dashed"] h2{border-bottom:2px dashed var(--h2-accent,#2563eb);padding-bottom:6px;margin-bottom:12px;}
    .export-doc[data-heading-h3="underline-dashed"] h3{border-bottom:2px dashed var(--h3-accent,#9ca3af);padding-bottom:4px;margin-bottom:10px;}

    .export-doc[data-heading-h1="box-solid"] h1{border:2px solid var(--h1-accent,#2563eb);padding:10px 12px;border-radius:8px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h2="box-solid"] h2{border:2px solid var(--h2-accent,#2563eb);padding:8px 10px;border-radius:8px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h3="box-solid"] h3{border:1px solid var(--h3-accent,#9ca3af);padding:6px 8px;border-radius:6px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}

    .export-doc[data-heading-h1="box-dotted"] h1{border:3px dotted var(--h1-accent,#2563eb);padding:10px 12px;border-radius:8px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h2="box-dotted"] h2{border:2px dotted var(--h2-accent,#2563eb);padding:8px 10px;border-radius:8px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h3="box-dotted"] h3{border:2px dotted var(--h3-accent,#9ca3af);padding:6px 8px;border-radius:6px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}

    .export-doc[data-heading-h1="box-dashed"] h1{border:3px dashed var(--h1-accent,#2563eb);padding:10px 12px;border-radius:8px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h2="box-dashed"] h2{border:2px dashed var(--h2-accent,#2563eb);padding:8px 10px;border-radius:8px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h3="box-dashed"] h3{border:2px dashed var(--h3-accent,#9ca3af);padding:6px 8px;border-radius:6px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}

    .export-doc[data-heading-h1="box-double"] h1{border:4px double var(--h1-accent,#2563eb);padding:10px 12px;border-radius:8px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h2="box-double"] h2{border:3px double var(--h2-accent,#2563eb);padding:8px 10px;border-radius:8px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h3="box-double"] h3{border:3px double var(--h3-accent,#9ca3af);padding:6px 8px;border-radius:6px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}

    .export-doc[data-heading-h1="topbottom-solid"] h1{border-top:2px solid var(--h1-accent,#2563eb);border-bottom:2px solid var(--h1-accent,#2563eb);padding:10px 0;margin-bottom:16px;}
    .export-doc[data-heading-h2="topbottom-solid"] h2{border-top:2px solid var(--h2-accent,#2563eb);border-bottom:2px solid var(--h2-accent,#2563eb);padding:8px 0;margin-bottom:12px;}
    .export-doc[data-heading-h3="topbottom-solid"] h3{border-top:1px solid var(--h3-accent,#9ca3af);border-bottom:1px solid var(--h3-accent,#9ca3af);padding:6px 0;margin-bottom:10px;}

    .export-doc[data-heading-h1="topbottom-dotted"] h1{border-top:3px dotted var(--h1-accent,#2563eb);border-bottom:3px dotted var(--h1-accent,#2563eb);padding:10px 0;margin-bottom:16px;}
    .export-doc[data-heading-h2="topbottom-dotted"] h2{border-top:2px dotted var(--h2-accent,#2563eb);border-bottom:2px dotted var(--h2-accent,#2563eb);padding:8px 0;margin-bottom:12px;}
    .export-doc[data-heading-h3="topbottom-dotted"] h3{border-top:2px dotted var(--h3-accent,#9ca3af);border-bottom:2px dotted var(--h3-accent,#9ca3af);padding:6px 0;margin-bottom:10px;}

    .export-doc[data-heading-h1="topbottom-dashed"] h1{border-top:3px dashed var(--h1-accent,#2563eb);border-bottom:3px dashed var(--h1-accent,#2563eb);padding:10px 0;margin-bottom:16px;}
    .export-doc[data-heading-h2="topbottom-dashed"] h2{border-top:2px dashed var(--h2-accent,#2563eb);border-bottom:2px dashed var(--h2-accent,#2563eb);padding:8px 0;margin-bottom:12px;}
    .export-doc[data-heading-h3="topbottom-dashed"] h3{border-top:2px dashed var(--h3-accent,#9ca3af);border-bottom:2px dashed var(--h3-accent,#9ca3af);padding:6px 0;margin-bottom:10px;}

    .export-doc[data-heading-h1="topbottom-double"] h1{border-top:4px double var(--h1-accent,#2563eb);border-bottom:4px double var(--h1-accent,#2563eb);padding:10px 0;margin-bottom:16px;}
    .export-doc[data-heading-h2="topbottom-double"] h2{border-top:3px double var(--h2-accent,#2563eb);border-bottom:3px double var(--h2-accent,#2563eb);padding:8px 0;margin-bottom:12px;}
    .export-doc[data-heading-h3="topbottom-double"] h3{border-top:3px double var(--h3-accent,#9ca3af);border-bottom:3px double var(--h3-accent,#9ca3af);padding:6px 0;margin-bottom:10px;}

    .export-doc[data-heading-h1="underline-stripe"] h1{position:relative;padding-bottom:14px;margin-bottom:16px;}
    .export-doc[data-heading-h1="underline-stripe"] h1::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:8px;background:repeating-linear-gradient(45deg,var(--h1-accent,#2563eb),var(--h1-accent,#2563eb) 4px,transparent 4px,transparent 8px);}
    .export-doc[data-heading-h2="underline-stripe"] h2{position:relative;padding-bottom:12px;margin-bottom:12px;}
    .export-doc[data-heading-h2="underline-stripe"] h2::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:6px;background:repeating-linear-gradient(45deg,var(--h2-accent,#2563eb),var(--h2-accent,#2563eb) 3px,transparent 3px,transparent 6px);}
    .export-doc[data-heading-h3="underline-stripe"] h3{position:relative;padding-bottom:10px;margin-bottom:10px;}
    .export-doc[data-heading-h3="underline-stripe"] h3::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:4px;background:repeating-linear-gradient(45deg,var(--h3-accent,#9ca3af),var(--h3-accent,#9ca3af) 2px,transparent 2px,transparent 4px);}

    .export-doc[data-heading-h1="box-stripe"] h1{position:relative;border:2px solid var(--h1-accent,#2563eb);border-radius:8px;padding:10px 12px 20px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h1="box-stripe"] h1::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:10px;border-radius:0 0 6px 6px;background:repeating-linear-gradient(45deg,var(--h1-accent,#2563eb),var(--h1-accent,#2563eb) 4px,transparent 4px,transparent 8px);}
    .export-doc[data-heading-h2="box-stripe"] h2{position:relative;border:2px solid var(--h2-accent,#2563eb);border-radius:8px;padding:8px 10px 18px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h2="box-stripe"] h2::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:8px;border-radius:0 0 6px 6px;background:repeating-linear-gradient(45deg,var(--h2-accent,#2563eb),var(--h2-accent,#2563eb) 3px,transparent 3px,transparent 6px);}
    .export-doc[data-heading-h3="box-stripe"] h3{position:relative;border:1px solid var(--h3-accent,#9ca3af);border-radius:6px;padding:6px 8px 14px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}
    .export-doc[data-heading-h3="box-stripe"] h3::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:6px;border-radius:0 0 5px 5px;background:repeating-linear-gradient(45deg,var(--h3-accent,#9ca3af),var(--h3-accent,#9ca3af) 2px,transparent 2px,transparent 4px);}

    .export-doc[data-heading-h1="leftbar"] h1{border-left:4px solid var(--h1-accent,#2563eb);padding-left:12px;margin-bottom:16px;}
    .export-doc[data-heading-h2="leftbar"] h2{border-left:3px solid var(--h2-accent,#2563eb);padding-left:10px;margin-bottom:12px;}
    .export-doc[data-heading-h3="leftbar"] h3{border-left:3px solid var(--h3-accent,#9ca3af);padding-left:8px;margin-bottom:10px;}

    .export-doc[data-heading-h1="bracket"] h1{position:relative;padding-bottom:12px;margin-bottom:16px;}
    .export-doc[data-heading-h1="bracket"] h1::before{content:"";position:absolute;left:0;bottom:0;width:30px;height:10px;border-left:3px solid var(--h1-accent,#2563eb);border-bottom:3px solid var(--h1-accent,#2563eb);}
    .export-doc[data-heading-h1="bracket"] h1::after{content:"";position:absolute;right:0;bottom:0;width:30px;height:10px;border-right:3px solid var(--h1-accent,#2563eb);border-bottom:3px solid var(--h1-accent,#2563eb);}
    .export-doc[data-heading-h2="bracket"] h2{position:relative;padding-bottom:10px;margin-bottom:12px;}
    .export-doc[data-heading-h2="bracket"] h2::before{content:"";position:absolute;left:0;bottom:0;width:24px;height:8px;border-left:2px solid var(--h2-accent,#2563eb);border-bottom:2px solid var(--h2-accent,#2563eb);}
    .export-doc[data-heading-h2="bracket"] h2::after{content:"";position:absolute;right:0;bottom:0;width:24px;height:8px;border-right:2px solid var(--h2-accent,#2563eb);border-bottom:2px solid var(--h2-accent,#2563eb);}
    .export-doc[data-heading-h3="bracket"] h3{position:relative;padding-bottom:8px;margin-bottom:10px;}
    .export-doc[data-heading-h3="bracket"] h3::before{content:"";position:absolute;left:0;bottom:0;width:20px;height:6px;border-left:2px solid var(--h3-accent,#9ca3af);border-bottom:2px solid var(--h3-accent,#9ca3af);}
    .export-doc[data-heading-h3="bracket"] h3::after{content:"";position:absolute;right:0;bottom:0;width:20px;height:6px;border-right:2px solid var(--h3-accent,#9ca3af);border-bottom:2px solid var(--h3-accent,#9ca3af);}

    .export-doc[data-heading-h1="line-accent"] h1{position:relative;padding-bottom:12px;margin-bottom:16px;}
    .export-doc[data-heading-h1="line-accent"] h1::before{content:"";position:absolute;left:0;bottom:0;width:60px;height:3px;background:var(--h1-accent,#2563eb);}
    .export-doc[data-heading-h1="line-accent"] h1::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:#e5e7eb;}
    .export-doc[data-heading-h2="line-accent"] h2{position:relative;padding-bottom:10px;margin-bottom:12px;}
    .export-doc[data-heading-h2="line-accent"] h2::before{content:"";position:absolute;left:0;bottom:0;width:50px;height:2px;background:var(--h2-accent,#2563eb);z-index:1;}
    .export-doc[data-heading-h2="line-accent"] h2::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:#e5e7eb;}
    .export-doc[data-heading-h3="line-accent"] h3{position:relative;padding-bottom:8px;margin-bottom:10px;}
    .export-doc[data-heading-h3="line-accent"] h3::before{content:"";position:absolute;left:0;bottom:0;width:40px;height:2px;background:var(--h3-accent,#9ca3af);z-index:1;}
    .export-doc[data-heading-h3="line-accent"] h3::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:#e5e7eb;}

    /* Text style spans (editorのdata-text-styleをそのまま反映するための最小スタイル) */
    span[data-text-style]{display:inline-block}
    span[data-text-style^="underline"]{padding-bottom:0.06em}
    span[data-text-style^="underline"][data-text-style$="-solid"]{border-bottom:1px solid currentColor}
    span[data-text-style^="underline"][data-text-style$="-dotted"]{border-bottom:2px dotted currentColor}
    span[data-text-style^="underline"][data-text-style$="-dashed"]{border-bottom:2px dashed currentColor}
    span[data-text-style^="underline"][data-text-style$="-double"]{border-bottom:3px double currentColor}

    span[data-text-style^="box"]{padding:0 6px;border-radius:6px}
    span[data-text-style$="-solid"]{border:1px solid currentColor}
    span[data-text-style$="-dotted"]{border:2px dotted currentColor}
    span[data-text-style$="-dashed"]{border:2px dashed currentColor}
    span[data-text-style$="-double"]{border:3px double currentColor}

    span[data-text-style="leftbar"]{border-left:4px solid currentColor;padding-left:8px}
    span[data-text-style="line-accent"]{position:relative}
    span[data-text-style="line-accent"]::before{content:"";position:absolute;left:0;bottom:0;width:40px;height:2px;background:currentColor}
    span[data-text-style="side-lines"]{position:relative}
    span[data-text-style="side-lines"]::before,span[data-text-style="side-lines"]::after{content:"";position:absolute;left:0;right:0;height:1px;background:currentColor;top:50%;transform:translateY(-50%)}

    .export-doc[data-heading-h1="side-lines"] h1{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
    .export-doc[data-heading-h1="side-lines"] h1::before,.export-doc[data-heading-h1="side-lines"] h1::after{content:"";flex:1;height:2px;background:var(--h1-accent,#2563eb);}
    .export-doc[data-heading-h2="side-lines"] h2{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
    .export-doc[data-heading-h2="side-lines"] h2::before,.export-doc[data-heading-h2="side-lines"] h2::after{content:"";flex:1;height:2px;background:var(--h2-accent,#2563eb);}
    .export-doc[data-heading-h3="side-lines"] h3{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
    .export-doc[data-heading-h3="side-lines"] h3::before,.export-doc[data-heading-h3="side-lines"] h3::after{content:"";flex:1;height:1px;background:var(--h3-accent,#9ca3af);}

    .export-doc[data-heading-h1="simple"] h1{margin-bottom:16px;}
    .export-doc[data-heading-h2="simple"] h2{margin-bottom:12px;}
    .export-doc[data-heading-h3="simple"] h3{margin-bottom:10px;}

    .export-doc[data-heading-h1="corner-triangle"] h1{position:relative;padding:10px 12px;background:var(--h1-bg,#f3f4f6);margin-bottom:16px;}
    .export-doc[data-heading-h1="corner-triangle"] h1::before{content:"";position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:20px 20px 0 0;border-color:var(--h1-accent,#2563eb) transparent transparent transparent;}
    .export-doc[data-heading-h2="corner-triangle"] h2{position:relative;padding:8px 10px;background:var(--h2-bg,#f9fafb);margin-bottom:12px;}
    .export-doc[data-heading-h2="corner-triangle"] h2::before{content:"";position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:16px 16px 0 0;border-color:var(--h2-accent,#2563eb) transparent transparent transparent;}
    .export-doc[data-heading-h3="corner-triangle"] h3{position:relative;padding:6px 8px;background:var(--h3-bg,#ffffff);margin-bottom:10px;}
    .export-doc[data-heading-h3="corner-triangle"] h3::before{content:"";position:absolute;top:0;left:0;width:0;height:0;border-style:solid;border-width:12px 12px 0 0;border-color:var(--h3-accent,#9ca3af) transparent transparent transparent;}

    .export-doc[data-heading-h1="bg-box"] h1{padding:12px 16px;background:var(--h1-bg,#f3f4f6);border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;}
    .export-doc[data-heading-h2="bg-box"] h2{padding:10px 14px;background:var(--h2-bg,#f9fafb);border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;}
    .export-doc[data-heading-h3="bg-box"] h3{padding:8px 12px;background:var(--h3-bg,#ffffff);border:1px solid #e5e7eb;border-radius:6px;margin-bottom:10px;}
    p{margin:0 0 10px;font-size:14px;color:#374151;}

    /* underline/strike */
    .export-doc u{text-decoration:underline;}
    .export-doc s,.export-doc strike,.export-doc del{text-decoration:line-through;}

    /* images */
    .export-doc .image-block{display:inline-block;max-width:100%;margin:10px 0;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.12);background:#ffffff;}
    .export-doc .image-block[data-image-layout="left"]{display:block;margin:10px auto 10px 0;}
    .export-doc .image-block[data-image-layout="center"]{display:block;margin:10px auto;}
    .export-doc .image-block[data-image-layout="right"]{display:block;margin:10px 0 10px auto;}
    .export-doc .image-block[data-image-layout="float-left"]{float:left;margin:6px 12px 8px 0;max-width:60%;}
    .export-doc .image-block[data-image-layout="float-right"]{float:right;margin:6px 0 8px 12px;max-width:60%;}
    .export-doc details.accordion{clear:both;}
    .export-doc::after{content:"";display:block;clear:both;}
    .export-doc img.doc-image{width:100%;height:auto;display:block;}

    .export-doc details.accordion{border-radius:6px;border:1px solid #d1d5db;margin:8px 0 10px;background:#ffffff;}
    .export-doc details.accordion summary{list-style:none;cursor:pointer;padding:10px 12px;font-size:20px;font-weight:600;display:flex;align-items:center;justify-content:space-between;color:#111827;}
    .export-doc details.accordion summary::-webkit-details-marker{display:none;}
    .export-doc details.accordion summary::after{content:"▾";font-size:20px;color:#6b7280;transition:transform 0.15s ease;}
    .export-doc details.accordion[open] summary::after{transform:rotate(180deg);}
    .export-doc details.accordion .accordion-body{border-top:1px solid #e5e7eb;padding:10px 11px 11px;font-size:16px;color:#4b5563;}

    .export-doc[data-accordion-style="simple"] details.accordion,
    .export-doc details.accordion[data-accordion-style="simple"]{border:none;border-radius:0;background:transparent;margin:6px 0 8px;}
    .export-doc[data-accordion-style="simple"] details.accordion summary,
    .export-doc details.accordion[data-accordion-style="simple"] summary{padding:0;font-weight:600;justify-content:flex-start;margin-left:1.5em;position:relative;}
    .export-doc[data-accordion-style="simple"] details.accordion summary::after,
    .export-doc details.accordion[data-accordion-style="simple"] summary::after{content:"";}
    .export-doc[data-accordion-style="simple"] details.accordion summary::before,
    .export-doc details.accordion[data-accordion-style="simple"] summary::before{content:"▸";position:absolute;left:-1.2em;font-size:14px;color:#6b7280;transition:transform 0.15s ease;}
    .export-doc[data-accordion-style="simple"] details.accordion[open] summary::before,
    .export-doc details.accordion[data-accordion-style="simple"][open] summary::before{transform:rotate(90deg);}
    .export-doc[data-accordion-style="simple"] details.accordion .accordion-body,
    .export-doc details.accordion[data-accordion-style="simple"] .accordion-body{border-top:none;padding:0;margin:6px 0 8px 1.5em;font-size:16px;color:#4b5563;}
  </style>
</head>
<body>
  <div id="exportApp" class="export-app" style="--theme-accent:${escapeHtml(themeAccent)};--theme-accent-rgb:${rgb.r},${rgb.g},${rgb.b};--theme-contrast:${escapeHtml(themeContrast)};--theme-contrast-rgb:${contrastRgb.r},${contrastRgb.g},${contrastRgb.b};--doc-bg:${escapeHtml(docBg)};">
    <aside class="export-sidebar-shell" aria-label="サイドバー">
      <button type="button" id="sidebarClose" class="export-sidebar-close" aria-label="サイドバーを閉じる">×</button>
      <div class="export-sidebar-inner">
        <div class="export-sidebar-content">

        <div class="export-tabs">
        <button type="button" class="export-tab active" data-tab="toc">目次</button>
        <button type="button" class="export-tab" data-tab="characters">キャラクター</button>
      </div>

      <div id="tocPanel" class="export-panel active">
        <h2 class="export-h2">目次</h2>
        <p class="export-desc">見出し（H1/H2/H3）をクリックして移動します。</p>
        <div id="tocList" class="toc-list"></div>
      </div>

      <div id="charPanel" class="export-panel">
        <h2 class="export-h2">キャラクター</h2>
        <p class="export-desc">名前の変換（表示名）と {{ }} 表示切替ができます。</p>
        <div id="charList" class="char-list"></div>
      </div>
        </div>
      </div>
    </aside>

    <main class="export-main">
      <div id="docRoot" class="export-doc" data-doc-font="${escapeHtml(docFont)}" data-accordion-style="${escapeHtml(accordionStyle)}" data-heading-h1="${escapeHtml(headingH1)}" data-heading-h2="${escapeHtml(headingH2)}" data-heading-h3="${escapeHtml(headingH3)}" style="${styleVarsAttr}">${bodyHtmlForExport}</div>
    </main>
  </div>

  <script type="application/json" id="htmlmaker-export-data">${safeDataJson}</script>
  <script>
    try { window.__HTMLMAKER_EXPORT__ = JSON.parse(document.getElementById('htmlmaker-export-data')?.textContent || '{}') } catch { window.__HTMLMAKER_EXPORT__ = {}; }
  </script>

  <script>
  (function(){
    var data = window.__HTMLMAKER_EXPORT__ || {};
    var characters = Array.isArray(data.characters) ? data.characters.slice() : [];
    var docRoot = document.getElementById('docRoot');
    var appRoot = document.getElementById('exportApp');
    var sidebarClose = document.getElementById('sidebarClose');
        try{
          var st=data.documentStyle||{};
          if(docRoot&&st){
            if(st.docFont) docRoot.setAttribute('data-doc-font', String(st.docFont));
            var acc = (st.accordionDefaultStyle || st.accordionStyle);
            if(acc) docRoot.setAttribute('data-accordion-style', String(acc));
            if(st.headingH1) docRoot.setAttribute('data-heading-h1', String(st.headingH1));
            if(st.headingH2) docRoot.setAttribute('data-heading-h2', String(st.headingH2));
            if(st.headingH3) docRoot.setAttribute('data-heading-h3', String(st.headingH3));
            if(st.styleVars){
              try{
                for(var k in st.styleVars){
                  if(!Object.prototype.hasOwnProperty.call(st.styleVars,k)) continue;
                  docRoot.style.setProperty(String(k), String(st.styleVars[k]||''));
                }
              }catch(e){}
            }
          }
        }catch(e){}
    var tocList = document.getElementById('tocList');
    var charList = document.getElementById('charList');

    function normText(s){return (s||'').replace(/\\s+/g,' ').trim();}
    function normKey(k){return (k||'').replace(/\\s+/g,' ').trim();}
    function getChar(key){var kk=normKey(key);for(var i=0;i<characters.length;i++){if(characters[i]&&normKey(characters[i].key)===kk){return characters[i];}}return null;}
    function isWrapped(key){var c=getChar(key);return !!(c&&c.displayMode==='wrapped');}
    function getName(key){var c=getChar(key);return (c&&c.name)?c.name:key;}
    function getTextColor(key){var c=getChar(key);return (c&&c.textColor)?c.textColor:'';}
    function getBackgroundColor(key){var c=getChar(key);return (c&&c.backgroundColor)?c.backgroundColor:'';}

    function renderTokens(root){
      if(!root) return;
      var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var nodes=[];
      while(walker.nextNode()){nodes.push(walker.currentNode);}
      for(var n=0;n<nodes.length;n++){
        var node=nodes[n];
        if(!node||!node.parentNode) continue;
        var text=node.nodeValue||'';
        if(text.indexOf('{{')===-1) continue;
        var re=/{{\\s*([^}]+?)\\s*}}/g;
        if(!re.test(text)) continue;
        re.lastIndex=0;
        var frag=document.createDocumentFragment();
        var last=0;
        var m;
        while((m=re.exec(text))!==null){
          var key=normKey(m[1]);
          var before=text.slice(last,m.index);
          if(before) frag.appendChild(document.createTextNode(before));
          var span=document.createElement('span');
          span.className='char-token';
          span.dataset.charKey=key;
          var name=getName(key);
          span.dataset.wrapped=isWrapped(key)?'true':'false';
          span.textContent=isWrapped(key)?('{{'+name+'}}'):name;
          var fg=getTextColor(key);
          var bg=getBackgroundColor(key);
          if(fg) span.style.color=fg;
          if(bg) span.style.backgroundColor=bg;
          frag.appendChild(span);
          last=re.lastIndex;
        }
        var after=text.slice(last);
        if(after) frag.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(frag,node);
      }
    }

    function updateTokenLabels(root){
      if(!root) return;
      var spans=root.querySelectorAll('span.char-token[data-char-key]');
      for(var i=0;i<spans.length;i++){
        var s=spans[i];
        var key=normKey(s.dataset.charKey);
        if(!key) continue;
        var name=getName(key);
        s.dataset.wrapped=isWrapped(key)?'true':'false';
        s.textContent=isWrapped(key)?('{{'+name+'}}'):name;
        var fg=getTextColor(key);
        var bg=getBackgroundColor(key);
        if(fg) s.style.color=fg; else s.style.color='';
        if(bg) s.style.backgroundColor=bg; else s.style.backgroundColor='';
      }
    }

    function openDetailsParents(el){
      var p=el?el.parentElement:null;
      while(p){
        if(p.tagName==='DETAILS'){try{p.open=true;}catch(e){}}
        p=p.parentElement;
      }
    }

    function getTopLevelBlock(target, root){
      var el=target;
      while(el && el.parentElement && el.parentElement!==root){
        el=el.parentElement;
      }
      if(el && el.parentElement===root) return el;
      return null;
    }

    function getBlockText(el){
      if(!el) return '';
      var raw=el.innerText;
      if(typeof raw==='string') return raw;
      return el.textContent||'';
    }

    function copyText(text){
      var value=String(text||'').replace(/\\r\\n/g,'\\n').replace(/\\r/g,'\\n').replace(/\s+$/,'');
      if(!value) return;
      try{
        if(navigator && navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(value);
          return;
        }
      }catch(e){}
      try{
        var ta=document.createElement('textarea');
        ta.value=value;
        ta.style.position='fixed';
        ta.style.top='-9999px';
        ta.style.left='-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }catch(e){}
    }

    var copyPopover=null;
    var copyTarget=null;
    function ensureCopyPopover(){
      if(copyPopover) return copyPopover;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='copy-popover';
      btn.textContent='コピー';
      btn.addEventListener('click', function(){
        if(copyTarget) copyText(getBlockText(copyTarget));
        hideCopyPopover();
      });
      document.body.appendChild(btn);
      copyPopover=btn;
      return btn;
    }

    function showCopyPopover(x,y,target){
      var btn=ensureCopyPopover();
      copyTarget=target||null;
      btn.style.left=x+'px';
      btn.style.top=y+'px';
      btn.style.display='inline-flex';
    }

    function hideCopyPopover(){
      if(copyPopover) copyPopover.style.display='none';
      copyTarget=null;
    }

    function setupCopyPopover(){
      if(!docRoot) return;
      docRoot.addEventListener('contextmenu', function(ev){
        ev.preventDefault();
        var t=ev.target;
        if(!t || t.nodeType!==1) return;
        var block=getTopLevelBlock(t, docRoot);
        if(!block) return;
        var text=getBlockText(block);
        if(!String(text||'').trim()) return;
        showCopyPopover(ev.clientX+8, ev.clientY+8, block);
      });
      document.addEventListener('mousedown', function(ev){
        if(!copyPopover) return;
        var t=ev.target;
        if(t && copyPopover.contains(t)) return;
        hideCopyPopover();
      });
    }

    function buildToc(){
      if(!tocList||!docRoot) return;
      tocList.innerHTML='';
      var headings=docRoot.querySelectorAll('h1,h2,h3');
      if(!headings.length){
        var p=document.createElement('p');
        p.className='export-desc';
        p.textContent='見出しがありません。';
        tocList.appendChild(p);
        return;
      }
      for(var i=0;i<headings.length;i++){
        var h=headings[i];
        var lvl=h.tagName==='H1'?1:h.tagName==='H2'?2:3;
        var text=normText(h.textContent)||'（無題）';
        var btn=document.createElement('button');
        btn.type='button';
        btn.className='toc-item lvl-'+lvl;
        btn.textContent=text;
        (function(target){
          btn.addEventListener('click',function(){
            openDetailsParents(target);
            target.scrollIntoView({behavior:'smooth',block:'start'});
          });
        })(h);
        tocList.appendChild(btn);
      }
    }

    function buildCharacters(){
      if(!charList) return;
      charList.innerHTML='';
      if(!characters.length){
        var p=document.createElement('p');
        p.className='export-desc';
        p.textContent='キャラクターがありません。';
        charList.appendChild(p);
        return;
      }
      for(var i=0;i<characters.length;i++){
        var c=characters[i];
        if(!c||!c.key) continue;
        var row=document.createElement('div');
        row.className='char-row';

        var keyEl=document.createElement('div');
        keyEl.className='char-key';
        keyEl.textContent='{{'+c.key+'}}';

        var input=document.createElement('input');
        input.className='char-input';
        input.type='text';
        input.value=c.name||'';
        input.dataset.key=c.key;
        input.addEventListener('input',function(ev){
          var t=ev.target;
          var k=t&&t.dataset?t.dataset.key:null;
          var cc=getChar(k);
          if(!cc) return;
          cc.name=t.value||'';
          updateTokenLabels(docRoot);
        });

        var label=document.createElement('label');
        label.className='char-toggle';

        var cb=document.createElement('input');
        cb.type='checkbox';
        cb.checked=(c.displayMode==='wrapped');
        cb.dataset.key=c.key;
        cb.addEventListener('change',function(ev){
          var t=ev.target;
          var k=t&&t.dataset?t.dataset.key:null;
          var cc=getChar(k);
          if(!cc) return;
          cc.displayMode=t.checked?'wrapped':'plain';
          updateTokenLabels(docRoot);
        });

        label.appendChild(cb);
        var span=document.createElement('span');
        span.textContent='{{ }}';
        label.appendChild(span);

        row.appendChild(keyEl);
        row.appendChild(input);
        row.appendChild(label);
        charList.appendChild(row);
      }
    }

    function setupTabs(){
      var tabs=document.querySelectorAll('.export-tab');
      var tocPanel=document.getElementById('tocPanel');
      var charPanel=document.getElementById('charPanel');

      function activate(name){
        for(var i=0;i<tabs.length;i++){
          var t=tabs[i];
          var on=t.getAttribute('data-tab')===name;
          if(on) t.classList.add('active'); else t.classList.remove('active');
        }
        if(tocPanel) tocPanel.classList.toggle('active', name==='toc');
        if(charPanel) charPanel.classList.toggle('active', name==='characters');
      }

      for(var i=0;i<tabs.length;i++){
        (function(btn){
          btn.addEventListener('click',function(){
            activate(btn.getAttribute('data-tab')||'toc');
          });
        })(tabs[i]);
      }
    }

    function setSidebarClosed(closed){
      if(!appRoot) return;
      appRoot.classList.toggle('is-sidebar-closed', !!closed);
      if(sidebarClose){
        sidebarClose.setAttribute('aria-label', closed ? 'サイドバーを開く' : 'サイドバーを閉じる');
      }
      try{ window.localStorage.setItem('htmlmaker:exportSidebarClosed', closed ? '1' : '0'); }catch(e){}
    }

    function setupSidebarToggle(){
      if(sidebarClose){
        sidebarClose.addEventListener('click', function(){
          var closed = !!(appRoot && appRoot.classList.contains('is-sidebar-closed'));
          setSidebarClosed(!closed);
        });
      }

      try{
        var saved = window.localStorage.getItem('htmlmaker:exportSidebarClosed');
        if(saved==='1') setSidebarClosed(true);
      }catch(e){}
    }

    renderTokens(docRoot);
    buildToc();
    buildCharacters();
    setupTabs();
    setupSidebarToggle();
    setupCopyPopover();
  })();
  </script>
</body>
</html>`
}

function escapeHtml (s: string): string {
  return (s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
