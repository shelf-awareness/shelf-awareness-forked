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
fixture('View Pantry Page Acceptance Tests')
  .page(baseUrl);

// ----------
// TEST CASE
// ----------
test('View Pantry page loads and all key UI elements work', async t => {
  await signIn(adminEmail, password);
  await t.navigateTo(`${baseUrl}/view-pantry`);

  // Verify main container
  const mainContainer = Selector('#view-pantry');
  await t.expect(mainContainer.exists).ok('Main container not found');

  // Verify title text
  const title = Selector('h1').withText('Your Pantry at a Glance');
  await t.expect(title.exists).ok('Title missing');

  // Check “All Locations” tab exists and is active
  const allLocationsTab = Selector('.nav-link').withText(/all locations/i);
  await t.expect(allLocationsTab.exists).ok('All Locations tab not visible');
  await t.expect(allLocationsTab.hasClass('active')).ok('All Locations tab not active');

  // Click a location tab (if available)
  const locationTabs = Selector('.nav-link').filterVisible().nth(1);
  if (await locationTabs.exists) {
    const locationName = await locationTabs.innerText;
    await t.click(locationTabs);

    // Verify tab switched
    const activeTab = Selector('.nav-link.active');
    await t.expect(activeTab.innerText).contains(locationName.trim(), 'Tab did not switch');
  }

  await signOut();
});
