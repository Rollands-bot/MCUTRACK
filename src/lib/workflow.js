/**
 * MCUTrack Workflow Engine
 * Handles step-based visit workflow transitions with audit logging
 */

import { prisma } from '@/lib/prisma'
import { logAudit } from './audit'

export const VisitStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
}

export const StepStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
}

export const FitStatus = {
  FIT: 'FIT',
  FIT_WITH_CONDITIONS: 'FIT_WITH_CONDITIONS',
  UNFIT: 'UNFIT',
  PENDING_REVIEW: 'PENDING_REVIEW',
}

/**
 * Check if a role can perform a transition
 */
export function canTransition(role, fromStatus, toStatus) {
  const permissions = {
    ADMIN: ['WAITING', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
    NURSE: ['WAITING', 'IN_PROGRESS'],
    DOCTOR: ['IN_PROGRESS', 'DONE'],
    LAB: ['IN_PROGRESS'],
    RADIOLOGY: ['IN_PROGRESS'],
  }

  const allowedStatuses = permissions[role] || []
  return allowedStatuses.includes(toStatus)
}

/**
 * Execute workflow transition
 */
export async function transitionVisit(visitId, newStatus, userId, userRole, metadata = {}) {
  return prisma.$transaction(async (tx) => {
    // Get current visit
    const visit = await tx.visit.findUnique({
      where: { id: visitId },
      include: { steps: true },
    })

    if (!visit) {
      return { success: false, error: 'Visit not found' }
    }

    // Check role permission
    if (!canTransition(userRole, visit.status, newStatus)) {
      await logAudit(
        {
          userId,
          visitId,
          action: 'PERMISSION_DENIED',
          entityType: 'VISIT',
          entityId: visitId,
          newValue: { attemptedStatus: newStatus },
        },
        tx
      )
      return { success: false, error: 'Permission denied for this transition' }
    }

    // Validate requirements for DONE status
    if (newStatus === VisitStatus.DONE) {
      const incompleteSteps = await tx.visitStep.count({
        where: { visitId, status: { not: StepStatus.DONE } },
      })

      if (incompleteSteps > 0) {
        return {
          success: false,
          error: `${incompleteSteps} step(s) not yet completed`,
        }
      }
    }

    // Update visit status
    const updatedVisit = await tx.visit.update({
      where: { id: visitId },
      data: {
        status: newStatus,
        completedAt: newStatus === VisitStatus.DONE ? new Date() : visit.completedAt,
        assignedDoctorId: metadata.doctorId || visit.assignedDoctorId,
        notes: metadata.notes || visit.notes,
        updatedAt: new Date(),
      },
    })

    // Log audit
    await logAudit(
      {
        userId,
        visitId,
        action: 'STATUS_CHANGE',
        entityType: 'VISIT',
        entityId: visitId,
        oldValue: { status: visit.status },
        newValue: { status: newStatus },
      },
      tx
    )

    return { success: true, visit: updatedVisit }
  })
}

/**
 * Update individual step status
 */
export async function updateStepStatus(stepId, newStatus, userId, metadata = {}) {
  return prisma.$transaction(async (tx) => {
    const step = await tx.visitStep.findUnique({
      where: { id: stepId },
      include: { visit: true },
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
        notes: metadata.notes || step.notes,
        updatedAt: new Date(),
      },
    })

    // Auto-update visit status to IN_PROGRESS when first step starts
    if (newStatus === StepStatus.IN_PROGRESS && step.visit.status === VisitStatus.WAITING) {
      await tx.visit.update({
        where: { id: step.visitId },
        data: { status: VisitStatus.IN_PROGRESS },
      })
    }

    // Log audit
    await logAudit(
      {
        userId,
        visitId: step.visitId,
        action: 'STATUS_CHANGE',
        entityType: 'VISIT_STEP',
        entityId: stepId,
        oldValue: { status: step.status },
        newValue: { status: newStatus },
      },
      tx
    )

    return { success: true, step: updatedStep }
  })
}

/**
 * Get workflow status for a visit
 */
export async function getVisitWorkflow(visitId) {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
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
    },
  })

  if (!visit) return null

  // Map steps with their status
  const workflowSteps = visit.package.steps.map((pkgStep) => {
    const visitStep = visit.steps.find((vs) => vs.packageStepId === pkgStep.id)
    return {
      ...pkgStep,
      visitStepId: visitStep?.id,
      status: visitStep?.status || StepStatus.WAITING,
      performedBy: visitStep?.performedBy,
      completedAt: visitStep?.completedAt,
    }
  })

  return {
    visit,
    workflowSteps,
    progress:
      (workflowSteps.filter((s) => s.status === StepStatus.DONE).length /
        workflowSteps.length) *
      100,
  }
}
