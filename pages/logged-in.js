import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "../styles/Restaurant.module.css";
import { getFirestore, getDoc, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import firebase from '../firebase'; // Import your Firebase configuration

const inter = Inter({ subsets: ["latin"] });

export default function LoggedIn() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodSubmissions, setFoodSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const { restaurant } = router.query;
    if (restaurant) {
      setRestaurantName(decodeURIComponent(restaurant));
      fetchFoodSubmissions();
    }
  }, [router.query]);

  const fetchFoodSubmissions = async () => {
    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      if (restaurantDocSnapshot.exists()) {
        const data = restaurantDocSnapshot.data();
        setFoodSubmissions(data.foodSubmissions || []);
      }
    } catch (error) {
      console.error('Error fetching food submissions:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = getFirestore();
    
    try {
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      let foodSubmissions = [];
  
      if (restaurantDocSnapshot.exists()) {
        const restaurantData = restaurantDocSnapshot.data();
        foodSubmissions = restaurantData.foodSubmissions || [];
        
        // Find the index of the existing submission for the same food item
        const existingSubmissionIndex = foodSubmissions.findIndex(submission => submission.foodName === foodName);
        
        if (existingSubmissionIndex !== -1) {
          // If the food item exists, update its quantity by adding the new quantity
          foodSubmissions[existingSubmissionIndex].quantity = Number(foodSubmissions[existingSubmissionIndex].quantity) + Number(quantity);
        } else {
          // If the food item doesn't exist, add it to foodSubmissions
          foodSubmissions.push({ foodName, quantity });
        }
  
        // Update the foodSubmissions array in Firestore
        await setDoc(restaurantDocRef, { foodSubmissions }, { merge: true });
  
        // Update the local state to trigger re-rendering
        setFoodSubmissions(foodSubmissions);
      }
    } catch (error) {
      console.error('Error submitting food entry:', error);
      setError(error.message);
    }
  };

  const handleClearEntries = async () => {
    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);

      // Clear the foodSubmissions array in Firestore
      await setDoc(restaurantDocRef, { foodSubmissions: [] }, { merge: true });

      // Update the local state to reflect the change
      setFoodSubmissions([]);
    } catch (error) {
      console.error('Error clearing food entries:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <Head>
        <title>LastBite</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <h1 className={styles.restaurantMainHook}>
            {restaurantName ? `You're logged in, ${restaurantName}!` : 'You are not logged in. Return to /restaurants'}
          </h1>
          <h2>
            Add food items
          </h2>
          <h4 className={styles.addFoodDesc}>Note: If you want to increase the quantity of a food item that you already posted, just spell food name exactly the way you did the first time, and type in the quantity you want to add. </h4>
          <br />
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter food name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
          <br />
          {error && <p>{error}</p>}
          <div>
            <h2>Food postings you made:</h2>
            <ul>
              {foodSubmissions.map((submission, index) => (
                <li key={index}>{submission.foodName}: {submission.quantity}</li>
              ))}
            </ul>
            <button onClick={handleClearEntries}>Clear All Entries</button>
          </div>
        </div>
      </main>
    </>
  );
}
