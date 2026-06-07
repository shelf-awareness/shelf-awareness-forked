import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don’t reveal if email exists or not
    return NextResponse.json(
      { message: 'If that email exists, a reset link has been sent.' },
      { status: 200 },
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  await sendPasswordResetEmail(email, token);

  return NextResponse.json(
    { message: 'If that email exists, a reset link has been sent.' },
    { status: 200 },
  );
}
