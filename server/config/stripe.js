const Stripe = require("stripe");

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2023-10-16",
});

module.exports = stripe;
