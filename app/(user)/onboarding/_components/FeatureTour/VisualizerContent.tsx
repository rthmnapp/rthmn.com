'use client';

import React from 'react';
import { LuClock, LuLayoutGrid } from 'react-icons/lu';
import { TourButton } from './TourButton';

interface VisualizerContentProps {
    onComplete?: () => void;
}

export function VisualizerContent({ onComplete }: VisualizerContentProps) {
    return (
        <div className='no-select w-[350px] overflow-hidden rounded-xl border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-4 shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]'>
            <div className='relative flex h-full flex-col items-end justify-end space-y-2'>
                <div className='w-full p-2'>
                    <h3 className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent'>Timeframe Visualizer</h3>
                    <p className='text-[13px] leading-relaxed text-gray-400'>Customize your chart visualization settings and timeframes.</p>
                </div>
                <div className='space-y-2'>
                    <div className='group relative overflow-hidden rounded-xl transition-all duration-300'>
                        <div className='relative flex items-start gap-3 rounded-xl p-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#3FFFA2]/20 via-[#3FFFA2]/10 to-[#3FFFA2]/5 transition-colors duration-300 group-hover:from-[#3FFFA2]/30'>
                                <LuLayoutGrid className='h-4 w-4 text-[#3FFFA2] transition-colors duration-300 group-hover:text-[#3FFFA2]/80' />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white'>Chart Styles</div>
                                <div className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                                    Customize chart layouts and visualization types
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='group relative overflow-hidden rounded-xl transition-all duration-300'>
                        <div className='relative flex items-start gap-3 rounded-xl p-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#3FFFA2]/20 via-[#3FFFA2]/10 to-[#3FFFA2]/5 transition-colors duration-300 group-hover:from-[#3FFFA2]/30'>
                                <LuClock className='h-4 w-4 text-[#3FFFA2] transition-colors duration-300 group-hover:text-[#3FFFA2]/80' />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white'>Timeframe Control</div>
                                <div className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                                    Adjust time ranges and intervals for your analysis
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <TourButton onClick={onComplete} />
            </div>
        </div>
    );
}
