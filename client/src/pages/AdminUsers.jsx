import { useEffect, useState } from 'react'
import api from '../api'

export default function AdminUsers(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ (async()=>{
    const res = await api.get('/users')
    setUsers(res.data.data.users)
    setLoading(false)
  })() }, [])

  async function updateRole(id, role){
    await api.patch(`/users/${id}/role`, { role })
    setUsers(u => u.map(x => x._id===id? { ...x, role } : x))
  }

  if (loading) return <div className="container">Loading...</div>

  return (
    <div className="container">
      <h1>Users</h1>
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e)=>updateRole(u._id, e.target.value)}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
