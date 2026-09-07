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

test('loads a greeting from the real API through the frontend proxy', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText('Hello, World!')
})

test('shows a helpful message when the API fails', async ({ page }) => {
  await page.route('**/api/greeting', (route) => route.fulfill({ status: 503 }))
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText(
    'Could not load the API greeting.',
  )
})

test('rejects an API response that does not match the shared contract', async ({
  page,
}) => {
  await page.route('**/api/greeting', (route) =>
    route.fulfill({ json: { message: 123 } }),
  )
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText(
    'Could not load the API greeting.',
  )
})
