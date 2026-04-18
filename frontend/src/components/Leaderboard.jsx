import React from 'react';

const Leaderboard = ({ players, loading }) => {
  return (
    <div className="glass-panel" style={{ height: '500px', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Top Players (ACS)</h2>
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
          Loading Player Data...
        </div>
      ) : (
        <table className="vct-table">
          <thead>
            <tr>
              <th>Rank</th><th>Player</th><th>Team</th><th>ACS</th><th>K/D</th><th>HS %</th><th>Maps</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr key={idx}>
                <td><span className="rank-badge">{idx + 1}</span></td>
                <td style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.ign}</td>
                <td style={{ color: 'rgba(255,255,255,0.7)' }}>{p.team_name}</td>
                <td className="text-accent" style={{ fontWeight: 700 }}>{p.avg_acs}</td>
                <td>{p.kd_ratio}</td>
                <td>{p.avg_hs_pct}%</td>
                <td style={{ color: 'rgba(255,255,255,0.5)' }}>{p.maps_played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
