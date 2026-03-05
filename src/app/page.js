'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserApi } from '@/lib/api-client'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUserApi()
        if (!user) {
          router.push('/login')
          return
        }

        // Redirect based on role
        const roleRedirects = {
          ADMIN: '/admin',
          DOCTOR: '/departments/doctor',
          NURSE: '/departments/nursing',
          LAB: '/departments/laboratory',
          RADIOLOGY: '/departments/radiology',
        }

        router.push(roleRedirects[user.role] || '/dashboard')
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return null
}
