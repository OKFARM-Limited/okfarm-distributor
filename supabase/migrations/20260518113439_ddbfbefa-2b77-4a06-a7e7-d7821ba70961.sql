
-- Enable pg_net for HTTP calls from triggers (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger function: when a notification is inserted, look up users with email enabled
-- and a matching category preference, then enqueue an email via the send-notification-email
-- edge function. Reads target URL + key from app_settings.
CREATE OR REPLACE FUNCTION public.dispatch_notification_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_category text;
  v_rec RECORD;
  v_action_url text;
BEGIN
  -- Resolve config (set via app_settings; safe no-op if missing)
  SELECT (value::text)::text INTO v_base_url FROM app_settings WHERE key = 'edge_functions_url';
  SELECT (value::text)::text INTO v_anon_key FROM app_settings WHERE key = 'edge_functions_anon_key';
  v_base_url := trim(both '"' from COALESCE(v_base_url, ''));
  v_anon_key := trim(both '"' from COALESCE(v_anon_key, ''));

  IF v_base_url = '' OR v_anon_key = '' THEN
    RETURN NEW;
  END IF;

  -- Map notification.type -> preference category
  v_category := CASE
    WHEN NEW.type IN ('stock','low_stock') THEN 'cat_stock'
    WHEN NEW.type = 'payment' THEN 'cat_payment'
    WHEN NEW.type = 'sales' THEN 'cat_sales'
    ELSE 'cat_system'
  END;

  v_action_url := CASE WHEN NEW.action_url IS NOT NULL
    THEN 'https://okfarm-distributor.lovable.app' || NEW.action_url
    ELSE NULL END;

  -- Targeted recipient: only that user (if they opted into email + category)
  IF NEW.user_id IS NOT NULL THEN
    FOR v_rec IN
      SELECT COALESCE(np.email_address, p.email) AS email
      FROM notification_preferences np
      LEFT JOIN profiles p ON p.user_id = np.user_id
      WHERE np.user_id = NEW.user_id
        AND np.channel_email = true
        AND (
          (v_category = 'cat_stock'   AND np.cat_stock)   OR
          (v_category = 'cat_payment' AND np.cat_payment) OR
          (v_category = 'cat_sales'   AND np.cat_sales)   OR
          (v_category = 'cat_system'  AND np.cat_system)
        )
        AND COALESCE(np.email_address, p.email) IS NOT NULL
        AND np.daily_digest = false  -- digest-only users get morning digest instead
    LOOP
      PERFORM net.http_post(
        url := v_base_url || '/send-notification-email',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'apikey', v_anon_key,
          'Authorization','Bearer ' || v_anon_key
        ),
        body := jsonb_build_object(
          'to', v_rec.email,
          'subject', NEW.title,
          'title', NEW.title,
          'body', NEW.message,
          'action_url', v_action_url
        )
      );
    END LOOP;
    RETURN NEW;
  END IF;

  -- Broadcast: send to admins + managers (optionally outlet-scoped)
  FOR v_rec IN
    SELECT DISTINCT COALESCE(np.email_address, p.email) AS email
    FROM user_roles ur
    LEFT JOIN profiles p ON p.user_id = ur.user_id
    LEFT JOIN notification_preferences np ON np.user_id = ur.user_id
    WHERE ur.role IN ('admin','manager')
      AND COALESCE(np.channel_email, true) = true
      AND COALESCE(np.daily_digest, false) = false
      AND (
        (v_category = 'cat_stock'   AND COALESCE(np.cat_stock,   true)) OR
        (v_category = 'cat_payment' AND COALESCE(np.cat_payment, true)) OR
        (v_category = 'cat_sales'   AND COALESCE(np.cat_sales,   true)) OR
        (v_category = 'cat_system'  AND COALESCE(np.cat_system,  true))
      )
      AND COALESCE(np.email_address, p.email) IS NOT NULL
  LOOP
    PERFORM net.http_post(
      url := v_base_url || '/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'apikey', v_anon_key,
        'Authorization','Bearer ' || v_anon_key
      ),
      body := jsonb_build_object(
        'to', v_rec.email,
        'subject', NEW.title,
        'title', NEW.title,
        'body', NEW.message,
        'action_url', v_action_url
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dispatch_notification_emails ON public.notifications;
CREATE TRIGGER trg_dispatch_notification_emails
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_notification_emails();
