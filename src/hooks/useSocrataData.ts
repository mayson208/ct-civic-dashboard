import { useQuery } from '@tanstack/react-query'
import { fetchSocrata, type DatasetKey, type SocrataOptions } from '../api/socrata'
import {
  mockUnemployment, mockCovid, mockSpending, mockGraduation, mockCrashes, mockTownProfiles,
} from '../api/mockData'
import type {
  UnemploymentRow, CovidRow, SpendingRow, GraduationRow, CrashRow, TownProfileRow,
} from '../api/socrata'

// Fallbacks keyed by dataset — used if API call fails (CORS, rate limit, etc.)
const FALLBACKS: Record<DatasetKey, unknown[]> = {
  unemployment:  mockUnemployment,
  covid:         mockCovid,
  spending:      mockSpending,
  graduation:    mockGraduation,
  crashes:       mockCrashes,
  airQuality:    [],
  townProfiles:  mockTownProfiles,
}

async function fetchWithFallback<T>(key: DatasetKey, opts: SocrataOptions): Promise<T[]> {
  try {
    const data = await fetchSocrata<T>(key, opts)
    if (!data || data.length === 0) throw new Error('empty')
    return data
  } catch {
    return FALLBACKS[key] as T[]
  }
}

export function useUnemployment(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['unemployment', opts],
    queryFn: () => fetchWithFallback<UnemploymentRow>('unemployment', { limit: 2000, order: 'year DESC, month DESC', ...opts }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useCovid(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['covid', opts],
    queryFn: () => fetchWithFallback<CovidRow>('covid', { limit: 500, order: 'date DESC', ...opts }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useSpending(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['spending', opts],
    queryFn: () => fetchWithFallback<SpendingRow>('spending', { limit: 2000, ...opts }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useGraduation(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['graduation', opts],
    queryFn: () => fetchWithFallback<GraduationRow>('graduation', { limit: 1000, order: 'year DESC', ...opts }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useCrashes(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['crashes', opts],
    queryFn: () => fetchWithFallback<CrashRow>('crashes', { limit: 1000, ...opts }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useTownProfiles(opts: SocrataOptions = {}) {
  return useQuery({
    queryKey: ['townProfiles', opts],
    queryFn: () => fetchWithFallback<TownProfileRow>('townProfiles', { limit: 169, ...opts }),
    staleTime: 1000 * 60 * 60 * 24,
  })
}
