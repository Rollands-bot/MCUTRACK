'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import { packageSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createPackage(formData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const steps = JSON.parse(formData.get('steps') || '[]')
  
  const data = {
    name: formData.get('name'),
    code: formData.get('code'),
    description: formData.get('description'),
    isActive: formData.get('isActive') === 'on',
    steps,
  }

  const parsed = packageSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error.flatten() }
  }

  try {
    const pkg = await prisma.mCUPackage.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        steps: {
          create: parsed.data.steps.map((step) => ({
            department: step.department,
            stepName: step.stepName,
            stepOrder: step.stepOrder,
            isRequired: step.isRequired,
            instructions: step.instructions,
          })),
        },
      },
      include: { steps: true },
    })

    await logAudit({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'PACKAGE',
      entityId: pkg.id,
      newValue: { name: pkg.name, code: pkg.code },
    })

    revalidatePath('/packages')
    return { success: true, package: pkg }
  } catch (error) {
    console.error('Create package error:', error)
    return { error: 'Failed to create package' }
  }
}

export async function getPackages() {
  try {
    return await prisma.mCUPackage.findMany({
      where: { isActive: true },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: { visits: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Get packages error:', error)
    return []
  }
}

export async function getPackageById(id) {
  try {
    return await prisma.mCUPackage.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })
  } catch (error) {
    console.error('Get package error:', error)
    return null
  }
}

export async function togglePackageStatus(id) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const pkg = await prisma.mCUPackage.findUnique({ where: { id } })
    const newStatus = !pkg.isActive

    await prisma.mCUPackage.update({
      where: { id },
      data: { isActive: newStatus },
    })

    await logAudit({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'PACKAGE',
      entityId: id,
      oldValue: { isActive: pkg.isActive },
      newValue: { isActive: newStatus },
    })

    revalidatePath('/packages')
    return { success: true }
  } catch (error) {
    console.error('Toggle package error:', error)
    return { error: 'Failed to toggle package' }
  }
}
