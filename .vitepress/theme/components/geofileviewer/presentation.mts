export function highlightParts(value: string, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return [{ text: value, match: false }]
  const lower = value.toLowerCase()
  const parts: { text: string; match: boolean }[] = []
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
