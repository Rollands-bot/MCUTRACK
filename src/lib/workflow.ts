/**
 * MCUTrack Workflow Engine
 * 
 * Handles step-based visit workflow transitions with audit logging
 */

import { prisma } from '@/lib/prisma'
import { AuditAction, EntityType, VisitStatus, StepStatus } from '@prisma/client'
import { logAudit } from './audit'

export interface WorkflowTransition {
  from: VisitStatus
  to: VisitStatus
  allowedRoles: string[]
  requirements: TransitionRequirement[]
}

export interface TransitionRequirement {
  type: 'all_steps_completed' | 'specific_department' | 'doctor_approval'
  department?: string
}

/**
 * Workflow state machine definition
 */
export const WORKFLOW_CONFIG: Record<VisitStatus, WorkflowTransition[]> = {
  WAITING: [
    {
      from: VisitStatus.WAITING,
      to: VisitStatus.IN_PROGRESS,
      allowedRoles: ['NURSE', 'ADMIN'],
      requirements: []
    }
  ],
  IN_PROGRESS: [
    {
      from: VisitStatus.IN_PROGRESS,
      to: VisitStatus.DONE,
      allowedRoles: ['DOCTOR'],
      requirements: [
        { type: 'all_steps_completed' }
      ]
    }
  ],
  DONE: [],
  CANCELLED: []
}

/**
 * Check if a role can perform a transition
 */
export function canTransition(role: string, from: VisitStatus, to: VisitStatus): boolean {
  const transitions = WORKFLOW_CONFIG[from] || []
  return transitions.some(t => t.to === to && t.allowedRoles.includes(role))
}

/**
 * Validate transition requirements
 */
export async function validateTransition(
  visitId: string,
  transition: WorkflowTransition
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  for (const req of transition.requirements) {
    if (req.type === 'all_steps_completed') {
      const incompleteSteps = await prisma.visitStep.count({
        where: {
          visitId,
          status: { not: StepStatus.DONE }
        }
      })

      if (incompleteSteps > 0) {
        errors.push(`${incompleteSteps} step(s) not yet completed`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Execute workflow transition
 */
export async function transitionVisit(
  visitId: string,
  newStatus: VisitStatus,
  userId: string,
  userRole: string,
  metadata?: { notes?: string; doctorId?: string }
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx) => {
    // Get current visit
    const visit = await tx.visit.findUnique({
      where: { id: visitId },
      include: { steps: true }
    })

    if (!visit) {
      return { success: false, error: 'Visit not found' }
    }

    // Check role permission
    if (!canTransition(userRole, visit.status, newStatus)) {
      await logAudit({
        userId,
        visitId,
        action: AuditAction.PERMISSION_DENIED,
        entityType: EntityType.VISIT,
        entityId: visitId,
        newValue: { attemptedStatus: newStatus }
      }, tx)

      return { success: false, error: 'Permission denied for this transition' }
    }

    // Validate requirements
    const transition = WORKFLOW_CONFIG[visit.status]?.find(t => t.to === newStatus)
    if (transition) {
      const validation = await validateTransition(visitId, transition)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }
    }

    // Update visit status
    const updatedVisit = await tx.visit.update({
      where: { id: visitId },
      data: {
        status: newStatus,
        completedAt: newStatus === VisitStatus.DONE ? new Date() : visit.completedAt,
        assignedDoctorId: metadata?.doctorId || visit.assignedDoctorId,
        notes: metadata?.notes || visit.notes,
        updatedAt: new Date()
      }
    })

    // Log audit
    await logAudit({
      userId,
      visitId,
      action: AuditAction.STATUS_CHANGE,
      entityType: EntityType.VISIT,
      entityId: visitId,
      oldValue: { status: visit.status },
      newValue: { status: newStatus }
    }, tx)

    return { success: true }
  })
}

/**
 * Update individual step status
 */
export async function updateStepStatus(
  stepId: string,
  newStatus: StepStatus,
  userId: string,
  metadata?: { notes?: string }
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx) => {
    const step = await tx.visitStep.findUnique({
      where: { id: stepId },
      include: { visit: true }
    })

    if (!step) {
      return { success: false, error: 'Step not found' }
    }

    const updatedStep = await tx.visitStep.update({
      where: { id: stepId },
      data: {
        status: newStatus,
        startedAt: newStatus === StepStatus.IN_PROGRESS ? new Date() : step.startedAt,
        completedAt: newStatus === StepStatus.DONE ? new Date() : step.completedAt,
        performedBy: userId,
        notes: metadata?.notes || step.notes,
        updatedAt: new Date()
      }
    })

    // Auto-update visit status if all steps done
    if (newStatus === StepStatus.DONE) {
      const remainingSteps = await tx.visitStep.count({
        where: {
          visitId: step.visitId,
          status: { not: StepStatus.DONE }
        }
      })

      if (remainingSteps === 0) {
        await tx.visit.update({
          where: { id: step.visitId },
          data: { status: VisitStatus.DONE }
        })
      }
    }

    // Log audit
    await logAudit({
      userId,
      visitId: step.visitId,
      action: AuditAction.STATUS_CHANGE,
      entityType: EntityType.VISIT_STEP,
      entityId: stepId,
      oldValue: { status: step.status },
      newValue: { status: newStatus }
    }, tx)

    return { success: true }
  })
}

/**
 * Get workflow status for a visit
 */
export async function getVisitWorkflow(visitId: string) {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      package: {
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' }
          }
        }
      },
      steps: {
        orderBy: { createdAt: 'asc' },
        include: {
          packageStep: true
        }
      },
      results: true
    }
  })

  if (!visit) return null

  // Map steps with their status
  const workflowSteps = visit.package.steps.map(pkgStep => {
    const visitStep = visit.steps.find(vs => vs.packageStepId === pkgStep.id)
    return {
      ...pkgStep,
      visitStepId: visitStep?.id,
      status: visitStep?.status || StepStatus.WAITING,
      performedBy: visitStep?.performedBy,
      completedAt: visitStep?.completedAt
    }
  })

  return {
    visit,
    workflowSteps,
    progress: workflowSteps.filter(s => s.status === StepStatus.DONE).length / workflowSteps.length * 100
  }
}
