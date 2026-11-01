import { presets, validateUrl, type PresetFile } from "./sources.mts"
import type { GeoKind } from "./types.mts"

export function viewerPopupTarget(
  href: string,
  current: string,
  base = "/"
) {
  try {
    const page = new URL(current)
    const target = new URL(href, page)
    const root = base.endsWith("/") ? base : `${base}/`
    const isViewer = (path: string) =>
      path.startsWith(root) &&
      /^(?:(?:en|ru)\/)?tools\/geofileviewer(?:\.html)?$/.test(
        path.slice(root.length)
      )
    if (
      target.origin === page.origin &&
      isViewer(target.pathname) &&
      !isViewer(page.pathname)
    )
      return target
  } catch {}
}

export function parsePermalink(search: string) {
  const params = new URLSearchParams(search)
  const empty = {
    index: -1,
    file: undefined as PresetFile | undefined,
    url: undefined as string | undefined,
    kind: "geosite" as GeoKind,
    tag: "",
    invalid: false
  }
  if (params.has("url")) {
    try {
      const url = validateUrl(params.get("url") ?? "")
      const requestedKind = params.get("type")?.trim().toLowerCase()
      if (
        requestedKind !== undefined &&
        requestedKind !== "geoip" &&
        requestedKind !== "geosite"
      )
        throw new Error("Invalid data type")
      const kind: GeoKind =
        requestedKind ??
        (/(?:^|\/)geoip(?:[./_-]|$)/i.test(new URL(url).pathname)
          ? "geoip"
          : "geosite")
      return { ...empty, url, kind, tag: (params.get("tag") ?? "").trim() }
    } catch {
      return { ...empty, invalid: true }
    }
  }
  const file = params.get("file")
  const index = presets.findIndex((preset) => preset.file === file)
  return {
    ...empty,
    index,
    file: index >= 0 ? presets[index].file : undefined,
    kind: index >= 0 ? presets[index].kind : ("geosite" as GeoKind),
    tag: index >= 0 ? (params.get("tag") ?? "").trim() : "",
    invalid: file !== null && index < 0
  }
}

export function remoteCategoryLink(
  current: string,
  dataUrl: string,
  kind: GeoKind,
  tag?: string
) {
  const url = new URL(current)
  url.search = ""
  url.hash = ""
  url.searchParams.set("url", validateUrl(dataUrl))
  url.searchParams.set("type", kind)
  if (tag) url.searchParams.set("tag", tag.toLowerCase())
  return url.href
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
