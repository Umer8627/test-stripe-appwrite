const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Appwrite Cloud Function entry point
 */
module.exports = async function (req, res) {
  try {
    const data = JSON.parse(req.body || "{}");
    const amount = data.amount; // amount in cents
    const currency = data.currency || "usd";

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
