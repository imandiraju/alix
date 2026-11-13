export async function sendOtpEmail(email: string, otp: string, name?: string): Promise<boolean> {
  const scriptUrl = process.env.GOOGLE_APPSCRIPT_URL;

  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp,
          name: name?.trim() || 'Educator',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn(`[ALIX Mailer] Apps Script returned status ${response.status}`);
      } else {
        console.log(`[ALIX Mailer] ✉️ Successfully sent OTP via Google Apps Script to ${email}`);
      }
      return true;
    } catch (err: any) {
      console.error('[ALIX Mailer] Error contacting Google Apps Script Webhook:', err.message);
      return false;
    }
  } else {
    console.log(`[ALIX Mailer] Notice: Set GOOGLE_APPSCRIPT_URL to dispatch live emails to ${email}. (Generated code: ${otp})`);
    return true;
  }
}
