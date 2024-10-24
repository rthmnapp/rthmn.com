'use client';
import React from 'react';
import { oxanium, outfit, russo } from '@/fonts';
import { motion } from 'framer-motion';
import { FaCube, FaChartLine, FaGamepad, FaRobot } from 'react-icons/fa';

const features = [
  {
    title: '3D Pattern Recognition',
    description:
      'Identify complex market patterns in an intuitive 3D environment.',
    icon: FaCube
  },
  {
    title: 'Real-time Analysis',
    description:
      'Get instant insights on market trends and potential opportunities.',
    icon: FaChartLine
  },
  {
    title: 'Gamified Learning',
    description:
      'Improve your trading skills through interactive, game-like experiences.',
    icon: FaGamepad
  },
  {
    title: 'AI-Powered Predictions',
    description:
      'Leverage advanced AI algorithms for more accurate market forecasts.',
    icon: FaRobot
  }
];

export const SectionFeatures: React.FC = () => {
  return (
    <section className={`bg-black pb-20 pt-60 lg:pt-20`}>
      <div className="flex flex-col items-center justify-center">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${outfit.className} w-full text-center text-4xl font-bold leading-[1.25em] md:text-5xl lg:w-1/3 lg:leading-[1.25em]`}
        >
          A Next Generation Algorithmic Trading Platform
        </motion.h2>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div> */}
      </div>
    </section>
  );
};
