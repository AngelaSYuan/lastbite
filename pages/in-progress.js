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
  const [orders, setOrders] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Get restaurant name from the session storage
    let restaurantName = sessionStorage.getItem('selectedRestaurant');
    restaurantName = restaurantName.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
    const packageType = sessionStorage.getItem('packageType');
    console.log(restaurantName);
    console.log(packageType);


    const formatFirestoreTimestamp = (firestoreTimestamp) => {
      const date = new Date(firestoreTimestamp.seconds * 1000); // Convert seconds to milliseconds
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
      const db = getFirestore(); // Initialize Firestore with your Firebase instance

      // Query the restaurants collection for the restaurant with the matching name
      const restaurantQuery = query(collection(db, 'restaurants'), where('name', '==', restaurantName));
      //const restaurantSnapshot = await getDocs(restaurantQuery);

      const restaurantDocRef = doc(db, 'restaurants', restaurantName);
      const restaurantDocSnapshot = await getDoc(restaurantDocRef);
      let orders = [];

      if (restaurantDocSnapshot.exists()) {
        const restaurantData = restaurantDocSnapshot.data();
        orders = restaurantData.orders || [];
        orders.push({ name, email, quantity, price, packageType, time });
      
        await setDoc(restaurantDocRef, { orders }, { merge: true });

        setOrders(orders);


        // const orderData = {
        //   name,
        //   email,
        //   quantity: parseInt(quantity),
        //   price: parseFloat(price),
        //   packageType: packageType,
        // };

        // Use orderData along with existing orders data when updating the document
        // await setDoc(restaurantRef, {
        //   orders: firebase.firestore.FieldValue.arrayUnion(orderData)
        // }, { merge: true });

        // Reset form fields after successful submission
        setName('');
        setEmail('');
        setQuantity('');
        setPrice('');

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
          Quantity:
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        <br />
        <label>
          Price:
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Confirm Order</button>
      </form>
    </div>
  );
}
