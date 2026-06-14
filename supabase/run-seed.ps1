$h = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d25zenZkYm1kZmhwYXRqbnZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM4ODI3MCwiZXhwIjoyMDk2OTY0MjcwfQ.GeUFuxto8LxcMnIM6hYIUcMtLPiBaA8Mb3W2AEYrodc"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d25zenZkYm1kZmhwYXRqbnZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM4ODI3MCwiZXhwIjoyMDk2OTY0MjcwfQ.GeUFuxto8LxcMnIM6hYIUcMtLPiBaA8Mb3W2AEYrodc"
  "Content-Type" = "application/json"
  "Prefer" = "return=minimal"
}
$base = "https://vvwnszvdbmdfhpatjnvz.supabase.co/rest/v1"
$today = (Get-Date).ToString("yyyy-MM-dd")
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")

function Post($table, $body) {
  try {
    Invoke-RestMethod -Uri "$base/$table" -Method POST -Headers $h -Body $body -ContentType "application/json"
    Write-Output "${table}: OK"
  } catch {
    try { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Output "${table}: FAIL - $($reader.ReadToEnd())" } catch { Write-Output "${table}: FAIL - $($_.Exception.Message)" }
  }
}

# ASSETS
Post "assets" '[
{"id":"d0000000-0000-0000-0000-000000000001","asset_code":"AST-PC-001","type":"push_cart","name":"Push Cart Alpha","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000001","condition":"good","next_maintenance_date":"2026-07-15"},
{"id":"d0000000-0000-0000-0000-000000000002","asset_code":"AST-BC-001","type":"bicycle","name":"Bicycle Bravo","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000002","outlet_id":"a0000000-0000-0000-0000-000000000001","condition":"good","next_maintenance_date":"2026-08-01"},
{"id":"d0000000-0000-0000-0000-000000000003","asset_code":"AST-TC-001","type":"tricycle","name":"Tricycle Charlie","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000003","outlet_id":"a0000000-0000-0000-0000-000000000001","condition":"fair","next_maintenance_date":"2026-06-20"},
{"id":"d0000000-0000-0000-0000-000000000004","asset_code":"AST-PC-002","type":"push_cart","name":"Push Cart Delta","status":"available","outlet_id":"a0000000-0000-0000-0000-000000000001","condition":"good","next_maintenance_date":"2026-09-01"},
{"id":"d0000000-0000-0000-0000-000000000005","asset_code":"AST-TC-002","type":"tricycle","name":"Tricycle Echo","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000005","outlet_id":"a0000000-0000-0000-0000-000000000002","condition":"good","next_maintenance_date":"2026-07-30"},
{"id":"d0000000-0000-0000-0000-000000000006","asset_code":"AST-BC-002","type":"bicycle","name":"Bicycle Foxtrot","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000006","outlet_id":"a0000000-0000-0000-0000-000000000002","condition":"good","next_maintenance_date":"2026-08-15"},
{"id":"d0000000-0000-0000-0000-000000000007","asset_code":"AST-PC-003","type":"push_cart","name":"Push Cart Golf","status":"assigned","assigned_to":"c0000000-0000-0000-0000-000000000009","outlet_id":"a0000000-0000-0000-0000-000000000003","condition":"good","next_maintenance_date":"2026-07-20"},
{"id":"d0000000-0000-0000-0000-000000000008","asset_code":"AST-BC-003","type":"bicycle","name":"Bicycle Hotel","status":"maintenance","outlet_id":"a0000000-0000-0000-0000-000000000003","condition":"poor","next_maintenance_date":"2026-06-18"}
]'

# DEPOTS
Post "depots" '[
{"id":"e0000000-0000-0000-0000-000000000001","depot_code":"DEP-IKJ-01","name":"Ikeja Central Cold Store","address":"12 Allen Ave, Ikeja","territory":"Ikeja","outlet_id":"a0000000-0000-0000-0000-000000000001","vendor_count":4,"asset_count":4,"fridge_capacity":500,"status":"active","manager":"Adebayo Ogunleye","phone":"+234 801 234 5678"},
{"id":"e0000000-0000-0000-0000-000000000002","depot_code":"DEP-LKI-01","name":"Lekki Cold Room","address":"45 Admiralty Way, Lekki","territory":"Lekki","outlet_id":"a0000000-0000-0000-0000-000000000002","vendor_count":4,"asset_count":2,"fridge_capacity":350,"status":"active","manager":"Chioma Nwankwo","phone":"+234 802 345 6789"},
{"id":"e0000000-0000-0000-0000-000000000003","depot_code":"DEP-SRL-01","name":"Surulere Depot","address":"8 Adeniran Ogunsanya, Surulere","territory":"Surulere","outlet_id":"a0000000-0000-0000-0000-000000000003","vendor_count":4,"asset_count":2,"fridge_capacity":300,"status":"active","manager":"Tunde Bakare","phone":"+234 803 456 7890"}
]'

