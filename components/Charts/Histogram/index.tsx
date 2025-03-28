import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import type { Box, BoxSlice } from '@/types/types';
import { formatTime } from '@/utils/dateUtils';

import { COLORS } from './Colors';
import SelectedFrameDetails from './SelectedFrameDetails';

const ZOOMED_BAR_WIDTH = 0;
const INITIAL_BAR_WIDTH = 20;

type OscillatorRef = {
    getColorAndY: any;
    meetingPoints: { x: number; y: number }[];
    sliceWidth: number;
    visibleBoxesCount: number;
};

type GetColorAndY = (x: number) => { y: number; color: string; high: number; low: number; linePrice: number };

const useHistogramData = (
    data: BoxSlice[],
    selectedFrame: BoxSlice | null,
    selectedFrameIndex: number | null,
    boxOffset: number,
    visibleBoxesCount: number,
    height: number,
    preProcessedData: {
        maxSize: number;
        initialFramesWithPoints: any[];
    }
) => {
    const currentFrame = useMemo(() => {
        return selectedFrame || (data.length > 0 ? data[0] : null);
    }, [selectedFrame, data]);

    // Helper to check if two box arrays are identical
    const areBoxArraysEqual = useCallback((boxes1: Box[], boxes2: Box[]) => {
        if (boxes1.length !== boxes2.length) return false;
        return boxes1.every((box, i) => box.high === boxes2[i].high && box.low === boxes2[i].low && box.value === boxes2[i].value);
    }, []);

    // Filter out frames with duplicate visible boxes
    const uniqueFrames = useMemo(() => {
        if (!data.length) return [];

        const getFrameSignature = (boxes: Box[]) => {
            // Only use values for comparison, ignore high/low
            return boxes.map((box) => `${box.value}`).join('|');
        };

        return data.reduce((acc: BoxSlice[], frame, index) => {
            const totalBoxes = frame.boxes.length;
            const start = Math.max(0, boxOffset);
            const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
            const currentVisibleBoxes = frame.boxes.slice(start, end);

            // Always include the first frame
            if (index === 0) {
                return [frame];
            }

            // Get previous frame's visible boxes
            const prevFrame = acc[acc.length - 1];
            const prevVisibleBoxes = prevFrame.boxes.slice(start, end);

            // Compare only the values
            const currentSignature = getFrameSignature(currentVisibleBoxes);
            const prevSignature = getFrameSignature(prevVisibleBoxes);

            // Only add frame if the values are different
            if (currentSignature !== prevSignature) {
                return [...acc, frame];
            }

            return acc;
        }, []);
    }, [data, boxOffset, visibleBoxesCount]);

    const visibleBoxes = useMemo(() => {
        if (!currentFrame) return [];

        // Get visible boxes based on offset
        return currentFrame.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
    }, [currentFrame, boxOffset, visibleBoxesCount]);

    // Use uniqueFrames for framesWithPoints
    const framesWithPoints = useMemo(() => {
        const boxHeight = height / visibleBoxesCount;
        return uniqueFrames.map((slice, index) => {
            const baseFrame = preProcessedData.initialFramesWithPoints[data.findIndex((f) => f.timestamp === slice.timestamp)];
            const isSelected = selectedFrameIndex === data.findIndex((f) => f.timestamp === slice.timestamp);

            // Get visible boxes based on offset
            const visibleBoxes = slice.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
            const positiveBoxesCount = visibleBoxes.filter((box) => box.value > 0).length;
            const negativeBoxesCount = visibleBoxesCount - positiveBoxesCount;

            const totalNegativeHeight = negativeBoxesCount * boxHeight;
            const meetingPointY = totalNegativeHeight + (height - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

            return {
                frameData: {
                    ...baseFrame.frameData,
                    isSelected,
                    meetingPointY,
                    sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
                },
                meetingPointY,
                sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
            };
        });
    }, [uniqueFrames, data, selectedFrameIndex, height, boxOffset, visibleBoxesCount, preProcessedData.initialFramesWithPoints]);

    return { currentFrame, visibleBoxes, maxSize: preProcessedData.maxSize, framesWithPoints };
};

const HistogramChart: React.FC<{
    data: BoxSlice[];
    height: number;
    boxOffset: number;
    visibleBoxesCount: number;
    onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
}> = React.memo(({ data, height, boxOffset, visibleBoxesCount, onFrameSelect }) => {
    return (
        <div className='relative h-full w-full pr-16'>
            <div className='hide-scrollbar flex h-full w-full items-end overflow-x-auto'>
                <div className='flex h-full' style={{ width: `${data.length * INITIAL_BAR_WIDTH}px` }}>
                    {data.map((frame, index) => (
                        <div
                            key={`${index}`}
                            className='relative shrink-0 cursor-pointer'
                            style={{ width: INITIAL_BAR_WIDTH, height: `${height}px` }}
                            onClick={() => onFrameSelect(frame, index)}>
                            <VerticalFrame boxes={frame.boxes} height={height} boxOffset={boxOffset} visibleBoxesCount={visibleBoxesCount} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const VerticalFrame: React.FC<{
    boxes: Box[];
    height: number;
    boxOffset: number;
    visibleBoxesCount: number;
}> = ({ boxes, height, boxOffset, visibleBoxesCount }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Clear background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, INITIAL_BAR_WIDTH, height);

        // Get visible boxes based on offset
        const visibleBoxes = boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
        const boxHeight = height / visibleBoxesCount;

        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#181818';
        ctx.lineWidth = 0.3;
        for (let i = 0; i <= visibleBoxesCount; i++) {
            const y = Math.round(i * boxHeight);
            ctx.moveTo(0, y);
            ctx.lineTo(INITIAL_BAR_WIDTH, y);
        }
        ctx.stroke();

        // Draw boxes and values
        visibleBoxes.forEach((box, index) => {
            const y = Math.round(index * boxHeight);

            // Draw box
            ctx.fillStyle = box.value > 0 ? 'rgba(34, 255, 231, 0.1)' : 'rgba(255, 110, 134, 0.1)';
            ctx.fillRect(0, y, INITIAL_BAR_WIDTH, boxHeight);

            // Draw value
            ctx.fillStyle = box.value > 0 ? '#22FFE7' : '#FF6E86';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(box.value.toString(), INITIAL_BAR_WIDTH / 2, y + boxHeight / 2);
        });
    }, [boxes, height, boxOffset, visibleBoxesCount]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    return <canvas ref={canvasRef} width={INITIAL_BAR_WIDTH} height={height} className='absolute inset-0' />;
};

const TimeBar: React.FC<{
    data: BoxSlice[];
    scrollLeft: number;
    width: number;
    visibleBoxesCount: number;
    boxOffset: number;
}> = React.memo(({ data, scrollLeft, width, visibleBoxesCount, boxOffset }) => {
    const significantTimeIndexes = useMemo(() => {
        const indexes: number[] = [];
        let previousColor: 'green' | 'red' | null = null;

        // Add indexes where color changes (trend changes)
        data.forEach((slice, index) => {
            const totalBoxes = slice.boxes.length;
            const start = Math.max(0, boxOffset);
            const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
            const visibleBoxes = slice.boxes.slice(start, end);

            if (visibleBoxes.length === 0) return;

            const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
            const currentColor = largestBox.value > 0 ? 'green' : 'red';

            if (currentColor !== previousColor) {
                indexes.push(index);
                previousColor = currentColor;
            }
        });

        // Return array of unique indexes
        return Array.from(new Set(indexes)).sort((a, b) => a - b);
    }, [data, boxOffset, visibleBoxesCount]);

    return (
        <div className='relative h-10 w-full border-t border-gray-800 bg-black' style={{ width: `${width}px` }}>
            <div
                className='absolute flex h-full w-full items-center'
                style={{
                    width: `${data.length * INITIAL_BAR_WIDTH}px`,
                    transform: `translateX(-${scrollLeft}px)`,
                }}>
                {significantTimeIndexes.map((index) => {
                    if (!data[index]) return null;

                    const slice = data[index];
                    const localTime = new Date(slice.timestamp);
                    const totalBoxes = slice.boxes.length;
                    const start = Math.max(0, boxOffset);
                    const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
                    const visibleBoxes = slice.boxes.slice(start, end);

                    if (visibleBoxes.length === 0) return null;

                    const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
                    const color = largestBox.value > 0 ? '#22FFE7' : '#FF6E86';

                    // Create a unique key using timestamp and index
                    const uniqueKey = `${slice.timestamp}-${index}`;

                    return (
                        <div
                            key={uniqueKey}
                            className='absolute top-2 shrink-0 text-center text-[11px] font-bold whitespace-nowrap'
                            style={{
                                left: `${index * INITIAL_BAR_WIDTH}px`,
                                width: `${INITIAL_BAR_WIDTH}px`,
                                transform: 'translateX(-60%)',
                                color: color,
                            }}>
                            {formatTime(localTime)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

const Oscillator: React.FC<{
    boxArray: Box[];
    height: number;
    visibleBoxesCount: number;
    meetingPointY: number;
    prevMeetingPointY: number | null;
    nextMeetingPointY: number | null;
    sliceWidth: number;
    onGetColorAndY?: (getColorAndY: GetColorAndY) => void;
    boxData: {
        y: number;
        rangeY: number;
        rangeHeight: number;
        centerX: number;
        centerY: number;
        value: number;
    }[];
    meetingPoints: { x: number; y: number }[];
    interpolateY: (x: number) => number;
}> = ({ boxArray, height, visibleBoxesCount, meetingPointY, prevMeetingPointY, nextMeetingPointY, sliceWidth, onGetColorAndY, boxData, meetingPoints, interpolateY }) => {
    const boxHeight = height / visibleBoxesCount;
    const sortedBoxes = useMemo(() => boxArray.slice(0, visibleBoxesCount), [boxArray, visibleBoxesCount]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gradientRef = useRef<CanvasGradient | null>(null);
    const lastDrawnPropsRef = useRef<string>('');

    const sectionColor = useMemo(() => {
        if (sortedBoxes.length === 0) return 'NEUTRAL';
        const largestBox = sortedBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
        return largestBox.value > 0 ? 'GREEN' : 'RED';
    }, [sortedBoxes]);

    const colors = COLORS[sectionColor as keyof typeof COLORS];

    const getColorAndY = useCallback(
        (x: number) => {
            const y = interpolateY(x);
            const smallestBox = sortedBoxes.reduce((smallest, current) => (Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest));

            return {
                y: Math.round(y),
                color: colors.LIGHT,
                high: smallestBox.high,
                low: smallestBox.low,
                linePrice: smallestBox.value >= 0 ? smallestBox.high : smallestBox.low,
            };
        },
        [sortedBoxes, colors.LIGHT, interpolateY]
    );

    useEffect(() => {
        if (onGetColorAndY) {
            onGetColorAndY(getColorAndY);
        }
    }, [onGetColorAndY, getColorAndY]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Check if we need to redraw
        const currentProps = JSON.stringify({ boxData, colors, height, sliceWidth });
        if (currentProps === lastDrawnPropsRef.current) return;
        lastDrawnPropsRef.current = currentProps;

        // Clear background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, sliceWidth, height);

        // Draw grid in a single pass
        ctx.beginPath();
        ctx.strokeStyle = '#181818';
        ctx.lineWidth = 0.3;

        // Draw horizontal grid lines
        for (let i = 0; i <= visibleBoxesCount; i++) {
            const y = Math.round(i * boxHeight);
            ctx.moveTo(0, y);
            ctx.lineTo(sliceWidth, y);
        }
        ctx.stroke();
    }, [boxData, colors, height, sliceWidth, visibleBoxesCount, boxHeight]);

    // Use RAF for smooth rendering
    useEffect(() => {
        let animationFrame: number;
        const animate = () => {
            drawCanvas();
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
            gradientRef.current = null; // Clear gradient cache on unmount
        };
    }, [drawCanvas]);

    return (
        <div
            className='relative overflow-hidden'
            style={{
                width: sliceWidth,
                height: `${height}px`,
            }}>
            <canvas ref={canvasRef} width={sliceWidth} height={height} className='absolute inset-0' />
            <svg className='pointer-events-none absolute top-0 h-full w-full' style={{ zIndex: 200, overflow: 'visible' }}>
                <HistogramLine prevMeetingPointY={prevMeetingPointY} nextMeetingPointY={nextMeetingPointY} meetingPointY={meetingPointY} sliceWidth={sliceWidth} colors={colors} />
            </svg>
        </div>
    );
};

const Histogram: React.FC<{
    data: BoxSlice[];
    height: number;
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    visibleBoxesCount: number;
    selectedFrame: BoxSlice | null;
    selectedFrameIndex: number | null;
    onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
    isDragging: boolean;
    onDragStart: (e: React.MouseEvent) => void;
    containerWidth: number;
    preProcessedData: {
        maxSize: number;
        initialFramesWithPoints: any[];
    };
}> = ({
    data,
    height,
    boxOffset,
    onOffsetChange,
    visibleBoxesCount,
    selectedFrame,
    selectedFrameIndex,
    onFrameSelect,
    isDragging,
    onDragStart,
    containerWidth,
    preProcessedData,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollLeft, setScrollLeft] = useState(0);

    const { framesWithPoints } = useHistogramData(data, selectedFrame, selectedFrameIndex, boxOffset, visibleBoxesCount, height, preProcessedData);

    const oscillatorRefs = useRef<(OscillatorRef | null)[]>([]);
    const [hoverInfo, setHoverInfo] = useState<any>(null);

    const boxHeight = height / visibleBoxesCount;

    // Calculate box data here for each frame
    const getBoxData = useCallback(
        (boxArray: Box[], sliceWidth: number) => {
            return boxArray.map((box, index) => {
                const y = Math.round(index * boxHeight);
                const rangeHeight = ((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
                const rangeY = Math.round(box.value > 0 ? y + boxHeight - rangeHeight : y);
                const centerX = sliceWidth / 2;
                const centerY = Math.round(y + boxHeight / 2);

                return {
                    y,
                    rangeY,
                    rangeHeight,
                    centerX,
                    centerY,
                    value: box.value,
                };
            });
        },
        [boxHeight]
    );

    // Calculate meeting points for each frame
    const getMeetingPoints = useCallback((meetingPointY: number, prevMeetingPointY: number | null, nextMeetingPointY: number | null, sliceWidth: number) => {
        return [
            { x: -sliceWidth / 2, y: prevMeetingPointY ?? meetingPointY },
            { x: 0, y: prevMeetingPointY ?? meetingPointY },
            { x: 0, y: meetingPointY },
            { x: sliceWidth / 2, y: meetingPointY },
            { x: sliceWidth, y: meetingPointY },
            { x: sliceWidth, y: nextMeetingPointY ?? meetingPointY },
            { x: sliceWidth * 1.5, y: nextMeetingPointY ?? meetingPointY },
        ];
    }, []);

    // Calculate interpolation for each frame
    const getInterpolateY = useCallback((x: number, meetingPoints: { x: number; y: number }[], meetingPointY: number) => {
        for (let i = 0; i < meetingPoints.length - 1; i++) {
            const start = meetingPoints[i];
            const end = meetingPoints[i + 1];
            if (x >= start.x && x <= end.x) {
                const t = (x - start.x) / (end.x - start.x);
                return start.y + t * (end.y - start.y);
            }
        }
        return meetingPointY;
    }, []);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setScrollLeft(scrollContainerRef.current.scrollLeft);
        }
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const frameIndex = Math.floor((x + scrollLeft) / INITIAL_BAR_WIDTH);
            const frameX = (x + scrollLeft) % INITIAL_BAR_WIDTH;

            if (frameIndex >= 0 && frameIndex < framesWithPoints.length) {
                const oscillator = oscillatorRefs.current[frameIndex];
                if (oscillator?.getColorAndY) {
                    const { y, color, high, low, linePrice } = oscillator.getColorAndY(frameX);
                    setHoverInfo({
                        x,
                        y,
                        color,
                        high,
                        low,
                        linePrice,
                    });
                }
            }
        },
        [framesWithPoints, scrollLeft]
    );

    const handleMouseLeave = useCallback(() => {
        setHoverInfo(null);
    }, []);

    const renderNestedBoxes = useCallback(
        (
            boxArray: BoxSlice['boxes'],
            isSelected: boolean,
            meetingPointY: number,
            prevMeetingPointY: number | null,
            nextMeetingPointY: number | null,
            sliceWidth: number,
            index: number
        ): any | null => {
            const totalBoxes = boxArray.length;
            const start = boxOffset;
            const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
            const visibleBoxArray = boxArray.slice(start, end);
            const boxData = getBoxData(visibleBoxArray, sliceWidth);
            const meetingPoints = getMeetingPoints(meetingPointY, prevMeetingPointY, nextMeetingPointY, sliceWidth);

            return (
                <Oscillator
                    boxArray={visibleBoxArray}
                    height={height}
                    visibleBoxesCount={visibleBoxesCount}
                    meetingPointY={meetingPointY}
                    prevMeetingPointY={prevMeetingPointY}
                    nextMeetingPointY={nextMeetingPointY}
                    sliceWidth={sliceWidth}
                    onGetColorAndY={(getColorAndY) => {
                        oscillatorRefs.current[index] = {
                            getColorAndY,
                            meetingPoints,
                            sliceWidth,
                            visibleBoxesCount,
                        };
                    }}
                    boxData={boxData}
                    meetingPoints={meetingPoints}
                    interpolateY={(x: number) => getInterpolateY(x, meetingPoints, meetingPointY)}
                />
            );
        },
        [height, boxOffset, visibleBoxesCount, getBoxData, getMeetingPoints, getInterpolateY]
    );

    // Update hover info when offset changes
    useEffect(() => {
        if (hoverInfo) {
            const frameIndex = Math.floor((hoverInfo.x + scrollLeft) / INITIAL_BAR_WIDTH);
            const frameX = (hoverInfo.x + scrollLeft) % INITIAL_BAR_WIDTH;
            const oscillator = oscillatorRefs.current[frameIndex];
            if (oscillator) {
                const { y, color, high, low, linePrice } = oscillator.getColorAndY(frameX);
                setHoverInfo((prevInfo) => ({
                    ...prevInfo!,
                    y,
                    color,
                    high,
                    low,
                    linePrice,
                }));
            }
        }
    }, [boxOffset, scrollLeft]);

    // Auto-scroll to the right when new data is received
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            handleScroll();
        }
    }, [data]);

    const handleFrameClick = useCallback(
        (frame: BoxSlice | null, index: number | null) => {
            if (frame !== null && index !== null) {
                const adjustedIndex = index + boxOffset;
                onFrameSelect(frame, adjustedIndex);
            } else {
                onFrameSelect(null, null);
            }
        },
        [onFrameSelect, boxOffset]
    );

    const getVisibleBoxesForFrame = useCallback(
        (frame: BoxSlice) => {
            const totalBoxes = frame.boxes.length;
            const start = Math.max(0, boxOffset);
            const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
            const visibleBoxes = frame.boxes.slice(start, end).map((box) => ({
                ...box,
                high: box.high,
                low: box.low,
                value: box.value,
            }));
            const smallestBox = visibleBoxes.reduce((smallest, current) => (Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest));
            const linePrice = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;

            return { visibleBoxes, linePrice };
        },
        [boxOffset, visibleBoxesCount]
    );

    return (
        <>
            <div className='relative flex w-full flex-col'>
                <div className='relative flex w-full' style={{ height: `${height}px`, transition: 'height 0.1s ease-out' }} ref={containerRef}>
                    <DraggableBorder isDragging={isDragging} onDragStart={onDragStart} direction='top' />
                    {data && data.length > 0 && (
                        <div className='flex h-full w-full'>
                            <HistogramChart data={data} height={height} boxOffset={boxOffset} visibleBoxesCount={visibleBoxesCount} onFrameSelect={handleFrameClick} />
                            <HistogramControls
                                boxOffset={boxOffset}
                                onOffsetChange={onOffsetChange}
                                totalBoxes={data[0]?.boxes.length || 0}
                                visibleBoxesCount={visibleBoxesCount}
                            />
                        </div>
                    )}
                </div>
                <TimeBar data={data} scrollLeft={scrollLeft} width={containerWidth} visibleBoxesCount={visibleBoxesCount} boxOffset={boxOffset} />
            </div>
            {selectedFrame && (
                <SelectedFrameDetails
                    selectedFrame={selectedFrame}
                    visibleBoxes={getVisibleBoxesForFrame(selectedFrame).visibleBoxes}
                    onClose={() => onFrameSelect(null, null)}
                    linePrice={getVisibleBoxesForFrame(selectedFrame).linePrice}
                />
            )}
        </>
    );
};

const HistogramControls = ({
    boxOffset,
    onOffsetChange,
    totalBoxes,
    visibleBoxesCount,
}: {
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    totalBoxes: number;
    visibleBoxesCount: number;
}) => {
    return (
        <div className='absolute top-0 right-0 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
            <button
                onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
                disabled={boxOffset === 0}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>+</div>
            </button>
            <div className='text-center text-white'>
                <div>{boxOffset}</div>
                <div>{totalBoxes - 1}</div>
            </div>
            <button
                onClick={() => onOffsetChange(Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1))}
                disabled={boxOffset >= totalBoxes - visibleBoxesCount}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>-</div>
            </button>
        </div>
    );
};

const HistogramLine: React.FC<{
    prevMeetingPointY: number | null;
    nextMeetingPointY: number | null;
    meetingPointY: number;
    sliceWidth: number;
    colors: typeof COLORS.GREEN | typeof COLORS.RED | typeof COLORS.NEUTRAL;
    isLastItem?: boolean;
}> = ({ prevMeetingPointY, nextMeetingPointY, meetingPointY, sliceWidth, colors, isLastItem }) => {
    return (
        <>
            <path
                d={`M 0 ${prevMeetingPointY ?? meetingPointY}
                    H ${sliceWidth / 2}
                    V ${meetingPointY}
                    H ${sliceWidth}
                    `}
                fill='none'
                stroke={colors.LIGHT}
                strokeWidth='2'
                className='transition-all duration-200 ease-in-out'
            />
            {isLastItem && (
                <circle cx={sliceWidth / 2} cy={meetingPointY} r='4' fill={colors.LIGHT}>
                    <animate attributeName='r' values='3;5;3' dur='2s' repeatCount='indefinite' />
                </circle>
            )}
        </>
    );
};

export default Histogram;
