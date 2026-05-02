const stripe = require("../../config/stripe");
const IPaymentStrategy = require("./IPaymentStrategy");

class StripeStrategy extends IPaymentStrategy {
  /**
   * Creates a Stripe Checkout Session and returns the hosted URL.
   * @param {string[]} courses - Array of course IDs being purchased
   * @param {string} userId - The authenticated user's MongoDB ID
   * @param {string} userEmail - Customer email for Stripe prefill
   * @param {number} totalAmount - Total in USD (fallback value)
   * @param {{id:string,name:string,price:number,thumbnail?:string}[]} courseDetails
   * @returns {{ checkoutUrl: string, sessionId: string }}
   */
  async createCheckout(courses, userId, userEmail, totalAmount, courseDetails = []) {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    const lineItems =
      Array.isArray(courseDetails) && courseDetails.length > 0
        ? courseDetails.map((course) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: course.name || "StudyNotion Course",
                description: "StudyNotion course purchase",
                ...(course.thumbnail ? { images: [course.thumbnail] } : {}),
              },
              unit_amount: Math.round(Number(course.price || 0) * 100),
            },
            quantity: 1,
          }))
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "StudyNotion Course Purchase",
                  description: `Enrolling in ${courses.length} course(s)`,
                },
                unit_amount: Math.round(totalAmount * 100),
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: lineItems,
      // Pass userId and courses in metadata so the webhook can enroll the student
      metadata: {
        userId,
        courses: JSON.stringify(courses),
      },
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${FRONTEND_URL}/dashboard/cart`,
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  /**
   * Verifies a Stripe webhook signature and extracts enrollment data.
   * @param {Buffer} rawBody - Raw request body (must NOT be JSON-parsed)
   * @param {string} signature - The stripe-signature header value
   * @returns {{ event: object, userId: string, courses: string[] }}
   */
  verifyWebhook(rawBody, signature) {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type !== "checkout.session.completed") {
      return { event, userId: null, courses: null };
    }

    const session = event.data.object;
    const userId = session.metadata?.userId;
    const courses = JSON.parse(session.metadata?.courses || "[]");

    return { event, userId, courses };
  }
}

module.exports = StripeStrategy;
