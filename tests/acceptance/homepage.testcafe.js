import { Selector, t } from 'testcafe';

fixture('Homepage')
  .page('http://localhost:3000');

test('Homepage loads', async t => {
    // Check that the page title exists and is correct (optional)
    await t.expect(Selector('title').exists).ok();

    // Or check for a main heading
    const mainHeading = Selector('h1');
    await t.expect(mainHeading.exists).ok('Expected main heading on homepage');
});
