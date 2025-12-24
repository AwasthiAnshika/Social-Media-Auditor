import { useState } from 'react'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Analyzing from './components/Analyzing'
import EmailCollection from './components/EmailCollection'

function App() {
  const [step, setStep] = useState('landing') // 'landing', 'analyzing', 'email'
  const [formData, setFormData] = useState({
    username: '',
    platform: '',
    analysisData: null,
    error: null
  })

  const handleSubmit = async (username, platform) => {
    setFormData({ username, platform, analysisData: null, error: null })
    setStep('analyzing')
  }

  const handleEmailSubmit = async (email) => {
    // Analyze and send email with PDF report
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: formData.platform,
          username: formData.username,
          email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to analyze and send email with report')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, analysisData: data }))
    } catch (error) {
      console.error('Error analyzing and sending email:', error)
      throw error // Re-throw so EmailCollection can handle it
    }
  }

  const handleStartNewAudit = () => {
    // Reset all state to start a new audit
    setFormData({
      username: '',
      platform: '',
      analysisData: null,
      error: null
    })
    setStep('landing')
  }

  return (
    <div className="h-screen bg-vb-bg overflow-hidden flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {step === 'landing' && <LandingPage onSubmit={handleSubmit} />}
        {step === 'analyzing' && (
          <div className="min-h-full flex items-center justify-center p-4">
            <Analyzing 
              username={formData.username} 
              platform={formData.platform}
              onComplete={(data) => {
                setFormData(prev => ({ ...prev, analysisData: data }))
                setStep('email')
              }}
              onError={(error) => {
                setFormData(prev => ({ ...prev, error }))
                setStep('email')
              }}
            />
          </div>
        )}
        {step === 'email' && (
          <div className="min-h-full flex items-center justify-center p-4">
            <EmailCollection 
              onSubmit={handleEmailSubmit}
              error={formData.error}
              onStartNewAudit={handleStartNewAudit}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

