/**
 * CRICKET RUSH — Core Gameplay & Arcade Match Engine
 * HTML5 Canvas 60FPS Renderer, 3D Ball Physics, Dynamic Timing, Arcade Racing & Fielders
 */

class CricketGameplay {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.options = options;

    // Match State
    this.match = null;
    this.playerTeam = null;
    this.opponentTeam = null;
    this.format = null;
    this.stage = "group";
    this.difficulty = {};

    // Match Progress
    this.innings = 1; // Player batting
    this.currentScore = 0;
    this.currentWickets = 0;
    this.maxWickets = 5;
    this.totalDeliveries = 12;
    this.deliveriesBowled = 0;
    this.targetScore = 0;
    this.overBallsHistory = [];
    this.batterStats = { name: "B. Azam", runs: 0, balls: 0, fours: 0, sixes: 0 };
    this.isMatchOver = false;
    this.matchResult = null;

    // Ball & Delivery State
    this.deliveryState = "IDLE"; // IDLE, RUNUP, BOWLING, IN_FLIGHT, CONTACT, FIELDING, RACING, DECISION, NEXT_BALL
    this.deliveryType = "FAST"; // FAST, INSWING, OUTSWING, SLOWER, SPIN, BOUNCER
    this.ball = {
      x: 0,
      y: 0,
      z: 0, // Altitude above ground
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 6,
      shadowScale: 1.0,
      hasBounced: false,
      isBoundary: false,
      isSix: false,
      isWicket: false,
      runsScored: 0
    };

    // Bowler State
    this.bowler = {
      x: 0,
      y: 0,
      phase: 0, // 0 to 1 run-up
      speedKmh: 142.0,
      hand: "right"
    };

    // Batsman State
    this.batsman = {
      x: 0,
      y: 0,
      shotType: "DEFENSIVE", // DRIVE, PULL, LOFTED, CUT, GLANCE, DEFENSIVE
      animState: "STANCE", // STANCE, BACKLIFT, SWING, FOLLOWTHROUGH
      animTimer: 0,
      targetAngle: 0,
      shotDirection: "STRAIGHT" // STRAIGHT, OFF, LEG, LOFT
    };

    // Timing Window
    this.timing = {
      active: false,
      windowStart: 0,
      optimalTime: 0,
      windowEnd: 0,
      userHitTime: 0,
      quality: "MISS", // MISS, POOR, GOOD, GREAT, PERFECT
      timingDelta: 0
    };

    // Fielders (8 positions on ground)
    this.fielders = [];

    // Racing Sequence State
    this.racing = {
      active: false,
      runnerProgress: 0, // 0 to 100
      throwProgress: 0, // 0 to 100
      runnerSpeed: 0.8,
      throwSpeed: 0.9,
      runnerPos: "WICKET_A",
      targetRunCount: 1,
      currentRun: 1,
      canTurnTwo: false,
      isDiving: false,
      diveTimer: 0,
      result: null // "SAFE" or "OUT"
    };

    // Visual FX & Particles
    this.particles = [];
    this.floatingTexts = [];
    this.cameraShake = 0;
    this.confetti = [];

    // Animation loop handle
    this.animFrameId = null;
    this.lastTime = 0;

    // Key / Input Listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.isSpacePressed = false;
    this.keysDown = {};

    // Touch support
    this.setupListeners();
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  setupListeners() {
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.min(960, rect.width || window.innerWidth);
    const height = Math.min(620, Math.max(380, width * 0.62));

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
    this.viewWidth = width;
    this.viewHeight = height;

    this.initPositions();
  }

  initPositions() {
    const cx = this.viewWidth / 2;
    const cy = this.viewHeight / 2;

    // Pitch coordinates
    this.pitch = {
      topX: cx,
      topY: cy - 140,
      bottomX: cx,
      bottomY: cy + 140,
      width: 55,
      length: 280
    };

    // Bowler starts at top
    this.bowler.x = cx;
    this.bowler.y = this.pitch.topY - 30;

    // Batsman stands at popping crease near bottom
    this.batsman.x = cx;
    this.batsman.y = this.pitch.bottomY - 25;

    // Fielders setup
    this.initFielders();
  }

  initFielders() {
    const cx = this.viewWidth / 2;
    const cy = this.viewHeight / 2;
    const fw = this.viewWidth * 0.42;
    const fh = this.viewHeight * 0.42;

    this.fielders = [
      { name: "Cover", x: cx - fw * 0.7, y: cy - fh * 0.2, origX: cx - fw * 0.7, origY: cy - fh * 0.2, vx: 0, vy: 0, hasBall: false },
      { name: "Extra Cover", x: cx - fw * 0.85, y: cy + fh * 0.1, origX: cx - fw * 0.85, origY: cy + fh * 0.1, vx: 0, vy: 0, hasBall: false },
      { name: "Point", x: cx - fw * 0.75, y: cy + fh * 0.5, origX: cx - fw * 0.75, origY: cy + fh * 0.5, vx: 0, vy: 0, hasBall: false },
      { name: "Mid Wicket", x: cx + fw * 0.7, y: cy - fh * 0.2, origX: cx + fw * 0.7, origY: cy - fh * 0.2, vx: 0, vy: 0, hasBall: false },
      { name: "Square Leg", x: cx + fw * 0.8, y: cy + fh * 0.4, origX: cx + fw * 0.8, origY: cy + fh * 0.4, vx: 0, vy: 0, hasBall: false },
      { name: "Long On", x: cx + fw * 0.4, y: cy - fh * 0.75, origX: cx + fw * 0.4, origY: cy - fh * 0.75, vx: 0, vy: 0, hasBall: false },
      { name: "Long Off", x: cx - fw * 0.4, y: cy - fh * 0.75, origX: cx - fw * 0.4, origY: cy - fh * 0.75, vx: 0, vy: 0, hasBall: false },
      { name: "Wicketkeeper", x: cx, y: this.pitch.bottomY + 28, origX: cx, origY: this.pitch.bottomY + 28, vx: 0, vy: 0, hasBall: false }
    ];
  }

