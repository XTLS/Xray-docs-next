import type {
  CategorySummary,
  ErrorCode,
  GeoEntry,
  GeoKind,
  SearchMode
} from "./types.mts"
import type { LoadProgress, PresetFile } from "./sources.mts"
import { CATEGORY_PAGE_SIZE } from "./types.mts"

export type SourceDraft = {
  mode: "preset" | "url" | "local"
  kind: GeoKind
  presetIndex: number
  url: string
  file?: File
}
export type SearchErrorKey = "invalidIp" | "invalidDomain"
export type LoadedSource = Readonly<{
  name: string
  kind: GeoKind
  preset?: PresetFile
  url?: string
}>
export type ViewerTarget =
  | { type: "home" }
  | { type: "preset"; index: number; tag: string }
  | { type: "url"; url: string; kind: GeoKind; tag: string }
export type ViewerHost =
  { mode: "page" } | { mode: "embedded"; url: string }
export const initialDraft = (): SourceDraft => ({
  mode: "preset",
  kind: "geosite",
  presetIndex: 0,
  url: "",
  file: undefined
})
export const initialSession = () => ({
  status: "idle" as "idle" | "loading" | "ready" | "error",
  loaded: undefined as LoadedSource | undefined,
  phase: "read" as LoadProgress["phase"],
  progress: undefined as number | undefined,
  downloadedBytes: 0,
  categoryCount: 0,
  entryCount: 0,
  error: undefined as ErrorCode | undefined
})
export const initialQuery = () => ({
  content: "",
  activeContent: "",
  mode: "match" as SearchMode,
  error: undefined as SearchErrorKey | undefined,
  category: "",
  attribute: "",
  searching: false
})
export const initialView = () => ({
  workspace: false,
  sourceOpen: true,
  mobileDetail: false
})
export const initialResults = () => ({
  categories: [] as CategorySummary[],
  limit: CATEGORY_PAGE_SIZE,
  selectedId: undefined as number | undefined,
  entries: [] as GeoEntry[],
  total: 0,
  page: 0,
  loading: false,
  missingTag: ""
})

export type ViewerSession = Readonly<ReturnType<typeof initialSession>>
export type ViewerQuery = Readonly<ReturnType<typeof initialQuery>>
export type ViewerView = Readonly<ReturnType<typeof initialView>>
export type ViewerResults = Readonly<{
  categories: readonly CategorySummary[]
  visibleCategories: readonly CategorySummary[]
  selected?: Readonly<CategorySummary>
  entries: readonly GeoEntry[]
  entryTotal: number
  entriesLoading: boolean
  hasMoreCategories: boolean
  hasMoreEntries: boolean
  categoryMissing: string
}>
