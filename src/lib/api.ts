import axios from 'axios'
import { AxiosHeaders } from 'axios'
import { auth } from '@/lib/firebase'

const BACKEND_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: BACKEND_API_BASE_URL,
  timeout: 8000,
})

apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth?.currentUser

  if (!currentUser) {
    return config
  }

  const token = await currentUser.getIdToken()

  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers

  return config
})
