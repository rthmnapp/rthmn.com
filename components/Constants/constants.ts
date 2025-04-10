import type { Box } from '@/types/types';

const BOX_COUNT = 8;

export const createDemoStep = (step: number, patterns: number[][], baseValues: number[]) => {
    const patternIndex = Math.floor(step / 1) % patterns.length;
    const pattern = patterns[patternIndex];

    return baseValues.slice(0, BOX_COUNT).map((value, index) => {
        if (index >= pattern.length) return value;
        return value * pattern[index];
    });
};

export const createMockBoxData = (values: number[]): Box[] => {
    return values.map((value) => ({
        high: Math.abs(value) + 200,
        low: Math.abs(value) - 200,
        value: value,
    }));
};

export const getBoxPositionsFromPattern = (pattern: number[]): any[] => {
    let boxes: any[] = pattern.map((_, index) => ({
        boxNumber: index + 1,
        position: index,
        isUp: pattern[index] === 1,
    }));

    // Sort boxes based on their state (up/down) and position
    boxes.sort((a, b) => {
        if (a.isUp === b.isUp) {
            // If both up or both down, maintain relative order
            return a.position - b.position;
        }
        // Up boxes go to top, down boxes to bottom
        return a.isUp ? -1 : 1;
    });

    return boxes.map((box, index) => ({
        ...box,
        position: index,
    }));
};

export const getNextPosition = (currentBoxes: any[], nextPattern: number[]): any[] => {
    const nextPositions = getBoxPositionsFromPattern(nextPattern);

    return currentBoxes.map((currentBox) => {
        const nextBox = nextPositions.find((b) => b.boxNumber === currentBox.boxNumber);
        return {
            ...currentBox,
            position: nextBox!.position,
            isUp: nextBox!.isUp,
        };
    });
};

export const getAnimationSequence = () => {
    return sequences.map((pattern, index) => {
        const prevPattern = index > 0 ? sequences[index - 1] : pattern;
        const currentPositions = getBoxPositionsFromPattern(pattern);
        const prevPositions = getBoxPositionsFromPattern(prevPattern);

        return {
            pattern,
            positions: currentPositions,
            prevPositions,
            changes: currentPositions.map((pos, i) => ({
                boxNumber: pos.boxNumber,
                fromPosition: prevPositions[i].position,
                toPosition: pos.position,
                isUp: pos.isUp,
            })),
        };
    });
};

export const BASE_VALUES = [1125, 800, 565, 400, 282, 200, 141, 100];

export const sequences = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, 1],
    [1, 1, 1, 1, -1, -1, 1, 1],
    [1, 1, 1, 1, -1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, 1],
    [1, 1, 1, -1, -1, -1, 1, 1],
    [1, 1, 1, -1, -1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, -1],
    [1, 1, 1, -1, 1, 1, -1, -1],
    [1, 1, 1, -1, 1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, 1],
    [1, -1, -1, -1, -1, -1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, -1],
    [1, -1, -1, -1, -1, 1, -1, -1],
    [1, -1, -1, -1, -1, 1, -1, 1], // POINT OF CHANGE
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, 1, 1, 1, 1],
    [1, -1, -1, 1, 1, 1, 1, 1],
    [1, -1, 1, 1, 1, 1, 1, 1], // UP
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, 1],
    [1, 1, 1, -1, -1, -1, 1, 1],
    [1, 1, 1, -1, -1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, -1],
    [1, 1, 1, -1, 1, 1, -1, -1],
    [1, 1, 1, -1, 1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, 1],
    [1, -1, -1, -1, -1, -1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, -1],
    [1, -1, -1, -1, -1, 1, -1, -1],
    [1, -1, -1, -1, -1, 1, -1, 1],
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, 1, 1, 1, 1],
    [1, -1, -1, 1, 1, 1, 1, 1],
    [1, -1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, 1],
    [1, 1, 1, 1, -1, -1, 1, 1],
    [1, 1, 1, 1, -1, -1, 1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, 1],
    [1, 1, 1, -1, -1, -1, 1, 1],
    [1, 1, 1, -1, -1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, 1],
    [1, 1, 1, 1, -1, -1, 1, 1],
    [1, 1, 1, 1, -1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, 1],
    [1, 1, 1, -1, -1, -1, 1, 1],
    [1, 1, 1, -1, -1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1, -1],
    [1, 1, 1, -1, 1, 1, -1, -1],
    [1, 1, 1, -1, 1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, 1],
    [1, -1, -1, -1, -1, -1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, -1, 1, 1, -1],
    [1, -1, -1, -1, -1, 1, -1, -1],
    [1, -1, -1, -1, -1, 1, -1, 1], // POINT OF CHANGE
    [1, -1, -1, -1, -1, 1, 1, 1],
    [1, -1, -1, -1, 1, 1, 1, 1],
    [1, -1, -1, 1, 1, 1, 1, 1],
    [1, -1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, -1],
    [1, 1, 1, 1, 1, 1, -1, -1],
    [1, 1, 1, 1, 1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, 1, -1, -1, -1, 1],
    [1, 1, 1, 1, -1, -1, 1, 1],
    [1, 1, 1, 1, -1, -1, 1, -1],
    [1, 1, 1, 1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, 1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1],
];
