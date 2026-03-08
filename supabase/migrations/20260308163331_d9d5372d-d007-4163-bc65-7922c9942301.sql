
-- Commission auto-calculation function from sales data
CREATE OR REPLACE FUNCTION public.calculate_commissions(p_month text, p_outlet_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_days_in_month integer;
  v_tier text;
  v_volume_bonus numeric;
  v_consistency_bonus numeric;
  v_attendance_bonus numeric;
  v_consistency_multiplier numeric;
  v_total_commission numeric;
BEGIN
  v_days_in_month := 26; -- working days

  FOR v_rec IN
    SELECT 
      v.id as vendor_id,
      v.outlet_id,
      COALESCE(SUM(s.total_value), 0) as total_sales,
      COUNT(DISTINCT s.date) as days_worked,
      COUNT(DISTINCT ci.date) as days_active,
      CASE WHEN COUNT(DISTINCT s.date) > 0 
        THEN COALESCE(SUM(s.total_value), 0) / COUNT(DISTINCT s.date)
        ELSE 0 
      END as avg_daily_sales
    FROM vendors v
    LEFT JOIN sales s ON s.vendor_id = v.id 
      AND to_char(s.date, 'YYYY-MM') = p_month
    LEFT JOIN check_ins ci ON ci.vendor_id = v.id 
      AND to_char(ci.date, 'YYYY-MM') = p_month
    WHERE v.status = 'active'
      AND (p_outlet_id IS NULL OR v.outlet_id = p_outlet_id)
    GROUP BY v.id, v.outlet_id
    HAVING COALESCE(SUM(s.total_value), 0) > 0
  LOOP
    -- Calculate consistency rate
    DECLARE
      v_consistency_rate numeric;
    BEGIN
      v_consistency_rate := CASE WHEN v_days_in_month > 0 
        THEN ROUND((v_rec.days_active::numeric / v_days_in_month) * 100) 
        ELSE 0 END;

      -- Determine tier
      IF v_rec.total_sales >= 300000 THEN v_tier := 'gold';
      ELSIF v_rec.total_sales >= 200000 THEN v_tier := 'silver';
      ELSE v_tier := 'bronze';
      END IF;

      -- Volume bonus: percentage of sales
      v_volume_bonus := CASE 
        WHEN v_tier = 'gold' THEN v_rec.total_sales * 0.02
        WHEN v_tier = 'silver' THEN v_rec.total_sales * 0.015
        ELSE v_rec.total_sales * 0.01
      END;

      -- Consistency bonus
      v_consistency_bonus := CASE 
        WHEN v_consistency_rate >= 90 THEN 4000
        WHEN v_consistency_rate >= 75 THEN 2500
        WHEN v_consistency_rate >= 60 THEN 1500
        ELSE 800
      END;

      -- Attendance bonus
      v_attendance_bonus := CASE 
        WHEN v_rec.days_active >= 24 THEN 2500
        WHEN v_rec.days_active >= 20 THEN 2000
        WHEN v_rec.days_active >= 15 THEN 1200
        ELSE 500
      END;

      -- Consistency multiplier
      v_consistency_multiplier := CASE 
        WHEN v_consistency_rate >= 85 THEN 1.15
        WHEN v_consistency_rate >= 70 THEN 1.08
        WHEN v_consistency_rate >= 50 THEN 1.02
        ELSE 1.00
      END;

      v_total_commission := ROUND((v_volume_bonus + v_consistency_bonus + v_attendance_bonus) * v_consistency_multiplier);

      -- Upsert commission
      INSERT INTO commissions (vendor_id, outlet_id, month, total_sales, days_worked, days_active,
        avg_daily_sales, consistency_rate, consistency_multiplier, consistency_bonus,
        attendance_bonus, volume_bonus, total_commission, tier, status)
      VALUES (v_rec.vendor_id, v_rec.outlet_id, p_month, v_rec.total_sales, v_rec.days_worked,
        v_rec.days_active, v_rec.avg_daily_sales, v_consistency_rate, v_consistency_multiplier,
        v_consistency_bonus, v_attendance_bonus, v_volume_bonus, v_total_commission, v_tier, 'pending')
      ON CONFLICT (vendor_id, month) DO UPDATE SET
        outlet_id = EXCLUDED.outlet_id,
        total_sales = EXCLUDED.total_sales,
        days_worked = EXCLUDED.days_worked,
        days_active = EXCLUDED.days_active,
        avg_daily_sales = EXCLUDED.avg_daily_sales,
        consistency_rate = EXCLUDED.consistency_rate,
        consistency_multiplier = EXCLUDED.consistency_multiplier,
        consistency_bonus = EXCLUDED.consistency_bonus,
        attendance_bonus = EXCLUDED.attendance_bonus,
        volume_bonus = EXCLUDED.volume_bonus,
        total_commission = EXCLUDED.total_commission,
        tier = EXCLUDED.tier,
        updated_at = now();
    END;
  END LOOP;
END;
$$;

-- Add unique constraint for commission upsert
ALTER TABLE commissions ADD CONSTRAINT commissions_vendor_month_unique UNIQUE (vendor_id, month);

-- Stock level adjustment on allocation creation
CREATE OR REPLACE FUNCTION public.adjust_stock_on_allocation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stock_levels 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = now()
  WHERE product_id = NEW.product_id 
    AND outlet_id = (SELECT outlet_id FROM allocations WHERE id = NEW.allocation_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_adjust_stock_allocation
AFTER INSERT ON allocation_items
FOR EACH ROW EXECUTE FUNCTION adjust_stock_on_allocation();

-- Stock level adjustment on delivery receipt
CREATE OR REPLACE FUNCTION public.adjust_stock_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only adjust when status changes to 'received'
  IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
    INSERT INTO stock_levels (product_id, outlet_id, current_stock)
    SELECT di.product_id, NEW.outlet_id, di.quantity
    FROM delivery_items di WHERE di.delivery_id = NEW.id
    ON CONFLICT (product_id, outlet_id) DO UPDATE
    SET current_stock = stock_levels.current_stock + EXCLUDED.current_stock,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Need unique constraint for stock_levels upsert
ALTER TABLE stock_levels ADD CONSTRAINT stock_levels_product_outlet_unique UNIQUE (product_id, outlet_id);

CREATE TRIGGER trg_adjust_stock_delivery
AFTER UPDATE ON inbound_deliveries
FOR EACH ROW EXECUTE FUNCTION adjust_stock_on_delivery();
