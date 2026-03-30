'use client'

import { useState } from 'react'
import { mockProjects } from '@/lib/mock-data'
import { Project, TestSession } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
  onNewTest: () => void
  onOpenSession: (session: TestSession) => void
}

function statusColor(status: TestSession['status']) {
  if (status === 'complete') return '#22c55e'
  if (status === 'running') return '#f59e0b'
  return '#7c6dff'
}

function statusLabel(status: TestSession['status']) {
  if (status === 'complete') return 'Complete'
  if (status === 'running') return 'Running'
  return 'Setup'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function TestLibrary({ onNewTest, onOpenSession }: Props) {
  const [expandedProjects, setExpandedProjects] = useState<string[]>(['proj-1'])

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const totalSessions = mockProjects.reduce((acc, p) => acc + p.sessions.length, 0)
  const completedSessions = mockProjects.reduce((acc, p) =>
    acc + p.sessions.filter(s => s.status === 'complete').length, 0)

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
        <Button
          onClick={onNewTest}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          + New Test
        </Button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            Test Library
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
            {totalSessions} tests across {mockProjects.length} projects — {completedSessions} completed
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {[
            { label: 'Total Projects', value: mockProjects.length },
            { label: 'Tests Run', value: totalSessions },
            { label: 'Completed', value: completedSessions },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '20px 24px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Project List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockProjects.map((project: Project) => {
            const isExpanded = expandedProjects.includes(project.id)
            return (
              <div key={project.id} style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>

                {/* Project Header */}
                <div
                  onClick={() => toggleProject(project.id)}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}>
                      📁
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>
                        {project.name}
                      </div>
                      {project.client && (
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                          {project.client}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {project.sessions.length} {project.sessions.length === 1 ? 'test' : 'tests'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                    }}>▼</span>
                  </div>
                </div>

                {/* Sessions List */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--card-border)' }}>
                    {project.sessions.map((session: TestSession, index: number) => (
                      <div
                        key={session.id}
                        onClick={() => onOpenSession(session)}
                        style={{
                          padding: '16px 24px 16px 72px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: index < project.sessions.length - 1
                            ? '1px solid var(--card-border)'
                            : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--accent-subtle)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {session.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                            {formatDate(session.createdAt)}
                            {session.personas.length > 0 && ` · ${session.personas.length} persona${session.personas.length > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: statusColor(session.status),
                            backgroundColor: `${statusColor(session.status)}18`,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontWeight: '500',
                          }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: statusColor(session.status),
                            }} />
                            {statusLabel(session.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}