import { useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, getDoc, setDoc, query, where, doc} from 'firebase/firestore';
import firebase from '../firebase'; // Import your Firebase configuration
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firestore

export default function InProgress() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState(''); // New state variable for dietary restrictions
  const [orders, setOrders] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let restaurantName = sessionStorage.getItem('selectedRestaurant');
    restaurantName = restaurantName.replace(/^"(.*)"$/, '$1');
    const packageType = sessionStorage.getItem('packageType');
    
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
        orders.push({ name, email, quantity, price, packageType, time, dietaryRestrictions }); // Include dietaryRestrictions in the order data
      
        await setDoc(restaurantDocRef, { orders }, { merge: true });
        setOrders(orders);

        setName('');
        setEmail('');
        setQuantity('');
        setPrice('');
        setDietaryRestrictions(''); // Reset dietary restrictions field

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
      <h1>Order Details</h1>
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
        <button type="submit">Confirm Order</button>
      </form>
    </div>
  );
}
