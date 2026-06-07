import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { updateDietPreferences } from '@/lib/dbActions';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body || !Array.isArray(body.dietPref)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const parsedUserId = Number(userId);
    if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const result = await updateDietPreferences(parsedUserId, { dietPref: body.dietPref });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Unable to update dietary preferences' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('Error updating diet preferences:', error);
    return NextResponse.json(
      { error: (error?.message as string) || 'Server error' },
      { status: 500 },
    );
  }
}
