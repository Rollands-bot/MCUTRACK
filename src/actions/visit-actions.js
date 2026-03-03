'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import { transitionVisit, updateStepStatus, getVisitWorkflow } from '@/lib/workflow'
import { revalidatePath } from 'next/cache'

export async function createVisit(formData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const patientId = formData.get('patientId')
  const packageId = formData.get('packageId')
  const notes = formData.get('notes')

  if (!patientId || !packageId) {
    return { error: 'Patient and package are required' }
  }

  try {
    const visitNumber = await generateVisitNumber()

    // Get package steps
    const pkg = await prisma.mCUPackage.findUnique({
      where: { id: packageId },
      include: { steps: true },
    })

    if (!pkg) {
      return { error: 'Package not found' }
    }

    // Create visit with steps
    const visit = await prisma.visit.create({
      data: {
        visitNumber,
        patientId,
        packageId,
        status: 'WAITING',
        notes,
        steps: {
          create: pkg.steps.map((step) => ({
            packageStepId: step.id,
            status: 'WAITING',
          })),
        },
      },
      include: {
        patient: true,
        package: true,
        steps: {
          include: {
            packageStep: true,
          },
        },
      },
    })

    await logAudit({
      userId: session.userId,
      visitId: visit.id,
      action: 'CREATE',
      entityType: 'VISIT',
      entityId: visit.id,
      newValue: { visitNumber, patientId, packageId },
    })

    revalidatePath('/visits')
    revalidatePath('/departments/nursing')
    return { success: true, visit }
  } catch (error) {
    console.error('Create visit error:', error)
    return { error: 'Failed to create visit' }
  }
}

export async function getVisits(status = '') {
  try {
    const where = status ? { status } : {}

    const visits = await prisma.visit.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return visits
  } catch (error) {
    console.error('Get visits error:', error)
    return []
  }
}

export async function getVisitById(id) {
  try {
    return await prisma.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        package: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
        steps: {
          orderBy: { createdAt: 'asc' },
          include: {
            packageStep: true,
          },
        },
        results: true,
        assignedDoctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Get visit error:', error)
    return null
  }
}

export async function updateVisitStatusAction(visitId, newStatus, notes = '') {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const result = await transitionVisit(
    visitId,
    newStatus,
    session.userId,
    session.role,
    { notes }
  )

  if (result.success) {
    revalidatePath('/visits')
    revalidatePath(`/visits/${visitId}`)
  }

  return result
}

export async function updateStepStatusAction(stepId, newStatus, notes = '') {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const result = await updateStepStatus(
    stepId,
    newStatus,
    session.userId,
    { notes }
  )

  if (result.success) {
    revalidatePath('/visits')
    revalidatePath(`/visits/${visitId}`)
  }

  return result
}

export async function getVisitWorkflowAction(visitId) {
  return await getVisitWorkflow(visitId)
}

export async function getDashboardStats() {
  try {
    const [waitingCount, inProgressCount, doneCount, todayCount] = await Promise.all([
      prisma.visit.count({ where: { status: 'WAITING' } }),
      prisma.visit.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.visit.count({ where: { status: 'DONE' } }),
      prisma.visit.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return {
      waiting: waitingCount,
      inProgress: inProgressCount,
      done: doneCount,
      today: todayCount,
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return { waiting: 0, inProgress: 0, done: 0, today: 0 }
  }
}

async function generateVisitNumber() {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  
  const todayVisits = await prisma.visit.count({
    where: {
      createdAt: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
      },
    },
  })

  const sequence = (todayVisits + 1).toString().padStart(3, '0')
  return `MCU-${dateStr}-${sequence}`
}
