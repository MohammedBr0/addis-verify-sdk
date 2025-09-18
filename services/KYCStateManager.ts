// KYC State Management Service
import { KYCStep, KYCData, KYCProgress, KYCVerificationResult, KYCSession, KYCStepInfo } from '../types/KYCTypes';
import { OCRFieldMapping } from '../types/KYCTypes';

export interface KYCState {
  currentStep: KYCStep;
  data: KYCData;
  session: KYCSession | null;
  verificationResult: KYCVerificationResult | null;
  stepHistory: KYCStep[];
}

export class KYCStateManager {
  private state: KYCState;
  private readonly stepOrder: KYCStep[] = [
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

  constructor() {
    this.state = this.getInitialState();
  }

  getState(): KYCState {
    return { ...this.state };
  }

  restoreState(state: KYCState): void {
    this.state = { ...state };
  }

  getCurrentStep(): KYCStep {
    return this.state.currentStep;
  }

  setCurrentStep(step: KYCStep): void {
    this.state.currentStep = step;
    this.state.stepHistory.push(step);
  }

  getData(): KYCData {
    return { ...this.state.data };
  }

  updateData(updates: Partial<KYCData>): void {
    this.state.data = { ...this.state.data, ...updates };
  }

  getSession(): KYCSession | null {
    return this.state.session;
  }

  setSession(session: KYCSession): void {
    this.state.session = session;
  }

  getVerificationResult(): KYCVerificationResult | null {
    return this.state.verificationResult;
  }

  setVerificationResult(result: KYCVerificationResult): void {
    this.state.verificationResult = result;
  }

  getProgress(): KYCProgress {
    const currentStepIndex = this.stepOrder.indexOf(this.state.currentStep);
    const progressSteps = this.stepOrder.map((step, index) => ({
      step,
      title: this.getStepTitle(step),
      description: this.getStepDescription(step),
      isCompleted: index < currentStepIndex,
      isCurrent: index === currentStepIndex,
      canGoBack: index < currentStepIndex
    }));

    return {
      currentStep: this.state.currentStep,
      currentStepIndex,
      totalSteps: this.stepOrder.length,
      progressSteps,
      canGoNext: currentStepIndex < this.stepOrder.length - 1,
      canGoBack: currentStepIndex > 0
    };
  }

  reset(): void {
    this.state = this.getInitialState();
  }

  private getInitialState(): KYCState {
    return {
      currentStep: 'welcome',
      data: {
        idType: '',
        idFront: null,
        idBack: null,
        selfie: null,
        ocrData: this.getDefaultOCRData()
      },
      session: null,
      verificationResult: null,
      stepHistory: ['welcome']
    };
  }

  private getDefaultOCRData(): OCRFieldMapping {
    return {
      fullName: '',
      dateOfBirth: '',
      dateOfExpiry: '2025-12-31',
      gender: '',
      idNumber: '',
      issuingAuthority: 'Government of Ethiopia'
    };
  }

  private getStepTitle(step: KYCStep): string {
    const titles: Record<KYCStep, string> = {
      welcome: 'Welcome',
      idTypeSelection: 'Select ID Type',
      idScanFront: 'Scan Front of ID',
      idScanBack: 'Scan Back of ID',
      ocrPreview: 'Review Information',
      selfie: 'Take Selfie',
      review: 'Review & Confirm',
      processing: 'Processing',
      result: 'Verification Result'
    };
    return titles[step];
  }

  private getStepDescription(step: KYCStep): string {
    const descriptions: Record<KYCStep, string> = {
      welcome: 'Start your identity verification process',
      idTypeSelection: 'Choose the type of identification document',
      idScanFront: 'Capture the front side of your document',
      idScanBack: 'Capture the back side of your document',
      ocrPreview: 'Review and edit extracted information',
      selfie: 'Take a photo of yourself for verification',
      review: 'Review all information before submission',
      processing: 'Verifying your identity',
      result: 'View your verification result'
    };
    return descriptions[step];
  }
}
