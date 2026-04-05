'use client'

import { useEffect, useState } from 'react'
import { Persona, PRDRequirement } from '@/lib/types'

type ReportType = 'designer' | 'product' | 'engineering' | 'leadership'

type Annotation = {
  id: string
  screenId: string
  personaName: string
  severity: 'low' | 'medium' | 'high'
  type: 'friction' | 'confusion' | 'gap' | 'hesitation'
  comment: string
  x: number
  y: number
}

type Screen = {
  id: string
  name: string
  confidenceScore: number
  annotations: Annotation[]
}

type ReportData = {
  overallConfidence: number
  totalFrictionPoints: number
  criticalIssues: number
  topFindings: string[]
  screens: Screen[]
  designerReport: {
    summary: string
    findings: { severity: string; screen: string; issue: string; recommendation: string }[]
  }
  productReport: {
    summary: string
    scopeRecommendations: { priority: string; item: string; rationale: string }[]
  }
  engineeringReport: {
    summary: string
    edgeCases: { screen: string; case: string; impact: string }[]
  }
  leadershipReport: {
    summary: string
    recommendation: string
    keyMetrics: { label: string; value: string }[]
  }
}

type Props = {
  projectName: string
  testName: string
  personas: Persona[]
  prdRequirements: PRDRequirement[]
  prototypeUrl: string
  reportTypes: ReportType[]
  onBack: () => void
  report?: ReportData
  isShared?: boolean
}

function severityColor(severity: string) {
  if (severity === 'high') return '#ef4444'
  if (severity === 'medium') return '#f59e0b'
  return '#22c55e'
}

