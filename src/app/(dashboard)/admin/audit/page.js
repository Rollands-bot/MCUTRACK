'use client'

import { useEffect, useState } from 'react'
import { getAuditLogsApi } from '@/lib/api-client'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      const data = await getAuditLogsApi({ limit: 100 })
      setLogs(data || [])
      setLoading(false)
    }
    loadLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.user ? (
                      <div>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-xs text-gray-500">
                          @{log.user.username} ({log.user.role})
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{log.entityType}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {log.entityId?.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <AuditDetails log={log} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No audit logs found
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBadge({ action }) {
  const colors = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    STATUS_CHANGE: 'bg-yellow-100 text-yellow-800',
    RESULT_SUBMIT: 'bg-purple-100 text-purple-800',
    RESULT_REVIEW: 'bg-indigo-100 text-indigo-800',
    LOGIN: 'bg-gray-100 text-gray-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    PERMISSION_DENIED: 'bg-orange-100 text-orange-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[action] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {action}
    </span>
  )
}

function AuditDetails({ log }) {
  const details = []

  if (log.oldValue && log.newValue) {
    const oldVal = JSON.parse(log.oldValue)
    const newVal = JSON.parse(log.newValue)

    if (log.action === 'STATUS_CHANGE') {
      return (
        <span>
          <span className="font-medium">{oldVal.status}</span> →{' '}
          <span className="font-medium">{newVal.status}</span>
        </span>
      )
    }

    if (log.action === 'LOGIN') {
      return (
        <span>
          {newVal.success ? 'Success' : 'Failed'}
          {!newVal.success && newVal.reason && ` (${newVal.reason})`}
        </span>
      )
    }
  }

  if (log.newValue) {
    const val = JSON.parse(log.newValue)
    if (val.visitNumber) {
      return <span>Visit: {val.visitNumber}</span>
    }
    if (val.mrn) {
      return <span>MRN: {val.mrn}</span>
    }
    if (val.email) {
      return <span>Email: {val.email}</span>
    }
  }

  return <span className="text-gray-400">-</span>
}
