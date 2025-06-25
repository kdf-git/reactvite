/**
 * Utility functions for handling API errors and extracting user-friendly messages
 */

/**
 * Extracts a user-friendly error message from various error response formats
 * @param error - The error object from API calls
 * @returns A readable error message for display to users
 */
export const extractErrorMessage = (error: any): string => {
    // If it's already a string, return it
    if (typeof error === 'string') {
        return error;
    }

    // Check for SDK client error format (Generic Error: status: 409; status text: Conflict; body: {...})
    if (error?.message && typeof error.message === 'string' && error.message.includes('Generic Error:')) {
        try {
            // Extract the body part from the error message using a more robust regex
            const bodyMatch = error.message.match(/body: ({[\s\S]*})$/);
            if (bodyMatch) {
                const bodyStr = bodyMatch[1];
                const body = JSON.parse(bodyStr);

                // Try to get the message from the parsed body
                if (body.message) {
                    return body.message;
                }
                if (body.details) {
                    return body.details;
                }
                if (body.error) {
                    return body.error;
                }
            }
        } catch (parseError) {
            // If parsing fails, continue with other extraction methods
            console.warn('Failed to parse SDK error body:', parseError);
        }
    }

    // Check for API error response structure (Axios format)
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    // Check for response data details
    if (error?.response?.data?.details) {
        return error.response.data.details;
    }

    // Check for direct message property
    if (error?.message && !error.message.includes('Generic Error:')) {
        return error.message;
    }

    // Check for error details in different formats
    if (error?.error?.message) {
        return error.error.message;
    }

    // Check for validation errors
    if (error?.response?.data?.error) {
        return error.response.data.error;
    }

    // Check for array of errors (validation errors)
    if (Array.isArray(error?.response?.data?.message)) {
        return error.response.data.message.join(', ');
    }

    // Check for nested error structures
    if (error?.response?.data?.errors) {
        if (Array.isArray(error.response.data.errors)) {
            return error.response.data.errors.map((err: any) =>
                typeof err === 'string' ? err : err.message || err.error || 'Unknown error'
            ).join(', ');
        }
        return error.response.data.errors;
    }

    // Check for body property (some SDK formats)
    if (error?.body) {
        if (typeof error.body === 'string') {
            try {
                const parsed = JSON.parse(error.body);
                if (parsed.message) return parsed.message;
                if (parsed.details) return parsed.details;
                if (parsed.error) return parsed.error;
            } catch {
                return error.body;
            }
        } else if (error.body.message) {
            return error.body.message;
        } else if (error.body.details) {
            return error.body.details;
        }
    }

    // Check for status-specific messages
    if (error?.response?.status) {
        switch (error.response.status) {
            case 400:
                return 'Invalid request. Please check your input and try again.';
            case 401:
                return 'You are not authorized to perform this action. Please log in again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'This action conflicts with existing data. Please check for duplicates.';
            case 422:
                return 'The provided data is invalid. Please check your input.';
            case 500:
                return 'A server error occurred. Please try again later.';
            case 503:
                return 'The service is temporarily unavailable. Please try again later.';
            default:
                return `An error occurred (${error.response.status}). Please try again.`;
        }
    }

    // Check for status in error object itself (SDK format)
    if (error?.status) {
        switch (error.status) {
            case 400:
                return 'Invalid request. Please check your input and try again.';
            case 401:
                return 'You are not authorized to perform this action. Please log in again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'This action conflicts with existing data. Please check for duplicates.';
            case 422:
                return 'The provided data is invalid. Please check your input.';
            case 500:
                return 'A server error occurred. Please try again later.';
            case 503:
                return 'The service is temporarily unavailable. Please try again later.';
            default:
                return `An error occurred (${error.status}). Please try again.`;
        }
    }

    // Check for network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        return 'Network error. Please check your internet connection and try again.';
    }

    // Check for timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    // Fallback for unknown error structures
    return 'An unexpected error occurred. Please try again.';
};

/**
 * Handles common error scenarios and provides appropriate user feedback
 * @param error - The error object
 * @param context - Additional context about where the error occurred
 * @returns An object with the error message and suggested action
 */
export const handleApiError = (error: any, context?: string) => {
    const message = extractErrorMessage(error);

    // Log the full error for debugging
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    return {
        message,
        shouldRetry: error?.response?.status >= 500 || error?.status >= 500 || error?.code === 'NETWORK_ERROR',
        shouldReauth: error?.response?.status === 401 || error?.status === 401,
    };
};

/**
 * Common error messages for specific scenarios
 */
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your internet connection.',
    UNAUTHORIZED: 'You are not authorized. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested item was not found.',
    CONFLICT: 'This item already exists. Please use different details.',
    VALIDATION: 'Please check your input and try again.',
    SERVER_ERROR: 'A server error occurred. Please try again later.',
    UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Validates if an error is a specific type
 */
export const isErrorType = {
    network: (error: any) => error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error'),
    unauthorized: (error: any) => error?.response?.status === 401 || error?.status === 401,
    forbidden: (error: any) => error?.response?.status === 403 || error?.status === 403,
    notFound: (error: any) => error?.response?.status === 404 || error?.status === 404,
    conflict: (error: any) => error?.response?.status === 409 || error?.status === 409,
    validation: (error: any) => error?.response?.status === 422 || error?.response?.status === 400 || error?.status === 422 || error?.status === 400,
    serverError: (error: any) => error?.response?.status >= 500 || error?.status >= 500,
}; 