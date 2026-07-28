/**
 * Transactional email via Resend's HTTP API (no SMTP — works on hosts that
 * block outbound SMTP ports, only needs outbound HTTPS).
 */
import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Email is not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your Sanad Academy password / إعادة تعيين كلمة المرور",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <p>You requested a password reset for your Sanad Academy account.</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #14b8a6; color: #fff; text-decoration: none; border-radius: 8px;">Reset password</a></p>
          <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <div dir="rtl" style="text-align: right;">
            <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك في أكاديمية سند.</p>
            <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #14b8a6; color: #fff; text-decoration: none; border-radius: 8px;">إعادة تعيين كلمة المرور</a></p>
            <p>تنتهي صلاحية هذا الرابط خلال 30 دقيقة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
