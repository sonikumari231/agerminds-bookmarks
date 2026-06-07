import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = "Linkt";

export async function sendWelcomeEmail({
  to,
  handle,
  confirmationUrl,
}: {
  to: string;
  handle: string;
  confirmationUrl: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: `Welcome to ${APP_NAME}, @${handle} 👋`,
    html: buildWelcomeHtml({ handle, confirmationUrl }),
    text: buildWelcomeText({ handle, confirmationUrl }),
  });

  if (error) {
    console.error("[Resend] Failed to send welcome email:", error);
  }

  return { data, error };
}

function buildWelcomeHtml({
  handle,
  confirmationUrl,
}: {
  handle: string;
  confirmationUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f2;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fefcf9;border:1px solid #e8ddd3;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1e1714;padding:32px 40px;">
              <p style="margin:0;font-size:28px;color:#fdf8f2;letter-spacing:-0.5px;">${APP_NAME}</p>
              <p style="margin:6px 0 0;font-size:13px;color:#9a8270;font-family:monospace;">your personal bookmark shelf</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:24px;color:#1e1714;font-weight:normal;">
                Hello, <span style="color:#527040;">@${handle}</span> 👋
              </h1>
              <p style="margin:0 0 20px;font-size:16px;color:#4a3932;line-height:1.6;">
                Welcome aboard. Your account is almost ready — just click the button below to confirm your email address and activate it.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="background:#1e1714;border-radius:6px;">
                    <a href="${confirmationUrl}"
                       style="display:inline-block;padding:14px 32px;color:#fdf8f2;text-decoration:none;font-size:15px;font-family:monospace;letter-spacing:0.5px;">
                      Confirm my email →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:14px;color:#7c6355;line-height:1.6;">
                Once confirmed, your public profile will be live at:<br />
                <a href="${APP_URL}/${handle}" style="color:#527040;font-family:monospace;">${APP_URL}/${handle}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#9a8270;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5f0eb;padding:20px 40px;border-top:1px solid #e8ddd3;">
              <p style="margin:0;font-size:12px;color:#9a8270;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeText({
  handle,
  confirmationUrl,
}: {
  handle: string;
  confirmationUrl: string;
}) {
  return `Welcome to ${APP_NAME}, @${handle}!

Please confirm your email address by visiting:
${confirmationUrl}

Once confirmed, your public profile will be live at:
${APP_URL}/${handle}

If you didn't create this account, you can safely ignore this email.

— The ${APP_NAME} team`;
}
