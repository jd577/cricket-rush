/**
 * CRICKET RUSH — International Cricket Challenge
 * Global Configuration & Constants
 * Built by Jawad Akhter | Software Quality Assurance Engineer
 */

window.CRICKET_CONFIG = {
  version: "1.0.0",
  gameTitle: "CRICKET RUSH",
  gameSubtitle: "International Cricket Challenge",
  
  // Author & Portfolio Branding
  author: {
    name: "Jawad Akhter",
    role: "Software Quality Assurance Engineer",
    portfolioUrl: "https://github.com/jd577",
    githubUrl: "https://github.com/jd577/cricket-rush",
    linkedinUrl: "https://www.linkedin.com/in/jawad-akhter"
  },

  // Gameplay Settings & Formats
  formats: {
    T20: {
      id: "T20",
      name: "T20 International",
      shortName: "T20",
      badgeColor: "#ff4757",
      description: "Fast-paced, aggressive 20-over cricket. High scoring, explosive boundaries, lightning throws.",
      maxOvers: 20,
      playableDeliveries: 12, // 2 compressed overs
      oversPerDelivery: 1.66,
      baseSpeed: 1.15,
      timingDifficulty: 1.1,
      targetRunRateBase: 9.5,
      wicketsPerInnings: 5,
      racingMultiplier: 1.1
    },
    ODI: {
      id: "ODI",
      name: "One Day International",
      shortName: "ODI",
      badgeColor: "#1e90ff",
      description: "Balanced 50-over cricket. Strategic pacing, powerplay batting, tactical field placements.",
      maxOvers: 50,
      playableDeliveries: 18, // 3 compressed overs
      oversPerDelivery: 2.77,
      baseSpeed: 1.0,
      timingDifficulty: 1.0,
      targetRunRateBase: 6.2,
      wicketsPerInnings: 7,
      racingMultiplier: 1.0
    },
    TEST: {
      id: "TEST",
      name: "Test Championship",
      shortName: "TEST",
      badgeColor: "#2ed573",
      description: "Arcade strategic Test match. Multi-session resilience, pitch wear, defensive timing importance.",
      maxOvers: 90,
      playableDeliveries: 24, // 2 sessions of 12 deliveries
      oversPerDelivery: 3.75,
      baseSpeed: 0.88,
      timingDifficulty: 0.95,
      targetRunRateBase: 3.8,
      wicketsPerInnings: 10,
      racingMultiplier: 0.9
    }
  },

  // Career XP Levels
  careerLevels: [
    { level: 1, title: "Gully Cricketer", xpRequired: 0, badge: "🌱" },
    { level: 2, title: "Club Prodigy", xpRequired: 300, badge: "🏏" },
    { level: 3, title: "Domestic Sensation", xpRequired: 800, badge: "⚡" },
    { level: 4, title: "National Cap", xpRequired: 1600, badge: "🌟" },
    { level: 5, title: "International Star", xpRequired: 2800, badge: "🔥" },
    { level: 6, title: "Match Winner", xpRequired: 4400, badge: "👑" },
    { level: 7, title: "World Champion", xpRequired: 6500, badge: "🏆" },
    { level: 8, title: "Cricket Legend", xpRequired: 9500, badge: "💎" },
    { level: 9, title: "Hall of Famer", xpRequired: 14000, badge: "🌌" }
  ],

  // Sound & FX default preferences
  defaultSettings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.8,
    reducedMotion: false,
    autoSprint: false,
    vibrationEnabled: true
  },

  // Storage Keys
  storageKeys: {
    SAVE_DATA: "cricket_rush_save_v1",
    SETTINGS: "cricket_rush_settings_v1"
  }
};
