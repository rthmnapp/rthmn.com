'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatTime } from '@/utils/dateUtils';
import { INSTRUMENTS } from '@/utils/instruments';
import { useColorStore } from '@/stores/colorStore';

interface ChartDataResult {
    visibleData: ChartDataPoint[];
    minY: number;
    maxY: number;
}

export interface ChartDataPoint {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    scaledX: number;
    scaledY: number;
    scaledOpen: number;
    scaledHigh: number;
    scaledLow: number;
    scaledClose: number;
}

export const useChartData = (data: ChartDataPoint[], scrollLeft: number, chartWidth: number, chartHeight: number, yAxisScale: number, visiblePoints: number): ChartDataResult => {
    return useMemo(() => {
        if (!data.length || !chartWidth || !chartHeight) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Calculate how many points can fit in the visible area
        const pointWidth = Math.max(2, chartWidth / visiblePoints); // Ensure minimum width of 2px per point

        const RIGHT_MARGIN = chartWidth * 0.1;
        const totalWidth = chartWidth + RIGHT_MARGIN;

        // Calculate visible range based on scroll position
        const startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth));
        const endIndex = Math.min(data.length, Math.ceil((scrollLeft + totalWidth) / pointWidth));
        const visibleData = data.slice(startIndex, endIndex);

        if (!visibleData.length) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Find min/max prices in visible range with a small context buffer
        const contextStartIndex = Math.max(0, startIndex - Math.floor(visiblePoints * 0.1));
        const contextEndIndex = Math.min(data.length, endIndex + Math.floor(visiblePoints * 0.1));
        const contextData = data.slice(contextStartIndex, contextEndIndex);

        let minPrice = Infinity;
        let maxPrice = -Infinity;
        contextData.forEach((point) => {
            minPrice = Math.min(minPrice, point.low);
            maxPrice = Math.max(maxPrice, point.high);
        });

        // Calculate the center price for the visible range
        const centerPrice = (minPrice + maxPrice) / 2;

        // Calculate the price range based on the visible data and scale
        const baseRange = maxPrice - minPrice;
        const scaledRange = baseRange / yAxisScale;

        // Add a small padding (5%) to prevent prices from touching the edges
        const padding = scaledRange * 0.05;
        const paddedMin = centerPrice - scaledRange / 2 - padding;
        const paddedMax = centerPrice + scaledRange / 2 + padding;

        // Scale the data points
        const scaledData = visibleData.map((point, i) => {
            const scaledX = i * (chartWidth / visibleData.length);
            const scaleY = (price: number) => {
                const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
                return chartHeight * (1 - normalizedPrice);
            };

            return {
                ...point,
                scaledX,
                scaledY: scaleY(point.close),
                scaledOpen: scaleY(point.open),
                scaledHigh: scaleY(point.high),
                scaledLow: scaleY(point.low),
                scaledClose: scaleY(point.close),
            };
        });

        return {
            visibleData: scaledData,
            minY: paddedMin,
            maxY: paddedMax,
        };
    }, [data, scrollLeft, chartWidth, chartHeight, yAxisScale, visiblePoints]);
};

const CHART_CONFIG = {
    VISIBLE_POINTS: 1000,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 2,
    PADDING: { top: 20, right: 70, bottom: 40, left: 0 },
    COLORS: {
        AXIS: '#ffffff',
        HOVER_BG: '#fff',
        LAST_PRICE: '#2563eb',
    },
    Y_AXIS: {
        MIN_PRICE_HEIGHT: 50,
        LABEL_WIDTH: 65,
    },
    CANDLES: {
        MIN_WIDTH: 2,
        MAX_WIDTH: 15,
        MIN_SPACING: 1,
        WICK_WIDTH: 1.5,
        GAP_RATIO: 0.4, // 40% gap between candles
    },
    BOX_LEVELS: {
        LINE_WIDTH: 4, // Moderate line width
        GAP_RATIO: 0.4, // 40% gap between box lines
    },
} as const;

// Add this hook at the top of the file after imports
const useInstrumentConfig = (pair: string) => {
    return useMemo(() => {
        const upperPair = pair.toUpperCase();
        // Search in all instrument categories
        for (const category of Object.values(INSTRUMENTS)) {
            if (category[upperPair]) {
                return category[upperPair];
            }
        }
        console.warn(`No instrument configuration found for ${upperPair}, using default`);
        return { point: 0.00001, digits: 5 };
    }, [pair]);
};

