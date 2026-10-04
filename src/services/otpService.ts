// Isolated OTP Service for VennZ Verification

export const DEMO_OTP = '123456';

export interface OtpVerificationResult {
  success: boolean;
  error?: string;
}

class OtpService {
  private activeOtp: string = DEMO_OTP;

  /**
   * Sets or generates the active verification code for the session.
   */
  public sendOtp(_phoneNumber: string): string {
    // 123456 is the standard verified test code for VennZ
    this.activeOtp = DEMO_OTP;
    return this.activeOtp;
  }

  /**
   * Validates the provided 6-digit verification code.
   * Strictly enforces that ONLY the correct OTP is accepted.
   * Any incorrect or invalid OTP is rejected.
   */
  public async verifyOtp(code: string): Promise<OtpVerificationResult> {
    // Artificial small latency to simulate authentic network validation
    await new Promise((resolve) => setTimeout(resolve, 200));

    const sanitized = code.trim();

    if (sanitized.length !== 6 || !/^\d{6}$/.test(sanitized)) {
      return {
        success: false,
        error: 'Please enter all six digits of the verification code.',
      };
    }

    // STRICT VALIDATION: Reject any code that does not match the active OTP
    if (sanitized !== this.activeOtp) {
      return {
        success: false,
        error: `Invalid verification code. Please enter the correct 6-digit code (${this.activeOtp}).`,
      };
    }

    return {
      success: true,
    };
  }

  /**
   * Helper for the development / demo quick-fill helper.
   */
  public getDemoCode(): string {
    return this.activeOtp;
  }
}

export const otpService = new OtpService();

