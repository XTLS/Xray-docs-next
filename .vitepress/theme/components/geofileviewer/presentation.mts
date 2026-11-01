export function highlightParts(
  value: string,
  query: string,
  mode: "contains" | "prefix" | "whole" = "contains"
) {
  const needle = query.trim().toLowerCase()
  if (!needle) return [{ text: value, match: false }]
  if (mode === "whole") return [{ text: value, match: true }]
  const lower = value.toLowerCase()
  const parts: { text: string; match: boolean }[] = []
  if (mode === "prefix") {
    if (!lower.startsWith(needle)) return [{ text: value, match: false }]
    parts.push({ text: value.slice(0, needle.length), match: true })
    if (needle.length < value.length)
      parts.push({ text: value.slice(needle.length), match: false })
    return parts
  }
  let start = 0
  let index: number
  while ((index = lower.indexOf(needle, start)) >= 0) {
    if (index > start)
      parts.push({ text: value.slice(start, index), match: false })
    parts.push({
      text: value.slice(index, index + needle.length),
      match: true
    })
    start = index + needle.length
  }
  if (start < value.length)
    parts.push({ text: value.slice(start), match: false })
  return parts
}
