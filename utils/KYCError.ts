// KYC Error Handling
export class KYCError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, originalError?: Error, code: string = 'KYC_ERROR', details?: any) {
    super(message);
    this.name = 'KYCError';
    this.code = code;
    this.details = details;

    // Preserve original error stack if available
    if (originalError?.stack) {
      this.stack = originalError.stack;
    }
  }

  static fromAPIError(error: any): KYCError {
    return new KYCError(
      error.message || 'API Error',
      error,
      error.code || 'API_ERROR',
      error.details
    );
  }

  static fromValidationError(errors: string[]): KYCError {
    return new KYCError(
      `Validation failed: ${errors.join(', ')}`,
      undefined,
      'VALIDATION_ERROR',
      { errors }
    );
  }

  static fromNetworkError(error: Error): KYCError {
    return new KYCError(
      'Network error occurred',
      error,
      'NETWORK_ERROR'
    );
  }

  static fromSessionError(error: Error): KYCError {
    return new KYCError(
      'Session error occurred',
      error,
      'SESSION_ERROR'
    );
  }

  static fromAuthError(error: Error): KYCError {
    return new KYCError(
      'Authentication error occurred',
      error,
      'AUTH_ERROR'
    );
  }

  static fromRateLimitError(error: Error): KYCError {
    return new KYCError(
      'Rate limit exceeded. Please try again later',
      error,
      'RATE_LIMIT'
    );
  }

  static fromServerError(error: Error): KYCError {
    return new KYCError(
      'Server error occurred. Please try again later',
      error,
      'SERVER_ERROR'
    );
  }
}
