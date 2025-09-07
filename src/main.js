import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { action, amount, currency, id, sessionId } = body;

    if (action === 'create_session') {
      if (!amount || !currency || !id) {
        return res.status(400).send(JSON.stringify({ error: 'Missing amount, currency or id' }));
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: 'My Product' },
              unit_amount: amount * 100
,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:59824/payment-success/${id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:59824/payment-cancel/${id}?session_id={CHECKOUT_SESSION_ID}`,
      });

      log(`Created session: ${session.id}, payment_intent: ${session.payment_intent}`);

      return res.send(JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }));
    }

    if (action === 'payment_info') {
      if (!sessionId) {
        return res.status(400).send(JSON.stringify({ error: 'Missing sessionId' }));
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentIntentId = session.payment_intent;

      log(`Payment captured! PI: ${paymentIntentId}`);

      return res.send(JSON.stringify({ paymentIntentId, sessionDetails: session }));
    }

    return res.status(400).send(JSON.stringify({ error: 'Invalid action' }));
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.status(500).send(JSON.stringify({ error: err.message }));
  }
};
