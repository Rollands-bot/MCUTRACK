import { getVisits, updateVisitStatusAction } from '@/actions/visit-actions'
import { getVisitWorkflowAction } from '@/actions/visit-actions'

export default async function DoctorPage() {
  const inProgressVisits = await getVisits('IN_PROGRESS')
  
  // Filter visits ready for doctor (all steps completed)
  const readyForDoctor = []
  
  for (const visit of inProgressVisits) {
    const workflow = await getVisitWorkflowAction(visit.id)
    if (workflow) {
      const allStepsDone = workflow.workflowSteps.every(
        (step) => step.status === 'DONE'
      )
      if (allStepsDone) {
        readyForDoctor.push({ visit, workflow })
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready for Final Assessment */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ready for Assessment ({readyForDoctor.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {readyForDoctor.map(({ visit, workflow }) => (
              <div key={visit.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {visit.patient.firstName} {visit.patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      MRN: {visit.patient.mrn} • {visit.patient.company || 'N/A'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Ready
                  </span>
                </div>

                {/* All completed steps */}
                <div className="space-y-1 mb-4">
                  {workflow.workflowSteps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      {step.stepName} ({step.department})
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/visits/${visit.id}/results/doctor`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Assess Patient
                  </a>
                </div>
              </div>
            ))}
            {readyForDoctor.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No patients ready for assessment
              </div>
            )}
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Completed Today
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500">
            <p>Today's completed assessments will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
