'use client'

import { useEffect, useState } from 'react'
import { getVisitsApi, updateStepStatusApi } from '@/lib/api-client'

export default function LaboratoryPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisits()
  }, [])

  const loadVisits = async () => {
    try {
      const data = await getVisitsApi('IN_PROGRESS')
      setVisits(data || [])
    } catch (error) {
      console.error('Failed to load visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (visitId) => {
    // TODO: Need step ID to update step status
    alert('Lab results submission - API endpoint needed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laboratory</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lab Queue ({visits.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {visit.patient?.firstName} {visit.patient?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  MRN: {visit.patient?.mrn} • {visit.package?.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`/visits/${visit.id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  View Details
                </a>
                <button
                  onClick={() => handleComplete(visit.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Complete Lab
                </button>
              </div>
            </div>
          ))}
          {visits.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No patients in lab queue
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
