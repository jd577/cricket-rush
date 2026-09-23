/**
 * CRICKET RUSH — UI Management & Screen Router
 * Manages 15 game screens, dialogs, transitions, scoreboard HUD, and tournament views.
 * Built by Jawad Akhter | Software Quality Assurance Engineer
 */

class UIManager {
  constructor() {
    this.currentScreen = "screen-main-menu";
    this.activeTournament = null;
    this.gameplayInstance = null;
    this.selectedTeamId = "PAK";
    this.selectedTournamentId = "world_cup";
    this.selectedFormat = "ODI";
    this.selectedBilateralOpponentId = "IND";
  }

  init() {
    this.bindGlobalEvents();
    this.showScreen("screen-main-menu");
    this.updateCareerPill();
  }

  /**
   * Screen Navigation Router
   */
  showScreen(screenId) {
    if (window.cricketSound) window.cricketSound.playClick();

    // Hide all screens
    document.querySelectorAll(".game-screen").forEach(el => {
      el.classList.remove("active");
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      this.currentScreen = screenId;
      window.scrollTo(0, 0);

      // Trigger screen-specific render
      if (screenId === "screen-main-menu") this.renderMainMenu();
      if (screenId === "screen-team-select") this.renderTeamSelect();
      if (screenId === "screen-tournament-select") this.renderTournamentSelect();
      if (screenId === "screen-tournament-dashboard") this.renderTournamentDashboard();
      if (screenId === "screen-points-table") this.renderPointsTableView();
      if (screenId === "screen-knockout-bracket") this.renderKnockoutBracketView();
      if (screenId === "screen-trophy-cabinet") this.renderTrophyCabinet();
      if (screenId === "screen-career-stats") this.renderCareerStats();
      if (screenId === "screen-settings") this.renderSettings();
      if (screenId === "screen-how-to-play") this.renderHowToPlay();
    }
  }

  /**
   * Global Event Listeners
   */
  bindGlobalEvents() {
    // Navigation data-screen buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-screen]");
      if (btn) {
        const targetScreen = btn.getAttribute("data-screen");
        this.showScreen(targetScreen);
      }
    });

