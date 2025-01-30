import { createClient } from '@/utils/supabase/server';
import Client from './client';
import { getSubscription } from '@/utils/supabase/queries';
import { pairSnapshotQuery } from '@/utils/sanity/lib/queries';
import { sanityFetch } from '@/utils/sanity/lib/client';
import { processInitialChartData } from '@/utils/chartDataProcessor';
import { processInitialBoxData } from '@/utils/boxDataProcessor';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

async function fetchSanityData(pair: string) {
    const snapshot = await sanityFetch<{ pair: string; candleData: string; lastUpdated: string }>({
        query: pairSnapshotQuery,
        qParams: { pair: pair.toUpperCase() },
        tags: ['pairSnapshot'],
    });

    const parsedData = JSON.parse(snapshot.candleData);

    return [...parsedData].reverse().map((candle) => ({
        timestamp: new Date(candle.timestamp).getTime(),
        close: Number(candle.close),
        high: Number(candle.high),
        low: Number(candle.low),
        open: Number(candle.open),
        volume: 0,
    }));
}

async function fetchApiData(pair: string, token: string) {
    const CANDLE_LIMIT = 1000;
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data } = await response.json();
    return [...data].reverse().map((candle) => ({
        timestamp: new Date(candle.timestamp).getTime(),
        close: Number(candle.close),
        high: Number(candle.high),
        low: Number(candle.low),
        open: Number(candle.open),
        volume: 0,
    }));
}

export default async function PairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;
    const supabase = await createClient();
    const subscription = await getSubscription(supabase);
    const hasSubscription = subscription?.status === 'active';

    let rawCandleData = [];
    if (hasSubscription) {
        const session = await supabase.auth.getSession();
        if (session.data.session?.access_token) {
            try {
                rawCandleData = await fetchApiData(pair, session.data.session.access_token);
            } catch (error) {
                console.error('Error fetching API data:', error);
                // Fallback to Sanity data if API fails
                rawCandleData = await fetchSanityData(pair);
            }
        }
    } else {
        rawCandleData = await fetchSanityData(pair);
    }

    const { processedCandles, initialVisibleData } = processInitialChartData(rawCandleData);
    const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(processedCandles, pair);

    return (
        <Client
            pair={pair}
            chartData={{
                processedCandles,
                initialVisibleData,
                histogramBoxes,
                histogramPreProcessed,
            }}
        />
    );
}
