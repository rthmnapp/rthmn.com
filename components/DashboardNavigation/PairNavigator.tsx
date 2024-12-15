'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDashboard } from '@/providers/DashboardProvider';
import { useSwipeable } from 'react-swipeable';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import {
  LuDollarSign,
  LuBitcoin,
  LuList,
  LuBookmark,
  LuSearch
} from 'react-icons/lu';
import { PairItem } from './PairItem';

const navigationButtons = [
  { mode: 'favorites', label: 'Favorites', icon: LuBookmark },
  { mode: 'fx', label: 'FX', icon: LuDollarSign },
  { mode: 'crypto', label: 'Crypto', icon: LuBitcoin },
  { mode: 'all', label: 'All', icon: LuList }
];

const useIntersectionObserver = (
  scrollRef: React.RefObject<HTMLDivElement>,
  currentPairs: string[],
  setActiveIndex: (index: number) => void
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            const index = parseInt(
              entry.target.getAttribute('data-index') || '0'
            );
            setActiveIndex(index);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.7,
        rootMargin: '-35% 0px -35% 0px'
      }
    );

    const pairElements = document.querySelectorAll('.pair-item');
    pairElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [currentPairs, scrollRef, setActiveIndex]);
};

const EmptyFavorites = ({
  viewMode,
  setViewMode
}: {
  viewMode: string;
  setViewMode: (mode: string) => void;
}) => (
  <div className="fixed bottom-24 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 border-t border-[#222] bg-black backdrop-blur-sm">
    <div className="flex h-full flex-col px-3">
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#818181]">
        <span>No instruments added to watchlist</span>
        <span className="mt-1 text-xs">Use the search bar to add pairs</span>
      </div>

      <PairFilters viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  </div>
);

const PairFilters = ({
  viewMode,
  setViewMode
}: {
  viewMode: string;
  setViewMode: (mode: string) => void;
}) => (
  <div className="absolute right-0 bottom-22 left-0 z-[1000] flex items-center justify-center gap-2 py-2">
    {navigationButtons.map((button) => (
      <PairFilterButtons
        key={button.mode}
        icon={button.icon}
        isActive={viewMode === button.mode}
        onClick={() => setViewMode(button.mode)}
        label={button.label}
      />
    ))}
  </div>
);

interface PairNavigatorProps {
  isModalOpen?: boolean;
}

export const PairNavigator = ({ isModalOpen }: PairNavigatorProps) => {
  const { selectedPairs, togglePair, pairData } = useDashboard();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<string>('favorites');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRemoveForPair, setShowRemoveForPair] = useState<string | null>(
    null
  );
  const [selectedPairForModal, setSelectedPairForModal] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const lastScrollTop = useRef(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const lastScrollPosition = useRef(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const resetStates = useCallback(() => {
    setShowRemoveForPair(null);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const groupedPairs: { [key: string]: string[] } = {
    FX: [...FOREX_PAIRS] as string[],
    CRYPTO: [...CRYPTO_PAIRS] as string[]
  };

  const currentPairs =
    viewMode === 'favorites'
      ? selectedPairs
      : viewMode === 'fx'
        ? [...FOREX_PAIRS]
        : viewMode === 'crypto'
          ? [...CRYPTO_PAIRS]
          : ([...FOREX_PAIRS, ...CRYPTO_PAIRS] as string[]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      resetStates();
    }
  }, [resetStates]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      scrollElement.addEventListener('touchmove', handleScroll, {
        passive: true
      });

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        scrollElement.removeEventListener('touchmove', handleScroll);
      };
    }
  }, [handleScroll]);

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);

    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-index="${index}"]`);
      const container = scrollRef.current;

      if (element && container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const scrollTop =
          container.scrollTop +
          elementRect.top -
          containerRect.top -
          (containerRect.height - elementRect.height) / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    });
  };

  const handlers = useSwipeable({
    onSwipedUp: () => {
      resetStates();
      const nextIndex = Math.min(activeIndex + 1, currentPairs.length - 1);
      handleIndexChange(nextIndex);
    },
    onSwipedDown: () => {
      resetStates();
      const prevIndex = Math.max(activeIndex - 1, 0);
      handleIndexChange(prevIndex);
    },
    onSwiping: () => {
      resetStates();
    },
    onTouchStartOrOnMouseDown: () => {
      // Reset on any touch/mouse interaction
      resetStates();
    },
    trackMouse: true,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    delta: 50
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [viewMode]);

  useIntersectionObserver(scrollRef, currentPairs, setActiveIndex);

  useEffect(() => {
    setShowRemoveForPair(null);
  }, [viewMode]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    const handleScroll = () => {
      if (scrollElement) {
        const currentScroll = scrollElement.scrollTop;
        const scrollDiff = Math.abs(currentScroll - lastScrollPosition.current);

        // If scrolled more than 2px, reset states
        if (scrollDiff > 2) {
          resetStates();
        }

        lastScrollPosition.current = currentScroll;
      }
    };

    scrollElement?.addEventListener('scroll', handleScroll);

    // Also handle touch events
    const handleTouch = () => {
      resetStates();
    };

    scrollElement?.addEventListener('touchstart', handleTouch);
    scrollElement?.addEventListener('touchmove', handleTouch);

    return () => {
      scrollElement?.removeEventListener('scroll', handleScroll);
      scrollElement?.removeEventListener('touchstart', handleTouch);
      scrollElement?.removeEventListener('touchmove', handleTouch);
    };
  }, [resetStates]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      console.log('🔄 Scrolling detected');
      setIsScrolling(true);
      resetStates();

      // Clear previous timeout
      clearTimeout(scrollTimeout);

      // Set new timeout
      scrollTimeout = setTimeout(() => {
        console.log('⏹️ Scroll ended');
        setIsScrolling(false);
      }, 150);
    };

    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      scrollElement.addEventListener('touchmove', handleScroll, {
        passive: true
      });
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
        scrollElement.removeEventListener('touchmove', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, [resetStates]);

  if (viewMode === 'favorites' && selectedPairs.length === 0) {
    return <EmptyFavorites viewMode={viewMode} setViewMode={setViewMode} />;
  }

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-[90] rounded-t-3xl rounded-t-[3em] border-t border-[#222] bg-black/95 pt-4 transition-all duration-300 ${
        isModalOpen ? 'h-[175px] lg:hidden' : 'h-[50vh]'
      }`}
    >
      <div className="pointer-events-none absolute top-2 right-0 left-0 z-[98] h-24 rounded-t-[3em] bg-gradient-to-b from-black via-black/95 to-transparent" />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div
        ref={scrollRef}
        className="relative z-[96] h-[calc(100%-60px)] w-full overflow-hidden px-4"
        {...handlers}
      >
        <div
          className="scrollbar-none flex h-full flex-col overflow-y-scroll overscroll-none scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="mb-[25vh] pt-2">
            <PairList
              viewMode={viewMode}
              currentPairs={currentPairs}
              groupedPairs={groupedPairs}
              activeIndex={activeIndex}
              pairData={pairData}
              selectedPairs={selectedPairs}
              showRemoveForPair={showRemoveForPair}
              handleIndexChange={handleIndexChange}
              togglePair={togglePair}
              setShowRemoveForPair={setShowRemoveForPair}
              resetTrigger={resetTrigger}
              isScrolling={isScrolling}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-[180] h-40 bg-gradient-to-t from-black via-black/95 to-transparent" />
        {!isModalOpen && (
          <PairFilters viewMode={viewMode} setViewMode={setViewMode} />
        )}
      </div>
    </div>
  );
};

