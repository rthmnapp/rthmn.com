import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

export const getUser = cache(async (supabase: SupabaseClient) => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
	const { data: subscription } = await supabase
		.from("subscriptions")
		.select("*, prices(*, products(*))")
		.in("status", ["trialing", "active"])
		.maybeSingle();

	return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
	const { data: products, error } = await supabase
		.from("products")
		.select("*, prices(*)")
		.eq("active", true)
		.eq("prices.active", true)
		.order("metadata->index")
		.order("unit_amount", { referencedTable: "prices" });

	return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
	const { data: userDetails } = await supabase
		.from("users")
		.select("*")
		.single();
	return userDetails;
});

export const getSignals = cache(async (supabase: SupabaseClient) => {
	const { data: signals, error } = await supabase.from("signals").select("*");

	if (error) {
		console.error("Error fetching signals:", error);
	}

	return signals;
});