# ALLOCATIONS
Post "allocations" "[
{`"id`":`"f0000000-0000-0000-0000-000000000001`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000001`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"date`":`"$today`",`"total_value`":45000,`"status`":`"pending`",`"notes`":`"Morning allocation for Abiodun`"},
{`"id`":`"f0000000-0000-0000-0000-000000000002`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000002`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"date`":`"$today`",`"total_value`":35000,`"status`":`"pending`"},
{`"id`":`"f0000000-0000-0000-0000-000000000003`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000005`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000002`",`"date`":`"$today`",`"total_value`":52000,`"status`":`"pending`"},
{`"id`":`"f0000000-0000-0000-0000-000000000004`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000009`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000003`",`"date`":`"$today`",`"total_value`":38000,`"status`":`"pending`"},
{`"id`":`"f0000000-0000-0000-0000-000000000005`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000001`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"date`":`"$yesterday`",`"total_value`":42000,`"status`":`"reconciled`"},
{`"id`":`"f0000000-0000-0000-0000-000000000006`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000005`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000002`",`"date`":`"$yesterday`",`"total_value`":48000,`"status`":`"reconciled`"}
]"

# ALLOCATION ITEMS
Post "allocation_items" '[
{"allocation_id":"f0000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000001","quantity":50,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000003","quantity":100,"unit_price":100},
{"allocation_id":"f0000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000005","quantity":60,"unit_price":250},
{"allocation_id":"f0000000-0000-0000-0000-000000000002","product_id":"b0000000-0000-0000-0000-000000000001","quantity":40,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000002","product_id":"b0000000-0000-0000-0000-000000000002","quantity":30,"unit_price":350},
{"allocation_id":"f0000000-0000-0000-0000-000000000003","product_id":"b0000000-0000-0000-0000-000000000001","quantity":60,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000003","product_id":"b0000000-0000-0000-0000-000000000005","quantity":80,"unit_price":250},
{"allocation_id":"f0000000-0000-0000-0000-000000000004","product_id":"b0000000-0000-0000-0000-000000000001","quantity":45,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000004","product_id":"b0000000-0000-0000-0000-000000000003","quantity":80,"unit_price":100},
{"allocation_id":"f0000000-0000-0000-0000-000000000005","product_id":"b0000000-0000-0000-0000-000000000001","quantity":50,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000005","product_id":"b0000000-0000-0000-0000-000000000003","quantity":80,"unit_price":100},
{"allocation_id":"f0000000-0000-0000-0000-000000000006","product_id":"b0000000-0000-0000-0000-000000000001","quantity":55,"unit_price":200},
{"allocation_id":"f0000000-0000-0000-0000-000000000006","product_id":"b0000000-0000-0000-0000-000000000006","quantity":25,"unit_price":500}
]'

# SALES
Post "sales" "[
{`"id`":`"10000000-0000-0000-0000-000000000001`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000001`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"date`":`"$yesterday`",`"total_value`":38500,`"amount_paid`":38500,`"outstanding`":0,`"payment_method`":`"cash`"},
{`"id`":`"10000000-0000-0000-0000-000000000002`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000002`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"date`":`"$yesterday`",`"total_value`":28000,`"amount_paid`":25000,`"outstanding`":3000,`"payment_method`":`"mixed`"},
{`"id`":`"10000000-0000-0000-0000-000000000003`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000005`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000002`",`"date`":`"$yesterday`",`"total_value`":44000,`"amount_paid`":44000,`"outstanding`":0,`"payment_method`":`"mobile_money`"},
{`"id`":`"10000000-0000-0000-0000-000000000004`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000009`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000003`",`"date`":`"$yesterday`",`"total_value`":32000,`"amount_paid`":30000,`"outstanding`":2000,`"payment_method`":`"cash`"},
{`"id`":`"10000000-0000-0000-0000-000000000005`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000010`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000003`",`"date`":`"$yesterday`",`"total_value`":27500,`"amount_paid`":27500,`"outstanding`":0,`"payment_method`":`"cash`"},
{`"id`":`"10000000-0000-0000-0000-000000000006`",`"vendor_id`":`"c0000000-0000-0000-0000-000000000006`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000002`",`"date`":`"$yesterday`",`"total_value`":35200,`"amount_paid`":35200,`"outstanding`":0,`"payment_method`":`"mobile_money`"}
]"

# SALE ITEMS
Post "sale_items" '[
{"sale_id":"10000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000001","quantity":45,"unit_price":200},
{"sale_id":"10000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000003","quantity":75,"unit_price":100},
{"sale_id":"10000000-0000-0000-0000-000000000001","product_id":"b0000000-0000-0000-0000-000000000005","quantity":50,"unit_price":250},
{"sale_id":"10000000-0000-0000-0000-000000000002","product_id":"b0000000-0000-0000-0000-000000000001","quantity":35,"unit_price":200},
{"sale_id":"10000000-0000-0000-0000-000000000002","product_id":"b0000000-0000-0000-0000-000000000002","quantity":25,"unit_price":350},
{"sale_id":"10000000-0000-0000-0000-000000000003","product_id":"b0000000-0000-0000-0000-000000000001","quantity":55,"unit_price":200},
{"sale_id":"10000000-0000-0000-0000-000000000003","product_id":"b0000000-0000-0000-0000-000000000005","quantity":70,"unit_price":250},
{"sale_id":"10000000-0000-0000-0000-000000000004","product_id":"b0000000-0000-0000-0000-000000000001","quantity":40,"unit_price":200},
{"sale_id":"10000000-0000-0000-0000-000000000004","product_id":"b0000000-0000-0000-0000-000000000003","quantity":60,"unit_price":100},
{"sale_id":"10000000-0000-0000-0000-000000000005","product_id":"b0000000-0000-0000-0000-000000000001","quantity":30,"unit_price":200},
{"sale_id":"10000000-0000-0000-0000-000000000005","product_id":"b0000000-0000-0000-0000-000000000008","quantity":35,"unit_price":250},
{"sale_id":"10000000-0000-0000-0000-000000000006","product_id":"b0000000-0000-0000-0000-000000000002","quantity":40,"unit_price":350},
{"sale_id":"10000000-0000-0000-0000-000000000006","product_id":"b0000000-0000-0000-0000-000000000004","quantity":60,"unit_price":200}
]'

# PAYMENTS
Post "payments" "[
{`"vendor_id`":`"c0000000-0000-0000-0000-000000000001`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"amount`":38500,`"method`":`"cash`",`"date`":`"$yesterday`",`"status`":`"completed`",`"notes`":`"Full cash settlement`"},
{`"vendor_id`":`"c0000000-0000-0000-0000-000000000002`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000001`",`"amount`":25000,`"method`":`"cash`",`"date`":`"$yesterday`",`"status`":`"completed`"},
{`"vendor_id`":`"c0000000-0000-0000-0000-000000000005`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000002`",`"amount`":44000,`"method`":`"mobile_money`",`"reference`":`"MM-20260613-001`",`"provider`":`"OPay`",`"date`":`"$yesterday`",`"status`":`"completed`"},
{`"vendor_id`":`"c0000000-0000-0000-0000-000000000009`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000003`",`"amount`":30000,`"method`":`"cash`",`"date`":`"$yesterday`",`"status`":`"completed`"},
{`"vendor_id`":`"c0000000-0000-0000-0000-000000000010`",`"outlet_id`":`"a0000000-0000-0000-0000-000000000003`",`"amount`":27500,`"method`":`"cash`",`"date`":`"$yesterday`",`"status`":`"completed`"}
]"

# COMMISSIONS
Post "commissions" '[
{"id":"30000000-0000-0000-0000-000000000001","vendor_id":"c0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000001","month":"2026-05","total_sales":485000,"days_active":22,"days_worked":22,"avg_daily_sales":22045,"consistency_rate":100,"consistency_multiplier":1.5,"volume_bonus":4850,"consistency_bonus":2000,"attendance_bonus":1500,"total_commission":8350,"tier":"gold","status":"pending"},
{"id":"30000000-0000-0000-0000-000000000002","vendor_id":"c0000000-0000-0000-0000-000000000002","outlet_id":"a0000000-0000-0000-0000-000000000001","month":"2026-05","total_sales":392000,"days_active":20,"days_worked":22,"avg_daily_sales":17818,"consistency_rate":91,"consistency_multiplier":1.3,"volume_bonus":3920,"consistency_bonus":1500,"attendance_bonus":1000,"total_commission":6420,"tier":"silver","status":"pending"},
{"id":"30000000-0000-0000-0000-000000000003","vendor_id":"c0000000-0000-0000-0000-000000000005","outlet_id":"a0000000-0000-0000-0000-000000000002","month":"2026-05","total_sales":520000,"days_active":22,"days_worked":22,"avg_daily_sales":23636,"consistency_rate":100,"consistency_multiplier":1.5,"volume_bonus":5200,"consistency_bonus":2000,"attendance_bonus":1500,"total_commission":8700,"tier":"gold","status":"disbursed"},
{"id":"30000000-0000-0000-0000-000000000004","vendor_id":"c0000000-0000-0000-0000-000000000009","outlet_id":"a0000000-0000-0000-0000-000000000003","month":"2026-05","total_sales":410000,"days_active":21,"days_worked":22,"avg_daily_sales":18636,"consistency_rate":95,"consistency_multiplier":1.4,"volume_bonus":4100,"consistency_bonus":1800,"attendance_bonus":1200,"total_commission":7100,"tier":"silver","status":"pending"},
{"id":"30000000-0000-0000-0000-000000000005","vendor_id":"c0000000-0000-0000-0000-000000000010","outlet_id":"a0000000-0000-0000-0000-000000000003","month":"2026-05","total_sales":365000,"days_active":18,"days_worked":22,"avg_daily_sales":16591,"consistency_rate":82,"consistency_multiplier":1.2,"volume_bonus":3650,"consistency_bonus":1200,"attendance_bonus":800,"total_commission":5650,"tier":"bronze","status":"pending"}
]'

# STOCK LEVELS
Post "stock_levels" '[
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000001","current_stock":320,"min_stock":100,"max_stock":500},
{"product_id":"b0000000-0000-0000-0000-000000000002","outlet_id":"a0000000-0000-0000-0000-000000000001","current_stock":85,"min_stock":50,"max_stock":300},
{"product_id":"b0000000-0000-0000-0000-000000000003","outlet_id":"a0000000-0000-0000-0000-000000000001","current_stock":450,"min_stock":150,"max_stock":600},
{"product_id":"b0000000-0000-0000-0000-000000000005","outlet_id":"a0000000-0000-0000-0000-000000000001","current_stock":280,"min_stock":100,"max_stock":400},
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000002","current_stock":210,"min_stock":100,"max_stock":400},
{"product_id":"b0000000-0000-0000-0000-000000000005","outlet_id":"a0000000-0000-0000-0000-000000000002","current_stock":95,"min_stock":80,"max_stock":350},
{"product_id":"b0000000-0000-0000-0000-000000000006","outlet_id":"a0000000-0000-0000-0000-000000000002","current_stock":45,"min_stock":30,"max_stock":200},
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000003","current_stock":180,"min_stock":80,"max_stock":400},
{"product_id":"b0000000-0000-0000-0000-000000000003","outlet_id":"a0000000-0000-0000-0000-000000000003","current_stock":350,"min_stock":100,"max_stock":500},
{"product_id":"b0000000-0000-0000-0000-000000000007","outlet_id":"a0000000-0000-0000-0000-000000000003","current_stock":60,"min_stock":50,"max_stock":250}
]'

# NOTIFICATIONS
Post "notifications" '[
{"outlet_id":"a0000000-0000-0000-0000-000000000001","title":"Low Stock Alert","message":"FanYogo 250ml is below minimum stock (85/100) at Ikeja Main Depot.","type":"warning","priority":"high","read":false},
{"outlet_id":"a0000000-0000-0000-0000-000000000002","title":"Stock Critical","message":"FanMilk 500ml stock critically low at Lekki Branch.","type":"alert","priority":"high","read":false},
{"title":"Monthly Commission Ready","message":"May 2026 commissions calculated. 5 vendors pending payout.","type":"info","priority":"medium","read":false},
{"outlet_id":"a0000000-0000-0000-0000-000000000003","title":"New Delivery Expected","message":"Invoice INV-FM-2026-0603 expected today at Surulere Branch.","type":"info","priority":"medium","read":false},
{"title":"Vendor Suspension","message":"Dayo Fashola (VND-00004) suspended for 3 days unexcused absence.","type":"warning","priority":"medium","read":true},
{"outlet_id":"a0000000-0000-0000-0000-000000000001","title":"Payment Overdue","message":"Bola Adeyinka has outstanding balance from yesterday.","type":"warning","priority":"high","read":false}
]'

# AUDIT LOGS
Post "audit_logs" '[
{"user_email":"leonkouchica@gmail.com","action":"CREATE","entity_type":"vendor","entity_id":"c0000000-0000-0000-0000-000000000001","details":"Created vendor Abiodun Salami (VND-00001)"},
{"user_email":"leonkouchica@gmail.com","action":"CREATE","entity_type":"outlet","entity_id":"a0000000-0000-0000-0000-000000000001","details":"Created outlet Ikeja Main Depot (IKJ)"},
{"user_email":"leonkouchica@gmail.com","action":"UPDATE","entity_type":"vendor","entity_id":"c0000000-0000-0000-0000-000000000004","details":"Suspended vendor Dayo Fashola"},
{"user_email":"leonkouchica@gmail.com","action":"CREATE","entity_type":"order","entity_id":"40000000-0000-0000-0000-000000000001","details":"Created restock order for Ikeja"},
{"user_email":"leonkouchica@gmail.com","action":"DISBURSE","entity_type":"payout","details":"Disbursed commission to Emmanuel Okoro for May 2026"}
]'

# INCENTIVE PROGRAMS
Post "incentive_programs" '[
{"id":"70000000-0000-0000-0000-000000000001","name":"Top Seller of the Month","description":"Awarded to the vendor with the highest monthly sales value.","icon":"trophy","eligibility_criteria":"Highest total_sales in the month","reward":"10000 bonus + certificate","status":"active"},
{"id":"70000000-0000-0000-0000-000000000002","name":"Perfect Attendance","description":"For vendors with 100% attendance in a calendar month.","icon":"star","eligibility_criteria":"22/22 days worked","reward":"5000 bonus","status":"active"},
{"id":"70000000-0000-0000-0000-000000000003","name":"Zero Spoilage Champion","description":"For vendors who return zero spoilage for 30 consecutive days.","icon":"target","eligibility_criteria":"Zero spoilage for 30 days","reward":"3000 + branded uniform","status":"active"},
{"id":"70000000-0000-0000-0000-000000000004","name":"Rising Star","description":"For new vendors showing exceptional growth.","icon":"trending-up","eligibility_criteria":"Under 6 months + 20% MoM growth","reward":"5000 + mentorship","status":"active"}
]'

# VENDOR INCENTIVES
Post "vendor_incentives" '[
{"vendor_id":"c0000000-0000-0000-0000-000000000001","program_id":"70000000-0000-0000-0000-000000000001","status":"awarded","notes":"Top seller May 2026"},
{"vendor_id":"c0000000-0000-0000-0000-000000000005","program_id":"70000000-0000-0000-0000-000000000002","status":"awarded","notes":"Perfect 22/22 attendance May"},
{"vendor_id":"c0000000-0000-0000-0000-000000000001","program_id":"70000000-0000-0000-0000-000000000002","status":"awarded","notes":"Perfect attendance May 2026"},
{"vendor_id":"c0000000-0000-0000-0000-000000000009","program_id":"70000000-0000-0000-0000-000000000003","status":"eligible","notes":"On track for zero spoilage — 25 days in"},
{"vendor_id":"c0000000-0000-0000-0000-000000000012","program_id":"70000000-0000-0000-0000-000000000004","status":"eligible","notes":"New vendor showing 30% growth"}
]'

# TRAINING MODULES
Post "training_modules" '[
{"id":"80000000-0000-0000-0000-000000000001","title":"Product Knowledge Basics","category":"Product","duration":"45 mins","mandatory":true,"description":"Learn about all FanMilk products, storage temperatures, and shelf life."},
{"id":"80000000-0000-0000-0000-000000000002","title":"Cold Chain Management","category":"Operations","duration":"30 mins","mandatory":true,"description":"Proper handling, transportation, and storage of frozen products."},
{"id":"80000000-0000-0000-0000-000000000003","title":"Customer Service Excellence","category":"Sales","duration":"60 mins","mandatory":false,"description":"Techniques for engaging customers, upselling, and handling complaints."},
{"id":"80000000-0000-0000-0000-000000000004","title":"Mobile Money Operations","category":"Finance","duration":"20 mins","mandatory":false,"description":"How to accept and process mobile money payments."},
{"id":"80000000-0000-0000-0000-000000000005","title":"Food Safety and Hygiene","category":"Compliance","duration":"40 mins","mandatory":true,"description":"NAFDAC food handling requirements and personal hygiene standards."}
]'

