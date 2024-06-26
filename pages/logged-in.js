import { useState, useEffect } from 'react';
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "../styles/Restaurant.module.css";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebase from '../firebase'; // Import your Firebase configuration
import { useRouter } from 'next/router';
import axios from "axios"

const inter = Inter({ subsets: ["latin"] });

export default function LoggedIn({ initialFoodSubmissions, initialPackages, initialOrders }) {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [foodSubmissions, setFoodSubmissions] = useState(initialFoodSubmissions || []);
  const [error, setError] = useState('');
  // Package-related states
  const [packageType, setPackageType] = useState('');
  const [packageQuantity, setPackageQuantity] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packages, setPackages] = useState(initialPackages || []);
  // Orders-related states
  const [orders, setOrders] = useState(initialOrders || []);

  const [fulfilledOrders, setFulfilledOrders] = useState({});

  // Load fulfilled orders from localStorage on component mount
  useEffect(() => {
    const savedFulfilledOrders = JSON.parse(localStorage.getItem('fulfilledOrders')) || {};
    setFulfilledOrders(savedFulfilledOrders);
  }, []);


  useEffect(() => {
    const { restaurant } = router.query;
    if (restaurant) {
      setRestaurantName(decodeURIComponent(restaurant));
      fetchFoodSubmissions();
      fetchPackages();
      fetchOrders();
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

  
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const db = getFirestore();
    
  //   try {
  //     const restaurantDocRef = doc(db, 'restaurants', restaurantName);
  //     const restaurantDocSnapshot = await getDoc(restaurantDocRef);
  //     let foodSubmissions = [];
  
  //     if (restaurantDocSnapshot.exists()) {
  //       const restaurantData = restaurantDocSnapshot.data();
  //       foodSubmissions = restaurantData.foodSubmissions || [];
        
  //       const existingSubmissionIndex = foodSubmissions.findIndex(submission => submission.foodName === foodName);
        
  //       if (existingSubmissionIndex !== -1) {
  //         foodSubmissions[existingSubmissionIndex].quantity += Number(quantity);
  //         foodSubmissions[existingSubmissionIndex].price = Number(price); // Update the price
  //       } else {
  //         foodSubmissions.push({ foodName, quantity, price });
  //       }
  
  //       await setDoc(restaurantDocRef, { foodSubmissions }, { merge: true });
  
  //       setFoodSubmissions(foodSubmissions);
  //     }
  //   } catch (error) {
  //     console.error('Error submitting food entry:', error);
  //     setError(error.message);
  //   }
  // };
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
        
            const existingSubmissionIndex = foodSubmissions.findIndex(submission => submission.foodName === foodName);
        
            if (existingSubmissionIndex !== -1) {
                foodSubmissions[existingSubmissionIndex].quantity += Number(quantity);
                foodSubmissions[existingSubmissionIndex].price = Number(price); // Update the price
            } else {
                foodSubmissions.push({ foodName, quantity, price });
            }
  
            await setDoc(restaurantDocRef, { foodSubmissions }, { merge: true });
  
            setFoodSubmissions(foodSubmissions);
        }
    } catch (error) {
        console.error('Error submitting food entry:', error);
        setError(error.message);
    }
};

