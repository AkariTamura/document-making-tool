<template>
  <div class="sidebar-color">
    <span class="sidebar-color-label">{{ label }}</span>
    <input
      type="color"
      class="sidebar-color-input"
      :value="modelValue || defaultColor"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="button"
      class="sidebar-color-clear"
      title="クリア"
      @click="emit('update:modelValue', undefined)"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
/* global defineProps, defineEmits */

defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: undefined },
  defaultColor: { type: String, default: '#111827' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()
</script>

<style scoped>
.sidebar-color {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
}

.sidebar-color-label {
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
}

.sidebar-color-input {
  width: 16px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
}

.sidebar-color-clear {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
}

.sidebar-color-clear:hover {
  border-color: #2563eb;
  color: #111827;
}
</style>
