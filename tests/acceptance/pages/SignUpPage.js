import { Selector, t } from 'testcafe';

class SignUpPage {
  constructor() {
    this.pageTitle = Selector('h1').withText(/sign up/i);

    this.emailInput = Selector('input[type="email"], input[name="email"], input[placeholder="Email"]');
    this.passwordInput = Selector('input[type="password"]').nth(0);
    this.confirmPasswordInput = Selector('input[type="password"]').nth(1);
    this.registerButton = Selector('button').withText(/sign up|register|create/i);
  }

  async isDisplayed() {
    await t.expect(this.pageTitle.exists).ok('Sign up page title not found');
  }

  async signup(email, password) {
    await t.typeText(this.emailInput, email, { replace: true });
    await t.typeText(this.passwordInput, password, { replace: true });
    await t.typeText(this.confirmPasswordInput, password, { replace: true });

    // Make sure button is visible and clickable
    await t.scrollIntoView(this.registerButton);
    await t.click(this.registerButton, { offsetX: 10, offsetY: 10 });
  }
}

export default new SignUpPage();
