import { useState } from 'react'
import { Link } from 'react-router-dom'
const API = import.meta.env.VITE_API_URL || ''

export default function Copilot() {
  const [question, setQuestion] = useState('Who owns sales_orders?')
  const [answer, setAnswer] = useState<string>('')
  const [hits, setHits] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    setLoading(true)
    setAnswer('')
    setHits([])
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const d = await r.json()
      setAnswer(d.answer || '')
      setHits(d.hits || [])
    } catch {
      setAnswer('Error contacting server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <Link to="/">← Back</Link>
      <h1>Catalog Copilot</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input
          style={{ flex: 1 }}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask about lineage, ownership, impact..."
          aria-label="Ask question"
        />
        <button onClick={ask} disabled={loading}>{loading ? 'Asking...' : 'Ask'}</button>
      </div>
      {answer && <p><b>Answer:</b> {answer}</p>}
      {hits.length > 0 && (
        <div>
          <h3>Sources</h3>
          <ul>
            {hits.map((h, i) => <li key={i}><code>{h.id}</code> — {h.snippet}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
