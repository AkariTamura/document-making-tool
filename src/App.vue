<template>
  <div class="app-root">
    <header>
      <h1>HTML / PDF メーカー</h1>
      <p>
        画面は開発中のものです。入力した情報はローカルストレージに保存されます。サーバーには送信されません。<br>
        要素の上で右クリックしてコピーボタンを押すと、要素をクリップボードにコピーできます。Ctrl+ZとCtrl+Yで元に戻すとやり直す操作ができます。<br>
      </p>
      <div class="actions-row">
        <BaseButton variant="danger-ghost" title="入力した情報を全て削除します" @click="onResetAll">
          ローカル保存を初期化
        </BaseButton>
        <BaseButton variant="ghost" title="出力したHTMLから作業内容を復元します" @click="onPickImportHtml">
          HTMLから読み込み
        </BaseButton>

        <div ref="dlMenuRef" class="toolbar-color-menu">
          <BaseButton
            variant="ghost"
            title="各種形式でダウンロードできます"
            :aria-label="isDlPopoverOpen ? 'ダウンロードメニューを閉じる' : 'ダウンロードメニューを開く'"
            :aria-pressed="isDlPopoverOpen"
            @click="toggleDlPopover"
          >
            ダウンロード
          </BaseButton>

          <BasePopover
            :open="isDlPopoverOpen"
            class="color-popover dl-popover"
            aria-label="ダウンロード"
          >
            <div class="color-popover-section">
              <div class="color-popover-title">ダウンロード</div>
              <div class="color-popover-subtitle">出力形式とファイル名を指定して保存します</div>

              <div class="link-popover-grid">
                <label class="link-popover-field">
                  <span class="link-popover-label">ファイル名（拡張子不要）</span>
                  <input
                    v-model="fileBaseName"
                    type="text"
                    class="link-input"
                    placeholder="document"
                    @keydown.escape.stop.prevent="isDlPopoverOpen = false"
                  >
                </label>
              </div>

              <div class="link-popover-actions dl-popover-actions">
                <BaseButton variant="ghost" @click="onDownloadHtmlFromPopover">HTML</BaseButton>
                <BaseButton variant="ghost" @click="onDownloadPdfFromPopover">PDF</BaseButton>
                <BaseButton variant="ghost" @click="onDownloadJsonFromPopover">JSON</BaseButton>
                <BaseButton variant="ghost" @click="onDownloadTxtFromPopover">TXT</BaseButton>
              </div>
            </div>
          </BasePopover>
        </div>
      </div>
    </header>
    <main class="main">
      <div class="layout-main" :class="{ 'is-sidebar-closed': !isSidebarOpen }">
      <BaseButton
        v-if="!isSidebarOpen"
        class="sidebar-toggle-btn not-in-toolbar"
        :aria-label="'サイドバーを表示'"
        :title="'サイドバーを表示'"
        @click="toggleSidebar"
      >
        <span class="hamburger-icon" aria-hidden="true" />
      </BaseButton>
        <div class="sidebar-shell" :class="{ 'is-closed': !isSidebarOpen }">
          <div class="sidebar-shell-inner">
            <SidebarPanel
              :toc-items="tocItems"
              :characters="characters"
              :new-character-name="newCharacterName"
              @update:new-character-name="newCharacterName = $event"
              @toggle-sidebar="toggleSidebar"
              @add-character="addCharacter"
              @insert-character="insertCharacter"
              @insert-speech="insertSpeech"
              @delete-character="onDeleteCharacter"
              @reset-characters="onResetCharacters"
              @jump-to-heading="onJumpToHeading"
            />
          </div>
        </div>
        <div class="single-pane">
          <EditorPanel
            ref="editorPanelRef"
            :content="store.content.value"
            :rendered-html="store.renderedHtml.value"
            :characters="characters"
            @update:content="onUpdateContent"
            @update:doc-bg="onUpdateDocBg"
            @toc-change="onTocChange"
          />
        </div>
      </div>
    </main>
    <footer>2025　画面は開発中のものです。</footer>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useDocumentContent } from './composables/useDocumentContent'
import { useFileBaseName } from './composables/useFileBaseName'
import { useCharacters } from './composables/useCharacters'
import { isLightColor, darkenColor } from './utils/color'
import EditorPanel from './components/EditorPanel.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BasePopover from './components/ui/BasePopover.vue'
import SidebarPanel from './components/SidebarPanel.vue'
import type { Character, TocItem } from './types/models'

const isSidebarOpen = ref(true)
const SIDEBAR_OPEN_STORAGE_KEY = 'htmlmaker:sidebarOpen'
const currentDocBg = ref('#f9fafb')

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  try {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, JSON.stringify(isSidebarOpen.value))
  } catch {}
}

