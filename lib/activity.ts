// Activity Logger — records platform events to the Activity table
// Used by API routes to track signups, applications, payments, etc.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ActivityType = 'signup' | 'application' | 'payment' | 'task' | 'announcement' | 'system' | 'staff';
type ActivityAction = 'created' | 'updated' | 'deleted' | 'suspended' | 'activated' | 'login' | 'completed';

export async function logActivity(params: {
  type: ActivityType;
  action: ActivityAction;
  entity: string;
  entityId?: number;
  details?: string;
  userId?: number;
}) {
  try {
    await prisma.activity.create({
      data: {
        type: params.type,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        userId: params.userId,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function logAudit(params: {
  userId: number;
  action: string;
  target?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        target: params.target,
        details: params.details,
        ipAddress: params.ipAddress,
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
