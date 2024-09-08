import { oxanium } from "@/app/fonts";
import { Scene } from "./Scene";
import React from "react";

export const HeroSection = () => (
	<div
		className={`flex h-screen w-full flex-col items-center justify-center ${oxanium.className}`}
	>
		<div className="w-full h-screen absolute">
			<Scene />
		</div>
		<div className="relative z-10 flex justify-center items-center flex-col">
			<h1 className="heading-text font-bold block flex w-auto text-balance text-center text-[5rem] leading-[.9em] uppercase tracking-wide md:text-[9rem]">
				Trading
			</h1>
			<h1 className="heading-text block font-bold flex w-auto text-balance text-center text-[4rem] leading-[.9em] uppercase tracking-wide md:text-[8rem]">
				Gamified
			</h1>
			<div className="flex w-full flex-col items-center justify-center">
				<h2 className="primary-text w-11/12 font-normal text-balance py-6 text-center leading-[2rem] text-[1.25rem] text-gray-200 md:w-2/3 md:text-[1.5rem]">
					The world's first 3D pattern recognition tool designed to identify
					opportunities no one else sees.
				</h2>
			</div>
		</div>
	</div>
);