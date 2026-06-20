import { apiClient, type PaginatedApiResponse } from '@/api/client'
import type { Example } from '../types'

export type GetExamplesParams = {
  cursor?: string
  limit?: number
}

export async function getExamples(params?: GetExamplesParams): Promise<PaginatedApiResponse<Example>> {
  const response = await apiClient.get<PaginatedApiResponse<Example>>('/v1/example', { params })
  return response.data
}
