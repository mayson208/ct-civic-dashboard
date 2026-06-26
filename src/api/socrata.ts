import axios from 'axios'

const BASE = 'https://data.ct.gov/resource'

// Dataset IDs on data.ct.gov
export const DATASETS = {
  // CT Dept of Labor — Unemployment Rates by Town
  unemployment:     'n7iy-f2vf',
  // CT Dept of Health — COVID-19 Cases by Date
  covid:            'rf3k-f8fg',
  // CT Open Checkbook — State Expenditures
  spending:         'cyay-hrve',
  // CT Education — Graduation Rates by District
  graduation:       '9k2y-kqxn',
  // CT DMV — Motor Vehicle Crash Statistics
  crashes:          '73jg-3sby',
  // CT DEEP — Environmental Monitoring
  airQuality:       'rjjf-qcv9',
  // CT Office of Policy and Management — Town Profiles
  townProfiles:     'ukr5-vzdz',
} as const

export type DatasetKey = keyof typeof DATASETS

export interface SocrataOptions {
  limit?: number
  offset?: number
  where?: string
  order?: string
  select?: string
  q?: string
}

export async function fetchSocrata<T>(
  datasetKey: DatasetKey,
  options: SocrataOptions = {}
): Promise<T[]> {
  const id = DATASETS[datasetKey]
  const params: Record<string, string | number> = {
    $limit: options.limit ?? 1000,
  }
  if (options.offset)  params['$offset']  = options.offset
  if (options.where)   params['$where']   = options.where
  if (options.order)   params['$order']   = options.order
  if (options.select)  params['$select']  = options.select
  if (options.q)       params['$q']       = options.q

  const { data } = await axios.get<T[]>(`${BASE}/${id}.json`, { params })
  return data
}

// ─── Typed response shapes ───────────────────────────────────────────────────

export interface UnemploymentRow {
  town: string
  year: string
  month: string
  labor_force?: string
  employed?: string
  unemployed?: string
  unemployment_rate?: string
  period?: string
}

export interface CovidRow {
  date: string
  town: string
  towntotalcases?: string
  confirmedcases?: string
  probablecases?: string
  towntotaldeaths?: string
}

export interface SpendingRow {
  fiscal_year: string
  agency: string
  category?: string
  account?: string
  vendor?: string
  amount?: string
  fund?: string
}

export interface GraduationRow {
  district: string
  year: string
  graduation_rate?: string
  cohort_count?: string
  graduated?: string
  subgroup?: string
}

export interface CrashRow {
  year: string
  town?: string
  crash_type?: string
  total_crashes?: string
  injuries?: string
  fatalities?: string
}

export interface TownProfileRow {
  town: string
  county?: string
  population?: string
  median_household_income?: string
  per_capita_income?: string
  poverty_rate?: string
  land_area_sq_miles?: string
}
