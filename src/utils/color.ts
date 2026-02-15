export const normalizeHexColor = (raw: string): string | null => {
  const v = (raw || '').trim().toLowerCase()
  if (!v) return null
  if (/^#[0-9a-f]{6}$/i.test(v)) return v
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return null
}

export const pushRecentColor = (list: string[], color: string, limit = 10) => {
  const c = normalizeHexColor(color)
  if (!c) return list
  const next = [c].concat(list.filter((x) => x !== c))
  return next.slice(0, limit)
}

/**
 * 色の相対輝度を計算 (WCAG基準)
 */
export const getRelativeLuminance = (hex: string): number => {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return 1

  const r = parseInt(normalized.slice(1, 3), 16) / 255
  const g = parseInt(normalized.slice(3, 5), 16) / 255
  const b = parseInt(normalized.slice(5, 7), 16) / 255

  const toLinear = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * 背景色が薄い色かどうかを判定
 * 薄い色の場合はtrueを返す
 */
export const isLightColor = (hex: string): boolean => {
  const luminance = getRelativeLuminance(hex)
  return luminance > 0.5
}

/**
 * 色を暗くする
 * @param hex - 16進数カラーコード
 * @param amount - 暗くする量 (0-1, デフォルト0.1で10%暗く)
 */
export const darkenColor = (hex: string, amount: number = 0.10): string => {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return hex

  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)

  const newR = Math.max(0, Math.floor(r * (1 - amount)))
  const newG = Math.max(0, Math.floor(g * (1 - amount)))
  const newB = Math.max(0, Math.floor(b * (1 - amount)))

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
