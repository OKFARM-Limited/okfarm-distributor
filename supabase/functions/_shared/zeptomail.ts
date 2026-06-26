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

// ─── Category-Specific Email Templates ────────────────────────────────────────

/** Notification category for template styling */
export type NotificationCategory = 'stock' | 'payment' | 'sales' | 'system';

interface CategoryTheme {
  gradient: string;       // CSS linear-gradient for header
  badgeLabel: string;     // e.g. "STOCK ALERT"
  badgeBg: string;        // Badge background color
  badgeColor: string;     // Badge text color
  accentColor: string;    // CTA button + accents
  icon: string;           // Emoji icon
  defaultCta: string;     // Default CTA label
  subtitleColor: string;  // "by OKFARM" subtitle color
}

const CATEGORY_THEMES: Record<NotificationCategory, CategoryTheme> = {
  stock: {
    gradient: 'linear-gradient(135deg,#991b1b 0%,#ea580c 100%)',
    badgeLabel: 'STOCK ALERT',
    badgeBg: '#fef2f2',
    badgeColor: '#dc2626',
    accentColor: '#dc2626',
    icon: '\u{1F4E6}',
    defaultCta: 'View Inventory',
    subtitleColor: '#fca5a5',
  },
  payment: {
    gradient: 'linear-gradient(135deg,#5b21b6 0%,#4f46e5 100%)',
    badgeLabel: 'PAYMENT ALERT',
    badgeBg: '#f5f3ff',
    badgeColor: '#7c3aed',
    accentColor: '#7c3aed',
    icon: '\u{1F4B3}',
    defaultCta: 'View Payments',
    subtitleColor: '#c4b5fd',
  },
  sales: {
    gradient: 'linear-gradient(135deg,#065f46 0%,#0d9488 100%)',
    badgeLabel: 'SALES UPDATE',
    badgeBg: '#ecfdf5',
    badgeColor: '#059669',
    accentColor: '#059669',
    icon: '\u{1F4CA}',
    defaultCta: 'View Sales',
    subtitleColor: '#6ee7b7',
  },
  system: {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#2563EB 100%)',
    badgeLabel: 'SYSTEM NOTICE',
    badgeBg: '#eff6ff',
    badgeColor: '#2563eb',
    accentColor: '#2563EB',
    icon: '\u{2139}\u{FE0F}',
    defaultCta: 'Open Distribo',
    subtitleColor: '#93c5fd',
  },
};

/**
 * Maps a notification type string to a template category.
 */
export function resolveCategory(type?: string): NotificationCategory {
  if (!type) return 'system';
  switch (type) {
    case 'stock':
    case 'low_stock':
    case 'expiry':
      return 'stock';
    case 'payment':
      return 'payment';
    case 'sales':
    case 'sale':
      return 'sales';
    default:
      return 'system';
  }
}

export interface TypedEmailTemplateOptions extends EmailTemplateOptions {
  /** Notification type from the notifications table (e.g. 'stock', 'payment', 'sales', 'info') */
  type?: string;
}

/**
 * Generates a category-themed, branded HTML email.
 * Uses distinct color schemes, icons, and badges per notification category.
 */
export function buildTypedEmailHtml(opts: TypedEmailTemplateOptions): string {
  const category = resolveCategory(opts.type);
  const theme = CATEGORY_THEMES[category];
  const { title, body, footerNote } = opts;
  const actionUrl = opts.actionUrl;
  const actionLabel = opts.actionLabel || theme.defaultCta;

  const ctaBlock = actionUrl
    ? `<tr><td style="padding:24px 0 0;">
        <a href="${actionUrl}"
           style="display:inline-block;background:${theme.accentColor};color:#fff;font-weight:600;
                  font-size:14px;padding:11px 22px;border-radius:7px;text-decoration:none;">
          ${actionLabel}
        </a>
       </td></tr>`
    : '';

  const footer = footerNote
    ? `<p style="font-size:12px;color:#94a3b8;margin:0;">${footerNote}</p>`
    : `<p style="font-size:12px;color:#94a3b8;margin:0;">
         You're receiving this because you enabled email notifications in Distribo.
         Visit <b>Settings &rarr; Notification Preferences</b> to manage your alerts.
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
          <td style="background:${theme.gradient};padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:.3px;">Distribo</span>
                <span style="color:${theme.subtitleColor};font-size:12px;margin-left:10px;">by OKFARM</span>
              </td>
              <td align="right">
                <span style="display:inline-block;background:${theme.badgeBg};color:${theme.badgeColor};
                             font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;
                             letter-spacing:.5px;">
                  ${theme.icon}&nbsp; ${theme.badgeLabel}
                </span>
              </td>
            </tr></table>
          </td>
        </tr>
        <!-- Category accent bar -->
        <tr>
          <td style="height:3px;background:${theme.accentColor};font-size:0;line-height:0;">&nbsp;</td>
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