  /**
   * Start or Reset Match
   */
  startMatch({ match, playerTeam, opponentTeam, format = "ODI", stage = "group", onMatchComplete }) {
    this.match = match;
    this.playerTeam = playerTeam;
    this.opponentTeam = opponentTeam;
    this.format = window.CRICKET_CONFIG.formats[format] || window.CRICKET_CONFIG.formats.ODI;
    this.stage = stage;
    this.onMatchComplete = onMatchComplete;

    // Calculate difficulty tuning
    this.difficulty = window.TeamsManager.getMatchDifficulty(playerTeam.id, opponentTeam.id, stage);

    // Formats tuning
    this.totalDeliveries = this.format.playableDeliveries;
    this.maxWickets = this.format.wicketsPerInnings;
    this.deliveriesBowled = 0;
    this.currentScore = 0;
    this.currentWickets = 0;
    this.overBallsHistory = [];
    this.isMatchOver = false;
    this.matchResult = null;

    // Calculate Target for Player (Player is chasing a target or setting target)
    const baseTarget = Math.round(this.totalDeliveries * (this.format.targetRunRateBase / 6) * 1.5 + (this.opponentTeam.ratings.batting - 80) * 0.8);
    this.targetScore = Math.max(16, baseTarget);

    // Pick player team opening batter
    const batter = this.playerTeam.players[0] || { name: "Babar Azam" };
    this.batterStats = {
      name: batter.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0
    };

    this.resizeCanvas();
    this.startNextDelivery();

    // Start render loop
    this.lastTime = performance.now();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.loop(this.lastTime);
  }

  /**
   * Prepare next ball delivery
   */
  startNextDelivery() {
    if (this.isMatchOver) return;

    if (this.deliveriesBowled >= this.totalDeliveries || this.currentWickets >= this.maxWickets || this.currentScore >= this.targetScore) {
      this.finishMatch();
      return;
    }

    this.deliveryState = "RUNUP";
    this.initPositions();

    // Pick random delivery variation based on opponent bowling
    const types = ["FAST", "INSWING", "OUTSWING", "SLOWER", "SPIN", "BOUNCER"];
    this.deliveryType = types[Math.floor(Math.random() * types.length)];
    
    let baseSpeed = 135 + (this.opponentTeam.ratings.bowling - 80) * 1.2;
    if (this.deliveryType === "FAST") baseSpeed += 10;
    if (this.deliveryType === "SLOWER" || this.deliveryType === "SPIN") baseSpeed -= 25;
    this.bowler.speedKmh = Math.round(baseSpeed + (Math.random() * 8 - 4));

    // Reset ball
    this.ball = {
      x: this.bowler.x,
      y: this.bowler.y,
      z: 15,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 5.5,
      hasBounced: false,
      isBoundary: false,
      isSix: false,
      isWicket: false,
      runsScored: 0
    };

    this.batsman.animState = "STANCE";
    this.batsman.shotType = "DEFENSIVE";
    this.timing.active = false;
    this.racing.active = false;

    // Bowler Run-up countdown
    let runupTime = 0;
    const runupDuration = 800; // ms
    const startY = this.pitch.topY - 50;
    const endY = this.pitch.topY - 10;

    const runupAnim = (now) => {
      if (this.deliveryState !== "RUNUP") return;
      runupTime += 16;
      const progress = Math.min(1.0, runupTime / runupDuration);
      this.bowler.y = startY + progress * (endY - startY);
      this.bowler.phase = progress;

      if (progress < 1.0) {
        setTimeout(() => runupAnim(performance.now()), 16);
      } else {
        this.releaseBall();
      }
    };
    runupAnim(performance.now());
  }

  /**
   * Release ball from bowler hand
   */
  releaseBall() {
    this.deliveryState = "IN_FLIGHT";
    this.ball.x = this.bowler.x + 8;
    this.ball.y = this.bowler.y + 10;
    this.ball.z = 20;

    // Calculate ball velocity toward batsman popping crease
    const distanceY = (this.batsman.y - this.ball.y);
    const speedFactor = (this.bowler.speedKmh / 140) * this.difficulty.bowlerSpeedModifier * this.format.baseSpeed;
    const flightTimeMs = 1100 / speedFactor; // ~0.8 to 1.1 seconds

    const vy = distanceY / (flightTimeMs / 16.6); // pixels per frame
    let vx = (Math.random() * 1.6 - 0.8); // Slight line variation

    if (this.deliveryType === "INSWING") vx = -0.7;
    if (this.deliveryType === "OUTSWING") vx = 0.7;
    if (this.deliveryType === "SPIN") vx = (Math.random() > 0.5 ? 1.2 : -1.2);

    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.vz = -0.2; // descending to bounce

    // Set up Batting Timing Window
    const now = performance.now();
    const optimalTime = now + flightTimeMs * 0.78; // Contact point near popping crease
    const windowHalfWidth = 140 * this.difficulty.timingWindowModifier;

    this.timing = {
      active: true,
      windowStart: optimalTime - windowHalfWidth,
      optimalTime: optimalTime,
      windowEnd: optimalTime + windowHalfWidth,
      userHitTime: 0,
      quality: "MISS",
      timingDelta: 0
    };

    if (window.cricketSound) {
      window.cricketSound.playBallBounce();
    }
  }