const handleSubmissionQuantity = async (foodName, change) => {
  const db = getFirestore();
  try {
    const restaurantDocRef = doc(db, 'restaurants', restaurantName);
    const updatedFood = foodSubmissions.map(food =>
      food.foodName === foodName
        ? { ...food, quantity: Math.max(0, parseInt(food.quantity) + change) }
        : food
    );
    await setDoc(restaurantDocRef, { foodSubmissions: updatedFood }, { merge: true });
    setFoodSubmissions(updatedFood);
  } catch (error) {
    console.error('Error updating food quantity:', error);
  }
};



  const handleClearEntries = async () => {
    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);

      await setDoc(restaurantDocRef, { foodSubmissions: [] }, { merge: true });

      setFoodSubmissions([]);
    } catch (error) {
      console.error('Error clearing food entries:', error);
      setError(error.message);
    }
  };

  const handleSubmitPackage = async (event) => {
    event.preventDefault();
    const db = getFirestore();

    try {
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      let packages = [];

      if (restaurantDocSnapshot.exists()) {
        const restaurantData = restaurantDocSnapshot.data();
        packages = restaurantData.packages || [];
        packages.push({ packageType, packageQuantity, packagePrice });
        
        await setDoc(restaurantDocRef, { packages }, { merge: true });

        setPackages(packages);
  
        setPackageType('');
        setPackageQuantity('');
        setPackagePrice('');
      }
    } catch (error) {
      console.error('Error submitting package entry:', error);
      setError(error.message);
    }
  };

  const fetchPackages = async () => {
    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      if (restaurantDocSnapshot.exists()) {
        const data = restaurantDocSnapshot.data();
        setPackages(data.packages || []);
      } else {
        setPackages([]); // Set packages to an empty array if no data is found
      }
    } catch (error) {
      console.error('Error fetching packages submissions:', error);
    }
  };

  const handleQuantityChange = async (event, packageType) => {
    const { value } = event.target;
    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.packageType === packageType ? { ...pkg, packageQuantity: value } : pkg
      )
    );
  };

  const handleUpdateQuantity = async (packageType, change) => {
    const db = getFirestore();
    try {
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const updatedPackages = packages.map(pkg =>
        pkg.packageType === packageType
          ? { ...pkg, packageQuantity: Math.max(0, parseInt(pkg.packageQuantity) + change) }
          : pkg
      );
      await setDoc(restaurantDocRef, { packages: updatedPackages }, { merge: true });
      setPackages(updatedPackages);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };
  

  const handleClearPackages = async () => {
    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);

      await setDoc(restaurantDocRef, { packages: [] }, { merge: true });

      setPackages([]);
    } catch (error) {
      console.error('Error clearing packages:', error);
      setError(error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const db = getFirestore();
      const ordersCollectionRef = collection(db, 'restaurants', restaurantName, 'orders');
      const ordersSnapshot = await getDocs(ordersCollectionRef);
      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };


  //  const handleFulfillmentCheck = (orderId) => {
  //   // Update the fulfillment status locally
  //   const updatedFulfilledOrders = { ...fulfilledOrders, [orderId]: !fulfilledOrders[orderId] };
  //   setFulfilledOrders(updatedFulfilledOrders);

  //   // Update localStorage
  //   localStorage.setItem('fulfilledOrders', JSON.stringify(updatedFulfilledOrders));

  //   // Implement additional logic to update fulfillment status in the database
  //   console.log(`Fulfillment status updated for order ID: ${orderId}`);
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
          <h1 className={styles.restaurantMainHook}>
            {restaurantName ? `You're logged in, ${restaurantName}!` : 'You are not logged in. Return to /restaurants'}
          </h1>

          {/* Form for submitting mystery package info */}
          <h2 className={styles.subheading}>Manage package</h2>
          <h3 className={styles.addFoodDesc}>We currently support regular and large mystery packages.
          <br/>
          Please type in exactly &quot;Regular&quot; and &quot;Large&quot; as the package type.
          </h3>
          <form onSubmit={handleSubmitPackage}>
            <input
              type="text"
              placeholder="Enter package type"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter quantity"
              value={packageQuantity}
              onChange={(e) => setPackageQuantity(e.target.value)}
            />
            {/* <input
              type="number"
              placeholder="Enter price"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value)}
            /> */}
            <button type="submit">Submit Package</button>
          </form>

          <br />
          <div>
            <h2>Package postings you made:</h2>
            <ul>
            {packages.map((thePackage, index) => (
                <li key={index}>
                  {/* (${thePackage.packagePrice}) */}
                  {thePackage.packageType} package:
                    <button onClick={() => handleUpdateQuantity(thePackage.packageType, -1)}> - </button>
                    {thePackage.packageQuantity}
                    <button onClick={() => handleUpdateQuantity(thePackage.packageType, 1)}> + </button>
                </li>
              ))}

            </ul>
            <button onClick={handleClearPackages}>Clear All Packages</button>
          </div>

          <br/>
          <br/>
          <br/>

          {/* Form for submitting food info */}
          <h2 className={styles.subheading}>List potential food items in a mystery package</h2>
          <h4 className={styles.addFoodDesc}>Note: If you want to increase the quantity of a food item that you already posted, just spell food name exactly the way you did the first time, and type in the quantity you want to add.</h4>
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
            {/* <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            /> */}
            <button type="submit">Submit</button>
          </form>

          <br />
      
          
          {error && <p>{error}</p>}


          <div>
            <h2>Food postings you made:</h2>
            <ul>
            {foodSubmissions.map((submission, index) => (
                <li key={index}>
                  {submission.foodName}:
                    <button onClick={() => handleSubmissionQuantity(submission.foodName, -1)}> - </button>
                    {submission.quantity}
                    <button onClick={() => handleSubmissionQuantity(submission.foodName, 1)}> + </button>
                </li>
              ))}

            </ul>
            {/* <ul>
              {foodSubmissions.map((submission, index) => (
                <li key={index}>{submission.foodName}: {submission.quantity}</li>
              ))}
            </ul> */}
            <button onClick={handleClearEntries}>Clear All Entries</button>
          </div>

          <br />
          <br />
    
          <div className={styles.ordersContainer}>
              <h2 className={styles.ordersSubheading}>Recent Orders</h2>
              <div className={styles.tableContainer}>
                <table className={styles.orderTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Package Type</th>
                      <th>Total Paid</th>
                      <th>Approximate Order Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.slice().reverse().map((order, index) => ( // Reversing the array here
                        <tr key={index}>
                          <td className={styles.orderTableCell}>{order.name}</td>
                          <td className={styles.orderTableCell}>{order.email}</td>
                          <td className={styles.orderTableCell}>{order.packageType}</td>
                          <td className={styles.orderTableCell}>${order.price}</td>
                          <td className={styles.orderTableCell}>{order.time}</td>
                          <td className={styles.orderTableCell}>{order.dietaryRestrictions}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className={styles.orderTableCell}>No orders yet!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { restaurant } = context.query;
  const db = getFirestore();
  const restaurantDocRef = doc(db, 'restaurants', restaurant);
  const restaurantDocSnapshot = await getDoc(restaurantDocRef);
  let initialFoodSubmissions = [];
  let initialPackages = [];
  let initialOrders = [];
  
  if (restaurantDocSnapshot.exists()) {
    const data = restaurantDocSnapshot.data();
    initialFoodSubmissions = data.foodSubmissions || [];
    initialPackages = data.packages || [];
    initialOrders = data.orders || [];
  }
  
  return {
    props: {
      initialFoodSubmissions,
      initialPackages,
      initialOrders
    }
  };
}