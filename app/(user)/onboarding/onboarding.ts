'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StepType = 'page' | 'feature-tour';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    type: StepType;
    order: number;
    component?: string; // Path to the component to render for 'page' type
}

// Define all onboarding steps in one place
export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'profile',
        title: 'Profile Setup',
        description: 'Set up your trading profile',
        type: 'page',
        order: 1,
        component: 'ProfileUpload',
    },
    {
        id: 'experience',
        title: 'Trading Experience',
        description: 'Tell us about your trading experience',
        type: 'page',
        order: 2,
        component: 'ExperienceStep',
    },
    {
        id: 'pairs',
        title: 'Select Instruments',
        description: 'Choose your preferred trading pairs',
        type: 'page',
        order: 3,
        component: 'PairsStep',
    },
    {
        id: 'instruments',
        title: 'Instruments',
        description: 'Manage your currency pairs and view performance',
        type: 'feature-tour',
        order: 4,
    },
    {
        id: 'onboarding',
        title: 'Learning Center',
        description: 'Access your selected trading pairs and available markets',
        type: 'feature-tour',
        order: 5,
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'View detailed market analysis and trading insights',
        type: 'feature-tour',
        order: 6,
    },
];

interface OnboardingState {
    currentStepId: string;
    completedSteps: string[];
    userData: {
        photoUrl: string | null;
        experience: string;
        selectedPairs: string[];
    };
    // Actions
    completeStep: (stepId: string, data?: Partial<OnboardingState['userData']>) => void;
    goToNextStep: () => void;
    updateUserData: (data: Partial<OnboardingState['userData']>) => void;
    reset: () => void;
    // Helper functions
    getCurrentStep: () => OnboardingStep | null;
    setCurrentStep: (stepId: string) => void;
    isStepCompleted: (stepId: string) => boolean;
    hasCompletedInitialOnboarding: () => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            currentStepId: ONBOARDING_STEPS[0].id,
            completedSteps: [],
            userData: {
                photoUrl: null,
                experience: '',
                selectedPairs: [],
            },

            completeStep: (stepId, data) => {
                // console.log(`Completing step: ${stepId}`);
                const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
                // console.log(`Step details:`, step);

                set((state) => {
                    const newCompletedSteps = [...state.completedSteps, stepId];
                    // console.log('Updated completed steps:', newCompletedSteps);

                    // Check if this is the last step
                    const isLastStep = stepId === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1].id;

                    return {
                        completedSteps: newCompletedSteps,
                        userData: data ? { ...state.userData, ...data } : state.userData,
                        // Clear currentStepId if this is the last step
                        currentStepId: isLastStep ? '' : state.currentStepId,
                    };
                });
            },

            goToNextStep: () => {
                const state = get();
                const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === state.currentStepId);
                const nextStep = ONBOARDING_STEPS[currentIndex + 1];

                if (nextStep) {
                    set({ currentStepId: nextStep.id });
                }
            },

            updateUserData: (data) => {
                set((state) => ({
                    userData: { ...state.userData, ...data },
                }));
            },

            reset: () => {
                localStorage.removeItem('onboarding-storage');
                set({
                    currentStepId: ONBOARDING_STEPS[0].id,
                    completedSteps: [],
                    userData: {
                        photoUrl: null,
                        experience: '',
                        selectedPairs: [],
                    },
                });
            },

            // Helper functions
            getCurrentStep: () => {
                const state = get();
                return ONBOARDING_STEPS.find((step) => step.id === state.currentStepId) || null;
            },

            setCurrentStep: (stepId) => {
                set({ currentStepId: stepId });
            },

            isStepCompleted: (stepId) => {
                const state = get();
                const isCompleted = state.completedSteps.includes(stepId);
                // console.log(`Checking if step ${stepId} is completed:`, isCompleted);
                // console.log('Current completed steps:', state.completedSteps);
                return isCompleted;
            },

            hasCompletedInitialOnboarding: () => {
                const state = get();
                const pageSteps = ONBOARDING_STEPS.filter((step) => step.type === 'page');
                return pageSteps.every((step) => state.completedSteps.includes(step.id));
            },
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
