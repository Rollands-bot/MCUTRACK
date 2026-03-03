import { getVisits, updateVisitStatusAction } from '@/actions/visit-actions'
import { createVisit } from '@/actions/visit-actions'
import { getPatients } from '@/actions/patient-actions'
import { getPackages } from '@/actions/package-actions'

export default async function NursingPage() {
  const waitingVisits = await getVisits('WAITING')
  const patients = await getPatients()
  const packages = await getPackages()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nursing Station</h1>
        <NewVisitForm patients={patients} packages={packages} />
      </div>

      {/* Waiting Patients Queue */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Waiting Queue ({waitingVisits.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {waitingVisits.map((visit) => (
            <div
              key={visit.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {visit.patient.firstName} {visit.patient.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  MRN: {visit.patient.mrn} • {visit.package.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {visit.visitNumber} •{' '}
                  {new Date(visit.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <form action={updateVisitStatusAction.bind(null, visit.id, 'IN_PROGRESS')}>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Call Patient
                  </button>
                </form>
              </div>
            </div>
          ))}
          {waitingVisits.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No patients waiting
            </div>
          )}
        </div>
      </div>

      {/* Vitals Input Section would go here */}
    </div>
  )
}

function NewVisitForm({ patients, packages }) {
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
              Patient
            </label>
            <select
              name="patientId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
              Package
            </label>
            <select
              name="packageId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Create Visit
            </button>
          </div>
        </form>
      </div>
    </details>
  )
}
