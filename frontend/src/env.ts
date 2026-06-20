import { z } from 'zod'

const schema = z.object({
  // Defaults so a static/demo deploy works with no env configuration.
  // Demo mode never calls the API, so the value just needs to be a valid URL.
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
})

export const env = schema.parse(import.meta.env)
