import { useState } from 'react'
import { CheckCircle, Mail, Send, Loader2, RefreshCw } from 'lucide-react'

function EmailCollection({ onSubmit, error, onStartNewAudit }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setErrors('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setErrors('Please enter a valid email address')
      return
    }

    setErrors('')
    setIsSubmitting(true)
    
    try {
      if (onSubmit) {
        await onSubmit(email)
      }
      setSubmitted(true)
    } catch (err) {
      setErrors('Failed to submit email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-vb-bg border-2 border-vb-text rounded-lg p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-vb-text leading-tight">
              We'll get in touch with you soon!
            </h2>
            <p className="text-base sm:text-lg md:text-xl font-semibold text-vb-text leading-tight">
              Your report is ready and we've received your email. <span className="text-vb-accent font-bold">Our team will contact you shortly.</span>
            </p>
          </div>
          {onStartNewAudit && (
            <div className="pt-4">
              <button
                onClick={onStartNewAudit}
                className="w-full bg-vb-bg border-2 border-vb-text text-vb-text py-3 rounded font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-vb-accent focus:ring-offset-2 group"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow group-hover:animate-spin" />
                <span>Run Another Audit</span>
              </button>
            </div>
          )}
          <div className="pt-4">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Mail className="w-5 h-5 text-vb-accent" />
              <span className="text-vb-text font-medium">{email}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-vb-bg border-2 border-vb-text rounded-lg p-12 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="bg-vb-accent p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-vb-text">
            {error ? 'Analysis encountered an issue' : 'Your report is ready!'}
          </h2>
          <p className="text-vb-text opacity-80">
            {error 
              ? `We encountered an error: ${error}. Please provide your email and we'll investigate.`
              : "Please provide your email address and we'll get in touch with you soon."}
          </p>
          {error && (
            <div className="bg-red-50 border-2 border-vb-accent text-vb-accent px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-vb-text mb-2 text-left">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors('')
                }}
                placeholder="your.email@example.com"
                className={`w-full pl-12 pr-4 py-3 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vb-accent bg-vb-bg text-vb-text placeholder-gray-400 ${
                  errors ? 'border-vb-accent' : 'border-vb-text focus:border-vb-accent'
                }`}
              />
            </div>
            {errors && (
              <p className="mt-1 text-sm text-vb-accent text-left">{errors}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-vb-accent text-white py-3 rounded font-semibold hover:bg-[#9a0a00] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-vb-accent focus:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmailCollection

