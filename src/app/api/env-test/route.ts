export async function GET() {
  return Response.json({
    hasKey: !!process.env.UNSPLASH_ACCESS_KEY,
    preview: process.env.UNSPLASH_ACCESS_KEY?.slice(0, 8) || '(none)',
    env: process.env.VERCEL_ENV || 'local',
  });
}
