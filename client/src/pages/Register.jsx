import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../auth'

export default function Register({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const user = await register(name, email, password)
      onLogin(user) // Update parent component state after auto-login
      navigate('/')
    } catch (e) {
      setError('Registration failed')
    }
  }

  return (
    <div className="container" style={{display:'grid', placeItems:'center', minHeight:'calc(100vh - 64px)'}}>
      <div className="card" style={{width:'100%', maxWidth:460}}>
        <h1>Create your account</h1>
        <p>Get started in seconds</p>
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label className="label">Name</label>
            <input placeholder="Jane Doe" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          {error && <p style={{color:'#ef4444'}}>{error}</p>}
          <div className="btn-group">
            <button className="btn btn-primary" type="submit">Create account</button>
            <Link className="btn btn-ghost" to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
