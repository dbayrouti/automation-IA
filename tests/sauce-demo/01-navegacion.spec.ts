import { test, expect, cartCounter } from './fixtures';

/** Ventana o panel de la app Sauce (se excluye <body id="sauce-demo">). */
const MODAL_SAUCE = 'body *[class*="sauce"]:visible, body *[id^="sauce"]:visible, [role="dialog"]:visible, iframe[src*="sauce"]:visible';

test.describe('Navegación', () => {
  test('TC-01 La página de inicio carga con logo, eslogan y 3 productos destacados', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Sauce Demo');
    await expect(page.getByRole('img', { name: 'Sauce Demo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Just a demo site showing off what Sauce can do.' })).toBeVisible();
    for (const p of ['Grey jacket', 'Noir jacket', 'Striped top']) {
      await expect(page.getByRole('heading', { name: p, level: 3 })).toBeVisible();
    }
    await expect(cartCounter(page)).toHaveText('My Cart (0)');
  });

  test('TC-02 El menú lateral navega a Catalog, Blog, About Us y Home', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('#content nav, nav').filter({ has: page.getByRole('link', { name: 'Catalog' }) }).first();
    const destinos: [string, RegExp, string][] = [
      ['Catalog', /\/collections\/all$/, 'Products'],
      ['Blog', /\/blogs\/news$/, 'News – Sauce Demo'],
      ['About Us', /\/pages\/about-us$/, 'About Us'],
    ];
    for (const [link, url, texto] of destinos) {
      await menu.getByRole('link', { name: link }).click();
      await expect(page).toHaveURL(url);
      if (texto.includes('–')) await expect(page).toHaveTitle(texto);
      else await expect(page.getByRole('heading', { name: texto, level: 1 })).toBeVisible();
    }
    await menu.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/myshopify\.com\/$/);
  });

  test('TC-03 Los enlaces de la cabecera llevan a Search, Log In, Sign up y Check Out', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const destinos: [string, RegExp][] = [
      ['Search', /\/search$/],
      ['Log In', /\/account\/login$/],
      ['Sign up', /\/account\/register$/],
      ['Check Out', /\/cart$/],
    ];
    for (const [link, url] of destinos) {
      await page.goto('/');
      await header.getByRole('link', { name: link, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test('TC-04 El pie de página muestra enlaces, copyright y medios de pago', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText(/Copyright © \d{4} Sauce Demo/)).toBeVisible();
    for (const img of ['We accept Amex', 'We accept Visa', 'We accept Mastercard']) {
      await expect(footer.getByRole('img', { name: img })).toBeVisible();
    }
    await footer.getByRole('link', { name: 'About Us' }).first().click();
    await expect(page).toHaveURL(/\/pages\/about-us$/);
  });

  test('TC-05 Los iconos de redes sociales apuntan a Facebook, Twitter, Instagram, Pinterest y RSS', async ({ page }) => {
    await page.goto('/');
    for (const href of ['facebook.com/shopify', 'twitter.com/sauce_io', 'instagram.com/shopify', 'pinterest.com', '/blogs/news.atom']) {
      await expect(page.locator(`a[href*="${href}"]`).first()).toBeVisible();
    }
    const feed = await page.request.get('/blogs/news.atom');
    expect(feed.status()).toBe(200);
    expect(await feed.text()).toContain('<feed');
  });

  test('TC-06 "Wish list" abre la lista de deseos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Wish list' }).click();
    await expect(page).toHaveURL(/#sauce-show-wish-list/);
    // Se espera que aparezca un panel o ventana con la lista de deseos.
    await expect(page.locator(MODAL_SAUCE)).toBeVisible({ timeout: 5_000 });
  });

  test('TC-07 "Refer a friend" abre el formulario de recomendación', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Refer a friend' }).click();
    await expect(page).toHaveURL(/#sauce-show-refer-friend/);
    await expect(page.locator(MODAL_SAUCE)).toBeVisible({ timeout: 5_000 });
  });

  test('TC-08 Una URL inexistente muestra la página 404 con enlace al inicio', async ({ page }) => {
    const resp = await page.goto('/products/no-existe-123');
    expect(resp?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await page.getByRole('link', { name: 'homepage' }).click();
    await expect(page).toHaveURL(/myshopify\.com\/$/);
  });
});
