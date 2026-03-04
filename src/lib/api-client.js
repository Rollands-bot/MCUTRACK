/**
 * API Client for MCUTrack Go Backend
 * Replace Server Actions with REST API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

/**
 * Generic fetch wrapper with auth handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  // Handle session expired
  if (response.status === 401) {
    window.location.href = '/login'
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

// ============================================
// AUTH API
// ============================================

export async function loginApi(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Network error' }
  }
}

export async function logoutApi() {
  try {
    await fetchAPI('/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

export async function getCurrentUserApi() {
  try {
    return await fetchAPI('/me')
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// ============================================
// PATIENTS API
// ============================================

export async function getPatientsApi(search = '') {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return await fetchAPI(`/patients${query}`)
  } catch (error) {
    console.error('Get patients error:', error)
    return []
  }
}

export async function getPatientByIdApi(id) {
  try {
    return await fetchAPI(`/patients/${id}`)
  } catch (error) {
    console.error('Get patient error:', error)
    return null
  }
}

export async function createPatientApi(data) {
  try {
    const result = await fetchAPI('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return result
  } catch (error) {
    console.error('Create patient error:', error)
    return { error: error.message }
  }
}

export async function updatePatientApi(id, data) {
  try {
    const result = await fetchAPI(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return result
  } catch (error) {
    console.error('Update patient error:', error)
    return { error: error.message }
  }
}

// ============================================
// VISITS API
// ============================================

export async function getVisitsApi(status = '') {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return await fetchAPI(`/visits${query}`)
  } catch (error) {
    console.error('Get visits error:', error)
    return []
  }
}

export async function getVisitByIdApi(id) {
  try {
    return await fetchAPI(`/visits/${id}`)
  } catch (error) {
    console.error('Get visit error:', error)
    return null
  }
}

export async function getVisitWorkflowApi(id) {
  try {
    return await fetchAPI(`/visits/${id}/workflow`)
  } catch (error) {
    console.error('Get visit workflow error:', error)
    return null
  }
}

export async function createVisitApi(data) {
  try {
    const result = await fetchAPI('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return result
  } catch (error) {
    console.error('Create visit error:', error)
    return { error: error.message }
  }
}

export async function updateVisitStatusApi(visitId, status, notes = '') {
  try {
    const result = await fetchAPI(`/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
    return result
  } catch (error) {
    console.error('Update visit status error:', error)
    return { error: error.message }
  }
}

export async function updateStepStatusApi(stepId, status, notes = '') {
  try {
    const result = await fetchAPI(`/visits/steps/${stepId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
    return result
  } catch (error) {
    console.error('Update step status error:', error)
    return { error: error.message }
  }
}

export async function getDashboardStatsApi() {
  try {
    return await fetchAPI('/visits/dashboard/stats')
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return { waiting: 0, inProgress: 0, done: 0, today: 0 }
  }
}

// ============================================
// PACKAGES API
// ============================================

export async function getPackagesApi() {
  try {
    return await fetchAPI('/packages')
  } catch (error) {
    console.error('Get packages error:', error)
    return []
  }
}

export async function getPackageByIdApi(id) {
  try {
    return await fetchAPI(`/packages/${id}`)
  } catch (error) {
    console.error('Get package error:', error)
    return null
  }
}

export async function createPackageApi(data) {
  try {
    const result = await fetchAPI('/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return result
  } catch (error) {
    console.error('Create package error:', error)
    return { error: error.message }
  }
}

export async function togglePackageStatusApi(id) {
  try {
    const result = await fetchAPI(`/packages/${id}/toggle`, {
      method: 'PATCH',
    })
    return result
  } catch (error) {
    console.error('Toggle package error:', error)
    return { error: error.message }
  }
}

// ============================================
// ADMIN API
// ============================================

export async function getAuditLogsApi(filters = {}) {
  try {
    const params = new URLSearchParams(filters)
    const query = params.toString() ? `?${params.toString()}` : ''
    return await fetchAPI(`/admin/audit-logs${query}`)
  } catch (error) {
    console.error('Get audit logs error:', error)
    return []
  }
}
