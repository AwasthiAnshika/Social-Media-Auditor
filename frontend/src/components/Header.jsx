import { Mail } from 'lucide-react'

function Header() {
  return (
    <header className="w-full sticky top-0 z-50 py-4">
      <div className="app-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg center-v glass-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9S3 17 3 12z" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold">Social Media Auditor</div>
            <div className="text-xs muted">Free profile performance audit</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="mailto:anshikaawasthi175@gmail.com" className="btn-ghost center-v" aria-label="Contact">
            <Mail className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline muted">anshikaawasthi175@gmail.com</span>
            <span className="sm:hidden muted">Contact</span>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header

