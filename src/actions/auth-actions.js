'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import { cookies } from 'next/headers'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      await logAudit({
        action: 'LOGIN',
        entityType: 'USER',
        entityId: email,
        newValue: { email, success: false, reason: 'User not found' },
      })
      return { error: 'Invalid email or password' }
    }

    if (!user.isActive) {
      await logAudit({
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        newValue: { email, success: false, reason: 'User inactive' },
      })
      return { error: 'Account is deactivated' }
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      await logAudit({
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        newValue: { email, success: false, reason: 'Invalid password' },
      })
      return { error: 'Invalid email or password' }
    }

    // Create session
    const session = await createSession(user)
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    // Log successful login
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      newValue: { email, success: true },
    })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function logoutAction() {
  const session = await getSession()
  
  if (session) {
    await logAudit({
      userId: session.userId,
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: session.userId,
    })
  }

  const cookieStore = await cookies()
  cookieStore.delete('session')
}
