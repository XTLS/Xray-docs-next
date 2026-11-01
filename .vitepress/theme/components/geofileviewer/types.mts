export type GeoKind = "geoip" | "geosite"
export type SearchMode = "match" | "rules"

export type ErrorCode =
  | "emptyFile"
  | "invalidFile"
  | "readFailed"
  | "workerFailed"
  | "invalidUrl"
  | "downloadFailed"
  | "networkFailed"
  | "gzipUnsupported"

export class ViewerError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode) {
    super(code)
    this.code = code
  }
}

export type Attribute = { key: string; value?: string }
export type AttributeSummary = { key: string; count: number }
export type GeoEntry = {
  type: "keyword" | "regexp" | "domain" | "full" | "IPv4" | "IPv6"
  value: string
  attributes: Attribute[]
}

export type CategorySummary = {
  id: number
  code: string
  count: number
  matches: number
  reverseMatch: boolean
  attributes: AttributeSummary[]
}

export type WorkerRequest =
  | { type: "load"; source: import("./sources.mts").InputSource }
  | { type: "cancelEntries" }
  | {
      type: "search"
      id: number
      contentQuery: string
      mode: SearchMode
    }
  | {
      type: "entries"
      id: number
      searchId: number
      categoryId: number
      page: number
      attributeKey?: string
    }

export type WorkerResponse =
  | ({ type: "progress" } & import("./sources.mts").LoadProgress)
  | { type: "ready"; categoryCount: number; entryCount: number }
  | { type: "search"; id: number; categories: CategorySummary[] }
  | {
      type: "entries"
      id: number
      entries: GeoEntry[]
      total: number
      page: number
    }
  | { type: "error"; code: ErrorCode }

export const CATEGORY_PAGE_SIZE = 25
export const ENTRY_PAGE_SIZE = 100
