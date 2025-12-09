// lib/utils/apiError.ts

export interface ApiErrorOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  context?: string;
}

export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;
  public originalError?: any;
  public shouldShowToast: boolean;
  public context?: string;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: any;
      originalError?: any;
      shouldShowToast?: boolean;
      context?: string;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.originalError = options.originalError;
    this.shouldShowToast = options.shouldShowToast ?? true;
    this.context = options.context;
  }

  static fromResponse = async (
    response: Response,
    options: ApiErrorOptions = {}
  ): Promise<ApiError> => {
    let message = "";
    let errorCode = "";
    let details: any = null;

    // Default messages based on status code
    switch (response.status) {
      case 400:
        message = "Invalid request. Please check your input.";
        errorCode = "BAD_REQUEST";
        break;
      case 401:
        message = "Your session has expired. Please log in again.";
        errorCode = "UNAUTHORIZED";
        break;
      case 403:
        message = "You do not have permission to access this resource.";
        errorCode = "FORBIDDEN";
        break;
      case 404:
        message = "The requested resource was not found.";
        errorCode = "NOT_FOUND";
        break;
      case 408:
        message = "Request timed out. Please try again.";
        errorCode = "TIMEOUT";
        break;
      case 409:
        message = "A conflict occurred. Please try again.";
        errorCode = "CONFLICT";
        break;
      case 422:
        message = "Validation error. Please check your input.";
        errorCode = "VALIDATION_ERROR";
        break;
      case 429:
        message = "Too many requests. Please try again later.";
        errorCode = "RATE_LIMIT";
        break;
      case 500:
        message = "Server error. Our team has been notified.";
        errorCode = "SERVER_ERROR";
        break;
      case 502:
      case 503:
      case 504:
        message = "Service temporarily unavailable. Please try again later.";
        errorCode = "SERVICE_UNAVAILABLE";
        break;
      default:
        message = `An error occurred (${response.status}). Please try again.`;
        errorCode = "UNKNOWN_ERROR";
    }

    // Try to extract more specific error from response body
    try {
      const body = await response.json();

      if (body?.message && typeof body.message === "string") {
        message = body.message;
      } else if (body?.error && typeof body.error === "string") {
        message = body.error;
      } else if (body?.detail && typeof body.detail === "string") {
        message = body.detail;
      } else if (body?.msg && typeof body.msg === "string") {
        message = body.msg;
      }

      if (body?.code && typeof body.code === "string") {
        errorCode = body.code;
      }

      details = body;
    } catch (_) {
      // If response is not JSON, use text if available
      try {
        const text = await response.text();
        if (text && text.length < 200) {
          // Only use if reasonable length
          message = text;
        }
      } catch (__) {
        // Ignore text parsing errors
      }
    }

    // Use fallback message if provided and no specific message found
    if (options.fallbackMessage && message === "") {
      message = options.fallbackMessage;
    }

    // Add context to message
    if (options.context) {
      message = `${options.context}: ${message}`;
    }

    return new ApiError(message, {
      status: response.status,
      code: errorCode,
      details,
      shouldShowToast: options.showToast ?? true,
      context: options.context,
    });
  };

  static fromNetworkError = (
    error: any,
    options: ApiErrorOptions = {}
  ): ApiError => {
    let message = "Network error. Please check your internet connection.";
    let errorCode = "NETWORK_ERROR";

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      message =
        "Cannot connect to the server. Please check your internet connection and try again.";
    } else if (error.name === "AbortError") {
      message = "Request was cancelled.";
      errorCode = "REQUEST_CANCELLED";
    } else if (error.message?.includes("timeout")) {
      message = "Request timed out. Please try again.";
      errorCode = "TIMEOUT";
    }

    if (options.context) {
      message = `${options.context}: ${message}`;
    }

    return new ApiError(message, {
      code: errorCode,
      originalError: error,
      shouldShowToast: options.showToast ?? true,
      context: options.context,
    });
  };

  static fromUnknown = (
    error: any,
    options: ApiErrorOptions = {}
  ): ApiError => {
    let message = "An unexpected error occurred. Please try again.";
    let errorCode = "UNKNOWN_ERROR";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    if (options.fallbackMessage) {
      message = options.fallbackMessage;
    }

    if (options.context) {
      message = `${options.context}: ${message}`;
    }

    return new ApiError(message, {
      code: errorCode,
      originalError: error,
      shouldShowToast: options.showToast ?? true,
      context: options.context,
    });
  };

  toUserFriendlyMessage(): string {
    // Customize messages for specific error codes
    switch (this.code) {
      case "NETWORK_ERROR":
        return "Unable to connect. Please check your internet connection and try again.";
      case "UNAUTHORIZED":
        return "Your session has expired. Please refresh the page and try again.";
      case "FORBIDDEN":
        return "You do not have permission to perform this action.";
      case "NOT_FOUND":
        return "The requested service is not available.";
      case "RATE_LIMIT":
        return "Too many requests. Please wait a moment and try again.";
      case "SERVER_ERROR":
        return "Server error. Our team has been notified. Please try again in a few minutes.";
      case "SERVICE_UNAVAILABLE":
        return "Service is temporarily unavailable. Please try again later.";
      case "TIMEOUT":
        return "Request took too long. Please try again.";
      default:
        return this.message;
    }
  }

  getLoggableError() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      context: this.context,
      timestamp: new Date().toISOString(),
      details: this.details,
      stack: this.stack,
      originalError: this.originalError,
    };
  }
}

export const handleApiError = async (
  response: Response,
  options: ApiErrorOptions = {}
): Promise<void> => {
  if (response.ok) return;

  const error = await ApiError.fromResponse(response, options);
  throw error;
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};
