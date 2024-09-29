"use client";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import HistogramControls from "./HistogramControls";
import SelectedFrameDetails from "./SelectedFrameDetails";
import { ScaledBoxes } from "./charts/ScaledBoxes";
import { SquareBoxes } from "./charts/SquareBoxes";
import { Oscillator, OscillatorRef } from "./charts/Oscillator";
import type { BoxSlice, ViewType } from "@/types";

const ZOOMED_BAR_WIDTH = 0;
const INITIAL_BAR_WIDTH = 50;

interface HistogramManagerProps {
	data: BoxSlice[];
	height: number;
	onResize: (newHeight: number) => void;
	boxOffset: number;
	onOffsetChange: (newOffset: number) => void;
	visibleBoxesCount: number;
	viewType: ViewType;
	onViewChange: (newViewType: ViewType) => void;
	selectedFrame: BoxSlice | null;
	selectedFrameIndex: number | null;
	onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
	isDragging: boolean;
	onDragStart: (e: React.MouseEvent) => void;
}

const useHistogramData = (
	data: BoxSlice[],
	selectedFrame: BoxSlice | null,
	selectedFrameIndex: number | null,
	boxOffset: number,
	visibleBoxesCount: number,
	height: number,
) => {
	const currentFrame = useMemo(() => {
		return selectedFrame || (data.length > 0 ? data[0] : null);
	}, [selectedFrame, data]);

	const visibleBoxes = useMemo(() => {
		return currentFrame
			? currentFrame.boxes.slice(boxOffset, boxOffset + visibleBoxesCount)
			: [];
	}, [currentFrame, boxOffset, visibleBoxesCount]);

	const maxSize = useMemo(() => {
		const sizes = data.flatMap((slice) =>
			slice.boxes.map((box) => Math.abs(box.value)),
		);
		return sizes.reduce((max, size) => Math.max(max, size), 0);
	}, [data]);

	const framesWithPoints = useMemo(() => {
		const boxHeight = height / visibleBoxesCount;
		return data.map((slice, index) => {
			const isSelected = index === selectedFrameIndex;
			const visibleBoxes = slice.boxes.slice(
				boxOffset,
				boxOffset + visibleBoxesCount,
			);
			const positiveBoxesCount = visibleBoxes.filter(
				(box) => box.value > 0,
			).length;
			const negativeBoxesCount = visibleBoxesCount - positiveBoxesCount;

			const totalNegativeHeight = negativeBoxesCount * boxHeight;
			const meetingPointY =
				totalNegativeHeight +
				(height - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

			return {
				frameData: {
					boxArray: slice.boxes,
					isSelected,
					meetingPointY,
					sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
				},
				meetingPointY,
				sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
			};
		});
	}, [data, selectedFrameIndex, height, boxOffset, visibleBoxesCount]);

	return { currentFrame, visibleBoxes, maxSize, framesWithPoints };
};

const DraggableBorder: React.FC<{
	isDragging: boolean;
	onDragStart: (e: React.MouseEvent) => void;
}> = React.memo(({ isDragging, onDragStart }) => (
	<div
		className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
			isDragging
				? "shadow-2xl shadow-blue-500"
				: "hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500"
		}`}
		onMouseDown={onDragStart}
	/>
));

// Update the HoverInfo type
type HoverInfo = {
	x: number;
	y: number;
	color: string;
	high: number;
	low: number;
	price: number; // Add price to the HoverInfo type
} | null;

const HistogramChart: React.FC<{
	data: BoxSlice[];
	framesWithPoints: ReturnType<typeof useHistogramData>["framesWithPoints"];
	height: number;
	onFrameSelect: HistogramManagerProps["onFrameSelect"];
	renderNestedBoxes: (
		boxArray: BoxSlice["boxes"],
		isSelected: boolean,
		meetingPointY: number,
		prevMeetingPointY: number | null,
		nextMeetingPointY: number | null,
		sliceWidth: number,
		index: number,
	) => JSX.Element | null;
	onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
	onMouseLeave: () => void;
	hoverInfo: HoverInfo;
	scrollContainerRef: React.RefObject<HTMLDivElement>;
	onScroll: () => void;
}> = React.memo(
	({
		data,
		framesWithPoints,
		height,
		onFrameSelect,
		renderNestedBoxes,
		onMouseMove,
		onMouseLeave,
		hoverInfo,
		scrollContainerRef,
		onScroll,
	}) => (
		<div
			className="relative h-full w-full pr-16"
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
		>
			<div
				ref={scrollContainerRef}
				className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
				role="region"
				aria-label="Histogram Chart"
				onScroll={onScroll}
			>
				<div
					style={{
						display: "inline-flex",
						width: `${data.length * INITIAL_BAR_WIDTH}px`,
						height: "100%",
						flexDirection: "row",
					}}
				>
					{framesWithPoints.map((frameWithPoint, index) => {
						const { frameData, meetingPointY, sliceWidth } = frameWithPoint;
						const prevMeetingPointY =
							index > 0 ? framesWithPoints[index - 1].meetingPointY : null;
						const nextMeetingPointY =
							index < framesWithPoints.length - 1
								? framesWithPoints[index + 1].meetingPointY
								: null;

						return (
							<div
								key={`${index}`}
								className="relative flex-shrink-0 cursor-pointer"
								style={{
									width: sliceWidth,
									height: `${height}px`,
									position: "relative",
								}}
								onClick={() => onFrameSelect(data[index], index)}
							>
								{renderNestedBoxes(
									frameData.boxArray,
									frameData.isSelected,
									meetingPointY,
									prevMeetingPointY,
									nextMeetingPointY,
									sliceWidth,
									index,
								)}
							</div>
						);
					})}
				</div>
			</div>
			{hoverInfo && (
				<>
					<div
						className="pointer-events-none absolute -bottom-2 top-0"
						style={{
							left: `${hoverInfo.x}px`,
							width: "1px",
							background: hoverInfo.color,
							boxShadow: `0 0 5px ${hoverInfo.color}`,
							zIndex: 1000,
						}}
					>
						<div
							className="absolute h-3 w-3 rounded-full"
							style={{
								background: hoverInfo.color,
								boxShadow: `0 0 5px ${hoverInfo.color}`,
								top: `${hoverInfo.y - 6}px`,
								left: "-6px",
							}}
						/>
						<div
							className="absolute whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white"
							style={{
								bottom: "0",
								left: "50%",
								transform: "translateX(-50%) translateY(100%)",
								zIndex: 1001,
							}}
						>
							{hoverInfo.price.toFixed(3)}
						</div>
					</div>
				</>
			)}
		</div>
	),
);

const formatTime = (date: Date) => {
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	return `${hours}:${minutes}:${seconds}\u00A0${ampm}`;
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
		let previousColor: "green" | "red" | null = null;

		data.forEach((slice, index) => {
			const visibleBoxes = slice.boxes.slice(
				boxOffset,
				boxOffset + visibleBoxesCount,
			);
			const largestBox = visibleBoxes.reduce((max, box) =>
				Math.abs(box.value) > Math.abs(max.value) ? box : max,
			);
			const currentColor = largestBox.value > 0 ? "green" : "red";

			if (currentColor !== previousColor) {
				indexes.push(index);
				previousColor = currentColor;
			}
		});

		return indexes;
	}, [data, boxOffset, visibleBoxesCount]);

	return (
		<div
			className="relative h-10 w-full overflow-hidden bg-black"
			style={{ width: `${width}px` }}
		>
			<div
				className="absolute flex h-full w-full items-center"
				style={{
					width: `${data.length * INITIAL_BAR_WIDTH}px`,
					transform: `translateX(-${scrollLeft}px)`,
				}}
			>
				{significantTimeIndexes.map((index) => {
					const slice = data[index];
					const localTime = new Date(slice.timestamp);
					const visibleBoxes = slice.boxes.slice(
						boxOffset,
						boxOffset + visibleBoxesCount,
					);
					const largestBox = visibleBoxes.reduce((max, box) =>
						Math.abs(box.value) > Math.abs(max.value) ? box : max,
					);
					const color = largestBox.value > 0 ? "#22FFE7" : "#FF6E86";
					return (
						<div
							key={index}
							className="absolute flex-shrink-0 whitespace-nowrap text-center text-[11px]"
							style={{
								left: `${index * INITIAL_BAR_WIDTH}px`,
								width: `${INITIAL_BAR_WIDTH}px`,
								color: color,
							}}
						>
							{formatTime(localTime)}
						</div>
					);
				})}
			</div>
		</div>
	);
});

const HistogramManager: React.FC<HistogramManagerProps> = ({
	data,
	height,
	onResize,
	boxOffset,
	onOffsetChange,
	visibleBoxesCount,
	viewType,
	onViewChange,
	selectedFrame,
	selectedFrameIndex,
	onFrameSelect,
	isDragging,
	onDragStart,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [scrollLeft, setScrollLeft] = useState(0);

	const { currentFrame, visibleBoxes, maxSize, framesWithPoints } =
		useHistogramData(
			data,
			selectedFrame,
			selectedFrameIndex,
			boxOffset,
			visibleBoxesCount,
			height,
		);

	const oscillatorRefs = useRef<(OscillatorRef | null)[]>([]);
	const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

	const handleScroll = useCallback(() => {
		if (scrollContainerRef.current) {
			setScrollLeft(scrollContainerRef.current.scrollLeft);
		}
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left + scrollLeft;
			const frameIndex = Math.floor(x / INITIAL_BAR_WIDTH);
			const frameX = x % INITIAL_BAR_WIDTH;

			if (frameIndex >= 0 && frameIndex < framesWithPoints.length) {
				const frame = framesWithPoints[frameIndex];
				const oscillator = oscillatorRefs.current[frameIndex];

				if (oscillator) {
					const { y, color, high, low, price } =
						oscillator.getColorAndY(frameX);
					setHoverInfo({
						x: frameIndex * INITIAL_BAR_WIDTH + frameX - scrollLeft,
						y,
						color,
						high,
						low,
						price,
					});
				}
			}
		},
		[framesWithPoints, scrollLeft],
	);

	const handleMouseLeave = useCallback(() => {
		setHoverInfo(null);
	}, []);

	const renderNestedBoxes = useCallback(
		(
			boxArray: BoxSlice["boxes"],
			isSelected: boolean,
			meetingPointY: number,
			prevMeetingPointY: number | null,
			nextMeetingPointY: number | null,
			sliceWidth: number,
			index: number,
		): JSX.Element | null => {
			const visibleBoxArray = boxArray.slice(
				boxOffset,
				boxOffset + visibleBoxesCount,
			);
			switch (viewType) {
				case "scaled":
					return (
						<ScaledBoxes
							boxArray={visibleBoxArray}
							idx={0}
							prevColor={null}
							isSelected={isSelected}
							maxSize={maxSize}
							height={height}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
							handleFrameClick={onFrameSelect}
						/>
					);
				case "even":
					return (
						<SquareBoxes
							boxArray={visibleBoxArray}
							isSelected={isSelected}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
						/>
					);
				case "oscillator":
					return (
						<Oscillator
							ref={(ref: OscillatorRef | null) => {
								oscillatorRefs.current[index] = ref;
							}}
							boxArray={visibleBoxArray}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							meetingPointY={meetingPointY}
							prevMeetingPointY={prevMeetingPointY}
							nextMeetingPointY={nextMeetingPointY}
							sliceWidth={sliceWidth}
						/>
					);
				default:
					return null;
			}
		},
		[viewType, maxSize, height, onFrameSelect, boxOffset, visibleBoxesCount],
	);

	// Update hover info when offset changes
	useEffect(() => {
		if (hoverInfo) {
			const frameIndex = Math.floor(
				(hoverInfo.x + scrollLeft) / INITIAL_BAR_WIDTH,
			);
			const frameX = (hoverInfo.x + scrollLeft) % INITIAL_BAR_WIDTH;
			const oscillator = oscillatorRefs.current[frameIndex];
			if (oscillator) {
				const { y, color, high, low, price } = oscillator.getColorAndY(frameX);
				setHoverInfo((prevInfo) => ({
					...prevInfo!,
					y,
					color,
					high,
					low,
					price,
				}));
			}
		}
	}, [boxOffset, scrollLeft]);

	// Auto-scroll to the right when new data is received
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft =
				scrollContainerRef.current.scrollWidth;
			handleScroll();
		}
	}, [data]);

	return (
		<div className="relative h-full w-full bg-gray-200">
			<div
				className="relative flex w-full bg-black pr-16"
				style={{ height: `${height}px`, transition: "height 0.1s ease-out" }}
				ref={containerRef}
			>
				<DraggableBorder isDragging={isDragging} onDragStart={onDragStart} />
				{data && data.length > 0 && (
					<div className="flex h-full w-full">
						<HistogramChart
							data={data}
							framesWithPoints={framesWithPoints}
							height={height}
							onFrameSelect={onFrameSelect}
							renderNestedBoxes={renderNestedBoxes}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
							hoverInfo={hoverInfo}
							scrollContainerRef={scrollContainerRef}
							onScroll={handleScroll}
						/>
						<div className="absolute right-0 top-0 h-full w-16 border-l border-[#181818] bg-black">
							<HistogramControls
								boxOffset={boxOffset}
								onOffsetChange={onOffsetChange}
								totalBoxes={data[0]?.boxes.length || 0}
								visibleBoxesCount={visibleBoxesCount}
								viewType={viewType}
								onViewChange={onViewChange}
								selectedFrame={selectedFrame}
								height={height}
							/>
						</div>
					</div>
				)}
			</div>
			{selectedFrame && (
				<SelectedFrameDetails
					selectedFrame={selectedFrame}
					visibleBoxes={visibleBoxes}
					onClose={() => onFrameSelect(null, null)}
				/>
			)}
			<TimeBar
				data={data}
				scrollLeft={scrollLeft}
				width={containerRef.current?.clientWidth ?? 0}
				visibleBoxesCount={visibleBoxesCount}
				boxOffset={boxOffset}
			/>
		</div>
	);
};

export default React.memo(HistogramManager);
