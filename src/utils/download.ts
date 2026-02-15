const INVALID_FILENAME_CHARS = /[\\/:*?"<>|\u0000-\u001F]/g

export function sanitizeFileBaseName (
  raw: string | undefined | null,
  fallback: string
): string {
  const v = (raw || '').trim() || fallback
  const noExt = v.replace(/\.(html|pdf|json)$/i, '')
  const cleaned = noExt
    .replace(INVALID_FILENAME_CHARS, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return cleaned || fallback
}

export function downloadBlob (blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadText (text: string, fileName: string, mime: string): void {
  downloadBlob(new Blob([text], { type: mime }), fileName)
}
