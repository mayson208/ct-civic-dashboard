import { useState, useEffect } from 'react'
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
import FederalGrantsPage from './pages/FederalGrantsPage'
import RiskRegisterPage from './pages/RiskRegisterPage'
import DemographicsPage from './pages/DemographicsPage'
import EnvironmentalPage from './pages/EnvironmentalPage'
import BroadbandPage from './pages/BroadbandPage'
import WorkforcePage from './pages/WorkforcePage'
import ProcurementPage from './pages/ProcurementPage'
import MunicipalPage from './pages/MunicipalPage'
import CybersecurityPage from './pages/CybersecurityPage'
import TransportationPage from './pages/TransportationPage'
import JudicialPage from './pages/JudicialPage'
import SocialServicesPage from './pages/SocialServicesPage'
import BusinessClimatePage from './pages/BusinessClimatePage'
import VeteransPage from './pages/VeteransPage'
import PMCommandPage from './pages/PMCommandPage'
import EnergyRatesPage from './pages/EnergyRatesPage'
import HigherEdPage from './pages/HigherEdPage'
import PensionPage from './pages/PensionPage'
import CriminalJusticePage from './pages/CriminalJusticePage'
import BehavioralHealthPage from './pages/BehavioralHealthPage'

type TabId = 'overview' | 'employment' | 'spending' | 'education' | 'safety' | 'towns' | 'health' | 'compare' | 'projects' | 'economy' | 'executive' | 'housing' | 'alerts' | 'grants' | 'risks' | 'demographics' | 'environment' | 'broadband' | 'workforce' | 'procurement' | 'municipal' | 'cybersecurity' | 'transportation' | 'judicial' | 'social' | 'business' | 'veterans' | 'pmcmd' | 'energy' | 'highered' | 'pension' | 'cj' | 'bh' | 'about'

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
  { id: 'grants',      label: 'Federal Grants',  icon: '🏛',  description: 'ARPA · IIJA · IRA — $3.5B+ in federal awards, obligation and expenditure tracking' },
  { id: 'risks',        label: 'Risk Register',   icon: '⚠️', description: 'IT program risk register — 5×5 matrix, mitigation plans, and contingencies' },
  { id: 'demographics', label: 'Demographics',   icon: '👥',  description: 'Population trends, age/race, migration, household composition, education attainment' },
  { id: 'environment',  label: 'Environment',    icon: '🌿',  description: 'GHG emissions, clean energy mix, solar/EV adoption, air quality, Net Zero Act milestones' },
  { id: 'broadband',   label: 'Broadband',      icon: '📡',  description: 'CT connectivity coverage, BEAD program timeline, underserved towns, adoption barriers' },
  { id: 'workforce',    label: 'Workforce',     icon: '🔧',  description: 'WIOA programs, credential attainment, sector partnerships, IT talent pipeline, skills gap' },
  { id: 'procurement',  label: 'Procurement',   icon: '📑',  description: 'CT state IT vendor registry, active contracts, spend by category, expiration monitoring' },
  { id: 'municipal',      label: 'Municipal',    icon: '🏛',  description: 'Mill rates, ECS grants, fund balance, debt service, and MRSA fiscal distress indicators' },
  { id: 'cybersecurity',  label: 'Cybersecurity',  icon: '🔐', description: 'NIST CSF scores, Zero Trust pillars, incident trend, vulnerability management, BEST compliance' },
  { id: 'transportation', label: 'Transportation', icon: '🚆', description: 'Transit ridership, road/bridge condition, FasTrak tolling, capital projects, Vision Zero safety' },
  { id: 'judicial',       label: 'Courts',         icon: '⚖️', description: 'Caseload by type, Tyler Odyssey e-filing adoption, processing time SLAs, district performance' },
  { id: 'social',         label: 'Social Services', icon: '🤝', description: 'HUSKY/Medicaid enrollment, SNAP, DCF child welfare caseload, program costs and federal match rates' },
  { id: 'business',       label: 'Business',        icon: '🏢', description: 'Business formations, DECD incentives, sector employment, VC activity, top employers, NE competitiveness' },
  { id: 'veterans',       label: 'Veterans',        icon: '🎖', description: 'Veteran population, VA utilization, defense contractors, Electric Boat workforce, benefit programs' },
  { id: 'pmcmd',          label: 'PM Command',      icon: '🎯', description: 'IT portfolio RAG roll-up, risk escalation actions, grant burn rates, contract expiration countdown' },
  { id: 'energy',         label: 'Energy Rates',    icon: '⚡', description: 'CT electric & gas rates vs NE neighbors, PURA rate cases, bill affordability, grid stats, assistance programs' },
  { id: 'highered',       label: 'Higher Ed',       icon: '🎓', description: 'UConn & CSCU enrollment, research funding, completion equity, tuition comparison, CSCU IT portfolio' },
  { id: 'pension',        label: 'Pension',         icon: '📉', description: 'SERS/TRS funded status, unfunded liability, ARC payments, national comparison, SEBAC reform scorecard' },
  { id: 'cj',             label: 'Criminal Justice', icon: '⚖️', description: 'DOC population, recidivism, racial disparity, facility capacity, IT systems, reform timeline' },
  { id: 'bh',             label: 'Behavioral Health', icon: '🧠', description: 'Opioid OD deaths, treatment capacity, naloxone, 988 Crisis Lifeline, county rates, DMHAS IT' },
  { id: 'about',          label: 'About',           icon: 'ℹ️', description: 'Tech stack, data sources, and resume talking points' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const active = TABS.find(t => t.id === activeTab)!

  // Keyboard shortcuts: digits 1-9 navigate tabs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const idx = parseInt(e.key) - 1
      if (idx >= 0 && idx < TABS.length) setActiveTab(TABS[idx].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
        {activeTab === 'grants'     && <FederalGrantsPage />}
        {activeTab === 'risks'        && <RiskRegisterPage />}
        {activeTab === 'demographics' && <DemographicsPage />}
        {activeTab === 'environment'  && <EnvironmentalPage />}
        {activeTab === 'broadband'   && <BroadbandPage />}
        {activeTab === 'workforce'   && <WorkforcePage />}
        {activeTab === 'procurement' && <ProcurementPage />}
        {activeTab === 'municipal'      && <MunicipalPage />}
        {activeTab === 'cybersecurity'  && <CybersecurityPage />}
        {activeTab === 'transportation' && <TransportationPage />}
        {activeTab === 'judicial'       && <JudicialPage />}
        {activeTab === 'social'         && <SocialServicesPage />}
        {activeTab === 'business'       && <BusinessClimatePage />}
        {activeTab === 'veterans'       && <VeteransPage />}
        {activeTab === 'pmcmd'          && <PMCommandPage />}
        {activeTab === 'energy'         && <EnergyRatesPage />}
        {activeTab === 'highered'       && <HigherEdPage />}
        {activeTab === 'pension'        && <PensionPage />}
        {activeTab === 'cj'             && <CriminalJusticePage />}
        {activeTab === 'bh'             && <BehavioralHealthPage />}
        {activeTab === 'about'          && <AboutPage />}
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
