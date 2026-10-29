import { readdirSync } from 'node:fs';

import { expect, test } from '@playwright/test';

// The preview build runs in a normal browser, so every connector uses its mock.
const modules = readdirSync(new URL('../modules', import.meta.url), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
  .map((e) => e.name);

const shot = (name: string, project: string) => `e2e/screenshots/${project}/${name}.png`;

test.describe('pages', () => {
  test('home renders placed blocks and tabs navigate', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'Jobs' })).toBeVisible();
    await expect(page.locator('[data-zone="jobs.main"] [data-module]').first()).toBeVisible();
    await page.screenshot({ path: shot('page-jobs', info.project.name), fullPage: true });

    for (const tab of ['Profile', 'Saved', 'Settings']) {
      await page.getByRole('link', { name: tab }).click();
      await expect(page.getByRole('heading', { level: 1, name: tab })).toBeVisible();
      await expect(page.locator(`[data-zone="${tab.toLowerCase()}.main"] [data-module]`).first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: shot(`page-${tab.toLowerCase()}`, info.project.name), fullPage: true });
    }
    expect(errors).toEqual([]);
  });

  test('dark mode captures look right', async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'Jobs' })).toBeVisible();
    await expect(page.locator('[data-zone="jobs.main"] [data-module]').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: shot('page-jobs-dark', info.project.name), fullPage: true });

    for (const tab of ['Profile', 'Saved', 'Settings']) {
      await page.getByRole('link', { name: tab }).click();
      await expect(page.getByRole('heading', { level: 1, name: tab })).toBeVisible();
      await expect(page.locator(`[data-zone="${tab.toLowerCase()}.main"] [data-module]`).first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: shot(`page-${tab.toLowerCase()}-dark`, info.project.name), fullPage: true });
    }
  });

  test('no block shows an error state', async ({ page }) => {
    for (const path of ['#/', '#/profile', '#/saved', '#/settings']) {
      await page.goto(`./${path}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('alert')).toHaveCount(0);
    }
  });

  test('a flag in the URL switches a module off', async ({ page }) => {
    await page.goto('./?ff=jobSearch:off#/');
    await expect(page.getByRole('heading', { level: 1, name: 'Jobs' })).toBeVisible();
    await expect(page.locator('[data-module="job-search"]')).toHaveCount(0);
  });
});

test.describe('module sandbox', () => {
  for (const id of modules) {
    test(id, async ({ page }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`./#/__sandbox/${id}`);
      await expect(page.locator('[data-sandbox-block]').first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('alert')).toHaveCount(0);
      await page.screenshot({ path: shot(`module-${id}`, info.project.name), fullPage: true });
      expect(errors).toEqual([]);
    });
  }
});
