import { Selector, t } from 'testcafe';

// Helper to sign in first
const signIn = async () => {
    await t.navigateTo('http://localhost:3000/auth/signin');

    await t
        .typeText('input[name="email"]', 'admin@foo.com', { replace: true })
        .typeText('input[name="password"]', 'changeme', { replace: true })
        .click('button[type="submit"]');

    // Wait for main content to appear
    await t.expect(Selector('main').exists).ok();
};

fixture('Sign Out')
    .page('http://localhost:3000');

// ✅ Test if Sign Out page loads
test('Sign Out page loads', async t => {
    await signIn();
    await t.navigateTo('http://localhost:3000/auth/signout');

    const signOutTitle = Selector('h1').withText('Sign Out');
    await t.expect(signOutTitle.exists).ok();
});

// ✅ Test if the Sign Out button works
test('Sign out button works', async t => {
    await signIn();
    await t.navigateTo('http://localhost:3000/auth/signout');

    const signOutButton = Selector('[data-testid="signout-button"]');
    await t.click(signOutButton);

    // Verify redirect to /auth/signin
    await t.expect(t.eval(() => window.location.pathname)).eql('/auth/signin');

    // Verify user dropdown is gone
    const userDropdown = Selector('#login-dropdown');
    await t.expect(userDropdown.exists).notOk();
});
