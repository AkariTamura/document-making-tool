import { onBeforeUnmount } from 'vue'

type OutsideCloseOptions = {
  isOpen: () => boolean
  getHost: () => HTMLElement | null
  onClose: () => void
}

export const useOutsideClose = () => {
  const registerOutsideClose = (opts: OutsideCloseOptions) => {
    if (typeof document === 'undefined') return
    const onDocMouseDown = (ev: MouseEvent) => {
      if (!opts.isOpen()) return
      const host = opts.getHost()
      const target = ev.target
      if (host && target instanceof Node && host.contains(target)) return
      opts.onClose()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocMouseDown)
    })
  }

  return { registerOutsideClose }
}
