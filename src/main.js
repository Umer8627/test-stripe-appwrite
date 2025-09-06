// index.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, currency } = JSON.parse(req.body || '{}');

    if (!amount || !currency) {
      return res.send(JSON.stringify({ error: 'Missing amount or currency' }), 400);
    }

    // create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: 'My Product' },
          unit_amount: amount, // in smallest currency unit
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://yourapp.com/success',  // your redirect URL
      cancel_url: 'https://yourapp.com/cancel',    // your redirect URL
    });

    log(`Created session: ${session.id}`);
    return res.send(JSON.stringify({ checkoutUrl: session.url }));
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.send(JSON.stringify({ error: err.message }), 500);
  }
};
