// exchange rate service for EUR <-> KES conversion
// uses open.er-api.com (free, no api key needed)

import { useState, useEffect } from 'react';

const CACHE_KEY = 'exchange_rate_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedRate {
  rate: number;
  timestamp: number;
}

interface ApiResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

interface UseExchangeRateResult {
  rate: number | null;
  loading: boolean;
  toKes: (eur: number) => number | null;
}

// check if we have a valid cached rate
function getCachedRate(): number | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedRate = JSON.parse(cached);
    const age = Date.now() - data.timestamp;

    if (age < CACHE_DURATION) {
      return data.rate;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedRate(rate: number): void {
  try {
    const data: CachedRate = { rate, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable, ignore
  }
}

// get the last known rate even if expired (fallback for offline)
function getLastKnownRate(): number | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedRate = JSON.parse(cached);
    return data.rate;
  } catch {
    return null;
  }
}

async function fetchEurToKesRate(): Promise<number> {
  // check cache first
  const cached = getCachedRate();
  if (cached !== null) {
    return cached;
  }

  // fetch fresh rate from open.er-api.com
  const response = await fetch('https://open.er-api.com/v6/latest/EUR');

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (data.result !== 'success' || !data.rates?.KES) {
    throw new Error('Invalid API response');
  }

  const rate = data.rates.KES;
  setCachedRate(rate);
  return rate;
}

// hook for components to use exchange rate
export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState<number | null>(getLastKnownRate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchEurToKesRate()
      .then(r => {
        if (mounted) {
          setRate(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  function toKes(eur: number): number | null {
    if (rate === null) return null;
    return eur * rate;
  }

  return { rate, loading, toKes };
}

// format KES amount
export function formatKes(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
