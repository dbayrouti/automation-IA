import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración para el plan de pruebas de https://sauce-demo.myshopify.com/
 * Ejecutar con:  npx playwright test -c playwright.sauce.config.ts
 */
export default defineConfig({
  testDir: './tests/sauce-demo',
  outputDir: './test-results/sauce-demo',
  // Un solo worker: con varios en paralelo Shopify/Cloudflare muestra
  // "Verify you are human" y bloquea las pruebas.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reporte-sauce-demo', open: 'never' }],
    ['json', { outputFile: 'reporte-sauce-demo/resultados.json' }],
  ],
  use: {
    baseURL: 'https://sauce-demo.myshopify.com',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    locale: 'en-GB',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
