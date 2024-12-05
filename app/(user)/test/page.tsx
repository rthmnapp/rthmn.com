'use client';
import React from 'react';
import PairUniverse from './PairUniverse';
import { useDashboard } from '@/providers/DashboardProvider';
import SplineScene from './SplineScene';

export default function TestPage() {
  const { selectedPairs, pairData } = useDashboard();

  return (
    <main className="h-screen w-screen overflow-hidden">
      <SplineScene />
    </main>
  );
}
