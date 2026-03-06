'use client'

import { useEffect, useState } from 'react'
import { getDashboardStatsApi, getVisitsApi } from '@/lib/api-client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ waiting: 0, inProgress: 0, done: 0, today: 0 })
  const [recentVisits, setRecentVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [statsData, visitsData] = await Promise.all([
        getDashboardStatsApi(),
        getVisitsApi(),
      ])
      setStats(statsData)
      setRecentVisits(visitsData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Excel Pasien
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Waiting"
          value={stats.waiting}
          color="bg-yellow-500"
          icon="⏳"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          color="bg-blue-500"
          icon="🔄"
        />
        <StatCard
          title="Completed"
          value={stats.done}
          color="bg-green-500"
          icon="✅"
        />
        <StatCard
          title="Today"
          value={stats.today}
          color="bg-purple-500"
          icon="📅"
        />
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
        </div>
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
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentVisits.slice(0, 10).map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {visit.visitNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient?.nama_lengkap || `${visit.patient?.firstName || ''} ${visit.patient?.lastName || ''}`}
                    <span className="text-gray-500 text-xs ml-2">
                      ({visit.patient?.nip || visit.patient?.mrn || '-'})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.package?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={visit.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(visit.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportExcelModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => {
            // Don't auto-close, let user see the result first
            // User will close manually after seeing result
          }}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg text-2xl`}>
          {icon}
        </div>
      </div>
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
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  )
}

function ImportExcelModal({ onClose, onImportComplete }) {
  const [step, setStep] = useState('upload') // upload, preview, result
  const [uploading, setUploading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState('')

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
      setError('Please upload a valid Excel file (.xlsx)')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/patients/preview`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPreviewData(data.result)
      setStep('preview')
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleImport() {
    if (!previewData) {
      alert('No preview data!')
      return
    }

    setUploading(true)
    setError('')

    const rowsToImport = previewData.rows.filter(r => !r.error)
    console.log('Starting import with rows:', rowsToImport.length)
    alert('Starting import with ' + rowsToImport.length + ' rows...')

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/patients/import`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: rowsToImport,
        }),
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (response.status === 401) {
        alert('Session expired. Please login again.')
        window.location.href = '/login'
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr)
        alert('Invalid response from server: ' + responseText.substring(0, 100))
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      console.log('Import result:', data.result)
      alert('Import successful! Success: ' + data.result.success + ', Failed: ' + data.result.failed)
      
      setImportResult(data.result)
      setStep('result')
    } catch (err) {
      console.error('Import error:', err)
      alert('Import error: ' + err.message)
      setError(err.message || 'Failed to import')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {step === 'upload' && 'Import Data Pasien dari Excel'}
            {step === 'preview' && 'Preview Data'}
            {step === 'result' && 'Hasil Import'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600' : step === 'preview' || step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-600 text-white' : step === 'preview' || step === 'result' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {step === 'preview' || step === 'result' ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium">Upload</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-0.5 ${step === 'preview' || step === 'result' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600' : step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-blue-600 text-white' : step === 'result' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {step === 'result' ? '✓' : '2'}
            </div>
            <span className="text-sm font-medium">Preview</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-0.5 ${step === 'result' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'result' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Selesai</span>
          </div>
        </div>

        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Format File Excel:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                <div>1. NIP</div>
                <div>2. Nama Lengkap</div>
                <div>3. Jenis Kelamin (L/P/Laki-laki/Perempuan/Male/Female)</div>
                <div>4. Tanggal Lahir (YYYY-MM-DD)</div>
                <div>5. Plant</div>
                <div>6. Dept/Bagian</div>
                <div>7. Grup</div>
                <div>8. Paket MCU</div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Drag and drop file Excel di sini, atau klik untuk memilih file'}
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="mt-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                Batal
              </button>
            </div>
          </>
        )}

        {/* PREVIEW STEP */}
        {step === 'preview' && previewData && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Total Baris</p>
                <p className="text-2xl font-bold text-gray-900">{previewData.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600">Data Valid</p>
                <p className="text-2xl font-bold text-green-700">{previewData.valid}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-red-600">Data Invalid</p>
                <p className="text-2xl font-bold text-red-700">{previewData.invalid}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">#</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">NIP</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Nama</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">JK</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Tgl Lahir</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Plant</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Dept</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Grup</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Paket</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.rows.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className={row.error ? 'bg-red-50' : ''}>
                      <td className="px-2 py-2">{row.rowNum}</td>
                      <td className="px-2 py-2">{row.nip || '-'}</td>
                      <td className="px-2 py-2">{row.nama_lengkap || '-'}</td>
                      <td className="px-2 py-2">{row.jenis_kelamin || '-'}</td>
                      <td className="px-2 py-2">{row.tanggal_lahir || '-'}</td>
                      <td className="px-2 py-2">{row.plant || '-'}</td>
                      <td className="px-2 py-2">{row.dept_bagian || '-'}</td>
                      <td className="px-2 py-2">{row.grup || '-'}</td>
                      <td className="px-2 py-2">{row.paket_mcu || '-'}</td>
                      <td className="px-2 py-2">
                        {row.error ? (
                          <span className="text-red-600 text-xs" title={row.error}>❌ Error</span>
                        ) : (
                          <span className="text-green-600 text-xs">✓ OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.rows.length > 100 && (
              <p className="text-sm text-gray-500 text-center mb-4">
                Menampilkan 100 dari {previewData.rows.length} baris
              </p>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                ← Upload Ulang
              </button>
              <button
                onClick={handleImport}
                disabled={uploading || previewData.valid === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {uploading ? 'Mengimport...' : `Import ${previewData.valid} Data Valid`}
              </button>
            </div>
          </>
        )}

        {/* RESULT STEP */}
        {step === 'result' && importResult && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600">Berhasil</p>
                <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-red-600">Gagal</p>
                <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
              </div>
            </div>

            {importResult.failedRows && importResult.failedRows.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                <h4 className="font-medium text-red-900 mb-2">Baris yang gagal:</h4>
                <div className="space-y-1">
                  {importResult.failedRows.map((row, idx) => (
                    <p key={idx} className="text-sm text-red-800">{row}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Selesai
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
