// Email verification API endpoint
// Receives a token from the URL query params
// Validates the token, checks expiry, marks user as verified
// Deletes the token after successful verification

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle GET requests to /api/auth/verify?token=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'Missing verification token' }, { status: 400 });
    }

    // Find the verification token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return Response.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    // Check if the token has expired
    if (new Date() > verificationToken.expiresAt) {
      // Delete expired token
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
      return Response.json({ error: 'Verification token has expired. Please register again.' }, { status: 400 });
    }

    // Mark the user's email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() }
    });

    // Delete the used token (single use)
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    return Response.json({
      message: 'Email verified successfully! You can now log in.',
      email: verificationToken.user.email
    }, { status: 200 });

  } catch (error) {
    console.error('Verification error:', error);
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}
