import { kv } from '@vercel/kv'

export async function saveSession(sessionId: string, data: any) {
  await kv.set(`session:${sessionId}`, JSON.stringify(data))
  await kv.expire(`session:${sessionId}`, 60 * 60 * 24 * 30) // 30 days
}

export async function getSession(sessionId: string) {
  const data = await kv.get(`session:${sessionId}`)
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data
}

export async function saveProject(projectId: string, data: any) {
  await kv.set(`project:${projectId}`, JSON.stringify(data))
  await kv.expire(`project:${projectId}`, 60 * 60 * 24 * 30)
}

export async function getProject(projectId: string) {
  const data = await kv.get(`project:${projectId}`)
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data
}

export async function getAllSessionIds() {
  const keys = await kv.keys('session:*')
  return keys
}