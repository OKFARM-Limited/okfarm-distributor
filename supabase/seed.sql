-- =============================================
-- OKFARM Distributor Manager — Seed Data
-- Covers ALL features with realistic FanMilk Nigeria data
-- Run via: supabase db reset (includes seed) or execute directly
-- =============================================

-- =============================================
-- 1. OUTLETS (3 branch locations)
-- =============================================
INSERT INTO public.outlets (id, short_code, name, address, manager, phone, status, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'IKJ', 'Ikeja Main Depot', '12 Allen Avenue, Ikeja, Lagos', 'Adebayo Ogunleye', '+234 801 234 5678', 'active', 'Primary distribution hub serving mainland Lagos'),
  ('a0000000-0000-0000-0000-000000000002', 'LKI', 'Lekki Branch', '45 Admiralty Way, Lekki Phase 1, Lagos', 'Chioma Nwankwo', '+234 802 345 6789', 'active', 'Island operations covering Lekki, VI, and Ajah'),
  ('a0000000-0000-0000-0000-000000000003', 'SRL', 'Surulere Branch', '8 Adeniran Ogunsanya St, Surulere, Lagos', 'Tunde Bakare', '+234 803 456 7890', 'active', 'Mid-Lagos coverage from Surulere to Mushin');

-- =============================================
-- 2. PRODUCTS (10 FanMilk products)
-- =============================================
INSERT INTO public.products (id, sku, name, category, unit_price, unit, barcode) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'FM-FANYOGO-115', 'FanYogo 115ml', 'Yogurt', 200, 'pack', '5901234567001'),
  ('b0000000-0000-0000-0000-000000000002', 'FM-FANYOGO-250', 'FanYogo 250ml', 'Yogurt', 350, 'pack', '5901234567002'),
  ('b0000000-0000-0000-0000-000000000003', 'FM-FANICE-65', 'FanIce 65ml', 'Ice Cream', 100, 'pack', '5901234567003'),
  ('b0000000-0000-0000-0000-000000000004', 'FM-FANICE-150', 'FanIce 150ml', 'Ice Cream', 200, 'pack', '5901234567004'),
  ('b0000000-0000-0000-0000-000000000005', 'FM-FANDANGO-100', 'FanDango 100ml', 'Ice Cream', 250, 'pack', '5901234567005'),
  ('b0000000-0000-0000-0000-000000000006', 'FM-FANMILK-500', 'FanMilk 500ml', 'Milk', 500, 'pack', '5901234567006'),
  ('b0000000-0000-0000-0000-000000000007', 'FM-SUPERYOGO-150', 'Super Yogo 150ml', 'Yogurt', 300, 'pack', '5901234567007'),
  ('b0000000-0000-0000-0000-000000000008', 'FM-CHOCOYOGO-115', 'ChocoYogo 115ml', 'Yogurt', 250, 'pack', '5901234567008'),
  ('b0000000-0000-0000-0000-000000000009', 'FM-GOGURT-80', 'GoGurt Tube 80ml', 'Yogurt', 150, 'pack', '5901234567009'),
  ('b0000000-0000-0000-0000-000000000010', 'FM-FANCHOCO-70', 'FanChoco Bar 70ml', 'Ice Cream', 200, 'pack', '5901234567010');

