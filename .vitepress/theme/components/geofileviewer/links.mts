import { presets, type PresetFile } from "./sources.mts"

export function parsePermalink(search: string) {
  const params = new URLSearchParams(search)
  const file = params.get("file")
  const index = presets.findIndex((preset) => preset.file === file)
  return {
    index,
    file: index >= 0 ? presets[index].file : undefined,
    tag: index >= 0 ? (params.get("tag") ?? "").trim() : "",
    invalid: file !== null && index < 0
  }
}

export function categoryLink(
  current: string,
  file: PresetFile,
  tag?: string
) {
  const url = new URL(current)
  url.search = ""
  url.hash = ""
  url.searchParams.set("file", file)
  if (tag) url.searchParams.set("tag", tag.toLowerCase())
  return url.href
}
