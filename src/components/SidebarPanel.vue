<template>
  <aside class="sidebar">
    <div class="sidebar-tabs">
      <button
        type="button"
        class="sidebar-tab"
        :class="{ active: activeTab === 'toc' }"
        @click="activeTab = 'toc'"
      >
        目次
      </button>
      <button
        type="button"
        class="sidebar-tab"
        :class="{ active: activeTab === 'characters' }"
        @click="activeTab = 'characters'"
      >
        キャラクター
      </button>
      <BaseButton
        class="sidebar-toggle-btn is-open"
        :aria-label="isSidebarOpen ? 'サイドバーを隠す' : 'サイドバーを表示'"
        :title="isSidebarOpen ? 'サイドバーを隠す' : 'サイドバーを表示'"
        :aria-pressed="isSidebarOpen"
        @click.prevent="emit('toggle-sidebar')"
      >
        <span class="hamburger-icon" :class="{ 'is-open': isSidebarOpen }" aria-hidden="true" />
      </BaseButton>
    </div>

    <div v-if="activeTab === 'toc'" class="sidebar-section">
      <h2>目次</h2>

      <div v-if="tocTree.length" class="toc-tree">
        <template v-for="node1 in tocTree" :key="`toc-h1-${node1.item.index}`">
          <details
            v-if="node1.children && node1.children.length"
            class="toc-details lvl-1"
            open
          >
            <summary class="toc-summary" @click.prevent>
              <span class="toc-row-left">
                <button
                  type="button"
                  class="toc-title lvl-1"
                  @click.stop.prevent="emit('jump-to-heading', node1.item.index)"
                >
                  {{ node1.item.text }}
                </button>
              </span>
              <button
                type="button"
                class="toc-toggle"
                aria-label="展開/折りたたみ"
                @click.stop.prevent="toggleDetails($event)"
              >
                ▸
              </button>
            </summary>

            <div class="toc-children">
              <template v-for="node2 in node1.children" :key="`toc-child-${node2.item.index}`">
                <!-- Level 2 (中見出し) with Level 3 children -->
                <details
                  v-if="node2.item.level === 2 && node2.h3 && node2.h3.length"
                  class="toc-details lvl-2"
                  open
                >
                  <summary class="toc-summary" @click.prevent>
                    <span class="toc-row-left">
                      <button
                        type="button"
                        class="toc-title lvl-2"
                        @click.stop.prevent="emit('jump-to-heading', node2.item.index)"
                      >
                        {{ node2.item.text }}
                      </button>
                    </span>
                    <button
                      type="button"
                      class="toc-toggle"
                      aria-label="展開/折りたたみ"
                      @click.stop.prevent="toggleDetails($event)"
                    >
                      ▸
                    </button>
                  </summary>

                  <div class="toc-children">
                    <button
                      v-for="node3 in node2.h3"
                      :key="`toc-h3-${node3.item.index}`"
                      type="button"
                      class="toc-item lvl-3"
                      @click="emit('jump-to-heading', node3.item.index)"
                    >
                      <span class="toc-text">{{ node3.item.text }}</span>
                    </button>
                  </div>
                </details>

                <!-- Level 2 (中見出し) without children -->
                <button
                  v-else-if="node2.item.level === 2"
                  type="button"
                  class="toc-item lvl-2"
                  @click="emit('jump-to-heading', node2.item.index)"
                >
                  <span class="toc-text">{{ node2.item.text }}</span>
                </button>

                <!-- Level 3 (小見出し) standalone -->
                <button
                  v-else-if="node2.item.level === 3"
                  type="button"
                  class="toc-item lvl-3"
                  @click="emit('jump-to-heading', node2.item.index)"
                >
                  <span class="toc-text">{{ node2.item.text }}</span>
                </button>
              </template>
            </div>
          </details>

          <button
            v-else
            type="button"
            class="toc-item lvl-1"
            @click="emit('jump-to-heading', node1.item.index)"
          >
            <span class="toc-text">{{ node1.item.text }}</span>
          </button>
        </template>
      </div>
      <p v-else class="sidebar-empty">見出しがありません。</p>
    </div>

    <div v-else class="sidebar-section">
      <h2>キャラクター</h2>
      <p class="sidebar-description">
        キャラクター名を編集し、「挿入」ボタンでテキスト中に挿入できます。<br>
        文字色・背景色を設定して「セリフを追加」で「」を挿入できます。
      </p>
      <form class="sidebar-form" @submit.prevent="emit('add-character')">
        <input
          :value="newCharacterName"
          type="text"
          placeholder="キャラクター名を入力"
          @input="onInputNewName"
        >
        <BaseButton type="submit" variant="primary">追加</BaseButton>
      </form>
      <div v-if="characters && characters.length" class="sidebar-list">
        <div
          v-for="ch in characters"
          :key="ch.id"
          class="sidebar-character-row"
        >
          <div class="sidebar-character">
            <input
              v-model="ch.name"
              type="text"
              class="sidebar-character-input"
            >
          </div>
          <div class="sidebar-character">
            <div class="sidebar-character-toggle">
              <span class="sidebar-character-toggle-text">
                {{ ch.displayMode === 'wrapped' ? '変数を表示' : 'そのまま表示' }}
              </span>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  :checked="ch.displayMode === 'wrapped'"
                  @change="ch.displayMode = $event.target.checked ? 'wrapped' : 'plain'"
                >
                <span class="toggle-slider" />
              </label>
            </div>

            <BaseButton
              type="button"
              class="sidebar-character-insert"
              variant="ghost"
              @click="emit('insert-character', ch)"
            >
              挿入
            </BaseButton>

            <BaseButton
              type="button"
              class="sidebar-character-delete"
              variant="danger-ghost"
              @click="emit('delete-character', ch)"
            >
              削除
            </BaseButton>
          </div>

          <div class="sidebar-character sidebar-character-nowrap">
            <div class="sidebar-character-colors">
              <ColorMiniPicker
                v-model="ch.textColor"
                label="文字"
                default-color="#111827"
              />
              <ColorMiniPicker
                v-model="ch.backgroundColor"
                label="背景"
                default-color="#ffffff"
              />
            </div>

            <BaseButton
              type="button"
              class="sidebar-character-speech"
              variant="ghost"
              @click="emit('insert-speech', ch)"
            >
              セリフを追加
            </BaseButton>
          </div>
        </div>
      </div>
      <p v-else class="sidebar-empty">キャラクターを追加してください。</p>
      <div class="sidebar-actions-row">
        <BaseButton variant="danger-ghost" @click="emit('reset-characters')">
          キャラクターを初期化
        </BaseButton>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */
