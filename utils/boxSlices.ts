import { PairData, Box, OHLC, BoxSlice } from '@/types';

interface ApiResponse {
  status: string;
  message?: string;
  data: Array<{
    timestamp: string;
    boxes: Array<{
      high: number;
      low: number;
      value: number;
    }>;
    currentOHLC: OHLC;
  }>;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toISOString();
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://server-rthmn-com.onrender.com';

export async function getBoxSlices(
  pair: string,
  lastTimestamp?: string,
  count?: number,
  serverToken?: string
): Promise<BoxSlice[]> {
  let url = `${BASE_URL}/boxslices/${pair}`;

  const params = new URLSearchParams();
  if (lastTimestamp)
    params.append('lastTimestamp', formatTimestamp(lastTimestamp));
  if (count) params.append('count', count.toString());

  if (params.toString()) url += `?${params.toString()}`;

  try {
    if (!serverToken) {
      console.error('No server token provided');
      return [];
    }

    const headers = {
      Authorization: `Bearer ${serverToken}`
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return [];
    }

    const responseText = await response.text();

    if (!responseText.trim()) {
      console.error('API returned an empty response');
      return [];
    }

    let apiResponse: ApiResponse;

    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      console.error('Problematic response text:', responseText);
      return [];
    }

    if (typeof apiResponse !== 'object' || apiResponse === null) {
      console.error('API response is not an object:', apiResponse);
      return [];
    }

    if ('status' in apiResponse && apiResponse.status === 'error') {
      console.error('API returned an error:', apiResponse.message);
      console.error('Full error response:', apiResponse);
      return [];
    }

    if (!('data' in apiResponse) || !Array.isArray(apiResponse.data)) {
      console.error('Invalid API response structure:', apiResponse);
      return [];
    }

    const transformedData: BoxSlice[] = apiResponse.data.map((item) => ({
      timestamp: item.timestamp,
      boxes: item.boxes.map((box) => ({
        high: box.high,
        low: box.low,
        value: box.value
      })),
      currentOHLC: item.currentOHLC
    }));

    return transformedData;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

export async function getLatestBoxSlices(
  serverToken?: string
): Promise<Record<string, PairData>> {
  const url = `${BASE_URL}/latest-boxslices`;

  try {
    const token = serverToken;

    if (!token) {
      console.error('No token available for request');
      return {};
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return {};
    }
    const apiResponse = await response.json();

    if (
      !apiResponse ||
      apiResponse.status !== 'success' ||
      typeof apiResponse.data !== 'object'
    ) {
      console.error('Invalid API response:', apiResponse);
      return {};
    }

    const convertedData: Record<string, PairData> = {};
    for (const [pair, data] of Object.entries(apiResponse.data)) {
      if (
        typeof data === 'object' &&
        data !== null &&
        'boxes' in data &&
        'currentOHLC' in data
      ) {
        const boxSlice: BoxSlice = {
          timestamp: new Date().toISOString(),
          boxes: (data.boxes as Box[]) || []
        };
        convertedData[pair] = {
          boxes: [boxSlice],
          currentOHLC: data.currentOHLC as OHLC
        };
      }
    }

    return convertedData;
  } catch (error) {
    console.error('Fetch error:', error);
    return {};
  }
}
