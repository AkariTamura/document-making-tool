<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="title"
    :aria-label="ariaLabel"
    v-bind="attrs"
    @mousedown="onMousedown"
    @click="onClick"
  >
    <slot name="short">
      <span v-if="short" class="short">{{ short }}</span>
    </slot>
    <slot>
      <span v-if="label">{{ label }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    short?: string
    label?: string
    title?: string
    ariaLabel?: string
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    preventMouseDown?: boolean
  }>(),
  {
    type: 'button',
    preventMouseDown: false
  }
)

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
  (e: 'mousedown', ev: MouseEvent): void
}>()

const attrs = useAttrs()

const ariaLabel = computed(() => props.ariaLabel || props.label || props.title)

const onMousedown = (ev: MouseEvent) => {
  if (props.preventMouseDown) ev.preventDefault()
  emit('mousedown', ev)
}

const onClick = (ev: MouseEvent) => {
  emit('click', ev)
}
</script>
