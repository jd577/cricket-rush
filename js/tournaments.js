/**
 * CRICKET RUSH — Tournament Engine & Data-Driven Progression
 * Supports ICC World Cup, Champions Trophy, T20 World Cup, Asia Cup, Tri-Series, Bilateral Series, Test Championship.
 */

const TOURNAMENTS_CONFIG = [
  {
    id: "world_cup",
    name: "ICC World Cup",
    shortName: "World Cup",
    subtitle: "The Pinnacle of Global Cricket",
    defaultFormat: "ODI",
    allowedFormats: ["ODI"],
    badge: "🌍",
    trophyId: "trophy_world_cup",
    trophyName: "World Cup Globe Trophy",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="goldGradWC" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff275" />
          <stop offset="50%" stop-color="#ffd700" />
          <stop offset="100%" stop-color="#b8860b" />
        </linearGradient>
        <radialGradient id="globeGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff8cc" />
          <stop offset="40%" stop-color="#ffd700" />
          <stop offset="100%" stop-color="#996515" />
        </radialGradient>
      </defs>
      <!-- Base Tier 1 -->
      <path d="M25,120 L75,120 L70,108 L30,108 Z" fill="#222" stroke="#444" stroke-width="1.5"/>
      <path d="M30,108 L70,108 L65,96 L35,96 Z" fill="url(#goldGradWC)"/>
      <rect x="36" y="100" width="28" height="4" fill="#333" rx="1"/>
      <!-- Three Pillars -->
      <path d="M36,96 C37,60 40,40 45,34 L41,34 C35,42 32,60 33,96 Z" fill="url(#goldGradWC)"/>
      <path d="M64,96 C63,60 60,40 55,34 L59,34 C65,42 68,60 67,96 Z" fill="url(#goldGradWC)"/>
      <path d="M48,96 L52,96 L52,34 L48,34 Z" fill="url(#goldGradWC)"/>
      <!-- Top Golden Sphere / Globe -->
      <circle cx="50" cy="26" r="18" fill="url(#globeGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"/>
      <!-- Seam / Meridian lines -->
      <ellipse cx="50" cy="26" rx="8" ry="17" fill="none" stroke="#fff8cc" stroke-width="1.2" opacity="0.8"/>
      <ellipse cx="50" cy="26" rx="17" ry="6" fill="none" stroke="#fff8cc" stroke-width="1.2" opacity="0.8"/>
      <!-- Laurel Wreath accent -->
      <path d="M20,65 C18,48 28,36 32,34" fill="none" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M80,65 C82,48 72,36 68,34" fill="none" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    structure: "Group Stage (5 Matches) → Semi-Final → Final",
    totalTeams: 8,
    groupCount: 2,
    groupSize: 4,
    description: "Battle through elite international group stages, survive sudden-death knockouts, and lift the supreme ODI World Cup."
  },
  {
    id: "t20_world_cup",
    name: "T20 World Cup",
    shortName: "T20 World Cup",
    subtitle: "High-Octane Blitzkrieg Glory",
    defaultFormat: "T20",
    allowedFormats: ["T20"],
    badge: "⚡",
    trophyId: "trophy_t20_wc",
    trophyName: "T20 Lightning Crystal Trophy",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#dcdde1" />
          <stop offset="100%" stop-color="#718093" />
        </linearGradient>
        <linearGradient id="neonCyan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00f2fe" />
          <stop offset="100%" stop-color="#4facfe" />
        </linearGradient>
      </defs>
      <!-- Base -->
      <path d="M22,122 L78,122 L72,106 L28,106 Z" fill="#1e272e"/>
      <path d="M28,106 L72,106 L66,94 L34,94 Z" fill="url(#silverGrad)"/>
      <!-- Dynamic V-Shape Crystal Columns -->
      <path d="M34,94 L22,25 L34,25 L45,94 Z" fill="url(#neonCyan)"/>
      <path d="M66,94 L78,25 L66,25 L55,94 Z" fill="url(#neonCyan)"/>
      <path d="M47,94 L47,20 L53,20 L53,94 Z" fill="url(#silverGrad)"/>
      <!-- Top Ball in motion with lightning rings -->
      <circle cx="50" cy="20" r="14" fill="url(#silverGrad)"/>
      <ellipse cx="50" cy="20" rx="18" ry="6" fill="none" stroke="#00f2fe" stroke-width="2" transform="rotate(-20 50 20)"/>
      <polygon points="50,6 54,16 48,16 52,28 44,18 49,18" fill="#ffd700"/>
    </svg>`,
    structure: "Group Stage (4 Matches) → Semi-Final → Final",
    totalTeams: 8,
    groupCount: 2,
    groupSize: 4,
    description: "Fast balls, giant sixes, and razor-sharp running. The world's fastest format where every single millisecond counts."
  },
  {
    id: "champions_trophy",
    name: "Champions Trophy",
    shortName: "Champions Trophy",
    subtitle: "Battle of the Top 8 Elite",
    defaultFormat: "ODI",
    allowedFormats: ["ODI"],
    badge: "🛡️",
    trophyId: "trophy_champions",
    trophyName: "Silver Champions Chalice",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="chaliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#e0e0e0" />
          <stop offset="70%" stop-color="#a4b0be" />
          <stop offset="100%" stop-color="#57606f" />
        </linearGradient>
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffd700" />
          <stop offset="50%" stop-color="#fff275" />
          <stop offset="100%" stop-color="#d4a017" />
        </linearGradient>
      </defs>
      <!-- Base -->
      <polygon points="20,122 80,122 74,110 26,110" fill="#2f3542"/>
      <rect x="38" y="88" width="24" height="22" fill="url(#chaliceGrad)"/>
      <path d="M30,88 L70,88 L62,55 L38,55 Z" fill="url(#chaliceGrad)"/>
      <!-- Cup Bowl -->
      <path d="M22,30 Q50,75 78,30 Q50,22 22,30 Z" fill="url(#chaliceGrad)"/>
      <!-- Rim -->
      <ellipse cx="50" cy="28" rx="28" ry="6" fill="url(#goldRim)"/>
      <!-- Handles -->
      <path d="M22,34 C6,34 6,65 30,70" fill="none" stroke="url(#goldRim)" stroke-width="4" stroke-linecap="round"/>
      <path d="M78,34 C94,34 94,65 70,70" fill="none" stroke="url(#goldRim)" stroke-width="4" stroke-linecap="round"/>
      <!-- Emblem -->
      <circle cx="50" cy="46" r="7" fill="url(#goldRim)"/>
      <polygon points="50,41 52,45 56,45 53,48 54,52 50,49 46,52 47,48 44,45 48,45" fill="#2f3542"/>
    </svg>`,
    structure: "Group Stage (3 Matches) → Semi-Final → Final",
    totalTeams: 8,
    groupCount: 2,
    groupSize: 4,
    description: "Only the elite qualify. Short, fiercely contested group battles where one slip means elimination."
  },
  {
    id: "asia_cup",
    name: "Asia Cup",
    shortName: "Asia Cup",
    subtitle: "The Continental Rivalry",
    defaultFormat: "T20",
    allowedFormats: ["T20", "ODI"],
    badge: "🐅",
    trophyId: "trophy_asia_cup",
    trophyName: "Crown of the Subcontinent",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="asiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd32a" />
          <stop offset="60%" stop-color="#ff9f1a" />
          <stop offset="100%" stop-color="#eb3b5a" />
        </linearGradient>
      </defs>
      <rect x="25" y="112" width="50" height="12" rx="3" fill="#1e272e"/>
      <path d="M35,112 L65,112 L58,80 L42,80 Z" fill="url(#asiaGrad)"/>
      <path d="M20,35 Q50,90 80,35 L70,30 Q50,70 30,30 Z" fill="url(#asiaGrad)"/>
      <circle cx="50" cy="30" r="16" fill="#ffffff" opacity="0.15"/>
      <polygon points="50,18 53,26 62,26 55,31 57,39 50,34 43,39 45,31 38,26 47,26" fill="#ffffff"/>
      <!-- Arch Horns -->
      <path d="M20,35 C10,15 30,10 40,25" fill="none" stroke="#ffd32a" stroke-width="3" stroke-linecap="round"/>
      <path d="M80,35 C90,15 70,10 60,25" fill="none" stroke="#ffd32a" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    structure: "Group Stage → Super 4 Round Robin → Grand Final",
    totalTeams: 6,
    groupCount: 2,
    groupSize: 3,
    description: "Historic rivalries ignite! Choose T20 or ODI format and conquer Pakistan, India, Sri Lanka, Bangladesh, and Afghanistan."
  },
  {
    id: "tri_series",
    name: "Tri-Nation Series",
    shortName: "Tri-Series",
    subtitle: "Triple Threat Championship",
    defaultFormat: "ODI",
    allowedFormats: ["ODI", "T20"],
    badge: "🔺",
    trophyId: "trophy_tri_series",
    trophyName: "Triangular Shield of Supremacy",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00d2d3" />
          <stop offset="50%" stop-color="#01a3a4" />
          <stop offset="100%" stop-color="#222f3e" />
        </linearGradient>
      </defs>
      <rect x="25" y="115" width="50" height="10" rx="3" fill="#222f3e"/>
      <path d="M42,115 L58,115 L54,85 L46,85 Z" fill="#c8d6e5"/>
      <!-- Triangle Shield -->
      <polygon points="50,15 85,75 15,75" fill="url(#shieldGrad)" stroke="#00d2d3" stroke-width="2"/>
      <polygon points="50,26 75,70 25,70" fill="#ffffff" opacity="0.15"/>
      <circle cx="50" cy="52" r="10" fill="#ffd32a"/>
      <polygon points="50,44 52,49 57,49 53,52 55,57 50,54 45,57 47,52 43,49 48,49" fill="#222f3e"/>
    </svg>`,
    structure: "League Stage (4 Matches) → Grand Final",
    totalTeams: 3,
    groupCount: 1,
    groupSize: 3,
    description: "Three heavyweights clash in an intense double round-robin league. Top 2 teams contest the final."
  },
  {
    id: "bilateral_series",
    name: "Bilateral Series",
    shortName: "Bilateral Cup",
    subtitle: "Head-to-Head Showdown",
    defaultFormat: "T20",
    allowedFormats: ["T20", "ODI", "TEST"],
    badge: "⚔️",
    trophyId: "trophy_bilateral",
    trophyName: "Sovereign Series Cup",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="silverGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd700" />
          <stop offset="50%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#d4af37" />
        </linearGradient>
      </defs>
      <rect x="28" y="112" width="44" height="12" rx="2" fill="#1e272e"/>
      <path d="M40,112 L60,112 L56,70 L44,70 Z" fill="url(#silverGold)"/>
      <path d="M30,35 Q50,75 70,35 L64,26 Q50,60 36,26 Z" fill="url(#silverGold)"/>
      <!-- Crossed Bats -->
      <line x1="32" y1="20" x2="68" y2="56" stroke="#e17055" stroke-width="3" stroke-linecap="round"/>
      <line x1="68" y1="20" x2="32" y2="56" stroke="#e17055" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="38" r="5" fill="#d63031"/>
    </svg>`,
    structure: "Best of 3 / 5 Matches against Chosen Rival",
    totalTeams: 2,
    groupCount: 1,
    groupSize: 2,
    description: "Choose your adversary, select any match format (T20, ODI, or Test), and settle the rivalry in a direct series."
  },
  {
    id: "test_championship",
    name: "Test Championship",
    shortName: "Test Mace",
    subtitle: "The Ultimate Test of Character",
    defaultFormat: "TEST",
    allowedFormats: ["TEST"],
    badge: "👑",
    trophyId: "trophy_test_mace",
    trophyName: "The Legendary Test Mace",
    trophySvg: `<svg viewBox="0 0 100 130" class="trophy-svg">
      <defs>
        <linearGradient id="maceGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="30%" stop-color="#ffd700" />
          <stop offset="80%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#8b6508" />
        </linearGradient>
      </defs>
      <rect x="30" y="118" width="40" height="8" rx="2" fill="#1e272e"/>
      <!-- Shaft -->
      <path d="M46,118 L54,118 L53,42 L47,42 Z" fill="url(#maceGold)"/>
      <!-- Shaft Ribs -->
      <ellipse cx="50" cy="100" rx="5" ry="2" fill="#ffd700"/>
      <ellipse cx="50" cy="80" rx="5" ry="2" fill="#ffd700"/>
      <ellipse cx="50" cy="60" rx="5" ry="2" fill="#ffd700"/>
      <!-- Mace Head / Globe -->
      <circle cx="50" cy="26" r="18" fill="url(#maceGold)"/>
      <circle cx="50" cy="26" r="14" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <!-- Crown / Flutes -->
      <path d="M35,20 Q50,8 65,20 Q50,14 35,20 Z" fill="#fff" opacity="0.8"/>
      <polygon points="50,4 53,10 47,10" fill="#ffd700"/>
    </svg>`,
    structure: "League Stage (3 Tests) → Final Test Showdown",
    totalTeams: 4,
    groupCount: 1,
    groupSize: 4,
    description: "Condensed arcade Test cricket with multi-session tactics, defensive timing rewards, and the historic Test Mace."
  }
];

