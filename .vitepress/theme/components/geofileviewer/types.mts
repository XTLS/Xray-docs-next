export type GeoKind = "geoip" | "geosite"

export type ErrorCode =
  | "emptyFile"
  | "invalidFile"
  | "readFailed"
  | "workerFailed"

export class ViewerError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode) {
    super(code)
    this.code = code
  }
}

export type Attribute = { key: string; value?: string }
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
}

export type WorkerRequest =
  | { type: "load"; buffer: ArrayBuffer; kind: GeoKind }
  | { type: "search"; id: number; query: string }
  | {
      type: "entries"
      id: number
      searchId: number
      categoryId: number
      page: number
    }

export type WorkerResponse =
  | { type: "progress"; progress: number }
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
