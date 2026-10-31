import { test } from "node:test"
import assert from "node:assert/strict"
import {
  categoryLink,
  parsePermalink
} from "../../.vitepress/theme/components/geofileviewer/links.mts"

test("links allow only the four official presets and never arbitrary URLs", () => {
  assert.equal(parsePermalink("").invalid, false)
  assert.equal(parsePermalink("?tag=us").file, undefined)
  for (const file of [
    "geoip-lite.dat",
    "geoip-full.dat",
    "geosite.dat",
    "geosite-expand.dat"
  ])
    assert.equal(parsePermalink("?file=" + file).file, file)
  for (const file of [
    "https://example.com/file.dat",
    "../geosite.dat",
    "unknown.dat",
    ""
  ])
    assert.equal(
      parsePermalink("?file=" + encodeURIComponent(file)).invalid,
      true
    )
  assert.equal(
    parsePermalink("?file=geosite.dat&tag=GoOgLe").tag,
    "GoOgLe"
  )
})
test("category links retain locale/base paths and encode literal category names", () => {
  const link = categoryLink(
    "https://example.com/base/ru/tools/geofileviewer.html?url=private#old",
    "geosite.dat",
    "category-!cn"
  )
  const url = new URL(link)
  assert.equal(url.pathname, "/base/ru/tools/geofileviewer.html")
  assert.equal(url.hash, "")
  assert.equal(url.searchParams.has("url"), false)
  assert.equal(url.searchParams.get("tag"), "category-!cn")
  assert.equal(parsePermalink(url.search).file, "geosite.dat")
})
