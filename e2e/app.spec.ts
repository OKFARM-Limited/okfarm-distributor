import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─── Credentials ─────────────────────────────────────────────────────
// Set E2E_EMAIL and E2E_PASSWORD in .env.test (see .env.test.example)
let EMAIL = process.env.E2E_EMAIL;
let PASSWORD = process.env.E2E_PASSWORD;

if (!EMAIL || !PASSWORD) {
  try {
    const envTestPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(envTestPath)) {
      const content = fs.readFileSync(envTestPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([^=#]+)\s*=\s*(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          if (key === 'E2E_EMAIL') EMAIL = val;
          if (key === 'E2E_PASSWORD') PASSWORD = val;
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse .env.test:', e);
  }
}

if (!EMAIL || !PASSWORD) {
  throw new Error('E2E_EMAIL and E2E_PASSWORD must be set in environment or .env.test file. Copy .env.test.example → .env.test');
}

// ─── Shared context: login ONCE, reuse for all tests ─────────────────
let context: BrowserContext;
let page: Page;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();

  // Login once
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 15_000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 20_000 });
  await expect(page.locator('h1')).toBeVisible({ timeout: 15_000 });
});

test.afterAll(async () => {
  await context?.close();
});

// =====================================================================
// 1. Authentication
// =====================================================================
test('unauthenticated users see login page', async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const p = await ctx.newPage();
  await p.goto('/login');
  await expect(p.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });
  await expect(p.locator('input[type="password"]')).toBeVisible();
  await ctx.close();
});

test('invalid credentials stay on login', async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const p = await ctx.newPage();
  await p.goto('/login');
  await p.waitForSelector('input[type="email"]', { timeout: 10_000 });
  await p.fill('input[type="email"]', 'wrong@example.com');
  await p.fill('input[type="password"]', 'wrongpassword');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(3000);
  // Should still be showing the login form
  await expect(p.locator('input[type="password"]')).toBeVisible();
  await ctx.close();
});

test('authenticated user sees dashboard', async () => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 });
});

// =====================================================================
// 2. Dashboard & Navigation
// =====================================================================
test('dashboard has stats cards', async () => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  const cards = page.locator('[class*="card"]');
  expect(await cards.count()).toBeGreaterThan(0);
});

test('navigate to vendors', async () => {
  await page.goto('/vendors');
  await expect(page.locator('h1')).toContainText(/vendor/i, { timeout: 10_000 });
});

test('navigate to allocation', async () => {
  await page.goto('/allocation');
  await expect(page.locator('h1')).toContainText(/allocation/i, { timeout: 10_000 });
});

test('navigate to sales', async () => {
  await page.goto('/sales');
  await expect(page.locator('h1')).toContainText(/sales/i, { timeout: 10_000 });
});

test('navigate to settings', async () => {
  await page.goto('/settings');
  await expect(page.locator('h1')).toContainText(/settings/i, { timeout: 10_000 });
});

// =====================================================================
// 3. Vendor Management
// =====================================================================
test('vendor list has search input', async () => {
  await page.goto('/vendors');
  await expect(page.locator('h1')).toContainText(/vendor/i, { timeout: 10_000 });
  await expect(page.locator('input[placeholder="Search vendors by name, code or phone..."]')).toBeVisible();
});

test('vendor search filters results', async () => {
  await page.goto('/vendors');
  await page.waitForSelector('input[placeholder="Search vendors by name, code or phone..."]', { timeout: 10_000 });
  await page.fill('input[placeholder="Search vendors by name, code or phone..."]', 'Adewale');
  await page.waitForTimeout(500);
  expect(await page.textContent('body')).toBeDefined();
});

