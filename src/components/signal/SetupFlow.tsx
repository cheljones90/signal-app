'use client'

import { useState } from 'react'
import { Persona, PRDRequirement, SetupStep } from '@/lib/types'
import { Button } from '@/components/ui/button'

type ReportType = 'designer' | 'product' | 'engineering' | 'leadership'

type SetupData = {
  projectName: string
  testName: string
  prdText: string
  prdRequirements: PRDRequirement[]
  prototypeUrl: string
  personas: Persona[]
  reportTypes: ReportType[]
}

type Props = {
  onBack: () => void
  onRunSignal: (data: SetupData) => void
}

const STEPS = [
  { number: 1, label: 'PRD' },
  { number: 2, label: 'Prototype' },
  { number: 3, label: 'Personas' },
  { number: 4, label: 'Reports' },
  { number: 5, label: 'Review' },
]

const INDUSTRIES = [
  { value: 'fintech', label: 'Fintech / Payments' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'saas', label: 'SaaS / Productivity' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'other', label: 'Other' },
]

const REPORT_OPTIONS: { type: ReportType; label: string; description: string; icon: string }[] = [
  { type: 'designer', label: 'Designer', description: 'Annotated screens with friction hotspots and interaction gaps', icon: '🎨' },
  { type: 'product', label: 'Product', description: 'Insight summary with severity ratings and scope recommendations', icon: '📋' },
  { type: 'engineering', label: 'Engineering', description: 'Flagged edge cases, undefined states, and behavioral ambiguities', icon: '⚙️' },
  { type: 'leadership', label: 'Leadership', description: 'One-page brief: what was tested, found, and recommended', icon: '📊' },
]

