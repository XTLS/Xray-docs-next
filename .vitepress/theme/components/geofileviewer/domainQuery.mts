import { parseIpQuery } from "./ipSearch.mts"

export function parseDomainQuery(input: string): string | undefined {
  const value = input.trim()
  // Parse a bare hostname, never silently accept URL paths, ports or credentials.
  if (!value || /[\s/:?#@\\%\[\]\u0000-\u0020\u007f]/u.test(value))
    return undefined
  try {
    const domain = new URL("http://" + value).hostname
      .toLowerCase()
      .replace(/\.$/, "")
    if (
      domain.length > 253 ||
      parseIpQuery(domain) ||
      !domain
        .split(".")
        .every((label) =>
          /^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/.test(label)
        )
    )
      return undefined
    return domain
  } catch {
    return undefined
  }
}