window.TOURNAMENTS_CONFIG = TOURNAMENTS_CONFIG;

window.TournamentEngine = {
  getTournaments: () => TOURNAMENTS_CONFIG,
  getById: (id) => TOURNAMENTS_CONFIG.find(t => t.id === id) || TOURNAMENTS_CONFIG[0],

  /**
   * Create a new active tournament session
   */
  createTournamentState: (tournamentId, playerTeamId, selectedFormat = null, opponentId = null) => {
    const config = TOURNAMENTS_CONFIG.find(t => t.id === tournamentId) || TOURNAMENTS_CONFIG[0];
    const format = selectedFormat || config.defaultFormat;
    const allTeams = window.TeamsManager.getAll();
    
    // Select participants
    let participants = [];
    if (config.id === "bilateral_series") {
      const opp = opponentId ? window.TeamsManager.getById(opponentId) : allTeams.find(t => t.id !== playerTeamId) || allTeams[1];
      participants = [window.TeamsManager.getById(playerTeamId), opp];
    } else if (config.id === "asia_cup") {
      const asianIds = ["PAK", "IND", "SL", "BAN", "AFG"];
      let pool = allTeams.filter(t => asianIds.includes(t.id));
      if (!pool.some(t => t.id === playerTeamId)) {
        pool.unshift(window.TeamsManager.getById(playerTeamId));
      }
      participants = pool.slice(0, 6);
    } else if (config.id === "tri_series") {
      const remaining = allTeams.filter(t => t.id !== playerTeamId).sort(() => 0.5 - Math.random());
      participants = [window.TeamsManager.getById(playerTeamId), remaining[0], remaining[1]];
    } else {
      // General tournament (World Cup, T20 WC, Champions Trophy, Test Championship)
      const otherTeams = allTeams.filter(t => t.id !== playerTeamId).sort((a, b) => b.ratings.overall - a.ratings.overall);
      participants = [window.TeamsManager.getById(playerTeamId), ...otherTeams.slice(0, config.totalTeams - 1)];
    }

    // Generate Groups
    const groups = {};
    if (config.groupCount === 2) {
      groups["A"] = [participants[0]]; // Player in Group A
      groups["B"] = [];
      for (let i = 1; i < participants.length; i++) {
        if (i % 2 === 1 && groups["B"].length < config.groupSize) {
          groups["B"].push(participants[i]);
        } else if (groups["A"].length < config.groupSize) {
          groups["A"].push(participants[i]);
        } else {
          groups["B"].push(participants[i]);
        }
      }
    } else {
      groups["A"] = [...participants];
    }

    // Generate Initial Points Tables
    const standings = {};
    Object.keys(groups).forEach(gKey => {
      standings[gKey] = groups[gKey].map(team => ({
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        nrr: 0.00
      }));
    });

    // Generate Match Fixtures
    const matches = [];
    let matchCounter = 1;

    if (config.id === "bilateral_series") {
      // 3-Match series
      for (let m = 1; m <= 3; m++) {
        matches.push({
          id: `match_${matchCounter++}`,
          matchNumber: m,
          stage: "bilateral",
          stageName: `Match ${m} of 3`,
          teamAId: participants[0].id,
          teamBId: participants[1].id,
          format: format,
          played: false,
          result: null
        });
      }
    } else {
      // Group Stage matches
      Object.keys(groups).forEach(gKey => {
        const teamList = groups[gKey];
        for (let i = 0; i < teamList.length; i++) {
          for (let j = i + 1; j < teamList.length; j++) {
            matches.push({
              id: `match_${matchCounter++}`,
              matchNumber: matches.length + 1,
              stage: "group",
              stageName: `Group ${gKey}`,
              groupKey: gKey,
              teamAId: teamList[i].id,
              teamBId: teamList[j].id,
              format: format,
              played: false,
              result: null
            });
          }
        }
      });
      // Sort matches so player matches are spaced evenly
      matches.sort((a, b) => {
        const aHasPlayer = a.teamAId === playerTeamId || a.teamBId === playerTeamId;
        const bHasPlayer = b.teamAId === playerTeamId || b.teamBId === playerTeamId;
        if (aHasPlayer && !bHasPlayer) return -1;
        if (!aHasPlayer && bHasPlayer) return 1;
        return 0;
      });
      // Re-index match numbers
      matches.forEach((m, idx) => m.matchNumber = idx + 1);
    }

    return {
      tournamentId: config.id,
      tournamentName: config.name,
      format: format,
      playerTeamId: playerTeamId,
      groups: groups,
      standings: standings,
      matches: matches,
      currentMatchIndex: 0,
      stage: config.id === "bilateral_series" ? "bilateral" : "group",
      knockouts: {
        semis: [],
        final: null
      },
      isCompleted: false,
      winnerTeamId: null,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Simulate an AI vs AI match realistically based on team stats and format
   */
  simulateMatch: (match, formatId = "ODI") => {
    const teamA = window.TeamsManager.getById(match.teamAId);
    const teamB = window.TeamsManager.getById(match.teamBId);
    const format = window.CRICKET_CONFIG.formats[formatId] || window.CRICKET_CONFIG.formats.ODI;

    // Relative strength factor
    const ratingA = teamA.ratings.batting * 0.5 + teamA.ratings.bowling * 0.5;
    const ratingB = teamB.ratings.batting * 0.5 + teamB.ratings.bowling * 0.5;
    const winProbA = 0.5 + (ratingA - ratingB) * 0.015;

    const teamAWins = Math.random() < winProbA;
    
    // Generate realistic scores based on format
    let baseScore = formatId === "T20" ? 165 : formatId === "ODI" ? 275 : 320;
    let scoreVariance = formatId === "T20" ? 35 : formatId === "ODI" ? 50 : 70;
    
    let score1 = Math.round(baseScore + (Math.random() * scoreVariance * 2 - scoreVariance) + (ratingA - 80) * 1.5);
    let wkts1 = Math.min(format.wicketsPerInnings, Math.floor(Math.random() * 5 + 3));
    let overs1 = format.maxOvers;

    let score2, wkts2, overs2;
    if (teamAWins) {
      score2 = score1 - Math.floor(Math.random() * 25 + 4);
      wkts2 = Math.min(format.wicketsPerInnings, Math.floor(Math.random() * 4 + 6));
      overs2 = format.maxOvers;
    } else {
      score2 = score1 + Math.floor(Math.random() * 10 + 2);
      wkts2 = Math.min(format.wicketsPerInnings - 1, Math.floor(Math.random() * 5 + 2));
      overs2 = parseFloat((format.maxOvers - Math.random() * 2).toFixed(1));
    }

    const winnerId = teamAWins ? teamA.id : teamB.id;
    const winningMargin = teamAWins ? `${score1 - score2} runs` : `${format.wicketsPerInnings - wkts2} wickets`;

    match.played = true;
    match.result = {
      winnerId: winnerId,
      winnerName: teamAWins ? teamA.name : teamB.name,
      marginText: winningMargin,
      teamAScore: { runs: score1, wickets: wkts1, overs: overs1 },
      teamBScore: { runs: score2, wickets: wkts2, overs: overs2 },
      simulated: true
    };

    return match.result;
  },

  /**
   * Update points table with match outcome
   */
  updateStandingsWithMatch: (standings, groupKey, match) => {
    const groupTable = standings[groupKey];
    if (!groupTable) return;

    const rowA = groupTable.find(r => r.teamId === match.teamAId);
    const rowB = groupTable.find(r => r.teamId === match.teamBId);
    if (!rowA || !rowB || !match.result) return;

    rowA.played += 1;
    rowB.played += 1;

    const scoreA = match.result.teamAScore;
    const scoreB = match.result.teamBScore;

    rowA.runsScored += scoreA.runs;
    rowA.oversFaced += scoreA.overs;
    rowA.runsConceded += scoreB.runs;
    rowA.oversBowled += scoreB.overs;

    rowB.runsScored += scoreB.runs;
    rowB.oversFaced += scoreB.overs;
    rowB.runsConceded += scoreB.runs;
    rowB.oversBowled += scoreA.overs;

    if (match.result.winnerId === rowA.teamId) {
      rowA.won += 1;
      rowA.points += 2;
      rowB.lost += 1;
    } else if (match.result.winnerId === rowB.teamId) {
      rowB.won += 1;
      rowB.points += 2;
      rowA.lost += 1;
    } else {
      rowA.tied += 1;
      rowB.tied += 1;
      rowA.points += 1;
      rowB.points += 1;
    }

    // Calculate Net Run Rate (NRR)
    [rowA, rowB].forEach(r => {
      const battingRate = r.oversFaced > 0 ? (r.runsScored / r.oversFaced) : 0;
      const bowlingRate = r.oversBowled > 0 ? (r.runsConceded / r.oversBowled) : 0;
      r.nrr = parseFloat((battingRate - bowlingRate).toFixed(3));
    });

    // Sort group table: Points desc, NRR desc
    groupTable.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.nrr - a.nrr;
    });
  },

  /**
   * Advance tournament stage when all matches in current stage are completed
   */
  checkStageProgression: (tournamentState) => {
    const config = window.TournamentEngine.getById(tournamentState.tournamentId);

    // If Bilateral Series
    if (config.id === "bilateral_series") {
      const playedCount = tournamentState.matches.filter(m => m.played).length;
      const pTeamWins = tournamentState.matches.filter(m => m.played && m.result.winnerId === tournamentState.playerTeamId).length;
      const oppWins = playedCount - pTeamWins;

      if (playedCount >= 3 || pTeamWins >= 2 || oppWins >= 2) {
        tournamentState.isCompleted = true;
        tournamentState.winnerTeamId = pTeamWins > oppWins ? tournamentState.playerTeamId : (tournamentState.matches[0].teamAId === tournamentState.playerTeamId ? tournamentState.matches[0].teamBId : tournamentState.matches[0].teamAId);
        return { status: "COMPLETED", winnerId: tournamentState.winnerTeamId };
      }
      return { status: "IN_PROGRESS" };
    }

    // If Group Stage
    if (tournamentState.stage === "group") {
      const allGroupMatchesPlayed = tournamentState.matches.every(m => m.played);
      if (!allGroupMatchesPlayed) return { status: "GROUP_STAGE_CONTINUING" };

      // Determine qualifiers
      if (config.id === "tri_series") {
        // Top 2 go directly to final
        const top2 = tournamentState.standings["A"].slice(0, 2);
        const finalMatch = {
          id: `match_final`,
          matchNumber: tournamentState.matches.length + 1,
          stage: "final",
          stageName: "Grand Final",
          teamAId: top2[0].teamId,
          teamBId: top2[1].teamId,
          format: tournamentState.format,
          played: false,
          result: null
        };
        tournamentState.matches.push(finalMatch);
        tournamentState.knockouts.final = finalMatch;
        tournamentState.stage = "final";
        return { status: "QUALIFIED_FOR_FINAL", finalists: top2 };
      } else if (config.groupCount === 2) {
        // Top 2 from Group A and Top 2 from Group B advance to Semis
        const groupATop2 = tournamentState.standings["A"].slice(0, 2);
        const groupBTop2 = tournamentState.standings["B"].slice(0, 2);

        // Check if player qualified
        const playerInA = tournamentState.groups["A"].some(t => t.id === tournamentState.playerTeamId);
        const playerQualified = playerInA ? groupATop2.some(t => t.teamId === tournamentState.playerTeamId) : groupBTop2.some(t => t.teamId === tournamentState.playerTeamId);

        const semi1 = {
          id: `match_semi_1`,
          matchNumber: tournamentState.matches.length + 1,
          stage: "semi",
          stageName: "Semi-Final 1",
          teamAId: groupATop2[0].teamId, // 1st of A
          teamBId: groupBTop2[1].teamId, // 2nd of B
          format: tournamentState.format,
          played: false,
          result: null
        };
        const semi2 = {
          id: `match_semi_2`,
          matchNumber: tournamentState.matches.length + 2,
          stage: "semi",
          stageName: "Semi-Final 2",
          teamAId: groupBTop2[0].teamId, // 1st of B
          teamBId: groupATop2[1].teamId, // 2nd of A
          format: tournamentState.format,
          played: false,
          result: null
        };

        tournamentState.matches.push(semi1, semi2);
        tournamentState.knockouts.semis = [semi1, semi2];
        tournamentState.stage = "semi";

        return {
          status: playerQualified ? "QUALIFIED_FOR_SEMIS" : "ELIMINATED_GROUP",
          playerQualified
        };
      } else {
        // Single group (e.g. Test Championship / 4 teams)
        const top2 = tournamentState.standings["A"].slice(0, 2);
        const finalMatch = {
          id: `match_final`,
          matchNumber: tournamentState.matches.length + 1,
          stage: "final",
          stageName: "Grand Final",
          teamAId: top2[0].teamId,
          teamBId: top2[1].teamId,
          format: tournamentState.format,
          played: false,
          result: null
        };
        tournamentState.matches.push(finalMatch);
        tournamentState.knockouts.final = finalMatch;
        tournamentState.stage = "final";
        const playerQualified = top2.some(t => t.teamId === tournamentState.playerTeamId);
        return { status: playerQualified ? "QUALIFIED_FOR_FINAL" : "ELIMINATED_GROUP", playerQualified };
      }
    }

    // If Semi-Finals
    if (tournamentState.stage === "semi") {
      const semis = tournamentState.knockouts.semis;
      if (semis.every(s => s.played)) {
        const winner1 = semis[0].result.winnerId;
        const winner2 = semis[1].result.winnerId;

        const finalMatch = {
          id: `match_final`,
          matchNumber: tournamentState.matches.length + 1,
          stage: "final",
          stageName: "The Grand Final",
          teamAId: winner1,
          teamBId: winner2,
          format: tournamentState.format,
          played: false,
          result: null
        };
        tournamentState.matches.push(finalMatch);
        tournamentState.knockouts.final = finalMatch;
        tournamentState.stage = "final";

        const playerQualified = winner1 === tournamentState.playerTeamId || winner2 === tournamentState.playerTeamId;
        return { status: playerQualified ? "QUALIFIED_FOR_FINAL" : "ELIMINATED_SEMI", playerQualified };
      }
      return { status: "SEMIS_IN_PROGRESS" };
    }

    // If Final
    if (tournamentState.stage === "final") {
      const finalMatch = tournamentState.knockouts.final;
      if (finalMatch && finalMatch.played) {
        tournamentState.isCompleted = true;
        tournamentState.winnerTeamId = finalMatch.result.winnerId;
        return {
          status: "COMPLETED",
          winnerId: tournamentState.winnerTeamId,
          isPlayerChampion: tournamentState.winnerTeamId === tournamentState.playerTeamId
        };
      }
      return { status: "FINAL_IN_PROGRESS" };
    }

    return { status: "UNKNOWN" };
  }
};