  /**
   * Player triggers Batting Shot (Spacebar or Hit button)
   */
  triggerShot(directionOverride = null) {
    if (this.deliveryState !== "IN_FLIGHT" || !this.timing.active) {
      // If idle/racing, space runs!
      if (this.racing.active) {
        this.boostRun();
      }
      return;
    }

    const hitTime = performance.now();
    this.timing.active = false;
    this.timing.userHitTime = hitTime;

    const delta = hitTime - this.timing.optimalTime; // negative = early, positive = late
    const absDelta = Math.abs(delta);
    this.timing.timingDelta = delta;

    // Evaluate Timing Quality
    let quality = "MISS";
    if (absDelta < 35 * this.difficulty.timingWindowModifier) {
      quality = "PERFECT";
    } else if (absDelta < 70 * this.difficulty.timingWindowModifier) {
      quality = "GREAT";
    } else if (absDelta < 120 * this.difficulty.timingWindowModifier) {
      quality = "GOOD";
    } else if (absDelta < 170 * this.difficulty.timingWindowModifier) {
      quality = "POOR";
    } else {
      quality = "MISS";
    }
    this.timing.quality = quality;

    // Shot Direction
    let direction = directionOverride || this.batsman.shotDirection || "STRAIGHT";
    if (this.keysDown["ArrowLeft"] || this.keysDown["KeyA"]) direction = "OFF";
    if (this.keysDown["ArrowRight"] || this.keysDown["KeyD"]) direction = "LEG";
    if (this.keysDown["ArrowUp"] || this.keysDown["KeyW"]) direction = "LOFT";
    if (this.keysDown["ArrowDown"] || this.keysDown["KeyS"]) direction = "DEFENSIVE";
    this.batsman.shotDirection = direction;

    // Trigger Bat Animation
    this.batsman.animState = "SWING";
    this.batsman.animTimer = 0;

    // Sound effect
    if (window.cricketSound) {
      if (quality === "MISS") {
        window.cricketSound.playBatSwoosh();
      } else {
        window.cricketSound.playBatHit(quality);
      }
    }

    // Process Shot Outcome
    this.processShotOutcome(quality, direction, delta);
  }

  /**
   * Calculate shot trajectory, runs, boundaries, or wickets
   */
  processShotOutcome(quality, direction, delta) {
    this.deliveriesBowled += 1;
    this.batterStats.balls += 1;

    // Case 1: MISS (Missed delivery)
    if (quality === "MISS") {
      this.deliveryState = "DECISION";
      // Chance of Bowled / LBW if delivery is straight
      const isBowled = Math.abs(this.ball.x - this.batsman.x) < 14 && Math.random() < 0.45;
      
      if (isBowled) {
        this.triggerWicket("BOWLED! 💥");
      } else {
        this.addFloatingText("MISSED! 💨", this.batsman.x, this.batsman.y - 40, "#a4b0be");
        this.recordBallOutcome(0, "0");
        setTimeout(() => this.startNextDelivery(), 1500);
      }
      return;
    }

    // Case 2: POOR TIMING
    if (quality === "POOR") {
      // Chance of top edge / catch
      const isCatchOut = Math.random() < 0.35;
      if (isCatchOut) {
        this.triggerWicket("CAUGHT OUT! 🧤");
        return;
      }
      this.addFloatingText("POOR TIMING ⚠️", this.batsman.x, this.batsman.y - 40, "#ff793f");
      this.launchBallIntoField(quality, direction, 1);
      return;
    }

    // Case 3: PERFECT SHOT (Potential 6 or Rocket 4)
    if (quality === "PERFECT") {
      if (direction === "LOFT" || Math.random() < 0.65) {
        // SIX!
        this.ball.isSix = true;
        this.ball.isBoundary = true;
        this.addFloatingText("PERFECT TIMING! 🔥", this.batsman.x, this.batsman.y - 65, "#ffd700");
        this.addFloatingText("SIX! 🚀", this.batsman.x, this.batsman.y - 100, "#ff4757", 32);
        this.triggerCameraShake(12);
        this.spawnConfetti();

        if (window.cricketSound) window.cricketSound.playSixFanfare();

        this.launchBoundaryBall(direction, 6);
        this.recordBallOutcome(6, "6");
        this.batterStats.sixes += 1;
        this.batterStats.runs += 6;
        this.currentScore += 6;

        setTimeout(() => this.startNextDelivery(), 2500);
        return;
      } else {
        // ROCKET FOUR!
        this.ball.isBoundary = true;
        this.addFloatingText("PERFECT! ⚡", this.batsman.x, this.batsman.y - 50, "#2ed573");
        this.addFloatingText("FOUR! ⚡", this.batsman.x, this.batsman.y - 90, "#1e90ff", 28);
        this.triggerCameraShake(8);

        if (window.cricketSound) window.cricketSound.playFourFanfare();

        this.launchBoundaryBall(direction, 4);
        this.recordBallOutcome(4, "4");
        this.batterStats.fours += 1;
        this.batterStats.runs += 4;
        this.currentScore += 4;

        setTimeout(() => this.startNextDelivery(), 2300);
        return;
      }
    }

    // Case 4: GREAT SHOT
    if (quality === "GREAT") {
      if (Math.random() < 0.55) {
        // FOUR!
        this.ball.isBoundary = true;
        this.addFloatingText("GREAT SHOT! ⚡", this.batsman.x, this.batsman.y - 50, "#2ed573");
        this.addFloatingText("FOUR! 🎯", this.batsman.x, this.batsman.y - 90, "#2ed573", 26);
        this.triggerCameraShake(6);

        if (window.cricketSound) window.cricketSound.playFourFanfare();

        this.launchBoundaryBall(direction, 4);
        this.recordBallOutcome(4, "4");
        this.batterStats.fours += 1;
        this.batterStats.runs += 4;
        this.currentScore += 4;

        setTimeout(() => this.startNextDelivery(), 2200);
        return;
      } else {
        this.addFloatingText("GREAT SHOT! 🏏", this.batsman.x, this.batsman.y - 40, "#2ed573");
        this.launchBallIntoField(quality, direction, 2);
        return;
      }
    }

    // Case 5: GOOD SHOT
    if (quality === "GOOD") {
      this.addFloatingText("GOOD SHOT! 👍", this.batsman.x, this.batsman.y - 40, "#70a1ff");
      this.launchBallIntoField(quality, direction, 1);
      return;
    }
  }

