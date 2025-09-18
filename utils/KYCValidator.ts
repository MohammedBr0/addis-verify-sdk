// KYC Validation Utilities
import { KYCStep, KYCData, OCRFieldMapping, KYCAPICredentials } from '../types/KYCTypes';
import { KYCConfig } from '../types/KYCConfig';
import { KYCError } from './KYCError';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class KYCValidator {
  validateConfig(config: KYCConfig): void {
    const errors: string[] = [];

    if (!config.auth) {
      errors.push('Authentication configuration is required');
    } else {
      if (!config.auth.apiKey) {
        errors.push('API key is required');
      }
    }

    if (!config.apiBaseUrl) {
      errors.push('API base URL is required');
    }

    if (errors.length > 0) {
      throw KYCError.fromValidationError(errors);
    }
  }

  validateCredentials(credentials: KYCAPICredentials): void {
    const errors: string[] = [];

    if (!credentials.apiKey) {
      errors.push('API key is required');
    } else if (credentials.apiKey.length < 10) {
      errors.push('API key appears to be invalid (too short)');
    }

    if (errors.length > 0) {
      throw KYCError.fromValidationError(errors);
    }
  }

  validateStep(step: KYCStep, data: KYCData): ValidationResult {
    const errors: string[] = [];

    switch (step) {
      case 'idTypeSelection':
        if (!data.idType) {
          errors.push('ID type must be selected');
        }
        break;

      case 'idScanFront':
        if (!data.idFront) {
          errors.push('Front image must be captured');
        } else {
          const fileValidation = this.validateFile(data.idFront);
          if (!fileValidation.isValid) {
            errors.push(...fileValidation.errors);
          }
        }
        break;

      case 'idScanBack':
        if (!data.idBack) {
          errors.push('Back image must be captured');
        } else {
          const fileValidation = this.validateFile(data.idBack);
          if (!fileValidation.isValid) {
            errors.push(...fileValidation.errors);
          }
        }
        break;

      case 'ocrPreview':
        const ocrValidation = this.validateOCRData(data.ocrData);
        errors.push(...ocrValidation.errors);
        break;

      case 'selfie':
        if (!data.selfie) {
          errors.push('Selfie must be captured');
        } else {
          const fileValidation = this.validateFile(data.selfie);
          if (!fileValidation.isValid) {
            errors.push(...fileValidation.errors);
          }
        }
        break;

      case 'review':
        // Final validation
        const finalValidation = this.validateFinalData(data);
        errors.push(...finalValidation.errors);
        break;

      default:
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateOCRData(ocrData: OCRFieldMapping): ValidationResult {
    const errors: string[] = [];

    if (!ocrData.fullName?.trim()) {
      errors.push('Full name is required');
    }

    if (!ocrData.dateOfBirth) {
      errors.push('Date of birth is required');
    } else if (!this.isValidDate(ocrData.dateOfBirth)) {
      errors.push('Invalid date of birth format');
    }

    if (!ocrData.dateOfExpiry) {
      errors.push('Expiry date is required');
    } else if (!this.isValidDate(ocrData.dateOfExpiry)) {
      errors.push('Invalid expiry date format');
    }

    if (!ocrData.gender?.trim()) {
      errors.push('Gender is required');
    }

    if (!ocrData.idNumber?.trim()) {
      errors.push('ID number is required');
    }

    if (!ocrData.issuingAuthority?.trim()) {
      errors.push('Issuing authority is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFinalData(data: KYCData): ValidationResult {
    const errors: string[] = [];

    // Validate all required fields
    if (!data.idType) {
      errors.push('ID type is required');
    }

    if (!data.idFront) {
      errors.push('Front image is required');
    }

    if (!data.idBack) {
      errors.push('Back image is required');
    }

    if (!data.selfie) {
      errors.push('Selfie is required');
    }

    // Validate OCR data
    const ocrValidation = this.validateOCRData(data.ocrData);
    errors.push(...ocrValidation.errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFile(file: File, maxSize: number = 10 * 1024 * 1024): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    // Check file size (default 10MB)
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be an image (JPEG, PNG, or WebP)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
