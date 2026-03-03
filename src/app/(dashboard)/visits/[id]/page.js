import { getVisitById } from '@/actions/visit-actions'
import { getVisitWorkflowAction } from '@/actions/visit-actions'
import { updateVisitStatusAction } from '@/actions/visit-actions'

export default async function VisitPage({ params }) {
  const { id } = params
  const visit = await getVisitById(id)
  const workflow = await getVisitWorkflowAction(id)

  if (!visit) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Visit Not Found</h1>
        <a href="/visits" className="text-blue-600 hover:underline">
          Back to Visits
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{visit.visitNumber}</h1>
          <p className="text-gray-600">
            {visit.patient.firstName} {visit.patient.lastName} • {visit.patient.mrn}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={visit.status} />
          {visit.status === 'IN_PROGRESS' && (
            <form action={updateVisitStatusAction.bind(null, visit.id, 'CANCELLED')}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel Visit
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="MRN" value={visit.patient.mrn} />
              <InfoRow label="Name" value={`${visit.patient.firstName} ${visit.patient.lastName}`} />
              <InfoRow label="Gender" value={visit.patient.gender} />
              <InfoRow 
                label="Date of Birth" 
                value={new Date(visit.patient.dateOfBirth).toLocaleDateString()} 
              />
              <InfoRow label="Company" value={visit.patient.company || '-'} />
              <InfoRow label="Phone" value={visit.patient.phone || '-'} />
            </div>
          </div>

          {/* Package Steps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Package: {visit.package.name}
            </h2>
            <div className="space-y-3">
              {workflow?.workflowSteps.map((step, idx) => (
                <StepItem key={step.id} step={step} index={idx + 1} />
              ))}
            </div>
          </div>

          {/* Medical Results */}
          {visit.results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Results</h2>
              <div className="space-y-4">
                {visit.results.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{result.department}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <pre className="text-sm text-gray-700 bg-gray-50 p-3 rounded overflow-auto max-h-48">
                      {JSON.stringify(result.resultData, null, 2)}
                    </pre>
                    {result.isReviewed && (
                      <span className="text-xs text-green-600 mt-2 block">
                        ✓ Reviewed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visit Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h2>
            <div className="space-y-3">
              <InfoRow label="Status" value={<StatusBadge status={visit.status} />} />
              <InfoRow 
                label="Created" 
                value={new Date(visit.createdAt).toLocaleString()} 
              />
              {visit.completedAt && (
                <InfoRow 
                  label="Completed" 
                  value={new Date(visit.completedAt).toLocaleString()} 
                />
              )}
              {visit.assignedDoctor && (
                <InfoRow 
                  label="Doctor" 
                  value={visit.assignedDoctor.name} 
                />
              )}
              {visit.finalDecision && (
                <InfoRow 
                  label="Decision" 
                  value={
                    <span className={`font-medium ${
                      visit.finalDecision === 'FIT' ? 'text-green-600' :
                      visit.finalDecision === 'UNFIT' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {visit.finalDecision.replace('_', ' ')}
                    </span>
                  } 
                />
              )}
            </div>
          </div>

          {/* Progress */}
          {workflow && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{workflow.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${workflow.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepItem({ step, index }) {
  const statusColors = {
    WAITING: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-600',
    DONE: 'bg-green-100 text-green-600',
    SKIPPED: 'bg-gray-100 text-gray-400',
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        statusColors[step.status]
      }`}>
        {step.status === 'DONE' ? '✓' : index}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{step.stepName}</div>
        <div className="text-xs text-gray-500">{step.department}</div>
        {step.instructions && (
          <div className="text-xs text-gray-400 mt-1">{step.instructions}</div>
        )}
      </div>
      <div className="text-right">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          statusColors[step.status]
        }`}>
          {step.status.replace('_', ' ')}
        </span>
        {step.completedAt && (
          <div className="text-xs text-gray-400 mt-1">
            {new Date(step.completedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
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
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
