<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :aria-label="ariaLabel"
    v-bind="attrs"
    @change="onChange"
    @focus="onFocus"
    @mousedown="onMousedown"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

type SelectValue = string | number

withDefaults(
  defineProps<{
    modelValue?: SelectValue
    disabled?: boolean
    ariaLabel?: string
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

const onChange = (ev: Event) => {
  const v = (ev.target as HTMLSelectElement | null)?.value ?? ''
  emit('update:modelValue', v)
  emit('change', ev)
}

const onFocus = (ev: FocusEvent) => {
  emit('focus', ev)
}

const onMousedown = (ev: MouseEvent) => {
  emit('mousedown', ev)
}
</script>
