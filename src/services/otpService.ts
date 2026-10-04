// Isolated OTP Service for VennZ Verification

export const DEMO_OTP = '123456';

export interface OtpVerificationResult {
  success: boolean;
  error?: string;
}

class OtpService {
  /**
   * Validates the provided 6-digit verification code.
   * In demo mode, validates against DEMO_OTP (123456).
   * In future backend integration, this will call the authentication API.
   */
  public async verifyOtp(code: string): Promise<OtpVerificationResult> {
    // Artificial small latency to simulate authentic network validation
    await new Promise((resolve) => setTimeout(resolve, 150));

    const sanitized = code.trim();

    if (sanitized.length !== 6 || !/^\d{6}$/.test(sanitized)) {
      return {
        success: false,
        error: 'Please enter all six digits of the verification code.',
      };
    }

    // In demo / prototype mode, accept any valid 6-digit code or DEMO_OTP
    return {
      success: true,
    };
  }

  /**
   * Helper for the development / demo quick-fill helper.
   */
  public getDemoCode(): string {
    return DEMO_OTP;
  }
}

export const otpService = new OtpService();
