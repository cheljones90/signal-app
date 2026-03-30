export type PersonaLayer1 = {
  experienceLevel: 'new' | 'some' | 'power'
  primaryDevice: 'mobile' | 'desktop' | 'both'
  techComfort: 'low' | 'moderate' | 'high'
  motivation: string
  biggestFrustration: string
  usageFrequency: 'daily' | 'weekly' | 'occasionally'
}

export type PersonaLayer2 = {
  industry: 'fintech' | 'healthcare' | 'saas' | 'ecommerce' | 'other'
  attributes: Record<string, string>
}

export type Persona = {
  id: string
  name: string
  age: number
  occupation: string
  prompt: string
  layer1: PersonaLayer1
  layer2: PersonaLayer2
  generated: boolean
}

export type PRDRequirement = {
  id: string
  description: string
  type: 'requirement' | 'edge-case' | 'success-criteria'
  covered: boolean
}

export type Annotation = {
  id: string
  x: number
  y: number
  severity: 'low' | 'medium' | 'high'
  personaName: string
  comment: string
  type: 'friction' | 'confusion' | 'gap' | 'hesitation'
}

export type ReportScreen = {
  id: string
  name: string
  annotations: Annotation[]
  confidenceScore: number
}

export type Report = {
  id: string
  type: 'designer' | 'product' | 'engineering' | 'leadership'
  screens: ReportScreen[]
  summary: string
  topFindings: string[]
  generatedAt: string
}

export type TestSession = {
  id: string
  name: string
  projectId: string
  status: 'setup' | 'running' | 'complete'
  prdRequirements: PRDRequirement[]
  prototypeUrl: string
  personas: Persona[]
  reportTypes: Report['type'][]
  reports: Report[]
  createdAt: string
  completedAt?: string
}

export type Project = {
  id: string
  name: string
  client?: string
  sessions: TestSession[]
  createdAt: string
}

export type SetupStep = 1 | 2 | 3 | 4 | 5
