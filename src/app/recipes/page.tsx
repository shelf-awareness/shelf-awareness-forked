import { Container } from 'react-bootstrap';
import RecipesClient from '@/components/recipes/RecipesClient';
import { getRecipes } from '@/lib/recipes';

import { getServerSession } from 'next-auth';
import { getUserProduceByEmail } from '@/lib/dbActions';

export const dynamic = 'force-dynamic';


export default async function RecipeListPage() {
  const session = await getServerSession();

  const email = session?.user?.email ?? null;
  const canAdd = !!email;
  const isAdmin = email === 'admin@foo.com';

  let pantry: any[] = [];
  if (email) pantry = await getUserProduceByEmail(email);

  const recipes = await getRecipes();

  return (
    <main>
      <Container
        id="list"
        fluid
        className="px-2 px-md-3 py-1 py-md-3"
      >
        <h2 className="text-center mb-2 mb-md-4">
          Browse Recipes
        </h2>

        <RecipesClient
          key={email}
          recipes={recipes}
          produce={pantry}
          canAdd={canAdd}
          currentUserEmail={email}
          isAdmin={isAdmin}
        />
      </Container>
    </main>
  );
}
