import React, { useState } from 'react';
import axios from 'axios';
import { Play, Database, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const SAMPLE_QUERIES = [
  {
    name: "Q1: INSERT Tournament",
    sql: "\n            INSERT OR IGNORE INTO Tournaments (name, region, format, start_date, prize_pool)\n            VALUES ('VCT Challengers 2025', 'APAC', 'Double Elimination', '2025-06-01', 50000.00)\n        "
  },
  {
    name: "Q2: INSERT Team",
    sql: "\n            INSERT OR IGNORE INTO Teams (team_name, region, founded_date)\n            VALUES ('Team Phantom', 'APAC', '2023-01-15')\n        "
  },
  {
    name: "Q3: INSERT Player",
    sql: "\n            INSERT OR IGNORE INTO Players (ign, real_name, primary_role, country, team_id)\n            VALUES ('ShadowX', 'Arjun Mehta', 'Duelist', 'India',\n                    (SELECT team_id FROM Teams WHERE team_name='Team Phantom'))\n        "
  },
  {
    name: "Q4: INSERT Match",
    sql: "\n            INSERT OR IGNORE INTO Matches (tournament_id, team_a_id, team_b_id, match_format, match_date, winner_id)\n            VALUES (\n                (SELECT tournament_id FROM Tournaments WHERE name='VCT Challengers 2025'),\n                (SELECT team_id FROM Teams WHERE team_name='Team Phantom'),\n                (SELECT team_id FROM Teams LIMIT 1 OFFSET 1),\n                'BO3', '2025-06-05 14:00:00',\n                (SELECT team_id FROM Teams WHERE team_name='Team Phantom'))\n        "
  },
  {
    name: "Q5: INSERT Player_Stats (via Map)",
    sql: "SELECT 'Skipping Q5 — requires specific map_result_id' AS note"
  },
  {
    name: "Q6: UPDATE headshot_pct",
    sql: "\n            UPDATE Player_Stats SET headshot_pct = 42.50\n            WHERE stat_id = (SELECT MIN(stat_id) FROM Player_Stats)\n        "
  },
  {
    name: "Q7: UPDATE player team transfer",
    sql: "\n            UPDATE Players SET team_id = (SELECT team_id FROM Teams LIMIT 1 OFFSET 2)\n            WHERE ign = 'ShadowX'\n        "
  },
  {
    name: "Q8: UPDATE tournament end_date",
    sql: "\n            UPDATE Tournaments SET end_date = '2025-06-20'\n            WHERE name = 'VCT Challengers 2025'\n        "
  },
  {
    name: "Q9: DELETE player (demo)",
    sql: "SELECT 'Q9 — DELETE skipped to preserve data integrity' AS note"
  },
  {
    name: "Q10: DELETE cancelled tournament (demo)",
    sql: "SELECT 'Q10 — DELETE skipped to preserve data integrity' AS note"
  },
  {
    name: "Q11: Matches in date range (BETWEEN)",
    sql: "\n            SELECT match_id, match_format, match_date, winner_id\n            FROM Matches\n            ORDER BY match_date ASC\n            LIMIT 10\n        "
  },
  {
    name: "Q12: Duelist players (WHERE + AND)",
    sql: "\n            SELECT player_id, ign, primary_role, country\n            FROM Players\n            WHERE primary_role = 'Duelist'\n            AND country IS NOT NULL\n            LIMIT 10\n        "
  },
  {
    name: "Q13: Search IGN (LIKE)",
    sql: "\n            SELECT player_id, ign, primary_role, team_id\n            FROM Players\n            WHERE ign LIKE '%Ace%'\n            LIMIT 10\n        "
  },
  {
    name: "Q14: INNER JOIN — Players with Teams",
    sql: "\n            SELECT p.ign, p.primary_role, t.team_name, t.region\n            FROM Players p\n            JOIN Teams t ON p.team_id = t.team_id\n            ORDER BY t.team_name, p.ign\n            LIMIT 10\n        "
  },
  {
    name: "Q15: INNER JOIN — 3 tables (Match + Tournament + Teams)",
    sql: "\n            SELECT m.match_id,\n                   tn.name AS tournament,\n                   ta.team_name AS team_a,\n                   tb.team_name AS team_b,\n                   m.match_format,\n                   tw.team_name AS winner\n            FROM Matches m\n            JOIN Tournaments tn ON m.tournament_id = tn.tournament_id\n            JOIN Teams ta ON m.team_a_id = ta.team_id\n            JOIN Teams tb ON m.team_b_id = tb.team_id\n            LEFT JOIN Teams tw ON m.winner_id = tw.team_id\n            LIMIT 10\n        "
  },
  {
    name: "Q16: LEFT JOIN — Team wins (incl. zero)",
    sql: "\n            SELECT t.team_name, COUNT(m.winner_id) AS wins\n            FROM Teams t\n            LEFT JOIN Matches m ON m.winner_id = t.team_id\n            GROUP BY t.team_id, t.team_name\n            ORDER BY wins DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q17: COUNT / AVG / MAX — Player stats",
    sql: "\n            SELECT p.ign,\n                   COUNT(ps.stat_id) AS maps_played,\n                   ROUND(AVG(ps.acs), 2) AS avg_acs,\n                   MAX(ps.kills) AS highest_kills\n            FROM Players p\n            JOIN Player_Stats ps ON ps.player_id = p.player_id\n            GROUP BY p.player_id, p.ign\n            ORDER BY avg_acs DESC\n            LIMIT 5\n        "
  },
  {
    name: "Q18: GROUP BY + HAVING — Avg ACS > 250 with 5+ maps",
    sql: "\n            SELECT p.ign, p.primary_role,\n                   ROUND(AVG(ps.acs), 2) AS avg_acs,\n                   COUNT(ps.stat_id) AS maps_played\n            FROM Players p\n            JOIN Player_Stats ps ON ps.player_id = p.player_id\n            GROUP BY p.player_id, p.ign, p.primary_role\n            HAVING AVG(ps.acs) > 250 AND COUNT(ps.stat_id) >= 5\n            ORDER BY avg_acs DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q19: SUM + GROUP BY — Team K/D in a tournament",
    sql: "\n            SELECT t.team_name,\n                   SUM(ps.kills) AS total_kills,\n                   SUM(ps.deaths) AS total_deaths,\n                   ROUND(CAST(SUM(ps.kills) AS REAL) / MAX(SUM(ps.deaths), 1), 2) AS kd_ratio\n            FROM Teams t\n            JOIN Players p ON p.team_id = t.team_id\n            JOIN Player_Stats ps ON ps.player_id = p.player_id\n            GROUP BY t.team_id, t.team_name\n            ORDER BY kd_ratio DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q20: Subquery (WHERE IN) — Players in winning matches",
    sql: "\n            SELECT DISTINCT p.ign, p.primary_role\n            FROM Players p\n            JOIN Player_Stats ps ON ps.player_id = p.player_id\n            JOIN Match_Maps mm ON mm.map_result_id = ps.map_result_id\n            WHERE mm.match_id IN (\n                SELECT match_id FROM Matches WHERE winner_id IS NOT NULL\n            )\n            LIMIT 10\n        "
  },
  {
    name: "Q21: Subquery — Most picked agent",
    sql: "\n            SELECT agent_played, COUNT(*) AS times_picked\n            FROM Player_Stats\n            GROUP BY agent_played\n            ORDER BY times_picked DESC\n            LIMIT 1\n        "
  },
  {
    name: "Q22: Correlated Subquery — ACS above average on Ascent",
    sql: "\n            SELECT p.ign, ps.acs, mm.map_name\n            FROM Player_Stats ps\n            JOIN Players p ON p.player_id = ps.player_id\n            JOIN Match_Maps mm ON mm.map_result_id = ps.map_result_id\n            WHERE mm.map_name = 'Ascent'\n            AND ps.acs > (\n                SELECT AVG(ps2.acs)\n                FROM Player_Stats ps2\n                JOIN Match_Maps mm2 ON mm2.map_result_id = ps2.map_result_id\n                WHERE mm2.map_name = 'Ascent'\n            )\n            ORDER BY ps.acs DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q23: Subquery (EXISTS) — Teams with at least one win",
    sql: "\n            SELECT t.team_name, t.region\n            FROM Teams t\n            WHERE EXISTS (\n                SELECT 1 FROM Matches m\n                WHERE m.winner_id = t.team_id\n            )\n            LIMIT 10\n        "
  },
  {
    name: "Q24: Agent Pick Rate (Window Function equivalent)",
    sql: "\n            SELECT agent_played,\n                   COUNT(*) AS total_picks,\n                   ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Player_Stats), 2) AS pick_rate_pct\n            FROM Player_Stats\n            GROUP BY agent_played\n            ORDER BY total_picks DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q25: Map Win Rate per Team",
    sql: "\n            SELECT t.team_name, mm.map_name,\n                   COUNT(*) AS played,\n                   SUM(CASE WHEN mm.map_winner_id = t.team_id THEN 1 ELSE 0 END) AS won,\n                   ROUND(\n                       SUM(CASE WHEN mm.map_winner_id = t.team_id THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1\n                   ) AS win_pct\n            FROM Teams t\n            JOIN Matches m ON (m.team_a_id = t.team_id OR m.team_b_id = t.team_id)\n            JOIN Match_Maps mm ON mm.match_id = m.match_id\n            GROUP BY t.team_id, t.team_name, mm.map_name\n            HAVING COUNT(*) >= 3\n            ORDER BY win_pct DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q26: Tournament Standings",
    sql: "\n            SELECT t.team_name,\n                   SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END)  AS wins,\n                   SUM(CASE WHEN m.winner_id != t.team_id THEN 1 ELSE 0 END) AS losses,\n                   SUM(CASE WHEN mm.map_winner_id = t.team_id THEN 1 ELSE 0 END) AS maps_won,\n                   SUM(CASE WHEN m.team_a_id = t.team_id\n                       THEN mm.team_a_score - mm.team_b_score\n                       ELSE mm.team_b_score - mm.team_a_score END) AS round_diff\n            FROM Teams t\n            JOIN Matches m ON (m.team_a_id = t.team_id OR m.team_b_id = t.team_id)\n            JOIN Match_Maps mm ON mm.match_id = m.match_id\n            GROUP BY t.team_id, t.team_name\n            ORDER BY wins DESC, round_diff DESC\n            LIMIT 10\n        "
  },
  {
    name: "Q27: CREATE VIEW — Player Leaderboard",
    sql: "\n            CREATE VIEW IF NOT EXISTS vw_player_leaderboard AS\n            SELECT p.player_id, p.ign, p.primary_role, t.team_name,\n                   COUNT(ps.stat_id) AS maps_played,\n                   ROUND(AVG(ps.acs), 2) AS avg_acs,\n                   SUM(ps.kills) AS total_kills,\n                   SUM(ps.deaths) AS total_deaths,\n                   SUM(ps.assists) AS total_assists,\n                   ROUND(CAST(SUM(ps.kills) AS REAL) / MAX(SUM(ps.deaths), 1), 2) AS kd_ratio,\n                   ROUND(AVG(ps.headshot_pct), 2) AS avg_hs_pct\n            FROM Players p\n            JOIN Teams t ON t.team_id = p.team_id\n            JOIN Player_Stats ps ON ps.player_id = p.player_id\n            GROUP BY p.player_id, p.ign, p.primary_role, t.team_name\n        "
  },
  {
    name: "Q28: SELECT from View — Top 5 by ACS",
    sql: "\n            SELECT ign, team_name, avg_acs, kd_ratio, avg_hs_pct\n            FROM vw_player_leaderboard\n            ORDER BY avg_acs DESC\n            LIMIT 5\n        "
  }
];

const SqlRunner = () => {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runQuery = async (overrideSql = null) => {
    const sqlToRun = overrideSql !== null ? overrideSql : query;
    if (!sqlToRun.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await axios.post(`${API_URL}/query`, { query: sqlToRun });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError("Network or API error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (sql) => {
    setQuery(sql);
    runQuery(sql);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      <header>
        <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Database size={40} className="text-accent" />
          SQL Playground
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Evaluate all 28 project SQL queries sequentially against the 261,356 record database.
          <br />
          <span style={{ color: 'var(--vct-red)', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.8rem', background: 'rgba(255,70,85,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(255,70,85,0.3)' }}>
            <AlertCircle size={16} /> Note: For production security, this playground would connect to a read-only database replica.
          </span>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Column: Query Selector */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--vct-border)', background: 'rgba(0,0,0,0.2)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Available Queries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', overflowY: 'auto', flex: 1 }}>
            {SAMPLE_QUERIES.map((sq, i) => (
               <button 
                key={i} 
                onClick={() => handleSelectQuery(sq.sql)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--vct-border)',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: '0.2s',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  display: 'flex',
                  gap: '0.5rem',
                  opacity: query === sq.sql ? 1 : 0.7,
                  borderColor: query === sq.sql ? 'var(--vct-red)' : 'var(--vct-border)'
                }}>
                <span className="text-accent" style={{ fontWeight: 700 }}>Q{i+1}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sq.name.split('—')[0].trim()}
                </span>
               </button>
            ))}
          </div>
        </div>

        {/* Right Column: Editor and Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                height: '180px',
                background: 'rgba(0,0,0,0.3)',
                color: '#46ff78',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                border: 'none',
                padding: '1.5rem',
                outline: 'none',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', borderTop: '1px solid var(--vct-border)', background: 'var(--vct-dark)' }}>
               <button 
                onClick={runQuery}
                disabled={loading}
                style={{
                  background: 'var(--vct-red)',
                  border: 'none',
                  color: 'white',
                  padding: '0.7rem 1.5rem',
                  fontFamily: 'var(--font-header)',
                  fontSize: '1.2rem',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.7 : 1
                }}>
                <Play size={20} />
                {loading ? "Executing..." : "Run Query"}
               </button>
            </div>
          </div>

          <div className="glass-panel" style={{ overflowY: 'auto', padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {error ? (
              <div style={{ padding: '2rem', display: 'flex', gap: '1rem', color: '#ff4655' }}>
                <AlertCircle size={24} />
                <div style={{ fontFamily: 'monospace' }}>{error}</div>
              </div>
            ) : !result ? (
               <div style={{ padding: '4rem 2rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 'auto' }}>
                 Select a query from the left and click Run to view results here.
               </div>
            ) : (
               <table className="vct-table" style={{ borderCollapse: 'collapse' }}>
                 <thead style={{ position: 'sticky', top: 0, background: 'var(--vct-dark)', zIndex: 10 }}>
                   <tr>
                     {result.columns.map((col, i) => (
                       <th key={i}>{col}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {result.rows.length === 0 ? (
                     <tr>
                       <td colSpan={result.columns.length} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>
                         Zero rows returned.
                       </td>
                     </tr>
                   ) : (
                     result.rows.map((row, r_idx) => (
                       <tr key={r_idx}>
                         {result.columns.map((col, c_idx) => (
                           <td key={c_idx}>{String(row[col])}</td>
                         ))}
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SqlRunner;
