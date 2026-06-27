import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ZeptoMail, buildEmailHtml } from "../_shared/zeptomail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Number of hours the activation credentials remain valid. */
const ACTIVATION_EXPIRY_HOURS = 48;

/** Generate a cryptographically random temporary password. */
function generateTempPassword(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

/** Format an ISO date string to a human-friendly representation. */
function formatExpiry(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with caller's token to check admin role
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const origin = req.headers.get("origin") || "http://localhost:8081";

    // ─── Resend Activation Mode ─────────────────────────────────────────────────
    if (body.resend === true && body.user_id) {
      const { user_id } = body;

      // Fetch the existing user
      const { data: existingUser, error: fetchErr } = await adminClient.auth.admin.getUserById(user_id);
      if (fetchErr || !existingUser?.user) {
        return new Response(JSON.stringify({ error: fetchErr?.message || "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userEmail = existingUser.user.email!;
      const displayName = existingUser.user.user_metadata?.display_name || userEmail.split("@")[0];
      const newPassword = generateTempPassword();
      const newExpiresAt = new Date(Date.now() + ACTIVATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      // Reset password and update activation expiry
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(user_id, {
        password: newPassword,
        user_metadata: {
          ...existingUser.user.user_metadata,
          must_change_password: true,
          activation_expires_at: newExpiresAt,
        },
      });

      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch user role for email
      const { data: userRoleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id)
        .maybeSingle();
      const userRole = userRoleData?.role || "member";

      // Send the activation email
      let emailSent = false;
      let emailError = null;
      try {
        if (ZeptoMail.isConfigured()) {
          const zm = new ZeptoMail();
          const actionUrl = `${origin}/login`;
          const emailHtml = buildActivationEmailHtml({
            displayName,
            email: userEmail,
            password: newPassword,
            role: userRole,
            expiresAt: newExpiresAt,
            actionUrl,
          });

          const result = await zm.send({
            to: userEmail,
            toName: displayName,
            subject: "Your Distribo Account Activation Has Been Renewed",
            html: emailHtml,
          });
          emailSent = result.ok;
          if (!result.ok) {
            emailError = result.error;
            console.error(`[admin-create-user] Resend: Failed to send email to ${userEmail}:`, result.error);
          } else {
            console.log(`[admin-create-user] Resend: Successfully sent activation email to ${userEmail}`);
          }
        } else {
          console.warn("[admin-create-user] Resend: ZeptoMail is not configured. Skipping email sending.");
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("[admin-create-user] Resend: Error sending email:", err);
        emailError = err.message;
      }

      return new Response(
        JSON.stringify({
          success: true,
          resend: true,
          user_id,
          email: userEmail,
          activation_expires_at: newExpiresAt,
          email_sent: emailSent,
          email_error: emailError,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Create New User Mode ───────────────────────────────────────────────────
    const { email, password, display_name, role } = body;

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Email, password, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const activationExpiresAt = new Date(Date.now() + ACTIVATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    // Create user with admin API (auto-confirms email) and must_change_password flag
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        display_name: display_name || email.split("@")[0],
        must_change_password: true,
        activation_expires_at: activationExpiresAt,
      },
    });

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign role
    const { error: roleErr } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleErr) {
      return new Response(JSON.stringify({ error: roleErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email with credentials
    let emailSent = false;
    let emailError = null;
    try {
      if (ZeptoMail.isConfigured()) {
        const zm = new ZeptoMail();
        const actionUrl = `${origin}/login`;
        const emailHtml = buildActivationEmailHtml({
          displayName: display_name || email.split("@")[0],
          email,
          password,
          role,
          expiresAt: activationExpiresAt,
          actionUrl,
        });

        const result = await zm.send({
          to: email,
          toName: display_name || email.split("@")[0],
          subject: "Your Distribo Account Credentials",
          html: emailHtml
        });
        emailSent = result.ok;
        if (!result.ok) {
          emailError = result.error;
          console.error(`[admin-create-user] Failed to send email to ${email}:`, result.error);
        } else {
          console.log(`[admin-create-user] Successfully sent credentials email to ${email}`);
        }
      } else {
        console.warn("[admin-create-user] ZeptoMail is not configured. Skipping email sending.");
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[admin-create-user] Error sending email:", err);
      emailError = err.message;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id, 
        email,
        activation_expires_at: activationExpiresAt,
        email_sent: emailSent,
        email_error: emailError
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


// ─── Activation Email Template ────────────────────────────────────────────────

interface ActivationEmailOpts {
  displayName: string;
  email: string;
  password: string;
  role: string;
  expiresAt: string;
  actionUrl: string;
}

function buildActivationEmailHtml(opts: ActivationEmailOpts): string {
  const { displayName, email, password, role, expiresAt, actionUrl } = opts;
  const formattedExpiry = formatExpiry(expiresAt);

  return buildEmailHtml({
    title: "Account Created",
    body: `
      <p>Hello <strong>${displayName}</strong>,</p>
      <p>An administrator has created your account on Distribo with the role of <strong>${role}</strong>.</p>
      <p>Here are your temporary login credentials:</p>
      <table cellpadding="0" cellspacing="0" style="margin: 20px 0; font-size: 14px;">
        <tr>
          <td style="padding: 4px 8px; font-weight: bold; color: #475569;">Email:</td>
          <td style="padding: 4px 8px; color: #0f172a;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; font-weight: bold; color: #475569;">Password:</td>
          <td style="padding: 4px 8px; color: #0f172a; font-family: monospace; background-color: #f1f5f9; border-radius: 4px;">${password}</td>
        </tr>
      </table>

      <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
        <p style="margin: 0 0 8px; color: #991b1b; font-weight: 700; font-size: 14px;">⏰ Important: 48-Hour Activation Window</p>
        <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;">
          These credentials will <strong>expire on ${formattedExpiry}</strong>. You must log in and change your password before this deadline.
        </p>
        <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;">
          If you do not activate your account within 48 hours, your credentials will become invalid and you will need to <strong>contact your administrator</strong> to request a new activation email.
        </p>
      </div>

      <p style="color: #b91c1c; font-weight: 600;">Important Security Advice:</p>
      <p>You will be required to change this temporary password immediately upon your first login.</p>
    `,
    actionUrl,
    actionLabel: "Log In to Distribo",
    footerNote: "This is an automated security notification. These credentials expire in 48 hours."
  });
}
