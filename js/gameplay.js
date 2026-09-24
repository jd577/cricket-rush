/**
 * CRICKET RUSH — Broadcast 3D Match Engine
 * ------------------------------------------------------------
 * TV-style behind-the-batsman camera, true 3D ball physics (metres / seconds),
 * hand-drawn articulated cricketers, stadium with floodlights + live crowd,
 * physical fielding, throws and run-outs.
 *
 * Built by Jawad Akhter | Software Quality Assurance Engineer
 */
(function () {
  "use strict";

  /* ============================================================
   * CONSTANTS (real cricket dimensions, in metres)
   * ========================================================== */
  const G = 9.81;
  const PITCH_LEN = 20.12;      // stump to stump
  const PITCH_HALF_W = 1.525;
  const CREASE = 1.22;          // popping crease in front of the stumps
  const STUMP_H = 0.711;
  const STUMP_HALF = 0.1143;
  const BOUNDARY_R = 64;
  const CIRCLE_R = 27.4;
  const CENTRE_Y = PITCH_LEN / 2;
  const CONTACT_Y = 1.05;       // where the bat meets the ball
  const BAT_X = -0.62;          // right hander stands just leg-side of the stumps

  /* Global time dilation — real cricket is far too quick for an arcade game */
  const TIME_SCALE = 0.62;

  /* ============================================================
   * SMALL HELPERS
   * ========================================================== */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

  function shade(hex, amt) {
    // amt -1..1 (darken..lighten)
    const h = (hex || "#3b6ea5").replace("#", "");
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    let r = parseInt(full.substr(0, 2), 16);
    let g = parseInt(full.substr(2, 2), 16);
    let b = parseInt(full.substr(4, 2), 16);
    if (amt >= 0) {
      r = Math.round(lerp(r, 255, amt));
      g = Math.round(lerp(g, 255, amt));
      b = Math.round(lerp(b, 255, amt));
    } else {
      r = Math.round(lerp(r, 0, -amt));
      g = Math.round(lerp(g, 0, -amt));
      b = Math.round(lerp(b, 0, -amt));
    }
    return `rgb(${r},${g},${b})`;
  }

  /* ============================================================
   * BROADCAST CAMERA — pinhole projection with pitch (tilt) angle
   * ========================================================== */
  const CAM_MODES = {
    BOWLING: { x: 0, y: -10.2, z: 4.15, tilt: 0.205, fov: 1.24, speed: 2.6 },
    SHOT:    { x: 0, y: -13.0, z: 6.20, tilt: 0.270, fov: 0.98, speed: 2.2 },
    WIDE:    { x: 0, y: -14.5, z: 11.0, tilt: 0.385, fov: 0.76, speed: 1.5 },
    SIX:     { x: 0, y: -15.0, z: 7.50, tilt: 0.215, fov: 0.80, speed: 1.8 },
    CELEBRATE:{x: 0, y: -8.0,  z: 3.20, tilt: 0.170, fov: 1.35, speed: 2.0 }
  };

  class BroadcastCamera {
    constructor() {
      this.set("BOWLING", true);
      this.viewW = 960;
      this.viewH = 600;
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    set(mode, instant) {
      const m = CAM_MODES[mode] || CAM_MODES.BOWLING;
      this.mode = mode;
      this.target = m;
      if (instant) {
        this.x = m.x; this.y = m.y; this.z = m.z;
        this.tilt = m.tilt; this.fov = m.fov;
      }
    }

    update(dt) {
      const t = this.target;
      const k = clamp(dt * (t.speed || 2.2), 0, 1);
      this.x = lerp(this.x, t.x, k);
      this.y = lerp(this.y, t.y, k);
      this.z = lerp(this.z, t.z, k);
      this.tilt = lerp(this.tilt, t.tilt, k);
      this.fov = lerp(this.fov, t.fov, k);

      if (this.shake > 0.05) {
        this.shakeX = rand(-1, 1) * this.shake;
        this.shakeY = rand(-1, 1) * this.shake;
        this.shake *= Math.pow(0.02, dt);
      } else {
        this.shake = 0; this.shakeX = 0; this.shakeY = 0;
      }
    }

    get focal() { return this.fov * this.viewH; }
    get cx() { return this.viewW / 2 + this.shakeX; }
    get cy() { return this.viewH * 0.52 + this.shakeY; }

    /** world (x lateral, y down the pitch, z up) -> screen */
    project(x, y, z) {
      const dx = x - this.x;
      const dy = y - this.y;
      const dz = z - this.z;
      const ct = Math.cos(this.tilt);
      const st = Math.sin(this.tilt);
      const depth = dy * ct - dz * st;
      const up = dz * ct + dy * st;
      if (depth < 0.45) return { visible: false, depth, scale: 0, sx: 0, sy: 0 };
      const s = this.focal / depth;
      return {
        visible: true,
        depth,
        scale: s,
        sx: this.cx + dx * s,
        sy: this.cy - up * s
      };
    }

    /** screen y of the horizon line */
    horizonY() {
      return this.cy - Math.tan(this.tilt) * this.focal;
    }
  }

  /* ============================================================
   * FIELD SETTINGS — positions relative to the centre of the pitch
   * (+x = off side for a right hander = screen right)
   * ========================================================== */
  const FIELD_POSITIONS = [
    { name: "Point",        x: 25,  y: -1 },
    { name: "Cover",        x: 27,  y: 13 },
    { name: "Mid Off",      x: 15,  y: 24 },
    { name: "Mid On",       x: -14, y: 25 },
    { name: "Mid Wicket",   x: -26, y: 13 },
    { name: "Square Leg",   x: -25, y: -2 },
    { name: "Long Off",     x: 26,  y: 46 },
    { name: "Long On",      x: -24, y: 48 },
    { name: "Deep Cover",   x: 46,  y: 22 }
  ];

  const DELIVERIES = {
    FAST:     { label: "Fast",        len: 6.2,  speed: 1.00, swing: 0.0,  spin: 0.0,  colour: "#ff6b6b" },
    INSWING:  { label: "In-swinger",  len: 6.6,  speed: 0.96, swing: -1.5, spin: 0.0,  colour: "#ffa502" },
    OUTSWING: { label: "Out-swinger", len: 6.8,  speed: 0.96, swing: 1.5,  spin: 0.0,  colour: "#ffa502" },
    BOUNCER:  { label: "Bouncer",     len: 9.6,  speed: 1.02, swing: 0.0,  spin: 0.0,  colour: "#ff4757" },
    YORKER:   { label: "Yorker",      len: 1.7,  speed: 1.02, swing: 0.0,  spin: 0.0,  colour: "#ff4757" },
    SLOWER:   { label: "Slower ball", len: 5.4,  speed: 0.74, swing: 0.4,  spin: 0.0,  colour: "#70a1ff" },
    OFFSPIN:  { label: "Off spin",    len: 5.0,  speed: 0.62, swing: 0.0,  spin: -2.4, colour: "#2ed573" },
    LEGSPIN:  { label: "Leg spin",    len: 4.8,  speed: 0.62, swing: 0.0,  spin: 2.4,  colour: "#2ed573" }
  };

  /* ============================================================
   * THE MATCH ENGINE
   * ========================================================== */
  class CricketGameplay {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
      this.options = options;

      this.cam = new BroadcastCamera();

      /* ---- match state (public: read by UIManager) ---- */
      this.match = null;
      this.playerTeam = null;
      this.opponentTeam = null;
      this.format = null;
      this.stage = "group";
      this.difficulty = {};
      this.currentScore = 0;
      this.currentWickets = 0;
      this.maxWickets = 5;
      this.totalDeliveries = 12;
      this.deliveriesBowled = 0;
      this.targetScore = 0;
      this.overBallsHistory = [];
      this.batterStats = { name: "Batter", runs: 0, balls: 0, fours: 0, sixes: 0 };
      this.isMatchOver = false;
      this.matchResult = null;
      this.paused = false;

      /* ---- engine state ---- */
      this.phase = "IDLE";       // IDLE | RUNUP | DELIVERY | SHOT | FIELDING | DEAD | OVER
      this.phaseClock = 0;
      this.simTime = 0;
      this.timers = [];
      this.aim = "STRAIGHT";
      this.lastOutcomeText = "";
      this.commentary = "Waiting for play…";

      this.ball = this.freshBall();
      this.trail = [];
      this.pitchMarker = null;
      this.bounceMarks = [];

      this.bowler = { x: 0, y: 30, phase: 0, action: "idle", speedKmh: 140, type: "FAST", armAngle: 0 };
      this.umpire = { x: 1.9, y: 21.6 };
      this.keeper = { x: 0, y: -1.9, z: 0 };

      this.striker = { x: BAT_X, y: 0.95, anim: "STANCE", animT: 0, swingT: 0, runPhase: 0, dive: 0 };
      this.nonStriker = { x: 1.1, y: 18.7, anim: "IDLE", runPhase: 0 };

      this.fielders = [];
      this.initFielders();

      this.timing = { active: false, quality: null, delta: 0, flightTime: 1.2, releaseAt: 0 };
      this.racing = null;
      this.throwObj = null;

      this.stumpsShattered = 0;
      this.chaser = null;
      this.particles = [];
      this.floatingTexts = [];
      this.confetti = [];
      this.flash = 0;

      this.crowd = this.buildCrowd();
      this.crowdExcitement = 0.25;

      /* ---- input ---- */
      this.keysDown = {};
      this.boundKeyDown = this.handleKeyDown.bind(this);
      this.boundKeyUp = this.handleKeyUp.bind(this);
      this.boundResize = () => this.resizeCanvas();
      window.addEventListener("keydown", this.boundKeyDown);
      window.addEventListener("keyup", this.boundKeyUp);
      window.addEventListener("resize", this.boundResize);

      this.animFrameId = null;
      this.lastTime = 0;
      this.resizeCanvas();
    }

    /* ---------------------------------------------------------
     * SETUP
     * ------------------------------------------------------- */
    freshBall() {
      return {
        x: 0, y: PITCH_LEN - 1.4, z: 2.0,
        vx: 0, vy: 0, vz: 0,
        spin: 0, swing: 0,
        bounced: 0, live: false, hit: false,
        radius: 0.0365, visible: false
      };
    }

    initFielders() {
      this.fielders = FIELD_POSITIONS.map((p, i) => ({
        id: i,
        name: p.name,
        homeX: p.x,
        homeY: p.y + CENTRE_Y,
        x: p.x,
        y: p.y + CENTRE_Y,
        tx: p.x,
        ty: p.y + CENTRE_Y,
        state: "idle",
        runPhase: Math.random() * 6,
        speed: 7.2,
        throwT: 0
      }));
      this.fielders.forEach(f => { f.x = f.homeX; f.y = f.homeY; });
    }

    buildCrowd() {
      const dots = [];
      const N = 1150;
      for (let i = 0; i < N; i++) {
        const a = rand(-Math.PI, Math.PI);
        const t = Math.random();
        dots.push({
          a,
          r: lerp(69, 91, t),
          z: lerp(2.0, 19.0, t) + rand(-0.4, 0.4),
          c: Math.random(),
          f: Math.random() * 10
        });
      }
      return dots;
    }

    resizeCanvas() {
      if (!this.canvas) return;
      const container = this.canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(320, Math.min(1120, rect.width || window.innerWidth));
      const height = clamp(width * 0.58, 300, 640);

      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = width + "px";
      this.canvas.style.height = height + "px";
      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      this.viewWidth = width;
      this.viewHeight = height;
      this.cam.viewW = width;
      this.cam.viewH = height;
    }

    destroy() {
      this.destroyed = true;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      this.timers = [];
      window.removeEventListener("keydown", this.boundKeyDown);
      window.removeEventListener("keyup", this.boundKeyUp);
      window.removeEventListener("resize", this.boundResize);
    }

    /* ---------------------------------------------------------
     * MATCH LIFECYCLE
     * ------------------------------------------------------- */
    startMatch({ match, playerTeam, opponentTeam, format = "ODI", stage = "group", onMatchComplete }) {
      this.match = match;
      this.playerTeam = playerTeam;
      this.opponentTeam = opponentTeam;
      this.format = window.CRICKET_CONFIG.formats[format] || window.CRICKET_CONFIG.formats.ODI;
      this.stage = stage;
      this.onMatchComplete = onMatchComplete;
      this.difficulty = window.TeamsManager.getMatchDifficulty(playerTeam.id, opponentTeam.id, stage);
      this.settings = window.StorageManager.loadSettings();

      this.totalDeliveries = this.format.playableDeliveries;
      this.maxWickets = this.format.wicketsPerInnings;
      this.deliveriesBowled = 0;
      this.currentScore = 0;
      this.currentWickets = 0;
      this.overBallsHistory = [];
      this.isMatchOver = false;
      this.matchResult = null;
      this.batterIndex = 0;

      const baseTarget = Math.round(
        this.totalDeliveries * (this.format.targetRunRateBase / 6) * 1.5 +
        (this.opponentTeam.ratings.batting - 80) * 0.8
      );
      this.targetScore = Math.max(16, baseTarget);

      const batter = this.playerTeam.players[0] || { name: "Opening Batter" };
      this.batterStats = { name: batter.name, runs: 0, balls: 0, fours: 0, sixes: 0 };

      this.bowlerName = this.pickBowlerName();
      this.cam.set("BOWLING", true);
      this.resizeCanvas();
      this.commentary = `${this.opponentTeam.name} take the field. ${this.batterStats.name} is on strike.`;

      this.phase = "IDLE";
      this.after(0.9, () => this.startNextDelivery());

      this.lastTime = performance.now();
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.loop(this.lastTime);
    }

    pickBowlerName() {
      const bowlers = (this.opponentTeam.players || []).filter(p => /Bowler|Pace|Spin/i.test(p.role + " " + p.type));
      const p = bowlers.length ? pick(bowlers) : pick(this.opponentTeam.players || [{ name: "Bowler" }]);
      return p.name;
    }

    /** schedule a callback in `sec` real seconds */
    after(sec, fn) {
      this.timers.push({ t: sec, fn });
    }

    runTimers(dt) {
      if (!this.timers.length) return;
      const due = [];
      const pending = [];
      this.timers.forEach(tm => {
        tm.t -= dt;
        (tm.t <= 0 ? due : pending).push(tm);
      });
      this.timers = pending;
      // callbacks may clear/replace the queue, so fire them afterwards
      due.forEach(tm => { try { tm.fn(); } catch (e) { console.error(e); } });
    }

    setPhase(p) {
      this.phase = p;
      this.phaseClock = 0;
    }

    /* ---------------------------------------------------------
     * DELIVERY
     * ------------------------------------------------------- */
    startNextDelivery() {
      if (this.isMatchOver) return;
      this.timers = [];
      if (this.deliveriesBowled >= this.totalDeliveries ||
          this.currentWickets >= this.maxWickets ||
          this.currentScore >= this.targetScore) {
        this.finishMatch();
        return;
      }

      // reset actors
      this.racing = null;
      this.throwObj = null;
      this.ballRecorded = false;
      this.trail = [];
      this.pitchMarker = null;
      this.ball = this.freshBall();
      this.striker.x = BAT_X; this.striker.y = 0.95; this.striker.anim = "STANCE"; this.striker.animT = 0; this.striker.dive = 0;
      this.nonStriker.x = 1.1; this.nonStriker.y = 18.7; this.nonStriker.anim = "IDLE";
      this.fielders.forEach(f => { f.state = "idle"; f.tx = f.homeX; f.ty = f.homeY; f.dropped = false; f.willCatch = false; });
      this.cam.set("BOWLING");
      this.aim = "STRAIGHT";

      // choose delivery
      const bowlQuality = this.opponentTeam.ratings.bowling;
      let types = ["FAST", "INSWING", "OUTSWING", "SLOWER", "OFFSPIN", "LEGSPIN"];
      if (Math.random() < 0.16) types = types.concat(["BOUNCER", "YORKER"]);
      this.bowler.type = pick(types);
      const d = DELIVERIES[this.bowler.type];

      const baseKmh = (132 + (bowlQuality - 80) * 1.15) * d.speed * this.format.baseSpeed;
      this.bowler.speedKmh = Math.round(clamp(baseKmh + rand(-4, 4), 72, 158));
      if (Math.random() < 0.25) this.bowlerName = this.pickBowlerName();

      this.bowler.y = 30.5;
      this.bowler.x = rand(-0.9, 0.9);
      this.bowler.phase = 0;
      this.bowler.action = "runup";

      this.setPhase("RUNUP");
      this.commentary = `${this.bowlerName} steams in — ${d.label}…`;
    }

    releaseBall() {
      const d = DELIVERIES[this.bowler.type];
      const v = (this.bowler.speedKmh / 3.6) * 0.66;   // arcade-scaled true speed (m/s)
      const relY = PITCH_LEN - 1.55;
      const relZ = 2.12;
      const relX = clamp(this.bowler.x * 0.45 + rand(-0.22, 0.22), -0.55, 0.55);

      // aim for a length — solve vz so it pitches at the chosen length
      const len = clamp(d.len + rand(-0.55, 0.55), 0.6, 11.5);
      const t1 = (relY - len) / v;
      const vz = (-relZ + 0.5 * G * t1 * t1) / t1;

      this.ball = this.freshBall();
      this.ball.x = relX;
      this.ball.y = relY;
      this.ball.z = relZ;
      this.ball.vy = -v;
      this.ball.vz = vz;
      this.ball.vx = rand(-0.12, 0.12);
      this.ball.swing = d.swing * rand(0.6, 1.25);
      this.ball.spin = d.spin * rand(0.6, 1.3);
      this.ball.live = true;
      this.ball.visible = true;
      this.ball.targetLen = len;

      this.pitchMarker = { x: relX + this.ball.swing * 0.22, y: len, life: 1.0, colour: d.colour };

      this.timing = {
        active: true,
        quality: null,
        delta: 0,
        flightTime: (relY - CONTACT_Y) / v / TIME_SCALE,
        releaseAt: performance.now()
      };

      this.bowler.action = "follow";
      this.setPhase("DELIVERY");
      if (window.cricketSound) window.cricketSound.playBatSwoosh();
    }

    /** seconds (sim) until the ball arrives at the contact plane */
    timeToContact() {
      if (!this.ball.live || this.ball.vy >= 0) return 99;
      return (this.ball.y - CONTACT_Y) / -this.ball.vy;
    }

    /* ---------------------------------------------------------
     * BATTING
     * ------------------------------------------------------- */
    setAim(dir) {
      if (!dir) return;
      this.aim = dir;
      this.striker.anim = this.striker.anim === "STANCE" ? "BACKLIFT" : this.striker.anim;
    }

    triggerShot(directionOverride = null) {
      if (directionOverride) this.aim = directionOverride;

      if (this.phase !== "DELIVERY" || !this.timing.active) {
        if (this.racing && this.racing.active) this.boostRun();
        return;
      }

      const ttc = this.timeToContact();
      const ideal = 0.075;
      const err = Math.abs(ttc - ideal);
      const w = clamp(this.difficulty.timingWindowModifier || 1, 0.7, 1.25);

      let quality;
      if (err < 0.030 * w) quality = "PERFECT";
      else if (err < 0.062 * w) quality = "GREAT";
      else if (err < 0.105 * w) quality = "GOOD";
      else if (err < 0.165 * w) quality = "POOR";
      else quality = "MISS";

      this.timing.active = false;
      this.timing.quality = quality;
      this.timing.delta = ttc - ideal;

      this.striker.anim = "SWING";
      this.striker.animT = 0;
      this.striker.shotAim = this.aim;

      if (quality === "MISS") {
        if (window.cricketSound) window.cricketSound.playBatSwoosh();
        this.afterSwingMiss();
      } else {
        this.after(Math.max(0, ttc / TIME_SCALE) * 0.55, () => this.connect(quality));
      }
    }

    afterSwingMiss() {
      // ball keeps travelling — bowled / beaten decided in physics update
      this.ball.beaten = true;
      this.batterStats.balls += 1;
      this.commentary = "Swing and a miss!";
    }

    connect(quality) {
      if (!this.ball.live || this.ball.hit) return;
      this.batterStats.balls += 1;
      this.ball.hit = true;
      this.ball.bounced = 0;
      this.ball.x = clamp(this.ball.x, -0.9, 0.9);
      this.ball.y = CONTACT_Y;
      this.ball.z = clamp(this.ball.z, 0.25, 1.75);

      const aim = this.aim || "STRAIGHT";
      const batRating = this.playerTeam.ratings.batting / 85;

      let speed, elev, azim;
      const base = { PERFECT: 33, GREAT: 27.5, GOOD: 21, POOR: 13.5 }[quality];
      speed = base * batRating * rand(0.93, 1.08) * (this.format.id === "T20" ? 1.06 : 1.0);

      if (aim === "LOFT")           { elev = rand(30, 38); azim = rand(-14, 14); }
      else if (aim === "OFF")       { elev = rand(7, 17);  azim = rand(26, 52); }
      else if (aim === "LEG")       { elev = rand(7, 18);  azim = rand(-52, -26); }
      else if (aim === "DEFENSIVE") { elev = rand(2, 7);   azim = rand(-40, 40); speed *= 0.33; }
      else                          { elev = rand(6, 16);  azim = rand(-16, 16); }

      if (quality === "POOR") {
        elev += rand(8, 26);           // top edge, skies it
        speed *= 0.82;
        azim += rand(-25, 25);
      }
      if (quality === "PERFECT" && aim !== "DEFENSIVE") elev += 2;

      const e = elev * Math.PI / 180;
      const a = azim * Math.PI / 180;
      const horiz = speed * Math.cos(e);
      this.ball.vx = horiz * Math.sin(a);
      this.ball.vy = horiz * Math.cos(a);
      this.ball.vz = speed * Math.sin(e);
      this.ball.swing = 0;
      this.ball.spin = 0;
      this.ball.runsOffered = 0;

      const label = {
        PERFECT: ["PERFECT TIMING!", "#ffd700"],
        GREAT: ["GREAT SHOT!", "#2ed573"],
        GOOD: ["GOOD CONTACT", "#70a1ff"],
        POOR: ["MISTIMED!", "#ffa502"]
      }[quality];
      this.addFloatingText(label[0], this.viewWidth / 2, this.viewHeight * 0.34, label[1], quality === "PERFECT" ? 34 : 26);

      if (window.cricketSound) window.cricketSound.playBatHit(quality);
      this.cameraShake(quality === "PERFECT" ? 9 : quality === "GREAT" ? 6 : 3);
      this.crowdExcitement = Math.min(1, this.crowdExcitement + (quality === "PERFECT" ? 0.7 : 0.35));
      this.spawnParticles(this.striker.x, CONTACT_Y, 0.9, "#fff6c9", 8);

      this.setPhase("SHOT");
      this.cam.set("SHOT");
      this.after(0.55, () => { if (this.phase === "SHOT") this.cam.set("WIDE"); });

      // predicted landing spot -> nearest fielder converges
      const land = this.predictLanding();
      this.ball.landing = land;
      this.assignChase(land.x, land.y, land.t);

      // give the batsmen a head start decision
      this.after(0.35, () => {
        if (this.phase === "SHOT" && !this.ball.boundary && !this.ball.caught && !this.racing) {
          this.startRacing();
        }
      });
    }

    predictLanding() {
      // simple ballistic prediction to z = 0
      const { x, y, z, vx, vy, vz } = this.ball;
      const disc = vz * vz + 2 * G * z;
      const t = (vz + Math.sqrt(Math.max(0, disc))) / G;
      return { x: x + vx * t, y: y + vy * t, t };
    }

    assignChase(lx, ly, flightT) {
      let best = null, bestD = 1e9;
      this.fielders.forEach(f => {
        const d = dist(f.x, f.y, lx, ly);
        if (d < bestD) { bestD = d; best = f; }
      });
      if (!best) return;
      this.chaser = best;
      best.state = "chase";
      best.tx = lx;
      best.ty = ly;
      const fieldRating = this.opponentTeam.ratings.fielding / 85;
      best.speed = 7.0 * fieldRating * clamp(this.difficulty.fielderSpeedModifier || 1, 0.85, 1.4);

      // can he get under it for a catch?
      const canReach = bestD / best.speed <= flightT * 0.92;
      const apex = this.ball.vz * this.ball.vz / (2 * G) + this.ball.z;
      const q = this.timing.quality;
      let catchChance = 0;
      if (canReach && apex > 4.0 && flightT > 1.0) {
        catchChance = q === "POOR" ? 0.48 : q === "GOOD" ? 0.24 : q === "GREAT" ? 0.11 : 0.05;
        catchChance *= clamp(fieldRating, 0.75, 1.25) * (this.difficulty.stageMultiplier || 1) * 0.92;
      }
      best.willCatch = Math.random() < catchChance;
      best.catchWindow = flightT;
      // nudge the neighbours so the field looks alive
      this.fielders.forEach(f => {
        if (f === best) return;
        f.state = "back";
        f.tx = f.homeX + (lx - f.homeX) * 0.12;
        f.ty = f.homeY + (ly - f.homeY) * 0.12;
        f.speed = 4.2;
      });
    }

    /* ---------------------------------------------------------
     * OUTCOMES
     * ------------------------------------------------------- */
    resolveDot(text, commentary) {
      this.recordBall(0, "0");
      this.addFloatingText(text, this.viewWidth / 2, this.viewHeight * 0.36, "#dfe4ea", 24);
      this.commentary = commentary || "No run.";
      this.setPhase("DEAD");
      this.after(1.15, () => this.startNextDelivery());
    }

    resolveBoundary(runs) {
      if (this.ball.resolved) return;
      this.ball.resolved = true;
      this.ball.boundary = true;
      this.racing = null;
      this.currentScore += runs;
      this.batterStats.runs += runs;
      if (runs === 4) this.batterStats.fours += 1; else this.batterStats.sixes += 1;
      this.recordBall(runs, String(runs));

      if (runs === 6) {
        this.addFloatingText("SIX! 🚀", this.viewWidth / 2, this.viewHeight * 0.26, "#ff4757", 46);
        this.commentary = "That is HUGE! Into the crowd for six!";
        if (window.cricketSound) { window.cricketSound.playSixFanfare(); window.cricketSound.playCrowdCheer("high", 2.2); }
        this.spawnConfetti(60);
        this.cameraShake(12);
        this.cam.set("SIX");
      } else {
        this.addFloatingText("FOUR! ⚡", this.viewWidth / 2, this.viewHeight * 0.26, "#1e90ff", 40);
        this.commentary = "Races away to the rope — four runs!";
        if (window.cricketSound) { window.cricketSound.playFourFanfare(); window.cricketSound.playCrowdCheer("medium", 1.6); }
        this.cameraShake(7);
      }
      this.crowdExcitement = 1;
      this.flash = 0.5;
      this.setPhase("DEAD");
      this.after(1.9, () => this.startNextDelivery());
    }

    resolveCatch(fielder) {
      if (this.ball.resolved) return;
      this.ball.resolved = true;
      this.ball.caught = true;
      this.racing = null;
      this.ball.live = false;
      fielder.state = "celebrate";
      this.commentary = `Caught at ${fielder.name}! ${this.batterStats.name} has to go.`;
      this.triggerWicket("CAUGHT! 🧤");
    }

    triggerWicket(text) {
      this.currentWickets += 1;
      this.recordBall(0, "W");
      this.addFloatingText(text, this.viewWidth / 2, this.viewHeight * 0.28, "#ff4757", 40);
      this.cameraShake(14);
      this.crowdExcitement = 1;
      this.striker.anim = "OUT";
      if (window.cricketSound) { window.cricketSound.playWicket(); window.cricketSound.playCrowdGasp(); }
      this.setPhase("DEAD");

      if (this.currentWickets < this.maxWickets) {
        this.batterIndex = Math.min((this.playerTeam.players || []).length - 1, this.currentWickets);
        const nb = (this.playerTeam.players || [])[this.batterIndex];
        this.after(1.9, () => {
          this.batterStats = {
            name: nb ? nb.name : `Batter ${this.currentWickets + 1}`,
            runs: 0, balls: 0, fours: 0, sixes: 0
          };
          this.commentary = `${this.batterStats.name} walks out to the middle.`;
          this.startNextDelivery();
        });
      } else {
        this.after(2.2, () => this.finishMatch());
      }
    }

    recordBall(runs, tag) {
      if (this.ballRecorded) return;          // one outcome per delivery, ever
      this.ballRecorded = true;
      this.overBallsHistory.push({ ballNum: this.overBallsHistory.length + 1, runs, tag });
      this.deliveriesBowled = this.overBallsHistory.length;
    }

    /* ---------------------------------------------------------
     * RUNNING BETWEEN THE WICKETS
     * ------------------------------------------------------- */
    startRacing() {
      if (this.racing || this.ball.resolved) return;
      const runMod = clamp(this.difficulty.runningSpeedModifier || 1, 0.85, 1.25);
      const autoSprint = this.settings && this.settings.autoSprint;

      this.racing = {
        active: true,
        state: "running",        // running | deciding
        runsCompleted: 0,
        dir: 1,                  // +1 striker runs away from the camera
        startY: this.striker.y,
        baseSpeed: 7.4 * runMod * (autoSprint ? 1.08 : 1) * (this.format.racingMultiplier || 1),
        boost: 0,
        boostTaps: 0,
        diving: false,
        offerTurn: false,
        decideTimer: 0,
        wantsAnother: false,
        finished: false
      };
      this.striker.anim = "RUN";
      this.nonStriker.anim = "RUN";
      this.commentary = "They're coming back for the run!";
      this.addFloatingText(
        `RUN!  [ ${window.ControlsManager.labelFor("RUN")} / SPACE ]`,
        this.viewWidth / 2, this.viewHeight * 0.42, "#fffa65", 24
      );
      if (window.cricketSound) window.cricketSound.playFootstep();
      this.setPhase("FIELDING");
    }

    boostRun() {
      if (!this.racing || !this.racing.active) return;
      this.racing.boost = Math.min(3.4, this.racing.boost + 0.85);
      this.racing.boostTaps += 1;
      if (this.racing.boostTaps % 2 === 0 && window.cricketSound) window.cricketSound.playFootstep();
      this.spawnParticles(this.striker.x, this.striker.y, 0.05, "#e8e8e8", 3);
    }

    triggerDive() {
      if (!this.racing || !this.racing.active || this.racing.diving) return;
      this.racing.diving = true;
      this.striker.dive = 1;
      this.racing.boost = Math.min(5.0, this.racing.boost + 2.4);
      this.addFloatingText("DIVE! 💨", this.viewWidth / 2, this.viewHeight * 0.46, "#00d2d3", 24);
      if (window.cricketSound) window.cricketSound.playFootstep();
    }

    turnForSecondRun() {
      if (!this.racing || !this.racing.active) return;
      if (!this.racing.offerTurn) return;
      this.racing.offerTurn = false;
      this.racing.wantsAnother = true;
      this.addFloatingText("GOING AGAIN! ⚡", this.viewWidth / 2, this.viewHeight * 0.4, "#ff6b81", 24);
    }

    completeRacing(safe, runs) {
      if (!this.racing || this.racing.finished) return;
      this.racing.finished = true;
      this.racing.active = false;

      if (!safe) {
        this.commentary = "Direct hit! The batsman is well short of his ground!";
        this.triggerWicket("RUN OUT! 🔴");
        return;
      }

      this.currentScore += runs;
      this.batterStats.runs += runs;
      this.recordBall(runs, String(runs));
      if (runs > 0) {
        this.addFloatingText(`SAFE! +${runs} RUN${runs > 1 ? "S" : ""}`, this.viewWidth / 2, this.viewHeight * 0.34, "#2ed573", 28);
        this.commentary = `${runs} run${runs > 1 ? "s" : ""} taken. Good running.`;
        if (window.cricketSound) window.cricketSound.playSafeChime();
      } else {
        this.commentary = "No run — sharp work in the field.";
      }
      this.setPhase("DEAD");
      this.after(1.25, () => this.startNextDelivery());
    }

    startThrow(fromX, fromY, targetY) {
      const fieldRating = this.opponentTeam.ratings.fielding / 85;
      const speed = 25 * fieldRating * clamp(this.difficulty.fielderSpeedModifier || 1, 0.85, 1.4);
      const tx = 0, ty = targetY;
      const d = dist(fromX, fromY, tx, ty);
      const t = Math.max(0.25, d / speed);
      this.throwObj = {
        x0: fromX, y0: fromY, x1: tx, y1: ty,
        t: 0, dur: t, height: clamp(d * 0.07, 0.8, 3.2), targetY
      };
      this.ball.live = false;
      if (window.cricketSound) window.cricketSound.playWhistle();
    }

    /* ---------------------------------------------------------
     * MATCH RESULT
     * ------------------------------------------------------- */
    finishMatch() {
      if (this.isMatchOver) return;
      this.isMatchOver = true;
      this.setPhase("OVER");
      const isPlayerWin = this.currentScore >= this.targetScore;
      const margin = isPlayerWin
        ? `${this.maxWickets - this.currentWickets} wickets`
        : `${this.targetScore - this.currentScore} runs`;
      const winnerId = isPlayerWin ? this.playerTeam.id : this.opponentTeam.id;
      const winnerName = isPlayerWin ? this.playerTeam.name : this.opponentTeam.name;
      const oversDisplay = (this.deliveriesBowled / (this.totalDeliveries / this.format.maxOvers)).toFixed(1);

      this.matchResult = {
        isPlayerWin, winnerId, winnerName,
        playerScore: { runs: this.currentScore, wickets: this.currentWickets, overs: parseFloat(oversDisplay) },
        opponentScore: { runs: this.targetScore - 1, wickets: Math.min(this.maxWickets - 1, 4), overs: this.format.maxOvers },
        marginText: `${winnerName} won by ${margin}`,
        batterStats: this.batterStats,
        playerTeam: this.playerTeam,
        opponentTeam: this.opponentTeam,
        stage: this.stage,
        format: this.format.id,
        match: this.match
      };

      if (isPlayerWin && window.cricketSound) window.cricketSound.playTrophyFanfare();
      if (this.onMatchComplete) this.onMatchComplete(this.matchResult);
    }

    /* ---------------------------------------------------------
     * INPUT
     * ------------------------------------------------------- */
    handleKeyDown(e) {
      if (this.isMatchOver) return;
      this.keysDown[e.code] = true;
      const CM = window.ControlsManager;
      const action = CM ? CM.actionFor(e.code) : null;

      // SPACE is a permanent, non-rebindable helper
      if (e.code === "Space") {
        e.preventDefault();
        if (this.racing && this.racing.active) this.boostRun();
        else this.triggerShot();
        return;
      }
      if (!action) return;
      if (e.code.startsWith("Arrow")) e.preventDefault();

      switch (action) {
        case "HIT": this.triggerShot(); break;
        case "RUN": this.boostRun(); break;
        case "DIVE": this.triggerDive(); break;
        case "TURN": this.turnForSecondRun(); break;
        case "AIM_OFF": this.setAim("OFF"); break;
        case "AIM_LEG": this.setAim("LEG"); break;
        case "AIM_LOFT": this.setAim("LOFT"); break;
        case "AIM_BLOCK": this.setAim("DEFENSIVE"); break;
        default: break;
      }
    }

    handleKeyUp(e) { this.keysDown[e.code] = false; }

    /* ---------------------------------------------------------
     * MAIN LOOP
     * ------------------------------------------------------- */
    loop(now) {
      if (this.destroyed) return;
      const dtRaw = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = clamp(dtRaw, 0, 0.05);

      this.update(dt);
      if (this.destroyed) return;
      this.render();
      this.animFrameId = requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
      this.runTimers(dt);
      this.phaseClock += dt;
      this.cam.update(dt);
      const sdt = dt * TIME_SCALE;   // simulation seconds
      this.simTime += sdt;

      this.crowdExcitement = Math.max(0.22, this.crowdExcitement - dt * 0.25);
      if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.8);

      if (this.phase === "RUNUP") this.updateRunUp(sdt);
      if (this.phase === "DELIVERY") this.updateDelivery(sdt);
      if (this.phase === "SHOT" || this.phase === "FIELDING") this.updateShot(sdt);

      this.updateFielders(sdt);
      this.updateRacing(sdt);
      this.updateThrow(sdt);
      this.updateActors(dt, sdt);
      this.updateFX(dt);

      if (this.pitchMarker) this.pitchMarker.life = Math.max(0, this.pitchMarker.life - dt * 0.55);
      this.bounceMarks.forEach(m => (m.life -= dt * 0.25));
      this.bounceMarks = this.bounceMarks.filter(m => m.life > 0);

      // watchdog — never let a delivery hang
      if ((this.phase === "SHOT" || this.phase === "FIELDING") && this.phaseClock > 16) {
        if (this.racing && this.racing.active) this.completeRacing(true, this.racing.runsCompleted);
        else if (!this.ball.resolved) this.resolveDot("BALL DEAD", "The umpire calls it dead ball.");
      }
    }

    updateRunUp(sdt) {
      this.bowler.phase += sdt * 1.45;
      const p = clamp(this.bowler.phase, 0, 1);
      this.bowler.y = lerp(30.5, PITCH_LEN - 1.2, p * p * (3 - 2 * p));
      this.bowler.x = lerp(this.bowler.x, 0.35, sdt * 1.6);
      if (p >= 1) {
        this.bowler.phase = 1;
        this.releaseBall();
      }
    }

    updateDelivery(sdt) {
      const b = this.ball;
      if (!b.live) return;

      // integrate with sub-steps for accuracy at high speed
      const steps = 3;
      const h = sdt / steps;
      for (let i = 0; i < steps; i++) {
        b.vx += (b.swing || 0) * h;             // aerodynamic swing
        b.vz -= G * h;
        b.x += b.vx * h;
        b.y += b.vy * h;
        b.z += b.vz * h;

        if (b.z <= b.radius && b.vz < 0 && b.bounced === 0) {
          b.z = b.radius;
          b.vz = -b.vz * 0.55;
          b.vy *= 0.82;
          b.bounced = 1;
          b.vx += (b.spin || 0) * 0.42;          // spin deviation off the deck
          this.bounceMarks.push({ x: b.x, y: b.y, life: 1 });
          this.spawnParticles(b.x, b.y, 0.05, "#d8c79a", 7);
          if (window.cricketSound) window.cricketSound.playBallBounce();
        } else if (b.z <= b.radius && b.vz < 0) {
          b.z = b.radius;
          b.vz = -b.vz * 0.45;
          b.vy *= 0.9;
        }
      }

      this.trail.push({ x: b.x, y: b.y, z: b.z });
      if (this.trail.length > 16) this.trail.shift();

      // past the bat?
      if (b.y < CONTACT_Y - 0.15 && this.timing.active) {
        this.timing.active = false;
        this.timing.quality = "MISS";
        this.batterStats.balls += 1;
        b.beaten = true;
      }

      // stumps?
      if (b.y <= 0.02 && !b.resolved) {
        const hitStumps = Math.abs(b.x) < STUMP_HALF + 0.05 && b.z < STUMP_H + 0.04;
        if (b.beaten || this.timing.quality === "MISS") {
          if (hitStumps) {
            b.resolved = true;
            b.live = false;
            this.stumpsShattered = 1;
            this.commentary = `Timber! ${this.bowlerName} knocks him over!`;
            this.triggerWicket("BOWLED! 💥");
            return;
          }
        }
      }

      // gone through to the keeper
      if (b.y < -1.6 && !b.resolved) {
        b.resolved = true;
        b.live = false;
        if (this.timing.quality === "MISS" || b.beaten) {
          this.resolveDot("BEATEN! 💨", "Beaten all ends up — the keeper takes it.");
        } else {
          this.resolveDot("NO RUN", "Played into the ground, no run.");
        }
      }
    }

    updateShot(sdt) {
      const b = this.ball;
      if (!b.live) return;

      const steps = 3;
      const h = sdt / steps;
      for (let i = 0; i < steps; i++) {
        b.vz -= G * h;
        b.x += b.vx * h;
        b.y += b.vy * h;
        b.z += b.vz * h;

        if (b.z <= b.radius) {
          b.z = b.radius;
          if (b.vz < -0.4) {
            b.vz = -b.vz * 0.42;
            b.vx *= 0.72; b.vy *= 0.72;
            b.bounced += 1;
            if (b.bounced === 1) this.bounceMarks.push({ x: b.x, y: b.y, life: 1 });
          } else {
            b.vz = 0;
            const fr = Math.pow(0.35, h);   // rolling friction
            b.vx *= fr; b.vy *= fr;
          }
        }
      }

      this.trail.push({ x: b.x, y: b.y, z: b.z });
      if (this.trail.length > 22) this.trail.shift();

      if (b.resolved) return;   // boundary already given — let the ball sail on

      // boundary?
      const dCentre = dist(b.x, b.y, 0, CENTRE_Y);
      if (dCentre >= BOUNDARY_R) {
        this.resolveBoundary(b.bounced === 0 ? 6 : 4);
        return;
      }

      // catch / collection
      for (const f of this.fielders) {
        const d = dist(b.x, b.y, f.x, f.y);
        if (b.bounced === 0 && b.z > 0.35 && b.z < 3.4 && d < 1.9 && f.state === "chase") {
          if (f.willCatch) { this.resolveCatch(f); return; }
          if (!f.dropped && b.z < 2.6) {
            f.dropped = true;
            this.addFloatingText("DROPPED! 😱", this.viewWidth / 2, this.viewHeight * 0.3, "#ffa502", 26);
            this.commentary = `Put down by ${f.name}! That's a huge let-off.`;
            if (window.cricketSound) window.cricketSound.playCrowdGasp();
            b.vz = Math.abs(b.vz) * 0.25 + 1.2;
            b.vx *= 0.3; b.vy *= 0.3;
          }
        }
        if (d < 1.35 && b.z < 2.2 && (f.state === "chase" || f.state === "back") && !this.throwObj) {
          // collected
          f.state = "throw";
          f.throwT = 0;
          const targetY = this.racing && this.racing.dir > 0 ? PITCH_LEN : 0;
          this.startThrow(f.x, f.y, targetY);
          this.commentary = `${f.name} swoops in and fires it back!`;
          return;
        }
      }

      // ball has died in the outfield with nobody near
      if (Math.hypot(b.vx, b.vy) < 0.6 && b.z <= b.radius + 0.01 && !this.throwObj && this.phaseClock > 2) {
        const f = this.chaser;
        if (f) { f.tx = b.x; f.ty = b.y; f.state = "chase"; }
      }
    }

    updateFielders(sdt) {
      this.fielders.forEach(f => {
        if (f.state === "chase" && this.ball.live && !this.ball.resolved) {
          f.tx = this.ball.landing && this.ball.z > 1.2 ? this.ball.landing.x : this.ball.x;
          f.ty = this.ball.landing && this.ball.z > 1.2 ? this.ball.landing.y : this.ball.y;
        }
        const dx = f.tx - f.x;
        const dy = f.ty - f.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.12) {
          const step = Math.min(d, (f.speed || 6) * sdt);
          f.x += (dx / d) * step;
          f.y += (dy / d) * step;
          f.runPhase += sdt * 9;
          f.moving = true;
        } else {
          f.moving = false;
        }
        if (f.state === "throw") f.throwT += sdt;
      });
    }

    updateThrow(sdt) {
      const th = this.throwObj;
      if (!th) return;
      th.t += sdt;
      const p = clamp(th.t / th.dur, 0, 1);
      this.ball.x = lerp(th.x0, th.x1, p);
      this.ball.y = lerp(th.y0, th.y1, p);
      this.ball.z = 1.0 + Math.sin(p * Math.PI) * th.height;
      this.ball.visible = true;
      this.trail.push({ x: this.ball.x, y: this.ball.y, z: this.ball.z });
      if (this.trail.length > 18) this.trail.shift();

      if (p >= 1) {
        this.throwObj = null;
        const r = this.racing;
        this.spawnParticles(0, th.targetY, 0.4, "#ffe9a8", 6);

        if (r && r.active && !this.ball.resolved) {
          // which end is under threat right now?
          const dangerEnd = r.dir > 0 ? PITCH_LEN : 0;
          const hitsDangerEnd = Math.abs(th.targetY - dangerEnd) < 6;
          const home = this.strikerHome() || r.state === "deciding";

          if (home || !hitsDangerEnd) {
            this.stumpsShattered = 0.7;
            this.addFloatingText("SAFE! 🟢", this.viewWidth / 2, this.viewHeight * 0.36, "#2ed573", 30);
            const bonus = (r.state === "running" && !home) ? 0 : 0;
            this.completeRacing(true, r.runsCompleted + bonus);
          } else {
            // how close was it?
            const distToCrease = r.dir > 0
              ? (PITCH_LEN - CREASE) - this.striker.y
              : this.striker.y - CREASE;
            this.stumpsShattered = 1;
            if (distToCrease < 0.55) {
              this.addFloatingText("JUST MADE IT! 🟢", this.viewWidth / 2, this.viewHeight * 0.34, "#2ed573", 28);
              this.completeRacing(true, r.runsCompleted + 1);
            } else {
              this.completeRacing(false, r.runsCompleted);
            }
          }
        } else if (!this.ball.resolved) {
          this.resolveDot("FIELDED", "Safely gathered — no run.");
        }
      }
    }

    /** true when the striker is safely home at either crease */
    strikerHome() {
      return this.striker.y >= PITCH_LEN - CREASE - 0.15 || this.striker.y <= CREASE + 0.15;
    }

    updateRacing(sdt) {
      const r = this.racing;
      if (!r || !r.active) return;

      if (r.state === "deciding") {
        r.decideTimer -= sdt;
        this.striker.runPhase += sdt * 3;
        if (r.wantsAnother) {
          r.wantsAnother = false;
          r.offerTurn = false;
          r.dir *= -1;
          r.state = "running";
          r.boost = 1.2;
          this.striker.anim = "RUN";
          this.commentary = "They're going back for another!";
        } else if (r.decideTimer <= 0) {
          r.offerTurn = false;
          this.completeRacing(true, r.runsCompleted);
        }
        return;
      }

      const speed = r.baseSpeed + r.boost;
      r.boost = Math.max(0, r.boost - sdt * 2.6);

      const target = r.dir > 0 ? PITCH_LEN - CREASE + 0.3 : CREASE - 0.25;
      this.striker.y += r.dir * speed * sdt;
      this.nonStriker.y -= r.dir * speed * sdt;
      this.striker.runPhase += sdt * (7 + speed * 0.7);
      this.nonStriker.runPhase += sdt * (7 + speed * 0.7);
      this.striker.x = lerp(this.striker.x, -1.35, sdt * 4);
      this.nonStriker.x = lerp(this.nonStriker.x, 1.35, sdt * 4);
      if (this.striker.dive > 0) this.striker.dive = Math.min(1, this.striker.dive + sdt * 3);

      const reached = r.dir > 0 ? this.striker.y >= target : this.striker.y <= target;
      if (reached) {
        r.runsCompleted += 1;
        this.striker.y = target;
        this.striker.dive = 0;
        r.diving = false;
        this.striker.anim = "STANCE";

        const ballFar = dist(this.ball.x, this.ball.y, 0, CENTRE_Y) > 22;
        const throwInAir = !!this.throwObj;
        const canGoAgain = r.runsCompleted < 3 && !this.ball.resolved && (ballFar || !throwInAir);

        if (canGoAgain) {
          r.state = "deciding";
          r.offerTurn = true;
          r.decideTimer = 0.8;
          this.addFloatingText(
            `[ ${window.ControlsManager.labelFor("TURN")} ] GO AGAIN?`,
            this.viewWidth / 2, this.viewHeight * 0.44, "#ffd700", 22
          );
        } else {
          this.completeRacing(true, r.runsCompleted);
        }
      }
    }

    updateActors(dt, sdt) {
      // batsman animation
      const st = this.striker;
      st.animT += dt;
      if (st.anim === "SWING" && st.animT > 0.55) st.anim = this.racing ? "RUN" : "STANCE";
      if (st.anim === "STANCE" || st.anim === "BACKLIFT") st.runPhase = 0;

      if (this.phase === "RUNUP") this.bowler.runPhase = (this.bowler.runPhase || 0) + sdt * 11;
      if (this.phase === "DELIVERY") {
        this.bowler.y = lerp(this.bowler.y, PITCH_LEN - 3.2, sdt * 1.6);
      }
      if (this.stumpsShattered > 0) this.stumpsShattered = Math.max(0, this.stumpsShattered - dt * 0.5);
    }

    updateFX(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vz -= G * dt * 0.5;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt);
        p.life -= dt * 1.4;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const f = this.floatingTexts[i];
        f.y -= dt * 22;
        f.life -= dt * 0.75;
        if (f.life <= 0) this.floatingTexts.splice(i, 1);
      }
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 240 * dt;
        c.rot += c.rotS * dt;
        c.life -= dt * 0.4;
        if (c.life <= 0) this.confetti.splice(i, 1);
      }
    }

    cameraShake(v) {
      const s = this.settings || window.StorageManager.loadSettings();
      if (s && s.reducedMotion) return;
      this.cam.shake = Math.max(this.cam.shake, v);
    }

    addFloatingText(text, x, y, colour = "#ffd700", size = 22) {
      let ty = y;
      let guard = 0;
      while (guard++ < 8 && this.floatingTexts.some(f => Math.abs(f.y - ty) < size + 12)) {
        ty += size + 16;
      }
      this.floatingTexts.push({ text, x, y: ty, colour, size, life: 1 });
    }

    spawnParticles(wx, wy, wz, colour, count) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: wx, y: wy, z: wz,
          vx: rand(-2.2, 2.2), vy: rand(-2.2, 2.2), vz: rand(0.6, 3.4),
          colour, size: rand(0.02, 0.06), life: 1
        });
      }
    }

    spawnConfetti(count = 50) {
      const colours = ["#ffd700", "#ff4757", "#2ed573", "#1e90ff", "#ffffff", "#ff9ff3"];
      for (let i = 0; i < count; i++) {
        this.confetti.push({
          x: rand(0, this.viewWidth), y: rand(-80, 10),
          vx: rand(-40, 40), vy: rand(40, 150),
          size: rand(5, 11), colour: pick(colours),
          rot: rand(0, 6.28), rotS: rand(-6, 6), life: 1.6
        });
      }
    }

    /* =========================================================
     * RENDERING
     * ======================================================= */
    render() {
      const ctx = this.ctx;
      if (!ctx) return;
      const w = this.viewWidth, h = this.viewHeight;
      ctx.clearRect(0, 0, w, h);

      this.drawSky(ctx, w, h);
      this.drawGround(ctx, w, h);
      this.drawStands(ctx, w, h);
      this.drawBoundary(ctx);
      this.drawPitch(ctx);
      this.drawBounceMarks(ctx);
      this.drawPitchMarker(ctx);

      this.drawActors(ctx);
      this.drawBall(ctx);
      this.drawParticles(ctx);

      this.drawVignette(ctx, w, h);

      if (this.phase === "DELIVERY" && this.timing.active) this.drawTimingMeter(ctx, w, h);
      if (this.racing && this.racing.active) this.drawRacingHUD(ctx, w, h);
      this.drawAimBadge(ctx, w, h);
      this.drawBroadcastOverlay(ctx, w, h);
      this.drawFloatingTexts(ctx);
      this.drawConfetti(ctx);

      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this.flash * 0.35})`;
        ctx.fillRect(0, 0, w, h);
      }
    }

    /* ---------- sky & stadium ---------- */
    drawSky(ctx, w, h) {
      const hz = this.cam.horizonY();
      const g = ctx.createLinearGradient(0, 0, 0, Math.max(hz, 10));
      g.addColorStop(0, "#050a1c");
      g.addColorStop(0.55, "#0d1b3d");
      g.addColorStop(1, "#1d3160");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, Math.max(hz + 4, 0));

      // floodlight haze
      const haze = ctx.createRadialGradient(w * 0.5, hz, 10, w * 0.5, hz, w * 0.7);
      haze.addColorStop(0, "rgba(180,215,255,0.18)");
      haze.addColorStop(1, "rgba(180,215,255,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, Math.max(hz + 4, 0));
    }

    drawStands(ctx, w, h) {
      const cam = this.cam;
      const segs = 52;
      const a0 = -Math.PI, a1 = Math.PI;

      // three tiers: [innerR, outerR, z0, z1, baseColour]
      const tiers = [
        [67.5, 78, 1.2, 8.0, "#1d2b46"],
        [78, 88, 8.0, 15.0, "#16223a"],
        [88, 96, 15.0, 21.0, "#101a2e"]
      ];

      tiers.forEach((tier, ti) => {
        const [R1, R2, Z1, Z2, base] = tier;
        for (let i = 0; i < segs; i++) {
          const aA = lerp(a0, a1, i / segs);
          const aB = lerp(a0, a1, (i + 1) / segs);
          const p1 = cam.project(Math.sin(aA) * R1, CENTRE_Y + Math.cos(aA) * R1, Z1);
          const p2 = cam.project(Math.sin(aB) * R1, CENTRE_Y + Math.cos(aB) * R1, Z1);
          const p3 = cam.project(Math.sin(aB) * R2, CENTRE_Y + Math.cos(aB) * R2, Z2);
          const p4 = cam.project(Math.sin(aA) * R2, CENTRE_Y + Math.cos(aA) * R2, Z2);
          if (!p1.visible || !p2.visible || !p3.visible || !p4.visible) continue;
          if (Math.max(p1.sx, p2.sx) < -240 || Math.min(p1.sx, p2.sx) > w + 240) continue;

          const grad = ctx.createLinearGradient(0, p4.sy, 0, p1.sy);
          grad.addColorStop(0, shade(base, -0.25));
          grad.addColorStop(0.5, shade(base, 0.12));
          grad.addColorStop(1, shade(base, 0.3));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
          ctx.closePath(); ctx.fill();

          // vertical aisle every 4 segments
          if (i % 4 === 0) {
            ctx.strokeStyle = "rgba(0,0,0,0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p4.sx, p4.sy); ctx.stroke();
          }
        }

        // concourse band on top of each tier
        const bandPts = [];
        for (let i = 0; i <= segs; i++) {
          const a = lerp(a0, a1, i / segs);
          bandPts.push([Math.sin(a) * R2, CENTRE_Y + Math.cos(a) * R2, Z2]);
        }
        ctx.strokeStyle = ti === 2 ? "rgba(120,170,255,0.30)" : "rgba(160,200,255,0.20)";
        ctx.lineWidth = 2;
        this.worldPolyline(ctx, bandPts, false);
        ctx.stroke();
      });

      // crowd
      const t = performance.now() / 1000;
      const ex = this.crowdExcitement;
      this.crowd.forEach(d => {
        const wobble = Math.sin(t * (2 + ex * 6) + d.f) * ex * 0.55;
        const p = cam.project(Math.sin(d.a) * d.r, CENTRE_Y + Math.cos(d.a) * d.r, d.z + wobble);
        if (!p.visible || p.sx < -20 || p.sx > w + 20) return;
        const size = Math.max(0.9, p.scale * 0.26);
        const c = d.c;
        ctx.fillStyle = c > 0.86 ? "#ffe08a" : c > 0.64 ? "#e6eeff" : c > 0.42 ? "#98a8cc" : c > 0.2 ? "#5b6a94" : "#c3cde6";
        ctx.fillRect(p.sx, p.sy, size, size * 1.4);
      });

      // camera-flash sparkles
      for (let k = 0; k < 2; k++) {
        if (Math.random() < 0.3 + ex * 0.5) {
          const d = pick(this.crowd);
          const p = cam.project(Math.sin(d.a) * d.r, CENTRE_Y + Math.cos(d.a) * d.r, d.z);
          if (p.visible) {
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(1.2, p.scale * 0.4), 0, 6.3); ctx.fill();
          }
        }
      }

      // roof + underside lighting
      for (let i = 0; i < segs; i++) {
        const aA = lerp(a0, a1, i / segs);
        const aB = lerp(a0, a1, (i + 1) / segs);
        const p1 = cam.project(Math.sin(aA) * 96, CENTRE_Y + Math.cos(aA) * 96, 21);
        const p2 = cam.project(Math.sin(aB) * 96, CENTRE_Y + Math.cos(aB) * 96, 21);
        const p3 = cam.project(Math.sin(aB) * 108, CENTRE_Y + Math.cos(aB) * 108, 27.5);
        const p4 = cam.project(Math.sin(aA) * 108, CENTRE_Y + Math.cos(aA) * 108, 27.5);
        if (!p1.visible || !p2.visible || !p3.visible || !p4.visible) continue;
        ctx.fillStyle = i % 2 === 0 ? "#080d1a" : "#0b1120";
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath(); ctx.fill();
      }
      const lipPts = [];
      for (let i = 0; i <= segs; i++) {
        const a = lerp(a0, a1, i / segs);
        lipPts.push([Math.sin(a) * 96, CENTRE_Y + Math.cos(a) * 96, 21]);
      }
      ctx.strokeStyle = "rgba(180,220,255,0.45)";
      ctx.lineWidth = 2.5;
      this.worldPolyline(ctx, lipPts, false);
      ctx.stroke();

      this.drawFloodlights(ctx);
      this.drawSightscreen(ctx);
      this.drawBigScreen(ctx);
    }

    drawFloodlights(ctx) {
      const cam = this.cam;
      [-0.34, -0.12, 0.12, 0.34, -0.66, 0.66].forEach(k => {
        const a = k * Math.PI;
        const R = 112;
        const bx = Math.sin(a) * R, by = CENTRE_Y + Math.cos(a) * R;
        const base = cam.project(bx, by, 0);
        const top = cam.project(bx, by, 46);
        if (!base.visible || !top.visible) return;
        const wid = Math.max(2, top.scale * 2.4);

        ctx.strokeStyle = "#1b2640";
        ctx.lineWidth = wid;
        ctx.beginPath(); ctx.moveTo(base.sx, base.sy); ctx.lineTo(top.sx, top.sy); ctx.stroke();

        // lamp bank
        const panelW = Math.max(10, top.scale * 12);
        const panelH = Math.max(6, top.scale * 7);
        ctx.fillStyle = "#0d1526";
        ctx.fillRect(top.sx - panelW / 2, top.sy - panelH, panelW, panelH);
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 5; c++) {
            ctx.fillStyle = "rgba(255,252,220,0.92)";
            ctx.fillRect(
              top.sx - panelW / 2 + 1 + c * (panelW / 5),
              top.sy - panelH + 1 + r * (panelH / 3),
              Math.max(1, panelW / 5 - 1.5),
              Math.max(1, panelH / 3 - 1.5)
            );
          }
        }
        const glow = ctx.createRadialGradient(top.sx, top.sy - panelH / 2, 2, top.sx, top.sy - panelH / 2, panelW * 3.4);
        glow.addColorStop(0, "rgba(255,250,210,0.5)");
        glow.addColorStop(1, "rgba(255,250,210,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(top.sx, top.sy - panelH / 2, panelW * 3.4, 0, 6.3); ctx.fill();
      });
    }

    drawSightscreen(ctx) {
      const cam = this.cam;
      const yy = CENTRE_Y + 66.5;
      const pts = [
        cam.project(-11, yy, 1.2), cam.project(11, yy, 1.2),
        cam.project(11, yy, 10.5), cam.project(-11, yy, 10.5)
      ];
      if (pts.some(p => !p.visible)) return;
      // frame
      ctx.fillStyle = "#2a3242";
      ctx.beginPath();
      ctx.moveTo(pts[0].sx - 4, pts[0].sy + 3);
      ctx.lineTo(pts[1].sx + 4, pts[1].sy + 3);
      ctx.lineTo(pts[2].sx + 4, pts[2].sy - 3);
      ctx.lineTo(pts[3].sx - 4, pts[3].sy - 3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8ecef";
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#9fb0bd"; ctx.lineWidth = 1; ctx.stroke();
    }

    drawBigScreen(ctx) {
      const cam = this.cam;
      const a = -0.255 * Math.PI;
      const R = 86;
      const cxw = Math.sin(a) * R, cyw = CENTRE_Y + Math.cos(a) * R;
      const p1 = cam.project(cxw - 9, cyw, 8), p2 = cam.project(cxw + 9, cyw, 8);
      const p3 = cam.project(cxw + 9, cyw, 18), p4 = cam.project(cxw - 9, cyw, 18);
      if ([p1, p2, p3, p4].some(p => !p.visible)) return;
      ctx.fillStyle = "#04070f";
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
      ctx.closePath(); ctx.fill();
      const wpx = Math.abs(p2.sx - p1.sx), hpx = Math.abs(p1.sy - p4.sy);
      if (wpx > 26 && this.playerTeam) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath(); ctx.clip();
        const grad = ctx.createLinearGradient(p4.sx, p4.sy, p2.sx, p2.sy);
        grad.addColorStop(0, "#132a4a"); grad.addColorStop(1, "#0a1830");
        ctx.fillStyle = grad; ctx.fill();
        ctx.fillStyle = "#7ef7c0";
        ctx.font = `bold ${Math.max(7, hpx * 0.26)}px "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`${this.playerTeam.shortCode} ${this.currentScore}-${this.currentWickets}`,
          (p1.sx + p2.sx) / 2, p4.sy + hpx * 0.45);
        ctx.fillStyle = "#ffd76b";
        ctx.font = `bold ${Math.max(6, hpx * 0.18)}px "Segoe UI", sans-serif`;
        ctx.fillText(`TARGET ${this.targetScore}`, (p1.sx + p2.sx) / 2, p4.sy + hpx * 0.78);
        ctx.restore();
      }
    }

    /* ---------- the field ---------- */
    drawGround(ctx, w, h) {
      const cam = this.cam;
      const yStart = Math.max(cam.y + 1.3, -26);
      const yEnd = CENTRE_Y + 96;
      const band = 5.5;
      const xSpan = 120;

      for (let y = yStart; y < yEnd; y += band) {
        const p1 = cam.project(-xSpan, y, 0);
        const p2 = cam.project(xSpan, y, 0);
        const p3 = cam.project(xSpan, Math.min(y + band, yEnd), 0);
        const p4 = cam.project(-xSpan, Math.min(y + band, yEnd), 0);
        if (!p1.visible || !p4.visible) continue;
        const idx = Math.round((y - yStart) / band);
        const light = idx % 2 === 0 ? 0.06 : -0.03;
        const depthFade = clamp(1 - p1.depth / 150, 0.25, 1);
        const base = idx % 2 === 0 ? "#2f8f45" : "#268039";
        ctx.fillStyle = shade(base, light * depthFade + (1 - depthFade) * -0.18);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath(); ctx.fill();
      }

      // subtle floodlit pools on the turf
      const pool = ctx.createRadialGradient(w / 2, cam.project(0, CENTRE_Y, 0).sy, 20, w / 2, cam.project(0, CENTRE_Y, 0).sy, w * 0.75);
      pool.addColorStop(0, "rgba(255,255,220,0.10)");
      pool.addColorStop(1, "rgba(0,20,0,0.14)");
      ctx.fillStyle = pool;
      ctx.fillRect(0, cam.horizonY(), w, h - cam.horizonY());
    }

    worldPolyline(ctx, points, close) {
      let started = false;
      ctx.beginPath();
      for (const pt of points) {
        const p = this.cam.project(pt[0], pt[1], pt[2] || 0);
        if (!p.visible) { started = false; continue; }
        if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
        else ctx.lineTo(p.sx, p.sy);
      }
      if (close) ctx.closePath();
    }

    drawBoundary(ctx) {
      const cam = this.cam;
      // advertising boards
      const segs = 54;
      const colours = ["#0b3d91", "#c1272d", "#1b8f4c", "#f2a900", "#212b3a"];
      for (let i = 0; i < segs; i++) {
        const aA = lerp(-Math.PI, Math.PI, i / segs);
        const aB = lerp(-Math.PI, Math.PI, (i + 1) / segs);
        const R = BOUNDARY_R + 1.6;
        const p1 = cam.project(Math.sin(aA) * R, CENTRE_Y + Math.cos(aA) * R, 0);
        const p2 = cam.project(Math.sin(aB) * R, CENTRE_Y + Math.cos(aB) * R, 0);
        const p3 = cam.project(Math.sin(aB) * R, CENTRE_Y + Math.cos(aB) * R, 1.1);
        const p4 = cam.project(Math.sin(aA) * R, CENTRE_Y + Math.cos(aA) * R, 1.1);
        if ([p1, p2, p3, p4].some(p => !p.visible)) continue;
        ctx.fillStyle = i % 7 === 0 ? "#ffffff" : colours[i % colours.length];
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath(); ctx.fill();
      }

      // boundary rope
      const ropePts = [];
      for (let i = 0; i <= 64; i++) {
        const a = lerp(-Math.PI, Math.PI, i / 64);
        ropePts.push([Math.sin(a) * BOUNDARY_R, CENTRE_Y + Math.cos(a) * BOUNDARY_R, 0.09]);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2.2;
      this.worldPolyline(ctx, ropePts, false);
      ctx.stroke();

      // 30 yard circle
      const circlePts = [];
      for (let i = 0; i <= 72; i++) {
        const a = lerp(-Math.PI, Math.PI, i / 72);
        circlePts.push([Math.sin(a) * CIRCLE_R, CENTRE_Y + Math.cos(a) * CIRCLE_R, 0.02]);
      }
      ctx.save();
      ctx.setLineDash([8, 7]);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.6;
      this.worldPolyline(ctx, circlePts, false);
      ctx.stroke();
      ctx.restore();
    }

    fillWorldQuad(ctx, quad, style) {
      const ps = quad.map(q => this.cam.project(q[0], q[1], q[2] || 0));
      if (ps.some(p => !p.visible)) return null;
      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.moveTo(ps[0].sx, ps[0].sy);
      for (let i = 1; i < ps.length; i++) ctx.lineTo(ps[i].sx, ps[i].sy);
      ctx.closePath();
      ctx.fill();
      return ps;
    }

    drawPitch(ctx) {
      const cam = this.cam;
      const x0 = -PITCH_HALF_W, x1 = PITCH_HALF_W;
      const y0 = -2.2, y1 = PITCH_LEN + 2.2;

      const pFar = cam.project(0, y1, 0);
      const pNear = cam.project(0, y0, 0);
      if (pFar.visible && pNear.visible) {
        const grad = ctx.createLinearGradient(0, pFar.sy, 0, pNear.sy);
        grad.addColorStop(0, "#c9b183");
        grad.addColorStop(0.5, "#d7c394");
        grad.addColorStop(1, "#cbb584");
        this.fillWorldQuad(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], grad);
      }

      // worn patches where the ball lands
      [6.2, 8.4, 13.6].forEach((yy, i) => {
        this.fillWorldQuad(ctx, [
          [-0.75, yy - 1.1], [0.75, yy - 1.1], [0.75, yy + 1.1], [-0.75, yy + 1.1]
        ], i === 1 ? "rgba(155,125,86,0.30)" : "rgba(160,132,92,0.22)");
      });

      // creases
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = 2;
      const line = (ax, ay, bx, by) => {
        const a = cam.project(ax, ay, 0.01), b = cam.project(bx, by, 0.01);
        if (!a.visible || !b.visible) return;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      };
      // batting end
      line(-1.83, CREASE, 1.83, CREASE);
      line(-1.32, 0, 1.32, 0);
      line(-1.32, 0, -1.32, CREASE + 0.2);
      line(1.32, 0, 1.32, CREASE + 0.2);
      // bowling end
      line(-1.83, PITCH_LEN - CREASE, 1.83, PITCH_LEN - CREASE);
      line(-1.32, PITCH_LEN, 1.32, PITCH_LEN);
      line(-1.32, PITCH_LEN, -1.32, PITCH_LEN - CREASE - 0.2);
      line(1.32, PITCH_LEN, 1.32, PITCH_LEN - CREASE - 0.2);

      this.drawStumps(ctx, 0, false);
      this.drawStumps(ctx, PITCH_LEN, true);
    }

    drawStumps(ctx, y, far) {
      const cam = this.cam;
      const broken = this.stumpsShattered > 0 && !far;
      for (let i = -1; i <= 1; i++) {
        const x = i * 0.1143;
        const tilt = broken ? i * 0.28 * this.stumpsShattered : 0;
        const b = cam.project(x, y, 0);
        const t = cam.project(x + tilt, y + (broken ? -0.35 * this.stumpsShattered : 0), STUMP_H);
        if (!b.visible || !t.visible) continue;
        const wpx = Math.max(1.2, b.scale * 0.038);
        const grad = ctx.createLinearGradient(b.sx - wpx, 0, b.sx + wpx, 0);
        grad.addColorStop(0, "#c89a5c");
        grad.addColorStop(0.45, "#f0d9a8");
        grad.addColorStop(1, "#9c7136");
        ctx.strokeStyle = grad;
        ctx.lineWidth = wpx * 2;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.lineTo(t.sx, t.sy); ctx.stroke();
      }
      // bails
      const bl = cam.project(-0.11, y, STUMP_H + 0.015);
      const br = cam.project(0.11, y, STUMP_H + 0.015);
      if (bl.visible && br.visible && !broken) {
        ctx.strokeStyle = "#f5e3bd";
        ctx.lineWidth = Math.max(1, bl.scale * 0.03);
        ctx.beginPath(); ctx.moveTo(bl.sx, bl.sy); ctx.lineTo(br.sx, br.sy); ctx.stroke();
      }
      ctx.lineCap = "butt";
    }

    drawBounceMarks(ctx) {
      this.bounceMarks.forEach(m => {
        const p = this.cam.project(m.x, m.y, 0.01);
        if (!p.visible) return;
        ctx.save();
        ctx.globalAlpha = clamp(m.life, 0, 1) * 0.55;
        ctx.fillStyle = "#6b5432";
        ctx.beginPath();
        ctx.ellipse(p.sx, p.sy, Math.max(1.5, p.scale * 0.09), Math.max(0.8, p.scale * 0.04), 0, 0, 6.3);
        ctx.fill();
        ctx.restore();
      });
    }

    drawPitchMarker(ctx) {
      const m = this.pitchMarker;
      if (!m || m.life <= 0) return;
      const p = this.cam.project(m.x, m.y, 0.02);
      if (!p.visible) return;
      ctx.save();
      ctx.globalAlpha = clamp(m.life, 0, 1) * 0.8;
      ctx.strokeStyle = m.colour;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy, p.scale * 0.34, p.scale * 0.14, 0, 0, 6.3);
      ctx.stroke();
      ctx.globalAlpha *= 0.25;
      ctx.fillStyle = m.colour;
      ctx.fill();
      ctx.restore();
    }

    drawVignette(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.35, w / 2, h * 0.55, h * 1.05);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    /* ---------- actors ---------- */
    drawActors(ctx) {
      const list = [];
      const oppKit = this.opponentTeam ? this.opponentTeam.colors : { primary: "#c0392b", accent: "#ffffff" };
      const myKit = this.playerTeam ? this.playerTeam.colors : { primary: "#1e5fa9", accent: "#ffd700" };

      this.fielders.forEach(f => list.push({
        y: f.y, draw: () => this.drawHuman(ctx, f.x, f.y, {
          kit: oppKit, action: f.moving ? "run" : (f.state === "celebrate" ? "celebrate" : "ready"),
          phase: f.runPhase, cap: true, label: f.name
        })
      }));

      list.push({
        y: this.umpire.y, draw: () => this.drawHuman(ctx, this.umpire.x, this.umpire.y, {
          kit: { primary: "#101418", accent: "#ffffff" }, action: "umpire", phase: 0, hat: true
        })
      });

      list.push({
        y: this.bowler.y, draw: () => this.drawBowler(ctx, oppKit)
      });

      list.push({
        y: this.nonStriker.y, draw: () => this.drawBatter(ctx, this.nonStriker, myKit, false)
      });

      list.push({
        y: this.striker.y, draw: () => this.drawBatter(ctx, this.striker, myKit, true)
      });

      list.sort((a, b) => b.y - a.y);
      list.forEach(o => o.draw());
    }

    shadow(ctx, wx, wy, scale, size = 1) {
      const p = this.cam.project(wx, wy, 0);
      if (!p.visible) return null;
      const rx = p.scale * 0.34;
      const ry = p.scale * 0.12;
      ctx.save();
      const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, Math.max(2, rx));
      g.addColorStop(0, "rgba(6,26,12,0.42)");
      g.addColorStop(0.7, "rgba(6,26,12,0.22)");
      g.addColorStop(1, "rgba(6,26,12,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy, Math.max(2, rx), Math.max(1, ry), 0, 0, 6.3);
      ctx.fill();
      ctx.restore();
      return p;
    }

    /**
     * Generic articulated cricketer, drawn facing the camera.
     * opts: kit{primary,accent}, action: ready|run|celebrate|umpire|throw, phase, cap, hat
     */
    drawHuman(ctx, wx, wy, opts) {
      const p = this.cam.project(wx, wy, 0);
      if (!p.visible) return;
      const H = p.scale * 1.8;                       // body height in px
      if (H < 5 || p.sx < -160 || p.sx > this.viewWidth + 160) return;
      this.shadow(ctx, wx, wy, p.scale, clamp(H / 60, 0.5, 1.6));

      const kit = opts.kit || { primary: "#c0392b", accent: "#fff" };
      const shirt = kit.primary || "#c0392b";
      const trim = kit.accent || "#ffffff";
      const skin = "#d9a271";
      const x = p.sx, y = p.sy;
      const u = H / 100;                             // 1 unit = 1% of height

      const phase = opts.phase || 0;
      const running = opts.action === "run";
      const swing = running ? Math.sin(phase) : 0;
      const swing2 = running ? Math.sin(phase + Math.PI) : 0;
      const bob = running ? Math.abs(Math.sin(phase)) * 3 * u : 0;

      const hipY = y - 48 * u - bob;
      const shoulderY = y - 82 * u - bob;
      const headY = y - 92 * u - bob;

      const limb = (x1, y1, x2, y2, wdt, colour) => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(1, wdt);
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };

      const trouser = "#f2f3f0";
      const legW = Math.max(1.2, 7 * u);
      const armW = Math.max(1, 5.4 * u);

      // back leg
      const bkKneeX = x - 5 * u + swing2 * 11 * u;
      const bkFootX = x - 6 * u + swing2 * 20 * u;
      const bkFootY = y - (running ? Math.max(0, swing2) * 12 * u : 0);
      limb(x - 4 * u, hipY, bkKneeX, hipY + 24 * u, legW, shade(trouser, -0.18));
      limb(bkKneeX, hipY + 24 * u, bkFootX, bkFootY, legW * 0.85, shade(trouser, -0.18));

      // torso
      const grad = ctx.createLinearGradient(x - 14 * u, shoulderY, x + 14 * u, hipY);
      grad.addColorStop(0, shade(shirt, 0.22));
      grad.addColorStop(0.5, shirt);
      grad.addColorStop(1, shade(shirt, -0.28));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 13 * u, shoulderY);
      ctx.quadraticCurveTo(x - 16 * u, hipY - 14 * u, x - 10 * u, hipY);
      ctx.lineTo(x + 10 * u, hipY);
      ctx.quadraticCurveTo(x + 16 * u, hipY - 14 * u, x + 13 * u, shoulderY);
      ctx.quadraticCurveTo(x, shoulderY - 5 * u, x - 13 * u, shoulderY);
      ctx.closePath();
      ctx.fill();

      if (H > 26) {
        ctx.strokeStyle = trim;
        ctx.lineWidth = Math.max(0.6, 1.6 * u);
        ctx.beginPath();
        ctx.moveTo(x - 13 * u, shoulderY + 3 * u);
        ctx.lineTo(x + 13 * u, shoulderY + 3 * u);
        ctx.stroke();
      }

      // front leg
      const ftKneeX = x + 5 * u + swing * 11 * u;
      const ftFootX = x + 6 * u + swing * 20 * u;
      const ftFootY = y - (running ? Math.max(0, swing) * 12 * u : 0);
      limb(x + 4 * u, hipY, ftKneeX, hipY + 24 * u, legW, trouser);
      limb(ftKneeX, hipY + 24 * u, ftFootX, ftFootY, legW * 0.85, trouser);
      // shoes
      ctx.fillStyle = "#1c2330";
      ctx.beginPath(); ctx.ellipse(ftFootX + 1.5 * u, ftFootY, 5 * u, 2.4 * u, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bkFootX + 1.5 * u, bkFootY, 5 * u, 2.4 * u, 0, 0, 6.3); ctx.fill();

      // arms
      let armAngle = running ? -swing : 0;
      if (opts.action === "celebrate") armAngle = -1.4;
      if (opts.action === "umpire") armAngle = 0.15;
      if (opts.action === "throw") armAngle = -1.8;

      const shoulderL = { x: x - 12 * u, y: shoulderY + 4 * u };
      const shoulderR = { x: x + 12 * u, y: shoulderY + 4 * u };
      const elbowL = { x: shoulderL.x - 6 * u + armAngle * 6 * u, y: shoulderL.y + 16 * u - Math.abs(armAngle) * 6 * u };
      const elbowR = { x: shoulderR.x + 6 * u - armAngle * 6 * u, y: shoulderR.y + 16 * u - Math.abs(armAngle) * 6 * u };
      const handL = { x: elbowL.x + armAngle * 10 * u, y: elbowL.y + 14 * u + armAngle * 10 * u };
      const handR = { x: elbowR.x - armAngle * 10 * u, y: elbowR.y + 14 * u + armAngle * 10 * u };

      limb(shoulderL.x, shoulderL.y, elbowL.x, elbowL.y, armW, shade(shirt, -0.1));
      limb(elbowL.x, elbowL.y, handL.x, handL.y, armW * 0.8, skin);
      limb(shoulderR.x, shoulderR.y, elbowR.x, elbowR.y, armW, shirt);
      limb(elbowR.x, elbowR.y, handR.x, handR.y, armW * 0.8, skin);

      // head
      const headR = 6.4 * u;
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(x, headY, headR, 0, 6.3); ctx.fill();
      // hair / cap
      if (opts.cap) {
        ctx.fillStyle = shade(shirt, -0.25);
        ctx.beginPath();
        ctx.arc(x, headY - 0.7 * u, headR * 1.03, Math.PI, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = shade(shirt, -0.45);
        ctx.fillRect(x - headR * 1.1, headY - 1.2 * u, headR * 2.2, 1.6 * u);
      } else if (opts.hat) {
        ctx.fillStyle = "#1b1f26";
        ctx.beginPath(); ctx.ellipse(x, headY - headR * 0.55, headR * 1.5, headR * 0.42, 0, 0, 6.3); ctx.fill();
        ctx.fillRect(x - headR * 0.8, headY - headR * 1.5, headR * 1.6, headR * 0.95);
      } else {
        ctx.fillStyle = "#2a1d14";
        ctx.beginPath(); ctx.arc(x, headY - 0.8 * u, headR * 0.98, Math.PI, 0); ctx.closePath(); ctx.fill();
      }

      // fielder name when zoomed out
      if (opts.label && H > 14 && H < 120 && this.cam.mode === "WIDE") {
        ctx.font = `${Math.max(7, 7 * u * 1.6)}px "Segoe UI", sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.textAlign = "center";
        ctx.fillText(opts.label, x, y + 12 * u);
      }
      ctx.lineCap = "butt";
    }

    drawBowler(ctx, kit) {
      const b = this.bowler;
      const running = this.phase === "RUNUP";
      const delivering = this.phase === "DELIVERY" && this.phaseClock < 0.5;
      this.drawHuman(ctx, b.x, b.y, {
        kit,
        action: running ? "run" : delivering ? "throw" : "ready",
        phase: b.runPhase || 0,
        cap: true
      });
    }

    /**
     * The star of the show — detailed batsman with helmet, pads, gloves and willow.
     */
    drawBatter(ctx, actor, kit, isStriker) {
      const p = this.cam.project(actor.x, actor.y, 0);
      if (!p.visible) return;
      const H = p.scale * 1.8;
      if (H < 5) return;
      const u = H / 100;
      const x = p.sx;
      let y = p.sy;

      const running = actor.anim === "RUN";
      const diving = actor.dive > 0;
      const phase = actor.runPhase || 0;
      const swingRun = running ? Math.sin(phase) : 0;
      const swingRun2 = running ? Math.sin(phase + Math.PI) : 0;
      const bob = running ? Math.abs(Math.sin(phase)) * 3.4 * u : 0;

      this.shadow(ctx, actor.x, actor.y, p.scale, clamp(H / 60, 0.5, 1.8));

      ctx.save();
      if (diving) {
        ctx.translate(x, y);
        ctx.rotate(-0.85 * actor.dive);
        ctx.translate(-x, -y + 14 * u * actor.dive);
      }

      const shirt = kit.primary || "#1e5fa9";
      const trim = kit.accent || "#ffd700";
      const skin = "#d9a271";
      const white = "#f6f7f4";

      const hipY = y - 48 * u - bob;
      const shoulderY = y - 82 * u - bob;
      const headY = y - 93 * u - bob;

      const limb = (x1, y1, x2, y2, wdt, colour, cap = "round") => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = Math.max(1, wdt);
        ctx.lineCap = cap;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };

      /* ---- legs with batting pads ---- */
      const padW = Math.max(2.2, 10 * u);
      const drawPad = (px, kneeX, footX, footY) => {
        limb(px, hipY, kneeX, hipY + 24 * u, padW, white);
        limb(kneeX, hipY + 24 * u, footX, footY, padW * 0.92, white);
        if (H > 40) {
          ctx.strokeStyle = "rgba(160,168,158,0.9)";
          ctx.lineWidth = Math.max(0.5, 0.9 * u);
          for (let i = 1; i <= 3; i++) {
            const t = i / 4;
            const ax = lerp(px, kneeX, t), ay = lerp(hipY, hipY + 24 * u, t);
            ctx.beginPath();
            ctx.moveTo(ax - padW * 0.45, ay); ctx.lineTo(ax + padW * 0.45, ay);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "#e9eae3";
        ctx.beginPath(); ctx.ellipse(footX + 1.5 * u, footY, 5.4 * u, 2.5 * u, 0, 0, 6.3); ctx.fill();
        ctx.fillStyle = "#c2c7bd";
        ctx.fillRect(footX - 3.6 * u, footY, 7.4 * u, 1.2 * u);
      };

      const bkKneeX = x - 6 * u + swingRun2 * 11 * u;
      const bkFootX = x - 7 * u + swingRun2 * 20 * u;
      const bkFootY = y - (running ? Math.max(0, swingRun2) * 12 * u : 0);
      drawPad(x - 4 * u, bkKneeX, bkFootX, bkFootY);

      /* ---- torso (seen from behind) ---- */
      const grad = ctx.createLinearGradient(x - 15 * u, shoulderY, x + 15 * u, hipY);
      grad.addColorStop(0, shade(shirt, 0.25));
      grad.addColorStop(0.45, shirt);
      grad.addColorStop(1, shade(shirt, -0.3));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 14 * u, shoulderY);
      ctx.quadraticCurveTo(x - 17 * u, hipY - 14 * u, x - 11 * u, hipY + 2 * u);
      ctx.lineTo(x + 11 * u, hipY + 2 * u);
      ctx.quadraticCurveTo(x + 17 * u, hipY - 14 * u, x + 14 * u, shoulderY);
      ctx.quadraticCurveTo(x, shoulderY - 6 * u, x - 14 * u, shoulderY);
      ctx.closePath(); ctx.fill();

      if (H > 30) {
        // short sleeves
        ctx.fillStyle = shade(shirt, -0.18);
        ctx.beginPath();
        ctx.ellipse(x - 13 * u, shoulderY + 7 * u, 5.5 * u, 8 * u, 0.18, 0, 6.3);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 13 * u, shoulderY + 7 * u, 5.5 * u, 8 * u, -0.18, 0, 6.3);
        ctx.fill();
        // collar
        ctx.fillStyle = trim;
        ctx.beginPath();
        ctx.ellipse(x, shoulderY + 0.5 * u, 6 * u, 2.4 * u, 0, 0, 6.3);
        ctx.fill();
      }

      if (H > 45) {
        // shirt number on the back
        ctx.fillStyle = trim;
        ctx.font = `bold ${16 * u}px "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("10", x, hipY - 12 * u);
        ctx.strokeStyle = trim;
        ctx.lineWidth = Math.max(0.6, 1.5 * u);
        ctx.beginPath();
        ctx.moveTo(x - 14 * u, shoulderY + 4 * u);
        ctx.lineTo(x + 14 * u, shoulderY + 4 * u);
        ctx.stroke();
      }

      /* ---- front leg ---- */
      const stanceShift = actor.anim === "SWING" ? 5 * u : 0;
      const ftKneeX = x + 6 * u + swingRun * 11 * u + stanceShift;
      const ftFootX = x + 7 * u + swingRun * 20 * u + stanceShift * 1.6;
      const ftFootY = y - (running ? Math.max(0, swingRun) * 12 * u : 0);
      drawPad(x + 4 * u, ftKneeX, ftFootX, ftFootY);

      /* ---- arms, gloves and bat ---- */
      const anim = actor.anim;
      let batAngle;                                  // radians, 0 = pointing down
      const t = clamp(actor.animT / 0.34, 0, 1);
      if (anim === "SWING") {
        const aim = actor.shotAim || "STRAIGHT";
        const finish = aim === "LOFT" ? -2.5 : aim === "OFF" ? -1.9 : aim === "LEG" ? -3.2 : aim === "DEFENSIVE" ? -0.35 : -2.2;
        batAngle = lerp(-0.75, finish, Math.min(1, t * 1.6));
      } else if (anim === "RUN") {
        batAngle = -0.55 + swingRun * 0.2;
      } else if (anim === "OUT") {
        batAngle = 0.9;
      } else if (anim === "BACKLIFT") {
        batAngle = -0.55;
      } else {
        batAngle = -0.13 + Math.sin(performance.now() / 430) * 0.06;  // idle bat tap
      }

      const handX = x + 9 * u;
      const handY = shoulderY + 17 * u;

      // back arm
      limb(x - 12 * u, shoulderY + 5 * u, x - 4 * u, shoulderY + 18 * u, Math.max(1, 5.6 * u), shade(shirt, -0.1));
      limb(x - 4 * u, shoulderY + 18 * u, handX - 3 * u, handY, Math.max(1, 5 * u), skin);
      // front arm
      limb(x + 13 * u, shoulderY + 5 * u, x + 13 * u, shoulderY + 17 * u, Math.max(1, 5.6 * u), shirt);
      limb(x + 13 * u, shoulderY + 17 * u, handX, handY, Math.max(1, 5 * u), skin);

      // gloves
      ctx.fillStyle = white;
      ctx.beginPath(); ctx.ellipse(handX - 1 * u, handY, 5 * u, 4.2 * u, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = "#c9cdc4"; ctx.lineWidth = Math.max(0.5, 0.8 * u); ctx.stroke();

      /* the willow */
      if (isStriker || anim === "RUN") {
        ctx.save();
        ctx.translate(handX, handY);
        ctx.rotate(batAngle);
        const bl = 50 * u;   // blade length
        const bw = 13 * u;   // blade width
        // handle
        ctx.fillStyle = "#3d2a18";
        ctx.fillRect(-1.6 * u, -20 * u, 3.6 * u, 22 * u);
        ctx.fillStyle = trim;
        for (let i = 0; i < 4; i++) ctx.fillRect(-1.8 * u, -19 * u + i * 5 * u, 4 * u, 2 * u);
        // blade
        const bg = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
        bg.addColorStop(0, "#e9d3a6");
        bg.addColorStop(0.35, "#f7e7c6");
        bg.addColorStop(1, "#cfae79");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(-bw / 2, 0);
        ctx.lineTo(bw / 2, 0);
        ctx.lineTo(bw / 2, bl * 0.86);
        ctx.quadraticCurveTo(bw / 2, bl, 0, bl);
        ctx.quadraticCurveTo(-bw / 2, bl, -bw / 2, bl * 0.86);
        ctx.closePath();
        ctx.fill();
        if (H > 40) {
          ctx.strokeStyle = "rgba(160,125,70,0.45)";
          ctx.lineWidth = Math.max(0.4, 0.6 * u);
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (bw / 6), 2 * u);
            ctx.lineTo(i * (bw / 6), bl * 0.92);
            ctx.stroke();
          }
          // sticker
          ctx.fillStyle = trim;
          ctx.fillRect(-bw * 0.28, bl * 0.30, bw * 0.56, bl * 0.22);
          ctx.fillStyle = shade(shirt, -0.1);
          ctx.fillRect(-bw * 0.28, bl * 0.52, bw * 0.56, bl * 0.10);
        }
        ctx.restore();
      }

      /* ---- helmet ---- */
      const headR = 7 * u;
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(x, headY, headR * 0.92, 0, 6.3); ctx.fill();
      // shell
      const hg = ctx.createLinearGradient(x - headR, headY - headR, x + headR, headY + headR);
      hg.addColorStop(0, shade(shirt, 0.3));
      hg.addColorStop(1, shade(shirt, -0.35));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(x, headY - 0.8 * u, headR * 1.12, Math.PI * 0.98, Math.PI * 2.02);
      ctx.closePath(); ctx.fill();
      // peak
      ctx.fillStyle = shade(shirt, -0.45);
      ctx.beginPath();
      ctx.ellipse(x, headY - headR * 0.75, headR * 1.25, headR * 0.34, 0, 0, 6.3);
      ctx.fill();
      // grille edges peeking around the jaw + chin strap
      if (H > 34) {
        ctx.strokeStyle = "#8d949c";
        ctx.lineWidth = Math.max(0.6, 1.2 * u);
        ctx.beginPath();
        ctx.arc(x - headR * 0.92, headY + 1.2 * u, headR * 0.34, -0.7, 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + headR * 0.92, headY + 1.2 * u, headR * 0.34, 1.6, 3.8);
        ctx.stroke();
        // neck guard
        ctx.fillStyle = shade(shirt, -0.5);
        ctx.beginPath();
        ctx.ellipse(x, headY + headR * 0.85, headR * 0.85, headR * 0.34, 0, 0, 6.3);
        ctx.fill();
      }
      ctx.restore();
      ctx.lineCap = "butt";
    }

    /* ---------- ball ---------- */
    drawBall(ctx) {
      const b = this.ball;
      if (!b.visible) return;

      // trail
      if (this.trail.length > 2) {
        ctx.save();
        ctx.lineCap = "round";
        for (let i = 1; i < this.trail.length; i++) {
          const a = this.cam.project(this.trail[i - 1].x, this.trail[i - 1].y, this.trail[i - 1].z);
          const c = this.cam.project(this.trail[i].x, this.trail[i].y, this.trail[i].z);
          if (!a.visible || !c.visible) continue;
          const k = i / this.trail.length;
          ctx.strokeStyle = `rgba(255,${140 + k * 60},${120 + k * 60},${k * 0.45})`;
          ctx.lineWidth = Math.max(0.6, c.scale * 0.055 * k);
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(c.sx, c.sy); ctx.stroke();
        }
        ctx.restore();
      }

      // shadow on the turf
      const sh = this.cam.project(b.x, b.y, 0);
      if (sh.visible) {
        const spread = clamp(1 + b.z * 0.35, 1, 3.2);
        ctx.save();
        ctx.globalAlpha = clamp(0.4 - b.z * 0.035, 0.06, 0.4);
        ctx.fillStyle = "#04140a";
        ctx.beginPath();
        ctx.ellipse(sh.sx, sh.sy, sh.scale * 0.07 * spread, sh.scale * 0.03 * spread, 0, 0, 6.3);
        ctx.fill();
        ctx.restore();
      }

      const p = this.cam.project(b.x, b.y, b.z);
      if (!p.visible) return;
      const r = Math.max(3.6, p.scale * b.radius * 2.9);

      // leather
      const g = ctx.createRadialGradient(p.sx - r * 0.35, p.sy - r * 0.42, r * 0.12, p.sx, p.sy, r);
      g.addColorStop(0, "#ff8a7a");
      g.addColorStop(0.35, "#d93b2b");
      g.addColorStop(0.8, "#9e1b18");
      g.addColorStop(1, "#5e0d10");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 6.3); ctx.fill();

      // seam + stitching
      if (r > 3) {
        const seamAngle = (this.simTime * 7) % (Math.PI * 2);
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(Math.sin(seamAngle) * 0.5 + 0.35);
        ctx.strokeStyle = "rgba(255,244,228,0.92)";
        ctx.lineWidth = Math.max(0.6, r * 0.16);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.94, r * 0.34, 0, 0, 6.3);
        ctx.stroke();
        if (r > 6) {
          ctx.strokeStyle = "rgba(120,30,20,0.75)";
          ctx.lineWidth = Math.max(0.4, r * 0.05);
          for (let i = -4; i <= 4; i++) {
            const ax = (i / 4) * r * 0.85;
            const ay = Math.sqrt(Math.max(0, 1 - (ax / (r * 0.94)) ** 2)) * r * 0.34;
            ctx.beginPath(); ctx.moveTo(ax, -ay); ctx.lineTo(ax, ay); ctx.stroke();
          }
        }
        ctx.restore();
      }

      // specular
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(p.sx - r * 0.34, p.sy - r * 0.38, r * 0.22, r * 0.16, -0.6, 0, 6.3);
      ctx.fill();

      // off-screen tracker when the ball is miles away
      if (p.sy < 6 || p.sx < 6 || p.sx > this.viewWidth - 6) {
        const tx = clamp(p.sx, 14, this.viewWidth - 14);
        const ty = clamp(p.sy, 14, this.viewHeight - 14);
        ctx.strokeStyle = "rgba(255,215,0,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(tx, ty, 9, 0, 6.3); ctx.stroke();
      }
    }

    drawParticles(ctx) {
      this.particles.forEach(p => {
        const pr = this.cam.project(p.x, p.y, p.z);
        if (!pr.visible) return;
        ctx.save();
        ctx.globalAlpha = clamp(p.life, 0, 1) * 0.85;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, Math.max(0.8, pr.scale * p.size), 0, 6.3);
        ctx.fill();
        ctx.restore();
      });
    }

    drawConfetti(ctx) {
      this.confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = clamp(c.life, 0, 1);
        ctx.fillStyle = c.colour;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
      });
    }

    /* ---------- on-canvas HUD ---------- */
    drawTimingMeter(ctx, w, h) {
      const narrow = w < 560;
      const ttc = this.timeToContact();
      const barW = Math.min(420, w * (narrow ? 0.88 : 0.72));
      const barH = narrow ? 12 : 15;
      const barX = (w - barW) / 2;
      const barY = h - (narrow ? 34 : 46);

      ctx.save();
      ctx.fillStyle = "rgba(6,12,26,0.82)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(barX - 10, barY - 26, barW + 20, barH + 40, 12);
      else ctx.rect(barX - 10, barY - 26, barW + 20, barH + 40);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const zones = [
        [0.00, 0.30, "#22314d"],
        [0.30, 0.46, "#ffa502"],
        [0.46, 0.585, "#2ed573"],
        [0.585, 0.64, "#00d2d3"],
        [0.64, 0.70, "#ffd700"],
        [0.70, 0.755, "#00d2d3"],
        [0.755, 0.88, "#2ed573"],
        [0.88, 1.00, "#ff4757"]
      ];
      zones.forEach(z => {
        ctx.fillStyle = z[2];
        ctx.fillRect(barX + z[0] * barW, barY, (z[1] - z[0]) * barW, barH);
      });
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.strokeRect(barX, barY, barW, barH);

      // cursor: maps time-to-contact 0.62s -> 0 across the bar
      const prog = clamp(1 - (ttc - (-0.14)) / (0.62 + 0.14), 0, 1);
      const cx = barX + prog * barW;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - 2, barY - 6, 4, barH + 12);
      ctx.shadowBlur = 0;

      const key = window.ControlsManager ? window.ControlsManager.labelFor("HIT") : "H";
      ctx.font = `bold ${narrow ? 10 : 12}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(
        narrow ? `[ ${key} ] / SPACE — HIT IN THE GOLD ZONE` : `PRESS  [ ${key} ]  OR  [ SPACE ]  IN THE GOLD ZONE`,
        w / 2, barY - (narrow ? 8 : 10)
      );
      ctx.restore();
    }

    drawRacingHUD(ctx, w, h) {
      const r = this.racing;
      const CM = window.ControlsManager;
      const total = PITCH_LEN - 2 * CREASE + 0.45;
      const done = r.dir > 0
        ? clamp((this.striker.y - CREASE) / total, 0, 1)
        : clamp((PITCH_LEN - CREASE - this.striker.y) / total, 0, 1);

      const hudW = Math.min(440, w * 0.86);
      const hudX = (w - hudW) / 2;
      const hudY = 14;

      ctx.save();
      ctx.fillStyle = "rgba(6,12,26,0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(hudX, hudY, hudW, 78, 12); else ctx.rect(hudX, hudY, hudW, 78);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,210,211,0.75)";
      ctx.lineWidth = 1.6; ctx.stroke();

      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillStyle = "#ffd700";
      ctx.textAlign = "left";
      ctx.fillText(`RUN ${r.runsCompleted + 1}  —  SPRINT!`, hudX + 14, hudY + 20);
      ctx.textAlign = "right";
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = "#cfe4ff";
      ctx.fillText(`TAP [${CM.labelFor("RUN")}] · DIVE [${CM.labelFor("DIVE")}] · TURN [${CM.labelFor("TURN")}]`, hudX + hudW - 14, hudY + 20);

      const barX = hudX + 92, barW = hudW - 110, barH = 13;
      // runner
      ctx.fillStyle = "#16202f"; ctx.fillRect(barX, hudY + 30, barW, barH);
      const rg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      rg.addColorStop(0, "#2ed573"); rg.addColorStop(1, "#b8ffd0");
      ctx.fillStyle = rg; ctx.fillRect(barX, hudY + 30, barW * done, barH);
      ctx.fillStyle = "#2ed573"; ctx.textAlign = "left";
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      ctx.fillText("🏃 RUNNER", hudX + 14, hudY + 41);

      // throw
      let throwP = 0;
      if (this.throwObj) throwP = clamp(this.throwObj.t / this.throwObj.dur, 0, 1);
      else if (this.chaser && this.chaser.state === "chase") {
        const d = dist(this.chaser.x, this.chaser.y, this.ball.x, this.ball.y);
        throwP = clamp(1 - d / 45, 0, 0.42);
      }
      ctx.fillStyle = "#16202f"; ctx.fillRect(barX, hudY + 52, barW, barH);
      const tg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      tg.addColorStop(0, "#ff4757"); tg.addColorStop(1, "#ffb8c0");
      ctx.fillStyle = tg; ctx.fillRect(barX, hudY + 52, barW * throwP, barH);
      ctx.fillStyle = "#ff6b81";
      ctx.fillText("⚡ THROW", hudX + 14, hudY + 63);

      ctx.fillStyle = "#ffd700";
      ctx.fillRect(barX + barW - 2, hudY + 26, 3, 43);
      ctx.restore();
    }

    drawAimBadge(ctx, w, h) {
      if (this.phase !== "RUNUP" && this.phase !== "DELIVERY") return;
      const CM = window.ControlsManager;
      const names = { STRAIGHT: "STRAIGHT DRIVE", OFF: "OFF SIDE", LEG: "LEG SIDE", LOFT: "LOFTED", DEFENSIVE: "DEFEND" };
      const txt = names[this.aim] || "STRAIGHT DRIVE";
      ctx.save();
      ctx.font = 'bold 11px "Segoe UI", sans-serif';
      const label = `AIM: ${txt}`;
      const wid = ctx.measureText(label).width + 22;
      ctx.fillStyle = "rgba(6,12,26,0.8)";
      ctx.beginPath();
      const ay = w < 560 ? 40 : h - 34;
      if (ctx.roundRect) ctx.roundRect(w - wid - 12, ay, wid, 22, 8); else ctx.rect(w - wid - 12, ay, wid, 22);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,215,0,0.6)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#ffd700";
      ctx.textAlign = "center";
      ctx.fillText(label, w - wid / 2 - 12, ay + 15);
      ctx.restore();
    }

    drawBroadcastOverlay(ctx, w, h) {
      const narrow = w < 560;
      ctx.save();
      const d = DELIVERIES[this.bowler.type] || DELIVERIES.FAST;
      const title = narrow ? d.label : `${this.bowlerName || "Bowler"} — ${d.label}`;
      const speed = `${this.bowler.speedKmh} km/h`;

      ctx.font = `bold ${narrow ? 9.5 : 11}px "Segoe UI", sans-serif`;
      const wid = Math.max(ctx.measureText(title).width, 86) + 20;
      const boxH = narrow ? 32 : 38;
      const bx = 12;
      const by = narrow ? 44 : h - 50;
      ctx.fillStyle = "rgba(6,12,26,0.78)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, wid, boxH, 8); else ctx.rect(bx, by, wid, boxH);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(title, bx + 10, by + (narrow ? 13 : 16));
      ctx.fillStyle = "#7ef7c0";
      ctx.font = `bold ${narrow ? 11 : 13}px "Segoe UI", sans-serif`;
      ctx.fillText(speed, bx + 10, by + (narrow ? 26 : 31));

      // commentary ticker top-left
      if (this.commentary) {
        ctx.font = `italic ${narrow ? 10 : 12}px "Segoe UI", sans-serif`;
        const cw = ctx.measureText(this.commentary).width + 24;
        ctx.fillStyle = "rgba(6,12,26,0.65)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(12, 10, Math.min(cw, w - 24), narrow ? 22 : 24, 8);
        else ctx.rect(12, 10, Math.min(cw, w - 24), narrow ? 22 : 24);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.fillText(this.commentary, 24, narrow ? 25 : 26);
      }
      ctx.restore();
    }

    drawFloatingTexts(ctx) {
      this.floatingTexts.forEach(f => {
        ctx.save();
        ctx.globalAlpha = clamp(f.life, 0, 1);
        ctx.font = `900 ${f.size}px "Segoe UI", Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = Math.max(3, f.size * 0.16);
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.strokeText(f.text, f.x, f.y);
        const g = ctx.createLinearGradient(0, f.y - f.size, 0, f.y + 4);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, f.colour);
        g.addColorStop(1, shade(f.colour, -0.25));
        ctx.fillStyle = g;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });
    }
  }

  window.CricketGameplay = CricketGameplay;
})();
