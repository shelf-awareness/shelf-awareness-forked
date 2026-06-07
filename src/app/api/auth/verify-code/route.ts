import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find matching unused verification code
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark code as used
    await prisma.emailVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Error verifying code:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
