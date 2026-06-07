import SignInPage from './pages/SignInPage';
import { t } from 'testcafe';

fixture('SignIn Page')
  .page('http://localhost:3000/auth/signin');

test('SignUp page loads', async t => {
  await SignInPage.isDisplayed();
});

test('Can sign in as admin', async t => {
  const email = 'admin@foo.com';
  const password = 'changeme';

  await SignInPage.signIn(email, password);

  // Wait for redirect to /dashboard (up to 10s)
  await t.expect(t.eval(() => window.location.pathname))
         .eql('/dashboard', { timeout: 10000 }, 'Expected redirect to /dashboard after sign in');
});