/* global defineProps, defineEmits */
import { computed, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import ColorMiniPicker from './ui/ColorMiniPicker.vue'

const activeTab = ref('toc')

const props = defineProps({
  tocItems: {
    type: Array,
    default: () => []
  },
  characters: {
    type: Array,
    default: () => []
  },
  newCharacterName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:new-character-name',
  'toggle-sidebar',
  'add-character',
  'insert-character',
  'insert-speech',
  'delete-character',
  'reset-characters',
  'jump-to-heading'
])

const onInputNewName = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  emit('update:new-character-name', target?.value ?? '')
}

const tocTree = computed(() => {
  const items = Array.isArray(props.tocItems) ? props.tocItems : []

  const roots: any[] = []
  let currentH1: any | null = null
  let currentH2: any | null = null

  const ensureRoot = () => {
    if (currentH1) return currentH1
    const ghost = {
      item: { index: -1, level: 1, text: '（見出し）' },
      children: []
    }
    roots.push(ghost)
    currentH1 = ghost
    return ghost
  }

  for (const item of items as any[]) {
    if (!item) continue
    const level = item.level
    const node = { item }

    if (level === 1) {
      const n1 = { item, children: [] }
      roots.push(n1)
      currentH1 = n1
      currentH2 = null
      continue
    }

    if (level === 2) {
      const root = ensureRoot()
      const n2 = { item, h3: [] }
      root.children.push(n2)
      currentH2 = n2
      continue
    }

    if (level === 3) {
      const root = ensureRoot()
      if (currentH2) {
        currentH2.h3.push(node)
      } else {
        root.children.push(node)
      }
      continue
    }
  }

  return roots.filter((r) => r.item.index !== -1 || r.children.length)
})

