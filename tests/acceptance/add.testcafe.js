import { Selector } from 'testcafe';

fixture('Add Produce Modal')
    .page('http://localhost:3000/auth/signin');

const testEmail = 'admin@foo.com';
const testPassword = 'changeme';

test('Add Produce modal opens and form loads', async t => {
    // Sign in
    await t
        .typeText('input[name="email"]', testEmail, { replace: true })
        .typeText('input[name="password"]', testPassword, { replace: true })
        .click('button[type="submit"]');

    // Wait for redirect after signin
    await t.expect(t.eval(() => window.location.pathname)).notEql('/auth/signin', { timeout: 10000 });

    // Navigate to produce list page
    await t.navigateTo('http://localhost:3000/view-pantry');

    // Click the "Add Item" button to open the modal
    const addButton = Selector('button.btn-add');
    await t.click(addButton);

    // Check that the modal appeared and has a form
    const addModal = Selector('.modal.show');
    await t.expect(addModal.exists).ok('Expected AddProduceModal to appear');

    const addForm = addModal.find('form');
    await t.expect(addForm.exists).ok('Expected form inside modal');

    // Optional: check specific fields
    const nameInput = addForm.find('input[name="name"]');
    await t.expect(nameInput.exists).ok('Expected "name" input to exist');

    const unitSelect = addForm.find('select');
    await t.expect(unitSelect.exists).ok('Expected "unit" dropdown to exist');
});
