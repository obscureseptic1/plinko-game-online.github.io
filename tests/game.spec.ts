import { expect, test } from '@playwright/test';

test.describe('Idle Reactor', () => {
  test('can click for energy and buy an Intern', async ({ page }) => {
    await page.goto('/');

    const energyLabel = page.getByText(/Energy:/);
    await expect(energyLabel).toContainText('0.0');

    const clickButton = page.getByRole('button', { name: /Generate/ });
    for (let i = 0; i < 15; i += 1) {
      await clickButton.click();
    }

    await expect(energyLabel).toContainText('15.0');

    const internBuyButton = page.getByRole('button', { name: /Buy \(15.0\)/ });
    await expect(internBuyButton).toBeEnabled();
    await internBuyButton.click();

    await expect(page.getByText('Intern')).toContainText('x1');
  });

  test('can upgrade click power', async ({ page }) => {
    await page.goto('/');

    const clickButton = page.getByRole('button', { name: /Generate/ });
    for (let i = 0; i < 50; i += 1) {
      await clickButton.click();
    }

    const upgradeButton = page.getByRole('button', { name: /Upgrade Click/ });
    await expect(upgradeButton).toContainText('Upgrade Click (50.0)');
    await upgradeButton.click();

    await expect(clickButton).toContainText('Generate +2');
  });
});
