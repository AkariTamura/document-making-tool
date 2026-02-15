export type DisplayMode = 'plain' | 'wrapped'

export type Character = {
  id: number
  key: string
  name: string
  displayMode: DisplayMode
  textColor?: string
  backgroundColor?: string
}

export type TocItem = {
  index: number
  level: 1 | 2 | 3
  text: string
}

export type JsonStoryItem = {
  data: string
  style: string
}

export type JsonExport = {
  story: JsonStoryItem[]
}
