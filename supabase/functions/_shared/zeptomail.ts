/**
 * ZeptoMail transactional email helper for Supabase Edge Functions.
 *
 * Required Supabase Edge Function secrets (Dashboard → Settings → Edge Functions → Secrets):
 *
 *   ZEPTOMAIL_API_TOKEN  — The full token string from ZeptoMail dashboard, e.g.:
 *                          "Zoho-enczapikey wSsVR61080Lx..."
 *                          (copy exactly as shown — including the "Zoho-enczapikey " prefix)
 *
 *   ZEPTOMAIL_FROM_EMAIL — Verified sender address, e.g. "noreply@distribo.com.ng"
 *
 *   ZEPTOMAIL_FROM_NAME  — Display name, e.g. "Distribo" (optional, defaults to "Distribo")
 */

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.com/v1.1/email';

export interface ZeptoMailPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback */
  text?: string;
}

export class ZeptoMail {
  private readonly token: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    const token = Deno.env.get('ZEPTOMAIL_API_TOKEN');
    const fromEmail = Deno.env.get('ZEPTOMAIL_FROM_EMAIL');
    const fromName = Deno.env.get('ZEPTOMAIL_FROM_NAME') ?? 'Distribo';

    if (!token || !fromEmail) {
      throw new Error(
        'ZeptoMail not configured. Set ZEPTOMAIL_API_TOKEN and ZEPTOMAIL_FROM_EMAIL ' +
        'in Supabase Dashboard → Settings → Edge Functions → Secrets.'
      );
    }

    this.token = token;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /** Returns true if ZeptoMail secrets are present (non-throwing check). */
  static isConfigured(): boolean {
    return !!(Deno.env.get('ZEPTOMAIL_API_TOKEN') && Deno.env.get('ZEPTOMAIL_FROM_EMAIL'));
  }

  async send(payload: ZeptoMailPayload): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    const body = {
      from: {
        address: this.fromEmail,
        name: this.fromName,
      },
      to: [
        {
          email_address: {
            address: payload.to,
            name: payload.toName ?? payload.to,
          },
        },
      ],
      subject: payload.subject,
      htmlbody: payload.html,
      ...(payload.text ? { textbody: payload.text } : {}),
    };

    let res: Response;
    try {
      res = await fetch(ZEPTOMAIL_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // The token from ZeptoMail already includes "Zoho-enczapikey " prefix — use as-is.
          'Authorization': this.token,
        },
        body: JSON.stringify(body),
      });
    } catch (networkErr: any) {
      console.error('[ZeptoMail] Network error:', networkErr.message);
      return { ok: false, error: `Network error: ${networkErr.message}` };
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`[ZeptoMail] API error ${res.status}:`, text);
      return { ok: false, error: `ZeptoMail API ${res.status}: ${text}` };
    }

    const json = await res.json();
    const messageId = json?.data?.[0]?.message_id ?? undefined;
    return { ok: true, messageId };
  }
}

// ─── HTML Template Builder ────────────────────────────────────────────────────

export interface EmailTemplateOptions {
  title: string;
  body: string;          // HTML string
  actionUrl?: string;
  actionLabel?: string;
  footerNote?: string;
}

/**
 * Generates a branded, responsive HTML email using the Distribo design.
 */
export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const { title, body, actionUrl, actionLabel = 'Open Distribo', footerNote } = opts;

  const ctaBlock = actionUrl
    ? `<tr><td style="padding:24px 0 0;">
        <a href="${actionUrl}"
           style="display:inline-block;background:#2563EB;color:#fff;font-weight:600;
                  font-size:14px;padding:11px 22px;border-radius:7px;text-decoration:none;">
          ${actionLabel}
        </a>
       </td></tr>`
    : '';

  const footer = footerNote
    ? `<p style="font-size:12px;color:#94a3b8;margin:0;">${footerNote}</p>`
    : `<p style="font-size:12px;color:#94a3b8;margin:0;">
         You're receiving this because you enabled email notifications in Distribo.
         Visit <b>Settings → Notification Preferences</b> to manage your alerts.
       </p>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563EB 100%);padding:20px 32px;">
            <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:.3px;">Distribo</span>
            <span style="color:#93c5fd;font-size:12px;margin-left:10px;">by OKFARM</span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td>
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">${title}</h1>
                <div style="font-size:15px;line-height:1.65;color:#334155;">${body}</div>
              </td></tr>
              ${ctaBlock}
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px 28px;">
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;" />
            ${footer}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
