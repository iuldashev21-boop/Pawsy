/**
 * Usage limits configuration for free tier
 */
export const USAGE_LIMITS = {
  // Daily limits
  dailyChats: 5,
  dailyPhotos: 3,

  // Emergency overrides
  emergencyChats: 5,
  emergencyPhotos: 1,

  // Day 1 bonus (first-time users)
  firstDayChats: 10,
  firstDayPhotos: 5,
}
