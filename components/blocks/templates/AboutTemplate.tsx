import React from 'react';
import type { PortableTextComponents } from '@portabletext/react';
import { TeamCard } from '@/app/(public)/about/TeamCard';

const NormalText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex w-full justify-center p-3">
    <p className="w-full font-outfit text-lg leading-relaxed text-white/70 md:w-3/4 lg:w-1/2">
      {children}
    </p>
  </div>
);

const Heading: React.FC<{ children: React.ReactNode; level: number }> = ({
  children,
  level
}) => {
  const baseStyle = 'font-outfit text-gray-gradient font-bold tracking-wide';
  const sizes = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-4xl lg:text-6xl',
    3: 'text-2xl lg:text-3xl',
    4: 'text-xl lg:text-2xl'
  };

  return (
    <div className="flex w-full justify-center p-3">
      <div
        className={`w-full md:w-3/4 lg:w-1/2 ${baseStyle} ${sizes[level as keyof typeof sizes]}`}
      >
        {children}
      </div>
    </div>
  );
};

export const AboutTemplate: PortableTextComponents = {
  block: {
    normal: ({ children }) => <NormalText>{children}</NormalText>,
    h1: ({ children }) => <Heading level={1}>{children}</Heading>,
    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
    h4: ({ children }) => <Heading level={4}>{children}</Heading>
  },
  list: {
    bullet: ({ children }) => (
      <div className="flex w-full justify-center p-3">
        <ul className="w-full list-disc space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2">
          {children}
        </ul>
      </div>
    ),
    number: ({ children }) => (
      <div className="flex w-full justify-center p-3">
        <ol className="w-full list-decimal space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2">
          {children}
        </ol>
      </div>
    )
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-cyan-400 transition-colors duration-200 hover:text-cyan-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white/90">{children}</strong>
    )
  },
  types: {
    teamGrid: () => (
      <div className="w-full py-8 lg:px-[20vw]">
        <TeamCard />
      </div>
    ),
    image: ({ value }) => (
      <div className="flex w-full justify-center p-3">
        <div className="w-full overflow-hidden rounded-xl md:w-3/4 lg:w-1/2">
          <img
            src={value?.asset?.url}
            alt={value?.alt || ''}
            className="h-auto w-full"
          />
        </div>
      </div>
    )
  }
};
