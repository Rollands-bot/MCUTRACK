import { getPackages, togglePackageStatus } from '@/actions/package-actions'
import { createPackage } from '@/actions/package-actions'

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">MCU Packages</h1>
        <NewPackageButton />
      </div>

      {/* Package List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No packages found</p>
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
          <p className="text-sm text-gray-500">{pkg.code}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
          Active
        </span>
      </div>

      {pkg.description && (
        <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Steps ({pkg.steps.length})
        </p>
        <div className="space-y-1">
          {pkg.steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center text-sm text-gray-600"
            >
              <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-2">
                {idx + 1}
              </span>
              {step.stepName}
              <span className="text-xs text-gray-400 ml-2">
                ({step.department})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <form action={togglePackageStatus.bind(null, pkg.id)}>
          <button
            type="submit"
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            Deactivate
          </button>
        </form>
        <a
          href={`/packages/${pkg.id}/edit`}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
        >
          Edit
        </a>
      </div>
    </div>
  )
}

function NewPackageButton() {
  const departments = [
    'NURSING',
    'LABORATORY',
    'RADIOLOGY',
    'CARDIOLOGY',
    'PULMONOLOGY',
    'GENERAL_DOCTOR',
  ]

  return (
    <details className="relative">
      <summary className="list-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium">
        + New Package
      </summary>
      <div className="absolute right-0 mt-2 w-[600px] bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 max-h-[80vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Create MCU Package</h3>
        <form action={createPackage} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                placeholder="e.g., Executive Checkup"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Code *
              </label>
              <input
                type="text"
                name="code"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                placeholder="e.g., EXECUTIVE"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
              placeholder="Package description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible for selection)
            </label>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Package Steps (JSON)
            </p>
            <textarea
              name="steps"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono"
              placeholder={`[
  {
    "department": "NURSING",
    "stepName": "Vital Signs",
    "stepOrder": 1,
    "isRequired": true,
    "instructions": "Measure BP, HR, Weight"
  },
  {
    "department": "LABORATORY",
    "stepName": "Blood Test",
    "stepOrder": 2,
    "isRequired": true
  }
]`}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Create Package
          </button>
        </form>
      </div>
    </details>
  )
}
