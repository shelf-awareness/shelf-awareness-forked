import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false, // for file upload if using multer
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { recipeId, userEmail, url, name } = req.body;

    if (!recipeId || !userEmail || !url || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const image = await prisma.recipeImage.create({
      data: {
        recipeId: Number(recipeId),
        userEmail,
        url,
        name,
      },
    });

    res.status(200).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