export default function SetupFlow({ onBack, onRunSignal }: Props) {
  const [step, setStep] = useState<SetupStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [projectName, setProjectName] = useState('')
  const [testName, setTestName] = useState('')
  const [prdText, setPrdText] = useState('')
  const [prdRequirements, setPrdRequirements] = useState<PRDRequirement[]>([])
  const [prdParsed, setPrdParsed] = useState(false)

  // Step 2
  const [prototypeUrl, setPrototypeUrl] = useState('')
  const [prototypeConnected, setPrototypeConnected] = useState(false)

  // Step 3
  const [personas, setPersonas] = useState<Persona[]>([])
  const [personaCount, setPersonaCount] = useState(1)
  const [currentPersonaPrompt, setCurrentPersonaPrompt] = useState('')
  const [currentIndustry, setCurrentIndustry] = useState('fintech')
  const [generatingPersona, setGeneratingPersona] = useState(false)

  // Step 4
  const [reportTypes, setReportTypes] = useState<ReportType[]>(['designer'])

  const parsePRD = async () => {
    if (!prdText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/parse-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdText }),
      })
      const data = await res.json()
      if (data.requirements) {
        setPrdRequirements(data.requirements)
        setPrdParsed(true)
      }
    } catch {
      setError('Failed to parse PRD. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const connectPrototype = () => {
    if (!prototypeUrl.trim()) return
    setPrototypeConnected(true)
  }

  const generatePersona = async () => {
    if (!currentPersonaPrompt.trim()) return
    setGeneratingPersona(true)
    setError('')
    try {
      const res = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPersonaPrompt,
          industry: currentIndustry,
        }),
      })
      const data = await res.json()
      if (data.persona) {
        setPersonas(prev => [...prev, data.persona])
        setCurrentPersonaPrompt('')
      }
    } catch {
      setError('Failed to generate persona. Please try again.')
    } finally {
      setGeneratingPersona(false)
    }
  }

  const toggleReportType = (type: ReportType) => {
    setReportTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const selectAllReports = () => {
    setReportTypes(['designer', 'product', 'engineering', 'leadership'])
  }

  const canProceed = () => {
    if (step === 1) return prdParsed && projectName && testName
    if (step === 2) return prototypeConnected
    if (step === 3) return personas.length > 0
    if (step === 4) return reportTypes.length > 0
    return true
  }

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as SetupStep)
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as SetupStep)
    else onBack()
  }

  const handleRun = () => {
    onRunSignal({
      projectName,
      testName,
      prdText,
      prdRequirements,
      prototypeUrl,
      personas,
      reportTypes,
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
    }}>

      {/* Top Nav */}
      <div style={{
        borderBottom: '1px solid var(--card-border)',
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700',
            color: 'white',
          }}>S</div>
          <span style={{ fontWeight: '600', fontSize: '16px' }}>Signal</span>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Back to Library
        </button>
      </div>

      {/* Step Indicator */}
      <div style={{
        borderBottom: '1px solid var(--card-border)',
        padding: '0 32px',
        backgroundColor: 'var(--card)',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          gap: '0',
        }}>
          {STEPS.map((s, index) => (
            <div key={s.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step === s.number
                    ? 'var(--accent)'
                    : step > s.number
                      ? 'var(--success)'
                      : 'var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: step >= s.number ? 'white' : 'var(--muted-foreground)',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {step > s.number ? '✓' : s.number}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: step === s.number ? '600' : '400',
                  color: step === s.number
                    ? 'var(--foreground)'
                    : step > s.number
                      ? 'var(--success)'
                      : 'var(--muted-foreground)',
                }}>
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: step > s.number ? 'var(--success)' : 'var(--card-border)',
                  margin: '0 12px',
                  transition: 'background-color 0.2s',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 32px' }}>

        {/* STEP 1 — PRD */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Name your test
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '14px' }}>
              Give this session a name and upload your PRD so Signal knows what to test against.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: 'var(--muted-foreground)' }}>
                  Project Name
                </label>
                <input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Clover Estimates"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: 'var(--muted-foreground)' }}>
                  Test Name
                </label>
                <input
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  placeholder="e.g. MVP Flow Validation"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: 'var(--muted-foreground)' }}>
                Paste your PRD
              </label>
              <textarea
                value={prdText}
                onChange={e => { setPrdText(e.target.value); setPrdParsed(false) }}
                placeholder="Paste your full PRD here — requirements, edge cases, success criteria, context. The more detail you provide, the more accurate Signal's findings will be."
                rows={10}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--destructive)', fontSize: '13px', marginBottom: '12px' }}>
                {error}
              </p>
            )}

            {!prdParsed ? (
              <button
                onClick={parsePRD}
                disabled={loading || !prdText.trim() || !projectName || !testName}
                style={{
                  backgroundColor: loading || !prdText.trim() || !projectName || !testName
                    ? 'var(--card-border)'
                    : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading || !prdText.trim() ? 'not-allowed' : 'pointer',
                  width: '100%',
                  marginBottom: '24px',
                }}
              >
                {loading ? 'Parsing PRD...' : 'Parse PRD with Signal'}
              </button>
            ) : (
              <div style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}>
                  <span style={{ color: 'var(--success)', fontSize: '16px' }}>✓</span>
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>
                    PRD Parsed — {prdRequirements.length} items extracted
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {prdRequirements.map(req => (
                    <div key={req.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: 'var(--accent-subtle)',
                      borderRadius: '8px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: req.type === 'requirement'
                          ? 'var(--accent)'
                          : req.type === 'edge-case'
                            ? 'var(--warning)'
                            : 'var(--success)',
                        backgroundColor: req.type === 'requirement'
                          ? '#1a1730'
                          : req.type === 'edge-case'
                            ? '#2a1f00'
                            : '#0a2010',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        marginTop: '1px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {req.type === 'edge-case' ? 'Edge' : req.type === 'success-criteria' ? 'Success' : 'Req'}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--foreground)', lineHeight: '1.5' }}>
                        {req.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Prototype */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Connect your prototype
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '14px' }}>
              Paste your Figma prototype URL. Signal will map the flows and confirm coverage against your PRD requirements.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: 'var(--muted-foreground)' }}>
                Figma Prototype URL
              </label>
              <input
                value={prototypeUrl}
                onChange={e => { setPrototypeUrl(e.target.value); setPrototypeConnected(false) }}
                placeholder="https://figma.com/proto/..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {!prototypeConnected ? (
              <button
                onClick={connectPrototype}
                disabled={!prototypeUrl.trim()}
                style={{
                  backgroundColor: !prototypeUrl.trim() ? 'var(--card-border)' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: !prototypeUrl.trim() ? 'not-allowed' : 'pointer',
                  width: '100%',
                  marginBottom: '24px',
                }}
              >
                Connect Prototype
              </button>
            ) : (
              <div style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>Prototype Connected</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Flows detected', value: '4 end-to-end flows', ok: true },
                    { label: 'Screens mapped', value: '12 screens', ok: true },
                    { label: 'PRD coverage', value: `${prdRequirements.length - 1} of ${prdRequirements.length} requirements covered`, ok: false },
                    { label: 'Coverage gap', value: 'Estimate → Invoice conversion flow missing', ok: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'var(--accent-subtle)',
                      borderRadius: '8px',
                    }}>
                      <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{item.label}</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: item.ok ? 'var(--foreground)' : 'var(--warning)',
                      }}>
                        {!item.ok && '⚠ '}{item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Personas */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Configure personas
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '14px' }}>
              Describe who you want to test against. Signal generates a realistic persona from your description and runs the simulation through their eyes.
            </p>

            {/* Existing Personas */}
            {personas.length > 0 && (
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {personas.map((persona, index) => (
                  <div key={persona.id} style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'white',
                        flexShrink: 0,
                      }}>
                        {persona.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>
                          {persona.name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
                          {persona.age} · {persona.occupation}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--foreground)', lineHeight: '1.5' }}>
                          {persona.prompt}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {[
                            persona.layer1.experienceLevel,
                            persona.layer1.primaryDevice,
                            persona.layer1.techComfort + ' tech comfort',
                          ].map(tag => (
                            <span key={tag} style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: 'var(--accent-subtle)',
                              borderRadius: '4px',
                              color: 'var(--accent)',
                              fontWeight: '500',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPersonas(prev => prev.filter((_, i) => i !== index))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Persona */}
            {personas.length < 3 && (
              <div style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                  {personas.length === 0 ? 'Generate your first persona' : `Add persona ${personas.length + 1} of 3`}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
                    Industry context
                  </label>
                  <select
                    value={currentIndustry}
                    onChange={e => setCurrentIndustry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind.value} value={ind.value}
                        style={{ backgroundColor: '#111118' }}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
                    Describe this persona
                  </label>
                  <textarea
                    value={currentPersonaPrompt}
                    onChange={e => setCurrentPersonaPrompt(e.target.value)}
                    placeholder="e.g. A mid-career contractor who runs a small landscaping business and manages invoicing between job sites on his phone. Not very tech savvy, uses Square currently but finds it limiting."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                    }}
                  />
                </div>

                {error && (
                  <p style={{ color: 'var(--destructive)', fontSize: '13px', marginBottom: '12px' }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={generatePersona}
                  disabled={generatingPersona || !currentPersonaPrompt.trim()}
                  style={{
                    backgroundColor: generatingPersona || !currentPersonaPrompt.trim()
                      ? 'var(--card-border)'
                      : 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: generatingPersona || !currentPersonaPrompt.trim() ? 'not-allowed' : 'pointer',
                    width: '100%',
                  }}
                >
                  {generatingPersona ? 'Generating persona...' : 'Generate Persona with Signal'}
                </button>
              </div>
            )}

            {personas.length === 3 && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--accent-subtle)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--accent)',
                marginBottom: '24px',
              }}>
                Maximum of 3 personas reached. Remove one to add a different persona.
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Report Types */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Select report types
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '24px', fontSize: '14px' }}>
              Choose which stakeholder outputs Signal should generate from this run. You can select one or all four.
            </p>

            <button
              onClick={selectAllReports}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              Select All
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {REPORT_OPTIONS.map(option => {
                const selected = reportTypes.includes(option.type)
                return (
                  <div
                    key={option.type}
                    onClick={() => toggleReportType(option.type)}
                    style={{
                      backgroundColor: selected ? 'var(--accent-subtle)' : 'var(--card)',
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--card-border)'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{option.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                        {option.label} Report
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        {option.description}
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${selected ? 'var(--accent)' : 'var(--card-border)'}`,
                      backgroundColor: selected ? 'var(--accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}>
                      {selected && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Review and run
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '14px' }}>
              Everything looks good. Here's what Signal will test.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                {
                  label: 'Project',
                  value: projectName,
                  icon: '📁',
                },
                {
                  label: 'Test',
                  value: testName,
                  icon: '🧪',
                },
                {
                  label: 'PRD',
                  value: `${prdRequirements.length} requirements extracted`,
                  icon: '📄',
                },
                {
                  label: 'Prototype',
                  value: prototypeUrl,
                  icon: '🔗',
                },
                {
                  label: 'Personas',
                  value: personas.map(p => p.name).join(', '),
                  icon: '👥',
                },
                {
                  label: 'Reports',
                  value: reportTypes.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', '),
                  icon: '📋',
                },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '2px', fontWeight: '500' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground)', wordBreak: 'break-all' }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRun}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                letterSpacing: '0.01em',
              }}
            >
              Run Signal ⚡
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--card-border)',
          }}>
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: '1px solid var(--card-border)',
                color: 'var(--muted-foreground)',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                backgroundColor: canProceed() ? 'var(--accent)' : 'var(--card-border)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
              }}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}