// import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
// import Head from 'next/head';
// import styles from "../styles/Checkout.module.css";
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });
// import { Elements, useElements, CardElement } from '@stripe/react-stripe-js';
// import { stripePromise } from './_app';

// const Checkout = () => {
//   const router = useRouter();
//   const [foodName, setFoodName] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [price, setPrice] = useState('');
//   const [restaurantName, setRestaurantName] = useState('');
  
//   useEffect(() => {
//     const { foodName, quantity, price, restaurantName } = router.query;
//     setFoodName(foodName || '');
//     setQuantity(quantity || '');
//     setPrice(price || '');
//     setRestaurantName(restaurantName || '');
//   }, [router.query]);

//   const handlePayment = async () => {
//     try {
//     //   console.log("INSIDE HANDLE PAYMENT")
//       localStorage.setItem('foodName', foodName);
//       localStorage.setItem('quantity', quantity);
//       localStorage.setItem('price', price);
//       localStorage.setItem('restaurantName', restaurantName);
      
//       // Calculate total transaction amount
//       const totalPrice = parseFloat(quantity) * parseFloat(price);
    
//       // Create a Payment Intent with Stripe
//       //console.log("INSIDE HANDLE PAYMENT")
//       const response = await fetch('/api/create-payment-intent', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ amount: totalPrice }),
//       });
//       console.log("INSIDE HANDLE PAYMENT")
    
//       const data = await response.json();
    
//       // Confirm payment with Stripe
//       const stripe = await stripePromise;
//       const elements = useElements(); // Use useElements hook to access the elements object
//       const { error } = await stripe.confirmCardPayment(data.clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement),
//         },
//       });
    
//       if (error) {
//         console.error('Payment failed:', error.message);
//       } else {
//         console.log('Payment successful!');
//         // Handle payment confirmation and send payment to the restaurant
//         handlePaymentConfirmation(totalPrice);
//       }
//     } catch (error) {
//       console.error('Error processing payment:', error);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Checkout</title>
//       </Head>
//       <div>
//         <main className={`${styles.main} ${inter.className}`} >
//           <h1>Checkout</h1>
//           <p>Food Item: {foodName}</p>
//           <p>Quantity: {quantity}</p>
//           <p>Restaurant: {restaurantName}</p>
//           {/* Payment form goes here */}
//           <Elements stripe={stripePromise}>
//             <form>
//               <CardElement />
//               <button type="button" onClick={handlePayment}>Pay Now</button>
//             </form>
//           </Elements>
//         </main>
//       </div>
//     </>
//   );
// };

// export default Checkout;
