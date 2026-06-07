import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

function parseGoal(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    throw new RangeError(`Value must be a non-negative number (got ${value})`);
  }
  return Math.round(Math.min(Math.max(num, min), max));
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, proteinGoal, carbsGoal, fatGoal, caloriesGoal, budget } = body;

    const data: Record<string, string | number | null> = {
      proteinGoal:  parseGoal(proteinGoal,  0, 1000),
      carbsGoal:    parseGoal(carbsGoal,    0, 1000),
      fatGoal:      parseGoal(fatGoal,      0, 1000),
      caloriesGoal: parseGoal(caloriesGoal, 0, 10000),
    };

    if (displayName !== undefined) {
      const trimmed = displayName?.trim() || '';
      if (!trimmed) {
        return NextResponse.json(
          { message: 'Display name cannot be empty' },
          { status: 400 },
        );
      }
      if (trimmed.length > 50) {
        return NextResponse.json(
          { message: 'Display name must be 50 characters or less' },
          { status: 400 },
        );
      }
      data.displayName = trimmed;
    }

    if (budget !== undefined) {
      const b = Number(budget);
      if (!Number.isFinite(b) || b < 0) {
        return NextResponse.json(
          { message: 'Budget must be a non-negative number' },
          { status: 400 },
        );
      }
      data.budget = budget === null ? null : b;
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data,
    });

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof RangeError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('[PATCH /api/profile/update]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
