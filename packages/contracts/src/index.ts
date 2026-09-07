import { z } from 'zod'

export const healthResponseSchema = z.object({ status: z.literal('ok') })
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const greetingQuerySchema = z.object({
  name: z.string().trim().min(1).max(100).default('World'),
})
export type GreetingQuery = z.infer<typeof greetingQuerySchema>

export const greetingResponseSchema = z.object({ message: z.string() })
export type GreetingResponse = z.infer<typeof greetingResponseSchema>
