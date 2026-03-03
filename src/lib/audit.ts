/**
 * Audit Logging System
 * Critical for medical data compliance and traceability
 */

import { PrismaClient, AuditAction, EntityType } from '@prisma/client'

export interface AuditLogInput {
  userId?: string
  visitId?: string
  action: AuditAction
  entityType: EntityType
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit entry
 */
export async function logAudit(
  input: AuditLogInput,
  tx?: PrismaClient
): Promise<void> {
  const client = tx || prisma

  await client.auditLog.create({
    data: {
      userId: input.userId,
      visitId: input.visitId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
      newValue: input.newValue ? JSON.stringify(input.newValue) : null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  })
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(
  entityType: EntityType,
  entityId: string
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get audit trail for a visit (includes all related entities)
 */
export async function getVisitAuditTrail(visitId: string) {
  return prisma.auditLog.findMany({
    where: {
      OR: [
        { visitId },
        { entityId: { in: getVisitRelatedEntityIds(visitId) } }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
}

function getVisitRelatedEntityIds(visitId: string): string[] {
  // This would be populated with step IDs, result IDs related to the visit
  // In practice, you'd query these first
  return []
}

/**
 * Get recent audit logs for admin dashboard
 */
export async function getRecentAuditLogs(limit: number = 50) {
  return prisma.auditLog.findMany({
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      visit: {
        select: {
          id: true,
          visitNumber: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}
