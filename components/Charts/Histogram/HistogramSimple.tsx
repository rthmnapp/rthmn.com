import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, BoxSlice } from '@/types/types';
import { useColorStore } from '@/stores/colorStore';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useParams } from 'next/navigation';

const GRADIENT_COLORS = {
    GREEN: {
        DARK: '#212422',
        MEDIUM: '#2A2F2B',
        LIGHT: '#3FFFA2',
        GRID: '#2F3B33',
        DOT: '#3FFFA2',
    },
    RED: {
        DARK: '#222221',
        MEDIUM: '#2A2F2A',
        LIGHT: '#3FFFA2',
        GRID: '#2F3B32',
        DOT: '#3FFFA2',
    },
    NEUTRAL: {
        DARK: '#212422',
        MEDIUM: '#242624',
        LIGHT: '#3FFFA2',
        GRID: '#2A2D2A',
        DOT: '#3FFFA2',
    },
};

const HistogramControls: React.FC<{
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    totalBoxes: number;
    visibleBoxesCount: number;
}> = ({ boxOffset, onOffsetChange, totalBoxes, visibleBoxesCount }) => {
    return (
        <div className='absolute top-0 right-0 bottom-1 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
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

const HistogramSimple: React.FC<{ data: BoxSlice[] }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<{ [key: string]: CanvasGradient }>({});
    const BOX_WIDTH = 25;
    const MAX_FRAMES = 1000;
    const VISIBLE_BOXES_COUNT = 8;
    const { boxColors } = useColorStore();
    const params = useParams();
    const { boxOffset, handleOffsetChange } = useUrlParams(params.pair as string);
    const [containerHeight, setContainerHeight] = useState(500);

    // Improved frame deduplication logic
    const uniqueFrames = useMemo(() => {
        if (!data.length) return [];

        const getVisibleBoxesSignature = (frame: BoxSlice) => {
            // Sort boxes by absolute value
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

            // Get visible boxes based on current offset
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

            // Split into negative and positive boxes
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);

            // Create ordered boxes array
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Create signature from ordered boxes
            return orderedBoxes.map((box) => `${box.value}`).join('|');
        };

        return data.reduce((acc: BoxSlice[], frame, index) => {
            // Always include the first frame
            if (index === 0) {
                return [frame];
            }

            const prevFrame = acc[acc.length - 1];
            const currentSignature = getVisibleBoxesSignature(frame);
            const prevSignature = getVisibleBoxesSignature(prevFrame);

            // Only add frame if the visible boxes are different
            if (currentSignature !== prevSignature) {
                return [...acc, frame];
            }

            return acc;
        }, []);
    }, [data, boxOffset, VISIBLE_BOXES_COUNT]);

    // Add effect to scroll to the right when offset changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [boxOffset, uniqueFrames]);

    // Update container height and recalculate box heights when container size changes
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Update gradient calculation
    const getFrameGradient = (frame: BoxSlice, ctx: CanvasRenderingContext2D) => {
        const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

        if (visibleBoxes.length === 0) return null;

        const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
        const isPositive = largestBox.value > 0;
        const baseColor = isPositive ? boxColors.positive : boxColors.negative;

        // Create a unique key for this gradient
        const gradientKey = `${isPositive ? 'pos' : 'neg'}-${containerHeight}`;

        // Create gradient if it doesn't exist
        if (!gradientRef.current[gradientKey]) {
            const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight);

            // Convert hex to RGB for manipulation
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            // Create gradient from darker to lighter
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);

            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`);
            gradientRef.current[gradientKey] = gradient;
        }

        return {
            gradient: gradientRef.current[gradientKey],
            baseColor,
            gridColor: `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, 0.05)`,
        };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !uniqueFrames.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = uniqueFrames.slice(Math.max(0, uniqueFrames.length - MAX_FRAMES));
        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const boxHeight = containerHeight / VISIBLE_BOXES_COUNT;

        canvas.width = totalWidth;
        canvas.height = containerHeight;

        // Clear canvas
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, containerHeight);

        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;

            // Get gradient and colors for this frame
            const colors = getFrameGradient(frame, ctx);
            if (!colors) return;

            // Draw background gradient for this section
            ctx.fillStyle = colors.gradient;
            ctx.fillRect(x, 0, BOX_WIDTH, containerHeight);

            // Draw grid lines
            ctx.beginPath();
            ctx.strokeStyle = colors.gridColor;
            ctx.lineWidth = 0.3;
            for (let i = 0; i <= VISIBLE_BOXES_COUNT; i++) {
                const y = Math.round(i * boxHeight);
                ctx.moveTo(x, y);
                ctx.lineTo(x + BOX_WIDTH, y);
            }
            ctx.stroke();

            // Sort and draw boxes
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find largest box to determine coloring
            const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
            const isLargestPositive = largestBox.value > 0;

            orderedBoxes.forEach((box, boxIndex) => {
                const currentY = boxIndex * boxHeight;
                const isPositiveBox = box.value > 0;

                // Draw box background
                if (isLargestPositive) {
                    // If largest is positive, make positive boxes lighter and negative boxes darker
                    if (isPositiveBox) {
                        // Lighter positive boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`;
                    } else {
                        // Darker negative boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 1)`;
                    }
                } else {
                    // If largest is negative, make negative boxes lighter and positive boxes darker
                    if (isPositiveBox) {
                        // Darker positive boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 1)`;
                    } else {
                        // Lighter negative boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
                    }
                }
                ctx.fillRect(x, currentY, BOX_WIDTH, boxHeight);

                // Draw value text with higher contrast
                ctx.fillStyle = '#000000';
                const fontSize = Math.min(10, boxHeight / 3);
                ctx.font = `${fontSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = box.value.toString();
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + boxHeight / 2);
            });
        });
    }, [uniqueFrames, boxColors, boxOffset, containerHeight]);

    if (!uniqueFrames.length) return null;

    return (
        <div className='relative flex w-full flex-col'>
            <div ref={containerRef} className='relative flex h-[200px] w-full bg-[#121212]'>
                <div ref={scrollContainerRef} className='flex h-full w-full overflow-auto'>
                    <canvas ref={canvasRef} className='block pr-20' />
                    <HistogramControls
                        boxOffset={boxOffset}
                        onOffsetChange={handleOffsetChange}
                        totalBoxes={Math.max(...uniqueFrames.map((frame) => frame.boxes.length))}
                        visibleBoxesCount={VISIBLE_BOXES_COUNT}
                    />
                </div>
            </div>
        </div>
    );
};

export default HistogramSimple;
