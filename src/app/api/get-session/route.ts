import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    console.log('Looking for sessionId:', sessionId)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    const key = `session:${sessionId}`
    console.log('Looking for key:', key)

    const data = await kv.get(key)
    console.log('Data found:', !!data)

    if (!data) {
      // List all keys to debug
      const keys = await kv.keys('session:*')
      console.log('All session keys in KV:', keys)

      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const session = typeof data === 'string' ? JSON.parse(data) : data
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Failed to get session', details: String(error) },
      { status: 500 }
    )
  }
}