'use client'

import { useEffect, useState } from 'react'
import { fetchAPI } from '@/lib/api-client'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewUserForm, setShowNewUserForm] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await fetchAPI('/admin/users')
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUser = async (userId, isActive) => {
    try {
      await fetchAPI(`/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !isActive }),
      })
      await loadUsers()
    } catch (error) {
      console.error('Failed to toggle user:', error)
    }
  }

  const handleCreateUser = async (formData) => {
    try {
      await fetchAPI('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setShowNewUserForm(false)
      await loadUsers()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowNewUserForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + New User
        </button>
      </div>

      {/* New User Modal */}
      {showNewUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Create User</h3>
            <NewUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowNewUserForm(false)}
            />
          </div>
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    @{user.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleUser(user.id, user.isActive)}
                      className={`px-3 py-1 rounded text-xs ${
                        user.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const colors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    DOCTOR: 'bg-blue-100 text-blue-800',
    NURSE: 'bg-pink-100 text-pink-800',
    LAB: 'bg-yellow-100 text-yellow-800',
    RADIOLOGY: 'bg-green-100 text-green-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[role] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {role}
    </span>
  )
}

function NewUserForm({ onSubmit, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      username: formData.get('username'),
      name: formData.get('name'),
      password: formData.get('password'),
      role: formData.get('role'),
      isActive: true,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username *
        </label>
        <input
          type="text"
          name="username"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <select
          name="role"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
        >
          <option value="">Select role...</option>
          <option value="ADMIN">Admin</option>
          <option value="NURSE">Nurse</option>
          <option value="LAB">Lab Technician</option>
          <option value="RADIOLOGY">Radiology Technician</option>
          <option value="DOCTOR">Doctor</option>
        </select>
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Create User
        </button>
      </div>
    </form>
  )
}
