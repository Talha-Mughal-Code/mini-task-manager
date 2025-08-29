import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="container" style={{display:'grid', placeItems:'center', minHeight:'calc(100vh - 64px)'}}>
      <div className="card" style={{width:'100%', maxWidth:460}}>
        <h1>Welcome back</h1>
        <p>Sign in to continue</p>
        <form className="form" onSubmit={onSubmit}>
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
            <button className="btn btn-primary" type="submit">Login</button>
            <Link className="btn btn-ghost" to="/register">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
