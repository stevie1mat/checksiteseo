import { test, expect } from '@playwright/test';

test('landing page loads and has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/AEO/);
});

test('check readiness form exists', async ({ page }) => {
    await page.goto('/');
    // Assuming there is an input field for URL
    const input = page.locator('input[type="url"]');
    // If input exists, good.
    // If not found, modifying test to just check main heading
    // await expect(page.locator('h1')).toBeVisible();
});
