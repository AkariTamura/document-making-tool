import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'htmlmaker:content'

const defaultContent = `
<h1>サンプルドキュメント</h1>
<p>ここに文字を入力してください。</p>
`

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
const savedContent = isBrowser ? window.localStorage.getItem(STORAGE_KEY) : null

const content = ref(savedContent || defaultContent)

watch(content, (val) => {
  if (!isBrowser) return
  if (val == null || val === '') {
    window.localStorage.removeItem(STORAGE_KEY)
  } else {
    window.localStorage.setItem(STORAGE_KEY, val)
  }
})

const renderedHtml = computed(() =>
  content.value ||
  '<p style="color:#9ca3af;">まだ内容がありません。</p>'
)

const resetContent = () => {
  content.value = defaultContent
  if (isBrowser) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function useDocumentContent () {
  return {
    content,
    renderedHtml,
    resetContent
  }
}
