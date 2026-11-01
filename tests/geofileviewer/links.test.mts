import { test } from "node:test"
import assert from "node:assert/strict"
import {
  categoryLink,
  remoteCategoryLink,
  parsePermalink,
  viewerPopupTarget
} from "../../.vitepress/theme/components/geofileviewer/links.mts"

test("in-site viewer links resolve to popup targets with locale, base and query preserved", () => {
  const target = viewerPopupTarget(
    "../tools/geofileviewer.html?file=geosite.dat&tag=google",
    "https://example.com/en/config/routing.html#domain"
  )!
  assert.equal(
    target.href,
    "https://example.com/en/tools/geofileviewer.html?file=geosite.dat&tag=google"
  )
  assert.equal(
    viewerPopupTarget(
      "/tools/geofileviewer.html",
      "https://example.com/config/geodata.html"
    )?.search,
    ""
  )
  assert.equal(
    viewerPopupTarget(
      "/docs/ru/tools/geofileviewer",
      "https://example.com/docs/ru/config/routing.html",
      "/docs/"
    )?.pathname,
    "/docs/ru/tools/geofileviewer"
  )
  const query = new URLSearchParams({
    url: "https://data.example/file.dat?version=2",
    type: "geoip",
    tag: "us"
  })
  assert.equal(
    viewerPopupTarget(
      "/tools/geofileviewer.html?" + query,
      "https://example.com/"
    )?.searchParams.get("url"),
    "https://data.example/file.dat?version=2"
  )
})

test("external links, other pages and navigation within the standalone viewer stay normal", () => {
  for (const href of [
    "https://other.example/tools/geofileviewer.html",
    "/config/routing.html",
    "/other/tools/geofileviewer.html",
    "javascript:alert(1)",
    "https://["
  ])
    assert.equal(
      viewerPopupTarget(href, "https://example.com/config/geodata.html"),
      undefined
    )
  assert.equal(
    viewerPopupTarget(
      "/tools/geofileviewer.html",
      "https://example.com/tools/geofileviewer.html?file=geosite.dat"
    ),
    undefined
  )
  assert.equal(
    viewerPopupTarget(
      "/en/tools/geofileviewer.html?file=geoip-full.dat",
      "https://example.com/ru/tools/geofileviewer.html"
    ),
    undefined
  )
  assert.equal(
    viewerPopupTarget(
      "/tools/geofileviewer.html",
      "https://example.com/docs/config/routing.html",
      "/docs/"
    ),
    undefined
  )
})

test("file parameters select official presets; custom sources use the URL parameter", () => {
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

test("URL links preserve query strings, explicit type and category", () => {
  const source = "https://example.com/us.dat?version=2&token=a%2Bb"
  const params = new URLSearchParams({
    url: source,
    type: "GeoIP",
    tag: "uS"
  })
  const parsed = parsePermalink("?" + params)
  assert.equal(parsed.invalid, false)
  assert.equal(parsed.url, source)
  assert.equal(parsed.kind, "geoip")
  assert.equal(parsed.tag, "uS")
  assert.equal(parsed.file, undefined)
  assert.equal(
    parsePermalink(
      "?url=" + encodeURIComponent("https://example.com/geoip.dat.gz")
    ).kind,
    "geoip"
  )
  assert.equal(
    parsePermalink(
      "?url=" + encodeURIComponent("https://example.com/regions.dat")
    ).kind,
    "geosite"
  )
  assert.equal(parsePermalink("?file=geosite.dat&" + params).url, source)
})

test("malformed URL sources and unsupported types do not produce loadable links", () => {
  for (const source of [
    "",
    "not-a-url",
    "javascript:alert(1)",
    "file:///test.dat",
    "https://user:pass@example.com/file.dat"
  ])
    assert.equal(
      parsePermalink("?url=" + encodeURIComponent(source)).invalid,
      true
    )
  for (const type of ["", "other", "mmdb"])
    assert.equal(
      parsePermalink(
        "?url=https%3A%2F%2Fexample.com%2Ffile.dat&type=" + type
      ).invalid,
      true
    )
})

test("URL category links retain locale paths and round trip nested URL parameters", () => {
  const source = "https://example.com/a.dat?version=2&token=a%2Bb#data"
  const link = remoteCategoryLink(
    "https://example.org/base/ru/tools/geofileviewer.html?file=geosite.dat#old",
    source,
    "geoip",
    "US"
  )
  const url = new URL(link)
  assert.equal(url.pathname, "/base/ru/tools/geofileviewer.html")
  assert.equal(url.hash, "")
  assert.equal(url.searchParams.has("file"), false)
  assert.equal(url.searchParams.get("url"), source)
  assert.equal(url.searchParams.get("type"), "geoip")
  assert.equal(url.searchParams.get("tag"), "us")
  assert.equal(parsePermalink(url.search).url, source)
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
