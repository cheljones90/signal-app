import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { personas, prdRequirements, prototypeUrl, reportTypes, testName, kpis, exportedFrames } = await request.json()

    const imageContent = exportedFrames && exportedFrames.length > 0
      ? exportedFrames.map((frame: any) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/png' as const,
            data: frame.imageData,
          },
        }))
      : []

    const textContent = {
      type: 'text' as const,
      text: `You are Signal, a persona-driven usability simulation tool for product designers.

${exportedFrames && exportedFrames.length > 0
  ? `You have been provided with ${exportedFrames.length} actual design frame image${exportedFrames.length !== 1 ? 's' : ''} from Figma: ${exportedFrames.map((f: any) => f.name).join(', ')}. Analyze these images visually — look at the actual UI, layout, typography, information hierarchy, interactive elements, and visual affordances. Base your findings on what you actually see in the designs.`
  : 'Analyze based on the PRD and persona context provided.'
}

TEST NAME: ${testName}
CRITICAL KPIs: ${kpis || 'Not specified'}

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

${exportedFrames && exportedFrames.length > 0
  ? `Frame names for reference: ${exportedFrames.map((f: any) => f.name).join(', ')}`
  : ''
}

Generate a complete usability report based on your visual analysis of the actual design frames. Return ONLY a JSON object with no markdown, in this exact format:

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
      "name": "exact frame name from the images provided",
      "confidenceScore": 85,
      "annotations": [
        {
          "id": "ann-1",
          "screenId": "screen-1",
          "personaName": "${personas[0]?.name || 'Persona 1'}",
          "severity": "high",
          "type": "friction",
          "comment": "First person inner monologue referencing specific UI elements you can see in the design",
          "x": 45,
          "y": 30
        }
      ]
    }
  ],
  "designerReport": {
    "summary": "2-3 sentence summary referencing specific visual observations from the frames",
    "findings": [
      {
        "severity": "high",
        "screen": "exact frame name",
        "issue": "Specific issue referencing actual UI elements visible in the design",
        "whyItMatters": "Why this affects the user experience and KPI goals",
        "howToStrengthen": "Specific actionable recommendation"
      }
    ]
  },
  "productReport": {
    "summary": "2-3 sentence summary for product",
    "scopeRecommendations": [
      {
        "priority": "must-fix",
        "item": "Item description",
        "whyItMatters": "How this affects product goals and KPIs",
        "howToStrengthen": "What product decision would address this",
        "rationale": "Business rationale"
      }
    ]
  },
  "engineeringReport": {
    "summary": "2-3 sentence summary for engineering",
    "edgeCases": [
      {
        "screen": "exact frame name",
        "case": "Edge case description based on visible UI states",
        "whyItMatters": "What breaks if not handled",
        "howToStrengthen": "Technical recommendation",
        "impact": "What breaks"
      }
    ]
  },
  "leadershipReport": {
    "summary": "2-3 sentence executive summary",
    "recommendation": "Clear go/no-go recommendation",
    "keyMetrics": [
      { "label": "Metric name", "value": "Value" }
    ],
    "findings": [
      {
        "issue": "High level finding",
        "whyItMatters": "Business impact and KPI relationship",
        "howToStrengthen": "Strategic recommendation"
      }
    ]
  }
}

Make annotations reference specific UI elements you can actually see. Write persona comments in first person. Include all ${exportedFrames?.length || 3} screens. Make findings grounded in visual reality.`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [...imageContent, textContent],
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