-- =============================================
-- 3. VENDORS (12 field vendors across 3 outlets)
-- =============================================
INSERT INTO public.vendors (id, vendor_code, name, phone, email, territory, outlet_id, status, join_date, total_sales, days_worked, date_of_birth, gender, national_id, address, next_of_kin, next_of_kin_phone, bank_name, bank_account, guarantor_name, guarantor_phone, mobile_money_number, education_level, marital_status, languages, uniform_size, health_status, latitude, longitude, notes) VALUES
  -- Ikeja outlet vendors
  ('c0000000-0000-0000-0000-000000000001', 'VND-00001', 'Abiodun Salami', '+234 812 100 0001', 'abiodun@okfarm.ng', 'Ikeja', 'a0000000-0000-0000-0000-000000000001', 'active', '2025-03-15', 485000, 180, '1992-05-12', 'male', NULL, '23 Obafemi Awolowo Way, Ikeja', 'Funke Salami', '+234 812 900 0001', 'GTBank', '0123456789', 'Olusegun Adeyemi', '+234 813 100 0001', '+234 812 100 0001', 'Secondary', 'married', ARRAY['English','Yoruba'], 'L', 'fit', 6.6018, 3.3515, 'Top performer, consistently hits targets'),
  ('c0000000-0000-0000-0000-000000000002', 'VND-00002', 'Bola Adeyinka', '+234 812 100 0002', 'bola@okfarm.ng', 'Ikeja', 'a0000000-0000-0000-0000-000000000001', 'active', '2025-04-01', 392000, 165, '1995-08-22', 'female', NULL, '15 Computer Village Rd, Ikeja', 'Tayo Adeyinka', '+234 812 900 0002', 'First Bank', '2233445566', 'Biodun Oladipo', '+234 813 100 0002', '+234 812 100 0002', 'OND', 'single', ARRAY['English','Yoruba','Pidgin'], 'M', 'fit', 6.6055, 3.3482, 'Reliable vendor in Computer Village area'),
  ('c0000000-0000-0000-0000-000000000003', 'VND-00003', 'Chukwu Okafor', '+234 812 100 0003', 'chukwu@okfarm.ng', 'Oshodi', 'a0000000-0000-0000-0000-000000000001', 'active', '2025-05-10', 310000, 140, '1990-01-18', 'male', NULL, '7 Oshodi Market Lane', 'Ngozi Okafor', '+234 812 900 0003', 'UBA', '3344556677', 'Emeka Nwachukwu', '+234 813 100 0003', '+234 812 100 0003', 'Primary', 'married', ARRAY['English','Igbo','Pidgin'], 'XL', 'fit', 6.5568, 3.3412, 'Covers Oshodi market area'),
  ('c0000000-0000-0000-0000-000000000004', 'VND-00004', 'Dayo Fashola', '+234 812 100 0004', 'dayo@okfarm.ng', 'Ikeja', 'a0000000-0000-0000-0000-000000000001', 'suspended', '2025-06-01', 87000, 45, '1998-11-30', 'male', NULL, '32 Toyin Street, Ikeja', 'Shade Fashola', '+234 812 900 0004', 'Access Bank', '4455667788', 'Adewale Bello', '+234 813 100 0004', '+234 812 100 0004', 'BSc', 'single', ARRAY['English','Yoruba'], 'M', 'fit', 6.5988, 3.3545, 'Suspended: 3 days unexcused absence'),
  -- Lekki outlet vendors
  ('c0000000-0000-0000-0000-000000000005', 'VND-00005', 'Emmanuel Okoro', '+234 812 200 0001', 'emmanuel@okfarm.ng', 'Lekki', 'a0000000-0000-0000-0000-000000000002', 'active', '2025-03-20', 520000, 190, '1993-04-05', 'male', NULL, '18 Freedom Way, Lekki', 'Grace Okoro', '+234 812 900 0005', 'Zenith Bank', '5566778899', 'Peter Eze', '+234 813 100 0005', '+234 812 200 0001', 'HND', 'married', ARRAY['English','Igbo'], 'L', 'fit', 6.4390, 3.4709, 'Best vendor in Lekki axis'),
  ('c0000000-0000-0000-0000-000000000006', 'VND-00006', 'Fatima Hassan', '+234 812 200 0002', 'fatima@okfarm.ng', 'Victoria Island', 'a0000000-0000-0000-0000-000000000002', 'active', '2025-04-15', 448000, 175, '1996-07-14', 'female', NULL, '5 Adeola Odeku St, VI', 'Amina Hassan', '+234 812 900 0006', 'Stanbic IBTC', '6677889900', 'Hauwa Ibrahim', '+234 813 100 0006', '+234 812 200 0002', 'BSc', 'single', ARRAY['English','Hausa','Yoruba'], 'S', 'fit', 6.4279, 3.4219, 'Covers Victoria Island corporate area'),
  ('c0000000-0000-0000-0000-000000000007', 'VND-00007', 'Gbenga Adeleke', '+234 812 200 0003', 'gbenga@okfarm.ng', 'Ajah', 'a0000000-0000-0000-0000-000000000002', 'active', '2025-05-25', 275000, 130, '1994-12-08', 'male', NULL, '22 Ajah Market Rd', 'Tosin Adeleke', '+234 812 900 0007', 'Fidelity', '7788990011', 'Kayode Ojo', '+234 813 100 0007', '+234 812 200 0003', 'Secondary', 'married', ARRAY['English','Yoruba'], 'L', 'fit', 6.4683, 3.5656, 'Growing territory in Ajah'),
  ('c0000000-0000-0000-0000-000000000008', 'VND-00008', 'Halima Yusuf', '+234 812 200 0004', 'halima@okfarm.ng', 'Lekki', 'a0000000-0000-0000-0000-000000000002', 'inactive', '2025-06-10', 45000, 20, '2000-03-21', 'female', NULL, '3 Lekki Phase 2', 'Zainab Yusuf', '+234 812 900 0008', 'Wema', '8899001122', 'Maryam Bello', '+234 813 100 0008', '+234 812 200 0004', 'OND', 'single', ARRAY['English','Hausa'], 'S', 'fit', 6.4350, 3.4800, 'On leave for personal reasons'),
  -- Surulere outlet vendors
  ('c0000000-0000-0000-0000-000000000009', 'VND-00009', 'Ibrahim Musa', '+234 812 300 0001', 'ibrahim@okfarm.ng', 'Surulere', 'a0000000-0000-0000-0000-000000000003', 'active', '2025-03-10', 410000, 185, '1991-09-25', 'male', NULL, '11 Bode Thomas St, Surulere', 'Khadija Musa', '+234 812 900 0009', 'GTBank', '9900112233', 'Aliyu Mohammed', '+234 813 100 0009', '+234 812 300 0001', 'Secondary', 'married', ARRAY['English','Hausa','Yoruba'], 'L', 'fit', 6.4912, 3.3565, 'Veteran vendor, very reliable'),
  ('c0000000-0000-0000-0000-000000000010', 'VND-00010', 'Joy Okonkwo', '+234 812 300 0002', 'joy@okfarm.ng', 'Yaba', 'a0000000-0000-0000-0000-000000000003', 'active', '2025-04-20', 365000, 160, '1997-02-14', 'female', NULL, '8 Herbert Macaulay Way, Yaba', 'Paul Okonkwo', '+234 812 900 0010', 'UBA', '0011223344', 'Stella Nwosu', '+234 813 100 0010', '+234 812 300 0002', 'BSc', 'single', ARRAY['English','Igbo','Pidgin'], 'M', 'fit', 6.5093, 3.3787, 'Excellent with university student customers'),
  ('c0000000-0000-0000-0000-000000000011', 'VND-00011', 'Kunle Ajayi', '+234 812 300 0003', 'kunle@okfarm.ng', 'Mushin', 'a0000000-0000-0000-0000-000000000003', 'active', '2025-05-05', 298000, 145, '1993-06-30', 'male', NULL, '17 Agege Motor Rd, Mushin', 'Bisi Ajayi', '+234 812 900 0011', 'Access Bank', '1122334455', 'Femi Oladele', '+234 813 100 0011', '+234 812 300 0003', 'Primary', 'married', ARRAY['Yoruba','Pidgin'], 'XL', 'fit', 6.5283, 3.3497, 'Strong presence in Mushin markets'),
  ('c0000000-0000-0000-0000-000000000012', 'VND-00012', 'Lara Balogun', '+234 812 300 0004', 'lara@okfarm.ng', 'Surulere', 'a0000000-0000-0000-0000-000000000003', 'active', '2025-06-15', 195000, 90, '1999-10-10', 'female', NULL, '5 National Stadium Rd, Surulere', 'Segun Balogun', '+234 812 900 0012', 'First Bank', '2233445500', 'Shade Akinsanya', '+234 813 100 0012', '+234 812 300 0004', 'HND', 'single', ARRAY['English','Yoruba'], 'S', 'fit', 6.4955, 3.3620, 'New but promising vendor');