// Core chart components
const CandleSticks = memo(({ data, width, height }: { data: ChartDataPoint[]; width: number; height: number }) => {
    const { boxColors } = useColorStore();

    // Calculate candle width to use 80% of available space (leaving 20% for gaps)
    const candleWidth = Math.max(CHART_CONFIG.CANDLES.MIN_WIDTH, Math.min(CHART_CONFIG.CANDLES.MAX_WIDTH, (width / data.length) * (1 - CHART_CONFIG.CANDLES.GAP_RATIO)));
    const halfCandleWidth = candleWidth / 2;

    // Filter visible candles before mapping
    const visibleCandles = data.filter((point) => {
        const isVisible = point.scaledX >= -candleWidth && point.scaledX <= width + candleWidth;
        return isVisible;
    });

    return (
        <g>
            {visibleCandles.map((point, i) => {
                const candle = point.close > point.open;
                const candleColor = candle ? boxColors.positive : boxColors.negative;

                const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                    <g key={point.timestamp} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                        <line x1={halfCandleWidth} y1={point.scaledHigh} x2={halfCandleWidth} y2={bodyTop} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <line x1={halfCandleWidth} y1={bodyBottom} x2={halfCandleWidth} y2={point.scaledLow} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <rect x={0} y={bodyTop} width={candleWidth} height={bodyHeight} fill='none' stroke={candleColor} strokeWidth={1} />
                    </g>
                );
            })}
        </g>
    );
});

// Update BoxLevels props interface
interface BoxLevelsProps {
    data: ChartDataPoint[];
    histogramBoxes: any[];
    width: number;
    height: number;
    yAxisScale: number;
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
}

