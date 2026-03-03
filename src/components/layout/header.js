import { getSession, logout } from '@/lib/session'
import { logoutAction } from '@/actions/auth-actions'

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, {session?.name || 'User'}
          </h2>
          <p className="text-sm text-gray-500">{session?.role || ''}</p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{session?.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
