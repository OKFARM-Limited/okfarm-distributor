# Distribo — User Role & Feature Documentation Guide

Welcome to the comprehensive operations manual for the **Distribo Distributor Operations & Growth Platform**. This document details the permissions, responsibilities, and step-by-step instructions for each user role across every section of the application.

---

## 👥 1. Role Matrix & Access Control Overview

Distribo implements a role-based access control (RBAC) system to ensure operational security and data integrity.

| Feature Area | Super Admin | Manager | Assistant | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **System Settings & User Roles** | Write | No Access | No Access | No Access |
| **Stock Recalc & Audit Logs** | Write | No Access | No Access | No Access |
| **Depots & Outlets Management** | Write | Read Only | No Access | No Access |
| **Product catalog / Pricing (SKU)** | Write | Read Only | No Access | No Access |
| **Inbound Stock & Deliveries** | Write | Write | Read Only | Read Only |
| **Vendor Management & Assets** | Write | Write | Write | Read Only |
| **Allocation & Reconciliation** | Write | Write | Write | Read Only |
| **Sales Entry & Payments** | Write | Write | Write | Read Only |
| **Commission Payouts** | Write | Write | Read Only | Read Only |
| **Orders Confirmation** | Write | Write | No Access | Read Only |
| **Analytics & Maps** | Read | Read | Read | Read |

---

## 🛠️ 2. Section-by-Section User Guide

### 2.1 Overview & System Core

#### 📊 Dashboard
- **Access:** All Roles (Custom view depending on role).
- **Purpose:** Central command center displaying live KPIs, daily transaction lists, and alert cards.
- **How to use:**
  - **Admin/Manager:** View global or outlet-specific cards including *Total Sales (Today)*, *Active Outlets*, *Inventory Value*, and *Pending Payouts*.
  - **Assistant:** View live checklist summaries, daily sales targets, and pending check-ins.
  - **All Users:** Review the **Recent Transactions** stream to track real-time activity and the **Low Stock Alerts** list for items needing replenishment.

#### 🔔 Notifications
- **Access:** All Roles.
- **Purpose:** Real-time updates on stock levels, variance alerts, and order status changes.
- **How to use:** Click the bell icon in the top right header to expand the notification tray. Click "Mark all as read" to clear. Admins will receive critical *Variance Alerts* here when a stock recalc discrepancy exceeds the threshold.

---

### 2.2 Operations

#### 👥 Vendors
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Manage sales representatives, cold chain handlers, and field agents.
- **How to use:**
  - Click **Add Vendor** (Admin/Manager only) to register a new agent. Fill in Name, Contact Details, Assigned Territory, and Depot.
  - Click any vendor to view their performance metrics, active fridge asset details, and historical dues statement.

#### ⏰ Check-In
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Log field agents starting and ending their shifts.
- **How to use:**
  - When an agent arrives at the depot, locate their name and click **Check In**. Record their starting vehicle mileage or equipment status if prompted.
  - At the end of the shift, click **Check Out** to log hours, record end mileage, and auto-generate the day's sales summary.

#### 📦 Assets
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Track distribution assets, specifically refrigerators (cold chain) and pushcarts.
- **How to use:**
  - **Assign Asset:** Click **Assign Asset** to link a specific serial number refrigerator to a vendor profile.
  - **Status update:** Update asset health (e.g. *active*, *needs repair*, *broken*) to alert maintenance coordinators.

#### 📋 Stock Allocation
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Issue warehouse stock to field agents/vendors at the start of the day.
- **How to use:**
  1. Click **New Allocation**.
  2. Select the **Vendor** from the dropdown list.
  3. Enter quantities for each product being loaded onto the vendor's truck/cart.
  4. Review the auto-calculated total value in Naira (₦) and click **Confirm**.
  5. *Note:* Allocated stock is subtracted from the depot inventory and added to the vendor's active inventory.

#### 🔄 Reconciliation
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Reconcile vendor stock and cash at the end of a sales cycle.
- **How to use:**
  1. Locate the vendor in the reconciliation list.
  2. Enter the quantities of returned products (unsold) and spoiled/damaged items.
  3. Enter the cash/receipts submitted by the vendor.
  4. The system calculates the variance. If cash + returns match allocation, click **Submit Reconciliation** to mark it complete.

---

### 2.3 Inventory

