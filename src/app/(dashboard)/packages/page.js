'use client'

import { useEffect, useState } from 'react'
import { getPackagesApi, createPackageApi, togglePackageStatusApi } from '@/lib/api-client'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadPackages()
  }, [])

  async function loadPackages() {
    const data = await getPackagesApi()
    setPackages(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    let steps = []
    try {
      steps = JSON.parse(data.steps || '[]')
    } catch (err) {
      alert('Invalid JSON format for steps')
      return
    }

    const result = await createPackageApi({
      name: data.name,
      code: data.code,
      description: data.description,
      isActive: data.isActive === 'on',
      steps: steps,
    })

    if (result?.success) {
      setShowForm(false)
      loadPackages()
    }
  }

  async function handleToggle(id) {
    await togglePackageStatusApi(id)
    loadPackages()
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">MCU Packages</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + New Package
        </button>
      </div>

      {/* Package List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onToggle={handleToggle} />
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No packages found</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Create MCU Package</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Create Package
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg, onToggle }) {
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
          Steps ({pkg.steps?.length || 0})
        </p>
        <div className="space-y-1">
          {pkg.steps?.map((step, idx) => (
            <div
              key={step.id || idx}
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
        <button
          onClick={() => onToggle(pkg.id)}
          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
        >
          Deactivate
        </button>
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
