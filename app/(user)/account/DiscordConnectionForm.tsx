'use client';

import { createClient } from '@/utils/supabase/client';
import { FaDiscord, FaLink, FaUnlink } from 'react-icons/fa';
import { useState } from 'react';
import { Database } from '@/types/supabase';

type DiscordConnection = Database['public']['Tables']['discord_connections']['Row'];

const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify`;

export default function DiscordConnectionForm({ discordConnection, subscription }: { discordConnection: DiscordConnection | null; subscription: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleDisconnect = async () => {
        try {
            setIsLoading(true);

            await fetch('/api/discord/disconnect', {
                method: 'POST',
                body: JSON.stringify({
                    discord_user_id: discordConnection?.discord_user_id,
                }),
            });

            await supabase
                .from('discord_connections')
                .delete()
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

            window.location.reload();
        } catch (error) {
            console.error('Error disconnecting Discord:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='rounded-md bg-white/5 p-2'>
                    <FaDiscord className='h-5 w-5 text-[#5865F2]' />
                </div>
                <div>
                    <h3 className='font-outfit text-lg font-semibold text-white'>Discord Connection</h3>
                    <p className='font-outfit text-sm text-zinc-400'>{discordConnection ? `Connected as ${discordConnection.discord_username}` : 'Connect your Discord account'}</p>
                </div>
            </div>

            {discordConnection ? (
                <button
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className='flex items-center gap-2 rounded-full bg-red-500/10 px-6 py-2 text-red-500 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50'>
                    <span className='font-outfit text-sm'>{isLoading ? 'Disconnecting...' : 'Disconnect'}</span>
                </button>
            ) : (
                <button
                    onClick={() => (window.location.href = DISCORD_OAUTH_URL)}
                    className='flex items-center gap-2 rounded-full bg-[#5865F2] px-6 py-2 text-white transition-all duration-200 hover:bg-[#4752C4]'>
                    <span className='font-outfit text-sm'>Connect Discord</span>
                </button>
            )}
        </div>
    );
}
