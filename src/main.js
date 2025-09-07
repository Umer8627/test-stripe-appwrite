// index.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, currency, id } = JSON.parse(req.body || '{}');

    if (!amount || !currency || !id) {
      return res.send(
        JSON.stringify({ error: 'Missing amount, currency or id' }),
        400
      );
    }

    // create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'My Product' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:64426/payment-success/${id}`,
      cancel_url: `http://localhost:64426/payment-cancel/${id}`,
    });

    log(
      `Created session: ${session.id}, payment_intent: ${session.payment_intent}`
    );

    return res.send(
      JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
      })
    );
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.send(JSON.stringify({ error: err.message }), 500);
  }
};
