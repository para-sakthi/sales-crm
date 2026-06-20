import { apiClient } from './client'

export type Role = 'ADMIN' | 'USER'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string | null
  role: Role
  isActive: boolean
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export async function login(data: LoginRequest): Promise<AuthTokens> {
  const res = await apiClient.post<{ data: AuthTokens }>('/v1/auth/login', data)
  return res.data.data
}

export async function getMe(token: string): Promise<UserProfile> {
  const res = await apiClient.get<{ data: UserProfile }>('/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data
}

export async function getUsers(token: string): Promise<UserProfile[]> {
  const res = await apiClient.get<{ data: UserProfile[] }>('/v1/auth/users', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data
}

export async function logout(
  token: string,
  refreshToken: string,
): Promise<void> {
  await apiClient.post(
    '/v1/auth/logout',
    { refreshToken },
    { headers: { Authorization: `Bearer ${token}` } },
  )
}
