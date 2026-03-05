'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logoutApi } from '@/lib/api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user from session storage or fetch from API
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logoutApi()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, {user?.name || 'User'}
          </h2>
          <p className="text-sm text-gray-500">{user?.role || ''}</p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">@{user?.username || ''}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
