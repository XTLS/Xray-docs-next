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
test("four Xray datasets use the correct jsDelivr release paths and types", () => {
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
    assert.equal(preset.mode, "remote")
    if (preset.mode !== "remote") throw Error()
    assert.equal(
      preset.url,
      `https://cdn.jsdelivr.net/gh/XTLS/Xray-rules-dat@release/${presets[index].path}.gz`
    )
  }
})

test("Xray gzip loads from jsDelivr and falls back to raw for HTTP, network, stream and gzip failures", async () => {
  for (let index = 0; index < presets.length; index++) {
    for (const failure of ["none", "http", "network", "stream", "gzip"]) {
      const requests: string[] = []
      const progress: LoadProgress[] = []
      const result = await readSource(
        presetSource(index),
        signal(),
        (p) => progress.push(p),
        {
          fetch: async (url, init) => {
            requests.push(String(url))
            assert.equal(init?.credentials, "omit")
            assert.equal(init?.referrerPolicy, "no-referrer")
            if (requests.length === 1) {
              if (failure === "http")
                return new Response("unavailable", { status: 503 })
              if (failure === "network")
                throw new TypeError("Failed to fetch")
              if (failure === "stream")
                return new Response(
                  new ReadableStream({
                    start(controller) {
                      controller.enqueue(Uint8Array.from([31, 139]))
                    },
                    pull(controller) {
                      controller.error(new TypeError("Connection lost"))
                    }
                  })
                )
              if (failure === "gzip")
                return new Response(Uint8Array.from([31, 139, 1]))
            }
            return new Response(gzipSync(bytes))
          }
        }
      )
      assert.deepEqual(result, bytes)
      assert.deepEqual(requests, [
        `https://cdn.jsdelivr.net/gh/XTLS/Xray-rules-dat@release/${presets[index].path}.gz`,
        ...(failure === "none"
          ? []
          : [
              `https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/${presets[index].path}.gz`
            ])
      ])
      assert.equal(
        progress.filter((p) => p.phase === "download" && p.bytes === 0)
          .length,
        requests.length
      )
    }
  }
})

test("Xray data fallback is attempted once, reports its final failure and never applies to custom URLs", async () => {
  for (const source of [
    presetSource(0),
    {
      ...remote,
      url: "https://cdn.jsdelivr.net/gh/XTLS/Xray-rules-dat@release/geosite/geosite.dat.gz"
    }
  ]) {
    let requests = 0
    await assert.rejects(
      readSource(source, signal(), () => {}, {
        fetch: async () => {
          if (++requests === 1) throw new TypeError("Failed to fetch")
          return new Response("missing", { status: 404 })
        }
      }),
      "preset" in source ? /downloadFailed/ : /networkFailed/
    )
    assert.equal(requests, "preset" in source ? 2 : 1)
  }
})

test("cancellation during either Xray data download never starts another attempt", async () => {
  for (const cancelAt of [1, 2]) {
    const abort = new AbortController()
    let requests = 0
    await assert.rejects(
      readSource(presetSource(0), abort.signal, () => {}, {
        fetch: async () => {
          if (++requests === cancelAt) {
            abort.abort()
            throw abort.signal.reason
          }
          return new Response("unavailable", { status: 503 })
        }
      }),
      (error) =>
        error instanceof DOMException && error.name === "AbortError"
    )
    assert.equal(requests, cancelAt)
  }
})
test("only credential-free HTTPS GitHub raw and jsDelivr GitHub URLs can load automatically", () => {
  for (const url of [
    "https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/geosite/geosite.dat.gz",
    "https://raw.githubusercontent.com/v2fly/geoip/release/geoip.dat",
    "https://raw.githubusercontent.com/Loyalsoldier/v2ray-rules-dat/release/geosite.dat",
    "https://raw.githubusercontent.com/other/repo/main/data.dat?version=2",
    "https://RAW.GITHUBUSERCONTENT.COM:443/other/repo/main/data.dat",
    "https://cdn.jsdelivr.net/gh/XTLS/Xray-rules-dat@release/geosite/geosite.dat.gz",
    "https://cdn.jsdelivr.net/gh/other/repo@main/data.dat?version=2",
    "https://CDN.JSDELIVR.NET:443/gh/other/repo/data.dat"
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
    "http://cdn.jsdelivr.net/gh/other/repo/data.dat",
    "https://cdn.jsdelivr.net:8443/gh/other/repo/data.dat",
    "https://cdn.jsdelivr.net.example.com/gh/other/repo/data.dat",
    "https://cdn.jsdelivr.net@localhost/gh/other/repo/data.dat",
    "https://user:pass@cdn.jsdelivr.net/gh/other/repo/data.dat",
    "https://cdn.jsdelivr.net/",
    "https://cdn.jsdelivr.net/gh",
    "https://cdn.jsdelivr.net/gh-other/repo/data.dat",
    "https://cdn.jsdelivr.net/npm/other/data.dat",
    "https://cdn.jsdelivr.net/npm/data.dat?path=/gh/other/repo",
    "https://cdn.jsdelivr.net/gh/../npm/data.dat",
    "https://example.com/gh/cdn.jsdelivr.net/data.dat",
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
  for (let index = 0; index < presets.length; index++) {
    const requests: string[] = []
    assert.deepEqual(
      await readSource(presetSource(index), signal(), () => {}, {
        decompress: null,
        fetch: async (url) => {
          requests.push(String(url))
          return new Response(bytes)
        }
      }),
      bytes
    )
    assert.deepEqual(requests, [
      `https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/${presets[index].path}`
    ])
  }
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
