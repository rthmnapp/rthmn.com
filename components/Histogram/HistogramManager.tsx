"use client";
import React, {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import HistogramControls from "./HistogramControls";
import SelectedFrameDetails from "./SelectedFrameDetails";
import OffsetModal from "./OffsetModal";
import { ScaledBoxes } from "./ScaledBoxes";
import { SquareBoxes } from "./SquareBoxes";
import { LineBoxes } from "./LineBoxes";
import { Oscillator } from "./charts/Oscillator";
import type { BoxSlice } from "@/types";

const MIN_HISTOGRAM_HEIGHT = 100;
const MAX_HISTOGRAM_HEIGHT = 400;
const ZOOMED_BAR_WIDTH = 16;
const INITIAL_BAR_WIDTH = 16;
const DEFAULT_VISIBLE_BOXES_COUNT = 8;

interface HistogramManagerProps {
	data: BoxSlice[];
	height: number;
	onResize: (newHeight: number) => void;
	boxOffset: number;
	onOffsetChange: (newOffset: number) => void;
}

const HistogramManager: React.FC<HistogramManagerProps> = ({
	data,
	height,
	onResize,
	boxOffset,
	onOffsetChange,
}) => {
	const [viewType, setViewType] = useState<
		"scaled" | "even" | "chart" | "oscillator"
	>("oscillator");
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(height);
	const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [visibleBoxesCount, setVisibleBoxesCount] = useState(
		DEFAULT_VISIBLE_BOXES_COUNT,
	);
	const [customRangeStart, setCustomRangeStart] = useState(0);
	const [customRangeEnd, setCustomRangeEnd] = useState(
		DEFAULT_VISIBLE_BOXES_COUNT - 1,
	);

	const [internalBoxOffset, setInternalBoxOffset] = useState(boxOffset);

	useEffect(() => {
		setInternalBoxOffset(boxOffset);
	}, [boxOffset]);

	const currentFrame = useMemo(() => {
		return selectedFrame || (data.length > 0 ? data[0] : null);
	}, [selectedFrame, data]);

	const visibleBoxes = useMemo(() => {
		return currentFrame
			? currentFrame.boxes.slice(
					internalBoxOffset,
					internalBoxOffset + visibleBoxesCount,
				)
			: [];
	}, [currentFrame, internalBoxOffset, visibleBoxesCount]);

	const handleOffsetChange = useCallback(
		(change: number) => {
			const newOffset = internalBoxOffset + change;
			const maxOffset = (data[0]?.boxes.length || 0) - visibleBoxesCount;
			const clampedOffset = Math.max(0, Math.min(newOffset, maxOffset));
			setInternalBoxOffset(clampedOffset);
			onOffsetChange(clampedOffset);
		},
		[internalBoxOffset, data, visibleBoxesCount, onOffsetChange],
	);

	const handleViewChange = useCallback(
		(newViewType: "scaled" | "even" | "chart" | "oscillator") => {
			setViewType(newViewType);
		},
		[],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;
			const deltaY = startY - e.clientY;
			const newHeight = Math.min(
				Math.max(startHeight + deltaY, MIN_HISTOGRAM_HEIGHT),
				MAX_HISTOGRAM_HEIGHT,
			);
			onResize(newHeight);
		},
		[isDragging, startY, startHeight, onResize],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, [setIsDragging]);

	const handleFrameSelect = useCallback((frame: BoxSlice, index: number) => {
		setSelectedFrame((prev) => (prev === frame ? null : frame));
		setSelectedFrameIndex((prev) => (prev === index ? null : index));
	}, []);

	const handleRangeChange = useCallback(
		(start: number, end: number) => {
			setCustomRangeStart(start);
			setCustomRangeEnd(end);
			onOffsetChange(start);
			setVisibleBoxesCount(end - start + 1);
		},
		[onOffsetChange],
	);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const maxSize = useMemo(() => {
		const sizes = data.flatMap((slice) =>
			slice.boxes.map((box) => Math.abs(box.value)),
		);
		return sizes.reduce((max, size) => Math.max(max, size), 0);
	}, [data]);

	const renderNestedBoxes = useCallback(
		(
			boxArray: BoxSlice["boxes"],
			isSelected: boolean,
			meetingPointY: number,
			prevMeetingPointY: number | null,
			nextMeetingPointY: number | null,
			sliceWidth: number,
		): JSX.Element | null => {
			const visibleBoxArray = boxArray.slice(
				internalBoxOffset,
				internalBoxOffset + visibleBoxesCount,
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
							handleFrameClick={handleFrameSelect}
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
				case "chart":
					return (
						<LineBoxes
							boxArray={visibleBoxArray}
							isSelected={isSelected}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
							meetingPointY={meetingPointY}
							prevMeetingPointY={prevMeetingPointY}
							nextMeetingPointY={nextMeetingPointY}
							sliceWidth={sliceWidth}
						/>
					);
				case "oscillator":
					return (
						<Oscillator
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
		[
			viewType,
			maxSize,
			height,
			handleFrameSelect,
			internalBoxOffset,
			visibleBoxesCount,
		],
	);

	const framesWithPoints = useMemo(() => {
		// Use the original order of data (most recent at the end)
		return data.map((slice, index) => {
			const boxArray = slice.boxes;
			const isSelected = index === selectedFrameIndex;

			const boxHeight = height / visibleBoxesCount;
			const visibleBoxes = boxArray.slice(
				internalBoxOffset,
				internalBoxOffset + visibleBoxesCount,
			);
			const positiveBoxes = visibleBoxes.filter((box) => box.value > 0);
			const negativeBoxes = visibleBoxes.filter((box) => box.value <= 0);

			const totalNegativeHeight = negativeBoxes.length * boxHeight;
			const totalPositiveHeight = positiveBoxes.length * boxHeight;
			const meetingPointY =
				totalNegativeHeight +
				(height - totalNegativeHeight - totalPositiveHeight) / 2;

			const sliceWidth = isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH;

			return {
				frameData: {
					boxArray,
					isSelected,
					meetingPointY,
					sliceWidth,
				},
				meetingPointY,
				sliceWidth,
			};
		});
	}, [data, selectedFrameIndex, height, internalBoxOffset, visibleBoxesCount]);

	const DraggableBorder = ({
		onMouseDown,
	}: {
		onMouseDown: (e: React.MouseEvent) => void;
	}) => {
		return (
			<div
				className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
					isDragging
						? "shadow-2xl shadow-blue-500"
						: "hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500"
				}`}
				onMouseDown={onMouseDown}
			/>
		);
	};

	// Auto-scroll to the right when new data is received
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft =
				scrollContainerRef.current.scrollWidth;
		}
	}, [data]);

	return (
		<div className="absolute bottom-0 m-2 flex w-full items-center justify-center">
			<div
				className="relative flex w-full border border-[#181818] bg-black"
				style={{ height: `${height}px`, transition: "height 0.1s ease-out" }}
				ref={containerRef}
			>
				<DraggableBorder
					onMouseDown={(e) => {
						setIsDragging(true);
						setStartY(e.clientY);
						setStartHeight(height);
					}}
				/>

				{data && data.length > 0 && (
					<div className="flex h-full w-full">
						<div className="h-full w-full pr-16">
							{" "}
							{/* Add right padding to make space for controls */}
							<div
								className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
								role="region"
								aria-label="Histogram Chart"
								ref={scrollContainerRef}
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
										const { frameData, meetingPointY, sliceWidth } =
											frameWithPoint;
										const prevMeetingPointY =
											index > 0
												? framesWithPoints[index - 1].meetingPointY
												: null;
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
												onClick={() => handleFrameSelect(data[index], index)}
											>
												{renderNestedBoxes(
													frameData.boxArray,
													frameData.isSelected,
													meetingPointY,
													prevMeetingPointY,
													nextMeetingPointY,
													sliceWidth,
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<div className="absolute right-0 top-0 h-full w-16 border-l border-[#181818] bg-black">
							<HistogramControls
								boxOffset={internalBoxOffset}
								onOffsetChange={onOffsetChange}
								totalBoxes={data[0]?.boxes.length || 0}
								visibleBoxesCount={visibleBoxesCount}
								viewType={viewType}
								onViewChange={handleViewChange}
								selectedFrame={data[data.length - 1]}
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
					onClose={() => {
						setSelectedFrame(null);
						setSelectedFrameIndex(null);
					}}
				/>
			)}
			{isModalOpen && (
				<OffsetModal
					offset={internalBoxOffset}
					visibleBoxes={visibleBoxes}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default React.memo(HistogramManager);