    // Sound toggle buttons
    const soundToggle = document.getElementById("global-sound-toggle");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        const settings = window.StorageManager.loadSettings();
        settings.soundEnabled = !settings.soundEnabled;
        window.StorageManager.saveSettings(settings);
        this.updateSoundButtonUI();
      });
    }
  }

  updateSoundButtonUI() {
    const settings = window.StorageManager.loadSettings();
    const soundToggle = document.getElementById("global-sound-toggle");
    if (soundToggle) {
      soundToggle.innerHTML = settings.soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
      soundToggle.className = settings.soundEnabled ? "sound-badge sound-on" : "sound-badge sound-off";
    }
  }

  /**
   * Update Main Menu Career Level Pill
   */
  updateCareerPill() {
    const save = window.StorageManager.loadSave();
    const pill = document.getElementById("career-level-pill");
    if (pill) {
      pill.innerHTML = `
        <span class="level-badge">LVL ${save.career.level}</span>
        <span class="level-title">${save.career.title}</span>
        <span class="level-xp">${save.career.xp} XP</span>
      `;
    }
  }

  // ==========================================
  // 1. MAIN MENU SCREEN
  // ==========================================
  renderMainMenu() {
    this.updateCareerPill();
    this.updateSoundButtonUI();

    const hasActiveTourney = window.StorageManager.hasActiveTournament();
    const continueBtn = document.getElementById("btn-continue-career");
    if (continueBtn) {
      if (hasActiveTourney) {
        continueBtn.removeAttribute("disabled");
        continueBtn.classList.remove("disabled-btn");
        continueBtn.innerHTML = `<span>▶ CONTINUE CAREER</span> <small class="btn-subtext">Resume In-Progress Tournament</small>`;
      } else {
        continueBtn.setAttribute("disabled", "true");
        continueBtn.classList.add("disabled-btn");
        continueBtn.innerHTML = `<span>▶ CONTINUE CAREER</span> <small class="btn-subtext">No Active Tournament</small>`;
      }
    }
  }

  // ==========================================
  // 2. TEAM SELECTION SCREEN
  // ==========================================
  renderTeamSelect() {
    const container = document.getElementById("teams-grid-container");
    if (!container) return;

    const teams = window.TeamsManager.getAll();
    const save = window.StorageManager.loadSave();
    if (!this.selectedTeamId) this.selectedTeamId = save.career.selectedTeamId || "PAK";

    container.innerHTML = teams.map(team => {
      const isSelected = team.id === this.selectedTeamId;
      return `
        <div class="team-card ${isSelected ? 'selected' : ''}" data-team-id="${team.id}" style="--team-color: ${team.colors.primary};">
          <div class="team-flag-box">${team.flagSvg}</div>
          <div class="team-info">
            <div class="team-header-row">
              <h3 class="team-name">${team.name}</h3>
              <span class="team-code-badge">${team.shortCode}</span>
            </div>
            <p class="team-slogan">${team.slogan}</p>
            <div class="team-ratings-list">
              <div class="rating-item"><span>BAT</span> <strong>${team.ratings.batting}</strong></div>
              <div class="rating-item"><span>BOWL</span> <strong>${team.ratings.bowling}</strong></div>
              <div class="rating-item"><span>FIELD</span> <strong>${team.ratings.fielding}</strong></div>
              <div class="rating-item"><span>RUN</span> <strong>${team.ratings.running}</strong></div>
              <div class="rating-item overall"><span>OVR</span> <strong>${team.ratings.overall}</strong></div>
            </div>
          </div>
          <div class="team-card-select-overlay">
            <span class="select-check">${isSelected ? '✓ SELECTED' : 'CHOOSE TEAM'}</span>
          </div>
        </div>
      `;
    }).join("");

    // Bind card clicks
    container.querySelectorAll(".team-card").forEach(card => {
      card.addEventListener("click", () => {
        const teamId = card.getAttribute("data-team-id");
        this.selectedTeamId = teamId;
        this.renderTeamSelect();
        if (window.cricketSound) window.cricketSound.playClick();
      });
    });

    // Update banner & Continue button
    const selTeam = window.TeamsManager.getById(this.selectedTeamId);
    const banner = document.getElementById("selected-team-banner");
    if (banner && selTeam) {
      banner.innerHTML = `
        <div class="sel-team-flag">${selTeam.flagSvg}</div>
        <div class="sel-team-details">
          <span class="sel-label">SELECTED TEAM:</span>
          <span class="sel-name">${selTeam.name.toUpperCase()}</span>
        </div>
        <button id="btn-confirm-team" class="primary-action-btn pulse-glow">CONTINUE TO TOURNAMENT →</button>
      `;

      const confirmBtn = document.getElementById("btn-confirm-team");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          // Save selected team to career
          const saveState = window.StorageManager.loadSave();
          saveState.career.selectedTeamId = this.selectedTeamId;
          window.StorageManager.save(saveState);
          this.showScreen("screen-tournament-select");
        });
      }
    }
  }

  // ==========================================
  // 3. TOURNAMENT SELECTION SCREEN
  // ==========================================
  renderTournamentSelect() {
    const container = document.getElementById("tournaments-grid-container");
    if (!container) return;

    const tournaments = window.TournamentEngine.getTournaments();
    const save = window.StorageManager.loadSave();

    container.innerHTML = tournaments.map(tourney => {
      const isSelected = tourney.id === this.selectedTournamentId;
      const isWon = save.trophyCabinet.some(t => t.tournamentId === tourney.id);
      const defaultFormat = tourney.defaultFormat;
      const formatObj = window.CRICKET_CONFIG.formats[defaultFormat];

      return `
        <div class="tournament-card ${isSelected ? 'selected' : ''}" data-tourney-id="${tourney.id}">
          <div class="tourney-header">
            <div class="tourney-trophy-preview">${tourney.trophySvg}</div>
            <div class="tourney-title-box">
              <div class="tourney-badges">
                <span class="format-badge" style="background:${formatObj ? formatObj.badgeColor : '#1e90ff'}">${defaultFormat}</span>
                ${isWon ? '<span class="trophy-won-badge">🏆 WON</span>' : ''}
              </div>
              <h3 class="tourney-name">${tourney.name}</h3>
              <span class="tourney-subtitle">${tourney.subtitle}</span>
            </div>
          </div>
          <p class="tourney-desc">${tourney.description}</p>
          <div class="tourney-structure-box">
            <span class="structure-label">STRUCTURE:</span>
            <span class="structure-val">${tourney.structure}</span>
          </div>
          ${tourney.allowedFormats.length > 1 ? `
            <div class="tourney-format-selector" data-tourney-target="${tourney.id}">
              <label>Select Format:</label>
              <div class="format-chips">
                ${tourney.allowedFormats.map(fmt => `
                  <button class="format-chip ${fmt === this.selectedFormat ? 'active' : ''}" data-fmt="${fmt}">${fmt}</button>
                `).join("")}
              </div>
            </div>
          ` : ''}
          ${tourney.id === 'bilateral_series' ? `
            <div class="bilateral-opponent-selector">
              <label>Choose Opponent:</label>
              <select id="bilateral-opponent-select" class="game-select">
                ${window.TeamsManager.getAll().filter(t => t.id !== this.selectedTeamId).map(t => `
                  <option value="${t.id}" ${t.id === this.selectedBilateralOpponentId ? 'selected' : ''}>${t.name} (${t.ratings.overall} OVR)</option>
                `).join("")}
              </select>
            </div>
          ` : ''}
          <button class="btn-start-tourney primary-action-btn" data-start-tourney="${tourney.id}">SELECT & ENTER ❯</button>
        </div>
      `;
    }).join("");

    // Bind selection & start events
    container.querySelectorAll(".tournament-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".format-chip") || e.target.closest(".game-select") || e.target.closest(".btn-start-tourney")) return;
        const id = card.getAttribute("data-tourney-id");
        this.selectedTournamentId = id;
        this.renderTournamentSelect();
      });
    });

    // Format Chips
    container.querySelectorAll(".format-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectedFormat = chip.getAttribute("data-fmt");
        this.renderTournamentSelect();
      });
    });

    // Bilateral Select
    const bilatSelect = document.getElementById("bilateral-opponent-select");
    if (bilatSelect) {
      bilatSelect.addEventListener("change", (e) => {
        this.selectedBilateralOpponentId = e.target.value;
      });
    }

    // Start Tournament buttons
    container.querySelectorAll("[data-start-tourney]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tourneyId = btn.getAttribute("data-start-tourney");
        this.startNewTournament(tourneyId);
      });
    });
  }

  startNewTournament(tourneyId) {
    const tourneyConfig = window.TournamentEngine.getById(tourneyId);
    let format = this.selectedFormat;
    if (!tourneyConfig.allowedFormats.includes(format)) {
      format = tourneyConfig.defaultFormat;
    }

    const tournamentState = window.TournamentEngine.createTournamentState(
      tourneyId,
      this.selectedTeamId,
      format,
      tourneyId === "bilateral_series" ? this.selectedBilateralOpponentId : null
    );

    window.StorageManager.saveActiveTournament(tournamentState);
    this.activeTournament = tournamentState;
    this.showScreen("screen-tournament-dashboard");
  }

  // ==========================================
  // 5. TOURNAMENT DASHBOARD SCREEN
  // ==========================================
  renderTournamentDashboard() {
    const save = window.StorageManager.loadSave();
    const tourney = save.activeTournament;
    if (!tourney) {
      this.showScreen("screen-tournament-select");
      return;
    }
    this.activeTournament = tourney;

    const pTeam = window.TeamsManager.getById(tourney.playerTeamId);
    const tourneyConfig = window.TournamentEngine.getById(tourney.tournamentId);
    const formatObj = window.CRICKET_CONFIG.formats[tourney.format] || window.CRICKET_CONFIG.formats.ODI;

    // 1. Dashboard Header Banner
    const headerEl = document.getElementById("dashboard-header-card");
    if (headerEl) {
      headerEl.innerHTML = `
        <div class="dash-tourney-left">
          <div class="dash-trophy-icon">${tourneyConfig.trophySvg}</div>
          <div class="dash-tourney-titles">
            <div class="dash-badge-row">
              <span class="format-badge" style="background:${formatObj.badgeColor}">${tourney.format}</span>
              <span class="stage-badge">${tourney.stage.toUpperCase()} STAGE</span>
            </div>
            <h2>${tourney.tournamentName}</h2>
          </div>
        </div>
        <div class="dash-player-team-pill">
          <div class="pill-flag">${pTeam.flagSvg}</div>
          <div class="pill-info">
            <span class="pill-team-name">${pTeam.name}</span>
            <span class="pill-team-ovr">OVR ${pTeam.ratings.overall}</span>
          </div>
        </div>
      `;
    }

    // 2. Standing Summary Stats Row
    const statsRow = document.getElementById("dashboard-stats-row");
    if (statsRow) {
      let played = 0, won = 0, lost = 0, points = 0, nrr = "+0.00";
      
      // Calculate from standings
      Object.keys(tourney.standings).forEach(gKey => {
        const row = tourney.standings[gKey].find(r => r.teamId === tourney.playerTeamId);
        if (row) {
          played = row.played;
          won = row.won;
          lost = row.lost;
          points = row.points;
          nrr = (row.nrr >= 0 ? "+" : "") + row.nrr.toFixed(2);
        }
      });

      const remainingMatches = tourney.matches.filter(m => !m.played && (m.teamAId === tourney.playerTeamId || m.teamBId === tourney.playerTeamId)).length;

      statsRow.innerHTML = `
        <div class="dash-stat-box"><span class="stat-label">MATCHES PLAYED</span><span class="stat-val">${played}</span></div>
        <div class="dash-stat-box"><span class="stat-label">WINS</span><span class="stat-val green-text">${won}</span></div>
        <div class="dash-stat-box"><span class="stat-label">LOSSES</span><span class="stat-val red-text">${lost}</span></div>
        <div class="dash-stat-box"><span class="stat-label">POINTS</span><span class="stat-val gold-text">${points}</span></div>
        <div class="dash-stat-box"><span class="stat-label">NET RUN RATE</span><span class="stat-val">${nrr}</span></div>
        <div class="dash-stat-box"><span class="stat-label">REMAINING</span><span class="stat-val">${remainingMatches}</span></div>
      `;
    }

    // 3. Upcoming Match Spotlight
    const nextMatchCard = document.getElementById("dashboard-next-match-card");
    const nextMatch = tourney.matches.find(m => !m.played && (m.teamAId === tourney.playerTeamId || m.teamBId === tourney.playerTeamId));

    if (nextMatchCard) {
      if (nextMatch) {
        const oppId = nextMatch.teamAId === tourney.playerTeamId ? nextMatch.teamBId : nextMatch.teamAId;
        const oppTeam = window.TeamsManager.getById(oppId);

        nextMatchCard.innerHTML = `
          <div class="next-match-header">
            <span class="match-stage-pill">${nextMatch.stageName} • MATCH ${nextMatch.matchNumber}</span>
            <span class="match-format-pill">${tourney.format} FORMAT</span>
          </div>
          <div class="next-match-vs-arena">
            <div class="match-team-col">
              <div class="match-flag">${pTeam.flagSvg}</div>
              <h4>${pTeam.name}</h4>
              <span class="rating-tag">OVR ${pTeam.ratings.overall}</span>
            </div>
            <div class="match-vs-middle">
              <span class="vs-glow">VS</span>
            </div>
            <div class="match-team-col">
              <div class="match-flag">${oppTeam.flagSvg}</div>
              <h4>${oppTeam.name}</h4>
              <span class="rating-tag">OVR ${oppTeam.ratings.overall}</span>
            </div>
          </div>
          <button id="btn-play-match-now" class="primary-action-btn mega-btn pulse-glow">🏏 PLAY MATCH NOW →</button>
        `;

        const playBtn = document.getElementById("btn-play-match-now");
        if (playBtn) {
          playBtn.addEventListener("click", () => {
            this.showMatchPreview(nextMatch, pTeam, oppTeam);
          });
        }
      } else {
        // All player matches in current stage completed
        const prog = window.TournamentEngine.checkStageProgression(tourney);
        window.StorageManager.saveActiveTournament(tourney);

        if (prog.status === "COMPLETED") {
          if (prog.isPlayerChampion || tourney.winnerTeamId === tourney.playerTeamId) {
            this.showTrophyCelebration(tourneyConfig, pTeam);
          } else {
            nextMatchCard.innerHTML = `
              <div class="tourney-over-box">
                <h3>Tournament Concluded</h3>
                <p>Champion: <strong>${window.TeamsManager.getById(tourney.winnerTeamId).name}</strong></p>
                <button class="primary-action-btn" data-screen="screen-tournament-select">START NEW TOURNAMENT</button>
              </div>
            `;
          }
        } else if (prog.playerQualified) {
          this.renderTournamentDashboard(); // Re-render with new knockout stage fixtures!
        } else {
          nextMatchCard.innerHTML = `
            <div class="tourney-over-box">
              <h3>Knocked Out of Tournament</h3>
              <p>Your team did not qualify for the next stage. Better luck next time!</p>
              <button class="primary-action-btn" data-screen="screen-tournament-select">START NEW TOURNAMENT</button>
            </div>
          `;
        }
      }
    }

    // 4. Quick Schedule List
    const scheduleContainer = document.getElementById("dashboard-schedule-mini");
    if (scheduleContainer) {
      scheduleContainer.innerHTML = tourney.matches.map(m => {
        const teamA = window.TeamsManager.getById(m.teamAId);
        const teamB = window.TeamsManager.getById(m.teamBId);
        const isPlayerMatch = m.teamAId === tourney.playerTeamId || m.teamBId === tourney.playerTeamId;

        return `
          <div class="mini-fixture-item ${m.played ? 'played' : ''} ${isPlayerMatch ? 'player-fixture' : ''}">
            <div class="fix-num">M${m.matchNumber}</div>
            <div class="fix-teams">
              <span class="fix-team">${teamA.shortCode}</span>
              <span class="fix-vs">vs</span>
              <span class="fix-team">${teamB.shortCode}</span>
            </div>
            <div class="fix-status">
              ${m.played && m.result ? `<span class="res-tag">${m.result.winnerName} won</span>` : `<span class="pending-tag">Upcoming</span>`}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // ==========================================
  // 6. MATCH PREVIEW SCREEN
  // ==========================================
  showMatchPreview(match, playerTeam, opponentTeam) {
    this.showScreen("screen-match-preview");

    const container = document.getElementById("match-preview-container");
    if (!container) return;

    const pitches = [
      { name: "Green Pitch", condition: "Pace & Seam Bounce", desc: "Fast bowlers will find sharp carry and bounce." },
      { name: "Dry Turning Pitch", condition: "Spin & Drift", desc: "Spinners will grip the surface with sharp turn." },
      { name: "Hard Batting Deck", condition: "True Bounce & High Scoring", desc: "Batsman paradise! Ball comes nicely onto the bat." }
    ];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];

    container.innerHTML = `
      <div class="preview-card">
        <div class="preview-header">
          <span class="preview-stage">${match.stageName.toUpperCase()}</span>
          <h2>MATCH PREVIEW</h2>
        </div>

        <div class="preview-vs-row">
          <div class="pv-team-box">
            <div class="pv-flag">${playerTeam.flagSvg}</div>
            <h3>${playerTeam.name}</h3>
            <div class="pv-ratings">
              <span>BAT: <strong>${playerTeam.ratings.batting}</strong></span>
              <span>BOWL: <strong>${playerTeam.ratings.bowling}</strong></span>
            </div>
          </div>
          <div class="pv-vs-badge">VS</div>
          <div class="pv-team-box">
            <div class="pv-flag">${opponentTeam.flagSvg}</div>
            <h3>${opponentTeam.name}</h3>
            <div class="pv-ratings">
              <span>BAT: <strong>${opponentTeam.ratings.batting}</strong></span>
              <span>BOWL: <strong>${opponentTeam.ratings.bowling}</strong></span>
            </div>
          </div>
        </div>

        <div class="preview-pitch-box">
          <div class="pitch-badge">🏟️ PITCH REPORT</div>
          <h4>${pitch.name} — ${pitch.condition}</h4>
          <p>${pitch.desc}</p>
        </div>

        <div class="preview-toss-box">
          <div class="toss-icon">🪙</div>
          <div class="toss-text">
            <strong>Toss Result:</strong> ${playerTeam.name} won the toss and elected to BAT first!
          </div>
        </div>

        <div class="preview-actions">
          <button id="btn-start-gameplay" class="primary-action-btn mega-btn pulse-glow">START MATCH ❯</button>
        </div>
      </div>
    `;

    const startBtn = document.getElementById("btn-start-gameplay");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.launchGameplay(match, playerTeam, opponentTeam);
      });
    }
  }

  // ==========================================
  // 7. LAUNCH CRICKET GAMEPLAY ARENA
  // ==========================================
  launchGameplay(match, playerTeam, opponentTeam) {
    this.showScreen("screen-gameplay");

    // Initialize or Reset Gameplay Engine
    if (this.gameplayInstance) {
      this.gameplayInstance.destroy();
    }

    this.gameplayInstance = new CricketGameplay("cricket-game-canvas");
    this.gameplayInstance.startMatch({
      match: match,
      playerTeam: playerTeam,
      opponentTeam: opponentTeam,
      format: match.format,
      stage: match.stage,
      onMatchComplete: (result) => this.handleMatchFinished(result)
    });

    this.bindGameplayHUDControls();
    this.startScoreboardHUDUpdater();
  }

  bindGameplayHUDControls() {
    // Mobile On-Screen Action Buttons
    const hitBtn = document.getElementById("hud-btn-hit");
    const runBtn = document.getElementById("hud-btn-run");
    const diveBtn = document.getElementById("hud-btn-dive");

    if (hitBtn) {
      hitBtn.onclick = () => {
        if (this.gameplayInstance) this.gameplayInstance.triggerShot();
      };
    }
    if (runBtn) {
      runBtn.onclick = () => {
        if (this.gameplayInstance) this.gameplayInstance.boostRun();
      };
    }
    if (diveBtn) {
      diveBtn.onclick = () => {
        if (this.gameplayInstance) this.gameplayInstance.triggerDive();
      };
    }

    // Directional Shot Buttons
    document.querySelectorAll("[data-shot-dir]").forEach(btn => {
      btn.onclick = () => {
        const dir = btn.getAttribute("data-shot-dir");
        if (this.gameplayInstance) {
          this.gameplayInstance.triggerShot(dir);
        }
      };
    });
  }

  startScoreboardHUDUpdater() {
    if (this.hudInterval) clearInterval(this.hudInterval);

    this.hudInterval = setInterval(() => {
      if (!this.gameplayInstance || this.currentScreen !== "screen-gameplay") {
        clearInterval(this.hudInterval);
        return;
      }

      const gp = this.gameplayInstance;
      
      // Update HUD elements
      const scoreEl = document.getElementById("hud-score-display");
      const oversEl = document.getElementById("hud-overs-display");
      const targetEl = document.getElementById("hud-target-display");
      const batterEl = document.getElementById("hud-batter-display");
      const timelineEl = document.getElementById("hud-timeline-container");

      if (scoreEl) scoreEl.innerText = `${gp.playerTeam.shortCode} ${gp.currentScore}/${gp.currentWickets}`;
      if (oversEl) {
        const ballsInOver = gp.deliveriesBowled % 6;
        const completeOvers = Math.floor(gp.deliveriesBowled / 6);
        oversEl.innerText = `Overs: ${completeOvers}.${ballsInOver} / ${Math.ceil(gp.totalDeliveries / 6)}`;
      }
      if (targetEl) targetEl.innerText = `Target: ${gp.targetScore} (${Math.max(0, gp.targetScore - gp.currentScore)} needed)`;
      if (batterEl) batterEl.innerText = `${gp.batterStats.name}: ${gp.batterStats.runs} (${gp.batterStats.balls}) [4s: ${gp.batterStats.fours}, 6s: ${gp.batterStats.sixes}]`;

      if (timelineEl) {
        timelineEl.innerHTML = gp.overBallsHistory.slice(-8).map(b => `
          <span class="timeline-ball ${b.runs === 4 ? 'four' : b.runs === 6 ? 'six' : b.tag === 'W' ? 'wicket' : ''}">${b.tag}</span>
        `).join("");
      }
    }, 100);
  }

  // ==========================================
  // 8. MATCH FINISHED & RESULTS
  // ==========================================
  handleMatchFinished(result) {
    // Record match stats in career
    const runs = result.playerScore.runs;
    const balls = result.batterStats.balls;
    const fours = result.batterStats.fours;
    const sixes = result.batterStats.sixes;
    const isWon = result.isPlayerWin;

    window.StorageManager.recordMatchStats({
      runs,
      balls,
      fours,
      sixes,
      won: isWon,
      wicketsLost: result.playerScore.wickets
    });

    // Award XP
    let xpGain = runs * 10 + fours * 25 + sixes * 50;
    if (isWon) xpGain += 250;
    const xpResult = window.StorageManager.addXP(xpGain, "Match Performance");

    // Update Tournament Match Object
    const tourney = window.StorageManager.loadSave().activeTournament;
    if (tourney && result.match) {
      const matchInTourney = tourney.matches.find(m => m.id === result.match.id);
      if (matchInTourney) {
        matchInTourney.played = true;
        matchInTourney.result = {
          winnerId: result.winnerId,
          winnerName: result.winnerName,
          marginText: result.marginText,
          teamAScore: result.match.teamAId === result.playerTeam.id ? result.playerScore : result.opponentScore,
          teamBScore: result.match.teamBId === result.playerTeam.id ? result.playerScore : result.opponentScore,
          simulated: false
        };

        // If in group stage, update points table
        if (matchInTourney.stage === "group" && matchInTourney.groupKey) {
          window.TournamentEngine.updateStandingsWithMatch(tourney.standings, matchInTourney.groupKey, matchInTourney);
        }

        // Simulate any other AI matches scheduled in this stage
        const otherMatches = tourney.matches.filter(m => !m.played && m.stage === matchInTourney.stage && m.teamAId !== tourney.playerTeamId && m.teamBId !== tourney.playerTeamId);
        otherMatches.forEach(aiMatch => {
          window.TournamentEngine.simulateMatch(aiMatch, tourney.format);
          if (aiMatch.stage === "group" && aiMatch.groupKey) {
            window.TournamentEngine.updateStandingsWithMatch(tourney.standings, aiMatch.groupKey, aiMatch);
          }
        });

        // Check if stage progression triggered
        window.TournamentEngine.checkStageProgression(tourney);
        window.StorageManager.saveActiveTournament(tourney);
      }
    }

    // Show Match Result Screen
    setTimeout(() => {
      this.renderMatchResultScreen(result, xpResult, xpGain);
    }, 1200);
  }

  renderMatchResultScreen(result, xpResult, xpGain) {
    this.showScreen("screen-match-result");

    const container = document.getElementById("match-result-container");
    if (!container) return;

    container.innerHTML = `
      <div class="result-card ${result.isPlayerWin ? 'win-card' : 'loss-card'}">
        <div class="result-banner">
          <h2>${result.isPlayerWin ? '🎉 VICTORY!' : '💔 MATCH LOST'}</h2>
          <p class="result-margin">${result.marginText}</p>
        </div>

        <div class="result-scores-row">
          <div class="score-team-box">
            <div class="sc-flag">${result.playerTeam.flagSvg}</div>
            <h4>${result.playerTeam.name}</h4>
            <span class="sc-runs">${result.playerScore.runs}/${result.playerScore.wickets}</span>
            <span class="sc-overs">(${result.playerScore.overs} ovs)</span>
          </div>
          <div class="score-vs">VS</div>
          <div class="score-team-box">
            <div class="sc-flag">${result.opponentTeam.flagSvg}</div>
            <h4>${result.opponentTeam.name}</h4>
            <span class="sc-runs">${result.opponentScore.runs}/${result.opponentScore.wickets}</span>
            <span class="sc-overs">(${result.opponentScore.overs} ovs)</span>
          </div>
        </div>

        <div class="result-xp-reward-box">
          <div class="xp-title">CAREER PROGRESSION REWARD</div>
          <div class="xp-amount">+${xpGain} XP</div>
          <div class="xp-level-status">
            ${xpResult.leveledUp ? `<strong class="lvl-up-shout">⭐ LEVEL UP! YOU ARE NOW LEVEL ${xpResult.level} (${xpResult.title})!</strong>` : `Current Level: ${xpResult.level} (${xpResult.title}) • Total XP: ${xpResult.totalXP}`}
          </div>
        </div>

        <div class="result-actions">
          <button id="btn-return-dashboard" class="primary-action-btn mega-btn">CONTINUE TOURNAMENT →</button>
        </div>
      </div>
    `;

    const btn = document.getElementById("btn-return-dashboard");
    if (btn) {
      btn.addEventListener("click", () => {
        this.showScreen("screen-tournament-dashboard");
      });
    }
  }

  // ==========================================
  // 9. POINTS TABLE SCREEN
  // ==========================================
  renderPointsTableView() {
    const save = window.StorageManager.loadSave();
    const tourney = save.activeTournament;
    const container = document.getElementById("points-table-container");
    if (!container || !tourney) return;

    let html = "";
    Object.keys(tourney.standings).forEach(gKey => {
      const rows = tourney.standings[gKey];
      html += `
        <div class="group-table-section">
          <h3 class="group-title">GROUP ${gKey} STANDINGS</h3>
          <div class="table-responsive">
            <table class="cricket-points-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>TEAM</th>
                  <th>P</th>
                  <th>W</th>
                  <th>L</th>
                  <th>PTS</th>
                  <th>NRR</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((r, idx) => {
                  const team = window.TeamsManager.getById(r.teamId);
                  const isPlayer = r.teamId === tourney.playerTeamId;
                  const isQualifying = idx < 2;
                  return `
                    <tr class="${isPlayer ? 'player-row' : ''} ${isQualifying ? 'qualifying-row' : ''}">
                      <td>${idx + 1}</td>
                      <td class="team-cell">
                        <span class="table-flag">${team.flagSvg}</span>
                        <strong>${team.name}</strong>
                      </td>
                      <td>${r.played}</td>
                      <td>${r.won}</td>
                      <td>${r.lost}</td>
                      <td class="points-col"><strong>${r.points}</strong></td>
                      <td>${(r.nrr >= 0 ? '+' : '') + r.nrr.toFixed(3)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================
  // 10. KNOCKOUT BRACKET SCREEN
  // ==========================================
  renderKnockoutBracketView() {
    const save = window.StorageManager.loadSave();
    const tourney = save.activeTournament;
    const container = document.getElementById("knockout-bracket-container");
    if (!container || !tourney) return;

    const semis = tourney.knockouts.semis || [];
    const finalMatch = tourney.knockouts.final;

    container.innerHTML = `
      <div class="bracket-tree-wrapper">
        <div class="bracket-column">
          <h4 class="bracket-col-title">SEMI FINALS</h4>
          ${semis.length > 0 ? semis.map((s, idx) => {
            const teamA = window.TeamsManager.getById(s.teamAId);
            const teamB = window.TeamsManager.getById(s.teamBId);
            return `
              <div class="bracket-match-node">
                <span class="b-match-label">Semi Final ${idx + 1}</span>
                <div class="b-team-row ${s.result && s.result.winnerId === teamA.id ? 'winner' : ''}">
                  <span>${teamA.shortCode} ${teamA.name}</span>
                  <strong>${s.result && s.result.teamAScore ? s.result.teamAScore.runs : '-'}</strong>
                </div>
                <div class="b-team-row ${s.result && s.result.winnerId === teamB.id ? 'winner' : ''}">
                  <span>${teamB.shortCode} ${teamB.name}</span>
                  <strong>${s.result && s.result.teamBScore ? s.result.teamBScore.runs : '-'}</strong>
                </div>
              </div>
            `;
          }).join("") : `<div class="b-placeholder">Semi-finals will be generated after group stage.</div>`}
        </div>

        <div class="bracket-column">
          <h4 class="bracket-col-title">THE GRAND FINAL</h4>
          ${finalMatch ? `
            <div class="bracket-match-node final-node">
              <span class="b-match-label">🏆 CHAMPIONSHIP FINAL</span>
              <div class="b-team-row ${finalMatch.result && finalMatch.result.winnerId === finalMatch.teamAId ? 'winner' : ''}">
                <span>${window.TeamsManager.getById(finalMatch.teamAId).name}</span>
                <strong>${finalMatch.result && finalMatch.result.teamAScore ? finalMatch.result.teamAScore.runs : '-'}</strong>
              </div>
              <div class="b-team-row ${finalMatch.result && finalMatch.result.winnerId === finalMatch.teamBId ? 'winner' : ''}">
                <span>${window.TeamsManager.getById(finalMatch.teamBId).name}</span>
                <strong>${finalMatch.result && finalMatch.result.teamBScore ? finalMatch.result.teamBScore.runs : '-'}</strong>
              </div>
            </div>
          ` : `<div class="b-placeholder">Finalists will qualify after semi-finals.</div>`}
        </div>
      </div>
    `;
  }

  // ==========================================
  // 11. TROPHY CELEBRATION SCREEN
  // ==========================================
  showTrophyCelebration(tourneyConfig, playerTeam) {
    this.showScreen("screen-trophy-celebration");

    // Unlock in storage
    window.StorageManager.unlockTrophy({
      tournamentId: tourneyConfig.id,
      tournamentName: tourneyConfig.name,
      trophyId: tourneyConfig.trophyId,
      trophyName: tourneyConfig.trophyName,
      teamId: playerTeam.id,
      teamName: playerTeam.name,
      format: this.activeTournament ? this.activeTournament.format : tourneyConfig.defaultFormat
    });

    // Massive championship XP bonus
    const xpBonus = window.StorageManager.addXP(1000, "Tournament Championship");

    if (window.cricketSound) {
      window.cricketSound.playTrophyFanfare();
    }

    const container = document.getElementById("trophy-celebration-container");
    if (container) {
      container.innerHTML = `
        <div class="celebration-hero-card">
          <div class="champ-stars">⭐⭐⭐</div>
          <h1 class="champ-title">CHAMPIONS!</h1>
          <h2 class="champ-subtitle">${playerTeam.name.toUpperCase()} LIFTS THE ${tourneyConfig.name.toUpperCase()}!</h2>

          <div class="trophy-display-float">
            ${tourneyConfig.trophySvg}
          </div>

          <div class="champ-reward-pill">
            <span>🏆 TOURNAMENT VICTORY BONUS</span>
            <strong>+1000 CAREER XP</strong>
          </div>

          <div class="champ-actions">
            <button class="primary-action-btn mega-btn pulse-glow" data-screen="screen-trophy-cabinet">VIEW IN TROPHY CABINET ❯</button>
            <button class="secondary-btn" data-screen="screen-main-menu">MAIN MENU</button>
          </div>
        </div>
      `;
    }
  }

  // ==========================================
  // 12. TROPHY CABINET SCREEN
  // ==========================================
  renderTrophyCabinet() {
    const container = document.getElementById("trophy-cabinet-container");
    if (!container) return;

    const save = window.StorageManager.loadSave();
    const tournaments = window.TournamentEngine.getTournaments();

    container.innerHTML = tournaments.map(tourney => {
      const wonItem = save.trophyCabinet.find(t => t.tournamentId === tourney.id);
      const isUnlocked = !!wonItem;

      return `
        <div class="trophy-cabinet-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="trophy-icon-box">
            ${tourney.trophySvg}
          </div>
          <div class="trophy-info-box">
            <div class="trophy-status-badge ${isUnlocked ? 'won' : 'locked'}">
              ${isUnlocked ? `🏆 WON (${wonItem.timesWon}x)` : `🔒 LOCKED`}
            </div>
            <h4 class="trophy-title">${tourney.name}</h4>
            <span class="trophy-subtitle">${tourney.trophyName}</span>
            ${isUnlocked ? `
              <div class="trophy-meta">
                <span>Won with: <strong>${wonItem.teamName}</strong></span>
                <span>Date: <strong>${wonItem.lastWonDate || wonItem.wonDate}</strong></span>
              </div>
            ` : `
              <p class="trophy-locked-hint">Win the ${tourney.name} to unlock this prestigious trophy.</p>
            `}
          </div>
        </div>
      `;
    }).join("");
  }

  // ==========================================
  // 13. CAREER STATISTICS SCREEN
  // ==========================================
  renderCareerStats() {
    const container = document.getElementById("career-stats-container");
    if (!container) return;

    const save = window.StorageManager.loadSave();
    const c = save.career;
    const winRate = c.matchesPlayed > 0 ? ((c.matchesWon / c.matchesPlayed) * 100).toFixed(1) : "0.0";
    const strikeRate = c.totalBalls > 0 ? ((c.totalRuns / c.totalBalls) * 100).toFixed(1) : "0.0";

    // Calculate XP to next level
    const levels = window.CRICKET_CONFIG.careerLevels;
    const currentLvl = levels.find(l => l.level === c.level) || levels[0];
    const nextLvl = levels.find(l => l.level === c.level + 1) || levels[levels.length - 1];
    const xpDiff = nextLvl.xpRequired - currentLvl.xpRequired;
    const xpProgress = xpDiff > 0 ? Math.min(100, Math.max(0, ((c.xp - currentLvl.xpRequired) / xpDiff) * 100)) : 100;

    container.innerHTML = `
      <div class="career-hero-banner">
        <div class="career-player-badge">
          <span class="lvl-number">LVL ${c.level}</span>
          <span class="lvl-badge-icon">${currentLvl.badge}</span>
        </div>
        <div class="career-titles">
          <h2>${c.title}</h2>
          <div class="xp-bar-container">
            <div class="xp-bar-track">
              <div class="xp-bar-fill" style="width: ${xpProgress}%;"></div>
            </div>
            <div class="xp-bar-labels">
              <span>${c.xp} XP</span>
              <span>Next: ${nextLvl.title} (${nextLvl.xpRequired} XP)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="career-stats-grid">
        <div class="career-stat-card"><span class="c-label">MATCHES PLAYED</span><span class="c-val">${c.matchesPlayed}</span></div>
        <div class="career-stat-card"><span class="c-label">MATCHES WON</span><span class="c-val green-text">${c.matchesWon}</span></div>
        <div class="career-stat-card"><span class="c-label">MATCHES LOST</span><span class="c-val red-text">${c.matchesLost}</span></div>
        <div class="career-stat-card"><span class="c-label">WIN RATE</span><span class="c-val gold-text">${winRate}%</span></div>
        <div class="career-stat-card"><span class="c-label">TOTAL RUNS</span><span class="c-val">${c.totalRuns}</span></div>
        <div class="career-stat-card"><span class="c-label">HIGHEST SCORE</span><span class="c-val gold-text">${c.highestScore}*</span></div>
        <div class="career-stat-card"><span class="c-label">TOTAL FOURS (4s)</span><span class="c-val">${c.totalFours}</span></div>
        <div class="career-stat-card"><span class="c-label">TOTAL SIXES (6s)</span><span class="c-val">${c.totalSixes}</span></div>
        <div class="career-stat-card"><span class="c-label">CAREER STRIKE RATE</span><span class="c-val">${strikeRate}</span></div>
        <div class="career-stat-card"><span class="c-label">TROPHIES WON</span><span class="c-val gold-text">${c.trophiesWonCount}</span></div>
      </div>
    `;
  }

  // ==========================================
  // 14. SETTINGS SCREEN
  // ==========================================
  renderSettings() {
    const settings = window.StorageManager.loadSettings();
    const config = window.CRICKET_CONFIG;

    const soundCheck = document.getElementById("setting-sound");
    const motionCheck = document.getElementById("setting-reduced-motion");
    const sprintCheck = document.getElementById("setting-auto-sprint");

    if (soundCheck) soundCheck.checked = settings.soundEnabled;
    if (motionCheck) motionCheck.checked = settings.reducedMotion;
    if (sprintCheck) sprintCheck.checked = settings.autoSprint;

    // Bind change events
    if (soundCheck) {
      soundCheck.onchange = () => {
        settings.soundEnabled = soundCheck.checked;
        window.StorageManager.saveSettings(settings);
        this.updateSoundButtonUI();
      };
    }
    if (motionCheck) {
      motionCheck.onchange = () => {
        settings.reducedMotion = motionCheck.checked;
        window.StorageManager.saveSettings(settings);
      };
    }
    if (sprintCheck) {
      sprintCheck.onchange = () => {
        settings.autoSprint = sprintCheck.checked;
        window.StorageManager.saveSettings(settings);
      };
    }

    // Reset Career Button
    const resetBtn = document.getElementById("btn-reset-career");
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm("Are you sure you want to completely reset all career XP, statistics, and unlocked trophies? This action cannot be undone.")) {
          window.StorageManager.resetCareer();
          alert("Career progress has been reset to Level 1.");
          this.updateCareerPill();
          this.showScreen("screen-main-menu");
        }
      };
    }

    // Render Author Portfolio Links
    const authorBox = document.getElementById("settings-author-info");
    if (authorBox) {
      authorBox.innerHTML = `
        <div class="author-card">
          <h3>Built by ${config.author.name}</h3>
          <p class="author-role">${config.author.role}</p>
          <div class="author-links">
            <a href="${config.author.portfolioUrl}" target="_blank" rel="noopener" class="author-btn">🌐 Portfolio</a>
            <a href="${config.author.githubUrl}" target="_blank" rel="noopener" class="author-btn">🐙 GitHub</a>
            <a href="${config.author.linkedinUrl}" target="_blank" rel="noopener" class="author-btn">💼 LinkedIn</a>
          </div>
        </div>
      `;
    }
  }

  // ==========================================
  // 15. HOW TO PLAY SCREEN
  // ==========================================
  renderHowToPlay() {
    // Content is statically structured in HTML with tabs for batting, racing, formats & trophies
  }
}

window.UIManager = new UIManager();
