import protobuf from "protobufjs/minimal.js"
import {
  ENTRY_PAGE_SIZE,
  ViewerError,
  type Attribute,
  type AttributeSummary,
  type CategorySummary,
  type GeoEntry,
  type GeoKind
} from "./types.mts"

type Reader = InstanceType<typeof protobuf.Reader>
type Category = {
  code: string
  reverseMatch: boolean
  offsets: Uint32Array
  attributes: AttributeSummary[]
}
export type SearchResult = {
  categories: CategorySummary[]
  indexes: Map<number, Uint32Array | null>
  attributeFilter?: {
    categoryId: number
    key: string
    indexes: Uint32Array
  }
}

function countAttributes(counts: Map<string, number>, entry: GeoEntry) {
  if (!entry.attributes.length) return
  for (const key of new Set(
    entry.attributes.map((attribute) => attribute.key)
  ))
    counts.set(key, (counts.get(key) ?? 0) + 1)
}

function attributeSummaries(
  counts: Map<string, number>
): AttributeSummary[] {
  return [...counts]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => ({ key, count }))
}

// Keep the protobuf bytes and offsets, rather than millions of decoded objects.
function fields(
  reader: Reader,
  end: number,
  visit: (field: number, wire: number, reader: Reader) => boolean
) {
  while (reader.pos < end) {
    const tag = reader.uint32()
    if (tag >>> 3 === 0) throw new ViewerError("invalidFile")
    if (!visit(tag >>> 3, tag & 7, reader)) reader.skipType(tag & 7)
    if (reader.pos > end) throw new ViewerError("invalidFile")
  }
  if (reader.pos !== end) throw new ViewerError("invalidFile")
}

function messageRange(reader: Reader, end: number): [number, number] {
  const size = reader.uint32()
  const start = reader.pos
  if (size > end - start) throw new ViewerError("invalidFile")
  return [start, start + size]
}

export function formatCIDR(ip: Uint8Array, prefix: number): string {
  if (ip.length === 4 && prefix <= 32) return `${ip.join(".")}/${prefix}`
  if (ip.length !== 16 || prefix > 128)
    throw new ViewerError("invalidFile")
  const parts = Array.from(
    { length: 8 },
    (_, i) => (ip[i * 2] << 8) | ip[i * 2 + 1]
  )
  let bestStart = -1
  let bestLength = 1
  for (let i = 0; i < 8;) {
    if (parts[i] !== 0) {
      i++
      continue
    }
    const start = i
    while (i < 8 && parts[i] === 0) i++
    if (i - start > bestLength) {
      bestStart = start
      bestLength = i - start
    }
  }
  const hex = parts.map((p) => p.toString(16))
  const value =
    bestStart < 0
      ? hex.join(":")
      : `${hex.slice(0, bestStart).join(":")}::${hex.slice(bestStart + bestLength).join(":")}`
  return `${value}/${prefix}`
}

function attribute(reader: Reader, end: number): Attribute {
  let key = ""
  let value: string | undefined
  fields(reader, end, (field, wire, r) => {
    if (field === 1 && wire === 2) {
      key = r.string()
      return true
    }
    if (field === 2 && wire === 0) {
      value = String(r.bool())
      return true
    }
    if (field === 3 && wire === 0) {
      value = r.int64().toString()
      return true
    }
    return false
  })
  if (!key) throw new ViewerError("invalidFile")
  return { key, value }
}

function decodeEntry(
  bytes: Uint8Array,
  start: number,
  end: number,
  kind: GeoKind
): GeoEntry {
  const reader = protobuf.Reader.create(bytes)
  reader.pos = start
  let domainType = 0
  let value = ""
  let ip: Uint8Array | undefined
  let prefix = 0
  const attributes: Attribute[] = []
  fields(reader, end, (field, wire, r) => {
    if (kind === "geosite") {
      if (field === 1 && wire === 0) {
        domainType = r.uint32()
        return true
      }
      if (field === 2 && wire === 2) {
        value = r.string()
        return true
      }
      if (field === 3 && wire === 2) {
        const [, attrEnd] = messageRange(r, end)
        attributes.push(attribute(r, attrEnd))
        return true
      }
    } else {
      if (field === 1 && wire === 2) {
        ip = r.bytes()
        return true
      }
      if (field === 2 && wire === 0) {
        prefix = r.uint32()
        return true
      }
    }
    return false
  })
  if (kind === "geoip") {
    if (!ip) throw new ViewerError("invalidFile")
    return {
      type: ip.length === 16 ? "IPv6" : "IPv4",
      value: formatCIDR(ip, prefix),
      attributes
    }
  }
  const types = ["keyword", "regexp", "domain", "full"] as const
  if (!value || !types[domainType]) throw new ViewerError("invalidFile")
  return { type: types[domainType], value, attributes }
}

export function pageBounds(total: number, page: number, size: number) {
  const lastPage = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), lastPage)
  return {
    page: current,
    start: (current - 1) * size,
    end: Math.min(current * size, total)
  }
}

export class Dataset {
  private bytes: Uint8Array
  kind: GeoKind
  private categories: Category[]
  entryCount: number
  constructor(
    bytes: Uint8Array,
    kind: GeoKind,
    categories: Category[],
    entryCount: number
  ) {
    this.bytes = bytes
    this.kind = kind
    this.categories = categories
    this.entryCount = entryCount
  }

  get categoryCount() {
    return this.categories.length
  }

