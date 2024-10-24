'use client';

import { SectionHero } from '@/app/_components/SectionHero';
import { SectionFeatures } from '@/app/_components/SectionFeatures';
import { SectionPricing } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { PostList, Post } from '@/app/_components/PostList';
import { useAuth } from '@/providers/SupabaseProvider';
import { Session } from '@supabase/supabase-js';

interface ClientPageProps {
  posts: any[];
  products: any[] | null;
  subscription: any | null;
  session: Session | null;
}

export default function ClientPage({
  posts,
  products,
  subscription,
  session
}: ClientPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <SectionHero />
      <SectionFeatures />
      <div className="container mx-auto px-4">
        <PostList initialPosts={posts} />
      </div>
      {/* <FAQSection />
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
