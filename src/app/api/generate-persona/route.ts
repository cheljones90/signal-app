import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const { prompt, industry } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a UX research tool that generates realistic user personas for usability testing.

Generate a detailed user persona based on this description: "${prompt}"
Industry context: ${industry}

Return ONLY a JSON object with no markdown or explanation, in this exact format:
{
  "id": "p-1",
  "name": "First name and last initial only (e.g. Marcus T.)",
  "age": 35,
  "occupation": "Job title",
  "prompt": "One sentence bio describing who this person is",
  "generated": true,
  "layer1": {
    "experienceLevel": "new | some | power",
    "primaryDevice": "mobile | desktop | both",
    "techComfort": "low | moderate | high",
    "motivation": "What they are trying to accomplish",
    "biggestFrustration": "Their biggest pain point with current tools",
    "usageFrequency": "daily | weekly | occasionally"
  },
  "layer2": {
    "industry": "${industry}",
    "attributes": {
      "key1": "value1",
      "key2": "value2",
      "key3": "value3"
    }
  }
}`
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const clean = content.text.replace(/```json|```/g, '').trim()
   const persona = JSON.parse(clean)
persona.id = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
return NextResponse.json({ persona })
  } catch (error) {
    console.error('Generate persona error:', error)
    return NextResponse.json(
      { error: 'Failed to generate persona' },
      { status: 500 }
    )
  }
}