#### 🏢 Inbound Stock
- **Access:** Admin, Manager (Write); Assistant, Viewer (Read).
- **Purpose:** Record new stock arriving from suppliers (e.g. FanMilk) and adjust warehouse totals.
- **How to use:**
  1. Click **Adjust Stock** (opens *Record New Delivery* dialog).
  2. Fill in the **Invoice Number** (required) and select the date.
  3. Click **Add Item** to insert product lines, selecting the SKU and entering quantity/price.
  4. Upload a photo of the physical invoice/delivery note using the **Capture POD Photo** button (which auto-compresses to WebP for high-speed loading).
  5. Click **Save Delivery**.
  6. *Important:* New deliveries are saved as `pending`. To add the items to the physical inventory, locate the delivery in the list and click **Mark Received**.

#### 📷 Scanner
- **Access:** Admin, Manager, Assistant.
- **Purpose:** Quick inventory lookup or product verification using QR codes or barcodes.
- **How to use:** Grant camera permissions, position the barcode inside the camera overlay, and the system will fetch the matching SKU, category, and current stock level.

---

### 2.4 Finance

#### 💸 Sales Entry
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Record bulk sales or field transactions.
- **How to use:** Select the customer/retailer, enter product quantities, choose payment terms (Cash or Credit), and click **Submit Sale**. Amounts are tracked in Naira (₦).

#### 💳 Payments
- **Access:** Admin, Manager, Assistant (Write); Viewer (Read).
- **Purpose:** Log customer collections and credit payments.
- **How to use:** Click **Record Payment**, select the invoice reference, enter the amount received, choose method (Cash, Bank Transfer), and submit.

#### 📲 Mobile Money
- **Access:** Greyed out temporarily (unclickable, displays *Soon* badge).
- **Purpose:** Future integration area for direct mobile telecom disbursements.

#### 📄 Dues Statement
- **Access:** All Roles.
- **Purpose:** Account ledger for tracking vendor outstanding payments, credit balances, and collections history.

---

### 2.5 Analytics & Mapping

#### 📈 Performance
- **Access:** All Roles.
- **Purpose:** Sales graphs, volume tracking, and vendor efficiency charts.

#### 🗺️ Vendor Map
- **Access:** All Roles.
- **Purpose:** Geolocation map showing where vendors checked in, logged sales, or where fridges are physically located.

---

### 2.6 Admin Panel (Admin & Manager Only)

#### 🏪 Outlets
- **Access:** Admin (Write); Manager (Read Only).
- **Purpose:** Configure outlet branch details.
- **How to use:** Click **Add Outlet**, fill in branch code and address. Select the branch **Manager** using the dropdown (which queries registered manager profiles).

#### 📦 Products
- **Access:** Admin (Write); Manager (Read Only).
- **Purpose:** Manage product catalogue, pricing, and barcodes.
- **How to use:** Click **Add Product** to create a new SKU, setting its Name, SKU Code, Category, and Unit Price (₦).

#### 🏆 Commissions
- **Access:** Admin, Manager (Write); Viewer (Read).
- **Purpose:** Set and track commission rates earned by vendors on various product categories.

#### 🚚 Payouts
- **Access:** Admin, Manager (Write); Viewer (Read).
- **Purpose:** Track and disburse commission payouts to vendors.
- **How to use:** Displays pending disbursements. The **Disburse** button is temporarily disabled with a tooltip indicating telecom integration is coming soon.

#### 🛒 Orders
- **Access:** Admin, Manager (Write); Viewer (Read).
- **Purpose:** Confirm and process orders placed by outlets/vendors.
- **How to use:** Browse the order history. Find orders with status `pending`, inspect items, and use the status dropdown to update them to `confirmed`, `in_transit`, or `delivered`.

#### 🔄 Stock Recalc
- **Access:** Admin Only.
- **Purpose:** Resolve inventory drift by matching expected stock against physical counts.
- **How to use:**
  1. Click **Run Diff** to trigger the SQL calculation.
  2. The system compares: `Deliveries Received − Allocations − Sales + Returns` against current `Stock Levels`.
  3. Mismatches will show up in the table, flagged with red `alert` badges if the variance exceeds the set threshold.
  4. Click **Apply Corrections** and confirm to overwrite the local database stock values with expected counts (which writes an audit log entry).

#### 👥 User Roles & Permissions
- **Access:** Admin Only.
- **Purpose:** Register new users, assign roles (Admin, Manager, Assistant, Viewer), and manage granular feature permissions.
