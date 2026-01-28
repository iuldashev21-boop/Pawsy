import LocalStorageService from './LocalStorageService'

export const storageService = new LocalStorageService()
export { default as LocalStorageService } from './LocalStorageService'
export { migrateProfile, migrateAllProfiles, computeProfileCompletion } from './migration'
