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
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [quantityRegular, setQuantityRegular] = useState(0);
  const [quantityLarge, setQuantityLarge] = useState(0);

  const [prices, setPrices] = useState([]);

  // useEffect(() => {
  //   fetchPrices()
  // },[])

  // const fetchPrices = async () => {
  //   try {
  //     const response = await fetch('/api/getproducts');
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch prices');
  //     }
  //     const data = await response.json();
  //     setPrices(data);
  //     console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching prices:', error);
  //   }
  // };
  

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const db = getFirestore();
        const restaurantsCollection = collection(db, 'restaurants');
        const snapshot = await getDocs(restaurantsCollection);
        const restaurantData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRestaurants(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  // const handleRestaurantClick = (restaurant) => {
  //   setSelectedRestaurant(restaurant);
  // };

  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (restaurant.packages) {
      const regularPackage = restaurant.packages.find(pkg => pkg.packageType === 'regular' || 'Regular');
      const largePackage = restaurant.packages.find(pkg => pkg.packageType === 'large' || 'Large');
      if (regularPackage) {
        setQuantityRegular(regularPackage.packageQuantity);
      } else {
        setQuantityRegular(0);
      }
      if (largePackage) {
        setQuantityLarge(largePackage.packageQuantity);
      } else {
        setQuantityLarge(0);
      }
    } else {
      setQuantityRegular(0);
      setQuantityLarge(0);
    }
  };
  const handleRegularPackageClick = () => {
    sessionStorage.setItem('packageType', 'Regular'); //NOTE: THE FIRST LETTER IS CAPITALIZED
    sessionStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant.name));
    // Handle regular package click action STRIPE
    router.push(`https://buy.stripe.com/test_8wM7sy3GN0Wkg5qcMM`);
  };

  const handleLargePackageClick = () => {
    sessionStorage.setItem('packageType', 'Large'); //NOTE: THE FIRST LETTER IS CAPITALIZED
    sessionStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant.name));
    // Handle large package click action STRIPE
    router.push(`https://buy.stripe.com/test_8wM8wCgtz6gE06s001`);
  };
  // const handlePackageClick = async (packageType) => {
  //   try {
  //     const response = await fetch('/api/create-checkout-session', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ packageType }),
  //     });
  //     const data = await response.json();
  //     // Redirect to Stripe Checkout
  //     router.push(`https://checkout.stripe.com/pay/${data.id}`);
  //   } catch (error) {
  //     console.error('Error creating checkout session:', error);
  //   }
  // };


  // const handleItemClick = (item) => {
  //   setSelectedItem(item);
  // };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  // const handleCheckout = () => { //INCLUDE PRICE
  //   const queryString = `?foodName=${selectedItem.foodName}&price=${selectedItem.price}&quantity=${quantity}&restaurantName=${selectedRestaurant.name}`;
  //   router.push(`/checkout${queryString}`);
  // };


  

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
          <h1 className={styles.mainHook}> LastBite: Your favorite food, but cheaper 🔥 </h1>
          <h3 className={styles.minor}>How it works: select a restaurant, choose mystery package, pay, pick up! </h3>
          <h3 className={styles.blurb}>A mystery package includes a few handpicked items from a restaurant! Don&apos;t worry, you can indicate dietary restrictions later. </h3>
          <br/>
          <h1 className={styles.restLabel}>Supported Restaurants</h1>
          <br />
          <div className={styles.restaurantGrid}>
            {restaurants.map((restaurant, index) => (
              <div key={index} className={styles.restaurantCard} onClick={() => handleRestaurantClick(restaurant)}>
                <h2>{restaurant.name}</h2>
                {/* Add more details as needed */}
              </div>
            ))}
          </div>
        </div>
        {selectedRestaurant && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>{selectedRestaurant.name}</h2>
              {selectedRestaurant.packages && selectedRestaurant.packages.length > 0 ? (
                <div>
                 <button onClick={handleRegularPackageClick}>Regular Package ({quantityRegular} left)
                 {/* <br/>
                 selectedRestaurant.packages */}
                 </button>
                 <button onClick={handleLargePackageClick}>Large Package ({quantityLarge} left)
                 </button>
                 {/* <button onClick={() => setSelectedRestaurant(null)} className={styles.closeButton}>Close</button> */}
                 </div>
              ) : (
                <p>This restaurant hasn&apos;t listed any packages yet!</p>
              )}
              <button onClick={() => setSelectedRestaurant(null)} className={styles.closeButton}>Close</button>
            </div>
          </div>
        )}


        {/* {selectedItem && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>{selectedItem.foodName}</h2>
              <p>Price: ${selectedItem.price}</p>
              <label>
                Quantity (out of the {selectedItem.quantity} available): <br/>
                <input type="number" value={quantity} onChange={handleQuantityChange} />
              </label>
              <button onClick={handleCheckout}>Checkout</button>
              <button onClick={() => setSelectedItem(null)} className={styles.closeButton}>Back</button>
            </div>
          </div>
        )} */}
      </main>
    </>
  );
}
