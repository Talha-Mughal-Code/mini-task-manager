import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const statuses = ['todo','in-progress','done']
const priorities = ['low','medium','high']

export default function Tasks(){
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [stats, setStats] = useState(null)

  const params = useMemo(()=>({ q, status, priority, sort, page, limit }),[q,status,priority,sort,page,limit])

  async function fetchTasks(){
    const res = await api.get('/tasks', { params })
    setItems(res.data.data.items)
    setTotal(res.data.data.total)
  }

  async function fetchStats(){
    const res = await api.get('/stats/overview')
    setStats(res.data.data)
  }

  useEffect(()=>{ fetchTasks(); fetchStats() }, [params])

  // Reset to first page whenever filters or sort/limit change
  useEffect(()=>{ setPage(1) }, [q, status, priority, sort, limit])

  // Clamp page when total count changes (e.g., filters reduce total pages)
  useEffect(()=>{
    const totalPagesLocal = Math.max(1, Math.ceil(total / limit))
    if (page > totalPagesLocal) setPage(totalPagesLocal)
  }, [total, limit])

  async function createTask(e){
    e.preventDefault()
    if (!title) return
    setCreating(true)
    try{
      await api.post('/tasks', { title })
      setTitle('')
      await fetchTasks()
      await fetchStats()
    } finally { setCreating(false) }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h1>Tasks</h1>
        <form className="row" onSubmit={createTask}>
          <input placeholder="New task title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <button className="btn btn-primary" disabled={creating} type="submit">Create</button>
        </form>
      </div>

      <div className="card section">
        <div className="row row-grow">
          <input placeholder="Search tasks" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priority} onChange={(e)=>setPriority(e.target.value)}>
            <option value="">All Priority</option>
            {priorities.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-priority">Priority desc</option>
            <option value="priority">Priority asc</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="stats section">
          <div className="stat">
            <div className="label">Overdue</div>
            <div style={{fontSize:24, fontWeight:800}}>{stats.overdue}</div>
          </div>
          <div className="stat">
            <div className="label">By Status</div>
            <div>{stats.byStatus.map(s=>`${s._id}: ${s.count}`).join(', ')}</div>
          </div>
          <div className="stat">
            <div className="label">By Priority</div>
            <div>{stats.byPriority.map(s=>`${s._id}: ${s.count}`).join(', ')}</div>
          </div>
        </div>
      )}

      <div className="card section">
        <ul className="stack" style={{margin:0, padding:0, listStyle:'none'}}>
          {items.map(t => (
            <li key={t._id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0', padding:'8px 0'}}>
              <div className="stack" style={{gap:4}}>
                <Link to={`/tasks/${t._id}`} style={{fontWeight:600}}>{t.title}</Link>
                <div style={{fontSize:12, color:'#475569'}}>{t.status} • {t.priority}</div>
              </div>
              <Link className="btn btn-secondary" to={`/tasks/${t._id}`}>Open</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="row section" style={{justifyContent:'center'}}>
        <button className="btn btn-ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>Page {page} / {totalPages||1}</span>
        <button className="btn btn-ghost" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  )
}
