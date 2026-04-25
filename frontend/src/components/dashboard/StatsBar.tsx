import { Shield, ShieldAlert, TriangleAlert } from 'lucide-react'

interface StatsBarProps {
  positive: number
  negative: number
  edge: number
}

export function StatsBar({ positive, negative, edge }: StatsBarProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <div className="status-chip mono" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
        <Shield size={14} color="var(--accent-success)" />
        Positive: <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{positive}</span>
      </div>
      <div className="status-chip mono" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
        <ShieldAlert size={14} color="var(--accent-danger)" />
        Negative: <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{negative}</span>
      </div>
      <div className="status-chip mono" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
        <TriangleAlert size={14} color="var(--accent-warning)" />
        Edge: <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{edge}</span>
      </div>
    </div>
  )
}
