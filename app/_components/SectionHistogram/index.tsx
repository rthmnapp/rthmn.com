'use client';
import type React from 'react';
import type { BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { sequences } from '@/app/_components/constants';
import { MotionDiv } from '@/components/MotionDiv';
import { TypeAnimation } from 'react-type-animation';
import { POSITION_STATES } from '@/app/_components/text';
import { HistoricalPatternView } from './HistoricalPatternView';

interface BoxComponentProps {
  slice: BoxSlice | null;
}

export const SectionHistogram: React.FC<BoxComponentProps> = ({ slice }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

  const POINT_OF_CHANGE_INDEX = 29;
  const PAUSE_DURATION = 1000;
  const BOX_COUNT = 8;
  const TOTAL_CONTAINER_HEIGHT = 400;
  const HEADER_HEIGHT = 32;
  const FOOTER_HEIGHT = 24;
  const AVAILABLE_HEIGHT = TOTAL_CONTAINER_HEIGHT - FOOTER_HEIGHT;
  const BOX_SIZE = Math.floor(AVAILABLE_HEIGHT / BOX_COUNT);
  const PATTERN_WIDTH = BOX_SIZE + 4;

  const dimensions = {
    totalHeight: TOTAL_CONTAINER_HEIGHT,
    headerHeight: HEADER_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
    availableHeight: AVAILABLE_HEIGHT,
    boxSize: BOX_SIZE,
    patternWidth: PATTERN_WIDTH
  };

  useEffect(() => {
    if (tableRef.current) {
      const scrollContainer = tableRef.current;
      const currentRow = scrollContainer.querySelector('.current-pattern-row');
      if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [demoStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPatternIndex = Math.floor(demoStep / 1) % sequences.length;

      if (currentPatternIndex === POINT_OF_CHANGE_INDEX && !isPaused) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
        }, PAUSE_DURATION);
        return;
      }

      if (!isPaused) {
        setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-32 lg:px-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent"></div>
      <div className="relative flex w-full flex-col gap-24 px-8">
        <div className="relative flex flex-col items-center text-center">
          <div className="text-kodemono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            ADVANCED PATTERN RECOGNITION
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          <h2
            className={`text-outfit text-gray-gradient relative z-10 text-7xl font-bold leading-tight tracking-tight`}
          >
            The Future of
            <br />
            Financial Analysis
          </h2>
          <TypeAnimation
            sequence={[
              'Uncover hidden patterns in market data with a new type of visualization.',
              1000,
              '',
              100,
              'Predict market trends with a deterministic chart analysis tool.',
              1000,
              '',
              100,
              'Optimize your trading strategy with real-time chart indicators.',
              1000,
              '',
              100
            ]}
            wrapper="h2"
            speed={50}
            deletionSpeed={80}
            className={`text-kodemono text-dark-gray w-11/12 pt-6 text-xl`}
            repeat={Infinity}
          />
        </div>

        <HistoricalPatternView
          tableRef={tableRef}
          demoStep={demoStep}
          patterns={sequences}
          dimensions={dimensions}
          onPause={() => setIsPaused(true)}
          onResume={() => setIsPaused(false)}
          onNext={() =>
            setDemoStep((prev) => (prev + 1) % totalStepsRef.current)
          }
          onPrevious={() =>
            setDemoStep(
              (prev) =>
                (prev - 1 + totalStepsRef.current) % totalStepsRef.current
            )
          }
          isPaused={isPaused}
        />
      </div>
      <div className="mx-auto max-w-7xl px-8 py-20">
        <div className="mb-16 text-center">
          <div
            className={`text-kodemono text-kodemono text-gray mb-6 flex items-center justify-center gap-3 text-sm tracking-wider`}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            POSITION STATES
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <h2
            className={`text-gray-gradient text-outfit mb-8 from-white via-white to-white/60 text-4xl font-bold tracking-tight lg:text-5xl`}
          >
            8-Dimensional Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {POSITION_STATES.map((item, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-full bg-white/10 p-3">
                  <div
                    className={`text-kodemono text-lg font-bold text-white/80`}
                  >
                    {item.state}
                  </div>
                </div>
                <h3
                  className={`text-outfit text-lg font-semibold text-white/90`}
                >
                  {item.name}
                </h3>
              </div>
              <p className="text-kodemono text-sm text-white/60">
                {item.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
};
