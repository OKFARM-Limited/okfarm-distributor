-- ============================================================
-- Phase 6 Item 1: Fix notification trigger (best-effort email)
-- Phase 6 Item 3: Transactional payout + commission update RPC
-- ============================================================

-- 1. Fix the dispatch_notification_emails trigger to be best-effort
-- The old function crashes if the Edge Function URL is malformed.
-- This version wraps the HTTP call in EXCEPTION handling so notification
-- inserts NEVER fail, even if the email dispatch does.
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
  -- Resolve config
  SELECT value #>> '{}' INTO v_base_url FROM app_settings WHERE key = 'edge_functions_url';
  SELECT value #>> '{}' INTO v_anon_key FROM app_settings WHERE key = 'edge_functions_anon_key';

  IF v_base_url IS NULL OR v_base_url = '' OR v_anon_key IS NULL OR v_anon_key = '' THEN
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
    THEN 'https://distribo.com.ng' || NEW.action_url
    ELSE NULL END;

  -- Targeted recipient
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
        AND np.daily_digest = false
    LOOP
      BEGIN
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
            'message', NEW.message,
            'action_url', v_action_url
          )
        );
      EXCEPTION WHEN OTHERS THEN
        -- Best-effort: log but don't block the insert
        RAISE WARNING 'dispatch_notification_emails: failed to send email to %: %', v_rec.email, SQLERRM;
      END;
    END LOOP;
  ELSE
    -- Broadcast: all users with matching preferences
    FOR v_rec IN
      SELECT COALESCE(np.email_address, p.email) AS email
      FROM notification_preferences np
      LEFT JOIN profiles p ON p.user_id = np.user_id
      WHERE np.channel_email = true
        AND (
          (v_category = 'cat_stock'   AND np.cat_stock)   OR
          (v_category = 'cat_payment' AND np.cat_payment) OR
          (v_category = 'cat_sales'   AND np.cat_sales)   OR
          (v_category = 'cat_system'  AND np.cat_system)
        )
        AND COALESCE(np.email_address, p.email) IS NOT NULL
        AND np.daily_digest = false
    LOOP
      BEGIN
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
            'message', NEW.message,
            'action_url', v_action_url
          )
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'dispatch_notification_emails: failed to send email to %: %', v_rec.email, SQLERRM;
      END;
    END LOOP;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Outer safety net: never let the trigger block notification inserts
  RAISE WARNING 'dispatch_notification_emails: outer error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 2. Transactional payout RPC
CREATE OR REPLACE FUNCTION public.create_payout_with_status(
  p_commission_id UUID,
  p_vendor_id UUID,
  p_amount NUMERIC,
  p_method TEXT DEFAULT 'mobile_money',
  p_reference TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout_id UUID;
BEGIN
  -- Insert payout
  INSERT INTO public.payouts (commission_id, vendor_id, amount, method, reference, status, disbursed_at)
  VALUES (p_commission_id, p_vendor_id, p_amount, p_method, p_reference, 'completed', now())
  RETURNING id INTO v_payout_id;

  -- Update commission status atomically
  UPDATE public.commissions
  SET status = 'disbursed', updated_at = now()
  WHERE id = p_commission_id;

  RETURN v_payout_id;
END;
$$;
