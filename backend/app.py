from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI(title="Valorant Esports API")

# Allow the React dev server (localhost:5173) to reach this API.
# In a real deployment, replace "*" with your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The database lives one directory above the backend folder.
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "valorant_esports.db")

def get_db_connection():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database file not found.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name instead of index
    return conn


@app.get("/api/ping")
def ping():
    return {"status": "ok", "message": "API is running"}


@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 50):
    # Reads from the vw_player_leaderboard view which aggregates stats per player.
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ign, team_name, avg_acs, kd_ratio, avg_hs_pct, total_kills, maps_played
        FROM vw_player_leaderboard
        ORDER BY avg_acs DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/api/agent-meta")
def get_agent_meta():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT agent_played,
               COUNT(*) AS total_picks,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Player_Stats), 2) AS pick_rate_pct,
               ROUND(AVG(acs), 2) AS avg_acs,
               ROUND(AVG(kills), 2) AS avg_kills,
               ROUND(AVG(headshot_pct), 2) AS avg_hs_pct
        FROM Player_Stats
        GROUP BY agent_played
        ORDER BY total_picks DESC
        LIMIT 20
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/api/dashboard-stats")
def get_dashboard_stats():
    # Three separate queries instead of one big join — easier to read and debug.
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM Matches")
    matches = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Players")
    players = cursor.fetchone()[0]

    cursor.execute("""
        SELECT agent_played, COUNT(*) as c
        FROM Player_Stats
        GROUP BY agent_played
        ORDER BY c DESC LIMIT 1
    """)
    top_agent_row = cursor.fetchone()
    top_agent = top_agent_row[0] if top_agent_row else "Unknown"

    conn.close()
    return {
        "total_matches": matches,
        "total_players": players,
        "most_played_agent": top_agent
    }


@app.get("/api/players")
def get_players(search: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    if search:
        # Parameterized query — no SQL injection risk even though the input is user-supplied.
        cursor.execute("""
            SELECT ign, primary_role, team_name, maps_played, avg_acs, total_kills, kd_ratio, avg_hs_pct
            FROM vw_player_leaderboard
            WHERE ign LIKE ?
            ORDER BY avg_acs DESC
            LIMIT 100
        """, ('%' + search + '%',))
    else:
        cursor.execute("""
            SELECT ign, primary_role, team_name, maps_played, avg_acs, total_kills, kd_ratio, avg_hs_pct
            FROM vw_player_leaderboard
            ORDER BY avg_acs DESC
            LIMIT 100
        """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/api/tournaments")
def get_tournaments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT tournament_id, name, region, format, start_date, end_date, prize_pool, status
        FROM Tournaments
        ORDER BY start_date DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


from pydantic import BaseModel

class SQLQuery(BaseModel):
    query: str

@app.post("/api/query")
def run_custom_query(sql_req: SQLQuery):
    # Used by the SQL Playground tab to run arbitrary queries.
    # Mutation queries (INSERT, UPDATE, etc.) are committed; SELECT queries just return rows.
    # Note: for a production app, this endpoint should connect to a read-only replica.
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql_req.query)
        if sql_req.query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE", "ALTER", "CREATE", "DROP")):
            conn.commit()
            return {"columns": ["Status"], "rows": [{"Status": f"Command executed successfully. Rows affected: {cursor.rowcount}"}]}

        rows = cursor.fetchall()
        if not cursor.description:
            return {"columns": ["Result"], "rows": [{"Result": "Query executed successfully, but returned no data."}]}

        columns = [desc[0] for desc in cursor.description]
        data = [dict(row) for row in rows]
        return {"columns": columns, "rows": data}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
