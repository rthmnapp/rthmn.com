'use client';
import React, { useMemo, useEffect } from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { BoxDetailsRow } from '@/components/BoxDetailsRow';
import { PairResoBox } from './PairResoBox';
import { NoInstruments } from './LoadingSkeleton';

export default function Dashboard() {
    const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } = useDashboard();

    // Memoize the filtered data
    const filteredPairData = useMemo(() => {
        return selectedPairs
            .map((pair) => {
                const data = pairData[pair];
                if (!data?.boxes?.length) {
                    return null;
                }
                return data.boxes.map((boxSlice, index) => ({
                    pair,
                    boxSlice,
                    currentOHLC: data.currentOHLC,
                    index,
                }));
            })
            .filter(Boolean)
            .flat();
    }, [selectedPairs, pairData]);

    return (
        <main className='w-full px-4 pt-18'>
            {selectedPairs.length > 0 ? (
                <div className='grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4'>
                    {filteredPairData.map(({ pair, boxSlice, currentOHLC, index }) => (
                        <PairResoBox key={`${pair}-${boxSlice.timestamp}-${index}`} pair={pair} boxSlice={boxSlice} currentOHLC={currentOHLC} boxColors={boxColors} />
                    ))}
                </div>
            ) : (
                <NoInstruments />
            )}
        </main>
    );
}
