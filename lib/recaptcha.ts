/**
 * Verifies a reCAPTCHA token with Google's API
 * @param token The client-side reCAPTCHA response token
 * @returns boolean indicating if verification passed
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      // Never open captcha in production without a secret
      if (process.env.NODE_ENV === 'production') {
        console.error('RECAPTCHA_SECRET_KEY is not set in production.');
        return false;
      }
      console.warn('reCAPTCHA secret key is not set. Allowing request in development only.');
      return true;
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}
