import React from 'react';

const AgentMeta = ({ agents, loading }) => {
  return (
    <div className="glass-panel" style={{ height: '500px', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Agent Meta</h2>
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
          Loading Agent Meta...
        </div>
      ) : (
        <table className="vct-table">
          <thead>
            <tr>
              <th>Agent</th><th>Pick Rate</th><th>Total Picks</th><th>Avg ACS</th><th>Avg Kills</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, fontSize: '1.2rem', textTransform: 'capitalize' }}>{a.agent_played}</td>
                <td className="text-accent" style={{ fontWeight: 700 }}>{a.pick_rate_pct}%</td>
                <td style={{ color: 'rgba(255,255,255,0.7)' }}>{a.total_picks.toLocaleString()}</td>
                <td style={{ color: 'rgba(255,255,255,0.7)' }}>{a.avg_acs}</td>
                <td style={{ color: 'rgba(255,255,255,0.7)' }}>{a.avg_kills}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentMeta;
