import { expect, test } from '@playwright/test'

test('renders the starter page', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Get started', exact: true }),
  ).toBeVisible()
})

test('increments the counter', async ({ page }) => {
  await page.goto('/')
  const counter = page.getByRole('button', { name: 'Count is 0', exact: true })
  await expect(counter).toBeVisible()
  await counter.click()
  await expect(
    page.getByRole('button', { name: 'Count is 1', exact: true }),
  ).toBeVisible()
})
