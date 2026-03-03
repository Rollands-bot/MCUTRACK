import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function Home() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Redirect based on role
  const roleRedirects = {
    ADMIN: '/admin',
    DOCTOR: '/departments/doctor',
    NURSE: '/departments/nursing',
    LAB: '/departments/laboratory',
    RADIOLOGY: '/departments/radiology',
  }

  redirect(roleRedirects[session.role] || '/dashboard')
}