// ヘッダーの文字色をテーマカラーに応じて更新
const updateHeaderTextColor = () => {
  const themeColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-accent')
    .trim()
  
  if (themeColor && isLightColor(themeColor)) {
    document.documentElement.style.setProperty('--header-text-color', '#374151')
    document.documentElement.style.setProperty('--theme-text-color', '#374151')
  } else {
    document.documentElement.style.setProperty('--header-text-color', '#ffffff')
    document.documentElement.style.setProperty('--theme-text-color', '#ffffff')
  }
}

// 背景色をdocBgに基づいて設定
const updateBackgroundColors = () => {
  const bgColor = currentDocBg.value
  if (bgColor) {
    const darkerBg = darkenColor(bgColor, 0.04)
    const darkerBorder = darkenColor(bgColor, 0.10)
    document.documentElement.style.setProperty('--app-bg-color', darkerBg)
    document.documentElement.style.setProperty('--panel-bg-color', bgColor)
    document.documentElement.style.setProperty('--border-color', darkerBorder)
    
    // パネル背景色に応じて文字色を計算
    if (isLightColor(bgColor)) {
      document.documentElement.style.setProperty('--panel-text-color', '#374151')
      document.documentElement.style.setProperty('--footer-text-color', '#374151')
    } else {
      document.documentElement.style.setProperty('--panel-text-color', '#e5e7eb')
      document.documentElement.style.setProperty('--footer-text-color', '#e5e7eb')
    }
  }
}

const onUpdateDocBg = (value: string) => {
  currentDocBg.value = value
  updateBackgroundColors()
}

onMounted(() => {
  // EditorPanelから保存された背景色を読み込む
  try {
    const stored = window.localStorage.getItem('htmlmaker:docStyle')
    if (stored) {
      const obj = JSON.parse(stored)
      if (obj?.docBg) {
        currentDocBg.value = obj.docBg
      }
    }
  } catch {}
  
  updateHeaderTextColor()
  updateBackgroundColors()
  // CSS変数の変更を監視（MutationObserverを使用）
  const observer = new MutationObserver(() => {
    updateHeaderTextColor()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style']
  })
})

try {
  const raw = window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)
  if (raw != null) {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'boolean') isSidebarOpen.value = parsed
  }
} catch {}

const store = useDocumentContent()

const onUpdateContent = (val: string) => {
  store.content.value = val
}

const editorPanelRef = ref<any>(null)
const importHtmlInputRef = ref<HTMLInputElement | null>(null)
const dlMenuRef = ref<HTMLElement | null>(null)
const isDlPopoverOpen = ref(false)
const newCharacterName = ref('')
const tocItems = ref<TocItem[]>([])

const { fileBaseName } = useFileBaseName()
const { characters, addCharacter: addCharacterBase, deleteCharacter, resetCharacters } = useCharacters()

const addCharacter = () => {
  addCharacterBase(newCharacterName.value)
  newCharacterName.value = ''
}

const insertCharacter = (ch: Character) => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.insertCharacterToken(ch)
}

const insertSpeech = (ch: Character) => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.insertSpeech(ch)
}

const onDeleteCharacter = (ch: Character) => {
  const key = String(ch?.key || '').trim()
  const name = String(ch?.name || '').trim()
  if (!key) return

  const ok = window.confirm(
    '削除すると戻せません。このキャラクターの使用箇所はシンプルなテキストに戻ります。よろしいですか？'
  )
  if (!ok) return

  try {
    editorPanelRef.value?.replaceCharacterWithPlainText?.(key, name)
  } catch {}

  deleteCharacter(ch.id)
}

const onDownloadHtml = () => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.downloadHtml(fileBaseName.value)
}

const onDownloadJson = () => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.downloadJson(fileBaseName.value)
}

const onDownloadPdf = () => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.downloadPdf(fileBaseName.value, tocItems.value)
}

const onDownloadTxt = () => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.downloadTxt(fileBaseName.value)
}

const toggleDlPopover = () => {
  isDlPopoverOpen.value = !isDlPopoverOpen.value
}

const onDownloadHtmlFromPopover = () => {
  onDownloadHtml()
  isDlPopoverOpen.value = false
}

const onDownloadPdfFromPopover = () => {
  onDownloadPdf()
  isDlPopoverOpen.value = false
}

const onDownloadJsonFromPopover = () => {
  onDownloadJson()
  isDlPopoverOpen.value = false
}

const onDownloadTxtFromPopover = () => {
  onDownloadTxt()
  isDlPopoverOpen.value = false
}