  /**
   * Launch boundary ball (flown over or rolled past boundary)
   */
  launchBoundaryBall(direction, runs) {
    this.deliveryState = "FIELDING";
    const angleMap = {
      OFF: -Math.PI * 0.7,
      LEG: -Math.PI * 0.3,
      LOFT: -Math.PI * 0.5,
      STRAIGHT: -Math.PI * 0.52
    };
    const angle = angleMap[direction] || -Math.PI * 0.5;
    const speed = runs === 6 ? 16 : 12;

    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.vz = runs === 6 ? 18 : 3;
  }

  /**
   * Launch ball into outfield and initiate ARCADE RACING BETWEEN WICKETS!
   */
  launchBallIntoField(quality, direction, expectedRuns = 1) {
    this.deliveryState = "FIELDING";
    
    // Calculate outfield landing spot
    let angle = -Math.PI * 0.5;
    if (direction === "OFF") angle = -Math.PI * 0.72 + (Math.random() * 0.3 - 0.15);
    if (direction === "LEG") angle = -Math.PI * 0.28 + (Math.random() * 0.3 - 0.15);
    if (direction === "DEFENSIVE") angle = Math.PI * 0.5 + (Math.random() * 0.6 - 0.3);

    const speed = quality === "GREAT" ? 9.5 : quality === "GOOD" ? 7.0 : 4.5;
    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.vz = 4.0;

    // Find nearest fielder
    setTimeout(() => {
      this.startRacingSequence(expectedRuns);
    }, 450);
  }

  /**
   * ARCADE RACING SEQUENCE: Runner vs Fielder Throw
   */
  startRacingSequence(potentialRuns = 1) {
    this.deliveryState = "RACING";
    this.racing = {
      active: true,
      runnerProgress: 0,
      throwProgress: 0,
      runnerSpeed: 0.95 * this.difficulty.runningSpeedModifier,
      throwSpeed: 0.88 * this.difficulty.fielderSpeedModifier,
      runnerPos: "WICKET_A",
      targetRunCount: potentialRuns,
      currentRun: 1,
      canTurnTwo: false,
      isDiving: false,
      diveTimer: 0,
      result: null
    };

    // Voice / UI notification
    this.addFloatingText("RUN! [SPACE / TAP FAST] 🏃", this.viewWidth / 2, this.viewHeight / 2 - 30, "#fffa65", 22);

    // Auto sprint if setting enabled
    const settings = window.StorageManager.loadSettings();
    if (settings.autoSprint) {
      this.racing.runnerSpeed *= 1.15;
    }
  }

  /**
   * Boost runner sprint speed when player taps Spacebar or clicks RUN button
   */
  boostRun() {
    if (!this.racing.active) return;
    this.racing.runnerProgress += 7.5 * this.difficulty.runningSpeedModifier;
    
    if (window.cricketSound) {
      window.cricketSound.playFootstep();
    }
    // Spawn footstep smoke particle
    this.spawnParticle(this.batsman.x, this.batsman.y + 10, "#dcdde1", 4);
  }

  /**
   * Trigger dive at the crease (Down Arrow / DIVE button)
   */
  triggerDive() {
    if (!this.racing.active || this.racing.isDiving) return;
    this.racing.isDiving = true;
    this.racing.runnerProgress += 12.0; // Instant slide boost!
    this.addFloatingText("DIVE! 💨", this.batsman.x, this.batsman.y - 20, "#00d2d3", 20);
    if (window.cricketSound) window.cricketSound.playFootstep();
  }

  /**
   * Turn for an extra 2nd Run
   */
  turnForSecondRun() {
    if (!this.racing.active || !this.racing.canTurnTwo) return;
    this.racing.canTurnTwo = false;
    this.racing.currentRun = 2;
    this.racing.runnerProgress = 0;
    this.racing.throwProgress = 25; // Fielder has already collected ball, throw is coming fast!
    this.addFloatingText("2ND RUN! SPRINT! ⚡", this.viewWidth / 2, this.viewHeight / 2 - 30, "#ff4757", 22);
  }

