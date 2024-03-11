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

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Enter restaurant name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p>{error}</p>}
      </div>
    </>
  );
}

// export default function Restaurant() {
//   return (
//     <>
//       <Head>
//         <title>LastBite</title>
//         <meta name="description" content="Generated by create next app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main className={`${styles.main} ${inter.className}`}>
//         <div className={styles.description}>
//           <h1 className={styles.restaurantMainHook}>
//            Welcome to the restaurants page!
//           </h1>
//           <br />
//           <p className={styles.blurb}>LastBite is excited to help bring you more customers, while putting leftovers to good use.</p>
//         </div>
//       </main>
//     </>
//   );
// }
