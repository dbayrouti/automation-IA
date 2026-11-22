import { test, expect } from './fixtures';

const PRODUCTOS = [
  ['Black heels', '£45.00'],
  ['Bronze sandals', '£39.99'],
  ['Brown Shades', '£20.00'],
  ['Grey jacket', '£55.00'],
  ['Noir jacket', '£60.00'],
  ['Striped top', '£50.00'],
  ['White sandals', '£25.00'],
];

test.describe('Catálogo y producto', () => {
  test('TC-09 El catálogo muestra los 7 productos con nombre y precio', async ({ page }) => {
    await page.goto('/collections/all');
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    for (const [nombre, precio] of PRODUCTOS) {
      const card = page.getByRole('link').filter({ has: page.getByRole('heading', { name: nombre, level: 3 }) });
      await expect(card).toBeVisible();
      await expect(card.getByRole('heading', { level: 4 })).toHaveText(precio);
    }
  });

  test('TC-10 Los productos sin stock muestran la etiqueta "Sold Out" en el catálogo', async ({ page }) => {
    await page.goto('/collections/all');
    for (const nombre of ['Brown Shades', 'White sandals']) {
      const card = page.getByRole('link').filter({ has: page.getByRole('heading', { name: nombre, level: 3 }) });
      await expect(card).toContainText('Sold Out');
    }
    const conStock = page.getByRole('link').filter({ has: page.getByRole('heading', { name: 'Grey jacket', level: 3 }) });
    await expect(conStock).not.toContainText('Sold Out');
  });

  test('TC-11 La colección Frontpage muestra los 3 productos destacados', async ({ page }) => {
    await page.goto('/collections/frontpage');
    await expect(page.getByRole('heading', { name: 'Frontpage', level: 1 })).toBeVisible();
    await expect(page.locator('a[href*="/products/"] h3')).toHaveText(['Grey jacket', 'Noir jacket', 'Striped top']);
  });

  test('TC-12 La ficha de producto muestra nombre, precio, descripción y botón "Add to Cart"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Grey jacket', level: 3 }).click();
    await expect(page).toHaveURL(/\/products\/grey-jacket$/);
    await expect(page.getByRole('heading', { name: 'Grey jacket', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '£55.00', level: 2 })).toBeVisible();
    await expect(page.getByText('This area is populated by the product description')).toBeVisible();
    await expect(page.locator('#add')).toBeEnabled();
  });

  test('TC-13 Un producto agotado tiene el botón "Sold Out" deshabilitado', async ({ page }) => {
    await page.goto('/collections/all/products/brown-shades');
    await expect(page.locator('#add')).toHaveValue('Sold Out');
    await expect(page.locator('#add')).toBeDisabled();
  });

  test('TC-14 Un producto con variantes permite elegir talla y color', async ({ page }) => {
    await page.goto('/collections/all/products/noir-jacket');
    await expect(page.locator('#product-select-option-0 option')).toHaveText(['S', 'M', 'L']);
    await expect(page.locator('#product-select-option-1 option')).toHaveText(['Blue', 'Red']);
    await page.locator('#product-select-option-0').selectOption('L');
    await page.locator('#product-select-option-1').selectOption('Red');
    await expect(page.locator('#product-select')).toHaveValue(
      await page.locator('#product-select option', { hasText: 'L / Red' }).getAttribute('value') as string,
    );
    await expect(page.locator('#add')).toBeEnabled();
  });

  test('TC-15 "You Might Also Like" lleva a otro producto', async ({ page }) => {
    await page.goto('/collections/frontpage/products/grey-jacket');
    await expect(page.getByRole('heading', { name: 'You Might Also Like...' })).toBeVisible();
    await page.getByRole('heading', { name: 'Noir jacket', level: 3 }).click();
    await expect(page).toHaveURL(/\/products\/noir-jacket$/);
    await expect(page.getByRole('heading', { name: 'Noir jacket', level: 1 })).toBeVisible();
  });

  test('TC-16 La URL de cada producto coincide con su nombre', async ({ page }) => {
    await page.goto('/collections/all');
    const links = page.locator('a[href*="/products/"]').filter({ has: page.locator('h3') });
    const pares = await links.evaluateAll(ls =>
      ls.map(l => [l.querySelector('h3')!.textContent!.trim(), l.getAttribute('href')!.split('/products/')[1]]),
    );
    for (const [nombre, slug] of pares) {
      expect.soft(slug, `URL del producto "${nombre}"`).toBe(nombre.toLowerCase().replace(/\s+/g, '-'));
    }
  });
});
