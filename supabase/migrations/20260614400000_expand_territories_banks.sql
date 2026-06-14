-- ============================================================
-- Migration: Expand territories and banks in app_settings
-- ============================================================

-- Update territories: All 20 Lagos LGAs + All 36 Nigerian States + FCT
UPDATE public.app_settings
SET value = '[
  "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
  "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
  "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
  "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere",
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT-Abuja",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
]'
WHERE key = 'territories';

-- Update banks: All Nigerian commercial banks + mobile money operators
UPDATE public.app_settings
SET value = '[
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank",
  "Guaranty Trust Bank (GTBank)", "Heritage Bank", "Jaiz Bank",
  "Keystone Bank", "Lotus Bank", "Optimus Bank", "Parallex Bank",
  "Polaris Bank", "Premium Trust Bank", "Providus Bank",
  "Stanbic IBTC Bank", "Standard Chartered Bank", "Sterling Bank",
  "SunTrust Bank", "TAJBank", "Titan Trust Bank", "Union Bank",
  "United Bank for Africa (UBA)", "Unity Bank", "VFD Microfinance Bank",
  "Wema Bank", "Zenith Bank",
  "OPay", "PalmPay", "Moniepoint", "Kuda Bank", "Carbon",
  "FairMoney", "Paga", "MTN MoMo PSB", "9PSB (9 Payment Service Bank)",
  "HOPE PSB", "Sparkle", "Rubies Bank", "Eyowo",
  "Paystack Titan", "Flutterwave", "TeamApt (Moniepoint)"
]'
WHERE key = 'banks';
