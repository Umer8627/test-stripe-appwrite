// index.js for Appwrite function
import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Parse body from Flutter
    const { amount, currency } = JSON.parse(req.body || '{}');

    if (!amount || !currency) {
      return res.send(JSON.stringify({ error: 'Missing amount or currency' }), 400);
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
    });

    log(`Created PaymentIntent: ${paymentIntent.id}`);

    // Return client secret back to Flutter
    return res.send(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }));
  } catch (err) {
    error('Stripe error: ' + err.message);
    return res.send(JSON.stringify({ error: err.message }), 500);
  }
};
