import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const PlayerStats = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/players?search=${search}`);
        setPlayers(res.data);
      } catch (err) {
        console.error("Error fetching players: ", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: wait 300ms after the user stops typing before hitting the API.
    const timeoutId = setTimeout(() => { fetchPlayers(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1 }}>Player Statistics</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Search and analyze detailed stats for any professional player in the VCT ecosystem.
        </p>
      </header>

      {/* Attribute glossary so viewers know what each column means */}
      <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', flexWrap: 'wrap', background: 'rgba(255,70,85,0.05)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--vct-border)' }}>
        <span><strong style={{color: 'white'}}>IGN:</strong> In-Game Name</span>
        <span><strong style={{color: 'white'}}>ACS:</strong> Average Combat Score</span>
        <span><strong style={{color: 'white'}}>K/D Ratio:</strong> Kill/Death Ratio</span>
        <span><strong style={{color: 'white'}}>HS %:</strong> Headshot Percentage</span>
      </div>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
        <Search size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
        <input
          type="text"
          placeholder="Search by IGN (e.g. TenZ)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', width: '100%', outline: 'none', fontFamily: 'var(--font-body)' }}
        />
      </div>

      <div className="glass-panel" style={{ height: '600px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>Searching database...</div>
        ) : players.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>No players found matching "{search}"</div>
        ) : (
          <table className="vct-table">
            <thead>
              <tr>
                <th>Player IGN</th><th>Role</th><th>Current Team</th><th>Avg ACS</th><th>K/D Ratio</th><th>HS %</th><th>Total Kills</th><th>Maps Played</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-accent">{p.ign}</td>
                  <td><span className="role-badge">{p.primary_role}</span></td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{p.team_name}</td>
                  <td style={{ fontWeight: 700 }}>{p.avg_acs}</td>
                  <td>{p.kd_ratio}</td>
                  <td>{p.avg_hs_pct}%</td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{p.total_kills.toLocaleString()}</td>
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{p.maps_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;
