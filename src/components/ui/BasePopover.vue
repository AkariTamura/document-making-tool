<template>
  <div
    v-if="open"
    :role="role"
    :aria-label="ariaLabel"
    v-bind="attrs"
    @mousedown.stop
    @click.stop
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    open: boolean
    ariaLabel: string
    role?: string
  }>(),
  {
    role: 'dialog'
  }
)

const attrs = useAttrs()
</script>
