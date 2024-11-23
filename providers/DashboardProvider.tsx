'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { BoxSlice, PairData } from '@/types/types';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import {
  getSelectedPairs,
  setSelectedPairs,
  getBoxColors,
  setBoxColors,
  BoxColors
} from '@/utils/localStorage';

interface DashboardContextType {
  pairData: Record<string, PairData>;
  selectedPairs: string[];
  isLoading: boolean;
  togglePair: (pair: string) => void;
  isConnected: boolean;
  boxColors: BoxColors;
  updateBoxColors: (colors: BoxColors) => void;
  isAuthenticated: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const [selectedPairs, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boxColors, setBoxColorsState] = useState<BoxColors>(getBoxColors());

  const { session } = useAuth();
  const isAuthenticated = !!session?.access_token;

  const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } =
    useWebSocket();

  // Load selected pairs from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    const stored = getSelectedPairs();
    const initialPairs =
      stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
    setSelected(initialPairs);

    if (stored.length === 0) {
      setSelectedPairs(initialPairs);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  // WebSocket subscription management
  useEffect(() => {
    if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

    selectedPairs.forEach((pair) => {
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        setPairData((prev) => ({
          ...prev,
          [pair]: {
            boxes: [wsData],
            currentOHLC: wsData.currentOHLC
          }
        }));
      });
    });

    return () => {
      selectedPairs.forEach((pair) => {
        unsubscribeFromBoxSlices(pair);
      });
    };
  }, [isConnected, selectedPairs, isAuthenticated]);

  const togglePair = (pair: string) => {
    const wasSelected = selectedPairs.includes(pair);
    const newSelected = wasSelected
      ? selectedPairs.filter((p) => p !== pair)
      : [...selectedPairs, pair];

    setSelected(newSelected);
    setSelectedPairs(newSelected);

    // Handle subscription/unsubscription for just the toggled pair
    if (wasSelected) {
      unsubscribeFromBoxSlices(pair);
      setPairData((prev) => {
        const newData = { ...prev };
        delete newData[pair];
        return newData;
      });
    } else if (isConnected) {
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        setPairData((prev) => ({
          ...prev,
          [pair]: {
            boxes: [wsData],
            currentOHLC: wsData.currentOHLC
          }
        }));
      });
    }
  };

  const updateBoxColors = (colors: BoxColors) => {
    setBoxColorsState(colors);
    setBoxColors(colors); // This saves to localStorage
  };

  const value = {
    pairData,
    selectedPairs,
    isLoading,
    togglePair,
    isConnected,
    boxColors,
    updateBoxColors,
    isAuthenticated
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
