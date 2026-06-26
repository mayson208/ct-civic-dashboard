// Realistic CT mock data — used as fallback when live API is unavailable.
// Mirrors exact shapes of live Socrata responses.

import type {
  UnemploymentRow, CovidRow, SpendingRow, GraduationRow, CrashRow, TownProfileRow,
} from './socrata'

// ── Unemployment ─────────────────────────────────────────────────────────────
const towns = ['Hartford', 'Bridgeport', 'New Haven', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich']
const baseRates: Record<string, number> = {
  Hartford: 7.8, Bridgeport: 8.4, 'New Haven': 7.2, Stamford: 4.1, Waterbury: 7.0,
  Norwalk: 3.9, Danbury: 4.5, 'New Britain': 6.8, 'West Hartford': 3.4, Greenwich: 2.9,
}
export const mockUnemployment: UnemploymentRow[] = towns.flatMap(town =>
  Array.from({ length: 36 }, (_, i) => {
    const date = new Date(2022, i % 12, 1)
    const yr = Math.floor(2022 + i / 12)
    const noise = (Math.random() - 0.5) * 1.2
    const rate = Math.max(1, baseRates[town] + noise + (i > 24 ? -0.8 : 0))
    return {
      town,
      year: String(yr),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      unemployment_rate: rate.toFixed(1),
      labor_force: String(Math.round(50000 + Math.random() * 200000)),
      employed: String(Math.round(48000 + Math.random() * 190000)),
      unemployed: String(Math.round(rate * 500)),
    }
  })
)

// ── COVID ────────────────────────────────────────────────────────────────────
export const mockCovid: CovidRow[] = Array.from({ length: 120 }, (_, i) => {
  const d = new Date(2021, 0, 1 + i * 3)
  const total = Math.round(80000 + i * 1200 + Math.random() * 500)
  return {
    date: d.toISOString().split('T')[0],
    town: 'Statewide',
    towntotalcases: String(total),
    confirmedcases: String(Math.round(total * 0.75)),
    probablecases: String(Math.round(total * 0.25)),
    towntotaldeaths: String(Math.round(total * 0.012)),
  }
})

// ── Spending ─────────────────────────────────────────────────────────────────
const agencies = ['Dept of Transportation', 'Dept of Education', 'Dept of Social Services', 'Dept of Correction', 'Judicial Branch', 'Office of Policy & Management', 'Dept of Public Health', 'State Police', 'Dept of Labor', 'Dept of Energy & Environment']
const categories = ['Personnel Services', 'Other Expenses', 'Capital Outlay', 'Grants', 'Debt Service']
export const mockSpending: SpendingRow[] = agencies.flatMap(agency =>
  ['2022', '2023', '2024'].flatMap(yr =>
    categories.map(cat => ({
      fiscal_year: yr,
      agency,
      category: cat,
      amount: String(Math.round((5e6 + Math.random() * 150e6) * 100) / 100),
    }))
  )
)

// ── Graduation ───────────────────────────────────────────────────────────────
const districts = ['Hartford', 'Bridgeport', 'New Haven', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich', 'Fairfield', 'Shelton', 'Milford', 'Glastonbury']
export const mockGraduation: GraduationRow[] = districts.flatMap(district =>
  ['2021', '2022', '2023'].map(year => ({
    district,
    year,
    graduation_rate: String(Math.round(70 + Math.random() * 25 + (district === 'Greenwich' || district === 'Glastonbury' ? 8 : 0))),
    cohort_count: String(Math.round(200 + Math.random() * 800)),
    subgroup: 'All Students',
  }))
)

// ── Crashes ──────────────────────────────────────────────────────────────────
export const mockCrashes: CrashRow[] = towns.flatMap(town =>
  ['2020', '2021', '2022', '2023'].map(year => ({
    year,
    town,
    total_crashes: String(Math.round(200 + Math.random() * 1800)),
    injuries: String(Math.round(80 + Math.random() * 600)),
    fatalities: String(Math.round(1 + Math.random() * 8)),
  }))
)

// ── Town Profiles ────────────────────────────────────────────────────────────
const counties: Record<string, string> = {
  Hartford: 'Hartford', Bridgeport: 'Fairfield', 'New Haven': 'New Haven',
  Stamford: 'Fairfield', Waterbury: 'New Haven', Norwalk: 'Fairfield',
  Danbury: 'Fairfield', 'New Britain': 'Hartford', 'West Hartford': 'Hartford', Greenwich: 'Fairfield',
}
export const mockTownProfiles: TownProfileRow[] = towns.map(town => ({
  town,
  county: counties[town],
  population: String(Math.round(30000 + Math.random() * 170000)),
  median_household_income: String(Math.round(45000 + Math.random() * 90000)),
  per_capita_income: String(Math.round(28000 + Math.random() * 55000)),
  poverty_rate: String(Math.round(4 + Math.random() * 20)),
  land_area_sq_miles: String(Math.round(10 + Math.random() * 50)),
}))
