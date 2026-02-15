import { ref } from 'vue'
import { normalizeHexColor, pushRecentColor } from '../utils/color'

type Options = {
  isBrowser?: boolean
  limit?: number
}

export const useRecentColorStorage = (storageKey: string, options: Options = {}) => {
  const recentColors = ref<string[]>([])
  const isBrowser = options.isBrowser ?? (typeof window !== 'undefined')
  const limit = options.limit ?? 10

  const load = () => {
    if (!isBrowser) return
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      recentColors.value = parsed
        .map(String)
        .map((s) => normalizeHexColor(s))
        .filter(Boolean) as string[]
    } catch {}
  }

  const persist = () => {
    if (!isBrowser) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(recentColors.value))
    } catch {}
  }

  const add = (color: string) => {
    recentColors.value = pushRecentColor(recentColors.value, color, limit)
    persist()
  }

  return { recentColors, load, persist, add }
}
