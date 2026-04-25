import { FlaskConical, Sun, Moon, LogOut } from 'lucide-react'

interface NavbarProps {
  userEmail: string | null
  theme: 'dark' | 'light'
  toggleTheme: () => void
  onSignOut: () => void
}

export function Navbar({ userEmail, theme, toggleTheme, onSignOut }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="logo-icon" style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
        }}>
          <FlaskConical size={20} />
        </div>
        <div className="navbar-brand-text">
          <h1 style={{ fontSize: '1.25rem', marginBottom: 0 }}>QA Forge</h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precision AI Testing</span>
        </div>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {userEmail && (
          <span className="mono hide-mobile" style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            background: 'var(--bg-glass)',
            padding: '4px 12px',
            borderRadius: '99px',
            border: '1px solid var(--border-glass)'
          }}>
            {userEmail}
          </span>
        )}
        
        <button
          className="forge-btn forge-btn-ghost action-btn-mobile"
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: 'var(--radius-sm)' }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="forge-btn forge-btn-ghost action-btn-mobile"
          onClick={onSignOut}
          style={{ padding: '8px 16px' }}
        >
          <LogOut size={16} />
          <span className="btn-label hide-mobile">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
