const { Resend } = require("resend");
const env = require("../config/env");

const buildOtpTemplate = ({ otp, expiresInMinutes }) => {
  const email = "support@splitease.com";
  const landing = "https://splitease.com";

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body
      style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      "
    >
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="background-color: #f4f4f5; padding: 32px 16px;"
      >
        <tr>
          <td align="center">
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="max-width: 480px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7;"
            >
              <tr>
                <td style="padding: 32px 32px 0 32px;">
                  <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #18181b;">
                    Verify your email
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #71717a;">
                    Use the 6-digit code below to verify your SplitEase account.
                    This code expires in <strong>${expiresInMinutes} minutes</strong>.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 8px 32px 0 32px;">
                  <div
                    style="
                      display: inline-block;
                      letter-spacing: 12px;
                      font-size: 32px;
                      font-weight: 700;
                      color: #18181b;
                      background-color: #fafafa;
                      border: 1px solid #e4e4e7;
                      border-radius: 8px;
                      padding: 16px 24px;
                    "
                  >
                    ${otp}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 32px;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #71717a;">
                    If you didn't request this code, you can safely ignore this
                    email. Your account stays protected.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 24px 32px; border-top: 1px solid #f4f4f5;">
                  <p style="margin: 16px 0 0 0; font-size: 12px; line-height: 1.6; color: #a1a1aa;">
                    SplitEase — split expenses effortlessly.
                    <br />
                    <a href="${email}" style="color: #71717a; text-decoration: none;">${email}</a> ·
                    <a href="${landing}" style="color: #71717a; text-decoration: none;">splitease.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const isTest = process.env.NODE_ENV === "test";

  if (isTest || !env.email.resendApiKey) {
    // No network calls without a Resend key. In development the code is logged
    // so the flow can be exercised end-to-end locally.
    if (isTest) {
      return { id: `dev-${Date.now()}`, deliveredTo: to };
    }

    console.log(
      `[email:dev] Would send "${subject}" to ${to} (set RESEND_API_KEY to send for real).`,
    );
    console.log(
      `[email:dev] ${
        text ||
        html
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      }`,
    );
    return { id: `dev-${Date.now()}`, deliveredTo: to };
  }

  const resend = new Resend(env.email.resendApiKey);
  const { data, error } = await resend.emails.send({
    from: env.email.fromEmail,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { id: data?.id, deliveredTo: to };
};

const sendVerificationOtpEmail = async ({ to, otp, expiresInMinutes }) => {
  const html = buildOtpTemplate({ otp, expiresInMinutes });
  const text = `Your SplitEase verification code is ${otp}. It expires in ${expiresInMinutes} minutes. If you didn't request this code, you can safely ignore this email.`;

  return sendEmail({
    to,
    subject: "Your SplitEase verification code",
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendVerificationOtpEmail,
};
