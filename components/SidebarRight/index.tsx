'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuSettings, LuLineChart, LuGraduationCap } from 'react-icons/lu';
import { usePathname } from 'next/navigation';
import { SidebarWrapper } from '../SidebarWrapper';
import { SettingsBar } from '../SettingsBar';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { FeatureTour } from '../../app/(user)/onboarding/_components/FeatureTour';
import { InstrumentsContent } from '@/app/(user)/onboarding/_components/FeatureTour/InstrumentsContent';
import { Onboarding } from './Onboarding';

export const SidebarRight = () => {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const { currentStepId, setCurrentStep, hasCompletedInitialOnboarding } = useOnboardingStore();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        const handleClickOutside = (event: MouseEvent) => {
            if (!isLocked && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                const isClickInAnySidebar = (event.target as Element).closest('.sidebar-content, .fixed-sidebar');
                if (!isClickInAnySidebar) {
                    setIsOpen(false);
                    setActivePanel(undefined);
                }
            }
        };

        setMounted(true);
        handleResize();

        const state = getSidebarState();
        if (state.right.locked && !isMobile) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.right.activePanel || 'onboarding');
        }

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked, isMobile]);

    useEffect(() => {
        if (hasCompletedInitialOnboarding() && !currentStepId) {
            setCurrentStep('onboarding');
        }
    }, [hasCompletedInitialOnboarding, currentStepId, setCurrentStep]);

    if (!mounted || isMobile || pathname === '/account') return null;

    const handlePanelToggle = (panel: string) => {
        if (isMobile) return;

        if (activePanel === panel) {
            setIsOpen(false);
            setActivePanel(undefined);
            if (isLocked) {
                updateSidebarState(false, undefined, isLocked);
            }
        } else {
            setIsOpen(true);
            setActivePanel(panel);
            if (isLocked) {
                updateSidebarState(true, panel, isLocked);
            }
        }
    };

    const handleClose = () => {
        if (!isLocked) {
            setIsOpen(false);
            setActivePanel(undefined);
        }
    };

    const updateSidebarState = (isOpen: boolean, panel: string | undefined, locked: boolean) => {
        const state = getSidebarState();
        setSidebarState({
            ...state,
            right: {
                isOpen,
                activePanel: panel,
                locked,
            },
        });
    };

    const handleLockToggle = () => {
        const newLockedState = !isLocked;
        setIsLocked(newLockedState);
        updateSidebarState(isOpen, activePanel, newLockedState);
    };

    const buttons = [
        {
            id: 'onboarding',
            icon: LuGraduationCap,
            onClick: () => handlePanelToggle('onboarding'),
            tourContent: <InstrumentsContent />,
            panelContent: <Onboarding />,
        },
        {
            id: 'settings',
            icon: LuSettings,
            onClick: () => handlePanelToggle('settings'),
            tourContent: <InstrumentsContent />,
            panelContent: <SettingsBar />,
        },
    ];

    const renderButtons = () =>
        buttons.map((button) => (
            <FeatureTour key={button.id} icon={button.icon} onClick={button.onClick} isActive={activePanel === button.id} isOpen={isOpen} tourId={button.id} position='right'>
                {button.tourContent}
            </FeatureTour>
        ));

    const renderPanelContent = () => {
        const activeButton = buttons.find((button) => button.id === activePanel);
        return activeButton?.panelContent || null;
    };

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            <div className='fixed top-14 right-0 bottom-0 z-[120] flex w-16 flex-col items-center justify-start border-l border-[#121212] bg-[#0a0a0a] py-4'>
                <div className='flex flex-col gap-2'>{renderButtons()}</div>
            </div>
            <SidebarWrapper
                isOpen={isOpen && !!activePanel}
                onClose={handleClose}
                title={activePanel}
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='right'
                isCurrentTourStep={currentStepId === activePanel}>
                {renderPanelContent()}
            </SidebarWrapper>
        </div>
    );
};
