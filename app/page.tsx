import { HeroSection } from "@/app/_components/SectionHero";
import { FeaturesSection } from "@/app/_components/SectionFeatures";
import { PricingSection } from "@/app/_components/SectionPricing";
import { RyverSection } from "@/app/_components/SectionRyver";
import {
	getProducts,
	getSubscription,
	getUser,
} from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";
import { FAQSection } from "@/app/_components/SectionFAQ";
import { ServiceSection } from "@/app/_components/SectionServices"

export default async function PricingPage() {
	const supabase = createClient();
	const [user, products, subscription] = await Promise.all([
		getUser(supabase),
		getProducts(supabase),
		getSubscription(supabase),
	]);

	return (
		<div>
			<HeroSection />
			{/* <FeaturesSection />
			<FAQSection />
			<ServiceSection /> */}
			{/* <PricingSection
        user={user}
        products={products ?? []}
        subscription={subscription}
      /> */}
			{/* <div className="h-screen"></div>
			<RyverSection />
			<div className="h-screen"></div> */}
		</div>
	);
}
