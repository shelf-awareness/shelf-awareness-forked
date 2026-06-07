import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationCode } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Invalidate previous unused codes
    await prisma.emailVerificationCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate a 6-digit numeric code
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    // Set expiration: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save new code
    await prisma.emailVerificationCode.create({
      data: { code, userId: user.id, expiresAt },
    });

    // Send code via email
    await sendVerificationCode(user.email, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error sending verification code:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
