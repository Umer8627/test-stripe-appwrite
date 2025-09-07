// index.js
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { action, amount, currency, id, sessionId } = JSON.parse(
      req.body || '{}'
    );

    if (action === 'create_session') {
      if (!amount || !currency || !id) {
        return res
          .status(400)
          .send(JSON.stringify({ error: 'Missing amount, currency or id' }));
      }

      // First create the session
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
        // Temporarily use placeholders
        success_url: 'http://localhost:64426/payment-success/PLACEHOLDER',
        cancel_url: 'http://localhost:64426/payment-cancel/PLACEHOLDER',
      });

      // Now update URLs with the actual session ID
      success_url: `http://localhost:64426/payment-success/${id}?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `http://localhost:64426/payment-cancel/${id}?session_id={CHECKOUT_SESSION_ID}`,

      // (Optional) If your Stripe version allows, you can directly pass success_url and cancel_url in create()
      // But generally you need them at creation time, so another option is to build the URLs before passing the session.

      log(
        `Created session: ${session.id}, payment_intent: ${session.payment_intent}`
      );

      return res.send(
        JSON.stringify({ checkoutUrl: session.url, sessionId: session.id })
      );
    }
    if (action === 'payment_info') {
      if (!sessionId) {
        return res.send(JSON.stringify({ error: 'Missing sessionId' }), 400);
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentIntentId = session.payment_intent;

      log(`Payment captured! PI: ${paymentIntentId}`);

      return res.send(
        JSON.stringify({ paymentIntentId, sessionDetails: session })
      );
    }

    return res.send(JSON.stringify({ error: 'Invalid action' }), 400);
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.send(JSON.stringify({ error: err.message }), 500);
  }
};
