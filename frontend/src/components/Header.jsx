import { Mail } from 'lucide-react'

function Header() {
  return (
    <header className="w-full bg-vb-bg border-b border-gray-300 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 relative">
          {/* Left - Logo */}
          <div className="flex items-center flex-shrink-0 ml-4 sm:ml-6 md:ml-8">
            {/* <img 
              src={logo} 
              alt="Viral Blueprint Logo" 
              className="h-8 sm:h-12 md:h-14 w-auto object-contain"
            /> */}
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-vb-text">Social Media Auditor</span>
          </div>

          {/* Center - Platform Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-vb-text leading-tight tracking-tight whitespace-nowrap">
            Free Social Media Audit
            </h1>
          </div>

          {/* Right - Email with Icon */}
          <div className="flex items-center flex-shrink-0 mr-4 sm:mr-6 md:mr-8">
            <a
              href="mailto:matthew@viralblueprint.com"
              className="flex items-center gap-2 text-vb-accent hover:text-vb-accent transition-colors duration-200 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-vb-accent focus:ring-offset-2 rounded-md px-2 py-1 group"
              aria-label="Contact matthew@viralblueprint.com"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-vb-accent group-hover:text-vb-accent transition-colors" aria-hidden="true" />
              <span className="hidden sm:inline">anshikaawasthi175@gmai.com</span>
              <span className="sm:hidden">anshika</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

