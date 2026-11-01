import { RE2JS } from "re2js"
import type { GeoEntry } from "./types.mts"

// Only regexes are retained. Ordinary entries stay in the DAT bytes, avoiding
// a second object/string index for millions of domains in large files.
export class DomainMatcher {
  private regexes = new Map<string, RE2JS | null>()

  matches(entry: GeoEntry, domain: string) {
    if (entry.type === "regexp") {
      let regex = this.regexes.get(entry.value)
      if (regex === undefined) {
        try {
          regex = RE2JS.compile(entry.value)
        } catch {
          // Xray also skips invalid GeoSite regexes; keep them browsable.
          regex = null
        }
        this.regexes.set(entry.value, regex)
      }
      return regex?.test(domain) ?? false
    }
    const pattern = entry.value.toLowerCase()
    switch (entry.type) {
      case "keyword":
        return domain.includes(pattern)
      case "domain":
        return domain === pattern || domain.endsWith("." + pattern)
      case "full":
        return domain === pattern
      default:
        return false
    }
  }
}
