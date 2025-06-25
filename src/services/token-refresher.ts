/**
 * Token refresh utility for handling automatic token refresh
 * This file is now deprecated in favor of the improved token refresh system in api.ts
 * Keeping for backward compatibility
 */
import { refreshAccessToken, startTokenRefreshChecker as startChecker, stopTokenRefreshChecker as stopChecker } from './api';

// Keep track of the refresh promise
let refreshingPromise: Promise<boolean> | null = null;

// Automatic token refresher for API calls
export const withTokenRefresh = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    // First, try the API call with current token
    return await apiCall();
  } catch (error: any) {
    // If the error is 401 (Unauthorized), try to refresh the token
    if (error.status === 401) {
      // If already refreshing, wait for that promise to resolve
      if (refreshingPromise) {
        const refreshed = await refreshingPromise;
        if (refreshed) {
          // If refresh was successful, retry the API call
          return await apiCall();
        } else {
          // If refresh failed, propagate the original error
          throw error;
        }
      }

      // No refresh in progress, start one
      refreshingPromise = refreshAccessToken();
      try {
        const refreshed = await refreshingPromise;
        if (refreshed) {
          // If refresh was successful, retry the API call
          return await apiCall();
        } else {
          // If refresh failed, propagate the original error
          throw error;
        }
      } finally {
        // Clear the refreshing promise
        refreshingPromise = null;
      }
    }

    // For other errors, just propagate
    throw error;
  }
};

// Re-export the improved token refresh functions
export const startTokenRefreshChecker = startChecker;
export const stopTokenRefreshChecker = stopChecker;