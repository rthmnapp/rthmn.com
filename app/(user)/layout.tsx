import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { RightSidebar } from '@/components/RightSidebar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardProvider } from '@/providers/DashboardProvider/client';

export default async function UserLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const supabase = await createClient();
    const [user, subscription] = await Promise.all([getUser(supabase), getSubscription(supabase)]);

    if (!user) {
        redirect('/signin');
    }

    if (!subscription) {
        redirect('/pricing');
    }

    return (
        <QueryProvider>
            <WebSocketProvider>
                <DashboardProvider initialSignalsData={[]}>
                    <div className='relative h-screen overflow-x-hidden overflow-y-auto' id='app-container'>
                        <NavbarSignedIn user={user} />
                        <main className='w-full transition-all duration-300 ease-in-out'>{children}</main>
                        <LeftSidebar />
                        <RightSidebar />
                        <DashboardNavigation />
                    </div>
                </DashboardProvider>
            </WebSocketProvider>
        </QueryProvider>
    );
}