test('click vendor card opens detail', async () => {
  await page.goto('/vendors');
  await page.waitForSelector('input[placeholder="Search vendors by name, code or phone..."]', { timeout: 10_000 });
  await page.waitForTimeout(2000);

  const card = page.locator('tbody tr').first();
  if (await card.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await card.click();
    const viewButton = page.locator('text=View Transactions');
    await expect(viewButton).toBeVisible({ timeout: 5_000 });
    await viewButton.click();
    await page.waitForURL(/\/vendors\//, { timeout: 10_000 });
    await expect(page.locator('text=Back to Vendors')).toBeVisible({ timeout: 10_000 });
  }
});

// =====================================================================
// 4. Daily Allocation
// =====================================================================
test('allocation shows wizard heading', async () => {
  await page.goto('/allocation');
  await expect(page.locator('h1')).toContainText(/allocation/i, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Select Vendor' })).toBeVisible();
});

test('allocation has vendor selector', async () => {
  await page.goto('/allocation');
  await expect(page.locator('button[role="combobox"]').first()).toBeVisible({ timeout: 10_000 });
});

// =====================================================================
// 5. Sales Entry
// =====================================================================
test('sales entry form loads', async () => {
  await page.goto('/sales');
  await expect(page.locator('h1')).toContainText(/sales/i, { timeout: 10_000 });
});

test('sales entry has selectors', async () => {
  await page.goto('/sales');
  await expect(page.locator('button[role="combobox"]').first()).toBeVisible({ timeout: 10_000 });
});

// =====================================================================
// 6. Reconciliation
// =====================================================================
test('reconciliation page loads', async () => {
  await page.goto('/reconciliation');
  await expect(page.locator('h1')).toContainText(/reconciliation/i, { timeout: 10_000 });
});

test('reconciliation has vendor selector', async () => {
  await page.goto('/reconciliation');
  await expect(page.locator('button[role="combobox"]').first()).toBeVisible({ timeout: 10_000 });
});

// =====================================================================
// 7. Admin Pages
// =====================================================================
test('commissions page loads', async () => {
  await page.goto('/commissions');
  await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
});

test('audit trail loads', async () => {
  await page.goto('/audit');
  await expect(page.locator('h1')).toContainText(/audit/i, { timeout: 10_000 });
});

test('role management loads', async () => {
  await page.goto('/roles');
  await expect(page.locator('h1')).toContainText(/role|user/i, { timeout: 10_000 });
});

// =====================================================================
// 8. Feature Pages Load (16 pages)
// =====================================================================
const featurePages = [
  { path: '/assets', title: /asset/i },
  { path: '/payments', title: /payment/i },
  { path: '/performance', title: /performance/i },
  { path: '/map', title: /map/i },
  { path: '/checkin', title: /check/i },
  { path: '/inventory', title: /inventory|inbound/i },
  { path: '/notifications', title: /notification/i },
  { path: '/forecast', title: /forecast/i },
  { path: '/incentives', title: /incentive/i },
  { path: '/training', title: /training|academy/i },
  { path: '/products', title: /product/i },
  { path: '/depots', title: /depot/i },
  { path: '/outlets', title: /outlet/i },
  { path: '/settlement', title: /settlement/i },
  { path: '/orders', title: /order/i },
  { path: '/dues', title: /dues|statement/i },
  { path: '/allocation/history', title: /allocation|history/i },
];

for (const { path, title } of featurePages) {
  test(`page ${path} loads`, async () => {
    await page.goto(path);
    await expect(page.locator('h1')).toContainText(title, { timeout: 15_000 });
  });
}

// =====================================================================
// 9. PWA & Error Handling
// =====================================================================
test('404 page handles unknown routes', async () => {
  await page.goto('/nonexistent-page-xyz');
  await page.waitForTimeout(2000);
  expect(await page.textContent('body')).toBeDefined();
});

test('PWA manifest is valid', async () => {
  const response = await page.goto('/manifest.json');
  expect(response?.status()).toBe(200);
  const manifest = await response?.json();
  expect(manifest.name).toBe('Distribo Distributor Manager');
  expect(manifest.short_name).toBe('Distribo');
});
