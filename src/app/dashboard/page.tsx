import { getServerSession } from 'next-auth';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { getRecipes, getTrendingRecipes } from '@/lib/recipes';
import { getUserProduceByEmail } from '@/lib/dbActions';
import { prisma } from '@/lib/prisma';
import DashboardMenu from '../../components/dashboard/DashboardMenu';

export const dynamic = 'force-dynamic';

type SessionUser = { id: string; email: string; randomKey: string };

const DashboardPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const email = session?.user?.email || '';

  // Fetch recipes and produce server-side (same pattern as recipes/page.tsx)
  //const recipes = await getRecipes();
  //const pantry = email ? await getUserProduceByEmail(email) : [];
  const trendingRecipes = await getTrendingRecipes();
  const [recipes, pantry, userData] = await Promise.all([
    getRecipes(),
    email ? getUserProduceByEmail(email) : Promise.resolve([]),
    email
      ? prisma.user.findUnique({
          where: { email },
          select: {
            proteinGoal:  true,
            carbsGoal:    true,
            fatGoal:      true,
            caloriesGoal: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <main>
      <DashboardMenu
        ownerEmail={email}
        recipes={recipes}
        produce={pantry}
        trendingRecipes={trendingRecipes}
        proteinGoal={userData?.proteinGoal   ?? null}
        carbsGoal={userData?.carbsGoal       ?? null}
        fatGoal={userData?.fatGoal           ?? null}
        caloriesGoal={userData?.caloriesGoal ?? null}
      />
    </main>
  );
};

export default DashboardPage;
