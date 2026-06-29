// Owner Settings API — platform settings persisted in database
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS: Record<string, string> = {
  portalName: 'InternsHub',
  trialDays: '14',
  freePlanPostings: '2',
  freePlanApplicants: '2',
  basicPlanPrice: '299',
  proPlanPrice: '499',
  allowRegistrations: 'true',
  maintenanceMode: 'false',
};

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await prisma.platformSettings.findMany();
    const merged: Record<string, string> = { ...DEFAULT_SETTINGS };
    settings.forEach(s => { merged[s.key] = s.value; });

    return Response.json({ settings: merged }, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'OWNER' || !session.user?.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { settings } = await req.json();
    if (!settings || typeof settings !== 'object') {
      return Response.json({ error: 'Settings object required' }, { status: 400 });
    }

    // Upsert each setting
    for (const [key, value] of Object.entries(settings)) {
      await prisma.platformSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const { logAudit } = await import('@/lib/activity');
    await logAudit({
      userId: parseInt(session.user.id),
      action: 'settings.update',
      details: JSON.stringify(Object.keys(settings)),
    });

    return Response.json({ message: 'Settings saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return Response.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
