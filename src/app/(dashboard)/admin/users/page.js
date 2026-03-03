import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export default async function UsersPage() {
  const session = await getSession()
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <NewUserButton />
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
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
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
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
                    <div className="flex space-x-2">
                      <ToggleUserButton userId={user.id} isActive={user.isActive} />
                    </div>
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

function ToggleUserButton({ userId, isActive }) {
  return (
    <form action={toggleUserStatus.bind(null, userId)}>
      <button
        type="submit"
        className={`px-3 py-1 rounded text-xs ${
          isActive
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </form>
  )
}

async function toggleUserStatus(userId) {
  'use server'
  
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const newStatus = !user.isActive

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: newStatus },
  })

  await logAudit({
    userId: session.userId,
    action: 'UPDATE',
    entityType: 'USER',
    entityId: userId,
    oldValue: { isActive: user.isActive },
    newValue: { isActive: newStatus },
  })

  revalidatePath('/admin/users')
}

function NewUserButton() {
  return (
    <details className="relative">
      <summary className="list-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium">
        + New User
      </summary>
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
        <h3 className="font-semibold text-gray-900 mb-4">Create User</h3>
        <form action={createUser} className="space-y-3">
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
              Email *
            </label>
            <input
              type="email"
              name="email"
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
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Create User
          </button>
        </form>
      </div>
    </details>
  )
}

async function createUser(formData) {
  'use server'
  
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    role: formData.get('role'),
    isActive: true,
  }

  try {
    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
    })

    await logAudit({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      newValue: { email: user.email, role: user.role },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Create user error:', error)
    return { error: 'Failed to create user' }
  }
}
