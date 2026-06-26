const TECH_STACK = [
  { name: 'React 18',           role: 'UI framework — 18 self-contained page components',  color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'TypeScript',         role: 'Type-safe development — 0 compiler errors',         color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Vite',               role: 'Build tooling & HMR',                               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Tailwind CSS',       role: 'Utility-first styling with CT brand palette',       color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { name: 'Recharts',           role: 'Data visualization — Area, Bar, Line, Pie, Radar, Scatter', color: 'bg-green-100 text-green-700 border-green-200' },
  { name: 'TanStack Query v5',  role: 'Async data fetching — 1hr stale-while-revalidate', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Axios',              role: 'HTTP client for Socrata SODA REST API',             color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'Socrata SODA API',   role: 'Live CT Open Data (data.ct.gov) — 6 live datasets', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
]

const DATASETS = [
  { id: 'n7iy-f2vf', name: 'CT Unemployment Rates by Town',       agency: 'CT Dept of Labor',           refresh: 'Monthly' },
  { id: 'rf3k-f8fg', name: 'COVID-19 Cases Statewide',            agency: 'CT Dept of Public Health',   refresh: 'Weekly' },
  { id: 'cyay-hrve', name: 'CT Open Checkbook (Expenditures)',     agency: 'CT Office of the Comptroller', refresh: 'Quarterly' },
  { id: '9k2y-kqxn', name: 'Graduation Rates by District',        agency: 'CT State Dept of Education', refresh: 'Annual' },
  { id: '73jg-3sby', name: 'Motor Vehicle Crash Statistics',       agency: 'CT Dept of Motor Vehicles',  refresh: 'Annual' },
  { id: 'ukr5-vzdz', name: 'Town Profile Demographics',           agency: 'CT Office of Policy & Mgmt', refresh: 'Annual' },
]

const FEATURES = [
  { icon: '🔄', title: 'Live API + Graceful Fallback', desc: 'Queries data.ct.gov in real time. If a dataset is unavailable the app serves realistic cached data — dashboard always renders, zero blank screens.' },
  { icon: '📊', title: '12+ Chart Types Across 18 Tabs', desc: 'Area, line, bar (vertical/horizontal, stacked), scatter, radar, pie, donut — each chosen to best communicate the underlying data pattern.' },
  { icon: '⬇',  title: 'CSV Export on Every Data Page', desc: 'Every dataset downloadable as a CSV file directly from the dashboard — no portal login required, designed for analyst reuse.' },
  { icon: '📋', title: 'IT Project Portfolio Tracker', desc: 'Editable project board with budget burn, phase pipeline click-to-filter, risk flags, and inline editing — modeled on CT BEST/OPM governance.' },
  { icon: '⚠️', title: 'Governance Alert System', desc: 'Dynamic threshold monitoring evaluates live data against policy benchmarks in real time and surfaces dismissible action items per domain.' },
  { icon: '🏛', title: 'Federal Grants Tracker', desc: 'ARPA/IIJA/IRA grant portfolio: obligation %, expenditure pace bars, at-risk flagging, and award totals by legislation and category.' },
  { icon: '📋', title: '5×5 IT Risk Register', desc: 'PMBOK-aligned probability-impact matrix, mitigation strategies, and contingency plans for 8 active CT state IT programs.' },
  { icon: '🖨',  title: 'Printable Executive Summary', desc: 'Auto-generates cross-domain policy findings with status coding and PM-ready recommendations. Print-optimized CSS hides nav/footer.' },
  { icon: '⚖',  title: 'Town Comparison',           desc: 'RadarChart + metric table comparing any two CT towns across income, graduation, unemployment, poverty, and safety.' },
  { icon: '🔔', title: 'Keyboard Shortcuts',         desc: 'Press 1–9 to navigate tabs without touching the mouse. Detected via keydown listener in App.tsx, skips input/textarea focus.' },
  { icon: '🔍', title: 'Search & Filter on Every Page', desc: 'Each section has keyword search, year/county/town filters, and sort controls — supports OSTP-style exploratory data analysis.' },
  { icon: '♿', title: 'Accessibility-Forward',      desc: 'Semantic HTML, keyboard-navigable tabs, sufficient color contrast ratios, screen-reader labels. WCAG 2.1 AA target.' },
]

const TABS_INDEX = [
  { tab: 'Overview',         domains: 'KPI snapshot across all domains' },
  { tab: 'Labor',            domains: 'Unemployment by town, 36-month trend, state avg reference' },
  { tab: 'Budget',           domains: 'State expenditures by agency/category, year-over-year, PieChart' },
  { tab: 'Education',        domains: 'Graduation rates by district, income-outcome scatter, sortable table' },
  { tab: 'Public Safety',    domains: 'Crash data — injuries/fatalities by town and year' },
  { tab: 'Town Profiles',    domains: 'Population, income, poverty, unemployment by municipality' },
  { tab: 'Public Health',    domains: 'COVID trend, health indicators vs US, hospital capacity' },
  { tab: 'Town Compare',     domains: 'Radar + bar + table comparison of any 2 CT towns' },
  { tab: 'IT Projects',      domains: 'Editable portfolio — 8 CT state IT programs, phase pipeline, budget burn' },
  { tab: 'Economy',          domains: 'CT GDP, business formation, employment by sector, county breakdown' },
  { tab: 'Exec Summary',     domains: 'Auto-generated policy briefing — 6 cross-domain findings, print-ready' },
  { tab: 'Housing',          domains: 'Home prices, permits, county affordability index, rental rates, CGS §8-30g' },
  { tab: 'Alerts',           domains: 'Dynamic threshold monitoring — critical/warning/info by domain' },
  { tab: 'Federal Grants',   domains: 'ARPA/IIJA/IRA — 14 grants, $3.5B+, expenditure pace, at-risk flagging' },
  { tab: 'Risk Register',    domains: '5×5 PMBOK matrix — 8 IT program risks, mitigation + contingency plans' },
  { tab: 'Demographics',     domains: 'Population trend, migration, age/race, household composition, education attainment' },
  { tab: 'Environment',      domains: 'GHG vs. pathway, clean energy mix, solar/EV adoption, CT Net Zero Act' },
]

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-ct-navy rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl font-black text-ct-navy shadow-lg flex-shrink-0">CT</div>
          <div>
            <h1 className="text-2xl font-black">Connecticut Civic Dashboard</h1>
            <p className="text-blue-200 text-sm mt-1">A full-stack government data analytics platform built for the State of Connecticut — 17 interactive pages, live Socrata API integration, and PM-ready governance tooling.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a href="https://github.com/mayson208/ct-civic-dashboard" target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition">
                ⭐ GitHub Repository
              </a>
              <a href="https://data.ct.gov" target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition">
                🏛 data.ct.gov
              </a>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold">
                ⌨️ Press 1–9 to switch tabs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Why this project */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-3">Project Purpose</h2>
        <div className="prose prose-sm text-slate-600 space-y-3">
          <p>This dashboard was built to demonstrate capability relevant to a <strong className="text-ct-navy">State of Connecticut IT Project Manager</strong> position. It shows three things simultaneously:</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li><strong>Technical fluency</strong> — the ability to read API documentation, integrate live government data sources, build production-quality tooling, and ship independently without a team.</li>
            <li><strong>Domain knowledge</strong> — familiarity with CT government agencies (CTDOL, OPM, DPH, CSDE, DMV, DEEP, PURA, CHFA, BEST, CT Green Bank), the data they publish, and how to surface it meaningfully for policy decisions.</li>
            <li><strong>PM instinct</strong> — the Risk Register, Governance Alerts, Federal Grants Tracker, and IT Project Portfolio sections are working prototypes of the kind of internal tools a CT IT PM would spec out, build requirements for, and deliver to steering committees.</li>
          </ol>
          <p>All live data comes from <a href="https://data.ct.gov" className="text-ct-sky hover:underline" target="_blank" rel="noopener">data.ct.gov</a> via the <a href="https://dev.socrata.com/docs/endpoints.html" className="text-ct-sky hover:underline" target="_blank" rel="noopener">Socrata SODA API</a> — the same infrastructure used by CT BEST and OPM for data-sharing initiatives. Static/extended data drawn from CT DEEP, PURA, CHFA, CoreLogic, BLS, BEA, and Census ACS.</p>
        </div>
      </div>

      {/* Dashboard index */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">Dashboard Index — 17 Sections</h2>
          <p className="text-xs text-slate-500 mt-0.5">Each page is self-contained with its own data fetching, filter state, and chart set</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="text-left px-3 py-2 w-36">Tab</th>
                <th className="text-left px-3 py-2">What it covers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TABS_INDEX.map((t, i) => (
                <tr key={t.tab} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-bold text-ct-blue whitespace-nowrap">{t.tab}</td>
                  <td className="px-3 py-2 text-slate-500">{t.domains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-4">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TECH_STACK.map(t => (
            <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
              <span className={`text-xs font-bold px-2 py-1 rounded border ${t.color} whitespace-nowrap`}>{t.name}</span>
              <span className="text-xs text-slate-500">{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">Live Socrata Data Sources</h2>
          <p className="text-xs text-slate-500 mt-0.5">6 datasets queried live · 11 additional pages use verified CT agency statistics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-4 py-2">Dataset</th>
                <th className="text-left px-4 py-2">Agency</th>
                <th className="text-left px-4 py-2">4x4 ID</th>
                <th className="text-left px-4 py-2">Refresh</th>
                <th className="px-4 py-2">API</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DATASETS.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{d.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{d.agency}</td>
                  <td className="px-4 py-2.5 font-mono text-ct-sky">{d.id}</td>
                  <td className="px-4 py-2.5 text-slate-400">{d.refresh}</td>
                  <td className="px-4 py-2.5 text-center">
                    <a href={`https://data.ct.gov/resource/${d.id}`} target="_blank" rel="noopener" className="text-ct-sky hover:underline">↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 mb-3">Architecture Notes</h2>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            ['Data Layer', 'src/api/socrata.ts — typed Axios wrapper. Dataset IDs in DATASETS map; SODA $where/$order/$limit params forwarded from hooks. Typed row interfaces per dataset.'],
            ['Fallback Layer', 'src/api/mockData.ts — realistic CT figures for all 6 live datasets. fetchWithFallback<T> catches any API error and returns mock data silently. Zero blank-screen states.'],
            ['Query Layer', 'src/hooks/useSocrataData.ts — TanStack Query v5 hooks. staleTime: 1hr, retry: 1, refetchOnWindowFocus: false. Shared QueryClient in main.tsx.'],
            ['Pages (17)', 'src/pages/ — each page is fully self-contained. Own useQuery call, own filter useState, own chart set. No global store (Zustand/Redux) needed — by design.'],
            ['Shared UI', 'KPICard, SectionHeader, LoadingSpinner/ErrorCard — 3 shared components. Consistent visual language without over-engineering.'],
            ['Routing', 'Single-page app — tab state held in App.tsx useState<TabId>. No react-router (adds complexity with no UX benefit for a demo). Keyboard shortcuts via useEffect keydown listener.'],
          ].map(([label, text]) => (
            <div key={label} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="font-bold text-slate-400 text-xs uppercase w-28 flex-shrink-0 mt-0.5">{label}</span>
              <p className="text-xs">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resume bullet points */}
      <div className="bg-ct-light rounded-xl border border-ct-blue/30 p-5">
        <h2 className="text-base font-black text-ct-navy mb-1">Resume Talking Points</h2>
        <p className="text-xs text-ct-blue mb-3">Copy-paste ready for your CT state IT PM application</p>
        <ul className="space-y-3 text-sm text-ct-navy">
          {[
            'Built a 17-section civic analytics dashboard integrating 6 live datasets from the CT Socrata Open Data API (data.ct.gov), covering labor, budget, education, public health, public safety, housing, demographics, environment, and economic indicators — demonstrating full-stack technical competency and domain familiarity with CT government data infrastructure.',
            'Designed and implemented a PMBOK-aligned IT Program Risk Register with a 5×5 probability-impact matrix, clickable risk detail panel, and mitigation/contingency plans for 8 active CT state IT programs (DMV, CTDOL, DCF, CT.gov, Zero Trust, BEAD, Courts e-Filing, Data Lake) — directly reflecting the governance work of a state IT PM.',
            'Built a Federal Grants Tracking module (ARPA/IIJA/IRA — 14 grants, $3.5B+) with expenditure pace visualization, deadline proximity flagging, and at-risk identification — the kind of compliance tracking tool that CT OPM and BEST require from program managers overseeing federal-fund projects.',
            'Developed a Governance Alert System that evaluates live CT open data against configurable thresholds in real time (unemployment watchlist, graduation rate triggers, Vision Zero fatality monitoring) and surfaces dismissible, action-oriented alerts per domain — modeling production-ready monitoring design.',
            'Stack: React 18 + TypeScript + TanStack Query v5 + Recharts + Tailwind CSS + Vite. 0 TypeScript compiler errors. Graceful API fallback pattern ensures 100% uptime in demo and offline environments. Keyboard shortcuts (1–9) for tab navigation. Git commit history documents iterative delivery.',
          ].map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-ct-blue font-bold flex-shrink-0 mt-0.5">▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
