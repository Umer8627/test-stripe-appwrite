import Stripe from "stripe";

export default async ({ req, res, log, error }) => {
  try {
    // Load secret key from Appwrite environment variables
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a test PaymentIntent for $1.00 USD
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 (in cents)
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    log(`Created test payment intent: ${paymentIntent.id}`);

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    error("Stripe error: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
