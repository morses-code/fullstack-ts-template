import { greetingResponseSchema } from 'contracts'
import { useEffect, useState } from 'react'

export function ApiGreeting() {
  const [message, setMessage] = useState('Connecting to the API…')

  useEffect(() => {
    const controller = new AbortController()

    async function loadGreeting() {
      try {
        const response = await fetch('/api/greeting', {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        const greeting = greetingResponseSchema.parse(await response.json())
        if (!controller.signal.aborted) setMessage(greeting.message)
      } catch {
        if (!controller.signal.aborted)
          setMessage('Could not load the API greeting.')
      }
    }

    void loadGreeting()
    return () => controller.abort()
  }, [])

  return <p role="status">{message}</p>
}
