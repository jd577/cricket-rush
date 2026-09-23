/**
 * CRICKET RUSH — International Teams Database
 * 12 Full International Cricket Teams with Attributes, Vector Flags, and Rosters
 */

const TEAMS_DATA = [
  {
    id: "PAK",
    name: "Pakistan",
    shortCode: "PAK",
    slogan: "The Green Warriors",
    captain: "Babar Azam",
    colors: {
      primary: "#004d1a",
      secondary: "#006622",
      accent: "#f7c844",
      text: "#ffffff",
      border: "#00ff66"
    },
    ratings: {
      batting: 84,
      bowling: 88,
      fielding: 82,
      running: 84,
      overall: 85
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#006622"/>
      <rect width="16" height="40" fill="#ffffff"/>
      <circle cx="38" cy="20" r="11" fill="#ffffff"/>
      <circle cx="41" cy="18" r="9.5" fill="#006622"/>
      <polygon points="41,13 43,18 48,17 44,20 46,25 41,22 37,25 38,20 35,17 39,18" fill="#ffffff"/>
    </svg>`,
    players: [
      { name: "B. Azam", role: "Batter (C)", rating: 89, type: "Top Order" },
      { name: "M. Rizwan", role: "WK Batter", rating: 87, type: "Wicketkeeper" },
      { name: "F. Zaman", role: "Batter", rating: 85, type: "Opener" },
      { name: "S. Khan", role: "All-Rounder", rating: 84, type: "Spin Allrounder" },
      { name: "I. Ahmed", role: "Batter", rating: 82, type: "Middle Order" },
      { name: "S. Afridi", role: "Fast Bowler", rating: 89, type: "Pace" },
      { name: "H. Rauf", role: "Fast Bowler", rating: 86, type: "Express Pace" },
      { name: "N. Shah", role: "Fast Bowler", rating: 85, type: "Pace" }
    ]
  },
  {
    id: "IND",
    name: "India",
    shortCode: "IND",
    slogan: "Men in Blue",
    captain: "R. Sharma",
    colors: {
      primary: "#003b7a",
      secondary: "#1e88e5",
      accent: "#ff9933",
      text: "#ffffff",
      border: "#64b5f6"
    },
    ratings: {
      batting: 89,
      bowling: 86,
      fielding: 87,
      running: 86,
      overall: 87
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="13.3" fill="#ff9933"/>
      <rect y="13.3" width="60" height="13.4" fill="#ffffff"/>
      <rect y="26.7" width="60" height="13.3" fill="#138808"/>
      <circle cx="30" cy="20" r="4.5" fill="none" stroke="#000088" stroke-width="1"/>
      <circle cx="30" cy="20" r="1" fill="#000088"/>
      <circle cx="30" cy="20" r="3.5" fill="none" stroke="#000088" stroke-dasharray="0.8,0.8" stroke-width="0.8"/>
    </svg>`,
    players: [
      { name: "R. Sharma", role: "Batter (C)", rating: 88, type: "Opener" },
      { name: "V. Kohli", role: "Batter", rating: 91, type: "Top Order" },
      { name: "S. Gill", role: "Batter", rating: 86, type: "Opener" },
      { name: "S. Yadav", role: "Batter", rating: 88, type: "Middle Order" },
      { name: "H. Pandya", role: "All-Rounder", rating: 86, type: "Pace Allrounder" },
      { name: "J. Bumrah", role: "Fast Bowler", rating: 91, type: "Pace" },
      { name: "M. Shami", role: "Fast Bowler", rating: 87, type: "Pace" },
      { name: "K. Yadav", role: "Spin Bowler", rating: 85, type: "Spin" }
    ]
  },
  {
    id: "AUS",
    name: "Australia",
    shortCode: "AUS",
    slogan: "The Baggy Greens",
    captain: "P. Cummins",
    colors: {
      primary: "#d4a017",
      secondary: "#004d26",
      accent: "#ffee55",
      text: "#000000",
      border: "#ffd700"
    },
    ratings: {
      batting: 88,
      bowling: 87,
      fielding: 89,
      running: 88,
      overall: 88
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#000066"/>
      <!-- Union Jack corner -->
      <rect width="30" height="20" fill="#00247d"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#ffffff" stroke-width="3"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#cc0000" stroke-width="1.5"/>
      <path d="M15,0 V20 M0,10 H30" stroke="#ffffff" stroke-width="4"/>
      <path d="M15,0 V20 M0,10 H30" stroke="#cc0000" stroke-width="2.5"/>
      <!-- Commonwealth Star -->
      <polygon points="15,25 16.5,28 20,28 17,30.5 18,34 15,32 12,34 13,30.5 10,28 13.5,28" fill="#ffffff"/>
      <!-- Southern Cross Stars -->
      <polygon points="45,8 45.6,9.5 47,9.5 46,10.5 46.4,12 45,11.2 43.6,12 44,10.5 43,9.5 44.4,9.5" fill="#ffffff"/>
      <polygon points="52,15 52.6,16.5 54,16.5 53,17.5 53.4,19 52,18.2 50.6,19 51,17.5 50,16.5 51.4,16.5" fill="#ffffff"/>
      <polygon points="38,18 38.6,19.5 40,19.5 39,20.5 39.4,22 38,21.2 36.6,22 37,20.5 36,19.5 37.4,19.5" fill="#ffffff"/>
      <polygon points="45,30 45.6,31.5 47,31.5 46,32.5 46.4,34 45,33.2 43.6,34 44,32.5 43,31.5 44.4,31.5" fill="#ffffff"/>
    </svg>`,
    players: [
      { name: "T. Head", role: "Batter", rating: 88, type: "Opener" },
      { name: "D. Warner", role: "Batter", rating: 87, type: "Opener" },
      { name: "S. Smith", role: "Batter", rating: 89, type: "Top Order" },
      { name: "G. Maxwell", role: "All-Rounder", rating: 88, type: "Power Hitter" },
      { name: "M. Marsh", role: "All-Rounder", rating: 85, type: "Pace Allrounder" },
      { name: "P. Cummins", role: "Fast Bowler (C)", rating: 89, type: "Pace" },
      { name: "M. Starc", role: "Fast Bowler", rating: 88, type: "Express Pace" },
      { name: "A. Zampa", role: "Spin Bowler", rating: 86, type: "Leg Spin" }
    ]
  },
  {
    id: "ENG",
    name: "England",
    shortCode: "ENG",
    slogan: "The Three Lions",
    captain: "J. Buttler",
    colors: {
      primary: "#0b1b3d",
      secondary: "#19398a",
      accent: "#e51b24",
      text: "#ffffff",
      border: "#4b7bec"
    },
    ratings: {
      batting: 87,
      bowling: 86,
      fielding: 86,
      running: 85,
      overall: 86
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#ffffff"/>
      <rect x="25" width="10" height="40" fill="#cc0000"/>
      <rect y="15" width="60" height="10" fill="#cc0000"/>
    </svg>`,
    players: [
      { name: "J. Buttler", role: "WK Batter (C)", rating: 89, type: "Wicketkeeper" },
      { name: "J. Bairstow", role: "Batter", rating: 86, type: "Opener" },
      { name: "J. Root", role: "Batter", rating: 90, type: "Top Order" },
      { name: "H. Brook", role: "Batter", rating: 85, type: "Middle Order" },
      { name: "B. Stokes", role: "All-Rounder", rating: 88, type: "Pace Allrounder" },
      { name: "J. Archer", role: "Fast Bowler", rating: 88, type: "Express Pace" },
      { name: "M. Wood", role: "Fast Bowler", rating: 87, type: "Express Pace" },
      { name: "A. Rashid", role: "Spin Bowler", rating: 85, type: "Leg Spin" }
    ]
  },
  {
    id: "SA",
    name: "South Africa",
    shortCode: "SA",
    slogan: "The Proteas",
    captain: "T. Bavuma",
    colors: {
      primary: "#006633",
      secondary: "#004d26",
      accent: "#ffcc00",
      text: "#ffffff",
      border: "#20bf6b"
    },
    ratings: {
      batting: 85,
      bowling: 87,
      fielding: 90,
      running: 87,
      overall: 87
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="20" fill="#e03c31"/>
      <rect y="20" width="60" height="20" fill="#001489"/>
      <polygon points="0,0 24,20 0,40" fill="#000000"/>
      <polygon points="0,0 26,20 0,40" fill="none" stroke="#ffb81c" stroke-width="2.5"/>
      <path d="M0,20 L24,20 L60,20" stroke="#007749" stroke-width="7"/>
      <path d="M0,20 L24,20 L60,20" stroke="#ffffff" stroke-width="2" fill="none"/>
    </svg>`,
    players: [
      { name: "Q. de Kock", role: "WK Batter", rating: 88, type: "Opener" },
      { name: "A. Markram", role: "Batter", rating: 86, type: "Top Order" },
      { name: "H. Klaasen", role: "Batter", rating: 89, type: "Power Hitter" },
      { name: "D. Miller", role: "Batter", rating: 87, type: "Finisher" },
      { name: "M. Jansen", role: "All-Rounder", rating: 84, type: "Pace Allrounder" },
      { name: "K. Rabada", role: "Fast Bowler", rating: 90, type: "Pace" },
      { name: "A. Nortje", role: "Fast Bowler", rating: 87, type: "Express Pace" },
      { name: "K. Maharaj", role: "Spin Bowler", rating: 85, type: "Spin" }
    ]
  },
  {
    id: "NZ",
    name: "New Zealand",
    shortCode: "NZ",
    slogan: "The Blackcaps",
    captain: "K. Williamson",
    colors: {
      primary: "#111111",
      secondary: "#222222",
      accent: "#00b4d8",
      text: "#ffffff",
      border: "#48dbfb"
    },
    ratings: {
      batting: 86,
      bowling: 86,
      fielding: 88,
      running: 86,
      overall: 86
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#00247d"/>
      <rect width="30" height="20" fill="#001489"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#ffffff" stroke-width="3"/>
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#cc0000" stroke-width="1.5"/>
      <path d="M15,0 V20 M0,10 H30" stroke="#ffffff" stroke-width="4"/>
      <path d="M15,0 V20 M0,10 H30" stroke="#cc0000" stroke-width="2.5"/>
      <!-- Red stars with white border -->
      <polygon points="45,8 46,11 49,11 47,13 48,16 45,14 42,16 43,13 41,11 44,11" fill="#cc0000" stroke="#ffffff" stroke-width="0.8"/>
      <polygon points="52,16 53,18 55,18 53.5,19.5 54,22 52,20.5 50,22 50.5,19.5 49,18 51,18" fill="#cc0000" stroke="#ffffff" stroke-width="0.8"/>
      <polygon points="39,20 40,22 42,22 40.5,23.5 41,26 39,24.5 37,26 37.5,23.5 36,22 38,22" fill="#cc0000" stroke="#ffffff" stroke-width="0.8"/>
      <polygon points="45,30 46,32 48,32 46.5,33.5 47,36 45,34.5 43,36 43.5,33.5 42,32 44,32" fill="#cc0000" stroke="#ffffff" stroke-width="0.8"/>
    </svg>`,
    players: [
      { name: "D. Conway", role: "WK Batter", rating: 86, type: "Opener" },
      { name: "K. Williamson", role: "Batter (C)", rating: 90, type: "Anchor" },
      { name: "D. Mitchell", role: "Batter", rating: 87, type: "Middle Order" },
      { name: "G. Phillips", role: "All-Rounder", rating: 85, type: "Power Hitter" },
      { name: "M. Santner", role: "All-Rounder", rating: 85, type: "Spin" },
      { name: "T. Boult", role: "Fast Bowler", rating: 89, type: "Swing Pace" },
      { name: "M. Henry", role: "Fast Bowler", rating: 86, type: "Pace" },
      { name: "L. Ferguson", role: "Fast Bowler", rating: 85, type: "Express Pace" }
    ]
  },
  {
    id: "SL",
    name: "Sri Lanka",
    shortCode: "SL",
    slogan: "The Lions",
    captain: "C. Asalanka",
    colors: {
      primary: "#0b2046",
      secondary: "#10346a",
      accent: "#fdb813",
      text: "#ffffff",
      border: "#f1c40f"
    },
    ratings: {
      batting: 83,
      bowling: 84,
      fielding: 83,
      running: 84,
      overall: 83
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#fdb813"/>
      <rect x="2" y="2" width="56" height="36" fill="#fdb813"/>
      <rect x="5" y="5" width="8" height="30" fill="#008000"/>
      <rect x="15" y="5" width="8" height="30" fill="#ff7900"/>
      <rect x="25" y="5" width="30" height="30" fill="#8d153a"/>
      <circle cx="40" cy="20" r="8" fill="#fdb813"/>
    </svg>`,
    players: [
      { name: "P. Nissanka", role: "Batter", rating: 85, type: "Opener" },
      { name: "K. Mendis", role: "WK Batter", rating: 84, type: "Top Order" },
      { name: "C. Asalanka", role: "Batter (C)", rating: 84, type: "Middle Order" },
      { name: "W. Hasaranga", role: "All-Rounder", rating: 88, type: "Leg Spin" },
      { name: "D. Wellalage", role: "All-Rounder", rating: 82, type: "Spin" },
      { name: "M. Theekshana", role: "Spin Bowler", rating: 86, type: "Mystery Spin" },
      { name: "M. Pathirana", role: "Fast Bowler", rating: 86, type: "Sling Pace" },
      { name: "D. Madushanka", role: "Fast Bowler", rating: 83, type: "Swing" }
    ]
  },
  {
    id: "WI",
    name: "West Indies",
    shortCode: "WI",
    slogan: "The Windies",
    captain: "R. Powell",
    colors: {
      primary: "#660022",
      secondary: "#880033",
      accent: "#f7b731",
      text: "#ffffff",
      border: "#eb3b5a"
    },
    ratings: {
      batting: 86,
      bowling: 82,
      fielding: 83,
      running: 83,
      overall: 84
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#7b1113"/>
      <circle cx="30" cy="20" r="14" fill="#0088cc"/>
      <circle cx="30" cy="20" r="10" fill="#fcd116"/>
      <rect x="28" y="14" width="4" height="12" fill="#7b1113"/>
    </svg>`,
    players: [
      { name: "S. Hope", role: "WK Batter", rating: 86, type: "Top Order" },
      { name: "N. Pooran", role: "Batter", rating: 88, type: "Power Hitter" },
      { name: "R. Powell", role: "Batter (C)", rating: 85, type: "Finisher" },
      { name: "A. Russell", role: "All-Rounder", rating: 89, type: "Power Hitter" },
      { name: "J. Holder", role: "All-Rounder", rating: 84, type: "Pace" },
      { name: "A. Joseph", role: "Fast Bowler", rating: 85, type: "Express Pace" },
      { name: "G. Motie", role: "Spin Bowler", rating: 83, type: "Spin" },
      { name: "S. Joseph", role: "Fast Bowler", rating: 84, type: "Express Pace" }
    ]
  },
  {
    id: "BAN",
    name: "Bangladesh",
    shortCode: "BAN",
    slogan: "The Tigers",
    captain: "N. Hossain",
    colors: {
      primary: "#004733",
      secondary: "#006a4e",
      accent: "#f42a41",
      text: "#ffffff",
      border: "#26de81"
    },
    ratings: {
      batting: 82,
      bowling: 83,
      fielding: 81,
      running: 82,
      overall: 82
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="40" fill="#006a4e"/>
      <circle cx="26" cy="20" r="12" fill="#f42a41"/>
    </svg>`,
    players: [
      { name: "L. Das", role: "WK Batter", rating: 83, type: "Opener" },
      { name: "N. Hossain", role: "Batter (C)", rating: 84, type: "Top Order" },
      { name: "S. Al Hasan", role: "All-Rounder", rating: 88, type: "Spin Allrounder" },
      { name: "M. Rahim", role: "Batter", rating: 83, type: "Middle Order" },
      { name: "M. Miraz", role: "All-Rounder", rating: 84, type: "Off Spin" },
      { name: "T. Ahmed", role: "Fast Bowler", rating: 85, type: "Pace" },
      { name: "M. Rahman", role: "Fast Bowler", rating: 85, type: "Cutter / Pace" },
      { name: "S. Islam", role: "Fast Bowler", rating: 82, type: "Swing" }
    ]
  },
  {
    id: "AFG",
    name: "Afghanistan",
    shortCode: "AFG",
    slogan: "The Blue Tigers",
    captain: "R. Khan",
    colors: {
      primary: "#092f6b",
      secondary: "#154494",
      accent: "#d32011",
      text: "#ffffff",
      border: "#3867d6"
    },
    ratings: {
      batting: 81,
      bowling: 87,
      fielding: 82,
      running: 83,
      overall: 83
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="20" height="40" fill="#000000"/>
      <rect x="20" width="20" height="40" fill="#d32011"/>
      <rect x="40" width="20" height="40" fill="#007a3d"/>
      <circle cx="30" cy="20" r="7" fill="none" stroke="#ffffff" stroke-width="1.2"/>
    </svg>`,
    players: [
      { name: "R. Gurbaz", role: "WK Batter", rating: 86, type: "Power Opener" },
      { name: "I. Zadran", role: "Batter", rating: 84, type: "Top Order" },
      { name: "M. Nabi", role: "All-Rounder", rating: 85, type: "Off Spin" },
      { name: "A. Omarzai", role: "All-Rounder", rating: 84, type: "Pace Allrounder" },
      { name: "R. Khan", role: "Spin Bowler (C)", rating: 92, type: "World Class Leg Spin" },
      { name: "N. Ahmad", role: "Spin Bowler", rating: 84, type: "Wrist Spin" },
      { name: "F. Farooqi", role: "Fast Bowler", rating: 86, type: "Left-arm Swing" },
      { name: "N. ul-Haq", role: "Fast Bowler", rating: 84, type: "Pace" }
    ]
  },
  {
    id: "IRE",
    name: "Ireland",
    shortCode: "IRE",
    slogan: "The Men in Green",
    captain: "P. Stirling",
    colors: {
      primary: "#0b5331",
      secondary: "#169b62",
      accent: "#ff7900",
      text: "#ffffff",
      border: "#2ed573"
    },
    ratings: {
      batting: 80,
      bowling: 81,
      fielding: 83,
      running: 82,
      overall: 81
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="20" height="40" fill="#169b62"/>
      <rect x="20" width="20" height="40" fill="#ffffff"/>
      <rect x="40" width="20" height="40" fill="#ff7900"/>
    </svg>`,
    players: [
      { name: "P. Stirling", role: "Batter (C)", rating: 84, type: "Power Opener" },
      { name: "A. Balbirnie", role: "Batter", rating: 82, type: "Top Order" },
      { name: "H. Tector", role: "Batter", rating: 85, type: "Anchor" },
      { name: "L. Tucker", role: "WK Batter", rating: 83, type: "Wicketkeeper" },
      { name: "C. Campher", role: "All-Rounder", rating: 83, type: "Pace Allrounder" },
      { name: "M. Adair", role: "Fast Bowler", rating: 84, type: "Pace" },
      { name: "J. Little", role: "Fast Bowler", rating: 85, type: "Left-arm Pace" },
      { name: "B. White", role: "Spin Bowler", rating: 80, type: "Leg Spin" }
    ]
  },
  {
    id: "ZIM",
    name: "Zimbabwe",
    shortCode: "ZIM",
    slogan: "The Chevrons",
    captain: "S. Raza",
    colors: {
      primary: "#8b0000",
      secondary: "#b30000",
      accent: "#ffd700",
      text: "#ffffff",
      border: "#ff4757"
    },
    ratings: {
      batting: 79,
      bowling: 80,
      fielding: 81,
      running: 81,
      overall: 80
    },
    flagSvg: `<svg viewBox="0 0 60 40" class="team-flag-svg">
      <rect width="60" height="5.7" fill="#006400"/>
      <rect y="5.7" width="60" height="5.7" fill="#ffd700"/>
      <rect y="11.4" width="60" height="5.7" fill="#d40000"/>
      <rect y="17.1" width="60" height="5.7" fill="#000000"/>
      <rect y="22.8" width="60" height="5.7" fill="#d40000"/>
      <rect y="28.5" width="60" height="5.7" fill="#ffd700"/>
      <rect y="34.2" width="60" height="5.8" fill="#006400"/>
      <polygon points="0,0 20,20 0,40" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
      <polygon points="5,16 7,20 12,20 8,23 9.5,27 5,24 1.5,27 3,23 0,20 4,20" fill="#d40000"/>
    </svg>`,
    players: [
      { name: "S. Raza", role: "All-Rounder (C)", rating: 87, type: "All-Rounder" },
      { name: "C. Ervine", role: "Batter", rating: 81, type: "Top Order" },
      { name: "W. Madhevere", role: "Batter", rating: 79, type: "Opener" },
      { name: "R. Burl", role: "All-Rounder", rating: 81, type: "Power Hitter" },
      { name: "C. Madande", role: "WK Batter", rating: 78, type: "Wicketkeeper" },
      { name: "B. Muzarabani", role: "Fast Bowler", rating: 85, type: "Bounce Pace" },
      { name: "R. Ngarava", role: "Fast Bowler", rating: 83, type: "Left-arm Pace" },
      { name: "T. Chatara", role: "Fast Bowler", rating: 80, type: "Pace" }
    ]
  }
];

window.TEAMS_DATA = TEAMS_DATA;

window.TeamsManager = {
  getAll: () => TEAMS_DATA,
  getById: (id) => TEAMS_DATA.find(t => t.id === id) || TEAMS_DATA[0],
  
  // Calculate relative match difficulty multiplier
  getMatchDifficulty: (playerTeamId, opponentTeamId, stage = "group") => {
    const playerTeam = TEAMS_DATA.find(t => t.id === playerTeamId) || TEAMS_DATA[0];
    const opponentTeam = TEAMS_DATA.find(t => t.id === opponentTeamId) || TEAMS_DATA[1];
    
    // Rating differential
    const ratingDiff = (opponentTeam.ratings.overall - playerTeam.ratings.overall) / 100;
    
    // Stage difficulty scale
    let stageMultiplier = 1.0;
    if (stage === "super" || stage === "quarter") stageMultiplier = 1.12;
    if (stage === "semi") stageMultiplier = 1.25;
    if (stage === "final") stageMultiplier = 1.40;

    return {
      bowlerSpeedModifier: Math.max(0.85, Math.min(1.35, 1.0 + ratingDiff * 0.4 + (stageMultiplier - 1.0) * 0.3)),
      fielderSpeedModifier: Math.max(0.85, Math.min(1.4, (opponentTeam.ratings.fielding / 85) * stageMultiplier)),
      timingWindowModifier: Math.max(0.7, Math.min(1.2, (playerTeam.ratings.batting / opponentTeam.ratings.bowling) / (stageMultiplier * 0.95))),
      runningSpeedModifier: Math.max(0.85, Math.min(1.25, playerTeam.ratings.running / 85)),
      stageMultiplier
    };
  }
};
