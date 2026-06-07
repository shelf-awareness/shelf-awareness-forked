import { Selector, t } from 'testcafe';

const adminEmail = 'admin@foo.com';
const password = 'changeme';
const baseUrl = 'http://localhost:3000';

// ----------
// HELPERS
// ----------
const signIn = async (email, password) => {
    await t.navigateTo(`${baseUrl}/auth/signin`);
    await t
        .typeText('input[name="email"]', email, { replace: true })
        .typeText('input[name="password"]', password, { replace: true })
        .click('button[type="submit"]');

    // Wait for login success
    await t.expect(Selector('main').exists).ok({ timeout: 8000 });
};

const signOut = async () => {
    await t.navigateTo(`${baseUrl}/auth/signout`);
    const signOutHeading = Selector('h1').withText(/sign out/i);
    await t.expect(signOutHeading.exists).ok({ timeout: 5000 });
};


// ----------
// FIXTURE
// ----------
fixture('Dashboard Acceptance Tests')
    .page(baseUrl);

// ----------
// TEST CASE
// ----------
test('Dashboard loads and links work correctly', async t => {
    await signIn(adminEmail, password);
    await t.navigateTo(`${baseUrl}/dashboard`);

    // Verify main container
    const mainContainer = Selector('#dashboard');
    await t.expect(mainContainer.exists).ok('Main container not found');

    // Verify title text
    const title = Selector('h1').withText('Welcome to your Dashboard');
    await t.expect(title.exists).ok('Title missing');

    // Verify navigation links
    const links = [
        { text: 'View Pantry', url: '/view-pantry' },
        { text: 'Shopping List', url: '/shopping-list' },
        { text: 'Recipes', url: '/recipes' },
    ];

    for (const link of links) {
        const linkSelector = Selector('#dashboard a').withText(link.text);
        await t.expect(linkSelector.exists).ok(`Link "${link.text}" not found`);
        
        // Test navigation
        await t.click(linkSelector);
        await t.expect(t.eval(() => document.location.pathname)).eql(link.url, `Navigation to "${link.text}" failed`);
        
        // Navigate back to dashboard
        await t.navigateTo(`${baseUrl}/dashboard`);
    }

    // Sign out at the end of the test
    await signOut();
});
