// functions/stripe.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Check if this is a Stripe webhook call
  const sig = req.headers['stripe-signature'];
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
          // Update your DB here
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

  // Otherwise, handle your Flutter Web request to create a Checkout Session
  try {
    const { amount, currency } = JSON.parse(req.body || '{}');
    if (!amount || !currency) {
      return res.status(400).json({ error: 'amount and currency required' });
    }

    // Replace these with your actual URLs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Payment' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://myapp.com/', // <== your real app URL here
      cancel_url: 'https://myapp.com/',  // <== your real app URL here
    });

    log(`Created Checkout Session: ${session.id}`);

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    error('Error creating Checkout Session: ' + err.message);
    return res.status(500).json({ error: err.message });
  }
};