// Add this new component after CandleSticks
const BoxLevels = memo(({ data, histogramBoxes, width, height, yAxisScale, boxOffset, visibleBoxesCount, boxVisibilityFilter }: BoxLevelsProps) => {
    const { boxColors } = useColorStore();

    if (!histogramBoxes?.length || !data.length) return null;

    // Get the timestamp of the most recent candle
    const lastCandleTime = data[data.length - 1].timestamp;
    const oneHourAgo = lastCandleTime - 60 * 120 * 1000;

    // Create a map of timestamp to candle data for scaling
    const candleMap = new Map(data.map((point) => [point.timestamp, point]));

    // Find min/max prices in visible range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    data.forEach((point) => {
        minPrice = Math.min(minPrice, point.low);
        maxPrice = Math.max(maxPrice, point.high);
    });

    // Calculate the center price and range (same as useChartData)
    const centerPrice = (minPrice + maxPrice) / 2;
    const baseRange = maxPrice - minPrice;
    const scaledRange = baseRange / yAxisScale;
    const padding = scaledRange * 0.05;
    const paddedMin = centerPrice - scaledRange / 2 - padding;
    const paddedMax = centerPrice + scaledRange / 2 + padding;

    // Get boxes from the last hour relative to the last candle
    const recentBoxes = histogramBoxes.filter((box) => {
        const boxTime = new Date(box.timestamp).getTime();
        return boxTime >= oneHourAgo && boxTime <= lastCandleTime;
    });

    if (!recentBoxes.length) return null;

    // Calculate line width with gap
    const lineWidth = CHART_CONFIG.BOX_LEVELS.LINE_WIDTH;
    const gapWidth = lineWidth * CHART_CONFIG.BOX_LEVELS.GAP_RATIO;
    const totalLineWidth = lineWidth + gapWidth;

    // Process each box to get its position and dimensions
    const processedBoxes = recentBoxes
        .map((box) => {
            const boxTime = new Date(box.timestamp).getTime();
            const candle = candleMap.get(boxTime);
            if (!candle) return null;

            // Use the exact same scaling function as useChartData
            const scaleY = (price: number) => {
                const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
                return height * (1 - normalizedPrice);
            };

            // --- Start: Reverted Logic (Slice first, then filter visibility) ---
            // 1. Slice the boxes based on timeframe *first*. The input `box.boxes`
            //    is now assumed to be sorted by absolute value from processProgressiveBoxValues.
            const slicedBoxes = [...box.boxes].slice(boxOffset, boxOffset + visibleBoxesCount).map((level: any, boxIndex: number) => ({
                ...level,
                id: `${boxTime}-${boxIndex}-${level.high}-${level.low}-${level.value}`,
                scaledHigh: scaleY(level.high),
                scaledLow: scaleY(level.low),
            }));

            return {
                timestamp: boxTime,
                xPosition: candle.scaledX,
                boxes: slicedBoxes, // Use the sliced (but not yet visibility-filtered) boxes
            };
        })
        .filter(Boolean);

    return (
        <g className='box-levels'>
            {processedBoxes.map((boxFrame, index) => {
                // 2. Apply visibility filter *after* slicing
                const filteredLevels = boxFrame.boxes.filter((level) => {
                    if (boxVisibilityFilter === 'positive') {
                        return level.value > 0;
                    }
                    if (boxVisibilityFilter === 'negative') {
                        return level.value < 0;
                    }
                    return true; // 'all'
                });

                // If no levels are visible after filtering, skip rendering this frame
                if (filteredLevels.length === 0) {
                    return null;
                }

                return (
                    <g key={`${boxFrame.timestamp}-${index}`} transform={`translate(${boxFrame.xPosition}, 0)`}>
                        {/* Map over the FILTERED levels */}
                        {filteredLevels.map((level) => {
                            const color = level.value > 0 ? boxColors.positive : boxColors.negative;
                            const opacity = 0.8;

                            return (
                                <g key={level.id}>
                                    {/* Draw horizontal lines at exact high and low points with gaps */}
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledHigh}
                                        x2={lineWidth / 2}
                                        y2={level.scaledHigh}
                                        stroke={color}
                                        strokeWidth={1.5}
                                        strokeOpacity={opacity}
                                    />
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledLow}
                                        x2={lineWidth / 2}
                                        y2={level.scaledLow}
                                        stroke={color}
                                        strokeWidth={1.5}
                                        strokeOpacity={opacity}
                                    />
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </g>
    );
});

const CandleChart = ({
    candles = [],
    initialVisibleData,
    pair,
    histogramBoxes = [],
    boxOffset = 0,
    visibleBoxesCount = 7,
    boxVisibilityFilter = 'all',
    hoveredTimestamp,
    onHoverChange,
}: {
    candles?: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
    pair: string;
    histogramBoxes?: any[];
    boxOffset?: number;
    visibleBoxesCount?: number;
    boxVisibilityFilter?: 'all' | 'positive' | 'negative';
    hoveredTimestamp?: number | null;
    onHoverChange?: (timestamp: number | null) => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [yAxisScale, setYAxisScale] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isYAxisDragging, setIsYAxisDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);

    const chartPadding = CHART_CONFIG.PADDING;
    const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
    const chartHeight = dimensions.height - chartPadding.top - chartPadding.bottom;

    // Get chart data directly
    const { visibleData, minY, maxY } = useChartData(candles, scrollLeft, chartWidth, chartHeight, yAxisScale, CHART_CONFIG.VISIBLE_POINTS);

    // Update dimension effect to use parent's full dimensions
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const rect = parent.getBoundingClientRect();
                    setDimensions({
                        width: rect.width,
                        height: rect.height,
                    });
                }
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const handleYAxisDrag = useCallback(
        (deltaY: number) => {
            setYAxisScale((prev) => {
                const newScale = prev * (1 - deltaY * 0.7);
                const minScale = CHART_CONFIG.MIN_ZOOM;
                const maxScale = Math.min(
                    CHART_CONFIG.MAX_ZOOM,
                    // Prevent scaling that would make prices too close together
                    chartHeight / CHART_CONFIG.Y_AXIS.MIN_PRICE_HEIGHT
                );
                return Math.max(minScale, Math.min(maxScale, newScale));
            });
        },
        [chartHeight]
    );

    // Optimize drag handlers with throttling
    const dragHandlers = useMemo(() => {
        let lastDragTime = 0;
        let lastScrollUpdate = 0;
        const THROTTLE_MS = 16; // Approx. 60fps

        const updateScroll = (clientX: number) => {
            const now = Date.now();
            if (now - lastScrollUpdate < THROTTLE_MS) return;

            const deltaX = clientX - dragStart;
            const maxScroll = Math.max(0, candles.length * (CHART_CONFIG.CANDLES.MIN_WIDTH + CHART_CONFIG.CANDLES.MIN_SPACING) - chartWidth);
            const newScrollLeft = Math.max(0, Math.min(maxScroll, scrollStart - deltaX));

            setScrollLeft(newScrollLeft);
            lastScrollUpdate = now;
        };

        return {
            onMouseDown: (event: React.MouseEvent) => {
                if (!isYAxisDragging) {
                    event.preventDefault();
                    setIsDragging(true);
                    setDragStart(event.clientX);
                    setScrollStart(scrollLeft);
                    lastDragTime = Date.now();
                }
            },
            onMouseMove: (event: React.MouseEvent) => {
                if (isDragging && !isYAxisDragging) {
                    event.preventDefault();
                    const now = Date.now();
                    if (now - lastDragTime < THROTTLE_MS) return;
                    lastDragTime = now;
                    updateScroll(event.clientX);
                }
            },
            onMouseUp: () => {
                setIsDragging(false);
            },
            onMouseLeave: () => {
                setIsDragging(false);
            },
        };
    }, [isDragging, isYAxisDragging, dragStart, scrollStart, chartWidth, candles.length, scrollLeft]);

    // --- Derive displayed hover info from the hoveredTimestamp prop ---
    const displayedHoverInfo = useMemo(() => {
        if (hoveredTimestamp === null || !visibleData || visibleData.length === 0 || !chartHeight || !minY || !maxY) {
            return null;
        }

        // Find the visible data point matching the timestamp
        const point = visibleData.find((p) => p.timestamp === hoveredTimestamp);

        if (point) {
            // Calculate Y position based on the point's *actual* close price,
            // rather than trying to guess from a potentially inaccurate cursor Y
            // (especially if hover originated elsewhere)
            const yRatio = (point.close - minY) / (maxY - minY);
            const y = chartHeight * (1 - yRatio);

            return {
                x: point.scaledX, // Use the point's calculated X
                y: y, // Use the point's price-derived Y
                price: point.close, // Show the point's closing price
                time: formatTime(new Date(point.timestamp)),
                // Add raw timestamp if needed by subcomponents
                timestamp: point.timestamp,
            };
        }

        return null; // No matching point found in visible data
    }, [hoveredTimestamp, visibleData, chartHeight, minY, maxY]);

    // Update hover handlers to use shared state
    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging || !onHoverChange) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;

                if (x >= 0 && x <= chartWidth) {
                    // Find the closest data point based on X coordinate
                    let closestPoint: ChartDataPoint | null = null;
                    let minDist = Infinity;

                    visibleData.forEach((point) => {
                        const dist = Math.abs(point.scaledX - x);
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                        }
                    });

                    if (closestPoint) {
                        // Call the shared handler with the timestamp
                        onHoverChange(closestPoint.timestamp);
                    } else {
                        onHoverChange(null); // No close point found
                    }
                } else {
                    onHoverChange(null); // Cursor is outside chart area
                }
            },
            onMouseLeave: () => {
                if (onHoverChange) {
                    onHoverChange(null);
                }
            },
        }),
        [isDragging, chartWidth, chartPadding.left, visibleData, onHoverChange] // Add onHoverChange dependency
    );

    return (
        <div
            ref={containerRef}
            className='absolute inset-0 h-full overflow-hidden'
            onMouseDown={dragHandlers.onMouseDown}
            onMouseMove={dragHandlers.onMouseMove}
            onMouseUp={dragHandlers.onMouseUp}
            onMouseLeave={dragHandlers.onMouseLeave}>
            {(!chartWidth || !chartHeight) && initialVisibleData ? (
                <svg width='100%' height='100%' className='min-h-[500px]'>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <CandleSticks data={initialVisibleData} width={1000} height={500} />
                    </g>
                </svg>
            ) : visibleData.length > 0 ? (
                <svg
                    width='100%'
                    height='100%'
                    className='min-h-[500px]'
                    onMouseMove={hoverHandlers.onSvgMouseMove}
                    onMouseLeave={hoverHandlers.onMouseLeave}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <BoxLevels
                            data={visibleData}
                            histogramBoxes={histogramBoxes}
                            width={chartWidth}
                            height={chartHeight}
                            yAxisScale={yAxisScale}
                            boxOffset={boxOffset}
                            visibleBoxesCount={visibleBoxesCount}
                            boxVisibilityFilter={boxVisibilityFilter}
                        />
                        <CandleSticks data={visibleData} width={chartWidth} height={chartHeight} />
                        <XAxis data={visibleData} chartWidth={chartWidth} chartHeight={chartHeight} hoverInfo={displayedHoverInfo} formatTime={formatTime} />
                        <YAxis
                            minY={minY}
                            maxY={maxY}
                            chartHeight={chartHeight}
                            chartWidth={chartWidth}
                            onDrag={handleYAxisDrag}
                            hoverInfo={displayedHoverInfo}
                            onYAxisDragStart={() => setIsYAxisDragging(true)}
                            onYAxisDragEnd={() => setIsYAxisDragging(false)}
                            pair={pair}
                            lastPrice={visibleData[visibleData.length - 1].close}
                            lastPriceY={visibleData[visibleData.length - 1].scaledClose}
                        />
                        {displayedHoverInfo && <HoverInfoComponent x={displayedHoverInfo.x} y={displayedHoverInfo.y} chartHeight={chartHeight} chartWidth={chartWidth} />}
                    </g>
                </svg>
            ) : (
                <div className='flex h-full items-center justify-center text-gray-400'>No data to display</div>
            )}
        </div>
    );
};

