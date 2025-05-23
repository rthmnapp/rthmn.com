"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LuImagePlus, LuUpload } from "react-icons/lu";

interface Props {
	onPhotoUpload: (url: string) => void;
}

export default function ProfileUpload({ onPhotoUpload }: Props) {
	const [isLoading, setIsLoading] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			setIsLoading(true);
			const file = e.target.files?.[0];
			if (!file) return;

			// Validate file type
			if (!file.type.startsWith("image/")) {
				throw new Error("Please upload an image file");
			}

			// Validate file size (e.g., 2MB limit)
			if (file.size > 2 * 1024 * 1024) {
				throw new Error("File size must be less than 2MB");
			}

			// Create a preview
			const objectUrl = URL.createObjectURL(file);
			setPreview(objectUrl);

			// Convert image to base64 for localStorage
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				localStorage.setItem("avatar_url", base64String);
				onPhotoUpload(base64String);
				router.refresh();
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Error uploading photo:", error);
			alert(error instanceof Error ? error.message : "Error uploading photo");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClick = () => {
		if (!isLoading) {
			fileInputRef.current?.click();
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			const fakeEvent = {
				target: { files: [file] },
			} as unknown as React.ChangeEvent<HTMLInputElement>;
			await handleFileUpload(fakeEvent);
		}
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="space-y-2">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent"
				>
					Welcome to Rthmn
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-sm sm:text-base primary-text"
				>
					You can add a profile photo to personalize your experience, or skip
					this step.
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.2 }}
				className="flex justify-center py-2 sm:py-4"
			>
				<div className="relative">
					{/* Hidden file input */}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileUpload}
						disabled={isLoading}
					/>

					{/* Upload Area */}
					<div
						onClick={handleClick}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className="relative"
					>
						{/* Main upload button/area */}
						<motion.div
							animate={{
								scale: isDragging ? 1.02 : 1,
								borderColor: isDragging ? "#3FFFA2" : "rgb(51, 51, 51)",
							}}
							className={`group relative flex h-48 w-48 sm:h-64 sm:w-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:transition-colors ${
								isDragging
									? "border-blue-400 before:from-blue-400/[0.05]"
									: "border-[#1C1E23]  hover:border-blue-400/50 hover:before:from-[#1C1E23]"
							}`}
						>
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/0 via-black/5 to-black/20" />
							<AnimatePresence mode="wait">
								{preview ? (
									<motion.div
										key="preview"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="relative z-10 h-full w-full"
									>
										<Image
											src={preview}
											alt="Profile"
											fill
											className="object-cover"
											sizes="(max-width: 640px) 192px, 256px"
											priority
										/>
										{/* Hover overlay with glass effect */}
										<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/0 via-black/20 to-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
											<div className="flex items-center gap-2 rounded-full bg-[#1C1E23] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-md">
												<LuUpload className="h-3 w-3 sm:h-4 sm:w-4" />
												Change Photo
											</div>
										</div>
									</motion.div>
								) : (
									<motion.div
										key="upload"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 text-center"
									>
										<div className="rounded-full bg-gradient-to-b from-blue-400/30 via-blue-400/10 to-blue-400/5 p-3 sm:p-4 transition-colors duration-300 group-hover:from-blue-400/40 group-hover:via-blue-400/20 group-hover:to-blue-400/10">
											<LuImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
										</div>
										<div className="space-y-1 sm:space-y-2">
											<div className="text-xs sm:text-sm font-medium text-white">
												Drop your photo here
											</div>
											<div className="text-[10px] sm:text-xs primary-text">
												or click to browse
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>

						{/* Loading Overlay */}
						<AnimatePresence>
							{isLoading && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-gradient-to-b from-black/60 via-black/70 to-black/80 backdrop-blur-sm"
								>
									<div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-white/30 border-b-white"></div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* File type info */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs primary-text"
					>
						PNG or JPG (max. 2MB)
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
