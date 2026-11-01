import { ViewerError } from "./types.mts"

const decimal = Array.from({ length: 256 }, (_, value) => String(value))

// Share the display representation with prefix lookup, but stop generating
// text as soon as the query is matched or a character differs.
function* cidrParts(
  bytes: Uint8Array,
  offset: number,
  size: number,
  prefix: number
) {
  if (size === 4) {
    for (let i = 0; i < 4; i++) {
      if (i) yield "."
      yield decimal[bytes[offset + i]]
    }
  } else {
    let bestStart = -1
    let bestLength = 1
    for (let i = 0; i < 8; ) {
      if (bytes[offset + i * 2] || bytes[offset + i * 2 + 1]) {
        i++
        continue
      }
      const start = i++
      while (i < 8 && !bytes[offset + i * 2] && !bytes[offset + i * 2 + 1])
        i++
      if (i - start > bestLength) {
        bestStart = start
        bestLength = i - start
      }
    }
    for (let i = 0; i < 8; ) {
      if (i === bestStart) {
        yield "::"
        i += bestLength
      } else {
        if (i > 0 && i !== bestStart + bestLength) yield ":"
        yield (
          (bytes[offset + i * 2] << 8) |
          bytes[offset + i * 2 + 1]
        ).toString(16)
        i++
      }
    }
  }
  yield "/"
  yield decimal[prefix]
}

export function formatCIDR(ip: Uint8Array, prefix: number): string {
  if (
    ![4, 16].includes(ip.length) ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > ip.length * 8
  )
    throw new ViewerError("invalidFile")
  return [...cidrParts(ip, 0, ip.length, prefix)].join("")
}

function matchesPrefix(
  bytes: Uint8Array,
  offset: number,
  size: number,
  prefix: number,
  needle: string
) {
  const firstWord = (bytes[offset] << 8) | bytes[offset + 1]
  const first =
    size === 4
      ? decimal[bytes[offset]]
      : firstWord
        ? firstWord.toString(16)
        : undefined
  if (first && !first.startsWith(needle) && !needle.startsWith(first))
    return false
  let position = 0
  for (const part of cidrParts(bytes, offset, size, prefix)) {
    for (let i = 0; i < part.length; i++) {
      if (part[i] !== needle[position++]) return false
      if (position === needle.length) return true
    }
  }
  return false
}

export type IpQuery = {
  address: Uint8Array
}

function parseIPv4(value: string): number[] | undefined {
  const parts = value.split(".")
  if (
    parts.length !== 4 ||
    parts.some((part) => !/^(?:0|[1-9]\d{0,2})$/.test(part) || +part > 255)
  )
    return
  return parts.map(Number)
}

function parseAddress(value: string): Uint8Array | undefined {
  if (!value.includes(":")) {
    const bytes = parseIPv4(value)
    return bytes && Uint8Array.from(bytes)
  }
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":")
    const tail = parseIPv4(value.slice(lastColon + 1))
    if (!tail) return
    value =
      value.slice(0, lastColon + 1) +
      ((tail[0] << 8) | tail[1]).toString(16) +
      ":" +
      ((tail[2] << 8) | tail[3]).toString(16)
  }
  const halves = value.split("::")
  if (halves.length > 2) return
  const left = halves[0] ? halves[0].split(":") : []
  const right = halves[1] ? halves[1].split(":") : []
  const count = left.length + right.length
  if (
    [...left, ...right].some((part) => !/^[\da-f]{1,4}$/i.test(part)) ||
    (halves.length === 1 ? count !== 8 : count >= 8)
  )
    return
  const words = [
    ...left.map((part) => parseInt(part, 16)),
    ...Array(8 - count).fill(0),
    ...right.map((part) => parseInt(part, 16))
  ]
  return Uint8Array.from(words.flatMap((word) => [word >> 8, word & 255]))
}

export function parseIpQuery(value: string): IpQuery | undefined {
  if (value.includes("/")) return
  const address = parseAddress(value.trim())
  if (address) return { address }
}

