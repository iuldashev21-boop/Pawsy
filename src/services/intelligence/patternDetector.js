/**
 * Pattern Detector
 *
 * Scans PetFacts for recurring symptom patterns within a configurable
 * time window. Pure function with no side effects -- suitable for use
 * in both UI and background contexts.
 */

const DEFAULT_OPTIONS = {
  threshold: 3,
  windowDays: 30,
}

const SEVERITY_ORDER = { critical: 4, high: 3, moderate: 2, low: 1 }

function severityRank(severity) {
  return SEVERITY_ORDER[severity] || 0
}

function maxSeverity(severities) {
  let best = 'low'
  for (const s of severities) {
    if (severityRank(s) > severityRank(best)) {
      best = s
    }
  }
  return best
}

/**
 * Detect recurring symptom patterns from an array of PetFacts.
 *
 * @param {Array} facts - PetFact objects, each with at least { id, tags, severity, createdAt }
 * @param {object} [options]
 * @param {number} [options.threshold=3] - minimum occurrences to flag a pattern
 * @param {number} [options.windowDays=30] - look-back window in days from now
 * @returns {Array} detected patterns, each with { tag, count, severity, firstSeen, lastSeen, factIds, description }
 */
function detectPatterns(facts, options = {}) {
  if (!facts || facts.length === 0) return []

  const { threshold, windowDays } = { ...DEFAULT_OPTIONS, ...options }

  const now = new Date()
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000)

  // Filter facts within the time window
  const recentFacts = facts.filter((fact) => {
    const date = new Date(fact.createdAt)
    return date >= windowStart && date <= now
  })

  if (recentFacts.length === 0) return []

  // Group by tags
  const tagGroups = {}

  for (const fact of recentFacts) {
    const tags = fact.tags || []
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase().trim()
      if (!normalizedTag) continue

      if (!tagGroups[normalizedTag]) {
        tagGroups[normalizedTag] = []
      }
      tagGroups[normalizedTag].push(fact)
    }
  }

  // Build patterns for tags that meet the threshold
  const patterns = []

  for (const [tag, tagFacts] of Object.entries(tagGroups)) {
    if (tagFacts.length < threshold) continue

    const dates = tagFacts.map((f) => new Date(f.createdAt)).sort((a, b) => a - b)
    const severities = tagFacts.map((f) => f.severity).filter(Boolean)
    const factIds = [...new Set(tagFacts.map((f) => f.id))]

    patterns.push({
      tag,
      count: tagFacts.length,
      severity: severities.length > 0 ? maxSeverity(severities) : 'low',
      firstSeen: dates[0].toISOString(),
      lastSeen: dates[dates.length - 1].toISOString(),
      factIds,
      description: `"${tag}" has been recorded ${tagFacts.length} times in the last ${windowDays} days.`,
    })
  }

  // Sort by severity (highest first), then by count (highest first)
  patterns.sort((a, b) => {
    const sevDiff = severityRank(b.severity) - severityRank(a.severity)
    if (sevDiff !== 0) return sevDiff
    return b.count - a.count
  })

  return patterns
}

export { detectPatterns }
export default detectPatterns
