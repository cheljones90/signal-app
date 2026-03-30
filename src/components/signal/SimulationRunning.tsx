'use client'

import { useState, useEffect } from 'react'
import { Persona, PRDRequirement } from '@/lib/types'

type ReportType = 'designer' | 'product' | 'engineering' | 'leadership'

type Props = {
  projectName: string
  testName: string
  personas: Persona[]
  prdRequirements: PRDRequirement[]
  reportTypes: ReportType[]
  onComplete: () => void
}

const SIMULATION_STAGES = [
  { id: 'mapping', label: 'Mapping prototype flows', duration: 2000 },
  { id: 'analyzing', label: 'Analyzing PRD requirements', duration: 2000 },
  { id: 'simulating', label: 'Running persona simulation', duration: 4000 },
  { id: 'annotating', label: 'Generating annotations', duration: 2500 },
  { id: 'building', label: 'Building stakeholder reports', duration: 2000 },
  { id: 'finalizing', label: 'Finalizing findings', duration: 1500 },
]

const PERSONA_THOUGHTS = [
  "Scanning the first screen...",
  "Looking for the primary action...",
  "Hmm, not sure what this button does.",
  "I expected to see a price summary here.",
  "Tapping through to the next step...",
  "Wait, how did I get here?",
  "This makes sense — continuing forward.",
  "I'd probably call support at this point.",
  "Almost there, just need to confirm...",
  "Completed the flow.",
]

export default function SimulationRunning({
  projectName,
  testName,
  personas,
  prdRequirements,
  reportTypes,
  onComplete,
}: Props) {
  const [currentStage, setCurrentStage] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0)
  const [thoughtIndex, setThoughtIndex] = useState(0)
  const [completedStages, setCompletedStages] = useState<string[]>([])
  const [done, setDone] = useState(false)

  // Drive the stage progression
  useEffect(() => {
    let elapsed = 0
    const totalDuration = SIMULATION_STAGES.reduce((acc, s) => acc + s.duration, 0)

    SIMULATION_STAGES.forEach((stage, index) => {
      setTimeout(() => {
        setCurrentStage(index)
        setCompletedStages(prev => {
          if (index > 0) return [...prev, SIMULATION_STAGES[index - 1].id]
          return prev
        })
      }, elapsed)
      elapsed += stage.duration
    })

    // Mark complete
    setTimeout(() => {
      setCompletedStages(SIMULATION_STAGES.map(s => s.id))
      setDone(true)
    }, elapsed)

    // Progress bar
    const interval = setInterval(() => {
      setOverallProgress(prev => {
        const next = prev + (100 / (totalDuration / 100))
        return next > 100 ? 100 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Cycle through persona thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setThoughtIndex(prev => (prev + 1) % PERSONA_THOUGHTS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  // Cycle through personas during simulation
  useEffect(() => {
    if (personas.length <= 1) return
    const interval = setInterval(() => {
      setCurrentPersonaIndex(prev => (prev + 1) % personas.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [personas.length])

  const activePersona = personas[currentPersonaIndex]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      display: 'flex',
      flexDirection: 'column',
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
        <div style={{
          fontSize: '13px',
          color: 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: done ? 'var(--success)' : 'var(--accent)',
            animation: done ? 'none' : 'pulse 1.5s infinite',
          }} />
          {done ? 'Simulation complete' : 'Simulation running'}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <div style={{
              fontSize: '13px',
              color: 'var(--accent)',
              fontWeight: '500',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {projectName}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {done ? 'Signal complete' : 'Signal is running'}
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              {done
                ? `Found insights across ${personas.length} persona${personas.length > 1 ? 's' : ''} — your reports are ready.`
                : `Testing ${testName} across ${personas.length} persona${personas.length > 1 ? 's' : ''}`
              }
            </p>
          </div>

          {/* Overall Progress */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                Overall progress
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: done ? 'var(--success)' : 'var(--accent)',
              }}>
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: 'var(--card-border)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${overallProgress}%`,
                backgroundColor: done ? 'var(--success)' : 'var(--accent)',
                borderRadius: '3px',
                transition: 'width 0.1s linear, background-color 0.3s',
              }} />
            </div>
          </div>

          {/* Stage List */}
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {SIMULATION_STAGES.map((stage, index) => {
              const isComplete = completedStages.includes(stage.id)
              const isActive = currentStage === index && !done
              return (
                <div key={stage.id} style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: index < SIMULATION_STAGES.length - 1
                    ? '1px solid var(--card-border)'
                    : 'none',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  transition: 'background-color 0.3s',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isComplete
                      ? 'var(--success)'
                      : isActive
                        ? 'var(--accent)'
                        : 'var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'white',
                    flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {isComplete ? '✓' : isActive ? '→' : ''}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: isComplete
                      ? 'var(--muted-foreground)'
                      : isActive
                        ? 'var(--foreground)'
                        : 'var(--muted-foreground)',
                    fontWeight: isActive ? '500' : '400',
                    transition: 'color 0.3s',
                  }}>
                    {stage.label}
                  </span>
                  {isActive && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          animation: `bounce 1.2s ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Active Persona Thought Bubble */}
          {!done && activePersona && (
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {activePersona.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {activePersona.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                    {activePersona.occupation} · {activePersona.layer1.primaryDevice} · {activePersona.layer1.techComfort} tech comfort
                  </div>
                </div>
                {personas.length > 1 && (
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: 'var(--muted-foreground)',
                  }}>
                    {currentPersonaIndex + 1} of {personas.length}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--foreground)',
                fontStyle: 'italic',
                lineHeight: '1.5',
                padding: '10px 12px',
                backgroundColor: 'var(--accent-subtle)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--accent)',
                transition: 'opacity 0.3s',
              }}>
                "{PERSONA_THOUGHTS[thoughtIndex]}"
              </div>
            </div>
          )}

          {/* Stats Row */}
          {!done && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {[
                { label: 'Personas', value: personas.length },
                { label: 'Requirements', value: prdRequirements.length },
                { label: 'Reports', value: reportTypes.length },
              ].map(stat => (
                <div key={stat.label} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complete State */}
          {done && (
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>
                Simulation complete
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px' }}>
                Signal found insights across {personas.length} persona{personas.length > 1 ? 's' : ''} and generated {reportTypes.length} report{reportTypes.length > 1 ? 's' : ''}.
              </div>
              <button
                onClick={onComplete}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                View Report →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}