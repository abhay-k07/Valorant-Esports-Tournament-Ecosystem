-- Advanced SQL features for the Valorant Esports Tournament Ecosystem.
-- This file covers everything beyond the 28 core queries:
-- indexes, additional triggers, stored procedures, transactions, DDL, and DCL.

USE valorant_esports;

-- Indexes on the columns that show up most in WHERE, JOIN, and GROUP BY.
-- Without these, the leaderboard and agent meta queries do full table scans.
CREATE INDEX idx_playerstats_player      ON Player_Stats(player_id);
CREATE INDEX idx_matches_tournament      ON Matches(tournament_id);
CREATE INDEX idx_playerstats_agent       ON Player_Stats(agent_played);
CREATE INDEX idx_matchmaps_mapname       ON Match_Maps(map_name);
CREATE INDEX idx_playerstats_map_player  ON Player_Stats(map_result_id, player_id);  -- composite for common join


-- Trigger 1 is in schema.sql. Additional triggers below cover more edge cases.

-- A team cannot be scheduled against itself.
DELIMITER $$
CREATE TRIGGER trg_no_self_match
BEFORE INSERT ON Matches
FOR EACH ROW
BEGIN
    IF NEW.team_a_id = NEW.team_b_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: A team cannot play a match against itself.';
    END IF;
END$$
DELIMITER ;

-- The winner of a match must be one of the two teams that played it.
DELIMITER $$
CREATE TRIGGER trg_valid_winner
BEFORE INSERT ON Matches
FOR EACH ROW
BEGIN
    IF NEW.winner_id IS NOT NULL
       AND NEW.winner_id != NEW.team_a_id
       AND NEW.winner_id != NEW.team_b_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Match winner must be one of the two participating teams.';
    END IF;
END$$
DELIMITER ;

-- Same validation at the map level.
DELIMITER $$
CREATE TRIGGER trg_valid_map_winner
BEFORE INSERT ON Match_Maps
FOR EACH ROW
BEGIN
    DECLARE v_team_a INT;
    DECLARE v_team_b INT;

    SELECT team_a_id, team_b_id INTO v_team_a, v_team_b
    FROM Matches WHERE match_id = NEW.match_id;

    IF NEW.map_winner_id IS NOT NULL
       AND NEW.map_winner_id != v_team_a
       AND NEW.map_winner_id != v_team_b THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Map winner must be one of the two participating teams.';
    END IF;
END$$
DELIMITER ;

-- Catches empty strings that would pass a NOT NULL check.
DELIMITER $$
CREATE TRIGGER trg_validate_agent
BEFORE INSERT ON Player_Stats
FOR EACH ROW
BEGIN
    IF NEW.agent_played IS NULL OR TRIM(NEW.agent_played) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Agent name cannot be empty.';
    END IF;
END$$
DELIMITER ;


-- Stored procedures wrap frequently used queries into reusable calls.

-- Look up all career stats for a player by their in-game name.
DELIMITER $$
CREATE PROCEDURE sp_get_player_stats(IN p_ign VARCHAR(100))
BEGIN
    SELECT
        p.ign, p.primary_role, t.team_name,
        COUNT(ps.stat_id) AS maps_played,
        ROUND(AVG(ps.acs), 2) AS avg_acs,
        SUM(ps.kills) AS total_kills, SUM(ps.deaths) AS total_deaths,
        SUM(ps.assists) AS total_assists,
        ROUND(SUM(ps.kills) / NULLIF(SUM(ps.deaths), 0), 2) AS kd_ratio,
        ROUND(AVG(ps.headshot_pct), 2) AS avg_hs_pct,
        ROUND(AVG(ps.adr), 2) AS avg_adr,
        MAX(ps.kills) AS best_kills
    FROM Players p
    LEFT JOIN Teams t         ON t.team_id    = p.team_id
    LEFT JOIN Player_Stats ps ON ps.player_id = p.player_id
    WHERE p.ign = p_ign
    GROUP BY p.player_id, p.ign, p.primary_role, t.team_name;
END$$
DELIMITER ;
-- Usage: CALL sp_get_player_stats('TenZ');

