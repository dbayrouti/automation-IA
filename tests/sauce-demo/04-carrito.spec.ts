import { test, expect, addToCart, cartCounter, qtyInput } from './fixtures';

test.describe('Carrito', () => {
  test('TC-22 Agregar un producto sube el contador del carrito a 1', async ({ page }) => {
    await page.goto('/');
    await expect(cartCounter(page)).toHaveText('My Cart (0)');
    await addToCart(page, 'grey-jacket', 1);
  });

  test('TC-23 El carrito muestra el producto, su precio, la cantidad y el total', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'My Cart', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Grey jacket/ }).first()).toBeVisible();
    await expect(qtyInput(page)).toHaveValue('1');
    await expect(page.getByRole('heading', { name: 'Total £55.00' })).toBeVisible();
  });

  test('TC-24 Cambiar la cantidad a 3 y pulsar "Update" recalcula el total', async ({ page }) => {
    await addToCart(page, 'noir-jacket', 1);
    await page.goto('/cart');
    await qtyInput(page).fill('3');
    await page.locator('#update').click();
    await expect(qtyInput(page)).toHaveValue('3');
    await expect(page.getByRole('heading', { name: 'Total £180.00' })).toBeVisible();
    await expect(cartCounter(page)).toHaveText('My Cart (3)');
  });

  test('TC-25 Agregar dos productos distintos suma ambos precios', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await addToCart(page, 'striped-top', 2);
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Total £105.00' })).toBeVisible();
  });

  test('TC-26 Quitar el producto con "x" deja el carrito vacío', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    await page.locator('a[href*="quantity=0"]:visible').first().click();
    await expect(page.getByText('It appears that your cart is currently empty!')).toBeVisible();
    await expect(cartCounter(page)).toHaveText('My Cart (0)');
  });

  test('TC-27 Cantidad 0 y "Update" elimina el producto', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    await qtyInput(page).fill('0');
    await page.locator('#update').click();
    await expect(page.getByText('It appears that your cart is currently empty!')).toBeVisible();
  });

  test('TC-28 Una cantidad no numérica no rompe el carrito', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    await qtyInput(page).fill('abc');
    await page.locator('#update').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByRole('heading', { name: 'My Cart', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Total £\d+\.\d{2}/ })).toBeVisible();
  });

  test('TC-29 La nota del pedido se conserva después de "Update"', async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    const nota = page.getByRole('textbox', { name: 'Add a note to your order...' });
    await nota.fill('Entregar por la tarde');
    await page.locator('#update').click();
    await expect(nota).toHaveValue('Entregar por la tarde');
  });

  test('TC-30 El carrito vacío ofrece "Continue Shopping" hacia el catálogo', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('It appears that your cart is currently empty!')).toBeVisible();
    await page.getByRole('link', { name: /Continue Shopping/ }).click();
    await expect(page).toHaveURL(/\/collections\/all$/);
  });
});
