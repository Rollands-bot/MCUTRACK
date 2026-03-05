'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function Sidebar() {
  const [role, setRole] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include',
        })
        if (response.ok) {
          const user = await response.json()
          setRole(user.role)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  if (!role) {
    return (
      <aside className="w-64 bg-gray-900 text-white min-h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold">MCUTrack</h1>
          <p className="text-gray-400 text-sm mt-1">Loading...</p>
        </div>
      </aside>
    )
  }

  const navItems = getNavItemsForRole(role)

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">MCUTrack</h1>
        <p className="text-gray-400 text-sm mt-1">{role}</p>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-lg mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function getNavItemsForRole(role) {
  // Dashboard redirect based on role
  const dashboardItems = {
    ADMIN: { href: '/admin', icon: '📊', label: 'Dashboard' },
    DOCTOR: { href: '/departments/doctor', icon: '📊', label: 'Dashboard' },
    NURSE: { href: '/departments/nursing', icon: '📊', label: 'Dashboard' },
    LAB: { href: '/departments/laboratory', icon: '📊', label: 'Dashboard' },
    RADIOLOGY: { href: '/departments/radiology', icon: '📊', label: 'Dashboard' },
  }

  const roleItems = {
    ADMIN: [
      { href: '/admin/users', icon: '👥', label: 'Users' },
      { href: '/patients', icon: '🏥', label: 'Patients' },
      { href: '/visits', icon: '📋', label: 'Visits' },
      { href: '/packages', icon: '📦', label: 'Packages' },
      { href: '/admin/audit', icon: '📜', label: 'Audit Log' },
    ],
    NURSE: [
      { href: '/departments/nursing', icon: '🩺', label: 'Nursing' },
      { href: '/patients', icon: '🏥', label: 'Patients' },
      { href: '/visits', icon: '📋', label: 'Visits' },
    ],
    LAB: [
      { href: '/departments/laboratory', icon: '🔬', label: 'Laboratory' },
      { href: '/visits', icon: '📋', label: 'Visits' },
    ],
    RADIOLOGY: [
      { href: '/departments/radiology', icon: '📷', label: 'Radiology' },
      { href: '/visits', icon: '📋', label: 'Visits' },
    ],
    DOCTOR: [
      { href: '/departments/doctor', icon: '👨‍⚕️', label: 'Doctor' },
      { href: '/patients', icon: '🏥', label: 'Patients' },
      { href: '/visits', icon: '📋', label: 'Visits' },
      { href: '/reports', icon: '📄', label: 'Reports' },
    ],
  }

  return [dashboardItems[role] || dashboardItems.ADMIN, ...(roleItems[role] || [])]
}
