// index.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, currency, id } = JSON.parse(req.body || '{}');

    if (!amount || !currency || !id) {
      return res.send(JSON.stringify({ error: 'Missing amount, currency or id' }), 400);
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
      success_url: `http://localhost:63612/payment-success/${id}`,  // id appended in path
      // OR if you prefer query param: `http://localhost:63496/payment-success?id=${id}`,
      cancel_url: `http://localhost:63612/payment-cancel/${id}`,
    });

    log(`Created session: ${session.id}`);
    return res.send(JSON.stringify({ checkoutUrl: session.url }));
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.send(JSON.stringify({ error: err.message }), 500);
  }
};
