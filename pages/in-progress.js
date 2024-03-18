import { useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, updateDoc, setDoc,getDoc } from 'firebase/firestore';
import firebase from '../firebase'; // Import your Firebase configuration
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firestore

export default function InProgress() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    let restaurantName = sessionStorage.getItem('selectedRestaurant');
    restaurantName = restaurantName.replace(/^"(.*)"$/, '$1');
    const packageType = sessionStorage.getItem('packageType');
    console.log(packageType)

    const formatFirestoreTimestamp = (firestoreTimestamp) => {
      const date = new Date(firestoreTimestamp.seconds * 1000);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      }).format(date);
      return formattedDate;
    };

    let time = formatFirestoreTimestamp(Timestamp.now());

    try {
      const db = getFirestore();
      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      let orders = [];
  
      if (restaurantDocSnapshot.exists()) {
        const restaurantData = restaurantDocSnapshot.data();
        orders = restaurantData.orders || [];
        orders.push({ name, email, quantity, price, packageType, time, dietaryRestrictions });
  
        // Update the orders in the Firestore
        await setDoc(restaurantDocRef, { orders }, { merge: true });
  
        // Fetch the current package data
        const packageDocRef = doc(db, 'packages', packageType);
        const packageDocSnapshot = await getDoc(packageDocRef);
        
        if (restaurantDocSnapshot.exists()) {
          const restaurantData = restaurantDocSnapshot.data();
          const packages = restaurantData.packages || [];
      
          // Search for the package type within the restaurant's packages array
          const packageIndex = packages.findIndex(pkg => pkg.packageType === packageType);
          if (packageIndex !== -1) {
            const packageData = packages[packageIndex];
            //const packageData = packageDocSnapshot.data();
            const currentQuantity = packageData.packageQuantity || 0;
            const newQuantity = Math.max(0, currentQuantity - Number(quantity));
          //  const newQuantity = currentQuantity - Number(quantity);
      
            // Update the package quantity in the restaurant's packages array
            packages[packageIndex].packageQuantity = newQuantity;
            await setDoc(restaurantDocRef, { packages }, { merge: true });
            router.push('/success'); //ADDED
          } else {
            console.error(`No package found with the type ${packageType}`);
          }
        } else {
          console.error(`No package found with the type ${packageType}`);
        }
  
        setName('');
        setEmail('');
        setQuantity('');
        setPrice('');
        setDietaryRestrictions('');
  
        router.push('/success');
      } else {
        console.error(`No restaurant found with the name ${restaurantName}`);
      }
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  return (
    <div>
      <h1>Verify a few more things, so we can get your order right... </h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Quantity ordered:
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        <br />
        <label>
          Final price paid: 
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <br />
        <label>
          Dietary Restrictions/Notes: {/* New input field for dietary restrictions */}
          <input type="text" value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
        </label>
        <br />
        <button type="submit">Confirm Order!</button>
      </form>
    </div>
  );
}
