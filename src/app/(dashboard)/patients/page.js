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
      nip: data.nip,
      nama_lengkap: data.nama_lengkap,
      tanggal_lahir: data.tanggal_lahir,
      jenis_kelamin: data.jenis_kelamin,
      plant: data.plant || undefined,
      dept_bagian: data.dept_bagian || undefined,
      grup: data.grup || undefined,
      paket_mcu: data.paket_mcu || undefined,
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
        <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Pasien Baru
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan NIP, nama, plant, atau departemen..."
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
                  NIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jenis Kelamin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Lahir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dept/Bagian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Paket MCU
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient, index) => (
                <tr key={`${patient.id || patient.nip || index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {patient.nip}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.nama_lengkap}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(patient.tanggal_lahir).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.plant || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.dept_bagian || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.grup || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.paket_mcu || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            Tidak ada data pasien
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Registrasi Pasien</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  NIP *
                </label>
                <input
                  type="text"
                  name="nip"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Masukkan NIP"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    name="jenis_kelamin"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  >
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Plant
                </label>
                <input
                  type="text"
                  name="plant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Contoh: Jakarta, Surabaya"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dept/Bagian
                </label>
                <input
                  type="text"
                  name="dept_bagian"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Contoh: Produksi, QA, HRD"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Grup
                </label>
                <input
                  type="text"
                  name="grup"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Contoh: Shift A, Shift B"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Paket MCU
                </label>
                <input
                  type="text"
                  name="paket_mcu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  placeholder="Contoh: Basic, Executive"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Simpan Pasien
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
