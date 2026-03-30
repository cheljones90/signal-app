'use client'

import { useState } from 'react'
import { TestSession } from '@/lib/types'
import TestLibrary from '@/components/signal/TestLibrary'
import SetupFlow from '@/components/signal/SetupFlow'
import SimulationRunning from '@/components/signal/SimulationRunning'
import ReportView from '@/components/signal/ReportView'

type ReportType = 'designer' | 'product' | 'engineering' | 'leadership'

type SetupData = {
  projectName: string
  testName: string
  prdText: string
  prdRequirements: any[]
  prototypeUrl: string
  personas: any[]
  reportTypes: ReportType[]
}

type View = 'library' | 'setup' | 'simulation' | 'report'

export default function Home() {
  const [view, setView] = useState<View>('library')
  const [setupData, setSetupData] = useState<SetupData | null>(null)

  if (view === 'library') {
    return (
      <TestLibrary
        onNewTest={() => setView('setup')}
        onOpenSession={(_session: TestSession) => setView('report')}
      />
    )
  }

  if (view === 'setup') {
    return (
      <SetupFlow
        onBack={() => setView('library')}
        onRunSignal={(data) => {
          setSetupData(data)
          setView('simulation')
        }}
      />
    )
  }

  if (view === 'simulation' && setupData) {
    return (
      <SimulationRunning
        projectName={setupData.projectName}
        testName={setupData.testName}
        personas={setupData.personas}
        prdRequirements={setupData.prdRequirements}
        reportTypes={setupData.reportTypes}
        onComplete={() => setView('report')}
      />
    )
  }

  if (view === 'report' && setupData) {
    return (
      <ReportView
        projectName={setupData.projectName}
        testName={setupData.testName}
        personas={setupData.personas}
        prdRequirements={setupData.prdRequirements}
        prototypeUrl={setupData.prototypeUrl}
        reportTypes={setupData.reportTypes}
        onBack={() => setView('library')}
      />
    )
  }

  return null
}