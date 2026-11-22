import { test, expect } from './fixtures';

test.describe('Búsqueda', () => {
  test('TC-17 Buscar "jacket" devuelve solo las 2 chaquetas', async ({ page }) => {
    await page.goto('/search?q=jacket');
    const resultados = page.locator('a[href*="/products/"] h3');
    await expect(resultados.filter({ hasText: 'Grey jacket' })).toBeVisible();
    await expect(resultados.filter({ hasText: 'Noir jacket' })).toBeVisible();
    const nombres = await resultados.allTextContents();
    for (const n of nombres) expect.soft(n.toLowerCase(), `resultado "${n}"`).toContain('jacket');
  });

  test('TC-18 Buscar desde la cabecera con Enter muestra resultados', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Search' }).fill('top');
    await page.getByRole('textbox', { name: 'Search' }).press('Enter');
    await expect(page).toHaveURL(/\/search\?.*q=top/);
    await expect(page.getByText('Showing results for top')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Striped top', level: 3 })).toBeVisible();
  });

  test('TC-19 Una búsqueda sin coincidencias muestra "No results found"', async ({ page }) => {
    await page.goto('/search?q=zzzxxyy');
    await expect(page.getByText('No results found for zzzxxyy')).toBeVisible();
    await expect(page.locator('a[href*="/products/"] h3')).toHaveCount(0);
  });

  test('TC-20 Una búsqueda vacía muestra "No search performed"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Search' }).press('Enter');
    await expect(page.getByText('No search performed')).toBeVisible();
  });

  test('TC-21 Buscar "sandals" devuelve solo sandalias', async ({ page }) => {
    await page.goto('/search?q=sandals');
    const nombres = await page.locator('a[href*="/products/"] h3').allTextContents();
    expect(nombres.length).toBeGreaterThan(0);
    for (const n of nombres) expect.soft(n.toLowerCase(), `resultado "${n}"`).toContain('sandals');
  });
});
