/**
 * API request interceptor that automatically handles token refreshing
 */
import { TracksolApi } from '@/lib/sdk/TracksolApi';
import { OpenAPI } from '@/lib/sdk/core/OpenAPI';
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Configure the base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Auth token storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Process the queue of failed requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Create a function to get authentication token
export const getAuthToken = (): string | undefined => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
};

// Function to check if token is expired or about to expire (within 5 minutes)
export const isTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;

  const now = Date.now();
  const expiry = parseInt(expiryTime, 10);
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

  return now >= (expiry - fiveMinutes);
};

// Function to decode JWT and extract expiry time
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Function to store auth tokens
export const storeAuthTokens = (accessToken: string, refreshToken: string, userId: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_ID_KEY, userId);

  // Store token expiry time
  const expiry = getTokenExpiry(accessToken);
  if (expiry) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  }

  // Update the token in the OpenAPI configuration
  OpenAPI.TOKEN = accessToken;

  console.log('Auth tokens stored and OpenAPI configuration updated');
};

// Function to clear auth tokens
export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);

  // Update the token in the OpenAPI configuration
  OpenAPI.TOKEN = undefined;

  console.log('Auth tokens cleared');
};

// Function to get stored refresh data
export const getStoredRefreshData = () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);

  return { refreshToken, userId };
};

// Internal function to perform token refresh
const performTokenRefresh = async (): Promise<string | null> => {
  try {
    const { refreshToken, userId } = getStoredRefreshData();

    if (!refreshToken || !userId) {
      console.warn('No refresh token or user ID available for token refresh');
      return null;
    }

    console.log('Attempting to refresh token...');

    // Create a fresh axios instance without interceptors for the refresh call
    // This prevents circular dependency with our own interceptors
    const refreshAxios = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    const response = await refreshAxios.post('/api/auth/refresh', {
      refreshToken: refreshToken,
      userId: userId
    });

    if (response.data && response.data.access_token) {
      const newAccessToken = response.data.access_token;
      const newRefreshToken = refreshToken; // Keep the existing refresh token

      // Store the new tokens
      storeAuthTokens(newAccessToken, newRefreshToken, userId);

      console.log('Token refreshed successfully');
      return newAccessToken;
    }

    console.warn('Token refresh failed - no access token in response');
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

// Create axios instance with interceptors
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Request interceptor to add token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            }
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await performTokenRefresh();
          if (newToken) {
            processQueue(null, newToken);
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            }
            return instance(originalRequest);
          } else {
            processQueue(new Error('Token refresh failed'), null);
            clearAuthTokens();
            // Redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearAuthTokens();
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the axios instance with interceptors
const axiosInstance = createAxiosInstance();

/**
 * Creates a wrapped API service that handles token refresh automatically
 */
export const createSecureApiService = (): TracksolApi => {
  // Create a custom HTTP request class that uses our axios instance
  class CustomAxiosHttpRequest {
    constructor(public config: any) { }

    async request(options: any) {
      // Handle path parameter replacement (similar to the original SDK)
      let url = options.url;
      if (options.path) {
        url = url.replace(/{(.*?)}/g, (substring: string, group: string) => {
          if (options.path?.hasOwnProperty(group)) {
            return encodeURIComponent(String(options.path[group]));
          }
          return substring;
        });
      }

      const method = options.method || 'GET';

      const axiosConfig: any = {
        method,
        url,
        headers: options.headers || {},
        data: options.body,
        params: options.query,
      };

      try {
        const response = await axiosInstance(axiosConfig);
        return response.data;
      } catch (error: any) {
        // Re-throw the error to be handled by the calling code
        throw error;
      }
    }
  }

  // Create the API instance with our custom HTTP request handler
  return new TracksolApi({
    BASE: API_BASE_URL,
    VERSION: '1.0',
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    TOKEN: getAuthToken()
  }, CustomAxiosHttpRequest as any);
};

// Export the secure API instance
export const secureApi = createSecureApiService();

// Public function to refresh the access token
export const refreshAccessToken = async (): Promise<boolean> => {
  const newToken = await performTokenRefresh();
  return !!newToken;
};

// Function to proactively refresh token if it's about to expire
export const checkAndRefreshToken = async (): Promise<void> => {
  if (isTokenExpired() && !isRefreshing) {
    console.log('Token is expired or about to expire, refreshing...');
    await performTokenRefresh();
  }
};

// Start periodic token check (every 4 minutes)
let tokenCheckInterval: number | null = null;

export const startTokenRefreshChecker = () => {
  // Clear any existing interval
  if (tokenCheckInterval !== null) {
    clearInterval(tokenCheckInterval);
  }

  // Set up new interval
  tokenCheckInterval = window.setInterval(async () => {
    const hasTokens = localStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY);
    if (hasTokens) {
      await checkAndRefreshToken();
    }
  }, 4 * 60 * 1000); // Check every 4 minutes
};

export const stopTokenRefreshChecker = () => {
  if (tokenCheckInterval !== null) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
};