import { z } from 'zod'
import { buildApp } from './app.js'

const app = buildApp({ logger: true })

async function shutdown() {
  try {
    await app.close()
  } catch (error) {
    app.log.error(error)
    process.exitCode = 1
  }
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

try {
  const config = z
    .object({
      HOST: z.string().trim().min(1).default('127.0.0.1'),
      PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    })
    .parse(process.env)
  await app.listen({ host: config.HOST, port: config.PORT })
} catch (error) {
  app.log.error(error)
  await shutdown()
  process.exitCode = 1
}
