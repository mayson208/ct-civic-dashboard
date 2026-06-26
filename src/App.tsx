import { useState } from 'react'
import OverviewPage from './pages/OverviewPage'
import EmploymentPage from './pages/EmploymentPage'
import SpendingPage from './pages/SpendingPage'
import EducationPage from './pages/EducationPage'
import PublicSafetyPage from './pages/PublicSafetyPage'
import TownProfilesPage from './pages/TownProfilesPage'
import PublicHealthPage from './pages/PublicHealthPage'
import TownComparePage from './pages/TownComparePage'
import ProjectTrackerPage from './pages/ProjectTrackerPage'
import AboutPage from './pages/AboutPage'
import EconomicPage from './pages/EconomicPage'
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage'
import HousingPage from './pages/HousingPage'
import AlertsPage from './pages/AlertsPage'

type TabId = 'overview' | 'employment' | 'spending' | 'education' | 'safety' | 'towns' | 'health' | 'compare' | 'projects' | 'economy' | 'executive' | 'housing' | 'alerts' | 'about'

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
  { id: 'overview',    label: 'Overview',        icon: '🏛',  description: 'CT at a glance — key metrics across all domains' },
  { id: 'employment',  label: 'Labor',           icon: '📊',  description: 'Unemployment rates by town & trend' },
  { id: 'spending',    label: 'Budget',          icon: '💰',  description: 'State expenditures by agency & category' },
  { id: 'education',   label: 'Education',       icon: '🎓',  description: 'Graduation rates by school district' },
  { id: 'safety',      label: 'Public Safety',   icon: '🚔',  description: 'Crash statistics by town & year' },
  { id: 'towns',       label: 'Town Profiles',   icon: '🗺️', description: 'Demographics, income & poverty by municipality' },
  { id: 'health',      label: 'Public Health',   icon: '⚕️', description: 'COVID-19 trend, health indicators, hospital capacity' },
  { id: 'compare',     label: 'Town Compare',    icon: '⚖️', description: 'Side-by-side comparison of any two CT towns' },
  { id: 'projects',    label: 'IT Projects',     icon: '📋',  description: 'CT state IT project portfolio tracker' },
  { id: 'economy',     label: 'Economy',         icon: '💹',  description: 'GDP, employment by sector, business formation, county breakdown' },
  { id: 'executive',   label: 'Exec Summary',    icon: '🖨',  description: 'Printable cross-domain executive briefing with recommendations' },
  { id: 'housing',     label: 'Housing',         icon: '🏘',  description: 'Home prices, permits, affordability, rental rates, and affordable stock' },
  { id: 'alerts',      label: 'Alerts',          icon: '🔔',  description: 'Automated threshold monitoring and governance alerts' },
  { id: 'about',       label: 'About',           icon: 'ℹ️', description: 'Tech stack, data sources, and resume talking points' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const active = TABS.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-ct-navy border-b border-ct-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg font-black text-ct-navy shadow">CT</div>
              <div>
                <h1 className="text-white font-black text-base leading-tight">Connecticut Civic Dashboard</h1>
                <p className="text-blue-300 text-xs">Live data from data.ct.gov · Powered by Socrata SODA API</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                data.ct.gov connected
              </span>
              <span className="text-blue-300">© {new Date().getFullYear()} CT Open Data Initiative</span>
            </div>
          </div>

          {/* Tab nav */}
          <nav className="flex gap-0.5 pb-0 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                title={t.description}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.id
                    ? 'border-ct-gold text-ct-gold bg-white/5'
                    : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                }`}>
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="text-ct-blue font-semibold">CT Civic Dashboard</span>
          <span>›</span>
          <span>{active.icon} {active.label}</span>
          <span className="ml-auto text-slate-400">{active.description}</span>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview'   && <OverviewPage />}
        {activeTab === 'employment' && <EmploymentPage />}
        {activeTab === 'spending'   && <SpendingPage />}
        {activeTab === 'education'  && <EducationPage />}
        {activeTab === 'safety'     && <PublicSafetyPage />}
        {activeTab === 'towns'      && <TownProfilesPage />}
        {activeTab === 'health'     && <PublicHealthPage />}
        {activeTab === 'compare'    && <TownComparePage />}
        {activeTab === 'projects'   && <ProjectTrackerPage />}
        {activeTab === 'economy'    && <EconomicPage />}
        {activeTab === 'executive'  && <ExecutiveSummaryPage />}
        {activeTab === 'housing'    && <HousingPage />}
        {activeTab === 'alerts'     && <AlertsPage />}
        {activeTab === 'about'      && <AboutPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-600">CT Civic Dashboard</p>
            <p>Data sourced from <a href="https://data.ct.gov" target="_blank" rel="noopener" className="text-ct-sky hover:underline">data.ct.gov</a> via the Socrata Open Data API (SODA)</p>
          </div>
          <div className="flex gap-4">
            <a href="https://data.ct.gov" target="_blank" rel="noopener" className="text-ct-sky hover:underline">CT Open Data Portal</a>
            <a href="https://dev.socrata.com/docs/endpoints.html" target="_blank" rel="noopener" className="text-ct-sky hover:underline">SODA API Docs</a>
            <a href="https://portal.ct.gov" target="_blank" rel="noopener" className="text-ct-sky hover:underline">CT.gov</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