if (typeof document !== 'undefined') {
  const onDocMouseDown = (ev: MouseEvent) => {
    if (!isDlPopoverOpen.value) return
    const host = dlMenuRef.value
    const target = ev.target
    if (host && target instanceof Node && host.contains(target)) return
    isDlPopoverOpen.value = false
  }

  try {
    document.addEventListener('mousedown', onDocMouseDown)
  } catch {}

  onBeforeUnmount(() => {
    try {
      document.removeEventListener('mousedown', onDocMouseDown)
    } catch {}
  })
}

type ExportPayload = {
  characters?: any[]
  documentStyle?: any
  sourceHtml?: string
}

const normalizeImportedCharacters = (list: any[]): Character[] => {
  const out: Character[] = []
  let nextId = 1
  for (const item of (Array.isArray(list) ? list : [])) {
    const key = typeof item?.key === 'string' ? item.key.trim() : ''
    if (!key) continue
    const name = typeof item?.name === 'string' ? item.name : ''
    const displayMode = item?.displayMode === 'wrapped' ? 'wrapped' : 'plain'
    const textColor = typeof item?.textColor === 'string' && item.textColor.trim() ? item.textColor.trim() : undefined
    const backgroundColor = typeof item?.backgroundColor === 'string' && item.backgroundColor.trim() ? item.backgroundColor.trim() : undefined
    out.push({ id: nextId++, key, name, displayMode, textColor, backgroundColor })
  }
  return out
}

const parseExportedHtml = (html: string): ExportPayload | null => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(String(html || ''), 'text/html')
    const jsonScript = doc.getElementById('htmlmaker-export-data')
    if (jsonScript?.textContent) {
      return JSON.parse(jsonScript.textContent) as ExportPayload
    }

    // backward-compat: attempt to extract window.__HTMLMAKER_EXPORT__ assignment
    const scripts = Array.from(doc.querySelectorAll('script'))
    const joined = scripts.map((s) => s.textContent || '').join('\n')
    const idx = joined.indexOf('window.__HTMLMAKER_EXPORT__')
    if (idx === -1) return null
    const eq = joined.indexOf('=', idx)
    if (eq === -1) return null
    const start = joined.indexOf('{', eq)
    if (start === -1) return null

    let depth = 0
    let inStr: string | null = null
    let escaped = false
    for (let i = start; i < joined.length; i++) {
      const ch = joined[i]
      if (inStr) {
        if (escaped) { escaped = false; continue }
        if (ch === '\\') { escaped = true; continue }
        if (ch === inStr) { inStr = null; continue }
        continue
      }
      if (ch === '"' || ch === "'") { inStr = ch; continue }
      if (ch === '{') depth++
      if (ch === '}') {
        depth--
        if (depth === 0) {
          const objText = joined.slice(start, i + 1)
          return JSON.parse(objText) as ExportPayload
        }
      }
    }
    return null
  } catch {
    return null
  }
}

const onPickImportHtml = () => {
  importHtmlInputRef.value?.click()
}

const onImportHtmlFile = async (ev: Event) => {
  const input = ev.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const payload = parseExportedHtml(text)
    if (!payload) {
      alert('このHTMLから編集データを見つけられませんでした。（htmlmaker-export-data がありません）')
      return
    }

    if (typeof payload.sourceHtml === 'string' && payload.sourceHtml.trim()) {
      store.content.value = payload.sourceHtml
    } else {
      alert('本文データが見つかりませんでした。')
      return
    }

    if (Array.isArray(payload.characters)) {
      characters.value = normalizeImportedCharacters(payload.characters)
    }

    if (payload.documentStyle && editorPanelRef.value?.applyImportedDocStyle) {
      editorPanelRef.value.applyImportedDocStyle(payload.documentStyle)
    }
  } catch {
    alert('HTMLの読み込みに失敗しました。')
  } finally {
    try { if (input) input.value = '' } catch {}
  }
}

const onTocChange = (items: TocItem[]) => {
  tocItems.value = items
}

const onJumpToHeading = (index: number) => {
  if (!editorPanelRef.value) return
  editorPanelRef.value.scrollToHeading(index)
}

const onResetAll = () => {
  if (window.confirm('本文、キャラクター、テーマ設定のローカル保存を初期化します。よろしいですか？')) {
    store.resetContent()
    resetCharacters()
    try {
      editorPanelRef.value?.resetDocStyleToDefaults?.()
    } catch {}
  }
}

const onResetCharacters = () => {
  if (window.confirm('キャラクター一覧を初期化します。よろしいですか？')) {
    resetCharacters()
  }
}
</script>
