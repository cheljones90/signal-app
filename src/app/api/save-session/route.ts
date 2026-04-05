import { NextRequest, NextResponse } from 'next/server'
import { saveSession } from '@/lib/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sessionData } = body

    if (!sessionId || !sessionData) {
      return NextResponse.json(
        { error: 'Missing sessionId or sessionData' },
        { status: 400 }
      )
    }

    await saveSession(sessionId, sessionData)

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/report/${sessionId}`

    return NextResponse.json({ success: true, shareUrl })
  } catch (error) {
    console.error('Save session error:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}