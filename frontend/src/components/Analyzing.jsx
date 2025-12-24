import { useEffect, useState } from 'react'
import { Loader2, Sparkles, TrendingUp, BarChart3 } from 'lucide-react'

function Analyzing({ username, platform, onComplete, onError }) {
  const [dots, setDots] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Starting analysis...')

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    // Fake loading animation (no actual analysis - real analysis happens when email is submitted)
    const simulateProgress = async () => {
      setStatus('Preparing...')
      setProgress(30)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setStatus('Getting ready...')
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setProgress(100)
      setStatus('Ready!')

      // Quickly transition to email collection (this is just a visual loading screen)
      setTimeout(() => {
        if (onComplete) {
          onComplete({})
        }
      }, 300)
    }

    simulateProgress()

    return () => {
      clearInterval(dotsInterval)
    }
  }, [username, platform, onComplete, onError])

  const platformNames = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok'
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-vb-bg border-2 border-vb-text rounded-lg p-12 text-center space-y-8">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 bg-purple-300 rounded-full animate-pulse"></div>
            <div className="relative bg-vb-accent p-6 rounded-full">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-vb-text">
            Analyzing your profile{dots}
          </h2>
          <p className="text-vb-text text-lg opacity-80">
            @{username} on {platformNames[platform] || platform}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-vb-accent rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-vb-text opacity-70">{Math.round(progress)}% complete</p>
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center space-x-8 pt-4">
          <div className="flex flex-col items-center space-y-2 animate-bounce-slow">
            <div className="bg-gray-100 p-4 rounded-full">
              <Sparkles className="w-6 h-6 text-vb-accent" />
            </div>
            <span className="text-xs text-vb-text opacity-70">Processing</span>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gray-100 p-4 rounded-full">
              <TrendingUp className="w-6 h-6 text-vb-accent" />
            </div>
            <span className="text-xs text-vb-text opacity-70">Analyzing</span>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gray-100 p-4 rounded-full">
              <BarChart3 className="w-6 h-6 text-vb-accent" />
            </div>
            <span className="text-xs text-vb-text opacity-70">Generating</span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="pt-4">
          <p className="text-sm text-vb-text opacity-70 animate-pulse">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Analyzing

