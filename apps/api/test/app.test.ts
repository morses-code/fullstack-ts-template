import { greetingResponseSchema, healthResponseSchema } from 'contracts'
import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

describe('API', () => {
  const apps: ReturnType<typeof buildApp>[] = []

  function createApp() {
    const app = buildApp()
    apps.push(app)
    return app
  }

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()))
  })

  it('reports health using the shared contract', async () => {
    const response = await createApp().inject('/api/health')
    expect(response.statusCode).toBe(200)
    expect(healthResponseSchema.parse(response.json())).toEqual({
      status: 'ok',
    })
  })

  it.each([
    ['/api/greeting', 'Hello, World!'],
    ['/api/greeting?name=Ada', 'Hello, Ada!'],
    ['/api/greeting?name=%20Ada%20', 'Hello, Ada!'],
  ])('handles %s', async (url, message) => {
    const response = await createApp().inject(url)
    expect(response.statusCode).toBe(200)
    expect(greetingResponseSchema.parse(response.json())).toEqual({ message })
  })

  it.each(['', '%20', 'a'.repeat(101), 'Ada&name=Grace'])(
    'rejects an invalid name: %s',
    async (name) => {
      const response = await createApp().inject(`/api/greeting?name=${name}`)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({ error: 'Bad Request' })
    },
  )

  it('returns 404 for an unknown route', async () => {
    const response = await createApp().inject('/api/missing')
    expect(response.statusCode).toBe(404)
  })
})
