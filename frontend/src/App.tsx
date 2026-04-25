import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithRedirect, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import {
  FlaskConical,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Check,
  ClipboardList,
  Zap,
  Sun,
  Moon,
  AlertCircle,
  Shield,
  ShieldAlert,
  TriangleAlert,
  LogOut,
  Lock,
  FileText
} from 'lucide-react'

import forgeHero from './assets/hero-forge.png'
import './App.css'

// ── Types ─────────────────────────────────────────────────
interface TestCase {
  id: string
  title: string
  type: string
  summary: string
  preconditions: string
  steps: string[]
  expected_results: string[]
  priority: string
}

const API_BASE = 'http://localhost:8000'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [subtaskLoading, setSubtaskLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('qa-forge-theme') as 'dark' | 'light') || 'dark'
  })

  // ── Auth Logic ───────────────────────────────────────────
  const checkAuth = async () => {
    try {
      const { tokens } = await fetchAuthSession()
      if (tokens?.idToken) {
        setIsAuthenticated(true)
        setUserEmail(tokens.idToken.payload.email as string || 'Enterprise User')
      } else {
        setIsAuthenticated(false)
      }
    } catch (err) {
      setIsAuthenticated(false)
    } finally {
      setIsAuthLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (['signInWithRedirect', 'signedIn', 'tokenRefresh'].includes(payload.event)) {
        setTimeout(() => checkAuth(), 500)
      }
      if (['signedOut', 'signInWithRedirect_failure'].includes(payload.event)) {
        setIsAuthenticated(false)
        setUserEmail(null)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('qa-forge-theme', theme)
  }, [theme])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const getAuthHeader = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken ? { 'Authorization': `Bearer ${tokens.idToken.toString()}` } : {};
    } catch { return {}; }
  }

  // ── Handlers ─────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!ticketId.trim()) return
    setLoading(true)
    setTestCases([])
    setSelectedCases(new Set())

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api/generate/${ticketId}`, {
        method: 'POST',
        headers: { ...authHeader }
      })
      const data = await res.json()

      if (data.error) showToast(data.error, 'error')
      else if (data.test_cases) {
        setTestCases(data.test_cases)
        setSelectedCases(new Set(data.test_cases.map((tc: TestCase) => tc.id)))
        showToast(`Forged ${data.test_cases.length} test cases successfully.`, 'success')
      }
    } catch {
      showToast('Forge connection lost. Ensure the backend is active.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedCases(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePushSubtasks = async () => {
    const selected = testCases.filter(tc => selectedCases.has(tc.id))
    setSubtaskLoading(true)
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api/push/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ test_cases: selected }),
      })
      const data = await res.json()
      if (data.error) showToast(data.error, 'error')
      else showToast(`Pushed ${data.pushed} cases to Jira.`, 'success')
    } catch { showToast('Push failed.', 'error') }
    finally { setSubtaskLoading(false) }
  }

  const handlePushExcel = async () => {
    const selected = testCases.filter(tc => selectedCases.has(tc.id))
    setExcelLoading(true)
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api/push-excel/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ test_cases: selected }),
      })
      const data = await res.json()
      if (data.error) showToast(data.error, 'error')
      else showToast(`Pushed Excel to Jira successfully.`, 'success')
    } catch { showToast('Excel push failed.', 'error') }
    finally { setExcelLoading(false) }
  }

  const handleSelectAll = () => {
    if (selectedCases.size === testCases.length) {
      setSelectedCases(new Set())
    } else {
      setSelectedCases(new Set(testCases.map(tc => tc.id)))
    }
  }

  const toggleSelectAll = handleSelectAll

  // ── Badge Helpers ────────────────────────────────────────
  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'positive': return 'badge badge-positive'
      case 'negative': return 'badge badge-negative'
      case 'edge': return 'badge badge-edge'
      default: return 'badge'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'badge badge-high'
      case 'medium': return 'badge badge-medium'
      case 'low': return 'badge badge-low'
      default: return 'badge'
    }
  }

  // ── UI States ────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="forge-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="landing-logo-icon">
                <FlaskConical size={26} />
              </div>
              <h1 className="landing-title">QA Forge</h1>
            </div>
            <h2 className="landing-subtitle">
              Stop writing test cases by hand.<br />
              Paste a Jira ticket, get <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>production-ready test cases</span> in seconds.
            </h2>
            <p className="landing-desc">
              Built for QA engineers who'd rather spend time breaking things than documenting how to break them.
            </p>
            <button
              className="forge-btn forge-btn-primary"
              style={{ padding: '16px 40px', fontSize: '1rem', width: 'fit-content', marginTop: '8px' }}
              onClick={() => signInWithRedirect()}
            >
              <Lock size={18} />
              Sign in with SSO
            </button>
          </motion.div>
        </div>
        <div className="landing-hero">
          <img src={forgeHero} alt="QA Forge dashboard preview" className="landing-hero-img" />
          <div className="landing-hero-overlay" />
        </div>
      </div>
    )
  }

  const positiveCount = testCases.filter(t => t.type.toLowerCase() === 'positive').length
  const negativeCount = testCases.filter(t => t.type.toLowerCase() === 'negative').length
  const edgeCount = testCases.filter(t => t.type.toLowerCase() === 'edge').length

  return (
    <div className="app-shell">
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-icon">
            <FlaskConical size={20} />
          </div>
          <div className="navbar-brand-text">
            <h1>QA Forge</h1>
            <span>AI-Powered Manual Test Generator</span>
          </div>
        </div>
        <div className="navbar-right">
          <div className="user-info">
            <span className="username-label">{userEmail || 'User'}</span>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => amplifySignOut()}
            title="Sign Out"
          >
            <LogOut size={18} />
            <span className="btn-label">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="main-content">
        {/* Input Section */}
        <section className="input-section">
          <h2>Generate Test Cases</h2>
          <p>Enter a Jira ticket ID to generate comprehensive manual test cases using AI.</p>

          <div className="input-row">
            <input
              id="ticket-input"
              className="input-field"
              type="text"
              placeholder="Enter Jira Ticket ID (e.g. KAN-4)"
              value={ticketId}
              onChange={e => setTicketId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            <button
              id="generate-btn"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading || !ticketId.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span className="btn-label">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span className="btn-label">Generate</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <p style={{ marginTop: '16px' }}>Analyzing ticket and generating test cases...</p>
          </motion.div>
        )}

        {/* Results */}
        {!loading && testCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-chip">
                <Shield size={14} color="var(--accent-success)" />
                Positive: <span className="stat-value">{positiveCount}</span>
              </div>
              <div className="stat-chip">
                <ShieldAlert size={14} color="var(--accent-danger)" />
                Negative: <span className="stat-value">{negativeCount}</span>
              </div>
              <div className="stat-chip">
                <TriangleAlert size={14} color="var(--accent-edge)" />
                Edge: <span className="stat-value">{edgeCount}</span>
              </div>
            </div>

            {/* Results Header */}
            <div className="results-header">
              <h3>
                <Zap size={18} />
                <span className="count">{testCases.length}</span> Test Cases Generated
              </h3>

              <div className="results-actions">
                <button className="btn btn-ghost" onClick={toggleSelectAll}>
                  <Check size={14} />
                  <span className="btn-label">
                    {selectedCases.size === testCases.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handlePushSubtasks}
                  disabled={subtaskLoading || selectedCases.size === 0}
                >
                  {subtaskLoading ? (
                    <div className="spinner" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span className="btn-label">Push Sub-tasks ({selectedCases.size})</span>
                </button>
                <button
                  className="btn btn-success"
                  onClick={handlePushExcel}
                  disabled={excelLoading || selectedCases.size === 0}
                >
                  {excelLoading ? (
                    <div className="spinner" />
                  ) : (
                    <FileSpreadsheet size={14} />
                  )}
                  <span className="btn-label">Push Excel</span>
                </button>
              </div>
            </div>

            {/* Test Case Cards */}
            <div className="test-cards-grid">
              <AnimatePresence>
                {testCases.map((tc, idx) => (
                  <motion.div
                    key={tc.id}
                    className={`glass-card test-card ${selectedCases.has(tc.id) ? 'selected' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => toggleSelect(tc.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="test-card-header">
                      <div className="test-card-header-left">
                        <div className={`test-card-checkbox ${selectedCases.has(tc.id) ? 'checked' : ''}`}>
                          {selectedCases.has(tc.id) && <Check size={14} color="white" />}
                        </div>
                        <div>
                          <div className="test-card-id">{tc.id}</div>
                          <div className="test-card-title">{tc.title}</div>
                        </div>
                      </div>
                      <div className="test-card-badges">
                        <span className={getTypeBadgeClass(tc.type)}>{tc.type}</span>
                        <span className={getPriorityBadgeClass(tc.priority)}>{tc.priority}</span>
                      </div>
                    </div>

                    <div className="test-card-summary">{tc.summary}</div>

                    <div className="test-card-details">
                      <div className="detail-block">
                        <h4>Preconditions</h4>
                        <p>{tc.preconditions}</p>
                      </div>

                      <div className="detail-block">
                        <h4>Steps</h4>
                        <ol>
                          {tc.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="detail-block full-width">
                        <h4>Expected Results</h4>
                        <ul>
                          {tc.expected_results.map((result, i) => (
                            <li key={i}>{result}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && testCases.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={36} />
            </div>
            <h3>No test cases yet</h3>
            <p>Enter a Jira ticket ID above and click Generate to create AI-powered manual test cases.</p>
          </div>
        )}
      </main>

      {/* ── Toast Notification ──────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast.type === 'success' ? (
              <Check size={16} color="var(--accent-success)" />
            ) : (
              <AlertCircle size={16} color="var(--accent-danger)" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
