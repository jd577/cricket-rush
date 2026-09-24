/**
 * CRICKET RUSH — Configurable Keyboard Controls Manager
 * Lets the player rebind every in-match action (Hit, Run, Dive, Turn, Shot Aiming).
 * Bindings persist in localStorage and are shared by the match engine + on-screen HUD.
 * Built by Jawad Akhter | Software Quality Assurance Engineer
 */

const CONTROLS_STORAGE_KEY = "cricket_rush_controls_v1";

/** Every rebindable action in the game */
const CONTROL_ACTIONS = [
  {
    id: "HIT",
    label: "Play Shot / Hit Ball",
    icon: "🏏",
    hint: "Swing the bat when the ball reaches the timing zone.",
    def: "KeyH"
  },
  {
    id: "RUN",
    label: "Sprint Between Wickets",
    icon: "🏃",
    hint: "Tap repeatedly while running to sprint faster.",
    def: "KeyR"
  },
  {
    id: "DIVE",
    label: "Dive For The Crease",
    icon: "💨",
    hint: "Full-length dive to beat the throw at the death.",
    def: "KeyD"
  },
  {
    id: "TURN",
    label: "Turn For Extra Run",
    icon: "🔁",
    hint: "Gamble on a second or third run when the fielder is slow.",
    def: "KeyT"
  },
  {
    id: "AIM_OFF",
    label: "Aim Off Side (Cover Drive)",
    icon: "▶",
    hint: "Angle the bat face to the off side of the ground.",
    def: "ArrowRight"
  },
  {
    id: "AIM_LEG",
    label: "Aim Leg Side (Pull / Flick)",
    icon: "◀",
    hint: "Work the ball square of the wicket on the leg side.",
    def: "ArrowLeft"
  },
  {
    id: "AIM_LOFT",
    label: "Loft It (Go Aerial)",
    icon: "🚀",
    hint: "Launch the ball high and straight — the six shot.",
    def: "ArrowUp"
  },
  {
    id: "AIM_BLOCK",
    label: "Defend / Block",
    icon: "🛡️",
    hint: "Soft hands, dead bat — survive the good delivery.",
    def: "ArrowDown"
  }
];

/** Pretty printed key names */
function prettyKeyName(code) {
  if (!code) return "—";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num " + code.slice(6);
  const map = {
    Space: "SPACE",
    ArrowUp: "▲ UP",
    ArrowDown: "▼ DOWN",
    ArrowLeft: "◀ LEFT",
    ArrowRight: "RIGHT ▶",
    ShiftLeft: "L SHIFT",
    ShiftRight: "R SHIFT",
    ControlLeft: "L CTRL",
    ControlRight: "R CTRL",
    AltLeft: "L ALT",
    AltRight: "R ALT",
    Enter: "ENTER",
    Tab: "TAB",
    Backspace: "BACKSPC",
    Escape: "ESC",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Semicolon: ";",
    Quote: "'",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Minus: "-",
    Equal: "="
  };
  return map[code] || code.toUpperCase();
}

const ControlsManager = {
  actions: CONTROL_ACTIONS,

  /** action id -> KeyboardEvent.code */
  bindings: {},

  /** Keys that always work no matter what the player rebinds */
  universal: {
    Space: "HIT_OR_RUN"
  },

  init() {
    this.bindings = this.load();
    return this.bindings;
  },

  defaults() {
    const d = {};
    CONTROL_ACTIONS.forEach(a => (d[a.id] = a.def));
    return d;
  },

  load() {
    const defaults = this.defaults();
    try {
      const raw = localStorage.getItem(CONTROLS_STORAGE_KEY);
      if (!raw) return defaults;
      const saved = JSON.parse(raw);
      const merged = { ...defaults };
      Object.keys(defaults).forEach(id => {
        if (typeof saved[id] === "string" && saved[id].length) merged[id] = saved[id];
      });
      return merged;
    } catch (err) {
      console.warn("Controls load failed, using defaults.", err);
      return defaults;
    }
  },

  save() {
    try {
      localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(this.bindings));
      return true;
    } catch (err) {
      console.warn("Controls save failed.", err);
      return false;
    }
  },

  reset() {
    this.bindings = this.defaults();
    this.save();
    return this.bindings;
  },

  /** Get the key code bound to an action */
  keyFor(actionId) {
    if (!Object.keys(this.bindings).length) this.init();
    return this.bindings[actionId];
  },

  /** Human readable key label, e.g. "H" */
  labelFor(actionId) {
    return prettyKeyName(this.keyFor(actionId));
  },

  prettyKeyName,

  /** Reverse lookup: which action does this KeyboardEvent.code trigger? */
  actionFor(code) {
    if (!Object.keys(this.bindings).length) this.init();
    const found = Object.keys(this.bindings).find(id => this.bindings[id] === code);
    return found || null;
  },

  /**
   * Rebind an action. If the key is already used by another action the two are swapped
   * so the player can never end up with an unreachable action.
   */
  rebind(actionId, code) {
    if (!Object.keys(this.bindings).length) this.init();
    if (!code) return false;
    const previousOwner = Object.keys(this.bindings).find(id => this.bindings[id] === code && id !== actionId);
    const oldKey = this.bindings[actionId];
    this.bindings[actionId] = code;
    if (previousOwner) this.bindings[previousOwner] = oldKey; // swap
    this.save();
    return true;
  },

  /** Keys we refuse to capture during rebinding (browser / accessibility reserved) */
  isReservedKey(code) {
    return ["Escape", "Tab", "F5", "F11", "F12", "MetaLeft", "MetaRight"].includes(code);
  },

  /** One-line summary used on the gameplay screen */
  summaryText() {
    return `${this.labelFor("HIT")} Hit · ${this.labelFor("RUN")} Run · ${this.labelFor("DIVE")} Dive · ${this.labelFor("TURN")} Turn · Arrows Aim · SPACE always works`;
  }
};

ControlsManager.init();
window.ControlsManager = ControlsManager;
