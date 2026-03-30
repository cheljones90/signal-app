import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('API Key prefix:', process.env.ANTHROPIC_API_KEY?.substring(0, 10))

    const { prdText } = await request.json()
    console.log('PRD text length:', prdText?.length)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a product design tool that analyzes PRD documents. 
          
Analyze the following PRD and extract:
1. Main requirements (what the feature must do)
2. Edge cases (unusual or boundary scenarios to handle)
3. Success criteria (how we know the feature works)

Return ONLY a JSON array with no markdown or explanation, in this exact format:
[
  { "id": "req-1", "description": "requirement description", "type": "requirement", "covered": false },
  { "id": "req-2", "description": "edge case description", "type": "edge-case", "covered": false },
  { "id": "req-3", "description": "success criteria description", "type": "success-criteria", "covered": false }
]

PRD Content:
${prdText}`
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const clean = content.text.replace(/```json|```/g, '').trim()
    const requirements = JSON.parse(clean)

    return NextResponse.json({ requirements })
  } catch (error) {
    console.error('Full error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PRD', details: String(error) },
      { status: 500 }
    )
  }
}