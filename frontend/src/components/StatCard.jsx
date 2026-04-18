import React from 'react';

const StatCard = ({ title, value, icon, loading }) => {
  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'rgba(236,232,225,0.7)', fontSize: '1.5rem', margin: 0 }}>{title}</h3>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <div className="stat-value">
        {loading ? (
          <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

export default StatCard;
