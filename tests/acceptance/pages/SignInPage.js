import { Selector, t } from 'testcafe';

class SignInPage {
  constructor() {
    this.pageTitle = Selector('h1').withText('Sign In');
    this.emailInput = Selector('input[name="email"]');
    this.passwordInput = Selector('input[name="password"]');
    this.form = Selector('form');
  }

  async isDisplayed() {
    await t.expect(this.pageTitle.exists).ok();
  }

  async signIn(email, password) {
    await t.typeText(this.emailInput, email, { replace: true });
    await t.typeText(this.passwordInput, password, { replace: true });

    // Submit the form directly instead of clicking the button
    await t.pressKey('enter');
  }
}

export default new SignInPage();
