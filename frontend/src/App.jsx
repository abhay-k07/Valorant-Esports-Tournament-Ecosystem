import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trophy, Users, Target, Database, Info, Mail, Search, ArrowRight } from 'lucide-react'
import StatCard from './components/StatCard'
import Leaderboard from './components/Leaderboard'
import AgentMeta from './components/AgentMeta'
import PlayerStats from './components/PlayerStats'
import TournamentData from './components/TournamentData'
import SqlRunner from './components/SqlRunner'
import About from './components/About'
import Contact from './components/Contact'

const API_URL = 'http://localhost:8000/api'

function App() {
  // "activeTab" is the only routing mechanism — no React Router needed for this scale.
  const [activeTab, setActiveTab] = useState('dashboard')

  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data once on mount. Other tabs fetch their own data internally.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lbRes, agentRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard-stats`),
          axios.get(`${API_URL}/leaderboard?limit=10`),
          axios.get(`${API_URL}/agent-meta`)
        ]);

        setStats(statsRes.data);
        setLeaderboard(lbRes.data);
        setAgents(agentRes.data);
      } catch (err) {
        console.error("Error fetching data: ", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const renderContent = () => {
    if (activeTab === 'players') return <PlayerStats />;
    if (activeTab === 'tournaments') return <TournamentData />;
    if (activeTab === 'sql') return <SqlRunner />;
    if (activeTab === 'about') return <About />;
    if (activeTab === 'contact') return <Contact />;

    // Default: dashboard view
    return (
      <>
        <div className="hero-banner">
          <div className="hero-content">
            <h1 className="hero-title">Valorant<br/>Esports Ecosystem</h1>
            <p className="hero-subtitle">
              An advanced, fully normalized DBMS project exploring 260K+ records from official VCT events. Access global leaderboards, agent metas, and custom analytical SQL tools in one unified dashboard.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => setActiveTab('players')}>
                <Search size={22} /> Player Database
              </button>
              <button className="btn-secondary" onClick={() => setActiveTab('tournaments')}>
                View Tournaments <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Total Matches"
            value={stats?.total_matches?.toLocaleString()}
            icon={<Trophy size={32} />}
            loading={loading}
          />
          <StatCard
            title="Pro Players Tracked"
            value={stats?.total_players?.toLocaleString()}
            icon={<Users size={32} />}
            loading={loading}
          />
          <StatCard
            title="Most Picked Agent"
            value={<span style={{ textTransform: 'capitalize' }}>{stats?.most_played_agent}</span>}
            icon={<Target size={32} />}
            loading={loading}
          />
        </div>

        <div className="tables-grid">
          <Leaderboard players={leaderboard} loading={loading} />
          <AgentMeta agents={agents} loading={loading} />
        </div>
      </>
    );
  };

  // Sidebar link style — active tab gets a red left border.
  const linkStyle = (tabName) => ({
    color: activeTab === tabName ? 'white' : 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontFamily: 'var(--font-header)',
    letterSpacing: '1px',
    borderLeft: activeTab === tabName ? '3px solid var(--vct-red)' : '3px solid transparent',
    paddingLeft: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  });

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        {/* Clicking the logo takes you back to the dashboard */}
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div className="brand-logo-container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg" alt="Valorant Logo" width="60" height="60" />
          </div>
          <div className="brand-text">
            <span style={{ fontSize: '2.5rem', lineHeight: '1', color: 'white', display: 'block' }}>VALORANT</span>
            <span style={{ fontSize: '1.1rem', lineHeight: '1', color: 'var(--vct-red)', display: 'block', marginTop: '0.2rem' }}>ESPORTS ECOSYSTEM</span>
          </div>
        </div>

        {/* Primary navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <a onClick={() => setActiveTab('dashboard')} style={linkStyle('dashboard')}>Overview Home</a>
          <a onClick={() => setActiveTab('players')} style={linkStyle('players')}>Player Statistics</a>
          <a onClick={() => setActiveTab('tournaments')} style={linkStyle('tournaments')}>Tournament Data</a>
        </nav>

        {/* Secondary navigation — pushed to the bottom of the sidebar */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--vct-border)' }}>
          <a onClick={() => setActiveTab('about')} style={linkStyle('about')}>
             <Info size={18} />
             About Project
          </a>
          <a onClick={() => setActiveTab('contact')} style={linkStyle('contact')}>
             <Mail size={18} />
             Contact Team
          </a>
          <a onClick={() => setActiveTab('sql')} style={linkStyle('sql')}>
             <Database size={18} />
             SQL Playground
          </a>
        </nav>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
