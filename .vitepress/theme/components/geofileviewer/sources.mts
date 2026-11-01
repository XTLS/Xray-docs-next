import { ViewerError, type GeoKind } from "./types.mts"

export const presets = [
  { file: "geoip-lite.dat", path: "geoip/geoip-lite.dat", kind: "geoip" },
  { file: "geoip-full.dat", path: "geoip/geoip-full.dat", kind: "geoip" },
  { file: "geosite.dat", path: "geosite/geosite.dat", kind: "geosite" },
  {
    file: "geosite-expand.dat",
    path: "geosite/geosite-expand.dat",
    kind: "geosite"
  }
] as const
export type PresetFile = (typeof presets)[number]["file"]
export type InputSource = { name: string; kind: GeoKind } & (
  | { mode: "local"; file: Blob }
  | { mode: "remote"; url: string; preset?: PresetFile }
)
export type LoadProgress = {
  phase: "read" | "download" | "decompress" | "index"
  progress?: number
  bytes?: number
}

export function presetSource(index: number): InputSource {
  const preset = presets[index]
  if (!preset) throw new ViewerError("invalidUrl")
  return {
    mode: "remote",
    name: preset.file,
    kind: preset.kind,
    preset: preset.file,
    url: `https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/${preset.path}.gz`
  }
}

export function validateUrl(value: string): string {
  try {
    const url = new URL(value.trim())
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error()
    return url.href
  } catch {
    throw new ViewerError("invalidUrl")
  }
}

export function canAutoLoadUrl(value: string): boolean {
  try {
    return (
      new URL(validateUrl(value)).origin ===
      "https://raw.githubusercontent.com"
    )
  } catch {
    return false
  }
}

export async function readSource(
  source: InputSource,
  signal: AbortSignal,
  report: (progress: LoadProgress) => void,
  options: {
    fetch?: typeof fetch
    decompress?: typeof DecompressionStream | null
  } = {}
): Promise<Uint8Array> {
  const decompress =
    options.decompress === undefined
      ? globalThis.DecompressionStream
      : options.decompress
  let bytes: Uint8Array<ArrayBuffer>
  signal.throwIfAborted()
  if (source.mode === "local") {
    report({ phase: "read" })
    try {
      bytes = new Uint8Array(await source.file.arrayBuffer())
    } catch {
      throw new ViewerError("readFailed")
    }
  } else {
    let url = validateUrl(source.url)
    if (source.preset && !decompress) url = url.replace(/\.gz$/, "")
    report({ phase: "download", bytes: 0 })
    try {
      const response = await (options.fetch ?? fetch)(url, {
        signal,
        credentials: "omit",
        referrerPolicy: "no-referrer"
      })
      if (!response.ok) throw new ViewerError("downloadFailed")
      const length = Number(response.headers.get("content-length"))
      const reader = response.body?.getReader()
      if (!reader) bytes = new Uint8Array(await response.arrayBuffer())
      else {
        const chunks: Uint8Array[] = []
        let received = 0
        let lastReport = 0
        try {
          while (true) {
            signal.throwIfAborted()
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            received += value.length
            if (Date.now() - lastReport > 50) {
              report({
                phase: "download",
                bytes: received,
                progress:
                  length > 0 ? Math.min(1, received / length) : undefined
              })
              lastReport = Date.now()
            }
          }
        } catch (error) {
          await reader.cancel().catch(() => {})
          throw error
        } finally {
          reader.releaseLock()
        }
        bytes = new Uint8Array(received)
        let offset = 0
        for (const chunk of chunks) {
          bytes.set(chunk, offset)
          offset += chunk.length
        }
        report({ phase: "download", bytes: received, progress: 1 })
      }
    } catch (error) {
      if (signal.aborted) throw signal.reason
      if (error instanceof ViewerError) throw error
      throw new ViewerError("networkFailed")
    }
  }
  signal.throwIfAborted()
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    if (!decompress) throw new ViewerError("gzipUnsupported")
    report({ phase: "decompress" })
    try {
      bytes = new Uint8Array(
        await new Response(
          new Blob([bytes]).stream().pipeThrough(new decompress("gzip"))
        ).arrayBuffer()
      )
    } catch {
      throw new ViewerError("invalidFile")
    }
  }
  signal.throwIfAborted()
  return bytes
}
