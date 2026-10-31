import { test } from "node:test"
import assert from "node:assert/strict"
import { gzipSync } from "node:zlib"
import {
  readSource,
  presetSource,
  presets,
  validateUrl
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