# VENDOR TRAINING PROGRESS
Post "vendor_training_progress" '[
{"vendor_id":"c0000000-0000-0000-0000-000000000001","module_id":"80000000-0000-0000-0000-000000000001","status":"completed","score":95},
{"vendor_id":"c0000000-0000-0000-0000-000000000001","module_id":"80000000-0000-0000-0000-000000000002","status":"completed","score":88},
{"vendor_id":"c0000000-0000-0000-0000-000000000001","module_id":"80000000-0000-0000-0000-000000000003","status":"completed","score":92},
{"vendor_id":"c0000000-0000-0000-0000-000000000005","module_id":"80000000-0000-0000-0000-000000000001","status":"completed","score":90},
{"vendor_id":"c0000000-0000-0000-0000-000000000005","module_id":"80000000-0000-0000-0000-000000000002","status":"completed","score":85},
{"vendor_id":"c0000000-0000-0000-0000-000000000005","module_id":"80000000-0000-0000-0000-000000000004","status":"in_progress"},
{"vendor_id":"c0000000-0000-0000-0000-000000000009","module_id":"80000000-0000-0000-0000-000000000001","status":"completed","score":82},
{"vendor_id":"c0000000-0000-0000-0000-000000000009","module_id":"80000000-0000-0000-0000-000000000005","status":"in_progress"},
{"vendor_id":"c0000000-0000-0000-0000-000000000012","module_id":"80000000-0000-0000-0000-000000000001","status":"not_started"},
{"vendor_id":"c0000000-0000-0000-0000-000000000012","module_id":"80000000-0000-0000-0000-000000000002","status":"not_started"}
]'

