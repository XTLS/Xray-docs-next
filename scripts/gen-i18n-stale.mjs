import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const ROOT = process.cwd()
const DOCS_DIR = path.resolve(ROOT, "docs")
const OUT_DIR = path.resolve(ROOT, ".vitepress/.generated")
const OUT_FILE = path.join(OUT_DIR, "i18n-status.json")

const LOCALES = ["en", "ru"]

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

function gitLastCommitISO(fileAbsPath) {
  const rel = path.relative(ROOT, fileAbsPath).replaceAll("\\", "/")
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${rel}"`, {
      encoding: "utf8"
    }).trim()
    return iso || null
  } catch {
    return null
  }
}

function toRouteFromDocsRel(relToDocs) {
  let route = "/" + relToDocs.replace(/\.md$/, "")
  route = route.replace(/\/index$/, "/")
  return route
}

function ensureEmptyPlaceholder(locale, relNoLocale) {
  const tAbs = path.join(DOCS_DIR, locale, relNoLocale) // docs/en/xxx.md
  if (fs.existsSync(tAbs)) return

  fs.mkdirSync(path.dirname(tAbs), { recursive: true })
  fs.writeFileSync(tAbs, "", "utf8")
}

const zhFiles = walk(DOCS_DIR).filter((p) => {
  const rel = path.relative(DOCS_DIR, p).replaceAll("\\", "/")
  return !LOCALES.some((l) => rel.startsWith(l + "/"))
})

const zhByRel = new Map() // relToDocs -> abs
for (const abs of zhFiles) {
  const relToDocs = path.relative(DOCS_DIR, abs).replaceAll("\\", "/")
  zhByRel.set(relToDocs, abs)
}

const data = {}
for (const locale of LOCALES) {
  const localeDir = path.join(DOCS_DIR, locale)
  if (!fs.existsSync(localeDir)) continue

  const tFiles = walk(localeDir)
  for (const tAbs of tFiles) {
    const relToDocs = path.relative(DOCS_DIR, tAbs).replaceAll("\\", "/") // en/config/log.md
    const relNoLocale = relToDocs.replace(new RegExp(`^${locale}/`), "") // config/log.md
    const zhAbs = zhByRel.get(relNoLocale)

    const tRoute = toRouteFromDocsRel(relToDocs) // /en/config/log
    const zhRoute = toRouteFromDocsRel(relNoLocale) // /config/log

    const tISO = gitLastCommitISO(tAbs)
    const zhISO = zhAbs ? gitLastCommitISO(zhAbs) : null

    const stale =
      Boolean(zhISO && tISO) &&
      new Date(tISO).getTime() < new Date(zhISO).getTime()

    data[tRoute] = {
      locale,
      zhRoute,
      translated: true,
      stale,
      tLastUpdated: tISO,
      zhLastUpdated: zhISO
    }
  }
}

for (const [zhRel, zhAbs] of zhByRel.entries()) {
  const zhRoute = toRouteFromDocsRel(zhRel)
  const zhISO = gitLastCommitISO(zhAbs)

  for (const locale of LOCALES) {
    const tRoute = "/" + locale + (zhRoute === "/" ? "/" : zhRoute)
    if (!data[tRoute]) {
      data[tRoute] = {
        locale,
        zhRoute,
        translated: false,
        stale: true,
        tLastUpdated: null,
        zhLastUpdated: zhISO
      }
      ensureEmptyPlaceholder(locale, zhRel)
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8")
console.log(`Generated i18n status -> ${OUT_FILE}`)