  /**
   * Complete the Racing sequence
   */
  finishRacingSequence(isSafe) {
    this.racing.active = false;
    this.deliveryState = "DECISION";

    if (isSafe) {
      const runs = this.racing.currentRun;
      this.currentScore += runs;
      this.batterStats.runs += runs;
      this.recordBallOutcome(runs, `${runs}`);

      this.addFloatingText(`SAFE! 🟢 +${runs} RUN${runs > 1 ? "S" : ""}`, this.viewWidth / 2, this.viewHeight / 2 - 40, "#2ed573", 26);
      if (window.cricketSound) window.cricketSound.playSafeChime();

      setTimeout(() => this.startNextDelivery(), 1600);
    } else {
      // RUN OUT!
      this.triggerWicket("RUN OUT! 🔴");
    }
  }

  /**
   * Trigger Wicket Dismissal (Bowled, Caught, Run Out)
   */
  triggerWicket(typeText = "WICKET! 💥") {
    this.currentWickets += 1;
    this.recordBallOutcome(0, "W");
    this.addFloatingText(typeText, this.viewWidth / 2, this.viewHeight / 2 - 50, "#ff4757", 32);
    this.triggerCameraShake(14);

    if (window.cricketSound) {
      window.cricketSound.playWicket();
    }

    // Switch batsman if wickets remain
    if (this.currentWickets < this.maxWickets) {
      const nextBatterIdx = Math.min(this.playerTeam.players.length - 1, this.currentWickets);
      const nextBatter = this.playerTeam.players[nextBatterIdx];
      this.batterStats = {
        name: nextBatter ? nextBatter.name : `Batter ${this.currentWickets + 1}`,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
      setTimeout(() => this.startNextDelivery(), 2200);
    } else {
      setTimeout(() => this.finishMatch(), 2000);
    }
  }

  /**
   * Record outcome in ball-by-ball tracker
   */
  recordBallOutcome(runs, tag) {
    this.overBallsHistory.push({
      ballNum: this.deliveriesBowled,
      runs: runs,
      tag: tag
    });
  }

  /**
   * Finish Match and calculate results
   */
  finishMatch() {
    this.isMatchOver = true;
    this.deliveryState = "MATCH_OVER";

    const isPlayerWin = this.currentScore >= this.targetScore;
    const margin = isPlayerWin
      ? `${this.maxWickets - this.currentWickets} wickets`
      : `${this.targetScore - this.currentScore} runs`;

    const winnerId = isPlayerWin ? this.playerTeam.id : this.opponentTeam.id;
    const winnerName = isPlayerWin ? this.playerTeam.name : this.opponentTeam.name;

    // Convert condensed deliveries to simulated full scoreboard display
    const oversDisplay = (this.deliveriesBowled / (this.totalDeliveries / this.format.maxOvers)).toFixed(1);
    
    this.matchResult = {
      isPlayerWin,
      winnerId,
      winnerName,
      playerScore: {
        runs: this.currentScore,
        wickets: this.currentWickets,
        overs: parseFloat(oversDisplay)
      },
      opponentScore: {
        runs: this.targetScore - 1,
        wickets: Math.min(this.maxWickets - 1, 4),
        overs: this.format.maxOvers
      },
      marginText: `${winnerName} won by ${margin}`,
      batterStats: this.batterStats,
      playerTeam: this.playerTeam,
      opponentTeam: this.opponentTeam,
      stage: this.stage,
      format: this.format.id,
      match: this.match
    };

    if (isPlayerWin && window.cricketSound) {
      window.cricketSound.playTrophyFanfare();
    }

    if (this.onMatchComplete) {
      this.onMatchComplete(this.matchResult);
    }
  }

  /**
   * Key Handlers
   */
  handleKeyDown(e) {
    this.keysDown[e.code] = true;

    if (e.code === "Space") {
      e.preventDefault();
      if (this.deliveryState === "IN_FLIGHT" && this.timing.active) {
        this.triggerShot();
      } else if (this.racing.active) {
        this.boostRun();
      }
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      if (this.racing.active) {
        this.triggerDive();
      }
    } else if (e.code === "KeyT") {
      if (this.racing.active && this.racing.canTurnTwo) {
        this.turnForSecondRun();
      }
    }
  }

  handleKeyUp(e) {
    this.keysDown[e.code] = false;
  }

  /**
   * Main Render & Physics Loop (60 FPS)
   */
  loop(currentTime) {
    const dt = Math.min(32, currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.updatePhysics(dt);
    this.render();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Update Ball, Fielder, Runner physics
   */
  updatePhysics(dt) {
    // 1. Ball in Flight
    if (this.deliveryState === "IN_FLIGHT") {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.z += this.ball.vz;

      // Ball Bounce near middle of pitch
      if (this.ball.y > this.pitch.topY + 120 && !this.ball.hasBounced) {
        this.ball.hasBounced = true;
        this.ball.vz = 0.35; // bounce upward toward batsman
        this.spawnParticle(this.ball.x, this.ball.y, "#bdc581", 6);
      }

      // Ball reaches popping crease without shot -> Missed / Passed
      if (this.ball.y > this.batsman.y + 40 && this.timing.active) {
        this.timing.active = false;
        this.processShotOutcome("MISS", "STRAIGHT", 999);
      }
    }

    // 2. Ball Fielding / Outfield rolling
    if (this.deliveryState === "FIELDING" || this.deliveryState === "RACING") {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.vx *= 0.96; // friction
      this.ball.vy *= 0.96;
      if (this.ball.z > 0) {
        this.ball.vz -= 0.6; // gravity
        this.ball.z += this.ball.vz;
        if (this.ball.z <= 0) {
          this.ball.z = 0;
          this.ball.vz = -this.ball.vz * 0.45; // bounce dampening
        }
      }
    }

    // 3. Racing Sequence Progress
    if (this.racing.active) {
      // Natural running speed
      this.racing.runnerProgress += this.racing.runnerSpeed * (dt / 16.6);
      // Fielder throw speed
      this.racing.throwProgress += this.racing.throwSpeed * (dt / 16.6);

      // Check for turn 2 window
      if (this.racing.runnerProgress >= 100 && this.racing.currentRun === 1 && this.racing.throwProgress < 65) {
        this.racing.canTurnTwo = true;
      }

      // Check finish condition
      if (this.racing.runnerProgress >= 100) {
        // Runner reached crease!
        if (this.racing.currentRun === 1 && this.racing.canTurnTwo) {
          // Allow player 600ms to decide whether to turn or stay
          setTimeout(() => {
            if (this.racing.active && this.racing.currentRun === 1) {
              this.finishRacingSequence(true);
            }
          }, 600);
        } else {
          this.finishRacingSequence(true);
        }
      } else if (this.racing.throwProgress >= 100) {
        // Throw hit stumps!
        if (this.racing.runnerProgress < 95) {
          this.finishRacingSequence(false); // RUN OUT!
        } else {
          this.finishRacingSequence(true); // Close call SAFE!
        }
      }
    }

    // 4. Update Particles & Confetti
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.7;
      ft.life -= 0.018;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.15; // gravity
      c.rot += c.rotSpeed;
      c.life -= 0.01;
      if (c.life <= 0) this.confetti.splice(i, 1);
    }

    if (this.cameraShake > 0) {
      this.cameraShake *= 0.88;
      if (this.cameraShake < 0.2) this.cameraShake = 0;
    }
  }

  /**
   * Visual Render Pipeline
   */
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.viewWidth;
    const h = this.viewHeight;

    ctx.save();
    
    // Apply camera shake if any
    if (this.cameraShake > 0) {
      const sx = (Math.random() * 2 - 1) * this.cameraShake;
      const sy = (Math.random() * 2 - 1) * this.cameraShake;
      ctx.translate(sx, sy);
    }

    // Clear Canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Stadium Arena (Lush Outfield, Stands, Floodlights)
    this.drawStadium(ctx, w, h);

    // 2. Draw 22-Yard Cricket Pitch & Crease Markings
    this.drawPitch(ctx);

    // 3. Draw Fielders
    this.drawFielders(ctx);

    // 4. Draw Bowler & Non-striker
    this.drawBowler(ctx);

    // 5. Draw Batsman & Wicketkeeper
    this.drawBatsman(ctx);

    // 6. Draw Cricket Ball & Shadow
    this.drawBall(ctx);

    // 7. Draw Visual FX, Particles, Confetti
    this.drawFX(ctx);

    // 8. Draw Batting Timing Meter (when ball in flight)
    if (this.deliveryState === "IN_FLIGHT" && this.timing.active) {
      this.drawTimingMeter(ctx, w, h);
    }

    // 9. Draw Arcade Racing HUD (when running between wickets)
    if (this.racing.active) {
      this.drawRacingHUD(ctx, w, h);
    }

    // 10. Draw Floating Texts / Popups
    this.drawFloatingTexts(ctx);

    ctx.restore();
  }

  /**
   * 1. Draw Stadium Environment
   */
  drawStadium(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;

    // Outfield Grass Radial Gradient
    const grassGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.7);
    grassGrad.addColorStop(0, "#2ecc71");
    grassGrad.addColorStop(0.6, "#27ae60");
    grassGrad.addColorStop(1, "#1e824c");
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, w, h);

