# 🏏 CRICKET RUSH — International Cricket Challenge

[![GitHub Pages Deployment](https://img.shields.io/badge/Hosted%20On-GitHub%20Pages-blue?logo=github)](https://jd577.github.io/cricket-rush/)
[![JavaScript](https://img.shields.io/badge/Language-Vanilla%20JavaScript%20ES6+-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 & CSS3](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3-orange?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![QA Grade](https://img.shields.io/badge/Quality%20Assurance-Verified%20%26%20Polished-brightgreen)](https://github.com/jd577/cricket-rush)

An arcade-style international cricket browser game that combines **realistic tournament progression with fast, fun batting timing and high-adrenaline running/racing gameplay**.

Built by **Jawad Akhter** | *Software Quality Assurance Engineer*.

---

## 🎮 Core Gameplay Loop

```
MAIN MENU ➔ SELECT INTERNATIONAL TEAM ➔ SELECT TOURNAMENT ➔ SELECT FORMAT
   ↓
TOURNAMENT DASHBOARD ➔ MATCH PREVIEW ➔ PLAY MATCH
   ↓
BOWL ➔ TIME THE SHOT ➔ HIT ➔ RACE BETWEEN WICKETS ➔ SCORE RUNS
   ↓
MATCH RESULT ➔ UPDATE POINTS TABLE ➔ QUALIFY FOR KNOCKOUTS
   ↓
SEMI FINAL ➔ THE GRAND FINAL ➔ CHAMPIONS! ➔ LIFT TROPHY ➔ SAVE TO CAREER
```

---

## 🌟 Key Features

- 🏏 **Arcade Batting Mechanics**: 60 FPS HTML5 Canvas rendering with real-time 3D ball trajectory, swing, seam bounce, and multi-zone timing meters (*Perfect, Great, Good, Poor, Miss*).
- 🏃 **Arcade Racing Mechanic**: When a shot is fielded, the game seamlessly transitions into an intense sprint race between the batsman and the fielder's laser throw (*Mash Space / Tap Run*, dive at the crease, or turn for a risky second run!).
- 🌍 **12 International Teams**: Pakistan, India, Australia, England, South Africa, New Zealand, Sri Lanka, West Indies, Bangladesh, Afghanistan, Ireland, and Zimbabwe with custom vector SVG flags and attributes.
- 🏆 **7 Authentic Tournament Modes**:
  1. **ICC World Cup** (ODI Format: Group Stage ➔ Semi-Finals ➔ Final)
  2. **T20 World Cup** (T20 Format: Fast-paced power hitting ➔ Semis ➔ Final)
  3. **Champions Trophy** (ODI Format: Top 8 Elite showdown)
  4. **Asia Cup** (Selectable T20 or ODI Format: Continental rivalry)
  5. **Tri-Nation Series** (Triple threat round-robin ➔ Final)
  6. **Bilateral Series** (Head-to-head custom series against any chosen rival)
  7. **Test Championship** (Arcade-condensed strategic Test cricket with the Test Mace)
- ⚡ **3 Match Formats**: T20 International, One Day International (ODI), and Test Match.
- 💾 **Persistent Career & Trophy Cabinet**: Browser `localStorage` tracking of Career XP, Player Levels (from *Gully Cricketer* to *Cricket Legend*), Batting Statistics, and unlocked custom vector trophies.
- 🔊 **Procedural Web Audio Engine**: Zero external audio dependencies — pure synthesized wood impacts, crowd cheers, umpire whistles, and victory fanfares.
- 📱 **100% Responsive Design**: Full touch-friendly controls for mobile and tablet devices + desktop keyboard shortcuts (`SPACEBAR`, Arrow Keys).

---

## 🏆 International Teams & Ratings

| Team | Code | BAT | BOWL | FIELD | RUN | OVR | Flag |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pakistan** | `PAK` | 84 | 88 | 82 | 84 | **85** | 🇵🇰 |
| **India** | `IND` | 89 | 86 | 87 | 86 | **87** | 🇮🇳 |
| **Australia** | `AUS` | 88 | 87 | 89 | 88 | **88** | 🇦🇺 |
| **England** | `ENG` | 87 | 86 | 86 | 85 | **86** | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **South Africa**| `SA` | 85 | 87 | 90 | 87 | **87** | 🇿🇦 |
| **New Zealand** | `NZ` | 86 | 86 | 88 | 86 | **86** | 🇳🇿 |
| **Sri Lanka** | `SL` | 83 | 84 | 83 | 84 | **83** | 🇱🇰 |
| **West Indies** | `WI` | 86 | 82 | 83 | 83 | **84** | 🌴 |
| **Bangladesh** | `BAN` | 82 | 83 | 81 | 82 | **82** | 🇧🇩 |
| **Afghanistan** | `AFG` | 81 | 87 | 82 | 83 | **83** | 🇦🇫 |
| **Ireland** | `IRE` | 80 | 81 | 83 | 82 | **81** | 🇮🇪 |
| **Zimbabwe** | `ZIM` | 79 | 80 | 81 | 81 | **80** | 🇿🇼 |

---

## 🎯 Controls & Gameplay Guide

### Desktop Keyboard Controls
- **SPACEBAR**: Time & Hit the shot / Sprint during the racing sequence.
- **UP ARROW / W**: Lofted Aerial Shot (Maximum Six attempt).
- **LEFT ARROW / A**: Off-Side Cover Drive.
- **RIGHT ARROW / D**: Leg-Side Pull / Hook Shot.
- **DOWN ARROW / S**: Defensive Block / Crease Dive during running.
- **T**: Turn for a 2nd Run.

### Mobile & Tablet Touch Controls
- **HIT SHOT Button**: Large primary touch button for timing shots.
- **RUN FAST! Button**: Mash button to sprint between wickets.
- **DIVE Button**: Instant slide at the crease.
- **Directional Pad**: Dedicated buttons for Loft, Off-Drive, Leg-Pull, and Block.

---

## 📁 Project Structure

```text
cricket-rush/
│
├── index.html              # Main HTML5 entry point & screen containers
│
├── css/
│   └── style.css           # Glassmorphism UI, stadium atmosphere, animations
│
├── js/
│   ├── config.js           # Game constants, formats, XP progression, author info
│   ├── sound.js            # Procedural Web Audio API sound synthesis
│   ├── teams.js            # 12 international teams, vector flags & rosters
│   ├── tournaments.js      # Tournament fixtures, AI simulation, points table & brackets
│   ├── storage.js          # Browser localStorage persistence for Career & Trophies
│   ├── gameplay.js         # Canvas 60FPS match engine, ball physics & racing sequence
│   ├── ui.js               # Screen router, HUD overlays, scoreboard & modals
│   └── game.js             # Master controller & event bootstrap
│
└── README.md               # Documentation & setup guide
```

---

## 🚀 Installation & GitHub Pages Deployment

### Run Locally
1. Clone or download this repository:
   ```bash
   git clone https://github.com/jawadakhter/cricket-rush.git
   cd cricket-rush
   ```
2. Open `index.html` directly in any modern web browser. No web server or Node.js required!

### Deploy to GitHub Pages
1. Push the repository to GitHub.
2. Navigate to **Settings** ➔ **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch** (Branch: `main`, Folder: `/ (root)`).
4. Click **Save**. Your interactive cricket game is live!

---

## 👨‍💻 Author & Quality Assurance

**Jawad Akhter**  
*Software Quality Assurance Engineer*  
- **GitHub**: [github.com/jd577](https://github.com/jd577)  
- **LinkedIn**: [linkedin.com/in/jawad-akhter](https://www.linkedin.com/in/jawad-akhter)

---

*Enjoy playing CRICKET RUSH! May your timing be perfect and your trophies plentiful! 🏆🏏*
