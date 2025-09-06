import Stripe from 'stripe';

/**
 * Appwrite function
 * - POST with {amount, currency}  → creates Checkout Session and returns session.url
 * - Stripe will call this same URL for webhooks if you set it in your Stripe dashboard
 */
export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // For Stripe webhooks you need the raw body:
  const sig = req.headers['stripe-signature'];

  // If this is a webhook call from Stripe
  if (sig) {
    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // put your webhook secret here
      );

      switch (event.type) {
        case 'checkout.session.completed':
          log(`Payment completed: ${event.data.object.id}`);
          // TODO: update your database for success here
          break;
        default:
          log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      error('Webhook error: ' + err.message);
      return res.status(400).json({ error: err.message });
    }
  }

  // Otherwise, treat it as a create-checkout-session call
  try {
    const { amount, currency } = JSON.parse(req.body || '{}');

    if (!amount || !currency) {
      return res.status(400).json({ error: 'amount and currency required' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Payment' },
            unit_amount: amount, // smallest currency unit (e.g. cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://yourapp.com/success',
      cancel_url: 'https://yourapp.com/cancel',
    });

    log(`Created Checkout Session: ${session.id}`);

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    error('Error creating Checkout Session: ' + err.message);
    return res.status(500).json({ error: err.message });
  }
};
