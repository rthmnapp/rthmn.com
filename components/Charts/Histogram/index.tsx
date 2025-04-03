'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import { Box } from '@/types/types';
import { BoxColors } from '@/stores/colorStore';
import { BoxSizes } from '@/utils/instruments';

interface BoxTimelineProps {
    data: {
        timestamp: string;
        progressiveValues: Box[];
        currentOHLC?: {
            open: number;
            high: number;
            low: number;
            close: number;
        };
    }[];
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
    boxColors: BoxColors;
    className?: string;
    hoveredTimestamp?: number | null;
    showLine?: boolean;
}

const MAX_FRAMES = 1000;

const Histogram: React.FC<BoxTimelineProps> = ({ data, boxOffset, visibleBoxesCount, boxVisibilityFilter, boxColors, className = '', hoveredTimestamp, showLine = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [trendChanges, setTrendChanges] = useState<Array<{ timestamp: string; x: number; isPositive: boolean }>>([]);
    const [effectiveBoxWidth, setEffectiveBoxWidth] = useState(0);
    const framesToDrawRef = useRef<BoxTimelineProps['data']>([]);
    const frameToRealTimestampRef = useRef<Map<number, number>>(new Map());

    const calculateBoxDimensions = (containerHeight: number, frameCount: number) => {
        const boxSize = Math.floor(containerHeight / visibleBoxesCount);
        const totalHeight = boxSize * visibleBoxesCount;
        const requiredWidth = boxSize * frameCount;
        return { boxSize, requiredWidth, totalHeight };
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !data || data.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const container = canvas.parentElement;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        const processedFrames: BoxTimelineProps['data'] = [];
        let prevFrame: BoxTimelineProps['data'][number] | null = null;
        const isFrameDuplicate = (frame1, frame2) => {
            if (!frame1 || !frame2) return false;
            const boxes1 = frame1.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const boxes2 = frame2.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes1.length !== boxes2.length) return false;
            return boxes1.every((box, index) => box.value === boxes2[index]?.value);
        };

        frameToRealTimestampRef.current.clear();

        let lastRealTimestamp: number | null = null;

        for (const frame of data) {
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes.length === 0) continue;

            const currentRealTimestamp = new Date(frame.timestamp).getTime();
            lastRealTimestamp = currentRealTimestamp;

            let frameToAdd = frame;
            let addFrameDirectly = false;

            if (prevFrame) {
                const prevBoxesRaw = prevFrame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
                if (prevBoxesRaw.length === 0) {
                    addFrameDirectly = true;
                } else {
                    const prevLargestBox = prevBoxesRaw.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
                    const currentLargestBox = boxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
                    const trendChanged = prevLargestBox.value >= 0 !== currentLargestBox.value >= 0;

                    if (trendChanged) {
                        addFrameDirectly = false;
                        const isNewTrendPositive = currentLargestBox.value >= 0;
                        const numIntermediateSteps = 4;

                        const prevBoxesSorted = [...prevBoxesRaw].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

                        let lastIntermediateValues = [...prevFrame.progressiveValues];

                        const prevTimestamp = new Date(prevFrame.timestamp).getTime();
                        const nextTimestamp = new Date(frame.timestamp).getTime();
                        const timeDiff = nextTimestamp - prevTimestamp;

                        const prevRealTimestamp = prevTimestamp;

                        for (let k = 1; k <= numIntermediateSteps; k++) {
                            const intermediateValues = [...lastIntermediateValues];
                            const boxesToFlipCount = Math.ceil(prevBoxesSorted.length * (k / numIntermediateSteps));
                            let flippedCount = 0;

                            for (let boxIndex = 0; boxIndex < intermediateValues.length; boxIndex++) {
                                const currentBoxValue = intermediateValues[boxIndex].value;
                                const originalBox = prevFrame.progressiveValues[boxIndex];

                                const sortedIndex = prevBoxesSorted.findIndex(
                                    (b) => b.high === originalBox.high && b.low === originalBox.low && Math.abs(b.value - originalBox.value) < 0.00001
                                );

                                if (sortedIndex !== -1 && sortedIndex < boxesToFlipCount) {
                                    if ((isNewTrendPositive && currentBoxValue < 0) || (!isNewTrendPositive && currentBoxValue > 0)) {
                                        intermediateValues[boxIndex] = {
                                            ...intermediateValues[boxIndex],
                                            value: isNewTrendPositive ? Math.abs(originalBox.value) : -Math.abs(originalBox.value),
                                        };
                                        flippedCount++;
                                    }
                                } else if ((isNewTrendPositive && currentBoxValue > 0) || (!isNewTrendPositive && currentBoxValue < 0)) {
                                    intermediateValues[boxIndex] = { ...intermediateValues[boxIndex] };
                                } else {
                                    intermediateValues[boxIndex] = {
                                        ...intermediateValues[boxIndex],
                                        value: isNewTrendPositive ? -Math.abs(originalBox.value) : Math.abs(originalBox.value),
                                    };
                                }
                            }

                            const safeTimeDiff = Math.max(0, timeDiff);
                            const interpolatedTimestampMillis = prevTimestamp + safeTimeDiff * (k / (numIntermediateSteps + 1));
                            const interpolatedTimestampISO = new Date(interpolatedTimestampMillis).toISOString();

                            const intermediateFrame = {
                                timestamp: interpolatedTimestampISO,
                                progressiveValues: intermediateValues,
                                currentOHLC: frame.currentOHLC,
                            };

                            processedFrames.push(intermediateFrame);
                            lastIntermediateValues = intermediateValues;

                            const isFirstHalf = k <= numIntermediateSteps / 2;
                            const parentTimestamp = isFirstHalf ? prevRealTimestamp : currentRealTimestamp;
                        }

                        frameToAdd = frame;
                        processedFrames.push(frameToAdd);
                    } else {
                        const hasValueChanges = boxes.some((box, index) => {
                            const prevBox = prevBoxesRaw[index];
                            return !prevBox || Math.abs(box.value - prevBox.value) > 0.000001;
                        });
                        if (hasValueChanges) {
                            addFrameDirectly = true;
                        }
                    }
                }
            } else {
                addFrameDirectly = true;
            }

            if (addFrameDirectly) {
                const lastAddedFrame = processedFrames[processedFrames.length - 1];
                if (!lastAddedFrame || !isFrameDuplicate(frameToAdd, lastAddedFrame)) {
                    processedFrames.push(frameToAdd);
                }
            }
            prevFrame = frame;
        }

        const framesToDraw = processedFrames.slice(Math.max(0, processedFrames.length - MAX_FRAMES));
        framesToDrawRef.current = framesToDraw;

        if (framesToDraw.length === 0) return;

        let lastRealFrameIndex = -1;
        let lastRealFrameTimestamp = -1;

        framesToDraw.forEach((frame, index) => {
            const frameTimestamp = new Date(frame.timestamp).getTime();

            const isRealFrame = data.some((d) => {
                const dTimestamp = new Date(d.timestamp).getTime();
                return Math.abs(dTimestamp - frameTimestamp) < 5;
            });

            if (isRealFrame) {
                lastRealFrameIndex = index;
                lastRealFrameTimestamp = frameTimestamp;
                frameToRealTimestampRef.current.set(index, frameTimestamp);
            } else if (lastRealFrameIndex >= 0) {
                frameToRealTimestampRef.current.set(index, lastRealFrameTimestamp);
            }
        });

        const { boxSize, requiredWidth, totalHeight } = calculateBoxDimensions(rect.height, framesToDraw.length);
        setEffectiveBoxWidth(boxSize);

        canvas.style.width = `${requiredWidth}px`;
        canvas.style.height = `${totalHeight}px`;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(requiredWidth * dpr);
        canvas.height = Math.floor(totalHeight * dpr);
        ctx.scale(dpr, dpr);

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, requiredWidth, totalHeight);

        let highlightIndex = -1;
        if (hoveredTimestamp !== null && hoveredTimestamp !== undefined && framesToDraw.length > 0) {
            const targetTime = Number(hoveredTimestamp);
            let minDiff = Infinity;

            framesToDraw.forEach((frame, index) => {
                const frameTime = new Date(frame.timestamp).getTime();
                const diff = Math.abs(frameTime - targetTime);

                if (diff < minDiff && diff < 500) {
                    minDiff = diff;
                    highlightIndex = index;
                }
            });

            if (highlightIndex === -1) {
                let closestMappedIndex = -1;
                let minMappedDiff = Infinity;
                frameToRealTimestampRef.current.forEach((realTimestamp, index) => {
                    if (index >= framesToDraw.length) return;
                    const diff = Math.abs(realTimestamp - targetTime);
                    if (diff < minMappedDiff) {
                        minMappedDiff = diff;
                        closestMappedIndex = index;
                    }
                });

                if (closestMappedIndex !== -1 && minMappedDiff < 1000) {
                    highlightIndex = closestMappedIndex;
                }
            }
        }

        const newTrendChanges: Array<{ timestamp: string; x: number; isPositive: boolean }> = [];
        let prevIsLargestPositive: boolean | null = null;
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        framesToDraw.forEach((frame, frameIndex) => {
            const x = frameIndex * boxSize;
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes.length === 0) return;

            const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const negativeBoxes = slicedBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = slicedBoxes.filter((box) => box.value >= 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            const largestBox = orderedBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), orderedBoxes[0] || { value: 0 });
            const isLargestPositive = largestBox.value >= 0;

            const smallestBoxData = orderedBoxes.reduce(
                (minData, box) => {
                    const absValue = Math.abs(box.value);
                    if (absValue < minData.minAbsValue) {
                        return { minAbsValue: absValue, box: box };
                    }
                    return minData;
                },
                { minAbsValue: Infinity, box: null as Box | null }
            );
            const smallestBox = smallestBoxData.box;

            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedBoxes.findIndex((box) => box === smallestBox);
                const y = (boxIndex + (isPositive ? 0 : 1)) * boxSize;
                linePoints.push({ x: x, y: y, isPositive: isPositive, isLargestPositive: isLargestPositive });
            }

            if (prevIsLargestPositive !== null && prevIsLargestPositive !== isLargestPositive) {
                newTrendChanges.push({ timestamp: frame.timestamp, x: x, isPositive: isLargestPositive });
            }
            prevIsLargestPositive = isLargestPositive;
        });
        setTrendChanges(newTrendChanges);

        if (showLine && linePoints.length > 0) {
            for (let i = 0; i < linePoints.length - 1; i++) {
                const currentPoint = linePoints[i];
                const nextPoint = linePoints[i + 1];
                ctx.beginPath();
                if (currentPoint.isLargestPositive) {
                    ctx.moveTo(currentPoint.x, 0);
                    ctx.lineTo(nextPoint.x, 0);
                    ctx.lineTo(nextPoint.x, nextPoint.y);
                    ctx.lineTo(currentPoint.x, currentPoint.y);
                } else {
                    ctx.moveTo(currentPoint.x, currentPoint.y);
                    ctx.lineTo(nextPoint.x, nextPoint.y);
                    ctx.lineTo(nextPoint.x, totalHeight);
                    ctx.lineTo(currentPoint.x, totalHeight);
                }
                ctx.closePath();
                const fillColor = currentPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                const gradient = ctx.createLinearGradient(currentPoint.x, 0, nextPoint.x, 0);
                try {
                    const r = parseInt(fillColor.slice(1, 3), 16) || 0;
                    const g = parseInt(fillColor.slice(3, 5), 16) || 0;
                    const b = parseInt(fillColor.slice(5, 7), 16) || 0;
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                } catch (e) {
                    console.error('Error parsing fill color:', fillColor, e);
                }
            }
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.beginPath();
                if (lastPoint.isLargestPositive) {
                    ctx.moveTo(lastPoint.x, 0);
                    ctx.lineTo(lastPoint.x + boxSize, 0);
                    ctx.lineTo(lastPoint.x + boxSize, totalHeight);
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                } else {
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, totalHeight);
                    ctx.lineTo(lastPoint.x, totalHeight);
                }
                ctx.closePath();
                const fillColor = lastPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                const gradient = ctx.createLinearGradient(lastPoint.x, 0, lastPoint.x + boxSize, 0);
                try {
                    const r = parseInt(fillColor.slice(1, 3), 16) || 0;
                    const g = parseInt(fillColor.slice(3, 5), 16) || 0;
                    const b = parseInt(fillColor.slice(5, 7), 16) || 0;
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                } catch (e) {
                    console.error('Error parsing fill color:', fillColor, e);
                }
            }
            ctx.beginPath();
            linePoints.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
            }
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }

        if (highlightIndex !== -1) {
            const highlightX = highlightIndex * boxSize;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(highlightX, 0, boxSize, totalHeight);
        }

        // --- Auto-scroll to highlighted index ---
        if (highlightIndex !== -1 && scrollContainerRef.current && boxSize > 0) {
            const scrollContainer = scrollContainerRef.current;
            const highlightX = highlightIndex * boxSize;
            const containerWidth = scrollContainer.clientWidth;
            const targetScrollLeft = highlightX + boxSize / 2 - containerWidth / 2;

            // Clamp scroll position to valid bounds
            const maxScrollLeft = scrollContainer.scrollWidth - containerWidth;
            const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

            // Scroll smoothly
            scrollContainer.scrollTo({
                left: clampedScrollLeft,
                behavior: 'smooth',
            });
        }
        // --- End auto-scroll logic ---
    }, [isClient, data, boxOffset, visibleBoxesCount, boxColors, showLine, boxVisibilityFilter, hoveredTimestamp]);

    return (
        <div className={`relative ${className}`}>
            <div ref={scrollContainerRef} className='scrollbar-hide h-full w-full overflow-x-auto'>
                <div className='relative h-full pt-6'>
                    <div className='pointer-events-none absolute -top-0 right-0 left-0 z-0 ml-[18px] h-6'>
                        {trendChanges.map((change, index) => (
                            <div
                                key={`${change.timestamp}-${index}-${change.x}`}
                                className='absolute -translate-x-1/2 transform'
                                style={{
                                    left: `${change.x}px`,
                                    color: change.isPositive ? boxColors.positive : boxColors.negative,
                                }}>
                                ▼
                            </div>
                        ))}
                    </div>

                    <div className='h-full'>
                        <canvas ref={canvasRef} className='block h-full overflow-y-hidden' style={{ imageRendering: 'pixelated' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Histogram);
