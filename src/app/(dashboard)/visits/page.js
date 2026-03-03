import { getVisits } from '@/actions/visit-actions'
import { getPackages } from '@/actions/package-actions'
import { getPatients } from '@/actions/patient-actions'
import { createVisit } from '@/actions/visit-actions'

export default async function VisitsPage() {
  const visits = await getVisits()
  const packages = await getPackages()
  const patients = await getPatients()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
        <NewVisitButton patients={patients} packages={packages} />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <TabButton label="All" count={visits.length} active />
        <TabButton label="Waiting" count={visits.filter(v => v.status === 'WAITING').length} />
        <TabButton label="In Progress" count={visits.filter(v => v.status === 'IN_PROGRESS').length} />
        <TabButton label="Completed" count={visits.filter(v => v.status === 'DONE').length} />
      </div>

      {/* Visit List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Visit #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Package
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
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {visit.visitNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                    <span className="text-gray-500 text-xs ml-2">
                      ({visit.patient.mrn})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.package.name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={visit.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/visits/${visit.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visits.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No visits found
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ label, count, active }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label} ({count})
    </button>
  )
}

function StatusBadge({ status }) {
  const styles = {
    WAITING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  )
}

function NewVisitButton({ patients, packages }) {
  return (
    <details className="relative">
      <summary className="list-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-medium">
        + New Visit
      </summary>
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
        <h3 className="font-semibold text-gray-900 mb-4">Create New Visit</h3>
        <form action={createVisit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              name="patientId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mrn} - {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package *
            </label>
            <select
              name="packageId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
            >
              <option value="">Select package...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Create Visit
          </button>
        </form>
      </div>
    </details>
  )
}
