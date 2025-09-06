import Stripe from "stripe";

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      'whsec_BS6YfehkeffODRlpVCqDvlRAcWz78HgT'
    );

    switch (event.type) {
      case 'checkout.session.completed':
        log(`Payment completed: ${event.data.object.id}`);
        break;
      default:
        log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    error("Webhook error: " + err.message);
    return res.status(400).json({ error: err.message });
  }
};