export default CandleChart;

const XAxis: React.FC<{
    data: ChartDataPoint[];
    chartWidth: number;
    chartHeight: number;
    hoverInfo: any | null;
    formatTime: (date: Date) => string;
}> = memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
    const TICK_HEIGHT = 6;
    const LABEL_PADDING = 5;
    const FONT_SIZE = 12;
    const HOVER_BG_HEIGHT = 15;

    const intervals = useMemo(() => {
        if (data.length === 0) return [];

        const hourMs = 60 * 60 * 1000;
        const firstTime = new Date(data[0].timestamp);
        const startTime = new Date(firstTime).setMinutes(0, 0, 0);
        const endTime = data[data.length - 1].timestamp;
        const result = [];

        for (let time = startTime; time <= endTime; time += hourMs) {
            const closestPoint = data.reduce((prev, curr) => (Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev));
            result.push(closestPoint);
        }

        // Show fewer labels for better spacing
        const maxPoints = chartWidth < 400 ? 4 : 6;
        if (result.length > maxPoints) {
            const step = Math.ceil(result.length / maxPoints);
            return result.filter((_, i) => i % step === 0);
        }

        return result;
    }, [data, chartWidth]);

    if (data.length === 0) return null;

    // Calculate Y positions for consistent alignment
    const labelY = TICK_HEIGHT + LABEL_PADDING + FONT_SIZE;
    const hoverY = TICK_HEIGHT + LABEL_PADDING;

    return (
        <g className='x-axis'>
            {/* Main axis line */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke='#777' strokeWidth='1' />

            {/* Time intervals */}
            {intervals.map((point, index) => (
                <g key={`time-${point.timestamp}-${index}`} transform={`translate(${point.scaledX}, ${chartHeight})`}>
                    <line y2={TICK_HEIGHT} stroke='#777' strokeWidth='1' />
                    <text y={labelY} textAnchor='middle' fill='#fff' fontSize={FONT_SIZE} style={{ userSelect: 'none' }}>
                        {formatTime(new Date(point.timestamp))}
                    </text>
                </g>
            ))}

            {/* Hover time indicator */}
            {hoverInfo && (
                <g transform={`translate(${hoverInfo.x}, ${chartHeight})`}>
                    <rect x={-40} y={hoverY} width={80} height={HOVER_BG_HEIGHT} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text
                        x={0}
                        y={hoverY + HOVER_BG_HEIGHT / 2 + FONT_SIZE / 3}
                        textAnchor='middle'
                        fill='black'
                        fontSize={FONT_SIZE}
                        fontWeight='bold'
                        style={{ userSelect: 'none' }}>
                        {hoverInfo.time}
                    </text>
                </g>
            )}
        </g>
    );
});

