import {
  type GreetingResponse,
  greetingQuerySchema,
  type HealthResponse,
} from 'contracts'
import Fastify, { type FastifyServerOptions } from 'fastify'

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options)

  app.get(
    '/api/health',
    async (): Promise<HealthResponse> => ({ status: 'ok' }),
  )

  app.get('/api/greeting', async (request, reply) => {
    const query = greetingQuerySchema.safeParse(request.query)
    if (!query.success) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'name must be a non-empty string of at most 100 characters',
      })
    }

    return { message: `Hello, ${query.data.name}!` } satisfies GreetingResponse
  })

  return app
}