-- =============================================
-- 4. ASSETS (equipment assigned to vendors)
-- =============================================
INSERT INTO public.assets (id, asset_code, type, name, status, assigned_to, outlet_id, condition, next_maintenance_date) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'AST-PC-001', 'push_cart', 'Push Cart Alpha', 'assigned', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'good', '2026-07-15'),
  ('d0000000-0000-0000-0000-000000000002', 'AST-BC-001', 'bicycle', 'Bicycle Bravo', 'assigned', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'good', '2026-08-01'),
  ('d0000000-0000-0000-0000-000000000003', 'AST-TC-001', 'tricycle', 'Tricycle Charlie', 'assigned', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'fair', '2026-06-20'),
  ('d0000000-0000-0000-0000-000000000004', 'AST-PC-002', 'push_cart', 'Push Cart Delta', 'available', NULL, 'a0000000-0000-0000-0000-000000000001', 'good', '2026-09-01'),
  ('d0000000-0000-0000-0000-000000000005', 'AST-TC-002', 'tricycle', 'Tricycle Echo', 'assigned', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'good', '2026-07-30'),
  ('d0000000-0000-0000-0000-000000000006', 'AST-BC-002', 'bicycle', 'Bicycle Foxtrot', 'assigned', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'good', '2026-08-15'),
  ('d0000000-0000-0000-0000-000000000007', 'AST-PC-003', 'push_cart', 'Push Cart Golf', 'assigned', 'c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'good', '2026-07-20'),
  ('d0000000-0000-0000-0000-000000000008', 'AST-BC-003', 'bicycle', 'Bicycle Hotel', 'maintenance', NULL, 'a0000000-0000-0000-0000-000000000003', 'poor', '2026-06-18');

-- =============================================
-- 5. DEPOTS (cold storage locations)
-- =============================================
INSERT INTO public.depots (id, depot_code, name, address, territory, outlet_id, vendor_count, asset_count, fridge_capacity, status, manager, phone) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'DEP-IKJ-01', 'Ikeja Central Cold Store', '12 Allen Ave, Ikeja', 'Ikeja', 'a0000000-0000-0000-0000-000000000001', 4, 4, 500, 'active', 'Adebayo Ogunleye', '+234 801 234 5678'),
  ('e0000000-0000-0000-0000-000000000002', 'DEP-LKI-01', 'Lekki Cold Room', '45 Admiralty Way, Lekki', 'Lekki', 'a0000000-0000-0000-0000-000000000002', 4, 2, 350, 'active', 'Chioma Nwankwo', '+234 802 345 6789'),
  ('e0000000-0000-0000-0000-000000000003', 'DEP-SRL-01', 'Surulere Depot', '8 Adeniran Ogunsanya, Surulere', 'Surulere', 'a0000000-0000-0000-0000-000000000003', 4, 2, 300, 'active', 'Tunde Bakare', '+234 803 456 7890');

