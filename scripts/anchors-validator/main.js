import fs from 'fs'
import path from 'path'

function slugify(str) {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'""''–—<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()
}

function calculateLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
    }
  }

  return matrix[b.length][a.length]
}

function extractLeadingNumber(anchor) {
  const match = anchor.match(/^_?(\d+)-/)
  return match ? match[1] : null
}

function removeUnderscorePrefix(anchor) {
  return anchor.replace(/^_+/, '')
}

function walkDirectory(dir) {
  const files = []

  try {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        files.push(...walkDirectory(fullPath))
      } else if (file.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message)
  }

  return files
}

function extractHeaderAnchors(text) {
  const lines = text.split('\n')
  const headers = []

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.*)$/)
    if (match) {
      const headerText = match[2].trim()
      headers.push({
        anchor: slugify(headerText),
        line: i + 1,
        text: headerText
      })
    }
  }

  return headers
}

function extractAnchorLinks(text) {
  const lines = text.split('\n')
  const anchors = []

  for (let i = 0; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(/\]\(#([^)]+)\)/g)]
    for (const match of matches) {
      anchors.push({
        anchor: match[1],
        line: i + 1,
        text: lines[i].trim()
      })
    }
  }

  return anchors
}

function isNormalizedMatch(anchor, header) {
  const normalizedAnchor = removeUnderscorePrefix(anchor)
  const normalizedHeader = removeUnderscorePrefix(header)
  return normalizedAnchor === normalizedHeader || header.includes(anchor) || anchor.includes(header)
}

function filterByLeadingNumber(headers, anchorNumber) {
  if (!anchorNumber) return headers
  return headers.filter(h => extractLeadingNumber(h.anchor) === anchorNumber)
}

function findByNormalizedMatch(anchor, headers) {
  return headers.filter(h => isNormalizedMatch(anchor, h.anchor))
}

function findBySimilarity(anchor, headers, maxDistance) {
  return headers
    .map(h => ({ header: h, distance: calculateLevenshteinDistance(anchor, h.anchor) }))
    .filter(item => item.distance > 0 && item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2)
    .map(item => item.header)
}

function findByProximity(headers, anchorLine, anchorNumber) {
  return headers
    .filter(h => !anchorNumber || extractLeadingNumber(h.anchor) === anchorNumber)
    .filter(h => Math.abs(h.line - anchorLine) <= 10)
    .sort((a, b) => Math.abs(a.line - anchorLine) - Math.abs(b.line - anchorLine))
    .slice(0, 2)
    .map(h => h.anchor)
}

function findSimilarAnchors(anchor, headers, anchorLine) {
  const anchorNumber = extractLeadingNumber(anchor)
  const filteredHeaders = filterByLeadingNumber(headers, anchorNumber)

  const byNormalized = findByNormalizedMatch(anchor, filteredHeaders)
  if (byNormalized.length > 0) return byNormalized.slice(0, 3)

  const bySimilarity = findBySimilarity(anchor, filteredHeaders, 3)
  if (bySimilarity.length > 0) return bySimilarity.slice(0, 3)

  const byProximity = findByProximity(filteredHeaders, anchorLine, anchorNumber)
  return byProximity.map(a => filteredHeaders.find(h => h.anchor === a))
}

function isSelfReference(anchorLink, headers) {
  const headerAtLine = headers.find(h => h.line === anchorLink.line)
  return headerAtLine && headerAtLine.anchor === anchorLink.anchor
}

function validateMarkdownFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf-8')
    const headers = extractHeaderAnchors(text)
    const anchorLinks = extractAnchorLinks(text)

    const brokenAnchors = anchorLinks
      .filter(link => !headers.some(h => h.anchor === link.anchor) && !isSelfReference(link, headers))
      .map(link => ({
        ...link,
        suggestions: findSimilarAnchors(link.anchor, headers, link.line)
      }))

    return { filePath, brokenAnchors }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message)
    return { filePath, brokenAnchors: [], error: err.message }
  }
}

function printResults(results) {
  const errors = results.filter(r => r.brokenAnchors.length > 0)

  if (!errors.length) {
    console.log(`All ${results.length} file(s) passed validation!`)
    return 0
  }

  console.log(`Found broken anchor links in ${errors.length} file(s):\n`)

  for (const { filePath, brokenAnchors } of errors) {
    console.log(`File: ${filePath}`)
    for (const { anchor, line, suggestions } of brokenAnchors) {
      if (suggestions.length) {
        const s = suggestions[0]
        console.log(`  #${anchor} (${filePath}:${line}) → #${s.anchor} (${filePath}:${s.line})`)
      } else {
        console.log(`  #${anchor} (${filePath}:${line}) → no suggestion`)
      }
    }
    console.log()
  }

  return 1
}

function main() {
  const docsDir = process.argv[2] || './docs'

  if (!fs.existsSync(docsDir)) {
    console.error(`Directory not found: ${docsDir}`)
    process.exit(1)
  }

  console.log(`Scanning markdown files in: ${docsDir}\n`)

  const files = walkDirectory(docsDir)

  if (!files.length) {
    console.log('No markdown files found')
    process.exit(0)
  }

  const results = files.map(validateMarkdownFile)
  const exitCode = printResults(results)

  process.exit(exitCode)
}

main()
