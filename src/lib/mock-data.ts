import { Project, TestSession } from './types'

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Clover Estimates',
    client: 'Clover / Fiserv',
    createdAt: '2026-01-15',
    sessions: [
      {
        id: 'sess-1',
        name: 'MVP Flow Validation',
        projectId: 'proj-1',
        status: 'complete',
        prototypeUrl: 'https://figma.com/proto/example',
        personas: [
          {
            id: 'p-1',
            name: 'Marcus T.',
            age: 42,
            occupation: 'Independent Contractor',
            prompt: 'A mid-career contractor who runs a small landscaping business and manages invoicing between job sites on his phone.',
            generated: true,
            layer1: {
              experienceLevel: 'some',
              primaryDevice: 'mobile',
              techComfort: 'moderate',
              motivation: 'Send invoices faster without going back to the office',
              biggestFrustration: 'Current tools take too many steps to create a simple estimate',
              usageFrequency: 'daily'
            },
            layer2: {
              industry: 'fintech',
              attributes: {
                businessType: 'Personal services',
                currentTools: 'Square, paper invoices',
                mostUsedFeatures: 'Invoicing, payment tracking',
                painPoints: 'Too many taps to create an estimate on mobile'
              }
            }
          }
        ],
        prdRequirements: [
          { id: 'req-1', description: 'User can create an estimate from the home screen', type: 'requirement', covered: true },
          { id: 'req-2', description: 'User can add line items with custom pricing', type: 'requirement', covered: true },
          { id: 'req-3', description: 'User can send estimate via SMS or email', type: 'requirement', covered: true },
          { id: 'req-4', description: 'System handles zero-state when no estimates exist', type: 'edge-case', covered: true },
          { id: 'req-5', description: 'Estimate converts to invoice on customer approval', type: 'requirement', covered: false },
        ],
        reportTypes: ['designer', 'product', 'engineering'],
        reports: [],
        createdAt: '2026-01-20',
        completedAt: '2026-01-20'
      },
      {
        id: 'sess-2',
        name: 'Payment Terms Update',
        projectId: 'proj-1',
        status: 'complete',
        prototypeUrl: 'https://figma.com/proto/example2',
        personas: [],
        prdRequirements: [],
        reportTypes: ['designer'],
        reports: [],
        createdAt: '2026-02-10',
        completedAt: '2026-02-11'
      }
    ]
  },
  {
    id: 'proj-2',
    name: 'Clover Loyalty',
    client: 'Clover / Fiserv',
    createdAt: '2026-02-01',
    sessions: [
      {
        id: 'sess-3',
        name: 'Onboarding Flow',
        projectId: 'proj-2',
        status: 'complete',
        prototypeUrl: 'https://figma.com/proto/example3',
        personas: [],
        prdRequirements: [],
        reportTypes: ['designer', 'product', 'engineering', 'leadership'],
        reports: [],
        createdAt: '2026-02-15',
        completedAt: '2026-02-15'
      }
    ]
  },
  {
    id: 'proj-3',
    name: 'Internal Design System Audit',
    createdAt: '2026-03-01',
    sessions: [
      {
        id: 'sess-4',
        name: 'Component Coverage Check',
        projectId: 'proj-3',
        status: 'running',
        prototypeUrl: '',
        personas: [],
        prdRequirements: [],
        reportTypes: ['designer'],
        reports: [],
        createdAt: '2026-03-20',
      }
    ]
  }
]