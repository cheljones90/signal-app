import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { personas, prdRequirements, testName } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are simulating real users moving through a product prototype during a usability test.

TEST: ${testName}

PERSONAS:
${personas.map((p: any) => `
Name: ${p.name}
Occupation: ${p.occupation}  
Tech comfort: ${p.layer1.techComfort}
Device: ${p.layer1.primaryDevice}
Experience: ${p.layer1.experienceLevel}
Motivation: ${p.layer1.motivation}
Frustration: ${p.layer1.biggestFrustration}
`).join('\n')}

PRD REQUIREMENTS:
${prdRequirements.map((r: any) => `- [${r.type}] ${r.description}`).join('\n')}

Generate 10 realistic inner monologue thoughts that these personas would have while navigating this specific prototype. Write them in first person as if the persona is thinking out loud. Mix positive moments, confusion, hesitation, and friction — make them specific to the product context, not generic.

Return ONLY a JSON array of strings, no markdown:
["thought 1", "thought 2", "thought 3", ...]`
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const clean = content.text.replace(/```json|```/g, '').trim()
    const thoughts = JSON.parse(clean)

    return NextResponse.json({ thoughts })
  } catch (error) {
    console.error('Generate thoughts error:', error)
    return NextResponse.json(
      { error: 'Failed to generate thoughts' },
      { status: 500 }
    )
  }
}