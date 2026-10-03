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
    await new Promise((resolve) => setTimeout(resolve, 200));

    const sanitized = code.trim();

    if (sanitized.length !== 6) {
      return {
        success: false,
        error: 'Please enter all six digits of the verification code.',
      };
    }

    if (sanitized === DEMO_OTP) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: 'Incorrect verification code. Please try again.',
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
