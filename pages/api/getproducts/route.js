import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
        const prices = await stripe.prices.list({
            limit: 4,
        });

        console.log("Prices:", prices); // Log prices to see the response format

        return NextResponse.json(prices.data.reverse());
    } catch (error) {
        console.error("Error fetching prices:", error);
        return NextResponse.error(new Error("Failed to fetch prices"));
        
    }
}
