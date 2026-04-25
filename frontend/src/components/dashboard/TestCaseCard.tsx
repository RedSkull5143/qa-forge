import { motion } from 'framer-motion'
import { Check, Shield, ShieldAlert, TriangleAlert } from 'lucide-react'

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

interface TestCaseCardProps {
  testCase: TestCase
  isSelected: boolean
  onToggle: (id: string) => void
  index: number
}

export function TestCaseCard({ testCase, isSelected, onToggle, index }: TestCaseCardProps) {
  const getTypeBadge = (type: string) => {
    const t = type.toLowerCase()
    if (t === 'positive') return { class: 'status-positive', icon: <Shield size={12} /> }
    if (t === 'negative') return { class: 'status-negative', icon: <ShieldAlert size={12} /> }
    return { class: 'status-warning', icon: <TriangleAlert size={12} /> }
  }

  const badge = getTypeBadge(testCase.type)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`glass-card test-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(testCase.id)}
      style={{
        borderLeft: isSelected ? '4px solid var(--accent-primary)' : '1px solid var(--border-glass)',
        background: isSelected ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            border: '2px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isSelected ? 'var(--accent-primary)' : 'transparent',
            borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-glass)',
            marginTop: '4px'
          }}>
            {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
          </div>
          <div>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{testCase.id}</span>
            <h3 style={{ fontSize: '1.1rem', marginTop: '4px', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
              {testCase.title}
            </h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`status-chip ${badge.class}`}>
            {badge.icon}
            {testCase.type}
          </span>
          <span className="status-chip mono" style={{ opacity: 0.8 }}>
            {testCase.priority}
          </span>
        </div>
      </div>

      <p className="test-summary">
        {testCase.summary}
      </p>

      <div className="test-details-grid">
        <div>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Preconditions</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{testCase.preconditions}</p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Execution Steps</h4>
          <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '16px' }}>
            {testCase.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Expected Results</h4>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '16px' }}>
            {testCase.expected_results.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