  async search(
    contentQuery: string,
    cancelled: () => boolean = () => false
  ): Promise<SearchResult | null> {
    const needle = contentQuery.trim().toLowerCase()
    const result: SearchResult = { categories: [], indexes: new Map() }
    let lastYield = Date.now()
    for (let id = 0; id < this.categories.length; id++) {
      const category = this.categories[id]
      const count = category.offsets.length / 2
      let indexes: Uint32Array | null = null
      let attributes = category.attributes
      if (needle) {
        const matching: number[] = []
        const counts = new Map<string, number>()
        for (let i = 0; i < count; i++) {
          const entry = this.entry(id, i)
          if (entry.value.toLowerCase().includes(needle)) {
            matching.push(i)
            countAttributes(counts, entry)
          }
          if (i % 2048 === 0 && Date.now() - lastYield > 16) {
            await new Promise((resolve) => setTimeout(resolve, 0))
            if (cancelled()) return null
            lastYield = Date.now()
          }
        }
        if (!matching.length) continue
        indexes = Uint32Array.from(matching)
        attributes = attributeSummaries(counts)
      }
      result.indexes.set(id, indexes)
      result.categories.push({
        id,
        code: category.code,
        count,
        matches: indexes?.length ?? count,
        reverseMatch: category.reverseMatch,
        attributes
      })
      if (Date.now() - lastYield > 16) {
        await new Promise((resolve) => setTimeout(resolve, 0))
        if (cancelled()) return null
        lastYield = Date.now()
      }
    }
    return cancelled() ? null : result
  }

  private entry(id: number, index: number) {
    const offsets = this.categories[id].offsets
    return decodeEntry(
      this.bytes,
      offsets[index * 2],
      offsets[index * 2 + 1],
      this.kind
    )
  }

  async entries(
    result: SearchResult,
    id: number,
    page: number,
    attributeKey?: string,
    cancelled: () => boolean = () => false
  ) {
    if (cancelled()) return null
    const summary = result.categories.find(
      (category) => category.id === id
    )
    if (!summary) return { entries: [], total: 0, page: 1 }
    let indexes = result.indexes.get(id)
    let total = summary.matches
    if (attributeKey) {
      let filter = result.attributeFilter
      if (filter?.categoryId !== id || filter.key !== attributeKey) {
        const count =
          summary.attributes.find((a) => a.key === attributeKey)?.count ??
          0
        const matching = new Uint32Array(count)
        let found = 0
        let lastYield = Date.now()
        for (let i = 0; count && i < summary.matches; i++) {
          const index = indexes ? indexes[i] : i
          if (
            this.entry(id, index).attributes.some(
              (a) => a.key === attributeKey
            )
          )
            matching[found++] = index
          if (i % 2048 === 0 && Date.now() - lastYield > 16) {
            await new Promise((resolve) => setTimeout(resolve, 0))
            if (cancelled()) return null
            lastYield = Date.now()
          }
        }
        if (cancelled()) return null
        filter = { categoryId: id, key: attributeKey, indexes: matching }
        result.attributeFilter = filter
      }
      indexes = filter.indexes
      total = indexes.length
    } else result.attributeFilter = undefined
    const bounds = pageBounds(total, page, ENTRY_PAGE_SIZE)
    const entries: GeoEntry[] = []
    for (let i = bounds.start; i < bounds.end; i++)
      entries.push(this.entry(id, indexes ? indexes[i] : i))
    return { entries, total, page: bounds.page }
  }
}

export async function indexDataset(
  bytes: Uint8Array,
  kind: GeoKind,
  progress: (value: number) => void = () => {}
) {
  if (!bytes.length) throw new ViewerError("emptyFile")
  try {
    const categories: Category[] = []
    const reader = protobuf.Reader.create(bytes)
    let entryCount = 0
    let lastYield = Date.now()
    while (reader.pos < reader.len) {
      const tag = reader.uint32()
      if (tag >>> 3 === 0) throw new ViewerError("invalidFile")
      if (tag !== 10) {
        reader.skipType(tag & 7)
        continue
      }
      const [start, end] = messageRange(reader, reader.len)
      let code = ""
      let reverseMatch = false
      let count = 0
      fields(reader, end, (field, wire, r) => {
        if (field === 1 && wire === 2) {
          code = r.string()
          return true
        }
        if (field === 2 && wire === 2) {
          const [, finish] = messageRange(r, end)
          r.pos = finish
          count++
          return true
        }
        if (kind === "geoip" && field === 3 && wire === 0) {
          reverseMatch = r.bool()
          return true
        }
        return false
      })
      if (!code.trim()) throw new ViewerError("invalidFile")
      const offsets = new Uint32Array(count * 2)
      const counts = new Map<string, number>()
      reader.pos = start
      let index = 0
      while (reader.pos < end) {
        const entryTag = reader.uint32()
        if (entryTag === 18) {
          const [entryStart, entryEnd] = messageRange(reader, end)
          countAttributes(
            counts,
            decodeEntry(bytes, entryStart, entryEnd, kind)
          )
          offsets[index++] = entryStart
          offsets[index++] = entryEnd
          reader.pos = entryEnd
          if (index % 4096 === 0 && Date.now() - lastYield > 16) {
            progress(reader.pos / bytes.length)
            await new Promise((resolve) => setTimeout(resolve, 0))
            lastYield = Date.now()
          }
        } else reader.skipType(entryTag & 7)
        if (reader.pos > end) throw new ViewerError("invalidFile")
      }
      categories.push({
        code,
        reverseMatch,
        offsets,
        attributes: attributeSummaries(counts)
      })
      entryCount += count
    }
    if (!categories.length) throw new ViewerError("invalidFile")
    progress(1)
    return new Dataset(bytes, kind, categories, entryCount)
  } catch (error) {
    if (error instanceof ViewerError) throw error
    throw new ViewerError("invalidFile")
  }
}
