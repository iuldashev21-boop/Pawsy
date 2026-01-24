/**
 * Usage limits configuration for free tier
 */
export const USAGE_LIMITS = {
  // Daily limits
  dailyChats: 3,
  dailyPhotos: 3,

  // Emergency overrides
  emergencyChats: 2,
  emergencyPhotos: 1,

  // Day 1 bonus (first-time users)
  firstDayChats: 5,
  firstDayPhotos: 5,
}
