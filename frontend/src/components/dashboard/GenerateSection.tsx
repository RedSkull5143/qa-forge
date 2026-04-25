import { Sparkles } from 'lucide-react'

interface GenerateSectionProps {
  ticketId: string
  setTicketId: (id: string) => void
  loading: boolean
  onGenerate: () => void
}

export function GenerateSection({ ticketId, setTicketId, loading, onGenerate }: GenerateSectionProps) {
  return (
    <section className="glass-card generate-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Forge Test Cases</h2>
        <div className="pulse-indicator" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
        Input a Jira ticket ID to begin the automated forging process.
      </p>

      <div className="generate-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          id="ticket-input"
          className="forge-input"
          placeholder="Ticket ID (e.g. KAN-123)"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
        />
        <button
          id="generate-btn"
          className="forge-btn forge-btn-primary"
          onClick={onGenerate}
          disabled={loading || !ticketId.trim()}
          style={{ minWidth: '160px' }}
        >
          {loading ? (
            <>
              <div className="forge-spinner" />
              <span>Forging...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </section>
  )
}
