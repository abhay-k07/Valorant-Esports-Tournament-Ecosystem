-- Valorant Esports Tournament Ecosystem
-- B.Tech CSE DBMS Project, 2025-26
-- Group: Abhay Kumar (2410030695), Dushyant Kumar (2410030677),
--        Vaishnavi Sharma (2410030681), Deepak Kumar (2410030660)
--
-- MySQL-compatible schema. The actual runtime uses SQLite (valorant_esports.db).
-- This file is the MySQL version for submission.

DROP DATABASE IF EXISTS valorant_esports;
CREATE DATABASE valorant_esports
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE valorant_esports;

CREATE TABLE Tournaments (
    tournament_id   INT             PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(150)    NOT NULL,
    region          VARCHAR(50)     NOT NULL,
    format          VARCHAR(30)     NOT NULL,  -- "Double Elimination", "Single Elimination"
    start_date      DATE            NOT NULL,
    end_date        DATE            NULL,       -- NULL until the event concludes
    prize_pool      DECIMAL(12,2)   NULL        -- in USD
) ENGINE=InnoDB;

CREATE TABLE Teams (
    team_id         INT             PRIMARY KEY AUTO_INCREMENT,
    team_name       VARCHAR(150)    NOT NULL UNIQUE,
    region          VARCHAR(50)     NOT NULL,
    founded_date    DATE            NULL
) ENGINE=InnoDB;

CREATE TABLE Players (
    player_id       INT             PRIMARY KEY AUTO_INCREMENT,
    ign             VARCHAR(100)    NOT NULL UNIQUE,  -- in-game name
    real_name       VARCHAR(150)    NULL,
    primary_role    VARCHAR(30)     NOT NULL,  -- Duelist, Controller, Sentinel, Initiator
    country         VARCHAR(50)     NULL,
    team_id         INT             NULL,
    CONSTRAINT fk_player_team FOREIGN KEY (team_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE ON DELETE SET NULL  -- if a team is deleted, players become free agents
) ENGINE=InnoDB;

-- A match is one best-of series between two teams.
-- Individual map results live in Match_Maps.
CREATE TABLE Matches (
    match_id        INT             PRIMARY KEY AUTO_INCREMENT,
    tournament_id   INT             NOT NULL,
    team_a_id       INT             NOT NULL,
    team_b_id       INT             NOT NULL,
    match_format    VARCHAR(5)      NOT NULL,  -- BO1, BO3, BO5
    match_date      DATETIME        NOT NULL,
    winner_id       INT             NULL,       -- NULL while the match is in progress
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_match_team_a FOREIGN KEY (team_a_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_match_team_b FOREIGN KEY (team_b_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_match_winner FOREIGN KEY (winner_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Match_Maps (
    map_result_id   INT             PRIMARY KEY AUTO_INCREMENT,
    match_id        INT             NOT NULL,
    map_number      INT             NOT NULL,   -- 1st map, 2nd map, etc.
    map_name        VARCHAR(60)     NOT NULL,   -- Ascent, Bind, Haven, etc.
    team_a_score    INT             NOT NULL DEFAULT 0,  -- rounds won
    team_b_score    INT             NOT NULL DEFAULT 0,
    map_winner_id   INT             NULL,
    CONSTRAINT fk_mapresult_match FOREIGN KEY (match_id) REFERENCES Matches(match_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mapresult_winner FOREIGN KEY (map_winner_id) REFERENCES Teams(team_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT uq_match_map UNIQUE (match_id, map_number)
) ENGINE=InnoDB;

-- 3NF note: we removed match_id from this table.
-- The match is derivable via Player_Stats -> Match_Maps -> Matches.
-- Keeping match_id here would create a transitive dependency (stat -> map -> match).
CREATE TABLE Player_Stats (
    stat_id         INT             PRIMARY KEY AUTO_INCREMENT,
    map_result_id   INT             NOT NULL,
    player_id       INT             NOT NULL,
    agent_played    VARCHAR(60)     NOT NULL,
    kills           INT             NOT NULL DEFAULT 0,
    deaths          INT             NOT NULL DEFAULT 0,
    assists         INT             NOT NULL DEFAULT 0,
    acs             DECIMAL(7,2)    NOT NULL DEFAULT 0,  -- Average Combat Score
    headshot_pct    DECIMAL(5,2)    NOT NULL DEFAULT 0,  -- 0.00 to 100.00
    adr             DECIMAL(7,2)    NOT NULL DEFAULT 0,  -- Average Damage per Round
    CONSTRAINT fk_stat_mapresult FOREIGN KEY (map_result_id) REFERENCES Match_Maps(map_result_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_stat_player FOREIGN KEY (player_id) REFERENCES Players(player_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_stat_map_player UNIQUE (map_result_id, player_id)  -- one stat row per player per map
) ENGINE=InnoDB;

-- Precomputed leaderboard. Used by the /api/leaderboard and /api/players endpoints.
CREATE VIEW vw_player_leaderboard AS
SELECT
    p.player_id,
    p.ign,
    p.primary_role,
    t.team_name,
    COUNT(ps.stat_id)                                           AS maps_played,
    ROUND(AVG(ps.acs), 2)                                       AS avg_acs,
    SUM(ps.kills)                                               AS total_kills,
    SUM(ps.deaths)                                              AS total_deaths,
    SUM(ps.assists)                                             AS total_assists,
    ROUND(SUM(ps.kills) / NULLIF(SUM(ps.deaths), 0), 2)        AS kd_ratio,  -- NULLIF avoids division by zero
    ROUND(AVG(ps.headshot_pct), 2)                             AS avg_hs_pct,
    ROUND(AVG(ps.adr), 2)                                      AS avg_adr
FROM Players p
JOIN Teams t         ON t.team_id    = p.team_id
JOIN Player_Stats ps ON ps.player_id = p.player_id
GROUP BY p.player_id, p.ign, p.primary_role, t.team_name;

-- Business rule: players cannot be transferred between teams while their
-- current team is still active in a tournament.
DELIMITER $$
CREATE TRIGGER trg_no_roster_change_during_tournament
BEFORE UPDATE ON Players
FOR EACH ROW
BEGIN
    DECLARE active_count INT DEFAULT 0;

    IF OLD.team_id IS NOT NULL AND OLD.team_id != NEW.team_id THEN
        SELECT COUNT(*) INTO active_count
        FROM Matches m
        WHERE (m.team_a_id = OLD.team_id OR m.team_b_id = OLD.team_id)
          AND m.winner_id IS NULL
          AND m.tournament_id IN (
              SELECT t.tournament_id FROM Tournaments t
              WHERE t.start_date <= CURDATE()
                AND (t.end_date IS NULL OR t.end_date >= CURDATE())
          );

        IF active_count > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'ERROR: Cannot transfer a player while their team is in an active tournament.';
        END IF;
    END IF;
END$$
DELIMITER ;

SELECT 'Schema created successfully!' AS Status;
