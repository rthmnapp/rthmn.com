'use client';

import React, { createContext, use, useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/SupabaseProvider';
import { wsClient } from '@/providers/WebsocketProvider/websocketClient';
import { BoxSlice, PriceData } from '@/types/types';

interface WebSocketContextType {
    subscribeToBoxSlices: (pair: string, handler: (data: BoxSlice) => void) => void;
    unsubscribeFromBoxSlices: (pair: string) => void;
    isConnected: boolean;
    disconnect: () => void;
    priceData: Record<string, PriceData>;
}

interface WebSocketHandlers {
    handleOpen: () => void;
    handleClose: () => void;
    handleMessage: (event: MessageEvent) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Optimized price data transformation
const transformCandleToPrice = (pair: string, candle: any): PriceData | null => {
    if (candle && typeof candle.close !== 'undefined') {
        return {
            price: candle.close,
            timestamp: candle.timestamp || new Date().toISOString(),
            volume: 0,
        };
    }
    return null;
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const { session } = useAuth();
    const subscriptionsRef = useRef<Map<string, (data: BoxSlice) => void>>(new Map());
    const [priceData, setPriceData] = useState<Record<string, PriceData>>({});

    // Memoized connection initialization
    const initializeConnection = useCallback(() => {
        if (!session?.access_token) return;
        wsClient.setAccessToken(session.access_token);
        wsClient.connect();
    }, [session?.access_token]);

    // Optimized message handlers
    const handleBoxSliceMessage = useCallback((data: any) => {
        const callback = subscriptionsRef.current.get(data.pair);
        if (callback && data.data) {
            callback(data.data);
        }
    }, []);

    const handlePriceMessage = useCallback((data: any) => {
        if (data.type === 'price' && data.pair) {
            setPriceData((prev) => ({
                ...prev,
                [data.pair]: {
                    price: data.data.price,
                    timestamp: data.data.timestamp,
                    volume: data.data.volume,
                },
            }));
        }
    }, []);

    // Memoized WebSocket handlers
    const handlers = useMemo(
        (): WebSocketHandlers => ({
            handleOpen: () => setIsConnected(true),
            handleClose: () => setIsConnected(false),
            handleMessage: (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.type === 'boxSlice') {
                    handleBoxSliceMessage(data);
                } else if (data.type === 'price') {
                    handlePriceMessage(data);
                }
            },
        }),
        [handleBoxSliceMessage, handlePriceMessage]
    );

    // Connection management
    useEffect(() => {
        if (session?.access_token && !isConnected) {
            initializeConnection();
        }
    }, [session?.access_token, isConnected, initializeConnection]);

    // Event handlers setup
    useEffect(() => {
        const { handleOpen, handleClose } = handlers;
        wsClient.onOpen(handleOpen);
        wsClient.onClose(handleClose);
        return () => {
            wsClient.offOpen(handleOpen);
            wsClient.offClose(handleClose);
        };
    }, [handlers]);

    useEffect(() => {
        const { handleMessage } = handlers;
        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    }, [handlers]);

    // Memoized subscription handlers
    const subscribeToBoxSlices = useCallback((pair: string, handler: (data: BoxSlice) => void) => {
        subscriptionsRef.current.set(pair, handler);
        wsClient.subscribe(pair, handler);
    }, []);

    const unsubscribeFromBoxSlices = useCallback((pair: string) => {
        subscriptionsRef.current.delete(pair);
        wsClient.unsubscribe(pair);
    }, []);

    // Memoized context value
    const value = useMemo(
        () => ({
            subscribeToBoxSlices,
            unsubscribeFromBoxSlices,
            isConnected,
            disconnect: () => wsClient.disconnect(),
            priceData,
        }),
        [subscribeToBoxSlices, unsubscribeFromBoxSlices, isConnected, priceData]
    );

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

// Custom hook with proper error handling
export function useWebSocket() {
    const context = use(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