# FORECASTS
Post "forecasts" '[
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000001","avg_daily_sales":45,"current_stock":320,"days_until_stockout":7,"suggested_order":200,"order_value":40000},
{"product_id":"b0000000-0000-0000-0000-000000000002","outlet_id":"a0000000-0000-0000-0000-000000000001","avg_daily_sales":15,"current_stock":85,"days_until_stockout":5,"suggested_order":150,"order_value":52500},
{"product_id":"b0000000-0000-0000-0000-000000000003","outlet_id":"a0000000-0000-0000-0000-000000000001","avg_daily_sales":80,"current_stock":450,"days_until_stockout":5,"suggested_order":300,"order_value":30000},
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000002","avg_daily_sales":38,"current_stock":210,"days_until_stockout":5,"suggested_order":180,"order_value":36000},
{"product_id":"b0000000-0000-0000-0000-000000000005","outlet_id":"a0000000-0000-0000-0000-000000000002","avg_daily_sales":25,"current_stock":95,"days_until_stockout":3,"suggested_order":200,"order_value":50000},
{"product_id":"b0000000-0000-0000-0000-000000000001","outlet_id":"a0000000-0000-0000-0000-000000000003","avg_daily_sales":30,"current_stock":180,"days_until_stockout":6,"suggested_order":150,"order_value":30000},
{"product_id":"b0000000-0000-0000-0000-000000000007","outlet_id":"a0000000-0000-0000-0000-000000000003","avg_daily_sales":12,"current_stock":60,"days_until_stockout":5,"suggested_order":80,"order_value":24000}
]'

Write-Output "`n=== SEED COMPLETE ==="
