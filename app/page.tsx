'use client';

import { SectionHero } from '@/app/_components/SectionHero';
import { SectionFeatures } from '@/app/_components/SectionFeatures';
import { SectionPricing } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import { getProducts, getSubscription } from '@/utils/supabase/queries';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RootPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<any[] | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const supabase = createClient();
        const productsResult = await getProducts(supabase);
        if (productsResult) setProducts(productsResult);
        const subscriptionResult = await getSubscription(supabase);
        setSubscription(subscriptionResult);
      }
      setLoading(false);
    };

    fetchData();
  }, [session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen">
      <SectionHero />
      <SectionFeatures />
      {/* 	<FAQSection />
				<ServiceSection /> */}
      {/* <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={subscription}
      /> */}
      {/* <div className="h-screen"></div>
			<RyverSection />
			<div className="h-screen"></div> */}
      {session && (
        <div>
          <p>Welcome, {session.user.email}</p>
          {/* Add more user details as needed */}
        </div>
      )}
    </div>
  );
}
