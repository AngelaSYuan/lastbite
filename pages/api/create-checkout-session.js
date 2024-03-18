// pages/api/create-checkout-session.js

import Stripe from 'stripe';

const stripe = new Stripe("sk_test_51OtLFw2NW6lHOE0ByPfjZSU61xXyCDmtSrzywBiTs73odhLwwp25rkiRDUL1N80PSv2vfrXeeaiPe969ms1cDqyi00EnVu1i8j");

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { packageType } = req.body;

    try {
      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: getPriceIdForPackage(packageType), // Get the price ID based on the package type
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/`,
        cancel_url: `http://localhost:3000/`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}

// Function to get the price ID based on the package type
function getPriceIdForPackage(packageType) {
  // Define your price IDs for regular and large packages
  const priceIds = {
    regular: 'price_1OvTHk2NW6lHOE0Bf3fFiXsn',
    large: 'price_1OvTIE2NW6lHOE0BJQUCCIG5',
  };

  return priceIds[packageType];
}
