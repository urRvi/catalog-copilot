import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

type Dataset = {
  id: string
  name: string
  owner: string
  tags: string[]
  description: string
}

export default function App() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Dataset[]>([])

  useEffect(() => {
    fetch(`${API}/api/datasets?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
  }, [q])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Catalog Copilot — Metadata Explorer</h1>
      <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search datasets..."
          aria-label="Search datasets"
        />
        <Link to="/copilot">Open Copilot →</Link>
      </div>
      <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Name</th><th>Owner</th><th>Tags</th></tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td><Link to={`/dataset/${it.id}`}>{it.name}</Link></td>
              <td>{it.owner}</td>
              <td>{it.tags?.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