interface YAxisProps {
    minY: number;
    maxY: number;
    chartHeight: number;
    chartWidth: number;
    onDrag: (deltaY: number) => void;
    hoverInfo: any | null;
    onYAxisDragStart: () => void;
    onYAxisDragEnd: () => void;
    pair: string;
    lastPrice: number;
    lastPriceY: number;
}

const YAxis: React.FC<YAxisProps> = ({ minY, maxY, chartHeight, chartWidth, onDrag, hoverInfo, onYAxisDragStart, onYAxisDragEnd, pair, lastPrice, lastPriceY }) => {
    const handleMouseDown = (event: React.MouseEvent) => {
        event.stopPropagation();
        onYAxisDragStart();
        const startY = event.clientY;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = (e.clientY - startY) / chartHeight;
            onDrag(deltaY);
        };

        const handleMouseUp = () => {
            onYAxisDragEnd();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const instrumentConfig = useInstrumentConfig(pair);

    // Generate price levels with fixed pip intervals
    const PIP_SIZE = instrumentConfig.point * 10; // Adjust for actual pip size (point is usually 0.00001, pip is 0.0001)
    const priceRange = maxY - minY;

    // Calculate a reasonable number of price levels based on chart height
    const MIN_PRICE_SPACING = 40; // Increased from 30 for better readability
    const maxLevels = Math.floor(chartHeight / MIN_PRICE_SPACING);

    // Calculate pip interval to achieve desired number of levels
    const pipsInRange = priceRange / PIP_SIZE;
    const pipInterval = Math.ceil(pipsInRange / maxLevels / 5) * 5; // Round to nearest 5 pips
    const PRICE_INTERVAL = PIP_SIZE * pipInterval;

    // Calculate price levels centered around the last price
    const numLevelsAboveBelow = Math.floor(maxLevels / 2);
    const centerPrice = lastPrice;
    const startPrice = Math.floor(centerPrice / PRICE_INTERVAL) * PRICE_INTERVAL;

    const levels = [];
    // Add levels below center
    for (let i = 0; i <= numLevelsAboveBelow; i++) {
        const price = startPrice - i * PRICE_INTERVAL;
        const y = chartHeight - ((price - minY) / priceRange) * chartHeight;
        if (y >= 0 && y <= chartHeight && price >= minY && price <= maxY) {
            levels.push({ price, y, digits: instrumentConfig.digits });
        }
    }
    // Add levels above center
    for (let i = 1; i <= numLevelsAboveBelow; i++) {
        const price = startPrice + i * PRICE_INTERVAL;
        const y = chartHeight - ((price - minY) / priceRange) * chartHeight;
        if (y >= 0 && y <= chartHeight && price >= minY && price <= maxY) {
            levels.push({ price, y, digits: instrumentConfig.digits });
        }
    }

    // Sort levels by price
    levels.sort((a, b) => a.price - b.price);

    return (
        <g className='y-axis' transform={`translate(${chartWidth}, 0)`} onMouseDown={handleMouseDown}>
            {/* Background for price labels */}
            <rect x={0} y={0} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={chartHeight} fill='transparent' cursor='ns-resize' />

            {/* Vertical axis line */}
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke={CHART_CONFIG.COLORS.AXIS} strokeWidth={1} />

            {/* Last price line and label */}
            <g>
                <line x1={-chartWidth} y1={lastPriceY} x2={0} y2={lastPriceY} stroke='white' strokeWidth='1.5' strokeDasharray='2 2' />
                <rect x={3} y={lastPriceY - 10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill='black' rx={4} />
                <text x={33} y={lastPriceY + 4} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                    {lastPrice.toFixed(instrumentConfig.digits)}
                </text>
            </g>

            {/* Price levels and grid lines */}
            {levels.map(({ price, y, digits }) => (
                <g key={price}>
                    <line x1={-chartWidth} y1={y} x2={0} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} strokeOpacity={0.1} strokeWidth={1} />
                    <line x1={0} x2={5} y1={y} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} />
                    <text x={10} y={y + 4} fill='white' fontSize='12' textAnchor='start'>
                        {price.toFixed(digits)}
                    </text>
                </g>
            ))}

            {/* Hover price indicator */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text x={33} y={4} textAnchor='middle' fill='black' fontSize='12' fontWeight='bold'>
                        {hoverInfo.price.toFixed(instrumentConfig.digits)}
                    </text>
                </g>
            )}
        </g>
    );
};

const HoverInfoComponent = ({ x, y, chartHeight, chartWidth }: { x: number; y: number; chartHeight: number; chartWidth: number }) => {
    if (!isFinite(x) || !isFinite(y)) return null;

    return (
        <g>
            <line x1={x} y1={0} x2={x} y2={chartHeight} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            <line x1={0} y1={y} x2={chartWidth} y2={y} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
        </g>
    );
};
