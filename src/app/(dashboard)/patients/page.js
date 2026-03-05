'use client'

import { useEffect, useState } from 'react'
import { getPatientsApi, createPatientApi } from '@/lib/api-client'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    const data = await getPatientsApi(searchTerm)
    setPatients(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    const result = await createPatientApi({
      mrn: data.mrn || undefined,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(), // Convert to ISO format
      gender: data.gender.toUpperCase(),
      phone: data.phone || undefined,
      email: data.email || undefined,
      company: data.company || undefined,
      idNumber: data.idNumber || undefined,
    })

    if (result?.success) {
      setShowForm(false)
      loadPatients()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + New Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by MRN, name, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  MRN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  DOB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient, index) => (
                <tr key={`${patient.id || patient.mrn || index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {patient.mrn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.company || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.phone || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No patients found
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Register Patient</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    MRN (Optional)
                  </label>
                  <input
                    type="text"
                    name="mrn"
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Register Patient
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
