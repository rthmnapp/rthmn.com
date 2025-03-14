import { createBoxCalculator } from './boxCalculator';
import { BoxSlice } from '@/types/types';

export interface ProcessedBoxData {
    histogramBoxes: BoxSlice[];
    histogramPreProcessed: {
        maxSize: number;
        initialFramesWithPoints: {
            frameData: {
                boxArray: BoxSlice['boxes'];
                isSelected: boolean;
                meetingPointY: number;
                sliceWidth: number;
                price: number;
                high: number;
                low: number;
            };
            meetingPointY: number;
            sliceWidth: number;
            preCalculated: {
                boxVisualData: {
                    y: number;
                    rangeY: number;
                    rangeHeight: number;
                    centerX: number;
                    centerY: number;
                    value: number;
                }[];
                positiveBoxesCount: number;
                negativeBoxesCount: number;
            };
        }[];
        defaultVisibleBoxesCount: number;
        defaultHeight: number;
    };
}

export function processInitialBoxData(
    processedCandles: { timestamp: number; open: number; high: number; low: number; close: number }[],
    pair: string,
    defaultVisibleBoxesCount: number = 8,
    defaultHeight: number = 200,
    initialBarWidth: number = 20
): ProcessedBoxData {
    // Process box data
    const boxCalculator = createBoxCalculator(pair.toUpperCase());
    const boxTimeseriesData = processedCandles.map((candle, index) => {
        const candleSlice = processedCandles.slice(0, index + 1).map((c) => ({
            timestamp: new Date(c.timestamp).toISOString(),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            mid: {
                o: c.open.toString(),
                h: c.high.toString(),
                l: c.low.toString(),
                c: c.close.toString(),
            },
        }));

        return {
            timestamp: new Date(candle.timestamp).toISOString(),
            boxes: boxCalculator.calculateBoxArrays(candleSlice),
            currentOHLC: {
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            },
        };
    });

    // Transform box data for HistogramManager
    const histogramBoxes = boxTimeseriesData.map((timepoint) => ({
        timestamp: timepoint.timestamp,
        boxes: Object.entries(timepoint.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
            high: Number(data.high),
            low: Number(data.low),
            value: data.value,
        })),
        currentOHLC: timepoint.currentOHLC,
    }));

    // Calculate max size once
    const maxSize = histogramBoxes.reduce((max, slice) => {
        const sliceMax = slice.boxes.reduce((boxMax, box) => Math.max(boxMax, Math.abs(box.value)), 0);
        return Math.max(max, sliceMax);
    }, 0);

    // Pre-calculate initial frames data
    const initialFramesWithPoints = histogramBoxes.map((slice, index) => {
        const isSelected = false;
        const boxHeight = defaultHeight / defaultVisibleBoxesCount;
        const visibleBoxes = slice.boxes.slice(0, defaultVisibleBoxesCount);
        const positiveBoxesCount = visibleBoxes.filter((box) => box.value > 0).length;
        const negativeBoxesCount = defaultVisibleBoxesCount - positiveBoxesCount;

        const totalNegativeHeight = negativeBoxesCount * boxHeight;
        const meetingPointY = totalNegativeHeight + (defaultHeight - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

        const smallestBox = visibleBoxes.reduce((smallest, current) => (Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest));
        const price = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;
        const high = Math.max(...visibleBoxes.map((box) => box.high));
        const low = Math.min(...visibleBoxes.map((box) => box.low));

        // Pre-calculate box positions and dimensions for each box
        const boxVisualData = visibleBoxes.map((box, boxIndex) => {
            const y = Math.round(boxIndex * boxHeight);
            const rangeHeight = ((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
            const rangeY = Math.round(box.value > 0 ? y + boxHeight - rangeHeight : y);
            const centerX = initialBarWidth / 2;
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

        return {
            frameData: {
                boxArray: slice.boxes,
                isSelected,
                meetingPointY,
                sliceWidth: initialBarWidth,
                price,
                high,
                low,
            },
            meetingPointY,
            sliceWidth: initialBarWidth,
            preCalculated: {
                boxVisualData,
                positiveBoxesCount,
                negativeBoxesCount,
            },
        };
    });

    return {
        histogramBoxes,
        histogramPreProcessed: {
            maxSize,
            initialFramesWithPoints,
            defaultVisibleBoxesCount,
            defaultHeight,
        },
    };
}
