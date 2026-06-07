import { Selector, ClientFunction, t } from 'testcafe';

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

fixture('Recipes Page')
  .page(baseUrl);

test('Recipes page loads', async t => {
  // Sign in
  await signIn(adminEmail, password);

  // Navigate to recipes page
  await t.navigateTo(`${baseUrl}/recipes`);

  // Check that the page heading exists
  const heading = Selector('h2').withText('Recipes');
  await t.expect(heading.exists).ok('Expected Recipes page heading to exist');

  // Check "Show Recipes I Can Make" button
  const showCanMakeButton = Selector('button').withText(/Show Recipes I Can Make|Show All Recipes/);
  await t.expect(showCanMakeButton.exists).ok('Expected "Show Recipes I Can Make" button to exist');

  // Click the toggle button
  await t.click(showCanMakeButton);
  await t.expect(showCanMakeButton.textContent).contains('Show All Recipes', 'Button text should toggle');

  // Check "Edit Mode" toggle button
  const editModeButton = Selector('button').withText(/Edit Recipes|Cancel/);
  await t.expect(editModeButton.exists).ok('Expected "Edit Mode" toggle button to exist');

  // Click edit mode toggle
  await t.click(editModeButton);
  await t.expect(editModeButton.textContent).contains('Cancel', 'Button text should toggle to "Cancel"');

  // Sign out
  await signOut();
});

test('Edit and Delete Recipe buttons work', async t => {
  // Sign in
  await signIn(adminEmail, password);

  // Navigate to recipes page
  await t.navigateTo(`${baseUrl}/recipes`);

  // Turn on Edit Mode so buttons appear
  const editModeButton = Selector('button').withText(/Edit Recipes|Cancel/);
  await t.expect(editModeButton.exists).ok('Expected "Edit Recipes" toggle button to exist');

  const editModeText = await editModeButton.textContent;
  if (editModeText.includes('Edit Recipes')) {
    await t.click(editModeButton);
  }

  // We should now see at least one edit/delete button on a recipe card
  const firstEditButton   = Selector('button.btn-edit').nth(0);
  const firstDeleteButton = Selector('button.btn-delete').nth(0);

  await t
    .expect(firstEditButton.exists)
    .ok('Expected at least one Edit button in edit mode');
  await t
    .expect(firstDeleteButton.exists)
    .ok('Expected at least one Delete button in edit mode');

  // ----- EDIT BUTTON BEHAVIOR -----
  // Click the Edit button (should NOT navigate away, should open modal)
  await t.click(firstEditButton);

  const editModal = Selector('.modal-dialog').withText(/Edit Recipe/i);
  await t
    .expect(editModal.exists)
    .ok('Expected Edit Recipe modal to appear');

  // Close the edit modal (try close button, fall back to ESC)
  const closeButton = Selector('button').withAttribute('aria-label', 'Close');
  if (await closeButton.exists) {
    await t.click(closeButton);
  } else {
    await t.pressKey('esc');
  }

  // Sign out
  await signOut();
});
