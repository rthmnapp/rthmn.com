'use client';
import React, { useState, useMemo } from 'react';
import { LuChevronDown, LuChevronUp, LuBox, LuLayoutGrid, LuLineChart } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider/client';
import type { BoxColors } from '@/types/types';
import { cn } from '@/utils/cn';
import { TimeFrameVisualizer } from './Visualizers';
import { getTimeframeRange } from '@/utils/timeframe';

export const VisualizersView = () => {
    const { boxColors, updateBoxColors } = useDashboard();
    const [showtimeframe, setShowtimeframe] = useState(true);
    const [showChartStyle, setShowChartStyle] = useState(true);

    // Calculate timeframe range based on current settings
    const timeframeRange = useMemo(() => {
        const startIndex = boxColors.styles?.startIndex ?? 0;
        const maxBoxCount = boxColors.styles?.maxBoxCount ?? 10;
        return getTimeframeRange(startIndex, startIndex + maxBoxCount);
    }, [boxColors.styles?.startIndex, boxColors.styles?.maxBoxCount]);

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!boxColors.styles) return;
        updateBoxColors({
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        });
    };

    return (
        <div className='flex h-full flex-col'>
            <div className='flex-1 overflow-y-visible'>
                <div className='flex flex-col gap-2'>
                    {/* Colors Section Toggle */}

                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => setShowChartStyle(!showChartStyle)}
                            className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                    <LuLineChart size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                </div>
                                <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                    Chart Style
                                </span>
                            </div>
                            {showChartStyle ? (
                                <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            ) : (
                                <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            )}
                        </button>

                        {showChartStyle && (
                            <div className='grid grid-cols-2 gap-2'>
                                {/* Box Style Option */}
                                <button
                                    onClick={() => handleStyleChange('showLineChart', false)}
                                    className={cn(
                                        'group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
                                        !boxColors.styles?.showLineChart
                                            ? 'border-[#333] from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90'
                                            : 'border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#333] hover:from-[#181818]/40 hover:to-[#0F0F0F]/50'
                                    )}>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuBox size={20} className={cn('transition-colors', !boxColors.styles?.showLineChart ? 'text-white' : 'text-[#666]')} />
                                    </div>
                                    <span className='font-kodemono text-[8px] font-medium tracking-widest text-[#666] uppercase transition-colors group-hover:text-[#818181]'>
                                        Box
                                    </span>
                                </button>

                                {/* Line Style Option */}
                                <button
                                    onClick={() => handleStyleChange('showLineChart', true)}
                                    className={cn(
                                        'group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
                                        boxColors.styles?.showLineChart
                                            ? 'border-[#333] from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90'
                                            : 'border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#333] hover:from-[#181818]/40 hover:to-[#0F0F0F]/50'
                                    )}>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuLineChart size={20} className={cn('transition-colors', boxColors.styles?.showLineChart ? 'text-white' : 'text-[#666]')} />
                                    </div>
                                    <span className='font-kodemono text-[8px] font-medium tracking-widest text-[#666] uppercase transition-colors group-hover:text-[#818181]'>
                                        Line
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Box Styles Section */}
                    <div className='flex flex-col gap-2'>
                        {/* timeframe Section */}
                        <div className='flex flex-col gap-2'>
                            <button
                                onClick={() => setShowtimeframe(!showtimeframe)}
                                className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuLayoutGrid size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                    </div>
                                    <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                        timeframe
                                    </span>
                                </div>
                                {showtimeframe ? (
                                    <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                ) : (
                                    <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                )}
                            </button>

                            {showtimeframe && (
                                <>
                                    <div className='flex items-center justify-between px-1 py-2'>
                                        <div className='space-y-1'>
                                            <span className='font-kodemono text-[10px] font-medium tracking-wider text-white/50 uppercase'>Global Control</span>
                                        </div>
                                        <button
                                            onClick={() => handleStyleChange('globalTimeframeControl', !boxColors.styles?.globalTimeframeControl)}
                                            className={`relative h-4 w-9 rounded-full transition-all duration-300 ${
                                                boxColors.styles?.globalTimeframeControl ? 'bg-white/20' : 'bg-white/[0.03]'
                                            }`}>
                                            <div
                                                className={`absolute top-0.5 right-0.5 h-3 w-3 rounded-full transition-all duration-300 ${
                                                    boxColors.styles?.globalTimeframeControl ? 'left-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'left-1 bg-white/50'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <TimeFrameVisualizer
                                        startIndex={boxColors.styles?.startIndex ?? 0}
                                        maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                                        boxes={[]}
                                        onStyleChange={handleStyleChange}
                                        timeframeRange={timeframeRange}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
