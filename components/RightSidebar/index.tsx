'use client';
import React, { useState, useRef, useEffect } from 'react';
import { LuSettings } from 'react-icons/lu';
import { cn } from '@/utils/cn';
import { SettingsBar } from '@/components/SettingsBar';
import { SidebarContent } from '@/components/SidebarContent';

type ActivePanel = 'settings' | null;

export const RightSidebar = () => {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isLocked, setIsLocked] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handlePanelToggle = (panel: ActivePanel) => {
        setActivePanel((prev) => {
            if (prev === panel) {
                setIsLocked(false);
                return null;
            }
            return panel;
        });
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'settings':
                return <SettingsBar />;
            default:
                return null;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isLocked && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Check if the click was inside any sidebar or sidebar toggle
                const isClickInAnySidebar = (event.target as Element).closest('.sidebar-content, .fixed-sidebar');
                if (!isClickInAnySidebar) {
                    setActivePanel(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked]);

    useEffect(() => {
        const handleCloseSidebars = () => {
            if (!isLocked) {
                setActivePanel(null);
            }
        };

        window.addEventListener('closeSidebars', handleCloseSidebars);
        return () => {
            window.removeEventListener('closeSidebars', handleCloseSidebars);
        };
    }, [isLocked]);

    return (
        <>
            <div ref={sidebarRef} className='sidebar-content'>
                <SidebarContent
                    isOpen={activePanel !== null}
                    onClose={() => !isLocked && setActivePanel(null)}
                    title={activePanel === 'settings' ? 'Settings' : 'Tutorial'}
                    isLocked={isLocked}
                    onLockToggle={() => setIsLocked(!isLocked)}
                    position='right'>
                    {renderPanelContent()}
                </SidebarContent>
            </div>

            {/* Fixed Sidebar */}
            <div className='fixed-sidebar top-14 right-0 bottom-0 z-[120] w-16 flex-col items-center justify-between py-4 lg:fixed lg:flex'>
                {/* Settings button */}
                <button
                    onClick={() => handlePanelToggle('settings')}
                    className={cn(
                        'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all duration-200',
                        activePanel === 'settings'
                            ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                            : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                    )}>
                    <LuSettings size={20} className='transition-colors' />
                </button>
            </div>
        </>
    );
};