    // Alternating Mowing Grass Rings
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 26;
    for (let r = 70; r < Math.max(w, h) * 0.7; r += 52) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.3, r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Boundary Rope & Cones
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 3.5;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.46, h * 0.44, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Floodlight Glows in 4 Corners
    const lightColor = "rgba(255, 255, 200, 0.12)";
    [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]].forEach(([lx, ly]) => {
      const grad = ctx.createRadialGradient(lx, ly, 5, lx, ly, 140);
      grad.addColorStop(0, lightColor);
      grad.addColorStop(1, "rgba(255, 255, 200, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, 140, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * 2. Draw 22-Yard Cricket Pitch
   */
  drawPitch(ctx) {
    const p = this.pitch;
    const hw = p.width / 2;

    // Clay Strip
    const pitchGrad = ctx.createLinearGradient(p.topX - hw, p.topY, p.bottomX + hw, p.bottomY);
    pitchGrad.addColorStop(0, "#d2b48c");
    pitchGrad.addColorStop(0.5, "#c8a572");
    pitchGrad.addColorStop(1, "#d7be95");

    ctx.fillStyle = pitchGrad;
    ctx.beginPath();
    ctx.rect(p.topX - hw, p.topY, p.width, p.length);
    ctx.fill();

    // Pitch Border
    ctx.strokeStyle = "#a27c44";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.topX - hw, p.topY, p.width, p.length);

    // Bowling Crease (Top) & Popping Crease
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    // Top Crease
    ctx.beginPath();
    ctx.moveTo(p.topX - hw - 8, p.topY + 25);
    ctx.lineTo(p.topX + hw + 8, p.topY + 25);
    ctx.stroke();

    // Bottom Popping Crease (Where batsman stands)
    ctx.beginPath();
    ctx.moveTo(p.bottomX - hw - 12, p.bottomY - 25);
    ctx.lineTo(p.bottomX + hw + 12, p.bottomY - 25);
    ctx.stroke();

    // Stumps & Bails (Top End)
    this.drawStumps(ctx, p.topX, p.topY + 12, 16);

    // Stumps & Bails (Bottom Striker End)
    this.drawStumps(ctx, p.bottomX, p.bottomY - 12, 22);
  }

  /**
   * Draw 3 Wooden Stumps with Bails
   */
  drawStumps(ctx, x, y, size) {
    ctx.fillStyle = "#8d5524";
    ctx.strokeStyle = "#5a320f";
    ctx.lineWidth = 1;

    const spacing = size / 3;
    for (let i = -1; i <= 1; i++) {
      const sx = x + i * spacing;
      ctx.fillRect(sx - 1.5, y - size, 3, size);
      ctx.strokeRect(sx - 1.5, y - size, 3, size);
    }
    // Bail
    ctx.fillStyle = "#e0a96d";
    ctx.fillRect(x - size * 0.55, y - size - 2, size * 1.1, 2.5);
  }

  /**
   * 3. Draw Fielders
   */
  drawFielders(ctx) {
    const oppColor = this.opponentTeam ? this.opponentTeam.colors.primary : "#e74c3c";
    this.fielders.forEach(f => {
      // Fielder shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 8, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fielder Jersey Body
      ctx.fillStyle = oppColor;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Fielder Head/Cap
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath();
      ctx.arc(f.x, f.y - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * 4. Draw Bowler
   */
  drawBowler(ctx) {
    const b = this.bowler;
    const oppColor = this.opponentTeam ? this.opponentTeam.colors.primary : "#34495e";

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bowler Body
    ctx.fillStyle = oppColor;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#f39c12";
    ctx.beginPath();
    ctx.arc(b.x, b.y - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Bowling Arm
    ctx.strokeStyle = oppColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x + 6, b.y - 2);
    const armAngle = this.deliveryState === "RUNUP" ? Math.sin(b.phase * Math.PI * 4) : -Math.PI * 0.4;
    ctx.lineTo(b.x + 6 + Math.cos(armAngle) * 12, b.y - 2 + Math.sin(armAngle) * 12);
    ctx.stroke();
  }

  /**
   * 5. Draw Animated Batsman
   */
  drawBatsman(ctx) {
    const bm = this.batsman;
    const teamColor = this.playerTeam ? this.playerTeam.colors.primary : "#006622";
    const accentColor = this.playerTeam ? this.playerTeam.colors.accent : "#ffd700";

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(bm.x, bm.y + 16, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pads / Legs
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bm.x - 6, bm.y + 4, 4, 12);
    ctx.fillRect(bm.x + 2, bm.y + 4, 4, 12);

    // Jersey Body
    ctx.fillStyle = teamColor;
    ctx.beginPath();
    ctx.ellipse(bm.x, bm.y, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Helmet / Head
    ctx.fillStyle = teamColor;
    ctx.beginPath();
    ctx.arc(bm.x, bm.y - 12, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Grille
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bm.x - 3, bm.y - 10);
    ctx.lineTo(bm.x + 4, bm.y - 10);
    ctx.stroke();

    // Cricket Bat Animation
    ctx.save();
    ctx.translate(bm.x, bm.y);

    let batAngle = Math.PI * 0.2; // Default Stance backlift
    if (bm.animState === "SWING") {
      batAngle = -Math.PI * 0.6; // Full forward shot swing!
    }

    ctx.rotate(batAngle);
    // Bat Blade
    ctx.fillStyle = "#c89666";
    ctx.fillRect(8, -4, 22, 5.5);
    ctx.strokeStyle = "#8d5524";
    ctx.strokeRect(8, -4, 22, 5.5);
    // Bat Handle & Grip
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, -2.5, 8, 3);
    ctx.restore();
  }

  /**
   * 6. Draw Cricket Ball & 3D Flight Shadow
   */
  drawBall(ctx) {
    if (this.deliveryState === "IDLE" || this.deliveryState === "RUNUP") return;

    const b = this.ball;
    const shadowY = b.y + b.z * 0.8;
    const shadowAlpha = Math.max(0.1, 0.4 - b.z * 0.008);

    // Ball Ground Shadow (3D Altitude projection)
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(b.x, shadowY, b.radius * (1 + b.z * 0.02), b.radius * 0.5 * (1 + b.z * 0.02), 0, 0, Math.PI * 2);
    ctx.fill();

    // Ball in Air
    const ballRadius = Math.max(3.5, b.radius + b.z * 0.08);
    const ballGrad = ctx.createRadialGradient(b.x - 2, b.y - b.z - 2, 1, b.x, b.y - b.z, ballRadius);
    ballGrad.addColorStop(0, "#ff6b6b");
    ballGrad.addColorStop(0.6, "#c0392b");
    ballGrad.addColorStop(1, "#7b1113");

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y - b.z, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // White Seam
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y - b.z, ballRadius * 0.7, 0, Math.PI);
    ctx.stroke();
  }

  /**
   * 8. Draw Dynamic Batting Timing Meter (Color-Coded Sweet Spot)
   */
  drawTimingMeter(ctx, w, h) {
    const barW = Math.min(360, w * 0.8);
    const barH = 18;
    const barX = (w - barW) / 2;
    const barY = h - 65;

    // Background Container
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(barX - 4, barY - 24, barW + 8, barH + 34, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Timing Header Label
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("TIMING WINDOW — PRESS SPACE / HIT", w / 2, barY - 8);

    // Color Zones
    // [ MISS | POOR | GOOD | GREAT | PERFECT | GREAT | GOOD | POOR | MISS ]
    const zones = [
      { start: 0, end: 0.18, color: "#ff4757" }, // Miss / Edge
      { start: 0.18, end: 0.34, color: "#ffa502" }, // Poor
      { start: 0.34, end: 0.44, color: "#2ed573" }, // Good
      { start: 0.44, end: 0.48, color: "#00d2d3" }, // Great
      { start: 0.48, end: 0.52, color: "#ffd700" }, // PERFECT 🔥
      { start: 0.52, end: 0.56, color: "#00d2d3" }, // Great
      { start: 0.56, end: 0.66, color: "#2ed573" }, // Good
      { start: 0.66, end: 0.82, color: "#ffa502" }, // Poor
      { start: 0.82, end: 1.0, color: "#ff4757" } // Miss
    ];

    zones.forEach(z => {
      ctx.fillStyle = z.color;
      ctx.fillRect(barX + z.start * barW, barY, (z.end - z.start) * barW, barH);
    });

    // Moving Cursor Indicator
    const totalWindow = this.timing.windowEnd - this.timing.windowStart;
    const currentProgress = (performance.now() - this.timing.windowStart) / totalWindow;
    const cursorX = Math.max(barX, Math.min(barX + barW, barX + currentProgress * barW));

    // Glow Cursor
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 8;
    ctx.fillRect(cursorX - 3, barY - 4, 6, barH + 8);
    ctx.shadowBlur = 0;
  }

  /**
   * 9. Draw Arcade Racing HUD (Runner vs Fielder Throw)
   */
  drawRacingHUD(ctx, w, h) {
    const hudW = Math.min(420, w * 0.85);
    const hudH = 110;
    const hudX = (w - hudW) / 2;
    const hudY = 20;

    // Glassmorphism HUD Card
    ctx.fillStyle = "rgba(10, 15, 30, 0.92)";
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 12);
    ctx.fill();
    ctx.strokeStyle = "#00d2d3";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#ffd700";
    ctx.textAlign = "left";
    ctx.fillText(`⚡ RACING TO CREASE — RUN ${this.racing.currentRun}!`, hudX + 16, hudY + 24);

    // Tip text
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText("MASH [SPACE / RUN] TO SPRINT!", hudX + hudW - 16, hudY + 24);

    // 1. Runner Bar
    const barW = hudW - 120;
    const barH = 16;
    const barX = hudX + 105;

    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#2ed573";
    ctx.textAlign = "left";
    ctx.fillText("🏃 RUNNER:", hudX + 16, hudY + 54);

    // Runner Track
    ctx.fillStyle = "#222f3e";
    ctx.fillRect(barX, hudY + 40, barW, barH);
    // Runner Fill
    const runFill = Math.min(barW, (this.racing.runnerProgress / 100) * barW);
    const runGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    runGrad.addColorStop(0, "#2ed573");
    runGrad.addColorStop(1, "#7bed9f");
    ctx.fillStyle = runGrad;
    ctx.fillRect(barX, hudY + 40, runFill, barH);

    // 2. Fielder Throw Bar
    ctx.fillStyle = "#ff4757";
    ctx.fillText("⚡ THROW:", hudX + 16, hudY + 84);

    // Throw Track
    ctx.fillStyle = "#222f3e";
    ctx.fillRect(barX, hudY + 70, barW, barH);
    // Throw Fill
    const throwFill = Math.min(barW, (this.racing.throwProgress / 100) * barW);
    const throwGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    throwGrad.addColorStop(0, "#ff4757");
    throwGrad.addColorStop(1, "#ff6b81");
    ctx.fillStyle = throwGrad;
    ctx.fillRect(barX, hudY + 70, throwFill, barH);

    // Crease Flag
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(barX + barW - 2, hudY + 36, 4, barH * 2 + 18);
  }

  /**
   * 10. Draw FX, Particles, and Confetti
   */
  drawFX(ctx) {
    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Confetti
    this.confetti.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.life;
      ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
      ctx.restore();
    });
    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw Floating Animated Score / Decision Texts
   */
  drawFloatingTexts(ctx) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = `bold ${ft.size || 22}px sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  /**
   * Helper: Add Floating Text
   */
  addFloatingText(text, x, y, color = "#ffd700", size = 22) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      size,
      life: 1.0
    });
  }

  /**
   * Helper: Spawn Particle Burst
   */
  spawnParticle(x, y, color = "#fff", count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() * 4 - 2),
        vy: (Math.random() * 4 - 2),
        color,
        size: Math.random() * 4 + 2,
        life: 1.0
      });
    }
  }

  /**
   * Helper: Spawn Confetti Celebration
   */
  spawnConfetti(count = 40) {
    const colors = ["#ffd700", "#ff4757", "#2ed573", "#1e90ff", "#ffffff", "#ff9ff3"];
    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: this.viewWidth / 2 + (Math.random() * 200 - 100),
        y: this.viewHeight / 2 - 50,
        vx: (Math.random() * 8 - 4),
        vy: (Math.random() * -8 - 3),
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.2 - 0.1),
        life: 1.0
      });
    }
  }

  /**
   * Helper: Camera Shake
   */
  triggerCameraShake(intensity = 8) {
    const settings = window.StorageManager.loadSettings();
    if (settings.reducedMotion) return;
    this.cameraShake = intensity;
  }
}

window.CricketGameplay = CricketGameplay;
