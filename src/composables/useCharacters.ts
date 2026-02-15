import { ref, watch } from 'vue'
import type { Character, DisplayMode } from '../types/models'

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

type StoredCharacter = Partial<Character> & { displayMode?: DisplayMode | string }

function coerceCharacter (raw: StoredCharacter, fallbackId: number): Character {
  const id = typeof raw.id === 'number' ? raw.id : fallbackId
  const key = typeof raw.key === 'string' && raw.key ? raw.key : `character${id}`
  const name = typeof raw.name === 'string' ? raw.name : ''
  const displayMode: DisplayMode = raw.displayMode === 'wrapped' ? 'wrapped' : 'plain'

  const textColor = typeof raw.textColor === 'string' && raw.textColor.trim() ? raw.textColor.trim() : undefined
  const backgroundColor = typeof raw.backgroundColor === 'string' && raw.backgroundColor.trim() ? raw.backgroundColor.trim() : undefined

  return { id, key, name, displayMode, textColor, backgroundColor }
}

export function useCharacters (storageKey = 'htmlmaker:characters') {
  const characters = ref<Character[]>([])
  const metaKey = `${storageKey}:meta`

  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          characters.value = parsed
            .filter(Boolean)
            .map((c: any, idx: number) => coerceCharacter(c as StoredCharacter, idx + 1))
        }
      }
    } catch {}
  }

  const maxExistingId = (characters.value.reduce((max, c) => Math.max(max, c.id || 0), 0))
  let nextCharacterId = maxExistingId + 1

  if (isBrowser) {
    try {
      const rawMeta = window.localStorage.getItem(metaKey)
      if (rawMeta) {
        const parsed = JSON.parse(rawMeta)
        const n = Number(parsed?.nextId)
        if (Number.isFinite(n) && n >= 1) nextCharacterId = Math.max(nextCharacterId, Math.floor(n))
      }
    } catch {}
  }

  const saveMeta = () => {
    if (!isBrowser) return
    try {
      window.localStorage.setItem(metaKey, JSON.stringify({ nextId: nextCharacterId }))
    } catch {}
  }

  const saveCharacters = () => {
    if (!isBrowser) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(characters.value))
    } catch {}
  }

  watch(characters, saveCharacters, { deep: true })

  const resetCharacters = () => {
    characters.value = []
    nextCharacterId = 1
    if (!isBrowser) return
    try {
      window.localStorage.removeItem(storageKey)
    } catch {}
    try {
      window.localStorage.removeItem(metaKey)
    } catch {}
  }

  const addCharacter = (name: string) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return

    const id = nextCharacterId++
    const key = `character${id}`

    saveMeta()

    characters.value = characters.value.concat({
      id,
      key,
      name: trimmed,
      displayMode: 'plain'
    })
  }

  const deleteCharacter = (id: number) => {
    const targetId = Number(id)
    if (!Number.isFinite(targetId)) return null
    const idx = characters.value.findIndex((c) => c && c.id === targetId)
    if (idx === -1) return null
    const removed = characters.value[idx]
    characters.value = characters.value.slice(0, idx).concat(characters.value.slice(idx + 1))
    return removed
  }

  // 初期化時点でmetaが未作成なら作成（削除→リロードのID再利用を防ぐ）
  saveMeta()

  return {
    characters,
    addCharacter,
    deleteCharacter,
    resetCharacters
  }
}
