import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

export default function Dataset() {
  const { id } = useParams()
  const [item, setItem] = useState<any>(null)
  const [lin, setLin] = useState<any>(null)

  useEffect(() => {
    fetch(`${API}/api/datasets/${id}`).then(r => r.json()).then(setItem)
    fetch(`${API}/api/lineage/${id}`).then(r => r.json()).then(setLin)
  }, [id])

  if (!item) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <Link to="/">← Back</Link>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p><b>Owner:</b> {item.owner}</p>
      <p><b>Tags:</b> {(item.tags || []).join(', ')}</p>
      <h3>Schema</h3>
      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Column</th><th>Type</th></tr></thead>
        <tbody>
          {(item.columns || []).map((c: any) => (
            <tr key={c.name}><td>{c.name}</td><td>{c.type}</td></tr>
          ))}
        </tbody>
      </table>
      <h3>Lineage</h3>
      <p><b>Upstream:</b> {(lin?.upstream || []).join(', ') || '—'}</p>
      <p><b>Downstream:</b> {(lin?.downstream || []).join(', ') || '—'}</p>
    </div>
  )
}
