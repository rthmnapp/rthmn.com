'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { ChartDataPoint } from '@/components/Charts/CandleChart';
import { Box, BoxSlice } from '@/types/types';
import { PairResoBox } from '@/app/(user)/dashboard/PairResoBox';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import HistogramSimple from '@/components/Charts/Histogram/HistogramSimple';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { ResoBox } from '@/components/Charts/ResoBox';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';

interface ExtendedBoxSlice {
    timestamp: string;
    progressiveValues: {
        high: number;
        low: number;
        value: number;
    }[];
    currentOHLC: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}

interface ChartData {
    processedCandles: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
    histogramBoxes: ExtendedBoxSlice[];
    histogramPreProcessed: {
        maxSize: number;
        initialFramesWithPoints: {
            frameData: {
                boxArray: Box[];
                isSelected: boolean;
                meetingPointY: number;
                sliceWidth: number;
                price: number;
                high: number;
                low: number;
            };
            meetingPointY: number;
            sliceWidth: number;
        }[];
        defaultVisibleBoxesCount: number;
        defaultHeight: number;
    };
}

const AuthClient = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
    const { pairData, isLoading } = useDashboard();
    const { priceData } = useWebSocket();
    const { boxColors } = useUser();
    const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>(chartData.histogramBoxes);
    const [showHistogramLine, setShowHistogramLine] = useState(false);
    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);

    // Convert pair to uppercase for consistency with pairData keys
    const uppercasePair = pair.toUpperCase();
    const currentPrice = priceData[uppercasePair]?.price;
    const boxSlice = pairData[uppercasePair]?.boxes?.[0];

    // Handle timeframe changes for both ResoBox and Histogram
    const handleTimeframeChange = useCallback(
        (property: string, value: number | boolean) => {
            if (pair && typeof value === 'number') {
                updatePairSettings(pair, { [property]: value });
            }
        },
        [pair, updatePairSettings]
    );

    // Initialize timeframe settings
    useEffect(() => {
        if (pair) {
            initializePair(pair);
        }
    }, [pair, initializePair]);

    // Memoize the filtered boxes based on timeframe settings
    const filteredBoxSlice = useMemo(() => {
        if (!boxSlice?.boxes) {
            return undefined;
        }
        return {
            ...boxSlice,
            boxes: boxSlice.boxes.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
        };
    }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

    console.log(filteredBoxSlice);

    return (
        <div className='flex h-screen w-full flex-col bg-[#0a0a0a] pt-14'>
            {/* Main Content Area */}
            <div className='relative flex h-full w-full'>
                {/* Side Panel - PairResoBox */}
                <div className='h-full w-1/4 border-r border-[#222] p-4'>
                    <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                        <div className='relative min-h-[400px] flex-1 p-2 pr-16'>
                            {filteredBoxSlice && boxColors && (
                                <ResoBox slice={filteredBoxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} showPriceLines={settings.showPriceLines} />
                            )}
                        </div>

                        {/* Timeframe Control */}
                        {boxSlice?.boxes && (
                            <div className='mt-4 h-16 w-full'>
                                <TimeFrameSlider startIndex={settings.startIndex} maxBoxCount={settings.maxBoxCount} boxes={boxSlice.boxes} onStyleChange={handleTimeframeChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chart Area */}
                <div className='h-full w-3/4 p-4'>
                    <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                        <div className='mb-4 flex items-center gap-6'>
                            <h1 className='font-outfit text-2xl font-bold tracking-wider text-white'>{uppercasePair}</h1>
                            <div className='font-kodemono text-xl font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, uppercasePair) : '-'}</div>
                        </div>

                        {/* Box Values Table */}
                        {filteredBoxSlice && (
                            <>
                                <div className='font-kodemono mb-2 text-sm text-gray-400'>Timestamp: {new Date(filteredBoxSlice.timestamp).toLocaleString()}</div>
                                <div className='font-kodemono mb-2 text-sm text-gray-400'>
                                    OHLC: O:{filteredBoxSlice.currentOHLC.open.toFixed(5)} H:{filteredBoxSlice.currentOHLC.high.toFixed(5)} L:
                                    {filteredBoxSlice.currentOHLC.low.toFixed(5)} C:{filteredBoxSlice.currentOHLC.close.toFixed(5)}
                                </div>
                                <div className='overflow-auto'>
                                    <table className='w-full border-collapse'>
                                        <thead>
                                            <tr className='border-b border-[#222] text-left'>
                                                <th className='font-kodemono p-2 text-sm text-gray-400'>Box #</th>
                                                <th className='font-kodemono p-2 text-sm text-gray-400'>Value</th>
                                                <th className='font-kodemono p-2 text-sm text-gray-400'>High</th>
                                                <th className='font-kodemono p-2 text-sm text-gray-400'>Low</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBoxSlice.boxes.map((box, index) => (
                                                <tr key={index} className='border-b border-[#222] text-sm hover:bg-[#1a1a1a]'>
                                                    <td className='font-kodemono p-2 text-gray-300'>{index}</td>
                                                    <td className={`font-kodemono p-2 ${box.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>{box.value.toFixed(5)}</td>
                                                    <td className='font-kodemono p-2 text-gray-300'>{box.high.toFixed(5)}</td>
                                                    <td className='font-kodemono p-2 text-gray-300'>{box.low.toFixed(5)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Histogram Section */}
            <div className='relative h-[250px] w-full p-4'>
                <div className='flex items-center justify-end px-4 py-2'>
                    <button
                        onClick={() => setShowHistogramLine(!showHistogramLine)}
                        className={`rounded px-3 py-1 text-sm ${showHistogramLine ? 'bg-white text-black' : 'bg-[#222] text-white'}`}>
                        Show Line
                    </button>
                </div>
                <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                    <HistogramSimple
                        data={histogramData.map((frame) => ({
                            timestamp: frame.timestamp,
                            boxes: frame.progressiveValues,
                            currentOHLC: frame.currentOHLC,
                        }))}
                        boxOffset={settings.startIndex}
                        visibleBoxesCount={settings.maxBoxCount}
                        onOffsetChange={(offset: number) => handleTimeframeChange('startIndex', offset)}
                        showLine={showHistogramLine}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(AuthClient);
