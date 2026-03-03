import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  // Get summary statistics
  const [userCount, packageCount, patientCount, visitCount] = await Promise.all([
    prisma.user.count(),
    prisma.mCUPackage.count(),
    prisma.patient.count(),
    prisma.visit.count(),
  ])

  const stats = [
    { label: 'Total Users', value: userCount, color: 'bg-blue-500' },
    { label: 'MCU Packages', value: packageCount, color: 'bg-green-500' },
    { label: 'Patients', value: patientCount, color: 'bg-yellow-500' },
    { label: 'Total Visits', value: visitCount, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your MCU Track system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-semibold text-blue-900">Manage Users</h3>
            <p className="text-sm text-blue-700 mt-1">Add, edit, or remove users</p>
          </a>
          <a
            href="/admin/audit"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <h3 className="font-semibold text-green-900">Audit Logs</h3>
            <p className="text-sm text-green-700 mt-1">View system activity</p>
          </a>
          <a
            href="/packages"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-semibold text-purple-900">MCU Packages</h3>
            <p className="text-sm text-purple-700 mt-1">Manage checkup packages</p>
          </a>
        </div>
      </div>
    </div>
  )
}
