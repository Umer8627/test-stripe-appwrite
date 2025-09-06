import Stripe from "stripe";

export default async ({ req, res, log, error }) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let body;
    try {
      body = JSON.parse(req.body || "{}");
    } catch (parseError) {
      error("Invalid JSON body: " + parseError.message);
      body = {}; // fallback to empty object
    }

    // --- 1️⃣ Handle webhook events first ---
    if (body.type) {
      const event = body;

      try {
        switch (event.type) {
          case 'payment_intent.succeeded':
            log(`Payment succeeded: ${event.data.object.id}`);
            break;

          case 'payment_intent.payment_failed':
            log(`Payment failed: ${event.data.object.id}`);
            break;

          default:
            log(`Unhandled event type: ${event.type}`);
        }

        return res.json({ received: true });
      } catch (webhookError) {
        error("Webhook handling failed: " + webhookError.message);
        return res.json({ error: webhookError.message });
      }
    }

    // --- 2️⃣ Handle PaymentIntent creation ---
    // Use dummy params if not provided
    const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : 100; // $1.00
    const currency = typeof body.currency === "string" && body.currency.length === 3 ? body.currency : "usd";

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      });

      log(`Created PaymentIntent: ${paymentIntent.id}`);

      return res.json({ paymentIntentId: paymentIntent.id, amount, currency });
    } catch (stripeError) {
      error("Stripe PaymentIntent creation failed: " + stripeError.message);
      return res.json({ error: stripeError.message });
    }

  } catch (err) {
    error("Unexpected error: " + err.message);
    return res.json({ error: "Internal server error" });
  }
};
