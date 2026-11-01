import { test } from "node:test"
import assert from "node:assert/strict"
import { gzipSync } from "node:zlib"
import {
  readSource,
  presetSource,
  presets,
  validateUrl,
  canAutoLoadUrl
} from "../../.vitepress/theme/components/geofileviewer/sources.mts"
import type {
  LoadProgress,
  InputSource
} from "../../.vitepress/theme/components/geofileviewer/sources.mts"

const signal = () => new AbortController().signal
const bytes = Uint8Array.from([10, 2, 10, 0])
const remote: InputSource = {
  mode: "remote",
  url: "https://example.com/test.dat",
  name: "test",
  kind: "geosite"
}
test("four official presets use the correct raw branch paths and types", () => {
  assert.deepEqual(
    presets.map((p) => p.file),
    [
      "geoip-lite.dat",
      "geoip-full.dat",
      "geosite.dat",
      "geosite-expand.dat"
    ]
  )
  for (let index = 0; index < 4; index++) {
    const preset = presetSource(index)
    assert.equal(preset.kind, index < 2 ? "geoip" : "geosite")
    assert.ok(
      preset.mode === "remote" &&
        preset.url.endsWith(presets[index].path + ".gz")
    )
  }
})
test("only credential-free HTTPS GitHub raw URLs can load automatically", () => {
  for (const url of [
    "https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/geosite/geosite.dat.gz",
    "https://raw.githubusercontent.com/v2fly/geoip/release/geoip.dat",
    "https://raw.githubusercontent.com/Loyalsoldier/v2ray-rules-dat/release/geosite.dat",
    "https://raw.githubusercontent.com/other/repo/main/data.dat?version=2",
    "https://RAW.GITHUBUSERCONTENT.COM:443/other/repo/main/data.dat"
  ])
    assert.equal(canAutoLoadUrl(url), true, url)
  for (const url of [
    "https://example.com/test.dat",
    "http://raw.githubusercontent.com/other/repo/main/data.dat",
    "https://raw.githubusercontent.com:8443/other/repo/main/data.dat",
    "https://raw.githubusercontent.com.example.com/test.dat",
    "https://example.com/raw.githubusercontent.com/test.dat",
    "https://raw.githubusercontent.com@example.com/test.dat",
    "https://user:pass@raw.githubusercontent.com/other/repo/main/data.dat",
    "https://github.com/v2fly/geoip/releases/latest/download/geoip.dat",
    "http://localhost/test.dat",
    "javascript:alert(1)",
    "not-a-url"
  ])
    assert.equal(canAutoLoadUrl(url), false, url)
})

test("DAT and gzip local files share the reader without network calls", async () => {
  for (const body of [bytes, gzipSync(bytes)]) {
    assert.deepEqual(
      await readSource(
        {
          mode: "local",
          file: new Blob([body]),
          kind: "geosite",
          name: "test"
        },
        signal(),
        () => {}
      ),
      bytes
    )
  }
})
test("remote progress supports known and unknown content length", async () => {
  for (const headers of [{ "content-length": String(bytes.length) }, {}]) {
    const progress: LoadProgress[] = []
    const result = await readSource(
      remote,
      signal(),
      (p) => progress.push(p),
      { fetch: async () => new Response(bytes, { headers }) }
    )
    assert.deepEqual(result, bytes)
    assert.equal(progress.at(-1)?.progress, 1)
    assert.equal(progress.at(-1)?.bytes, bytes.length)
  }
})
test("unsupported gzip falls back only for presets", async () => {
  let requested = ""
  await readSource(presetSource(0), signal(), () => {}, {
    decompress: null,
    fetch: async (url) => {
      requested = String(url)
      return new Response(bytes)
    }
  })
  assert.ok(requested.endsWith("geoip-lite.dat"))
  await assert.rejects(
    readSource(remote, signal(), () => {}, {
      decompress: null,
      fetch: async () => new Response(gzipSync(bytes))
    }),
    /gzipUnsupported/
  )
})
test("URL validation, HTTP errors, CORS/network failures and corrupt gzip", async () => {
  for (const url of [
    "javascript:alert(1)",
    "file:///test",
    "not-a-url",
    "https://user:pass@example.com/file"
  ])
    assert.throws(() => validateUrl(url), /invalidUrl/)
  assert.equal(
    validateUrl(" https://example.com/a.dat "),
    "https://example.com/a.dat"
  )
  await assert.rejects(
    readSource(remote, signal(), () => {}, {
      fetch: async () => new Response("missing", { status: 404 })
    }),
    /downloadFailed/
  )
  await assert.rejects(
    readSource(remote, signal(), () => {}, {
      fetch: async () => {
        throw new TypeError("Failed to fetch")
      }
    }),
    /networkFailed/
  )
  await assert.rejects(
    readSource(remote, signal(), () => {}, {
      fetch: async () => new Response(Uint8Array.from([31, 139, 1]))
    }),
    /invalidFile/
  )
})
test("aborted downloads preserve cancellation instead of reporting network failure", async () => {
  const abort = new AbortController()
  const promise = readSource(remote, abort.signal, () => {}, {
    fetch: async () => {
      abort.abort()
      throw abort.signal.reason
    }
  })
  await assert.rejects(
    promise,
    (error) => error instanceof DOMException && error.name === "AbortError"
  )
})
