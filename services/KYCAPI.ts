// KYC API Service with API Key Authorization
import { KYCConfig } from '../types/KYCConfig';
import { KYCData, KYCVerificationResult, KYCSession, KYCAPIResponse, KYCAPICredentials } from '../types/KYCTypes';
import { KYCError } from '../utils/KYCError';

export class KYCAPI {
  private config: KYCConfig;
  private credentials: KYCAPICredentials;
  private baseURL: string;

  constructor(config: KYCConfig, credentials: KYCAPICredentials) {
    this.config = config;
    this.credentials = credentials;
    this.baseURL = config.apiBaseUrl || '';
  }

  async initialize(): Promise<void> {
    // Test API connectivity
    try {
      await this.healthCheck();
    } catch (error) {
      // Log the error but don't fail initialization - allow demo mode
      console.warn('Backend service not available, running in demo mode:', error);
      // Don't throw error - allow SDK to work in demo mode
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.credentials.apiKey,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }



  async getSession(sessionId: string): Promise<KYCSession> {
    try {
      const response = await this.makeAuthenticatedRequest(`/public/verification/${sessionId}/status`, {
        method: 'GET',
      });

      return response.data;
    } catch (error) {
      throw new KYCError('Failed to get session', error as Error);
    }
  }

  async createVerificationSession(
    tenantId: string,
    idType: string,
    userId?: string,
    callback?: string,
    customData?: any
  ): Promise<KYCSession> {
    try {
      // Use the API key endpoint with the proper request format
      const sessionData = {
        piiData: customData?.piiData || {
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com",
          phone: "+1234567890"
        },
        vendorData: customData?.vendorData || {
          vendorId: "demo-vendor",
          customFields: {}
        },
        metadata: customData?.metadata || {
          source: "web",
          userAgent: navigator.userAgent,
          ipAddress: "127.0.0.1"
        },
        callback: callback || customData?.callback || this.config.auth.callbackUrl || "https://your-domain.com/webhooks/kyc-status"
      };

      // Direct call to localhost:3003 endpoint

            const response = await this.makeAuthenticatedRequest('/tenants/kyc/sessions/api-key', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });

      return response.data;
    } catch (error) {
      throw new KYCError('Failed to create verification session', error as Error);
    }
  }

  async processDocumentVerification(
    sessionId: string,
    documentType: string,
    frontImage: File,
    backImage?: File,
    sessionToken?: string
  ): Promise<KYCAPIResponse> {
    try {
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('front_image', frontImage);
      
      if (backImage) {
        formData.append('back_image', backImage);
      }

      const url = `/public/verification/${sessionId}/document${sessionToken ? `?token=${sessionToken}` : ''}`;
      
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: formData,
      });

      return response;
    } catch (error) {
      throw new KYCError('Failed to process document verification', error as Error);
    }
  }

  async processFaceVerification(
    sessionId: string,
    selfieImage: File,
    idImage: File,
    sessionToken?: string
  ): Promise<KYCAPIResponse> {
    try {
      const formData = new FormData();
      formData.append('id_image', idImage);
      formData.append('selfie_image', selfieImage);

      const url = `/public/verification/${sessionId}/face${sessionToken ? `?token=${sessionToken}` : ''}`;
      
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: formData,
      });

      return response;
    } catch (error) {
      throw new KYCError('Failed to process face verification', error as Error);
    }
  }

  async getVerificationResults(
    sessionId: string,
    sessionToken?: string
  ): Promise<KYCAPIResponse> {
    try {
      const url = `/public/verification/${sessionId}/results${sessionToken ? `?token=${sessionToken}` : ''}`;
      
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new KYCError('Failed to get verification results', error as Error);
    }
  }

  async getAvailableIdTypes(sessionId?: string, sessionToken?: string): Promise<any[]> {
    try {
      // If we have session info, try to get ID types from the backend
      if (sessionId && sessionToken) {
        console.log('🔗 [KYC SDK] Fetching ID types from backend for session:', sessionId);
        console.log('🔗 [KYC SDK] Base URL configured as:', this.baseURL);
        
        // First check if backend is accessible
        try {
          const isHealthy = await this.healthCheck();
          if (!isHealthy) {
            console.warn('⚠️ [KYC SDK] Backend health check failed, using fallback ID types');
            return this.getDefaultIdTypes();
          }
        } catch (healthError) {
          console.warn('⚠️ [KYC SDK] Backend health check failed:', healthError);
          return this.getDefaultIdTypes();
        }
        
        try {
          const endpoint = `/tenants/kyc/public/session/${sessionId}/id-types?token=${sessionToken}`;
          console.log('🔗 [KYC SDK] Endpoint:', endpoint);
          
          const response = await this.makeAuthenticatedRequest(endpoint, {
            method: 'GET'
          });

          if (response.success && response.data) {
            console.log('✅ [KYC SDK] Successfully fetched ID types from backend:', response.data);
            return response.data;
          } else {
            console.warn('❌ [KYC SDK] Backend endpoint failed with response:', response);
          }
        } catch (backendError) {
          console.warn('Failed to fetch ID types from backend:', backendError);
          if (backendError instanceof Error) {
            console.warn('Error details:', backendError.message);
          }
        }
      }

      // Fallback to default ID types
      console.log('⚠️ [KYC SDK] Using default ID types as fallback');
      return this.getDefaultIdTypes();
    } catch (error) {
      console.warn('Failed to fetch ID types:', error);
      // Fallback to default ID types if everything fails
      return this.getDefaultIdTypes();
    }
  }

  private getDefaultIdTypes(): any[] {
    return [
      {
        id: 'national_id',
        name: 'National ID',
        code: 'national_id',
        requiresFront: true,
        requiresBack: true,
        requiresSelfie: true,
        description: 'Ethiopian National ID Card'
      },
      {
        id: 'passport',
        name: 'Passport',
        code: 'passport',
        requiresFront: true,
        requiresBack: false,
        requiresSelfie: true,
        description: 'International Passport'
      },
      {
        id: 'driver_license',
        name: 'Driver License',
        code: 'driver_license',
        requiresFront: true,
        requiresBack: true,
        requiresSelfie: true,
        description: 'Driver License'
      }
    ];
  }

