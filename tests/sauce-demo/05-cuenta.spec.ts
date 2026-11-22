import { test, expect } from './fixtures';

test.describe('Cuenta de cliente', () => {
  test('TC-31 El formulario de login tiene email, contraseña, "Sign In" y "Forgot your password?"', async ({ page }) => {
    await page.goto('/account/login');
    await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
    await expect(page.locator('#customer_email')).toBeVisible();
    await expect(page.locator('#customer_password')).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot your password?' })).toBeVisible();
  });

  test('TC-32 Credenciales inválidas no dan acceso a la cuenta', async ({ page }) => {
    await page.goto('/account/login');
    await page.locator('#customer_email').fill('usuario.inexistente@example.com');
    await page.locator('#customer_password').fill('ClaveIncorrecta123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3_000);
    await expect(page).not.toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
  });

  test('TC-33 Credenciales inválidas muestran un mensaje de error', async ({ page }) => {
    await page.goto('/account/login');
    await page.locator('#customer_email').fill('usuario.inexistente@example.com');
    await page.locator('#customer_password').fill('ClaveIncorrecta123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('.errors, .form-error, [role="alert"]').first()).toBeVisible();
  });

  test('TC-34 "Forgot your password?" muestra el formulario de recuperación y "Cancel" vuelve al login', async ({ page }) => {
    await page.goto('/account/login');
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
    await expect(page.getByText('Reset Password')).toBeVisible();
    await expect(page.locator('#recover-email')).toBeVisible();
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
  });

  test('TC-35 El formulario de registro tiene nombre, apellido, email, contraseña y "Create"', async ({ page }) => {
    await page.goto('/account/register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    for (const campo of ['first_name', 'last_name', 'email', 'password']) {
      await expect(page.locator(`input[name="customer[${campo}]"]`)).toBeVisible();
    }
    await expect(page.locator('input[name="customer[email]"]')).toHaveAttribute('type', 'email');
    await expect(page.locator('input[name="customer[password]"]')).toHaveAttribute('type', 'password');
  });

  test('TC-36 Registrarse con el formulario vacío no crea la cuenta', async ({ page }) => {
    await page.goto('/account/register');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3_000);
    await expect(page).not.toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });
});
