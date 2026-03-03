import Link from 'next/link'

export default function Sidebar({ role }) {
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
  const commonItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  ]

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

  return [...commonItems, ...(roleItems[role] || [])]
}
