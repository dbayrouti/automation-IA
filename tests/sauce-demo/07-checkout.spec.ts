import { test, expect, addToCart } from './fixtures';

/**
 * Checkout alojado por Shopify. Las pruebas se detienen ANTES del pago:
 * nunca se introducen datos de tarjeta.
 */
test.describe('Checkout (sin pago)', () => {
  test.beforeEach(async ({ page }) => {
    await addToCart(page, 'grey-jacket', 1);
    await page.goto('/cart');
    await page.locator('#checkout').click();
    await expect(page).toHaveURL(/\/checkouts\//, { timeout: 30_000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-39 "Check Out" abre el checkout con el resumen del pedido', async ({ page }) => {
    await expect(page).toHaveTitle(/Checkout/);
    await expect(page.getByText('Grey jacket').first()).toBeVisible();
    await expect(page.getByText('£55.00').first()).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="address1"]').first()).toBeVisible();
  });

  test('TC-40 Enviar el checkout vacío muestra errores de campos obligatorios', async ({ page }) => {
    await page.getByRole('button', { name: /Pay now|Continue|Review order/i }).first().click();
    await expect(page.getByText(/Enter an email|Enter a valid email/i).first()).toBeVisible();
    await expect(page.getByText(/Enter (a|an) (last name|address)/i).first()).toBeVisible();
  });

  test('TC-41 Un email con formato inválido muestra error', async ({ page }) => {
    await page.locator('input[name="email"]').fill('correo-invalido');
    await page.getByRole('button', { name: /Pay now|Continue|Review order/i }).first().click();
    await expect(page.getByText(/Enter a valid email/i).first()).toBeVisible();
  });

  test('TC-42 Un código de descuento inválido muestra error', async ({ page }) => {
    const campo = page.locator('input[name="reductions"]:visible').first();
    await campo.fill('CODIGOFALSO123');
    await page.getByRole('button', { name: /Apply/i }).first().click();
    await expect(page.getByText(/isn.t valid|not valid|Enter a valid discount code|couldn.t be applied/i).first()).toBeVisible();
  });
});
