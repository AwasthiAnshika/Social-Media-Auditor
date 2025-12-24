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
      <div className="w-full max-w-md app-container">
        <div className="glass-card p-8 text-center">
          <div className="flex justify-center">
            <div className="p-4 rounded-full center-v" style={{background:'linear-gradient(90deg,#7c3aed,#06b6d4)'}}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4">We'll get in touch with you soon!</h2>
          <p className="muted mt-2">Your report is ready and we've received your email. <span className="accent font-semibold">Our team will contact you shortly.</span></p>
          {onStartNewAudit && (
            <div className="mt-6">
              <button onClick={onStartNewAudit} className="btn-ghost w-full">Run Another Audit</button>
            </div>
          )}
          <div className="mt-4 inline-flex items-center gap-3 glass-card px-4 py-2 rounded">
            <Mail className="w-5 h-5 text-white" />
            <span className="muted">{email}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md app-container">
      <div className="glass-card p-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full center-v" style={{background:'linear-gradient(90deg,#7c3aed,#06b6d4)'}}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-4">{error ? 'Analysis encountered an issue' : 'Your report is ready!'}</h2>
        <p className="muted mt-2">{error ? `We encountered an error: ${error}. Please provide your email and we'll investigate.` : "Please provide your email address and we'll get in touch with you soon."}</p>
        {error && <div className="mt-3 bg-white/6 text-red-300 px-4 py-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="email" className="block text-sm muted mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 muted" />
              <input id="email" type="email" value={email} onChange={(e)=>{setEmail(e.target.value); setErrors('')}} placeholder="your.email@example.com" className="input pl-10" />
            </div>
            {errors && <p className="text-sm text-red-400 mt-1">{errors}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/>Submitting...</> : <><Send className="w-5 h-5 mr-2"/>Submit</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmailCollection

