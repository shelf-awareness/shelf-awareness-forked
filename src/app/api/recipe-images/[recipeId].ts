import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const recipeId = Number(req.query.recipeId);
  if (!recipeId) return res.status(400).json({ error: 'Missing recipeId' });

  try {
    const images = await prisma.recipeImage.findMany({
      where: { recipeId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
}
