import { LuBookOpen, LuGraduationCap, LuTrophy } from "react-icons/lu";
import { TourContentWrapper } from "./TourContentWrapper";

interface OnboardingContentProps {
	onComplete?: () => void;
}

export function TourOnboarding({ onComplete }: OnboardingContentProps) {
	return (
		<TourContentWrapper className="w-[350px]" onComplete={onComplete}>
			<div className="w-full p-2">
				<h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent">
					Learn
				</h3>
				<p className="text-[13px] leading-relaxed primary-text">
					Your personal trading education and onboarding center.
				</p>
			</div>
			<div className="space-y-2">
				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuGraduationCap className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Onboarding Progress
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Complete your setup and learn platform basics
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuBookOpen className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Trading Courses
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Access interactive lessons and trading guides
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuTrophy className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Skill Assessment
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Test your knowledge with trading quizzes
							</div>
						</div>
					</div>
				</div>
			</div>
		</TourContentWrapper>
	);
}
