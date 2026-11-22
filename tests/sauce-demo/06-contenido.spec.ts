import { test, expect } from './fixtures';

test.describe('Contenido', () => {
  test('TC-37 El blog lista "First Post" y abre el artículo', async ({ page }) => {
    await page.goto('/blogs/news');
    await expect(page.getByText('Posted by Shopify')).toBeVisible();
    await page.getByRole('link', { name: 'First Post' }).click();
    await expect(page).toHaveURL(/\/blogs\/news\/\d+-first-post$/);
    await expect(page.getByRole('heading', { name: 'First Post' }).first()).toBeVisible();
  });

  test('TC-38 La página About Us carga su contenido', async ({ page }) => {
    await page.goto('/pages/about-us');
    await expect(page.getByRole('heading', { name: 'About Us', level: 1 })).toBeVisible();
    await expect(page.locator('#content, main, body').getByRole('link', { name: 'Sauce' }).first()).toBeVisible();
  });
});
