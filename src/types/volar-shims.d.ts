export {}

// Fallback shims for VS Code ts-plugin/Volar helper types.
// Some environments report missing __VLS_* globals even though the app builds.
// Declaring them as any prevents noisy diagnostics.
declare global {
  type __VLS_PickNotAny<T, K> = any
  type __VLS_NormalizeEmits<T> = any
  type __VLS_FunctionalComponentProps<T, K> = any
  type __VLS_functionalComponentArgsRest<T, K> = any
  type __VLS_pickFunctionalComponentCtx<T, K> = any

  const __VLS_FunctionalComponentProps: any
  const __VLS_functionalComponentArgsRest: any
  const __VLS_pickFunctionalComponentCtx: any
  const __VLS_intrinsicElements: any
  const __VLS_elementAsFunctionalComponent: any
}
