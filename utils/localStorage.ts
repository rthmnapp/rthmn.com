const SELECTED_PAIRS_KEY = 'selectedPairs';
const SIDEBAR_LOCKS_KEY = 'sidebarLocks';
const SIDEBAR_STATE_KEY = 'sidebarState';

export const DEFAULT_SIDEBAR_LOCKS: { left: boolean; right: boolean } = {
    left: false,
    right: false,
};

export const DEFAULT_SIDEBAR_STATE: {
    left: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
    right: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
} = {
    left: {
        isOpen: false,
        activePanel: undefined,
        locked: false,
    },
    right: {
        isOpen: false,
        activePanel: undefined,
        locked: false,
    },
};

export const getSidebarState = (): {
    left: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
    right: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
} => {
    if (typeof window === 'undefined') return DEFAULT_SIDEBAR_STATE;
    try {
        const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_SIDEBAR_STATE;
    } catch {
        return DEFAULT_SIDEBAR_STATE;
    }
};

export const setSidebarState = (state: {
    left: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
    right: { isOpen: boolean; activePanel: string | undefined; locked: boolean };
}) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
};

export const getSidebarLocks = (): { left: boolean; right: boolean } => {
    if (typeof window === 'undefined') return DEFAULT_SIDEBAR_LOCKS;
    try {
        const stored = localStorage.getItem(SIDEBAR_LOCKS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_SIDEBAR_LOCKS;
    } catch {
        return DEFAULT_SIDEBAR_LOCKS;
    }
};

export const setSidebarLocks = (locks: { left: boolean; right: boolean }) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_LOCKS_KEY, JSON.stringify(locks));
};

export const getSelectedPairs = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SELECTED_PAIRS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const setSelectedPairs = (pairs: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SELECTED_PAIRS_KEY, JSON.stringify(pairs));
};