-- Tournament standings sorted by wins, then round differential as a tiebreaker.
DELIMITER $$
CREATE PROCEDURE sp_tournament_leaderboard(IN p_tournament_id INT)
BEGIN
    SELECT
        t.team_name,
        SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN m.winner_id != t.team_id THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN mm.map_winner_id = t.team_id THEN 1 ELSE 0 END) AS maps_won,
        SUM(CASE WHEN m.team_a_id = t.team_id
            THEN mm.team_a_score - mm.team_b_score
            ELSE mm.team_b_score - mm.team_a_score END) AS round_diff
    FROM Teams t
    JOIN Matches m ON (m.team_a_id = t.team_id OR m.team_b_id = t.team_id)
                   AND m.tournament_id = p_tournament_id
    JOIN Match_Maps mm ON mm.match_id = m.match_id
    GROUP BY t.team_id, t.team_name
    ORDER BY wins DESC, round_diff DESC;
END$$
DELIMITER ;
-- Usage: CALL sp_tournament_leaderboard(449);

-- Registers a match header row. Use the returned match_id to insert
-- Match_Maps and Player_Stats rows separately.
DELIMITER $$
CREATE PROCEDURE sp_register_match_result(
    IN p_tournament_id INT,
    IN p_team_a_id     INT,
    IN p_team_b_id     INT,
    IN p_format        VARCHAR(5),
    IN p_match_date    DATETIME,
    IN p_winner_id     INT
)
BEGIN
    DECLARE v_match_id INT;
    START TRANSACTION;

    INSERT INTO Matches (tournament_id, team_a_id, team_b_id, match_format, match_date, winner_id)
    VALUES (p_tournament_id, p_team_a_id, p_team_b_id, p_format, p_match_date, p_winner_id);

    SET v_match_id = LAST_INSERT_ID();
    COMMIT;

    SELECT v_match_id AS new_match_id, 'Match registered successfully' AS status;
END$$
DELIMITER ;
-- Usage: CALL sp_register_match_result(1, 101, 102, 'BO3', '2025-06-05 14:00:00', 101);

-- Agent pick rates for a specific tournament. Uses a window function for percentages.
DELIMITER $$
CREATE PROCEDURE sp_agent_meta(IN p_tournament_id INT)
BEGIN
    SELECT
        ps.agent_played,
        COUNT(*) AS times_picked,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS pick_rate_pct,
        ROUND(AVG(ps.acs), 2) AS avg_acs,
        ROUND(AVG(ps.kills), 2) AS avg_kills,
        ROUND(AVG(ps.headshot_pct), 2) AS avg_hs_pct
    FROM Player_Stats ps
    JOIN Match_Maps mm ON mm.map_result_id = ps.map_result_id
    JOIN Matches m     ON m.match_id       = mm.match_id
    WHERE m.tournament_id = p_tournament_id
    GROUP BY ps.agent_played
    ORDER BY times_picked DESC;
END$$
DELIMITER ;
-- Usage: CALL sp_agent_meta(449);


-- Transaction demo: both inserts succeed together or neither goes through.
-- This is the atomicity guarantee from ACID.
START TRANSACTION;

    INSERT INTO Match_Maps (match_id, map_number, map_name, team_a_score, team_b_score, map_winner_id)
    VALUES (
        (SELECT MIN(match_id) FROM Matches),
        99, 'Haven', 13, 7,
        (SELECT team_a_id FROM Matches ORDER BY match_id LIMIT 1)
    );

    INSERT INTO Player_Stats (map_result_id, player_id, agent_played, kills, deaths, assists, acs, headshot_pct, adr)
    VALUES (
        LAST_INSERT_ID(),
        (SELECT MIN(player_id) FROM Players),
        'Jett', 25, 12, 4, 280.5, 35.0, 180.0
    );

COMMIT;


-- Schema evolution examples. These show how the schema can grow without losing data.
ALTER TABLE Tournaments
    ADD COLUMN status ENUM('active', 'completed', 'cancelled') DEFAULT 'active';

ALTER TABLE Match_Maps
    ADD COLUMN team_a_overtime INT DEFAULT 0,
    ADD COLUMN team_b_overtime INT DEFAULT 0;

ALTER TABLE Player_Stats
    ADD COLUMN rating DECIMAL(4,2) DEFAULT NULL;

ALTER TABLE Player_Stats
    RENAME COLUMN adr TO avg_damage_per_round;


-- Role-based access control.
-- "organizer" can read everything but cannot write.
CREATE USER IF NOT EXISTS 'organizer'@'localhost' IDENTIFIED BY 'org_2025';
GRANT SELECT ON valorant_esports.* TO 'organizer'@'localhost';
GRANT SELECT ON valorant_esports.vw_player_leaderboard TO 'organizer'@'localhost';

CREATE USER IF NOT EXISTS 'admin_user'@'localhost' IDENTIFIED BY 'admin_2025';
GRANT ALL PRIVILEGES ON valorant_esports.* TO 'admin_user'@'localhost';
FLUSH PRIVILEGES;
