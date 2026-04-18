import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare } from 'lucide-react';

const Contact = () => {
  // "idle" -> "sending" -> "sent". Simulates form submission with a 1.2s delay.
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
      <header>
        <h2 style={{ fontSize: '4rem', margin: 0, lineHeight: 1, textTransform: 'uppercase' }}>Contact &amp; Community</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '800px' }}>
          Have questions about the database architecture or wish to request raw SQL dumps for the Kaggle dataset? Get in touch with us.
        </p>
      </header>

      {/* Two-column grid: contact form on the left, community info on the right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '3rem' }}>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 1.5rem 0', color: 'var(--vct-red)' }}>Send a Message</h3>
          {status === 'sent' ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: '#46ff78' }}>
               <Send size={48} style={{ margin: '0 auto 1rem auto' }} />
               <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Message Sent!</h3>
               <p style={{ color: 'rgba(255,255,255,0.6)' }}>Thank you. Abhay or the team will get back to you shortly.</p>
               <button
                onClick={() => setStatus('idle')}
                style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--vct-border)', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Send Another
               </button>
             </div>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-header)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    <User size={18} className="text-accent" /> Name
                  </label>
                  <input type="text" required style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--vct-border)', padding: '1rem', color: 'white', fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-header)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    <Mail size={18} className="text-accent" /> Email Address
                  </label>
                  <input type="email" required style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--vct-border)', padding: '1rem', color: 'white', fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-body)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-header)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                  <MessageSquare size={18} className="text-accent" /> Message
                </label>
                <textarea required rows="6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--vct-border)', padding: '1rem', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }} />
              </div>

              <button type="submit" disabled={status === 'sending'} style={{ background: 'var(--vct-red)', border: 'none', color: 'white', padding: '1rem', fontFamily: 'var(--font-header)', fontSize: '1.5rem', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', opacity: status === 'sending' ? 0.7 : 1, transition: 'all 0.3s' }}>
                <Send size={20} />
                {status === 'sending' ? 'Transmitting...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '3rem', background: 'rgba(255, 70, 85, 0.03)' }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: 'var(--vct-red)' }}>Join The Ecosystem</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Connect with fellow developers and esports enthusiasts to discuss advanced database architectures, query optimization, and VCT analytics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--vct-red)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Open Source Access</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                The full 3NF schema and the data ingestion pipelines will be available on GitHub. Let us know if you want early access.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--vct-red)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Discord Server</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                Join our active Discord community to chat with other analysts, share custom SQL queries, and get live updates on new tournaments.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
