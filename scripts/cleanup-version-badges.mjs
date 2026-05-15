import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const args = process.argv.slice(2)

function readArg(name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  return args[index + 1] ?? null
}

function hasFlag(name) {
  return args.includes(name)
}

const docsDir = path.resolve(ROOT, readArg("--docs") ?? "docs")
const latestTag = readArg("--latest") ?? process.env.XRAY_CORE_LATEST_TAG
const dryRun = hasFlag("--dry-run")

if (!latestTag) {
  console.error(
    "Missing latest tag. Use --latest v26.2.26 or set XRAY_CORE_LATEST_TAG."
  )
  process.exit(1)
}

const latestVersion = parseVersion(latestTag)
if (!latestVersion) {
  console.error(`Unsupported latest tag format: ${latestTag}`)
  process.exit(1)
}

if (!fs.existsSync(docsDir)) {
  console.error(`Docs directory does not exist: ${docsDir}`)
  process.exit(1)
}

function parseVersion(input) {
  const value = String(input).trim()
  if (!/^v\d+(?:\.\d+)+$/i.test(value)) return null
  return value
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10))
}

function compareVersions(left, right) {
  const maxLen = Math.max(left.length, right.length)
  for (let i = 0; i < maxLen; i += 1) {
    const a = left[i] ?? 0
    const b = right[i] ?? 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

function walk(dir) {
  const files = []
  for (const name of fs.readdirSync(dir)) {
    const absPath = path.join(dir, name)
    const stat = fs.statSync(absPath)
    if (stat.isDirectory()) {
      files.push(...walk(absPath))
      continue
    }
    if (absPath.endsWith(".md")) files.push(absPath)
  }
  return files
}

function cleanupLine(line, removedCount) {
  if (!removedCount) return line

  let next = line
  next = next.replace(/[ \t]{2,}/g, " ")
  next = next.replace(/\s+([,.;:!?])/g, "$1")
  next = next.replace(/[ \t]+$/g, "")
  if (!next.trim()) return ""
  return next
}

function shouldRemoveBadge(textValue) {
  const badgeVersion = parseVersion(textValue)
  if (!badgeVersion) return false
  return compareVersions(badgeVersion, latestVersion) < 0
}

function cleanupFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8")
  const eol = source.includes("\r\n") ? "\r\n" : "\n"
  const lines = source.split(/\r?\n/)
  let removed = 0

  const nextLines = lines.map((line) => {
    let removedOnLine = 0
    const nextLine = line.replace(/<badge\b([^>]*?)\/>/gi, (full, attrs) => {
      const match = attrs.match(/\btext\s*=\s*(['"])(.*?)\1/i)
      const textValue = match?.[2]?.trim()
      if (!textValue || !shouldRemoveBadge(textValue)) return full
      removed += 1
      removedOnLine += 1
      return ""
    })
    return cleanupLine(nextLine, removedOnLine)
  })

  if (!removed) {
    return { changed: false, removed: 0 }
  }

  const nextSource = nextLines.join(eol)
  if (!dryRun) {
    fs.writeFileSync(filePath, nextSource, "utf8")
  }

  return { changed: nextSource !== source, removed }
}

const files = walk(docsDir)
const changedFiles = []
let removedBadges = 0

for (const filePath of files) {
  const result = cleanupFile(filePath)
  if (!result.changed) continue
  removedBadges += result.removed
  changedFiles.push(path.relative(ROOT, filePath).replaceAll("\\", "/"))
}

console.log(`Latest Xray-core tag: ${latestTag}`)
console.log(`Removed stale version badges: ${removedBadges}`)
console.log(`Changed files: ${changedFiles.length}`)

for (const file of changedFiles) {
  console.log(`- ${file}`)
}
