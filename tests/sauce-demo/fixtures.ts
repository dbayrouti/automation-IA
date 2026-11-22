import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export const BASE = 'https://sauce-demo.myshopify.com';
const EVIDENCIAS = path.join(__dirname, '..', '..', 'evidencias');

/**
 * Extiende el test base: al terminar cada caso guarda una captura de pantalla
 * en evidencias/<ID>_<estado>.png (el ID se toma del título: "TC-01 ...").
 */
export const test = base.extend<{ evidencia: void }>({
  // La URL base va aquí (no solo en la config) para que los tests funcionen
  // también desde la extensión de VS Code con cualquier playwright.config.
  baseURL: async ({}, use) => {
    await use(BASE);
  },
  evidencia: [
    async ({ page }, use, testInfo) => {
      await use();
      const id = testInfo.title.split(' ')[0];
      // Si falló porque Cloudflare pidió verificación humana, se marca como bloqueado.
      if (testInfo.status !== 'passed') {
        const bloqueado = await page
          .getByText(/Your connection needs to be verified|Verifying your connection|Just a moment/)
          .first()
          .isVisible()
          .catch(() => false);
        if (bloqueado) {
          testInfo.annotations.push({ type: 'bloqueado', description: 'Verificación de Cloudflare' });
        }
      }
      fs.mkdirSync(EVIDENCIAS, { recursive: true });
      const file = path.join(EVIDENCIAS, `${id}_${testInfo.status}.png`);
      try {
        for (const f of fs.readdirSync(EVIDENCIAS)) {
          if (f.startsWith(`${id}_`)) fs.unlinkSync(path.join(EVIDENCIAS, f));
        }
        await page.screenshot({ path: file, fullPage: true });
        await testInfo.attach(`evidencia ${id}`, { path: file, contentType: 'image/png' });
      } catch {
        /* la página puede estar cerrada si el test falló de forma abrupta */
      }
      // Pausa entre casos para no superar el límite de peticiones de Shopify (HTTP 429).
      await new Promise(r => setTimeout(r, 4_000));
    },
    { auto: true },
  ],
});

export { expect };

/** Enlace del contador del carrito en la cabecera: "My Cart (n)". */
export const cartCounter = (page: Page) => page.getByRole('link', { name: /My Cart \(\d+\)/ });

/** Abre un producto y lo agrega al carrito, esperando a que suba el contador. */
export async function addToCart(page: Page, slug: string, expectedCount: number) {
  await page.goto(`/collections/all/products/${slug}`, { waitUntil: 'load' });
  const added = page.waitForResponse(r => r.url().includes('/cart/add') && r.request().method() === 'POST');
  await page.locator('#add').click();
  const resp = await added;
  expect(resp.status(), 'código HTTP de /cart/add').toBe(200);
  await expect(async () => {
    await page.reload();
    await expect(cartCounter(page)).toHaveText(`My Cart (${expectedCount})`, { timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
}

/** Campo de cantidad visible de la primera línea del carrito. */
export const qtyInput = (page: Page) => page.locator('input[name^="updates"]:visible').first();
