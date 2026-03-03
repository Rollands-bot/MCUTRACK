'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import { patientSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createPatient(formData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const data = {
    mrn: formData.get('mrn'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    dateOfBirth: formData.get('dateOfBirth'),
    gender: formData.get('gender'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    company: formData.get('company'),
    idNumber: formData.get('idNumber'),
  }

  const parsed = patientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error.flatten() }
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        ...parsed.data,
        mrn: parsed.data.mrn || generateMRN(),
      },
    })

    await logAudit({
      userId: session.userId,
      action: 'CREATE',
      entityType: 'PATIENT',
      entityId: patient.id,
      newValue: { mrn: patient.mrn },
    })

    revalidatePath('/patients')
    return { success: true, patient }
  } catch (error) {
    console.error('Create patient error:', error)
    return { error: 'Failed to create patient' }
  }
}

export async function getPatients(search = '') {
  try {
    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { mrn: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return patients
  } catch (error) {
    console.error('Get patients error:', error)
    return []
  }
}

export async function getPatientById(id) {
  try {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
  } catch (error) {
    console.error('Get patient error:', error)
    return null
  }
}

function generateMRN() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${year}${random}`
}
