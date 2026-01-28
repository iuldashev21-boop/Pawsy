/**
 * Health event (PetFact) relevance scoring.
 *
 * Each fact is scored on three axes (total 0-100):
 *   - Recency:  0-40 points  (decays linearly over 90 days)
 *   - Severity: 0-30 points  (severe=30, moderate=20, mild=10)
 *   - Tag match: 0-30 points (each matching tag = 10, max 30)
 */

const RECENCY_MAX = 40
const RECENCY_DECAY_DAYS = 90
const SEVERITY_SCORES = { severe: 30, moderate: 20, mild: 10 }
const TAG_MATCH_POINTS = 10
const TAG_MATCH_MAX = 30

const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysAgo(date) {
  if (!date) return RECENCY_DECAY_DAYS
  const ms = Date.now() - new Date(date).getTime()
  return Math.max(0, ms / MS_PER_DAY)
}

function recencyScore(fact) {
  const days = daysAgo(fact.occurredAt || fact.createdAt)
  return Math.max(0, 1 - days / RECENCY_DECAY_DAYS) * RECENCY_MAX
}

function severityScore(fact) {
  return SEVERITY_SCORES[fact.severity] || 0
}

function tagMatchScore(fact, conversationTags) {
  if (!conversationTags || conversationTags.length === 0) return 0
  if (!fact.tags || fact.tags.length === 0) return 0

  const tagSet = new Set(conversationTags.map(t => t.toLowerCase()))
  let matches = 0
  for (const tag of fact.tags) {
    if (tagSet.has(tag.toLowerCase())) {
      matches++
    }
  }
  return Math.min(matches * TAG_MATCH_POINTS, TAG_MATCH_MAX)
}

function computeScore(fact, conversationTags) {
  return (
    recencyScore(fact) +
    severityScore(fact) +
    tagMatchScore(fact, conversationTags)
  )
}

/**
 * Score and sort facts by relevance (descending).
 *
 * Each returned fact gets an added `_relevanceScore` property.
 *
 * @param {Array} facts - PetFact objects
 * @param {string[]} conversationTags - tags from current conversation
 * @returns {Array} facts sorted by score descending, with `_relevanceScore`
 */
export function scoreFacts(facts, conversationTags = []) {
  if (!facts || facts.length === 0) return []

  return facts
    .map(fact => ({
      ...fact,
      _relevanceScore: computeScore(fact, conversationTags),
    }))
    .sort((a, b) => b._relevanceScore - a._relevanceScore)
}

/**
 * Return the top N facts by relevance score.
 *
 * @param {Array} facts - PetFact objects
 * @param {string[]} conversationTags - tags from current conversation
 * @param {number} [limit=10] - maximum facts to return
 * @returns {Array} top N facts sorted by score descending
 */
export function getTopFacts(facts, conversationTags = [], limit = 10) {
  return scoreFacts(facts, conversationTags).slice(0, limit)
}
