/**
 * CRICKET RUSH — Persistent Storage Engine (localStorage)
 * Seamlessly stores career progression, XP, stats, unlocked trophies, and active tournament state.
 */

const STORAGE_KEYS = {
  SAVE: "cricket_rush_save_v1",
  SETTINGS: "cricket_rush_settings_v1"
};

const DEFAULT_SAVE_DATA = {
  career: {
    xp: 0,
    level: 1,
    title: "Gully Cricketer",
    selectedTeamId: "PAK",
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    totalRuns: 0,
    totalBalls: 0,
    totalFours: 0,
    totalSixes: 0,
    totalWicketsTaken: 0,
    totalWicketsLost: 0,
    highestScore: 0,
    trophiesWonCount: 0
  },
  trophyCabinet: [],
  activeTournament: null,
  version: "1.0.0"
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  reducedMotion: false,
  autoSprint: false,
  volume: 0.8
};

window.StorageManager = {
  /**
   * Load entire save state or return default
   */
  loadSave: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVE);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      const parsed = JSON.parse(raw);
      return {
        career: { ...DEFAULT_SAVE_DATA.career, ...(parsed.career || {}) },
        trophyCabinet: Array.isArray(parsed.trophyCabinet) ? parsed.trophyCabinet : [],
        activeTournament: parsed.activeTournament || null,
        version: parsed.version || "1.0.0"
      };
    } catch (e) {
      console.error("Failed to load save data from localStorage:", e);
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
  },

  /**
   * Save state to localStorage
   */
  save: (data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Failed to write save data to localStorage:", e);
      return false;
    }
  },

  /**
   * Add XP and recalculate Level
   */
  addXP: (amount, reason = "Match Event") => {
    const save = window.StorageManager.loadSave();
    const oldLevel = save.career.level;
    save.career.xp = (save.career.xp || 0) + Math.max(0, amount);

    // Calculate level
    const levels = window.CRICKET_CONFIG.careerLevels;
    let currentLevelObj = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (save.career.xp >= levels[i].xpRequired) {
        currentLevelObj = levels[i];
        break;
      }
    }

    save.career.level = currentLevelObj.level;
    save.career.title = currentLevelObj.title;

    window.StorageManager.save(save);

    return {
      totalXP: save.career.xp,
      addedXP: amount,
      level: save.career.level,
      title: save.career.title,
      leveledUp: save.career.level > oldLevel,
      reason
    };
  },

  /**
   * Record match statistics into career
   */
  recordMatchStats: ({ runs, balls, fours, sixes, won, wicketsLost, isHighestScore }) => {
    const save = window.StorageManager.loadSave();
    save.career.matchesPlayed += 1;
    if (won) {
      save.career.matchesWon += 1;
    } else {
      save.career.matchesLost += 1;
    }
    save.career.totalRuns += runs;
    save.career.totalBalls += balls;
    save.career.totalFours += fours;
    save.career.totalSixes += sixes;
    save.career.totalWicketsLost += wicketsLost;
    if (runs > save.career.highestScore) {
      save.career.highestScore = runs;
    }

    window.StorageManager.save(save);
  },

  /**
   * Unlock a Trophy and add to Cabinet
   */
  unlockTrophy: ({ tournamentId, tournamentName, trophyId, trophyName, teamId, teamName, format }) => {
    const save = window.StorageManager.loadSave();
    const existing = save.trophyCabinet.find(t => t.tournamentId === tournamentId);
    
    if (existing) {
      existing.timesWon = (existing.timesWon || 1) + 1;
      existing.lastWonDate = new Date().toLocaleDateString();
      existing.lastTeamId = teamId;
      existing.lastTeamName = teamName;
    } else {
      save.trophyCabinet.push({
        tournamentId,
        tournamentName,
        trophyId,
        trophyName,
        timesWon: 1,
        wonDate: new Date().toLocaleDateString(),
        lastWonDate: new Date().toLocaleDateString(),
        teamId,
        teamName,
        format
      });
      save.career.trophiesWonCount = save.trophyCabinet.length;
    }

    window.StorageManager.save(save);
  },

  /**
   * Save current active tournament
   */
  saveActiveTournament: (tournamentState) => {
    const save = window.StorageManager.loadSave();
    save.activeTournament = tournamentState;
    window.StorageManager.save(save);
  },

  /**
   * Clear active tournament
   */
  clearActiveTournament: () => {
    const save = window.StorageManager.loadSave();
    save.activeTournament = null;
    window.StorageManager.save(save);
  },

  /**
   * Check if there is a resumeable active tournament
   */
  hasActiveTournament: () => {
    const save = window.StorageManager.loadSave();
    return !!(save.activeTournament && !save.activeTournament.isCompleted);
  },

  /**
   * Load user settings
   */
  loadSettings: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  },

  /**
   * Save user settings
   */
  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (window.cricketSound) {
        window.cricketSound.setEnabled(settings.soundEnabled);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Completely reset career data
   */
  resetCareer: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVE);
      return true;
    } catch (e) {
      return false;
    }
  }
};
