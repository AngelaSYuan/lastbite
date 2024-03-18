// _app.js

import { loadStripe } from '@stripe/stripe-js';
import '../styles/geist.css'; // Import the Geist UI CSS file

const stripePromise = loadStripe("pk_test_51OtLFw2NW6lHOE0BZZAo8tivFJpcwlf4BcJ5jVsBfGaytvOfNgDiYev6usuCtfrBTsy6iUXDDXjfujtYwJUGtGCW00CbBqzUMA");

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export { stripePromise };
export default MyApp;

