const StripeStrategy = require("./strategies/StripeStrategy");
const PayFastStrategy = require("./strategies/PayFastStrategy");

/**
 * PaymentContext — Strategy Pattern context.
 * Selects the correct payment provider strategy at runtime
 * and delegates checkout creation & webhook verification to it.
 */
class PaymentContext {
  constructor() {
    this._strategies = {
      stripe: new StripeStrategy(),
      payfast: new PayFastStrategy(),
    };
    this._strategy = null;
  }

  /**
   * Set the active strategy by provider name.
   * @param {"stripe"|"payfast"} provider
   */
  setStrategy(provider) {
    const strategy = this._strategies[provider];
    if (!strategy) {
      throw new Error(
        `Unknown payment provider: "${provider}". Valid options: stripe, payfast`
      );
    }
    this._strategy = strategy;
    return this;
  }

  /**
   * Create a checkout session/link via the active strategy.
   * @param {string[]} courses
   * @param {string} userId
   * @param {string} userEmail
   * @param {number} totalAmount  USD amount (not cents)
   * @returns {Promise<{ checkoutUrl: string, sessionId: string }>}
   */
  async createCheckout(courses, userId, userEmail, totalAmount, courseDetails = []) {
    this._ensureStrategy();
    return this._strategy.createCheckout(
      courses,
      userId,
      userEmail,
      totalAmount,
      courseDetails
    );
  }

  /**
   * Verify an incoming webhook and extract enrollment data.
   * @param {Buffer} rawBody
   * @param {string} signature
   * @returns {{ event: object, userId: string|null, courses: string[]|null }}
   */
  verifyWebhook(rawBody, signature) {
    this._ensureStrategy();
    return this._strategy.verifyWebhook(rawBody, signature);
  }

  _ensureStrategy() {
    if (!this._strategy) {
      throw new Error(
        "No payment strategy set. Call setStrategy(provider) first."
      );
    }
  }
}

module.exports = PaymentContext;
