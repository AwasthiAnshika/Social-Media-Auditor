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
    <div className="w-full">
      {/* Hero Section - TOP OF SCREEN */}
      <div className="text-center py-2 px-4 sm:py-3">
        <div className="max-w-[520px] mx-auto pt-8 sm:pt-12 md:pt-16">
          <div className="bg-vb-accent border-4 border-vb-accent rounded-lg p-6 sm:p-8 transform transition-all">
            <div className="text-center mb-6">
              <h3 className="text-l sm:text-xl font-bold text-white mb-2">
                Your Views Aren't Random — Let's Prove It.
              </h3>
              <p className="text-base text-white font-medium">
                Stop Guessing Why Some Videos Die.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Social Handle Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2 text-left">
                  User Name
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setErrors({ ...errors, username: '' })
                  }}
                    placeholder="User Name"
                  className={`w-full px-4 py-3 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white bg-black text-white placeholder-gray-400 ${
                    errors.username ? 'border-white' : 'border-black focus:border-white'
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-white text-left">{errors.username}</p>
                )}
              </div>

              {/* Platform Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-white mb-2 text-left">
                  Select Platform
                </label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-between bg-black text-white ${
                    errors.platform ? 'border-white' : 'border-black focus:border-white'
                  } ${isDropdownOpen ? 'border-white' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    {selectedPlatformData ? (
                      <>
                        <SelectedIcon className="w-5 h-5" />
                        <span className="text-white">{selectedPlatformData.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select Platform</span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-black rounded border-2 border-white shadow-lg overflow-hidden">
                    {platforms.map((platform) => {
                      const Icon = platform.icon
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => handlePlatformSelect(platform.id)}
                          className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-900 transition-colors duration-150 text-left ${
                            selectedPlatform === platform.id ? 'bg-gray-900' : ''
                          }`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                          <span className="text-white">{platform.name}</span>
                          {selectedPlatform === platform.id && (
                            <svg className="w-5 h-5 text-vb-accent ml-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
                {errors.platform && (
                  <p className="mt-1 text-sm text-white text-left">{errors.platform}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded font-semibold text-base hover:bg-gray-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 flex items-center justify-center gap-2 animate-pulse-subtle group"
              >
                <span>Run My Free Audit</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 animate-pulse-slow" />
              </button>
            </form>
          </div>

          {/* Trust Bullets */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="bg-vb-accent text-white px-4 py-2 rounded border-2 border-vb-accent font-semibold text-sm flex items-center shadow-md">
              <span className="mr-2">✓</span>
              <span>No login required</span>
            </div>
            <div className="bg-vb-accent text-white px-4 py-2 rounded border-2 border-vb-accent font-semibold text-sm flex items-center shadow-md">
              <span className="mr-2">✓</span>
              <span>No posting access needed</span>
            </div>
            <div className="bg-vb-accent text-white px-4 py-2 rounded border-2 border-vb-accent font-semibold text-sm flex items-center shadow-md">
              <span className="mr-2">✓</span>
              <span>Instant results</span>
            </div>
          </div>

          {/* Closing Line */}
          <div className="mt-6 max-w-3xl mx-auto px-4">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-vb-text leading-tight text-center">
              Your next viral video starts with understanding your last one. <span className="text-vb-accent font-bold">Don't leave millions of views on the table.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
