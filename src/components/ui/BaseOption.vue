<template>
  <option :value="value" :disabled="disabled">
    <slot>{{ label }}</slot>
  </option>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    value: string | number
    label?: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>
