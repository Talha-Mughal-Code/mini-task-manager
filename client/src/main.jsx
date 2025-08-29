import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import AdminUsers from './pages/AdminUsers'
import { getCurrentUser, logout, addAuthListener, removeAuthListener } from './auth'

function App() {
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    // Listen for auth state changes
    const handleAuthChange = () => {
      setUser(getCurrentUser())
    }
    
    addAuthListener(handleAuthChange)
    
    // Cleanup listener on unmount
    return () => removeAuthListener(handleAuthChange)
  }, [])

  const handleLogout = async () => {
    await logout()
    // setUser will be updated by the auth listener
  }

  return (
    <>
      <div className="app-header">
        <div className="app-header-inner">
          <div className="nav">
            {user ? (
              <>
                <span>{user.name}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute user={user}><Tasks /></PrivateRoute>} />
        <Route path="/tasks/:id" element={<PrivateRoute user={user}><TaskDetail /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute user={user} roles={['admin']}><AdminUsers /></PrivateRoute>} />
      </Routes>
    </>
  )
}

function PrivateRoute({ children, user, roles }) {
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