const PairList = ({
  viewMode,
  currentPairs,
  groupedPairs,
  activeIndex,
  pairData,
  selectedPairs,
  showRemoveForPair,
  handleIndexChange,
  togglePair,
  setShowRemoveForPair,
  resetTrigger,
  isScrolling
}: {
  viewMode: string;
  currentPairs: string[];
  groupedPairs: { [key: string]: string[] };
  activeIndex: number;
  pairData: { [key: string]: any };
  selectedPairs: string[];
  showRemoveForPair: string | null;
  handleIndexChange: (index: number) => void;
  togglePair: (pair: string) => void;
  setShowRemoveForPair: (pair: string) => void;
  resetTrigger: number;
  isScrolling: boolean;
}) => {
  const [resetCounter, setResetCounter] = useState(0);

  useEffect(() => {
    if (isScrolling) {
      console.log('🧹 Clearing actions due to scroll');
      triggerReset();
    }
  }, [isScrolling]);

  const triggerReset = useCallback(() => {
    setShowRemoveForPair(null);
  }, [setShowRemoveForPair]);

  if (viewMode === 'favorites') {
    return currentPairs.map((pair, index) => (
      <PairItem
        key={pair}
        pair={pair}
        index={index}
        isActive={activeIndex === index}
        isFavorite={selectedPairs.includes(pair)}
        currentPrice={pairData[pair]?.currentOHLC?.close}
        showRemove={showRemoveForPair === pair}
        onIndexChange={handleIndexChange}
        onRemove={() => {
          togglePair(pair);
          setShowRemoveForPair(null);
        }}
        onCancelRemove={() => setShowRemoveForPair(null)}
        setShowRemoveForPair={setShowRemoveForPair}
        toggleFavorite={() => togglePair(pair)}
        viewMode={viewMode}
        onViewClick={() => {}}
        onLongPressReset={triggerReset}
      />
    ));
  }

  return Object.entries(groupedPairs).map(([category, pairs]) => (
    <div key={category}>
      {pairs.map((pair, index) => (
        <PairItem
          key={pair}
          pair={pair}
          index={index}
          isActive={activeIndex === index}
          isFavorite={selectedPairs.includes(pair)}
          currentPrice={pairData[pair]?.currentOHLC?.close}
          showRemove={showRemoveForPair === pair}
          onIndexChange={handleIndexChange}
          onRemove={() => {
            togglePair(pair);
            setShowRemoveForPair(null);
          }}
          onCancelRemove={() => setShowRemoveForPair(null)}
          setShowRemoveForPair={setShowRemoveForPair}
          toggleFavorite={() => togglePair(pair)}
          viewMode={viewMode}
          onViewClick={() => {}}
          onLongPressReset={triggerReset}
        />
      ))}
    </div>
  ));
};

export const PairFilterButtons = ({
  icon: Icon,
  isActive,
  onClick,
  label
}: {
  icon: any;
  isActive: boolean;
  onClick: () => void;
  label: string;
}) => {
  return (
    <button onClick={onClick} className="group relative flex items-center">
      <div
        className={`group flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
          isActive
            ? 'from-[#444444] to-[#282828]'
            : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
        }`}
      >
        <div
          className={`font-outfit flex h-full w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] py-2 pr-4 pl-3 text-sm font-medium ${
            isActive ? 'text-gray-200' : 'text-[#818181]'
          }`}
        >
          <Icon size={14} />
          {label}
        </div>
      </div>
    </button>
  );
};

export const SearchBar = ({
  searchQuery,
  setSearchQuery
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="relative z-[99] flex justify-center px-4">
      <div className="relative flex w-full items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] shadow-xl transition-all duration-200 hover:from-[#444444] hover:to-[#282828] sm:max-w-[300px] lg:max-w-[300px]">
        <div className="flex h-12 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
          <LuSearch className="ml-4 h-5 w-5 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments..."
            className="font-outfit text-md ml-2 w-full bg-transparent pr-3 text-white placeholder-[#666] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
