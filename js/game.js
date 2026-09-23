/**
 * CRICKET RUSH — Master Game Controller & Bootstrap
 * Orchestrates sound initialization, storage loading, tournament flow, and UI transitions.
 * Built by Jawad Akhter | Software Quality Assurance Engineer
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Audio Engine on first user interaction
  const initAudio = () => {
    if (window.cricketSound) {
      window.cricketSound.init();
      window.cricketSound.resume();
    }
    window.removeEventListener("click", initAudio);
    window.removeEventListener("keydown", initAudio);
    window.removeEventListener("touchstart", initAudio);
  };
  window.addEventListener("click", initAudio);
  window.addEventListener("keydown", initAudio);
  window.addEventListener("touchstart", initAudio);

  // 2. Initialize UI Manager
  if (window.UIManager) {
    window.UIManager.init();
  }

  // 3. Bind Main Menu Buttons
  const btnPlay = document.getElementById("btn-menu-play");
  if (btnPlay) {
    btnPlay.addEventListener("click", () => {
      window.UIManager.showScreen("screen-team-select");
    });
  }

  const btnContinue = document.getElementById("btn-continue-career");
  if (btnContinue) {
    btnContinue.addEventListener("click", () => {
      if (window.StorageManager.hasActiveTournament()) {
        window.UIManager.showScreen("screen-tournament-dashboard");
      }
    });
  }

  const btnTournaments = document.getElementById("btn-menu-tournaments");
  if (btnTournaments) {
    btnTournaments.addEventListener("click", () => {
      window.UIManager.showScreen("screen-tournament-select");
    });
  }

  const btnTrophies = document.getElementById("btn-menu-trophies");
  if (btnTrophies) {
    btnTrophies.addEventListener("click", () => {
      window.UIManager.showScreen("screen-trophy-cabinet");
    });
  }

  const btnCareer = document.getElementById("btn-menu-career");
  if (btnCareer) {
    btnCareer.addEventListener("click", () => {
      window.UIManager.showScreen("screen-career-stats");
    });
  }

  const btnHowToPlay = document.getElementById("btn-menu-how-to-play");
  if (btnHowToPlay) {
    btnHowToPlay.addEventListener("click", () => {
      window.UIManager.showScreen("screen-how-to-play");
    });
  }

  const btnSettings = document.getElementById("btn-menu-settings");
  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      window.UIManager.showScreen("screen-settings");
    });
  }

  console.log("🏏 CRICKET RUSH initialized successfully! Ready for international arcade cricket.");
});
