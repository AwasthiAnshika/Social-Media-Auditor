import { useState, useEffect, useRef } from 'react'
import { Youtube, Instagram, Music, ArrowRight } from 'lucide-react'

const platforms = [
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'tiktok', name: 'TikTok', icon: Music },
]

function LandingPage({ onSubmit }) {
  const [username, setUsername] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const dropdownRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!username.trim()) {
      newErrors.username = 'Please enter your social handle'
    }
    if (!selectedPlatform) {
      newErrors.platform = 'Please select a platform'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit(username.trim(), selectedPlatform)
  }

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId)
    setIsDropdownOpen(false)
    setErrors({ ...errors, platform: '' })
  }

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)
  const SelectedIcon = selectedPlatformData?.icon

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="w-full app-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Hero text */}
        <div className="fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Your Views Aren't Random — <span className="accent">Let's Prove It.</span>
          </h2>
          <p className="mt-4 muted max-w-lg">
            Get a professionally generated audit of any public profile — no login, no access. Discover what works and scale your reach.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="glass-card px-4 py-2 rounded-lg">
              <strong>✓</strong> No login required
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <strong>✓</strong> No posting access needed
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <strong>✓</strong> Instant results
            </div>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="glass-card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium muted mb-2">
                User Handle
              </label>
              <input id="username" type="text" value={username} onChange={(e)=>{setUsername(e.target.value); setErrors({...errors, username:''})}} placeholder="e.g. @yourhandle" className="input" />
              {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
            </div>

            <div ref={dropdownRef}>
              <label className="block text-sm font-medium muted mb-2">Platform</label>
              <div className="relative">
                <button type="button" onClick={()=>setIsDropdownOpen(!isDropdownOpen)} className="select flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedPlatformData ? <><SelectedIcon className="w-5 h-5" /> <span>{selectedPlatformData.name}</span></> : <span className="muted">Select platform</span>}
                  </div>
                  <svg className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180':''}`} viewBox="0 0 24 24" fill="none"><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 glass-card p-2">
                    {platforms.map(p=>{
                      const Icon = p.icon
                      return (
                        <button key={p.id} type="button" onClick={()=>handlePlatformSelect(p.id)} className={`w-full text-left px-3 py-2 rounded hover:bg-white/4 ${selectedPlatform===p.id?'bg-white/6':''}`}>
                          <div className="flex items-center gap-3"><Icon className="w-5 h-5" /> <span>{p.name}</span></div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {errors.platform && <p className="text-sm text-red-400 mt-1">{errors.platform}</p>}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <span>Run My Free Audit</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
