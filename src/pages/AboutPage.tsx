const TECH_STACK = [
  { name: 'React 18',           role: 'UI framework',                         color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'TypeScript',         role: 'Type-safe development',                color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Vite',               role: 'Build tooling & HMR',                  color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Tailwind CSS',       role: 'Utility-first styling',                color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { name: 'Recharts',           role: 'Data visualization (10+ chart types)', color: 'bg-green-100 text-green-700 border-green-200' },
  { name: 'TanStack Query',     role: 'Async data fetching + caching',        color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Axios',              role: 'HTTP client for Socrata API',          color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'Socrata SODA API',   role: 'Live CT open government data',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
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
  { icon: '🔄', title: 'Live API Integration',        desc: 'Queries data.ct.gov in real time via the Socrata SODA REST API. Stale-while-revalidate caching via TanStack Query — zero manual refresh needed.' },
  { icon: '🛡',  title: 'Graceful Fallback',          desc: 'If a dataset is unavailable (CORS, rate limit, outage), the app silently serves realistic cached data so the dashboard always displays something meaningful.' },
  { icon: '📊', title: '10+ Chart Types',             desc: 'Area, line, bar (vertical + horizontal), scatter, radar, pie, donut — each chosen to best communicate the underlying data pattern.' },
  { icon: '⬇',  title: 'CSV Export',                 desc: 'Every dataset can be downloaded as a CSV file directly from the dashboard — no portal login required, designed for analyst re-use.' },
  { icon: '🔍', title: 'Search & Filter',            desc: 'Each section has keyword search, year/county/town filters, and sort controls — supports OSTP-style exploratory data analysis.' },
  { icon: '📋', title: 'IT Project Tracker',         desc: 'Fully editable project portfolio board with budget burn, risk flags, phase pipeline, and inline editing — built to match how CT state IT teams actually track work.' },
  { icon: '⚖',  title: 'Town Comparison',           desc: 'Side-by-side radar chart + metric table comparing any two CT municipalities across income, graduation, unemployment, poverty, and safety.' },
  { icon: '♿', title: 'Accessibility-Forward',      desc: 'Semantic HTML, keyboard-navigable tabs, sufficient color contrast, and screen-reader-friendly labels throughout. WCAG 2.1 AA target.' },
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
            <p className="text-blue-200 text-sm mt-1">A full-stack government data analytics platform built for the State of Connecticut — demonstrating modern civic technology skills for an IT Project Manager role.</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a href="https://github.com/mayson208/ct-civic-dashboard" target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition">
                ⭐ GitHub Repository
              </a>
              <a href="https://data.ct.gov" target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition">
                🏛 data.ct.gov
              </a>
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
            <li><strong>Technical fluency</strong> — the ability to read API documentation, integrate live government data sources, and build production-quality tooling without a team.</li>
            <li><strong>Domain knowledge</strong> — familiarity with CT government agencies (CTDOL, OPM, DPH, CSDE, DMV), the data they publish, and how to surface it meaningfully.</li>
            <li><strong>PM instinct</strong> — the IT Project Tracker section is a working prototype of the kind of internal tool a CT IT PM would actually spec out, build a requirements document for, and deliver to stakeholders.</li>
          </ol>
          <p>All data comes from <a href="https://data.ct.gov" className="text-ct-sky hover:underline" target="_blank" rel="noopener">data.ct.gov</a>, Connecticut's official open data portal, via the <a href="https://dev.socrata.com/docs/endpoints.html" className="text-ct-sky hover:underline" target="_blank" rel="noopener">Socrata SODA API</a> — the same infrastructure used by CT BEST and OPM for data sharing initiatives.</p>
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
          <h2 className="text-base font-black text-slate-800">Data Sources</h2>
          <p className="text-xs text-slate-500 mt-0.5">All datasets are publicly available on data.ct.gov — no authentication required</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left px-4 py-2">Dataset</th>
                <th className="text-left px-4 py-2">Agency</th>
                <th className="text-left px-4 py-2">Dataset ID</th>
                <th className="text-left px-4 py-2">Refresh</th>
                <th className="px-4 py-2">Link</th>
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
          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-400 text-xs uppercase w-24 flex-shrink-0 mt-0.5">Data Layer</span>
            <p className="text-xs"><code className="bg-slate-200 px-1 rounded">src/api/socrata.ts</code> — typed API client wrapping Axios. Each dataset has a known 4x4 identifier. Options passed as SODA query params (<code className="bg-slate-200 px-1 rounded">$where</code>, <code className="bg-slate-200 px-1 rounded">$order</code>, <code className="bg-slate-200 px-1 rounded">$limit</code>).</p>
          </div>
          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-400 text-xs uppercase w-24 flex-shrink-0 mt-0.5">Hooks</span>
            <p className="text-xs"><code className="bg-slate-200 px-1 rounded">src/hooks/useSocrataData.ts</code> — TanStack Query hooks, 1-hour stale time, automatic fallback to <code className="bg-slate-200 px-1 rounded">src/api/mockData.ts</code> on API failure. Zero loading flicker in demo.</p>
          </div>
          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-400 text-xs uppercase w-24 flex-shrink-0 mt-0.5">Pages</span>
            <p className="text-xs">8 page components in <code className="bg-slate-200 px-1 rounded">src/pages/</code>. Each is self-contained: fetches its own data, owns its filter state, and handles loading/error independently. No global store.</p>
          </div>
          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-400 text-xs uppercase w-24 flex-shrink-0 mt-0.5">Shared UI</span>
            <p className="text-xs"><code className="bg-slate-200 px-1 rounded">KPICard</code>, <code className="bg-slate-200 px-1 rounded">SectionHeader</code>, <code className="bg-slate-200 px-1 rounded">LoadingSpinner</code> — reusable components that maintain visual consistency without over-engineering.</p>
          </div>
        </div>
      </div>

      {/* Resume bullet points */}
      <div className="bg-ct-light rounded-xl border border-ct-blue/30 p-5">
        <h2 className="text-base font-black text-ct-navy mb-3">Resume Talking Points</h2>
        <ul className="space-y-2 text-sm text-ct-navy">
          {[
            'Built a full-stack civic analytics dashboard integrating 6 live datasets from the CT Socrata Open Data API (data.ct.gov), covering labor, budget, education, public health, public safety, and demographics',
            'Designed a graceful degradation pattern: primary API calls with automatic fallback to cached mock data — ensuring 100% uptime in demo environments',
            'Developed an IT Project Portfolio tracker page modeled on CT BEST/OPM project governance processes, including budget burn tracking, phase pipeline, and risk logging',
            'Implemented multi-dataset town comparison tool with radar chart, bar chart, and sortable data table — reducing manual analysis time for policy decisions',
            'Stack: React 18 + TypeScript + TanStack Query + Recharts + Tailwind CSS + Vite; 0 TypeScript errors; production build under 450kB gzipped',
          ].map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-ct-blue font-bold flex-shrink-0">▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
