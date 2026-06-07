import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pfpURL } = body;

    if (!pfpURL || typeof pfpURL !== 'string') {
      return NextResponse.json(
        { message: 'Profile picture URL is required' },
        { status: 400 },
      );
    }

    const trimmedURL = pfpURL.trim();
    if (!trimmedURL) {
      return NextResponse.json(
        { message: 'Profile picture URL cannot be empty' },
        { status: 400 },
      );
    }

    // Basic URL validation
    try {
      new URL(trimmedURL);
    } catch {
      return NextResponse.json(
        { message: 'Invalid URL format' },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { pfpURL: trimmedURL },
    });

    return NextResponse.json({ message: 'Profile picture updated' }, { status: 200 });
  } catch (error: unknown) {
    console.error('[PATCH /api/profile/update-pfp]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}