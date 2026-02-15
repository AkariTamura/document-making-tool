<template>
  <button
    :type="type"
    v-bind="attrs"
    :class="[buttonClass, attrs.class]"
    :style="buttonStyle"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
/* eslint-disable no-unused-vars */
/* global defineProps, defineEmits */
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'ghost', 'danger', 'danger-ghost'].includes(v)
  }
})

const emit = defineEmits(['click'])

const buttonClass = computed(() => {
  if (props.variant === 'primary') return 'btn-primary'
  if (props.variant === 'ghost') return 'btn-ghost'
  if (props.variant === 'danger') return 'btn-danger'
  if (props.variant === 'danger-ghost') return 'btn-danger-ghost'
  return 'btn-primary'
})

const buttonStyle = computed(() => {
  return {}
})

const onClick = (event) => {
  emit('click', event)
}
</script>

<style scoped>
button {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.btn-primary {
  background: var(--theme-accent, #2563eb);
  border-color: rgba(var(--theme-accent-rgb, 37, 99, 235), 0.9);
  color: var(--theme-text-color, #ffffff);
  box-shadow: 0 1px 4px rgba(var(--theme-accent-rgb, 37, 99, 235), 0.4);
}

.btn-primary:hover {
  background: rgba(var(--theme-accent-rgb, 37, 99, 235), 0.9);
  box-shadow: 0 2px 8px rgba(var(--theme-accent-rgb, 37, 99, 235), 0.5);
}

.btn-ghost {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.btn-danger {
  background: #dc2626;
  border-color: #b91c1c;
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(220, 38, 38, 0.4);
}

.btn-danger:hover {
  background: #b91c1c;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.5);
}

.btn-danger-ghost {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.btn-danger-ghost:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.btn-primary:active,
.btn-ghost:active,
.btn-danger:active,
.btn-danger-ghost:active {
  transform: translateY(1px);
}
</style>
