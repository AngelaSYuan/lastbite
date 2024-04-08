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

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedPackageType, setSelectedPackageType] = useState("");


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
    let regularPackageQuantity = 0;
    let largePackageQuantity = 0;
  
    if (restaurant.packages) {
      const regularPackage = restaurant.packages.find(pkg => pkg.packageType.toLowerCase() === 'regular');
      const largePackage = restaurant.packages.find(pkg => pkg.packageType.toLowerCase() === 'large');
  
      if (regularPackage) {
        regularPackageQuantity = regularPackage.packageQuantity;
      }
  
      if (largePackage) {
        largePackageQuantity = largePackage.packageQuantity;
      }
    }
  
    setQuantityRegular(regularPackageQuantity);
    setQuantityLarge(largePackageQuantity);
  };
  
  const handleRegularPackageClick = () => {
    setSelectedPackageType('Regular');
    setShowTermsModal(true);
  };

  const handleLargePackageClick = () => {
    setSelectedPackageType('Large');
    setShowTermsModal(true);
  };

  // const handleRegularPackageClick = () => {
  //   sessionStorage.setItem('packageType', 'Regular'); //NOTE: THE FIRST LETTER IS CAPITALIZED
  //   sessionStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant.name));
  //   // Handle regular package click action STRIPE
  //   //router.push(`https://buy.stripe.com/7sI17ZcmD8J5fXa3cg`); testing $0.50 payment
  //   router.push(`https://buy.stripe.com/test_8wM7sy3GN0Wkg5qcMM `); //TEST MODE
  //   //router.push(`https://buy.stripe.com/28og2T2M3e3p12g3ce`);//THIS IS THE CORRECT LINK:
  // };

  // const handleLargePackageClick = () => {
  //   sessionStorage.setItem('packageType', 'Large'); //NOTE: THE FIRST LETTER IS CAPITALIZED
  //   sessionStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant.name));
  //   // Handle large package click action STRIPE
  //   //router.push(`https://buy.stripe.com/7sI17ZcmD8J5fXa3cg`);
  //   router.push(`https://buy.stripe.com/eVa5of72jf7t8uI6or`); //THIS IS THE CORRECT LINK: 
  // };
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

  const redirectToStripe = (packageType) => {
      const stripeLink = packageType === 'Regular' ? 'https://buy.stripe.com/bIYeYP4Ub6AXeT628f' : 'https://buy.stripe.com/dR617ZfyP4sP3ao28g';
      sessionStorage.setItem('packageType', packageType);
      sessionStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant.name));
      router.push(stripeLink);
  };
  
  const handleAgreeToTerms = () => {
    setShowTermsModal(false);
    redirectToStripe(selectedPackageType);
  };

  const getPackageQuantity = (packages, type) => {
    const packageInfo = packages.find(pkg => pkg.packageType.toLowerCase() === type);
    return packageInfo ? packageInfo.packageQuantity : 0;
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
          <h1 className={styles.mainHook}> LastBite: Your favorite food, but cheaper 🔥 </h1>
          <h3 className={styles.minor}>How it works: select a restaurant, choose mystery package, pay, pick up! </h3>
          <h3 className={styles.blurb}>A mystery package includes a few handpicked items from a restaurant. 
          <br />
          <br />
          Regular packages: $3.99. Large packages: $5.99 
          </h3>

          <br/>
          <h1 className={styles.restLabel}>Supported Restaurants</h1>
          <br />
          <div className={styles.restaurantGrid}>
              {restaurants.map((restaurant, index) => (
                <div key={index} className={styles.restaurantCard} onClick={() => handleRestaurantClick(restaurant)}>
                  
                  <div className={styles.restaurantInfo}>
                    
                    <h1 className={styles.restaurantName}>{restaurant.name}</h1>
                    {/* Display quantity of regular and large packages if available */}
                    <br/>
                    <div className={styles.quantitiesOnCard}>
                      {restaurant.packages && restaurant.packages.length > 0 ? (
                        <div>
                          <p>{`Regular Packages Left: ${getPackageQuantity(restaurant.packages, 'regular')}`}</p>
                          <p>{`Large Packages Left: ${getPackageQuantity(restaurant.packages, 'large')}`}</p>
                        </div>
                      ) : (
                        <p>No packages listed</p>
                      )}
                    </div>
                  </div>

                </div>
              ))}
           </div>


        </div>
        {selectedRestaurant && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2  className={styles.restaurantName}>{selectedRestaurant.name}</h2>
            <br/>
            {selectedRestaurant.packages && selectedRestaurant.packages.length > 0 ? (
              <div>
                <div className={styles.buttonDiv}>
                {quantityRegular > 0 ? (
                  <button onClick={handleRegularPackageClick}>Regular Package ({quantityRegular} left)</button>
                ) : (
                  <p>No regular packages available</p>
                )}
                {quantityLarge > 0 ? (
                  <button onClick={handleLargePackageClick}>Large Package ({quantityLarge} left)</button>
                ) : (
                  <p>No large packages available</p>
                )}
                </div>
                
                <h3>Potential items you could receive:</h3>
                {selectedRestaurant.foodSubmissions && selectedRestaurant.foodSubmissions.length > 0 ? (
                  <ul>
                    {selectedRestaurant.foodSubmissions.map((food, index) => (
                      <li key={index}>{food.foodName} ({food.quantity} left)</li>
                    ))}
                  </ul>
                ) : (
                  <p>Has not been specified yet</p>
                )}

              </div>
            ) : (
              <p>This restaurant has not listed any packages yet!</p>
            )}
            <br/>
            <button onClick={() => setSelectedRestaurant(null)} className={styles.closeButton}>Close</button>
          </div>
        </div>
         )}

        {showTermsModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Terms and Conditions</h2>
              </div>
              <p>Please read and agree to the terms and conditions before proceeding to payment.</p>
              <p>By clicking &quot;Agree&quot;, you acknowledge that you have read and agreed to the terms and conditions outlined above.</p>
              <button onClick={handleAgreeToTerms}>Agree</button>
              <button onClick={() => setShowTermsModal(false)} className={styles.closeButton}> Close </button>
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

//note for timeout for race condition: leave note in terms and condition saying we will ony keep the checkout open for 2 minutes.