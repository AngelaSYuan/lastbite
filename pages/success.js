import { useState, useEffect } from 'react';
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebase from '../firebase'; // Import your Firebase configuration
import { useRouter } from 'next/router';
import axios from "axios"

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Retrieve the restaurant name from local storage when the component mounts
  useEffect(() => {
    let restaurantName = sessionStorage.getItem('selectedRestaurant');
    restaurantName = restaurantName.replace(/^"(.*)"$/, '$1'); 
    setSelectedRestaurant(restaurantName);
    
  }, []);

  return (
    <>
      <Head>
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
        <h1>Thanks, we received your payment! </h1>
        <h2>A payment to Stripe will appear on your statement.</h2>
        
        <br/>
        <br/>

        <h1>Please pick up your order at {selectedRestaurant} at your soonest convenience!</h1>

        </div>
      </main>
    </>
  );
}
