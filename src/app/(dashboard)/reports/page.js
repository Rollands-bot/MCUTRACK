import { getVisits } from '@/actions/visit-actions'

export default async function ReportsPage() {
  const completedVisits = await getVisits('DONE')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">MCU Reports</h1>

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
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {visit.visitNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient.company || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.package.name}
                  </td>
                  <td className="px-6 py-4">
                    {visit.finalDecision ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        visit.finalDecision === 'FIT' ? 'bg-green-100 text-green-800' :
                        visit.finalDecision === 'UNFIT' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.finalDecision.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {visit.completedAt 
                      ? new Date(visit.completedAt).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => alert('PDF generation coming soon')}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {completedVisits.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No completed visits yet
          </div>
        )}
      </div>
    </div>
  )
}
