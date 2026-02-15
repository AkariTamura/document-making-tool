export {}

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: any) => any
    }
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>
  }
}
