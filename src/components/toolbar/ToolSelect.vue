<template>
  <div class="toolbar-size">
    <span v-if="label" class="toolbar-label">{{ label }}</span>
    <BaseSelect
      :model-value="modelValue"
      :disabled="disabled"
      :aria-label="ariaLabel || label"
      v-bind="attrs"
      @mousedown="(ev) => emit('mousedown', ev)"
      @focus="(ev) => emit('focus', ev)"
      @change="(ev) => emit('change', ev)"
      @update:modelValue="(v) => emit('update:modelValue', v)"
    >
      <slot />
    </BaseSelect>
    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import BaseSelect from '../ui/BaseSelect.vue'

defineOptions({ inheritAttrs: false })

type SelectValue = string | number

withDefaults(
  defineProps<{
    label?: string
    ariaLabel?: string
    modelValue?: SelectValue
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: SelectValue): void
  (e: 'change', ev: Event): void
  (e: 'focus', ev: FocusEvent): void
  (e: 'mousedown', ev: MouseEvent): void
}>()

const attrs = useAttrs()
</script>
