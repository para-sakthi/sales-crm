import axios from 'axios'
import { env } from '@/env'

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling — extend as needed (auth refresh, logging, etc.)
    return Promise.reject(error)
  },
)

export type ApiResponse<T> = {
  data: T
}

export type PaginatedApiResponse<T> = {
  data: T[]
  meta: {
    nextCursor: string | null
    total: number
  }
}