-- =============================================
-- 6. ALLOCATIONS + ITEMS (today and yesterday)
-- =============================================
INSERT INTO public.allocations (id, vendor_id, outlet_id, date, total_value, status, notes) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE, 45000, 'pending', 'Morning allocation for Abiodun'),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE, 35000, 'pending', 'Morning allocation for Bola'),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE, 52000, 'pending', 'Morning allocation for Emmanuel'),
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE, 38000, 'pending', 'Morning allocation for Ibrahim'),
  ('f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 42000, 'reconciled', 'Yesterday allocation'),
  ('f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 48000, 'reconciled', 'Yesterday allocation');

INSERT INTO public.allocation_items (allocation_id, product_id, quantity, unit_price) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 50, 200),
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 100, 100),
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 60, 250),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 40, 200),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 30, 350),
  ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 50, 200),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 60, 200),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 80, 250),
  ('f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 20, 500),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 45, 200),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 80, 100),
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000007', 30, 300),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 50, 200),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 80, 100),
  ('f0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 60, 250),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 55, 200),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 25, 500),
  ('f0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000008', 40, 250);

-- =============================================
-- 7. SALES + ITEMS (yesterday's completed sales)
-- =============================================
INSERT INTO public.sales (id, vendor_id, outlet_id, date, total_value, amount_paid, outstanding, payment_method) VALUES
  ('10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 38500, 38500, 0, 'cash'),
  ('10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 28000, 25000, 3000, 'mixed'),
  ('10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 44000, 44000, 0, 'mobile_money'),
  ('10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE - 1, 32000, 30000, 2000, 'cash'),
  ('10000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE - 1, 27500, 27500, 0, 'cash'),
  ('10000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 35200, 35200, 0, 'mobile_money');

INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price) VALUES
  ('10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 45, 200),
  ('10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 75, 100),
  ('10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 50, 250),
  ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 35, 200),
  ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 25, 350),
  ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 35, 200),
  ('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 55, 200),
  ('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 70, 250),
  ('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 18, 500),
  ('10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 40, 200),
  ('10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 60, 100),
  ('10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000007', 25, 300),
  ('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 30, 200),
  ('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000008', 35, 250),
  ('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000009', 50, 150),
  ('10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 40, 350),
  ('10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 60, 200),
  ('10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000010', 15, 200);

-- =============================================
-- 8. CHECK-INS (today + yesterday)
-- =============================================
INSERT INTO public.check_ins (vendor_id, outlet_id, date, check_in_time, check_out_time) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE, now() - interval '4 hours', NULL),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE, now() - interval '3.5 hours', NULL),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE, now() - interval '3 hours', NULL),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE, now() - interval '4 hours', NULL),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE, now() - interval '3 hours', NULL),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE, now() - interval '4.5 hours', NULL),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE, now() - interval '3 hours', NULL),
  -- Yesterday (completed shifts)
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, (CURRENT_DATE - 1 + time '07:30:00')::timestamptz, (CURRENT_DATE - 1 + time '17:00:00')::timestamptz),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, (CURRENT_DATE - 1 + time '08:00:00')::timestamptz, (CURRENT_DATE - 1 + time '16:30:00')::timestamptz),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE - 1, (CURRENT_DATE - 1 + time '07:00:00')::timestamptz, (CURRENT_DATE - 1 + time '17:30:00')::timestamptz);

-- =============================================
-- 9. RECONCILIATIONS + ITEMS (yesterday)
-- =============================================
INSERT INTO public.reconciliations (id, allocation_id, vendor_id, outlet_id, date, total_returned, total_spoilage, total_sold, cash_collected, status, notes) VALUES
  ('20000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 8, 2, 180, 38500, 'completed', 'Good day, minor spoilage on FanIce'),
  ('20000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 5, 1, 137, 44000, 'completed', 'Excellent performance');

INSERT INTO public.reconciliation_items (reconciliation_id, product_id, allocated_qty, returned_qty, spoilage_qty, sold_qty, unit_price) VALUES
  ('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 50, 3, 2, 45, 200),
  ('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 80, 5, 0, 75, 100),
  ('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 60, 0, 0, 60, 250),
  ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 55, 0, 0, 55, 200),
  ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 25, 3, 1, 21, 500),
  ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 40, 2, 0, 38, 250);

-- =============================================
-- 10. PAYMENTS
-- =============================================
INSERT INTO public.payments (vendor_id, outlet_id, amount, method, reference, provider, phone_number, date, status, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 38500, 'cash', NULL, NULL, NULL, CURRENT_DATE - 1, 'completed', 'Full cash settlement'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 25000, 'cash', NULL, NULL, NULL, CURRENT_DATE - 1, 'completed', 'Partial payment, ₦3,000 outstanding'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 44000, 'mobile_money', 'MM-20260613-001', 'OPay', '+234 812 200 0001', CURRENT_DATE - 1, 'completed', 'Full mobile money payment'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 35200, 'mobile_money', 'MM-20260613-002', 'Palmpay', '+234 812 200 0002', CURRENT_DATE - 1, 'completed', 'Full mobile money payment'),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 30000, 'cash', NULL, NULL, NULL, CURRENT_DATE - 1, 'completed', 'Partial, ₦2,000 carried forward'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 27500, 'cash', NULL, NULL, NULL, CURRENT_DATE - 1, 'completed', 'Full payment');

-- =============================================
-- 11. COMMISSIONS (May 2026)
-- =============================================
INSERT INTO public.commissions (id, vendor_id, outlet_id, month, total_sales, days_active, days_worked, avg_daily_sales, consistency_rate, consistency_multiplier, volume_bonus, consistency_bonus, attendance_bonus, total_commission, tier, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-05', 485000, 22, 22, 22045, 100, 1.5, 4850, 2000, 1500, 8350, 'gold', 'pending'),
  ('30000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-05', 392000, 20, 22, 17818, 91, 1.3, 3920, 1500, 1000, 6420, 'silver', 'pending'),
  ('30000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '2026-05', 520000, 22, 22, 23636, 100, 1.5, 5200, 2000, 1500, 8700, 'gold', 'disbursed'),
  ('30000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', '2026-05', 410000, 21, 22, 18636, 95, 1.4, 4100, 1800, 1200, 7100, 'silver', 'pending'),
  ('30000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', '2026-05', 365000, 18, 22, 16591, 82, 1.2, 3650, 1200, 800, 5650, 'bronze', 'pending');

-- =============================================
-- 12. PAYOUTS (for disbursed commission)
-- =============================================
INSERT INTO public.payouts (commission_id, vendor_id, amount, method, reference, disbursed_at, status) VALUES
  ('30000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 8700, 'mobile_money', 'PO-202605-003', now() - interval '3 days', 'completed');

-- =============================================
-- 13. ORDERS + ITEMS
-- =============================================
INSERT INTO public.orders (id, outlet_id, status, order_date, expected_delivery, total_value, notes) VALUES
  ('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'delivered', CURRENT_DATE - 3, CURRENT_DATE - 1, 250000, 'Weekly restock order'),
  ('40000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'pending', CURRENT_DATE, CURRENT_DATE + 2, 180000, 'Mid-week top-up'),
  ('40000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'confirmed', CURRENT_DATE - 1, CURRENT_DATE + 1, 150000, 'Regular order');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 200, 200),
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 300, 100),
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 200, 250),
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 100, 500),
  ('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 150, 200),
  ('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 100, 350),
  ('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 120, 250),
  ('40000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 180, 200),
  ('40000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 200, 100),
  ('40000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 100, 300);

-- =============================================
-- 14. INBOUND DELIVERIES + ITEMS
-- =============================================
INSERT INTO public.inbound_deliveries (id, outlet_id, invoice_number, supplier, date, due_date, credit_term_days, total_value, status, received_by, notes) VALUES
  ('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'INV-FM-2026-0601', 'FanMilk Nigeria', CURRENT_DATE - 1, CURRENT_DATE + 29, 30, 250000, 'verified', 'Adebayo Ogunleye', 'Verified and stocked'),
  ('50000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'INV-FM-2026-0602', 'FanMilk Nigeria', CURRENT_DATE - 3, CURRENT_DATE + 27, 30, 180000, 'received', 'Chioma Nwankwo', 'Pending verification'),
  ('50000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'INV-FM-2026-0603', 'FanMilk Nigeria', CURRENT_DATE, CURRENT_DATE + 30, 30, 150000, 'pending', NULL, 'Expected today');

INSERT INTO public.delivery_items (delivery_id, product_id, quantity, unit_price) VALUES
  ('50000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 200, 200),
  ('50000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 300, 100),
  ('50000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 200, 250),
  ('50000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 100, 500),
  ('50000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 150, 200),
  ('50000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 100, 350),
  ('50000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 120, 250),
  ('50000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 180, 200),
  ('50000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 200, 100),
  ('50000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 100, 300);

-- =============================================
-- 15. STOCK LEVELS (per product per outlet)
-- =============================================
INSERT INTO public.stock_levels (product_id, outlet_id, current_stock, min_stock, max_stock) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 320, 100, 500),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 85, 50, 300),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 450, 150, 600),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 120, 50, 300),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 280, 100, 400),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 210, 100, 400),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 140, 50, 300),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 95, 80, 350),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 45, 30, 200),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 180, 80, 400),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 350, 100, 500),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 60, 50, 250);

-- =============================================
-- 16. SETTLEMENTS + LINES (May 2026)
-- =============================================
INSERT INTO public.settlements (id, outlet_id, month, total_receivable, total_paid, discount, discount_rate, net_payable, status, notes) VALUES
  ('60000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-05', 750000, 720000, 15000, 2, 735000, 'partial', 'May settlement — 2% early payment discount applied');

INSERT INTO public.settlement_lines (settlement_id, invoice_number, date, amount, credit_days, due_date, amount_paid, status) VALUES
  ('60000000-0000-0000-0000-000000000001', 'INV-FM-2026-0501', '2026-05-01', 250000, 30, '2026-05-31', 250000, 'paid'),
  ('60000000-0000-0000-0000-000000000001', 'INV-FM-2026-0510', '2026-05-10', 250000, 30, '2026-06-09', 250000, 'paid'),
  ('60000000-0000-0000-0000-000000000001', 'INV-FM-2026-0520', '2026-05-20', 250000, 30, '2026-06-19', 220000, 'due');

-- =============================================
-- 17. NOTIFICATIONS
-- =============================================
INSERT INTO public.notifications (outlet_id, user_id, title, message, type, priority, read, action_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', NULL, 'Low Stock Alert', 'FanYogo 250ml is below minimum stock (85/100) at Ikeja Main Depot.', 'warning', 'high', false, '/inventory'),
  ('a0000000-0000-0000-0000-000000000002', NULL, 'Stock Critical', 'FanMilk 500ml stock critically low (45/30 min) at Lekki Branch.', 'alert', 'high', false, '/inventory'),
  (NULL, NULL, 'Monthly Commission Ready', 'May 2026 commissions have been calculated. 5 vendors pending payout.', 'info', 'medium', false, '/commissions'),
  ('a0000000-0000-0000-0000-000000000003', NULL, 'New Delivery Expected', 'Invoice INV-FM-2026-0603 expected today at Surulere Branch.', 'info', 'medium', false, '/inventory/inbound'),
  (NULL, NULL, 'Vendor Suspension', 'Dayo Fashola (VND-00004) has been suspended for 3 days unexcused absence.', 'warning', 'medium', true, '/vendors/c0000000-0000-0000-0000-000000000004'),
  ('a0000000-0000-0000-0000-000000000001', NULL, 'Payment Overdue', 'Bola Adeyinka has ₦3,000 outstanding from yesterday.', 'warning', 'high', false, '/payments');

-- =============================================
-- 18. AUDIT LOGS
-- =============================================
INSERT INTO public.audit_logs (user_email, action, entity_type, entity_id, details) VALUES
  ('leonkouchica@gmail.com', 'CREATE', 'vendor', 'c0000000-0000-0000-0000-000000000001', 'Created vendor Abiodun Salami (VND-00001)'),
  ('leonkouchica@gmail.com', 'CREATE', 'outlet', 'a0000000-0000-0000-0000-000000000001', 'Created outlet Ikeja Main Depot (IKJ)'),
  ('leonkouchica@gmail.com', 'UPDATE', 'vendor', 'c0000000-0000-0000-0000-000000000004', 'Suspended vendor Dayo Fashola — reason: 3 days absence'),
  ('leonkouchica@gmail.com', 'CREATE', 'order', '40000000-0000-0000-0000-000000000001', 'Created restock order for Ikeja (₦250,000)'),
  ('leonkouchica@gmail.com', 'UPDATE', 'delivery', '50000000-0000-0000-0000-000000000001', 'Verified delivery INV-FM-2026-0601'),
  ('leonkouchica@gmail.com', 'DISBURSE', 'payout', NULL, 'Disbursed ₦8,700 commission to Emmanuel Okoro for May 2026');

-- =============================================
-- 19. INCENTIVE PROGRAMS + VENDOR INCENTIVES
-- =============================================
INSERT INTO public.incentive_programs (id, name, description, icon, eligibility_criteria, reward, status) VALUES
  ('70000000-0000-0000-0000-000000000001', 'Top Seller of the Month', 'Awarded to the vendor with the highest monthly sales value.', '🏆', 'Highest total_sales in the month', '₦10,000 bonus + certificate', 'active'),
  ('70000000-0000-0000-0000-000000000002', 'Perfect Attendance', 'For vendors with 100% attendance in a calendar month.', '⭐', '22/22 days worked in a month', '₦5,000 bonus', 'active'),
  ('70000000-0000-0000-0000-000000000003', 'Zero Spoilage Champion', 'For vendors who return zero spoilage items for 30 consecutive days.', '🎯', 'Zero spoilage for 30 days', 'Extra ₦3,000 + branded uniform', 'active'),
  ('70000000-0000-0000-0000-000000000004', 'Rising Star', 'For new vendors (<6 months) showing exceptional growth.', '🌟', 'Under 6 months tenure + month-over-month growth > 20%', '₦5,000 + mentorship', 'active');

INSERT INTO public.vendor_incentives (vendor_id, program_id, status, awarded_at, notes) VALUES
  ('c0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'awarded', now() - interval '5 days', 'Top seller May 2026 — ₦485,000'),
  ('c0000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', 'awarded', now() - interval '5 days', 'Perfect 22/22 attendance in May'),
  ('c0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'awarded', now() - interval '5 days', 'Perfect attendance May 2026'),
  ('c0000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000003', 'eligible', NULL, 'On track for zero spoilage — 25 days in'),
  ('c0000000-0000-0000-0000-000000000012', '70000000-0000-0000-0000-000000000004', 'eligible', NULL, 'New vendor, showing 30% growth in first month');

-- =============================================
-- 20. TRAINING MODULES + PROGRESS
-- =============================================
INSERT INTO public.training_modules (id, title, category, duration, mandatory, description) VALUES
  ('80000000-0000-0000-0000-000000000001', 'Product Knowledge Basics', 'Product', '45 mins', true, 'Learn about all FanMilk products, storage temperatures, and shelf life.'),
  ('80000000-0000-0000-0000-000000000002', 'Cold Chain Management', 'Operations', '30 mins', true, 'Proper handling, transportation, and storage of frozen products.'),
  ('80000000-0000-0000-0000-000000000003', 'Customer Service Excellence', 'Sales', '60 mins', false, 'Techniques for engaging customers, upselling, and handling complaints.'),
  ('80000000-0000-0000-0000-000000000004', 'Mobile Money Operations', 'Finance', '20 mins', false, 'How to accept and process mobile money payments (OPay, Palmpay).'),
  ('80000000-0000-0000-0000-000000000005', 'Food Safety & Hygiene', 'Compliance', '40 mins', true, 'NAFDAC food handling requirements and personal hygiene standards.');

INSERT INTO public.vendor_training_progress (vendor_id, module_id, status, score, completed_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'completed', 95, now() - interval '60 days'),
  ('c0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'completed', 88, now() - interval '55 days'),
  ('c0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', 'completed', 92, now() - interval '40 days'),
  ('c0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000005', 'completed', 90, now() - interval '58 days'),
  ('c0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000001', 'completed', 90, now() - interval '50 days'),
  ('c0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000002', 'completed', 85, now() - interval '48 days'),
  ('c0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000004', 'in_progress', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000001', 'completed', 82, now() - interval '70 days'),
  ('c0000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000005', 'in_progress', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000012', '80000000-0000-0000-0000-000000000001', 'not_started', NULL, NULL),
  ('c0000000-0000-0000-0000-000000000012', '80000000-0000-0000-0000-000000000002', 'not_started', NULL, NULL);

-- =============================================
-- 21. FORECASTS
-- =============================================
INSERT INTO public.forecasts (product_id, outlet_id, avg_daily_sales, current_stock, days_until_stockout, suggested_order, order_value) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 45, 320, 7, 200, 40000),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 15, 85, 5, 150, 52500),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 80, 450, 5, 300, 30000),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 35, 280, 8, 150, 37500),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 38, 210, 5, 180, 36000),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 25, 95, 3, 200, 50000),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 8, 45, 5, 50, 25000),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 30, 180, 6, 150, 30000),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 55, 350, 6, 200, 20000),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 12, 60, 5, 80, 24000);