const toggleDetails = (event: MouseEvent) => {
  const btn = event.currentTarget as HTMLElement | null
  const details = btn?.closest('details') as HTMLDetailsElement | null
  if (!details) return
  details.open = !details.open
}
</script>

<style scoped>
.sidebar {
  max-width: none;
  min-width: 0;
  width: 100%;
  background: var(--panel-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--panel-text-color, #374151);
}

.sidebar-tabs {
  display: flex;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.sidebar-tab {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
}

.sidebar-tab.active {
  background: var(--theme-accent, #2563eb);
  border-color: var(--theme-accent, #2563eb);
  color: var(--theme-text-color, #ffffff);
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar h2 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.sidebar-description {
  margin: 0 0 6px;
  font-size: 11px;
  color: #6b7280;
}

.sidebar-form {
  display: flex;
  gap: 6px;
}


.sidebar-character-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-character-toggle-text {
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.2s;
  border-radius: 999px;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  top: 3px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.3);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--theme-accent, #2563eb);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.sidebar-form input[type="text"] {
  flex: 1;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  font-size: 12px;
}

.sidebar-form input[type="text"]:focus {
  outline: none;
  border-color: var(--theme-accent, #2563eb);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.sidebar-character-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.sidebar-character-row:last-child {
  border-bottom: none;
}

.sidebar-character{
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sidebar-character-nowrap {
  flex-wrap: nowrap;
}

.sidebar-character-nowrap,
.sidebar-character-nowrap * {
  white-space: nowrap;
}

.sidebar-character-colors {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: 0 0 auto;
}
.sidebar-character-delete {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.sidebar-character-delete:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.6);
}

.sidebar-character-input {
  flex: 1;
  min-width: 140px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  font-size: 12px;
}

.sidebar-character-input:focus {
  outline: none;
  border-color: var(--theme-accent, #2563eb);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.25);
}

.sidebar-character-insert {
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.sidebar-character-insert:hover {
  background: rgba(var(--theme-accent-rgb, 176, 176, 176), 0.5);
  border-color: var(--theme-accent, #2563eb);
}

.sidebar-character-speech {
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.sidebar-character-speech:hover {
  background: rgba(var(--theme-accent-rgb, 176, 176, 176), 0.5);
  border-color: var(--theme-accent, #2563eb);
}

.sidebar-empty {
  margin: 4px 0 0;
  font-size: 11px;
  color: #9ca3af;
}

.sidebar-actions-row {
  margin-top: 8px;
}


.toc-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toc-details {
  border: none;
  background: transparent;
  border-radius: 0;
  overflow: visible;
}

.toc-details.lvl-2 {
  border-radius: 0;
}

.toc-summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;
  background: transparent;
  cursor: default;
}

.toc-summary::-webkit-details-marker {
  display: none;
}

.toc-row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.toc-children {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0 2px 14px;
}

.toc-title {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--panel-text-color, #374151);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-title:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.toc-title.lvl-1,
.toc-item.lvl-1 {
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  font-size: 14px;
}

.toc-title.lvl-2 {
  font-size: 12px;
}

.toc-toggle {
  border: none;
  background: transparent;
  color: var(--panel-text-color, #374151);
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  flex: 0 0 auto;
  transition: transform 0.15s ease;
}

details[open] > .toc-summary .toc-toggle {
  transform: rotate(90deg);
  font-size: 16px;
}

.toc-toggle:hover {
  color: var(--panel-text-color, #374151);
  background: rgba(17, 24, 39, 0.05);
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--panel-text-color, #374151);
  border-radius: 6px;
  padding: 2px 0;
  text-align: left;
  cursor: pointer;
}

.toc-item:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.toc-item.lvl-2 {
  padding-left: 0;
  font-size: 12px;
}

.toc-item.lvl-3 {
  padding-left: 12px;
  font-size: 12px;
}

.toc-text {
  font-size: inherit;
  color: var(--panel-text-color, #374151);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-text.underline {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
}

.toc-item.lvl-1 span{
  font-size: inherit;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}
</style>
