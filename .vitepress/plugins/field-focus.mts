// .vitepress/plugins/field-focus.mts
//
// markdown-it plugin: replaces  // [!field focus]  with  // [!code focus:N]
// inside ```json fenced blocks.  N is auto-calculated by bracket-matching
// the JSON field that starts on the very next line.

const FIELD_FOCUS = /^(\s*)\/\/\s*\[!field\s+focus\]\s*$/

export function fieldFocusPlugin(md: {
  core: { ruler: { push: Function } }
}): void {
  md.core.ruler.push(
    "field_focus",
    (state: {
      tokens: { type: string; info: string; content: string }[]
    }) => {
      for (const token of state.tokens) {
        if (token.type !== "fence") continue
        if (!/^json\b/.test(token.info.trim())) continue
        token.content = rewriteFieldFocus(token.content)
      }
    }
  )
}

/** Scan a code-block string, replacing every `// [!field focus]` line. */
function rewriteFieldFocus(src: string): string {
  const lines = src.split("\n")
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const m = FIELD_FOCUS.exec(lines[i])
    if (!m) {
      out.push(lines[i])
      continue
    }
    const n = countFieldSpan(lines, i + 1)
    out.push(`${m[1]}// [!code focus:${n}]`)
  }

  return out.join("\n")
}

/**
 * Starting from `lines[start]`, find the first `{` or `[` (outside strings
 * and // comments), then count lines until the matching `}` or `]`.
 * Returns 1 when the line contains only a simple value (no bracket).
 */
function countFieldSpan(lines: string[], start: number): number {
  if (start >= lines.length) return 1

  let depth = 0
  let started = false

  for (let i = start; i < lines.length; i++) {
    const line = lines[i]
    let inStr = false
    let skip = false

    for (let j = 0; j < line.length; j++) {
      if (skip) {
        skip = false
        continue
      }

      const ch = line[j]

      if (inStr) {
        if (ch === "\\") {
          skip = true
          continue
        }
        if (ch === '"') inStr = false
        continue
      }

      if (ch === '"') {
        inStr = true
        continue
      }

      // JSONC line comment — skip rest of line
      if (ch === "/" && j + 1 < line.length && line[j + 1] === "/") break

      if (ch === "{" || ch === "[") {
        depth++
        started = true
      } else if (ch === "}" || ch === "]") {
        depth--
      }
    }

    if (started && depth <= 0) return i - start + 1
  }

  // No brackets found → simple value field, 1 line
  return started ? lines.length - start : 1
}
