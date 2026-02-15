<template>
  <div class="color-popover-section">
    <div class="color-popover-title">{{ title }}</div>

    <div class="color-swatch-grid" role="group" :aria-label="`${title}（デフォルト）`">
      <button
        v-for="c in palette"
        :key="`${idPrefix}-p-${c}`"
        type="button"
        class="color-swatch"
        :style="{ background: c }"
        :aria-label="`${title} ${c}`"
        @mousedown.prevent
        @click="emit('apply', c)"
      />
    </div>

    <div v-if="recentColors.length" class="color-history">
      <div class="color-popover-subtitle">履歴（最大10）</div>
      <div class="color-swatch-grid" role="group" :aria-label="`${title}（履歴）`">
        <button
          v-for="c in recentColors"
          :key="`${idPrefix}-r-${c}`"
          type="button"
          class="color-swatch"
          :style="{ background: c }"
          :aria-label="`${title}（履歴） ${c}`"
          @mousedown.prevent
          @click="emit('apply', c)"
        />
      </div>
    </div>

    <form class="color-add-row" @submit.prevent="emit('add')">
      <input
        :value="picker"
        type="color"
        class="color-picker"
        :aria-label="`${title}ピッカー`"
        @input="onPickerInput"
      >
      <input
        :value="code"
        type="text"
        class="color-code"
        :aria-label="`${title}（カラーコード）`"
        :placeholder="placeholder"
        @input="emit('update:code', ($event.target as HTMLInputElement).value)"
      >
      <button type="submit" class="color-add-button">追加</button>
    </form>
  </div>
</template>

<script setup lang="ts">
/* global defineProps, defineEmits */

const props = defineProps({
  title: { type: String, required: true },
  idPrefix: { type: String, required: true },
  palette: { type: Array as () => string[], default: () => [] },
  recentColors: { type: Array as () => string[], default: () => [] },
  picker: { type: String, default: '#111827' },
  code: { type: String, default: '#111827' },
  placeholder: { type: String, default: '#111827' }
})

const emit = defineEmits<{
  (e: 'apply', color: string): void
  (e: 'add'): void
  (e: 'update:picker', value: string): void
  (e: 'update:code', value: string): void
}>()

const onPickerInput = (ev: Event) => {
  const v = (ev.target as HTMLInputElement).value
  emit('update:picker', v)
  emit('update:code', v)
}
</script>
