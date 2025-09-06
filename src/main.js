// index.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Parse JSON body coming from Flutter
    const { amount, currency } = JSON.parse(req.body || '{}');

    if (!amount || !currency) {
      return res.status(400).json({ error: 'amount and currency required' });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Payment' },
            unit_amount: amount, // in smallest currency unit (e.g. cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',

      // URLs to send the customer after payment or cancel
      success_url: 'https://example.com/payment-success',
      cancel_url: 'https://example.com/payment-cancel',
    });

    log(`Created Checkout Session: ${session.id}`);

    // Return JSON to Flutter
    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    error('Error creating Checkout Session: ' + err.message);
    return res.status(500).json({ error: err.message });
  }
};
