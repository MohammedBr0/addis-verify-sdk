// KYC Web SDK - Main Class
import { KYCConfig, KYCAuthConfig } from './types/KYCConfig';
import { KYCStep, KYCData, KYCProgress, KYCVerificationResult, KYCSession, KYCAPICredentials } from './types/KYCTypes';
import { KYCAPI } from './services/KYCAPI';
import { KYCStateManager } from './services/KYCStateManager';
import { KYCValidator } from './utils/KYCValidator';
import { KYCStorage } from './utils/KYCStorage';
import { KYCError } from './utils/KYCError';

export class KYCWebSDK {
  private config: KYCConfig;
  private api: KYCAPI;
  private stateManager: KYCStateManager;
  private validator: KYCValidator;
  private storage: KYCStorage;
  private isInitialized: boolean = false;
  private credentials: KYCAPICredentials;
  private isDemoMode: boolean = false;

  constructor(config: KYCConfig) {
    this.config = this.mergeDefaultConfig(config);
    this.credentials = this.extractCredentials(config.auth);
    this.api = new KYCAPI(this.config, this.credentials);
    this.stateManager = new KYCStateManager();
    this.validator = new KYCValidator();
    this.storage = new KYCStorage(this.config.enableLocalStorage);
  }

  /**
   * Initialize the KYC SDK
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      // Validate configuration
      this.validator.validateConfig(this.config);
      this.validator.validateCredentials(this.credentials);

      // Initialize API
      await this.api.initialize();

      // Check if we're in demo mode (backend unavailable)
      this.isDemoMode = !(await this.api.healthCheck());

      // Load saved state if enabled
      if (this.config.enableLocalStorage) {
        const savedState = this.storage.loadState();
        if (savedState) {
          this.stateManager.restoreState(savedState);
        }
      }

      this.isInitialized = true;
      
      if (this.config.debug) {
        if (this.isDemoMode) {
          console.log('KYC Web SDK initialized successfully in DEMO MODE (backend unavailable)');
        } else {
          console.log('KYC Web SDK initialized successfully with backend connection');
        }
      }
    } catch (error) {
      throw new KYCError('Failed to initialize KYC SDK', error as Error);
    }
  }

  /**
   * Start the KYC verification process
   */
  async startVerification(session?: KYCSession): Promise<void> {
    try {
      await this.ensureInitialized();

      if (session) {
        this.stateManager.setSession(session);
      } else if (this.config.sessionId) {
        // Load session from API
        const loadedSession = await this.api.getSession(this.config.sessionId);
        this.stateManager.setSession(loadedSession);
      }

      // Reset to welcome step
      this.stateManager.setCurrentStep('welcome');
      
      // Trigger step change event
      this.triggerStepChange('welcome');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Navigate to next step
   */
  async nextStep(): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const currentStep = this.stateManager.getCurrentStep();
      const data = this.stateManager.getData();
      
      // Validate current step
      const validationResult = this.validator.validateStep(currentStep, data);
      if (!validationResult.isValid) {
        throw new KYCError(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Process step-specific logic
      await this.processStep(currentStep, data);

      // Move to next step
      const nextStep = this.getNextStep(currentStep);
      this.stateManager.setCurrentStep(nextStep);
      
      // Save state if enabled
      if (this.config.enableLocalStorage) {
        this.storage.saveState(this.stateManager.getState());
      }

      // Trigger events
      this.triggerStepChange(nextStep);
      this.triggerProgressUpdate();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    try {
      const currentStep = this.stateManager.getCurrentStep();
      const previousStep = this.getPreviousStep(currentStep);
      
      this.stateManager.setCurrentStep(previousStep);
      
      // Save state if enabled
      if (this.config.enableLocalStorage) {
        this.storage.saveState(this.stateManager.getState());
      }

      // Trigger events
      this.triggerStepChange(previousStep);
      this.triggerProgressUpdate();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Navigate to specific step
   */
  goToStep(step: KYCStep): void {
    try {
      this.stateManager.setCurrentStep(step);
      
      // Save state if enabled
      if (this.config.enableLocalStorage) {
        this.storage.saveState(this.stateManager.getState());
      }

      // Trigger events
      this.triggerStepChange(step);
      this.triggerProgressUpdate();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Update KYC data
   */
  updateData(updates: Partial<KYCData>): void {
    try {
      this.stateManager.updateData(updates);
      
      // Save state if enabled
      if (this.config.enableLocalStorage) {
        this.storage.saveState(this.stateManager.getState());
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get current KYC data
   */
  getData(): KYCData {
    return this.stateManager.getData();
  }

  /**
   * Get current step
   */
  getCurrentStep(): KYCStep {
    return this.stateManager.getCurrentStep();
  }

  /**
   * Get progress information
   */
  getProgress(): KYCProgress {
    return this.stateManager.getProgress();
  }

  /**
   * Get session information
   */
  getSession(): KYCSession | null {
    return this.stateManager.getSession();
  }

  /**
   * Get current KYC state
   */
  getState() {
    return this.stateManager.getState();
  }

  /**
   * Complete verification process
   */
  async completeVerification(): Promise<KYCVerificationResult> {
    try {
      await this.ensureInitialized();
      
      const session = this.stateManager.getSession();
      const data = this.stateManager.getData();
      
      if (!session?.id) {
        throw new KYCError('No active session found');
      }

      // Process final verification
      const result = await this.api.completeVerification(session.id, data);
      
      // Update state
      this.stateManager.setVerificationResult(result);
      
      // Save state if enabled
      if (this.config.enableLocalStorage) {
        this.storage.saveState(this.stateManager.getState());
      }

      // Trigger completion event
      this.triggerVerificationComplete(result);
      
      return result;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Reset KYC process
   */
  reset(): void {
    try {
      this.stateManager.reset();
      
      // Clear storage
      if (this.config.enableLocalStorage) {
        this.storage.clearState();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Destroy SDK instance
   */
  destroy(): void {
    try {
      this.isInitialized = false;
      this.stateManager.reset();
      
      if (this.config.enableLocalStorage) {
        this.storage.clearState();
      }
    } catch (error) {
      console.error('Error destroying KYC SDK:', error);
    }
  }

  /**
   * Update API credentials
   */
  updateCredentials(auth: KYCAuthConfig): void {
    try {
      this.credentials = this.extractCredentials(auth);
      this.validator.validateCredentials(this.credentials);
      this.api.updateCredentials(this.credentials);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get current credentials (without sensitive data)
   */
  getCredentialsInfo(): { hasApiKey: boolean; tenantId?: string; userId?: string } {
    return {
      hasApiKey: !!this.credentials.apiKey,
      tenantId: this.credentials.tenantId,
      userId: this.credentials.userId
    };
  }

  /**
   * Check if SDK is running in demo mode
   */
  getDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get available ID types for the tenant
   */
  async getAvailableIdTypes(): Promise<any[]> {
    try {
      await this.ensureInitialized();
      
      // Get current session info if available
      const session = this.stateManager.getSession();
      const sessionId = session?.id;
      const sessionToken = session?.token;
      
      return await this.api.getAvailableIdTypes(sessionId, sessionToken);
    } catch (error) {
      this.handleError(error as Error);
      return [];
    }
  }

  /**
   * Create a new verification session
   */
  async createVerificationSession(
    tenantId: string,
    idType: string,
    userId?: string,
    callback?: string,
    customData?: any
  ): Promise<KYCSession> {
    try {
      await this.ensureInitialized();
      
      const session = await this.api.createVerificationSession(
        tenantId,
        idType,
        userId,
        callback,
        customData
      );
      
      // Set the session in state manager
      this.stateManager.setSession(session);
      
      return session;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get access to the API for advanced operations
   */
  getAPI() {
    return this.api;
  }

  /**
   * Set session manually (useful for demo mode)
   */
  setSession(session: KYCSession): void {
    this.stateManager.setSession(session);
  }



  // Private methods

  private mergeDefaultConfig(config: KYCConfig): KYCConfig {
    return {
      apiBaseUrl: process.env.NEXT_PUBLIC_VERIFICATION_API_URL || 'http://localhost:3003',
      enableAutoOCR: true,
      enableFaceVerification: true,
      enableProgressTracking: true,
      enableLocalStorage: true,
      timeout: 30000,
      retryAttempts: 3,
      debug: false,
      customStyles: {
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        backgroundColor: '#F8FAFC',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
        buttonStyle: 'default',
        theme: 'light'
      },
                  supportedIDTypes: [], // Now dynamically loaded from backend
      ...config
    };
  }

  private extractCredentials(auth: KYCAuthConfig): KYCAPICredentials {
    return {
      apiKey: auth.apiKey,
      tenantId: auth.tenantId,
      userId: auth.userId,
      sessionToken: auth.sessionToken
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async processStep(step: KYCStep, data: KYCData): Promise<void> {
    switch (step) {
      case 'idScanBack':
        if (this.config.enableAutoOCR && data.idFront && data.idBack) {
          await this.processDocumentVerification(data);
        }
        break;
      case 'selfie':
        if (this.config.enableFaceVerification && data.idFront && data.selfie) {
          await this.processFaceVerification(data);
        }
        break;
      case 'review':
        // Final validation before processing
        break;
      default:
        break;
    }
  }

  private async processDocumentVerification(data: KYCData): Promise<void> {
    try {
      const session = this.stateManager.getSession();
      if (!session?.id || !data.idFront || !data.idBack) {
        return;
      }

      const result = await this.api.processDocumentVerification(
        session.id,
        data.idType,
        data.idFront,
        data.idBack
      );

      if (result.data?.extracted_fields) {
        // Update OCR data
        this.stateManager.updateData({
          ocrData: {
            ...data.ocrData,
            ...result.data.extracted_fields
          }
        });
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('Document verification failed:', error);
      }
    }
  }

  private async processFaceVerification(data: KYCData): Promise<void> {
    try {
      const session = this.stateManager.getSession();
      if (!session?.id || !data.idFront || !data.selfie) {
        return;
      }

      await this.api.processFaceVerification(
        session.id,
        data.selfie,
        data.idFront
      );
    } catch (error) {
      if (this.config.debug) {
        console.warn('Face verification failed:', error);
      }
    }
  }

  private getNextStep(currentStep: KYCStep): KYCStep {
    const stepOrder: KYCStep[] = [
      'welcome',
      'idTypeSelection',
      'idScanFront',
      'idScanBack',
      'ocrPreview',
      'selfie',
      'review',
      'processing',
      'result'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
  }

  private getPreviousStep(currentStep: KYCStep): KYCStep {
    const stepOrder: KYCStep[] = [
      'welcome',
      'idTypeSelection',
      'idScanFront',
      'idScanBack',
      'ocrPreview',
      'selfie',
      'review',
      'processing',
      'result'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.max(currentIndex - 1, 0)];
  }

  private triggerStepChange(step: KYCStep): void {
    if (this.config.onStepChange) {
      this.config.onStepChange(step, this.stateManager.getData());
    }
  }

  private triggerProgressUpdate(): void {
    if (this.config.onProgressUpdate) {
      this.config.onProgressUpdate(this.stateManager.getProgress());
    }
  }

  private triggerVerificationComplete(result: KYCVerificationResult): void {
    if (this.config.onVerificationComplete) {
      this.config.onVerificationComplete(result);
    }
  }

  private handleError(error: Error): void {
    if (this.config.onError) {
      this.config.onError(error);
    } else if (this.config.debug) {
      console.error('KYC SDK Error:', error);
    }
  }
}