function compareAddress(
  left: Uint8Array,
  leftOffset: number,
  right: Uint8Array,
  rightOffset: number,
  prefix: number
) {
  const whole = prefix >>> 3
  for (let i = 0; i < whole; i++) {
    const difference = left[leftOffset + i] - right[rightOffset + i]
    if (difference) return difference
  }
  const bits = prefix & 7
  const mask = (255 << (8 - bits)) & 255
  return bits
    ? (left[leftOffset + whole] & mask) -
        (right[rightOffset + whole] & mask)
    : 0
}

type PrefixGroup = {
  size: number
  prefix: number
  entries: Uint32Array
}

// Each fixed-prefix group is ordered by the numeric address. Keep byte offsets
// into the DAT instead of copying every IPv4/IPv6 address into another buffer.
export class IpIndex {
  private bytes: Uint8Array
  private addresses: Uint32Array
  private keys: Uint8Array | undefined
  private groups: PrefixGroup[] = []

  constructor(bytes: Uint8Array, count: number) {
    this.bytes = bytes
    this.addresses = new Uint32Array(count)
    this.keys = new Uint8Array(count)
  }

  add(index: number, address: Uint8Array, prefix: number) {
    this.addresses[index] = address.byteOffset - this.bytes.byteOffset
    this.keys![index] = prefix + (address.length === 4 ? 0 : 33)
  }

  finish() {
    const keys = this.keys!
    const counts = new Uint32Array(162)
    for (const key of keys) counts[key]++
    const groups = Array.from(counts, (count, key) => ({
      size: key < 33 ? 4 : 16,
      prefix: key < 33 ? key : key - 33,
      entries: new Uint32Array(count)
    }))
    counts.fill(0)
    for (let i = 0; i < keys.length; i++)
      groups[keys[i]].entries[counts[keys[i]]++] = i
    this.groups = groups.filter((group) => group.entries.length)
    for (const group of this.groups)
      group.entries.sort(
        (a, b) =>
          compareAddress(
            this.bytes,
            this.addresses[a],
            this.bytes,
            this.addresses[b],
            group.size * 8
          ) || a - b
      )
    this.keys = undefined
  }

  search(query: IpQuery): Uint32Array | null {
    const slices: Uint32Array[] = []
    let count = 0
    for (const group of this.groups) {
      if (group.size !== query.address.length) continue
      const bound = (after: boolean) => {
        let low = 0
        let high = group.entries.length
        while (low < high) {
          const middle = (low + high) >>> 1
          const difference = compareAddress(
            this.bytes,
            this.addresses[group.entries[middle]],
            query.address,
            0,
            group.prefix
          )
          if (difference < 0 || (after && difference === 0))
            low = middle + 1
          else high = middle
        }
        return low
      }
      const start = bound(false)
      const end = bound(true)
      if (end > start) {
        slices.push(group.entries.subarray(start, end))
        count += end - start
      }
    }
    if (count && count === this.addresses.length) return null
    const matches = new Uint32Array(count)
    let offset = 0
    for (const slice of slices) {
      matches.set(slice, offset)
      offset += slice.length
    }
    return matches.sort()
  }

  async searchPrefix(
    needle: string,
    cancelled: () => boolean
  ): Promise<Uint32Array | null | undefined> {
    const matching: number[] = []
    let checked = 0
    let lastYield = Date.now()
    for (const group of this.groups) {
      for (const index of group.entries) {
        if (
          matchesPrefix(
            this.bytes,
            this.addresses[index],
            group.size,
            group.prefix,
            needle
          )
        )
          matching.push(index)
        if (++checked % 2048 === 0 && Date.now() - lastYield > 16) {
          await new Promise((resolve) => setTimeout(resolve, 0))
          if (cancelled()) return
          lastYield = Date.now()
        }
      }
    }
    if (cancelled()) return
    return matching.length === this.addresses.length && matching.length
      ? null
      : Uint32Array.from(matching).sort()
  }
}
