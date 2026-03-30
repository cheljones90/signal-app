import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { personas, prdRequirements, prototypeUrl, reportTypes, testName } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are Signal, a persona-driven usability simulation tool for product designers.

You have just completed a usability simulation of a Figma prototype. Based on the personas and PRD requirements provided, generate a realistic and detailed usability report.

TEST NAME: ${testName}
PROTOTYPE URL: ${prototypeUrl}

PERSONAS TESTED:
${personas.map((p: any) => `
- Name: ${p.name}
- Age: ${p.age}, ${p.occupation}
- Tech comfort: ${p.layer1.techComfort}
- Primary device: ${p.layer1.primaryDevice}
- Experience level: ${p.layer1.experienceLevel}
- Motivation: ${p.layer1.motivation}
- Biggest frustration: ${p.layer1.biggestFrustration}
`).join('\n')}

PRD REQUIREMENTS:
${prdRequirements.map((r: any) => `- [${r.type}] ${r.description}`).join('\n')}

REPORT TYPES REQUESTED: ${reportTypes.join(', ')}

Generate a complete usability report. Return ONLY a JSON object with no markdown, in this exact format:

{
  "overallConfidence": 72,
  "totalFrictionPoints": 8,
  "criticalIssues": 2,
  "topFindings": [
    "Finding one in plain language",
    "Finding two in plain language",
    "Finding three in plain language"
  ],
  "screens": [
    {
      "id": "screen-1",
      "name": "Home Screen",
      "confidenceScore": 85,
      "annotations": [
        {
          "id": "ann-1",
          "screenId": "screen-1",
          "personaName": "${personas[0]?.name || 'Persona 1'}",
          "severity": "high",
          "type": "friction",
          "comment": "First person inner monologue comment from the persona's perspective, 1-2 sentences",
          "x": 45,
          "y": 30
        }
      ]
    }
  ],
  "designerReport": {
    "summary": "2-3 sentence summary for the designer",
    "findings": [
      { "severity": "high", "screen": "Screen name", "issue": "Issue description", "recommendation": "What to fix" }
    ]
  },
  "productReport": {
    "summary": "2-3 sentence summary for product",
    "scopeRecommendations": [
      { "priority": "must-fix", "item": "Item description", "rationale": "Why it matters" }
    ]
  },
  "engineeringReport": {
    "summary": "2-3 sentence summary for engineering",
    "edgeCases": [
      { "screen": "Screen name", "case": "Edge case description", "impact": "What breaks" }
    ]
  },
  "leadershipReport": {
    "summary": "2-3 sentence executive summary",
    "recommendation": "Clear go/no-go or what needs to happen before shipping",
    "keyMetrics": [
      { "label": "Metric name", "value": "Value" }
    ]
  }
}

Make the annotations feel like real persona reactions — write in first person from each persona's voice. Include 3-5 screens with 2-4 annotations each. Make findings specific and actionable. Vary severity levels realistically.`
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const clean = content.text.replace(/```json|```/g, '').trim()
    const report = JSON.parse(clean)

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    )
  }
}