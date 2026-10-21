
import { loadStripe } from "@stripe/stripe-js";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.warn(
    "GoCab: VITE_STRIPE_PUBLISHABLE_KEY is missing from frontend/.env"
  );
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : Promise.resolve(null);

export default stripePromise;
