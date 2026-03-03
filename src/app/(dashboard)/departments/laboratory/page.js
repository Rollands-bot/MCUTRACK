import { getVisits, updateStepStatusAction } from '@/actions/visit-actions'
import { getVisitWorkflowAction } from '@/actions/visit-actions'

export default async function LaboratoryPage() {
  const inProgressVisits = await getVisits('IN_PROGRESS')
  
  // Filter visits that have lab steps pending
  const labQueue = []
  
  for (const visit of inProgressVisits) {
    const workflow = await getVisitWorkflowAction(visit.id)
    if (workflow) {
      const labSteps = workflow.workflowSteps.filter(
        (step) => step.department === 'LABORATORY' && step.status !== 'DONE'
      )
      if (labSteps.length > 0) {
        labQueue.push({ visit, workflow, labSteps })
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laboratory</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lab Queue ({labQueue.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {labQueue.map(({ visit, workflow, labSteps }) => (
            <div key={visit.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    MRN: {visit.patient.mrn} • {visit.visitNumber}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {workflow.progress.toFixed(0)}% Complete
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {labSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {step.stepName}
                      </p>
                      {step.instructions && (
                        <p className="text-xs text-gray-500">
                          {step.instructions}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.status === 'WAITING' && (
                        <form
                          action={updateStepStatusAction.bind(
                            null,
                            step.visitStepId,
                            'IN_PROGRESS'
                          )}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Start
                          </button>
                        </form>
                      )}
                      {step.status === 'IN_PROGRESS' && (
                        <form
                          action={updateStepStatusAction.bind(
                            null,
                            step.visitStepId,
                            'DONE'
                          )}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Complete
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <a
                  href={`/visits/${visit.id}/results/lab`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Input Results
                </a>
              </div>
            </div>
          ))}
          {labQueue.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No pending lab tests
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
