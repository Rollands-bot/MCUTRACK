import { z } from 'zod'

export const patientSchema = z.object({
  mrn: z.string().min(1, 'MRN is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  idNumber: z.string().optional(),
})

export const visitSchema = z.object({
  patientId: z.string().cuid(),
  packageId: z.string().cuid(),
  notes: z.string().optional(),
})

export const labResultSchema = z.object({
  visitStepId: z.string().cuid(),
  results: z.array(
    z.object({
      testCode: z.string(),
      testName: z.string(),
      value: z.number(),
      unit: z.string(),
      referenceRangeMin: z.number().optional(),
      referenceRangeMax: z.number().optional(),
      flag: z.enum(['NORMAL', 'LOW', 'HIGH', 'CRITICAL']).optional(),
    })
  ),
  notes: z.string().optional(),
})

export const radiologyResultSchema = z.object({
  visitStepId: z.string().cuid(),
  procedure: z.string(),
  findings: z.string(),
  conclusion: z.string(),
  attachmentId: z.string().optional(),
})

export const doctorResultSchema = z.object({
  visitId: z.string().cuid(),
  physicalExam: z.string().optional(),
  finalDecision: z.enum(['FIT', 'FIT_WITH_CONDITIONS', 'UNFIT']),
  conditions: z.string().optional(),
  recommendations: z.string().optional(),
})

export const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'NURSE', 'LAB', 'RADIOLOGY', 'DOCTOR']),
  isActive: z.boolean().default(true),
})

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  code: z.string().min(1, 'Package code is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  steps: z.array(
    z.object({
      department: z.enum(['NURSING', 'LABORATORY', 'RADIOLOGY', 'CARDIOLOGY', 'PULMONOLOGY', 'GENERAL_DOCTOR']),
      stepName: z.string().min(1, 'Step name is required'),
      stepOrder: z.number().int().positive(),
      isRequired: z.boolean().default(true),
      instructions: z.string().optional(),
    })
  ),
})
