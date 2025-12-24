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
    <div className="w-full max-w-2xl app-container">
      <div className="glass-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative w-28 h-28 center-v" style={{borderRadius: '999px'}}>
            <div className="absolute inset-0" style={{background: 'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.18), transparent)'}}></div>
            <div className="relative center-v" style={{width:96,height:96,borderRadius:999,background:'linear-gradient(90deg,#7c3aed,#06b6d4)'}}>
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold">Analyzing your profile{dots}</h2>
        <p className="muted mt-2">@{username} on {platformNames[platform] || platform}</p>

        <div className="mt-6">
          <div className="w-full bg-white/6 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', transition: 'width 1s ease' }} />
          </div>
          <p className="text-sm muted mt-2">{Math.round(progress)}% complete</p>
        </div>

        <div className="flex justify-center gap-6 mt-6">
          <div className="center-v flex-col">
            <div className="glass-card p-3 rounded-full center-v"><Sparkles className="w-5 h-5" /></div>
            <div className="muted text-xs mt-2">Processing</div>
          </div>
          <div className="center-v flex-col">
            <div className="glass-card p-3 rounded-full center-v"><TrendingUp className="w-5 h-5" /></div>
            <div className="muted text-xs mt-2">Analyzing</div>
          </div>
          <div className="center-v flex-col">
            <div className="glass-card p-3 rounded-full center-v"><BarChart3 className="w-5 h-5" /></div>
            <div className="muted text-xs mt-2">Generating</div>
          </div>
        </div>

        <div className="mt-4 muted">{status}</div>
      </div>
    </div>
  )
}

export default Analyzing