function confidenceColor(score: number) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function ReportView({
  projectName,
  testName,
  personas,
  prdRequirements,
  prototypeUrl,
  reportTypes,
  onBack,
  report: initialReport,
  isShared = false,
}: Props) {
  const [report, setReport] = useState<ReportData | null>(initialReport || null)
  const [loading, setLoading] = useState(!initialReport)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | ReportType>('overview')
  const [activeScreen, setActiveScreen] = useState<Screen | null>(null)
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const saveReportToKV = async (reportData: ReportData) => {
    setSaving(true)
    try {
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const res = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sessionData: {
            projectName,
            testName,
            personas,
            prdRequirements,
            prototypeUrl,
            reportTypes,
            report: reportData,
            savedAt: new Date().toISOString(),
          }
        })
      })
      const data = await res.json()
      if (data.shareUrl) {
        setShareUrl(data.shareUrl)
        setSaved(true)
      }
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!initialReport) {
      generateReport()
    } else {
      setActiveScreen(initialReport.screens?.[0] || null)
    }
  }, [])

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personas,
          prdRequirements,
          prototypeUrl,
          reportTypes,
          testName,
        }),
      })
      const data = await res.json()
      if (data.report) {
        setReport(data.report)
        if (data.report.screens?.length > 0) {
          setActiveScreen(data.report.screens[0])
        }
        await saveReportToKV(data.report)
      } else {
        setError('Failed to generate report')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    ...reportTypes.map(type => ({
      id: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }))
  ]

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ fontSize: '40px' }}>⚡</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Building your reports...</div>
        <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
          Signal is synthesizing findings across {personas.length} persona{personas.length > 1 ? 's' : ''}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--muted-foreground)',
          padding: '10px 16px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          marginTop: '8px',
        }}>
          ⏱ This usually takes 20–30 seconds
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--destructive)' }}>{error}</div>
        <button onClick={generateReport} style={{
          backgroundColor: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          cursor: 'pointer',
        }}>
          Try Again
        </button>
        <button onClick={onBack} style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted-foreground)',
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          ← Back to Library
        </button>
      </div>
    )
  }

  if (!report) return null

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
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <div style={{ color: 'var(--card-border)' }}>|</div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{projectName} / </span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{testName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isShared && shareUrl && (
            <button
              onClick={handleCopyLink}
              style={{
                backgroundColor: copied ? 'var(--success)' : 'var(--accent-subtle)',
                color: copied ? 'white' : 'var(--accent)',
                border: `1px solid ${copied ? 'var(--success)' : 'var(--accent)'}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copied ? '✓ Copied!' : '🔗 Share Report'}
            </button>
          )}
          {!isShared && saving && (
            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
              Saving...
            </span>
          )}
          {!isShared && saved && !saving && (
            <span style={{ fontSize: '12px', color: 'var(--success)' }}>
              ✓ Autosaved
            </span>
          )}
          {!isShared && (
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
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        borderBottom: '1px solid var(--card-border)',
        padding: '0 32px',
        backgroundColor: 'var(--card)',
        display: 'flex',
        gap: '0',
        position: 'sticky',
        top: '60px',
        zIndex: 9,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--accent)'
                : '2px solid transparent',
              color: activeTab === tab.id
                ? 'var(--foreground)'
                : 'var(--muted-foreground)',
              padding: '14px 20px',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                {
                  label: 'Confidence Score',
                  value: `${report.overallConfidence}%`,
                  color: confidenceColor(report.overallConfidence),
                  tooltip: 'How confidently Signal predicts users will complete this flow without significant friction. 80%+ is strong, below 60% needs attention.',
                },
                {
                  label: 'Friction Points',
                  value: report.totalFrictionPoints,
                  color: 'var(--warning)',
                  tooltip: 'Total moments where a persona hesitated, got confused, or nearly dropped off across all screens and flows.',
                },
                {
                  label: 'Critical Issues',
                  value: report.criticalIssues,
                  color: 'var(--destructive)',
                  tooltip: 'High severity findings that are likely to cause task failure or abandonment. These should be addressed before shipping.',
                },
                {
                  label: 'Personas Tested',
                  value: personas.length,
                  color: 'var(--accent)',
                  tooltip: 'Number of distinct user personas Signal simulated through this prototype.',
                },
              ].map(stat => (
                <div key={stat.label} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  position: 'relative',
                  cursor: 'default',
                }}
                  title={stat.tooltip}
                >
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: '4px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {stat.label}
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'var(--card-border)',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'help',
                      flexShrink: 0,
                    }}>?</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Findings */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Top Findings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.topFindings.map((finding, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    backgroundColor: 'var(--accent-subtle)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--accent)',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '14px', lineHeight: '1.5' }}>{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Annotated Screens */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Annotated Screens
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              gap: '16px',
            }}>
              {/* Screen List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.screens.map(screen => (
                  <div
                    key={screen.id}
                    onClick={() => {
                      setActiveScreen(screen)
                      setActiveAnnotation(null)
                    }}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: activeScreen?.id === screen.id
                        ? 'var(--accent-subtle)'
                        : 'var(--card)',
                      border: `1px solid ${activeScreen?.id === screen.id
                        ? 'var(--accent)'
                        : 'var(--card-border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                      {screen.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                        {screen.annotations.length} annotation{screen.annotations.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: confidenceColor(screen.confidenceScore),
                      }}>
                        {screen.confidenceScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Screen Detail */}
              {activeScreen && (
                <div style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  {/* Screen Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>
                        {activeScreen.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                        {activeScreen.annotations.length} annotation{activeScreen.annotations.length !== 1 ? 's' : ''} · {activeScreen.confidenceScore}% confidence
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: confidenceColor(activeScreen.confidenceScore),
                      backgroundColor: `${confidenceColor(activeScreen.confidenceScore)}18`,
                    }}>
                      {activeScreen.confidenceScore >= 80 ? 'High confidence' : activeScreen.confidenceScore >= 60 ? 'Medium confidence' : 'Low confidence'}
                    </div>
                  </div>

                  {/* Prototype Preview Area */}
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#0d0d14',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                  }}>
                    <div style={{
                      width: '100%',
                      maxWidth: '400px',
                      aspectRatio: '9/16',
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--muted-foreground)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                        {activeScreen.name}
                      </div>

                      {/* Annotation Hotspots */}
                      {activeScreen.annotations.map((ann, index) => (
                        <div
                          key={ann.id}
                          onClick={() => setActiveAnnotation(
                            activeAnnotation?.id === ann.id ? null : ann
                          )}
                          style={{
                            position: 'absolute',
                            left: `${ann.x}%`,
                            top: `${ann.y}%`,
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: severityColor(ann.severity),
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'white',
                            cursor: 'pointer',
                            zIndex: 2,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: activeAnnotation?.id === ann.id
                              ? `0 0 0 4px ${severityColor(ann.severity)}40`
                              : 'none',
                            transition: 'box-shadow 0.15s',
                          }}
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Annotations List */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '12px',
                    }}>
                      Annotations
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeScreen.annotations.map((ann, index) => (
                        <div
                          key={ann.id}
                          onClick={() => setActiveAnnotation(
                            activeAnnotation?.id === ann.id ? null : ann
                          )}
                          style={{
                            padding: '12px 14px',
                            backgroundColor: activeAnnotation?.id === ann.id
                              ? 'var(--accent-subtle)'
                              : 'var(--background)',
                            border: `1px solid ${activeAnnotation?.id === ann.id
                              ? 'var(--accent)'
                              : 'var(--card-border)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                          }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: severityColor(ann.severity),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: 'white',
                              flexShrink: 0,
                            }}>
                              {index + 1}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted-foreground)' }}>
                              {ann.personaName}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: `${severityColor(ann.severity)}18`,
                              color: severityColor(ann.severity),
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}>
                              {ann.severity}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--accent-subtle)',
                              color: 'var(--accent)',
                              fontWeight: '500',
                            }}>
                              {ann.type}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '13px',
                            fontStyle: 'italic',
                            color: 'var(--foreground)',
                            lineHeight: '1.5',
                            borderLeft: `2px solid ${severityColor(ann.severity)}`,
                            paddingLeft: '10px',
                          }}>
                            "{ann.comment}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DESIGNER TAB */}
        {activeTab === 'designer' && report.designerReport && (
          <div>
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🎨</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Designer Report</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                {report.designerReport.summary}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.designerReport.findings.map((finding, i) => (
                <div key={i} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: `4px solid ${severityColor(finding.severity)}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: severityColor(finding.severity),
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {finding.severity}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      {finding.screen}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    {finding.issue}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                    padding: '8px 12px',
                    backgroundColor: 'var(--accent-subtle)',
                    borderRadius: '6px',
                  }}>
                    💡 {finding.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT TAB */}
        {activeTab === 'product' && report.productReport && (
          <div>
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📋</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Product Report</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                {report.productReport.summary}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.productReport.scopeRecommendations.map((rec, i) => (
                <div key={i} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: rec.priority === 'must-fix' ? '#ef444420' : '#f59e0b20',
                      color: rec.priority === 'must-fix' ? '#ef4444' : '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    {rec.item}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
                    {rec.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENGINEERING TAB */}
        {activeTab === 'engineering' && report.engineeringReport && (
          <div>
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Engineering Report</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                {report.engineeringReport.summary}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.engineeringReport.edgeCases.map((ec, i) => (
                <div key={i} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
                    {ec.screen}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    {ec.case}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#ef4444',
                    padding: '8px 12px',
                    backgroundColor: '#ef444410',
                    borderRadius: '6px',
                    borderLeft: '3px solid #ef4444',
                  }}>
                    Impact: {ec.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERSHIP TAB */}
        {activeTab === 'leadership' && report.leadershipReport && (
          <div>
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Leadership Report</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: '1.6', marginBottom: '16px' }}>
                {report.leadershipReport.summary}
              </p>
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'var(--accent-subtle)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--accent)',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.5',
              }}>
                📌 {report.leadershipReport.recommendation}
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}>
              {report.leadershipReport.keyMetrics.map((metric, i) => (
                <div key={i} style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)', marginBottom: '6px' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}