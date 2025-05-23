"use client";

import { motion } from "framer-motion";
import { LuBrain, LuGraduationCap, LuLineChart } from "react-icons/lu";

interface Props {
	experience: string;
	setExperience: (experience: string) => void;
}

const experiences = [
	{
		id: "beginner",
		icon: LuBrain,
		title: "Beginner",
		description: "I'm new to trading or have less than a year of experience",
	},
	{
		id: "intermediate",
		icon: LuGraduationCap,
		title: "Intermediate",
		description: "I have 1-3 years of trading experience",
	},
	{
		id: "advanced",
		icon: LuLineChart,
		title: "Advanced",
		description: "I have more than 3 years of trading experience",
	},
];

export default function ExperienceStep({ experience, setExperience }: Props) {
	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="space-y-2">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent"
				>
					Trading Experience
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-sm sm:text-base primary-text"
				>
					Help us personalize your experience by telling us about your trading
					background.
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
				className="grid gap-3 sm:gap-4"
			>
				{experiences.map((level, index) => {
					const Icon = level.icon;
					const isSelected = experience === level.id;

					return (
						<motion.button
							key={level.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 + index * 0.1 }}
							onClick={() => setExperience(level.id)}
							className={`group relative w-full overflow-hidden rounded-xl border bg-gradient-to-b p-0.5 transition-all duration-300 ${
								isSelected
									? "border-blue-400/50 from-blue-400/20 to-blue-400/0"
									: "border-[#1C1E23] from-[#0A0B0D] to-[#070809] hover:border-blue-400/30 hover:from-[#1A1A1A] hover:to-[#111]"
							}`}
						>
							{/* Highlight Effect */}
							<div
								className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
									isSelected
										? "from-blue-400/10 to-transparent opacity-100"
										: "from-[#1C1E23] to-transparent opacity-0 group-hover:opacity-100"
								}`}
							/>

							{/* Content Container */}
							<div className="relative flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-4">
								{/* Icon Container */}
								<div
									className={`rounded-lg bg-gradient-to-b p-2.5 sm:p-3 transition-colors duration-300 ${
										isSelected
											? "from-blue-400/30 via-blue-400/10 to-blue-400/5 text-blue-400"
											: "from-[#1C1E23] via-[#1C1E23] to-transparent primary-text group-hover:primary-text"
									}`}
								>
									<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
								</div>

								{/* Text Content */}
								<div className="flex-1 text-left">
									<div
										className={`text-sm sm:text-base font-medium transition-colors duration-300 ${isSelected ? "text-white" : "primary-text"}`}
									>
										{level.title}
									</div>
									<div
										className={`text-xs sm:text-sm transition-colors duration-300 ${isSelected ? "primary-text" : "primary-text"}`}
									>
										{level.description}
									</div>
								</div>

								{/* Selection Indicator */}
								<div
									className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors duration-300 ${isSelected ? "bg-blue-400" : "bg-[#32353C] group-hover:bg-[#32353C]"}`}
								/>
							</div>
						</motion.button>
					);
				})}
			</motion.div>
		</div>
	);
}
