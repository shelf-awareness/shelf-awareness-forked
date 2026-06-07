import { Selector, t } from 'testcafe';

const adminEmail = 'admin@foo.com';
const oldPassword = 'changeme';

// Helper to sign in
const signIn = async (email, password) => {
    await t.navigateTo('http://localhost:3000/auth/signin');
    await t
        .typeText('input[name="email"]', email, { replace: true })
        .typeText('input[name="password"]', password, { replace: true })
        .click('button[type="submit"]');

    await t.expect(Selector('main').exists).ok({ timeout: 5000 });
};

// Helper to check that signout page loads
const signOut = async () => {
    await t.navigateTo('http://localhost:3000/auth/signout');

    // Check for a heading or text that exists on the signout page
    const signOutHeading = Selector('h1').withText(/sign out/i);
    await t.expect(signOutHeading.exists).ok({ timeout: 5000 });
};

fixture('Change Password Tests')
    .page('http://localhost:3000');

// 1️⃣ Check Change Password page loads
test('Change password page loads', async t => {
    await signIn(adminEmail, oldPassword);
    await t.navigateTo('http://localhost:3000/auth/change-password');

    const title = Selector('h1').withText('Change Password');
    await t.expect(title.exists).ok({ timeout: 5000 });

    await signOut();
});
