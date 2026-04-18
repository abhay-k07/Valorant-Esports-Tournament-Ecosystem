import React from 'react';
import { Database, Shield, Server, Users } from 'lucide-react';

const About = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <header className="glass-panel" style={{ padding: '3rem', borderTop: '4px solid var(--vct-red)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', opacity: 0.05, transform: 'rotate(-15deg)' }}>
          <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor"><polygon points="50,10 90,90 10,90"/></svg>
        </div>
        <h2 style={{ fontSize: '4rem', margin: 0, lineHeight: 1, textTransform: 'uppercase', textShadow: '0 4px 15px rgba(255, 70, 85, 0.3)' }}>About This Project</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1.2rem', fontSize: '1.25rem', lineHeight: 1.7, maxWidth: '1200px' }}>
          Building the Valorant Esports Tournament Ecosystem started as a B.Tech DBMS project, but it quickly turned into an exercise in handling real-world data at scale. We wanted to see what happens when you apply strict relational algebra to modern web development.
        </p>
      </header>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem' }}>
          <div style={{ flex: '1', minWidth: '400px' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--vct-red)', margin: '0 0 1rem 0' }}>The Architecture</h3>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
              So, we built a 3rd Normal Form (3NF) database from scratch. It currently holds over <strong>260,000 records</strong> from VCT 2021 to 2026.
            </p>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', marginTop: '1rem' }}>
              We didn't just rely on ORMs. The database itself handles the heavy lifting. A robust and scalable schema designed specifically for the rigorous demands of professional esports statistics tracking.
            </p>
          </div>
          
          <div className="glass-panel" style={{ flex: '1.2', minWidth: '450px', padding: '2rem', background: 'rgba(255, 70, 85, 0.05)', border: '1px solid rgba(255, 70, 85, 0.2)' }}>
            <h4 style={{ color: 'var(--vct-red)', fontSize: '1.8rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Users size={28} /> The Team
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.5 }}>The developers behind the code:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}><span style={{ color: 'var(--vct-red)', fontSize: '0.9rem', fontWeight: 'normal' }}>Leader</span> Abhay Kumar <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>UID: 2410030695</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}><span style={{ color: 'var(--vct-red)', fontSize: '0.9rem', fontWeight: 'normal' }}>Member</span> Dushyant Kumar <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>UID: 2410030677</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}><span style={{ color: 'var(--vct-red)', fontSize: '0.9rem', fontWeight: 'normal' }}>Member</span> Vaishnavi Sharma <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>UID: 2410030681</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}><span style={{ color: 'var(--vct-red)', fontSize: '0.9rem', fontWeight: 'normal' }}>Member</span> Deepak Kumar <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>UID: 2410030660</span></div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
          <div className="feature-card" style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderLeft: '3px solid var(--vct-red)' }}>
            <Database className="text-accent" size={32} />
            <div>
              <h4 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>ACID Compliance</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.5 }}>We implemented manual composite indexing and strict transaction boundaries.</p>
            </div>
          </div>
          
          <div className="feature-card" style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderLeft: '3px solid var(--vct-red)' }}>
            <Shield className="text-accent" size={32} />
            <div>
              <h4 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Trigger Logic</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.5 }}>Business rules run directly at the database level to prevent bad data from ever being committed.</p>
            </div>
          </div>

          <div className="feature-card" style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderLeft: '3px solid var(--vct-red)' }}>
            <Server className="text-accent" size={32} />
            <div>
              <h4 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>FastAPI Backend</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.5 }}>We went with FastAPI to keep the routing fast and asynchronous between our SQL database and the React frontend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