async completeVerification(
    sessionId: string,
    data: KYCData,
    sessionToken?: string
  ): Promise<KYCVerificationResult> {
    try {
      // First, try to complete with Python service
      const pythonServiceURL = process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 'http://localhost:8001';
      const url = `${pythonServiceURL}/api/v1/verification/${sessionId}/results${sessionToken ? `?token=${sessionToken}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.credentials.apiKey,
          ...(this.credentials.tenantId && { 'X-Tenant-ID': this.credentials.tenantId }),
          ...(this.credentials.userId && { 'X-User-ID': this.credentials.userId }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        status: this.mapDecisionToStatus(result.final_decision, result.review_required),
        decision: result.final_decision,
        review_required: result.review_required,
        message: result.message,
        uiData: result.ui_data,
        apiResponse: result,
        timestamp: new Date()
      };
    } catch (error) {
      throw new KYCError('Failed to complete verification', error as Error);
    }
  }

  updateCredentials(credentials: KYCAPICredentials): void {
    this.credentials = credentials;
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KYCAPIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🔗 [KYC SDK] Making request to:', url);
    console.log('🔗 [KYC SDK] Base URL:', this.baseURL);
    console.log('🔗 [KYC SDK] Endpoint:', endpoint);
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.credentials.apiKey,
    };

    // Add tenant and user headers if provided
    if (this.credentials.tenantId) {
      defaultHeaders['X-Tenant-ID'] = this.credentials.tenantId;
    }

    if (this.credentials.userId) {
      defaultHeaders['X-User-ID'] = this.credentials.userId;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Remove Content-Type if body is FormData
    if (options.body instanceof FormData) {
      const headers = config.headers as Record<string, string>;
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new KYCError('Invalid API key or unauthorized access', new Error(errorText), 'AUTH_ERROR');
        } else if (response.status === 403) {
          throw new KYCError('Access forbidden. Check your API key permissions', new Error(errorText), 'FORBIDDEN');
        } else if (response.status === 429) {
          throw new KYCError('Rate limit exceeded. Please try again later', new Error(errorText), 'RATE_LIMIT');
        } else if (response.status >= 500) {
          throw new KYCError('Server error. Please try again later', new Error(errorText), 'SERVER_ERROR');
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to parse URL')) {
        console.error('❌ [KYC SDK] URL construction error:', {
          baseURL: this.baseURL,
          endpoint: endpoint,
          constructedURL: url,
          error: fetchError.message
        });
        throw new KYCError('Invalid URL construction', fetchError as Error, 'URL_ERROR');
      }
      throw fetchError;
    }
  }

  private mapDecisionToStatus(decision?: string, review_required?: boolean): 'approved' | 'pending' | 'rejected' | 'under_review' {
    if (!decision) {
      return 'pending';
    }

    switch (decision) {
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      case 'MANUAL_REVIEW':
        return 'under_review';
      case 'PENDING':
        return review_required ? 'under_review' : 'pending';
      default:
        return 'pending';
    }
  }
}
