import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ hasRated: false, rating: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ hasRated: false, rating: null }, { status: 200 });
    }

    const { id } = await context.params;
    const recipeId = Number(id);

    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id.' },
        { status: 400 },
      );
    }

    const existingRating = await prisma.recipeRating.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
      select: {
        rating: true,
      },
    });

    return NextResponse.json(
      {
        hasRated: !!existingRating,
        rating: existingRating?.rating ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching recipe rating status:', error);

    return NextResponse.json(
      { error: 'Failed to fetch rating status.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json(
        { error: 'You must be signed in to rate a recipe.' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 },
      );
    }

    const { id } = await context.params;
    const recipeId = Number(id);

    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id.' },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found.' },
        { status: 404 },
      );
    }

    const body = await req.json();
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer from 1 to 5.' },
        { status: 400 },
      );
    }

    const existingRating = await prisma.recipeRating.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
      select: { id: true },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this recipe.' },
        { status: 409 },
      );
    }

    const savedRating = await prisma.recipeRating.create({
      data: {
        userId: user.id,
        recipeId,
        rating,
      },
    });

    return NextResponse.json(savedRating, { status: 201 });
  } catch (error) {
    console.error('Error saving recipe rating:', error);

    return NextResponse.json(
      { error: 'Failed to save rating.' },
      { status: 500 },
    );
  }
}