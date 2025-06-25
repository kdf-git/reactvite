/**
 * Error Utility Functions for API Error Handling
 * 
 * This module provides enhanced error message extraction from API responses,
 * with special handling for KRA VSCU errors that include specific guidance
 * for users to check their KRA ETIMS account and resolve common issues.
 * 
 * Key Features:
 * - Extracts detailed error messages from API response bodies
 * - Provides specific guidance for KRA error codes (901, 002, etc.)
 * - Includes actionable steps and ETIMS account links
 * - Handles multiple error response formats
 * 
 * Usage:
 * import { getErrorMessage } from '@/lib/utils/error-utils';
 * toast.error(getErrorMessage(error));
 */

/**
 * Extract a user-friendly error message from an API error response
 * This is particularly useful for KRA errors that contain detailed error information
 */
export function getErrorMessage(error: any): string {
    // Handle AxiosError specifically first (most common case)
    if (error.response?.data) {
        const responseData = error.response.data;

        // For KRA errors, the backend KraVscuException already formats the message properly
        // Just return the message as-is since it contains the actual KRA error
        if (responseData.message) {
            return responseData.message;
        }

        // Check for validation errors array in response data
        if (responseData.errors && Array.isArray(responseData.errors)) {
            return responseData.errors.join(', ');
        }
    }

    // If it's an ApiError with a body containing detailed error info
    if (error.body && typeof error.body === 'object') {
        // For KRA errors, just return the formatted message from KraVscuException
        if (error.body.message) {
            return error.body.message;
        }

        // Check for validation errors array
        if (error.body.errors && Array.isArray(error.body.errors)) {
            return error.body.errors.join(', ');
        }

        // Check for nested error details
        if (error.body.error && typeof error.body.error === 'string') {
            return error.body.error;
        }
    }

    // Check if the error message itself contains useful information
    if (error.message) {
        return error.message;
    }

    // Fallback to generic error
    return 'An unexpected error occurred';
}

/**
 * Check if an error is a KRA-specific error
 */
export function isKraError(error: any): boolean {
    return (
        (error.body?.kraResultCode && error.body?.kraResultMessage) ||
        (error.response?.data?.kraResultCode && error.response?.data?.kraResultMessage) ||
        (error.kraResultCode && error.kraResultMessage)
    );
}

/**
 * Get KRA error details if available
 */
export function getKraErrorDetails(error: any): { code: string; message: string } | null {
    let kraData = null;

    if (error.body?.kraResultCode && error.body?.kraResultMessage) {
        kraData = {
            code: error.body.kraResultCode,
            message: error.body.kraResultMessage
        };
    } else if (error.response?.data?.kraResultCode && error.response?.data?.kraResultMessage) {
        kraData = {
            code: error.response.data.kraResultCode,
            message: error.response.data.kraResultMessage
        };
    } else if (error.kraResultCode && error.kraResultMessage) {
        kraData = {
            code: error.kraResultCode,
            message: error.kraResultMessage
        };
    }

    return kraData;
} 