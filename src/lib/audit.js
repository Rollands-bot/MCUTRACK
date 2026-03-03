/**
 * Audit Logging System
 * Critical for medical data compliance and traceability
 */

import { prisma } from './prisma'

/**
 * Log an audit entry
 */
export async function logAudit(input, tx) {
  const client = tx || prisma

  try {
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
        userAgent: input.userAgent,
      },
    })
  } catch (error) {
    console.error('Audit log error:', error)
    // Don't throw - audit logging failure shouldn't break main operation
  }
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(entityType, entityId) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get recent audit logs for admin dashboard
 */
export async function getRecentAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      visit: {
        select: { id: true, visitNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
