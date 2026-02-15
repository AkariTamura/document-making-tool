import { ref, watch } from 'vue'

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function useFileBaseName (storageKey = 'htmlmaker:filename', defaultName = 'document') {
  const fileBaseName = ref(defaultName)

  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) fileBaseName.value = raw
    } catch {}
  }

  watch(
    fileBaseName,
    (val) => {
      if (!isBrowser) return
      try {
        window.localStorage.setItem(storageKey, val || '')
      } catch {}
    },
    { flush: 'post' }
  )

  return { fileBaseName }
}
