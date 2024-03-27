import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Restaurant.module.css";

import { useState } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebase from '../firebase'; // Import your Firebase configuration
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ["latin"] });

export default function Restaurant() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const db = getFirestore();

      // Check if the restaurant exists in the Firestore database
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);

      if (!restaurantDocSnapshot.exists()) {
        // If the restaurant doesn't exist, create a new document in the 'restaurants' collection
        await setDoc(restaurantDocRef, { name: restaurantName });
      }

      // Redirect to the logged-in page
      router.push(`/logged-in?restaurant=${encodeURIComponent(restaurantName)}`);
    } catch (error) {
      setError(error.message); //I think this prints out the error lmao.
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <>
      <h1 className={styles.loginHook}>Log in to your restaurant&apos;s dashboard!</h1>
      <h2 className={styles.subheading}>Note: if you&apos;ve previously logged in, please type the name in the exact same way (capitalization, spacing, etc.)</h2>
      <div className={styles.loginForm}>
        <input
          type="text"
          placeholder="Enter restaurant name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          onKeyPress={handleKeyPress} // Call handleKeyPress on key press
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p>{error}</p>}
      </div>
    </>
  );
}
