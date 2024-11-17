'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, type JSX } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { LogoIcon, BellIcon } from '@/components/Accessibility/Icons/icons';

interface NavbarSignedInProps {
  user: User | null;
}

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data: userDetails } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (userDetails?.avatar_url) {
        setAvatarUrl(userDetails.avatar_url);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      //   console.log('Sign out successful');
    } catch (error) {
      //   console.error('Error during sign out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInitial =
    user?.user_metadata?.full_name?.[0].toUpperCase() ||
    user?.email?.[0].toUpperCase() ||
    '?';

  return (
    <nav className="fixed left-0 right-0 top-0 z-[1001] h-16 lg:h-20">
      <div className="h-full w-full px-4">
        <div className="flex h-full items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center">
              <LogoIcon />
            </div>
            <span className={`font-russo text-2xl font-bold tracking-wide`}>
              RTHMN
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white hover:underline"
            >
              Dashboard
            </Link>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[2px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
                <BellIcon />
              </div>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[2px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
              >
                <div className="flex items-center space-x-3 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
                  {/* <div className="py-1 pl-4 pr-1 text-left">
                    <p className="text-[12px] font-semibold">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-[10px] text-gray-300">{user?.email}</p>
                  </div> */}
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        className="object-cover"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <span className="text-lg font-bold">{userInitial}</span>
                    )}
                  </div>
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md border border-[#181818] bg-black shadow-lg ring-1 ring-black ring-opacity-5">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
                      Account
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-100 hover:bg-[#181818]"
                      role="menuitem"
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};