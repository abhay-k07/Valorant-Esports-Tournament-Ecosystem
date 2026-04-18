import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Globe } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const TournamentData = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/tournaments`);
        setTournaments(res.data);
      } catch (err) {
        console.error("Error fetching tournaments: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1 }}>Tournament Data</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Explore all official VCT tournaments mapped in our database.
        </p>
      </header>

      <div className="stats-grid">
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar size={40} className="text-accent" />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Total Events</div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-header)' }}>{tournaments.length}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Globe size={40} className="text-accent" />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Global Database</div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-header)' }}>International</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ height: '600px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>Loading Tournament History...</div>
        ) : (
          <table className="vct-table">
            <thead>
              <tr>
                <th>Tournament Name</th><th>Region</th><th>Format</th><th>Start Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t.name}</td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{t.region}</td>
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{t.format}</td>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{t.start_date}</td>
                  <td>
                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(70, 255, 120, 0.1)', color: '#46ff78', border: '1px solid rgba(70, 255, 120, 0.3)' }}>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TournamentData;
