import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const ROOT = process.cwd()
const DOCS_DIR = path.resolve(ROOT, "docs")
const OUT_DIR = path.resolve(ROOT, ".vitepress/.generated")
const OUT_FILE = path.join(OUT_DIR, "contributors.json")

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (p.endsWith(".md")) out.push(p)
  }
  return out
}

function md5(s) {
  return crypto
    .createHash("md5")
    .update(s.trim().toLowerCase())
    .digest("hex")
}

function parseGithubUsernameFromNoreply(email = "") {
  // 1) 12345+username@users.noreply.github.com
  // 2) username@users.noreply.github.com
  const m1 = email.match(/^[^+]+\+([^@]+)@users\.noreply\.github\.com$/i)
  if (m1?.[1]) return m1[1]
  const m2 = email.match(/^([^@]+)@users\.noreply\.github\.com$/i)
  if (m2?.[1]) return m2[1]
  return null
}

function avatarUrlFor(email = "") {
  const gh = parseGithubUsernameFromNoreply(email)
  if (gh) {
    return `https://unavatar.io/github/${encodeURIComponent(gh)}`
  }
  if (email) {
    return `https://www.gravatar.com/avatar/${md5(email)}?d=identicon&s=64`
  }
  return `https://www.gravatar.com/avatar/?d=identicon&s=64`
}

function gitContributors(fileAbsPath) {
  const rel = path
    .relative(process.cwd(), fileAbsPath)
    .replaceAll("\\", "/")
  let raw = ""
  try {
    raw = execSync(`git log --follow --format="%aN|%aE" -- "${rel}"`, {
      encoding: "utf8"
    })
  } catch {
    return []
  }

  const map = new Map()
  raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [name, email] = line.split("|")
      const key = (email || name || "").toLowerCase()
      if (!map.has(key)) {
        const github = parseGithubUsernameFromNoreply(email)
        map.set(key, {
          name,
          email,
          github,
          avatarUrl: avatarUrlFor(email),
          commits: 0
        })
      }
      map.get(key).commits += 1
    })

  return [...map.values()].sort((a, b) => b.commits - a.commits)
}

const files = walk(DOCS_DIR)
const data = {}

for (const abs of files) {
  const relToDocs = path.relative(DOCS_DIR, abs).replaceAll("\\", "/")
  let route = "/" + relToDocs.replace(/\.md$/, "")
  route = route.replace(/\/index$/, "/") // docs/a/index.md -> /a/
  data[route] = gitContributors(abs)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8")
console.log(
  `Generated contributors for ${files.length} pages -> ${OUT_FILE}`
)
