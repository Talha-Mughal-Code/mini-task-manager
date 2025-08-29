import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

export default function TaskDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [form, setForm] = useState({})

  useEffect(()=>{ (async()=>{
    const res = await api.get(`/tasks/${id}`)
    setTask(res.data.data.task)
    setForm(res.data.data.task)
  })() }, [id])

  async function onSave(){
    await api.patch(`/tasks/${id}`, form)
    navigate('/')
  }
  async function onDelete(){
    await api.delete(`/tasks/${id}`)
    navigate('/')
  }

  if (!task) return <div>Loading...</div>

  return (
    <div className="container">
      <div className="card">
        <h1>Edit Task</h1>
        <div className="form">
          <div className="field">
            <label className="label">Title</label>
            <input value={form.title||''} onChange={(e)=>setForm({...form, title:e.target.value})} />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea value={form.description||''} onChange={(e)=>setForm({...form, description:e.target.value})} />
          </div>
          <div className="row">
            <div className="field" style={{flex:1}}>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})}>
                {['todo','in-progress','done'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" style={{flex:1}}>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={(e)=>setForm({...form, priority:e.target.value})}>
                {['low','medium','high'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="btn-group" style={{marginTop:4}}>
            <button className="btn btn-primary" onClick={onSave}>Save</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
