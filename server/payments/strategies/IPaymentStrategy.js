// Strategy Interface (documented as JSDoc for clarity)
/**
 * @interface IPaymentStrategy
 * @method createCheckout(courses, userId, userEmail, totalAmount, courseDetails) -> { checkoutUrl, sessionId }
 * @method verifyWebhook(rawBody, signature) -> { event, userId, courses }
 * rawBody can be Buffer (Stripe) or Object (PayFast form payload).
 */

class IPaymentStrategy {
  async createCheckout(_courses, _userId, _userEmail, _totalAmount, _courseDetails) {
    throw new Error("createCheckout() must be implemented by strategy");
  }

  async verifyWebhook(_rawBody, _signature) {
    throw new Error("verifyWebhook() must be implemented by strategy");
  }
}

module.exports = IPaymentStrategy;
