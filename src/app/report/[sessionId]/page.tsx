'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReportView from '@/components/signal/ReportView'

export default function SharedReportPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/get-session?sessionId=${sessionId}`)
        const data = await res.json()
        if (data.session) {
          setSessionData(data.session)
        } else {
          setError('Report not found. This link may have expired.')
        }
      } catch {
        setError('Failed to load report.')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: 'white',
      }}>
        <div style={{ fontSize: '40px' }}>⚡</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading report...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: 'white',
      }}>
        <div style={{ fontSize: '40px' }}>🔍</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>{error}</div>
      </div>
    )
  }

  if (!sessionData) return null

  return (
    <ReportView
      projectName={sessionData.projectName}
      testName={sessionData.testName}
      personas={sessionData.personas}
      prdRequirements={sessionData.prdRequirements}
      prototypeUrl={sessionData.prototypeUrl}
      reportTypes={sessionData.reportTypes}
      report={sessionData.report}
      isShared={true}
      onBack={() => window.location.href = '/'}
    />
  )
}