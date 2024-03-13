import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from "../styles/Checkout.module.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './_app';



const Checkout = () => {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const { foodName, quantity, restaurantName } = router.query;
    setFoodName(foodName || '');
    setQuantity(quantity || '');
    setPrice(price || '');
    setRestaurantName(restaurantName || '');
  }, [router.query]);

  
  const handlePayment = async () => {
    try {
      // Calculate total transaction amount
      const totalPrice = parseFloat(quantity) * parseFloat(foodPrice);
    
      // Create a Payment Intent with Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalPrice }),
      });
    
      const data = await response.json();
    
      // Confirm payment with Stripe
      const stripe = await stripePromise;
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
    
      if (error) {
        console.error('Payment failed:', error.message);
      } else {
        console.log('Payment successful!');
        // Handle payment confirmation and send payment to the restaurant
        handlePaymentConfirmation(totalPrice);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };
  
  

  return (
    <>
      <Head>
        <title>Checkout</title>
      </Head>
      <div>
        <main className={`${styles.main} ${inter.className}`} >
        <h1>Checkout</h1>
        <p>Food Item: {foodName}</p>
        <p>Quantity: {quantity}</p>
        <p>Restaurant: {restaurantName}</p>
        {/* Payment form goes here */}
        <button onClick={handlePayment}>Pay Now</button>
        </main>
      </div>
    </>
  );
};

export default Checkout;
