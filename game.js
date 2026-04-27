(function () {
  "use strict";

  const CHOICES = ["rock", "paper", "scissors"];
  const LABELS = {
    rock: "Rock ✊",
    paper: "Paper ✋",
    scissors: "Scissors ✌️",
  };

  const MATCH_TARGET = 3;

  const els = {
    userScore: document.getElementById("userScore"),
    computerScore: document.getElementById("computerScore"),
    resultPanel: document.getElementById("resultPanel"),
    resultEmoji: document.getElementById("resultEmoji"),
    resultMessage: document.getElementById("resultMessage"),
    userChoiceDisplay: document.getElementById("userChoiceDisplay"),
    computerChoiceDisplay: document.getElementById("computerChoiceDisplay"),
    pickButtons: document.querySelectorAll(".pick-btn"),
    resetBtn: document.getElementById("resetBtn"),
    newMatchBtn: document.getElementById("newMatchBtn"),
    bo5Toggle: document.getElementById("bo5Toggle"),
  };

  let userScore = 0;
  let computerScore = 0;
  let bo5 = false;
  let matchOver = false;

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, gainValue) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainValue;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (_) {
      /* ignore */
    }
  }

  function soundWin() {
    playTone(523.25, 0.12, "sine", 0.12);
    setTimeout(function () {
      playTone(659.25, 0.14, "sine", 0.1);
    }, 70);
    setTimeout(function () {
      playTone(783.99, 0.18, "sine", 0.08);
    }, 150);
  }

  function soundLose() {
    playTone(220, 0.22, "triangle", 0.1);
    setTimeout(function () {
      playTone(165, 0.28, "triangle", 0.08);
    }, 100);
  }

  function soundDraw() {
    playTone(392, 0.15, "sine", 0.09);
    setTimeout(function () {
      playTone(392, 0.15, "sine", 0.08);
    }, 120);
  }

  function soundClick() {
    playTone(880, 0.05, "square", 0.03);
  }

  function randomComputerChoice() {
    const i = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[i];
  }

  function decideWinner(user, computer) {
    if (user === computer) return "draw";
    if (
      (user === "rock" && computer === "scissors") ||
      (user === "scissors" && computer === "paper") ||
      (user === "paper" && computer === "rock")
    ) {
      return "win";
    }
    return "lose";
  }

  function setPickDisabled(disabled) {
    els.pickButtons.forEach(function (btn) {
      btn.disabled = disabled;
    });
  }

  function clearResultClasses() {
    els.resultPanel.classList.remove(
      "result-panel--win",
      "result-panel--lose",
      "result-panel--draw",
      "result-panel--pulse"
    );
    els.resultEmoji.classList.remove("result-panel__emoji--pop");
  }

  function flashResult() {
    void els.resultPanel.offsetWidth;
    els.resultPanel.classList.add("result-panel--pulse");
    els.resultEmoji.classList.add("result-panel__emoji--pop");
  }

  function updateBo5UI() {
    els.newMatchBtn.hidden = !(bo5 && matchOver);
  }

  function syncScores() {
    els.userScore.textContent = String(userScore);
    els.computerScore.textContent = String(computerScore);
  }

  function checkMatchEnd() {
    if (!bo5) return;
    if (userScore >= MATCH_TARGET || computerScore >= MATCH_TARGET) {
      matchOver = true;
      setPickDisabled(true);
      els.newMatchBtn.hidden = false;
      if (userScore > computerScore) {
        els.resultEmoji.textContent = "🏆";
        els.resultMessage.textContent = "You won the match!";
        soundWin();
        clearResultClasses();
        els.resultPanel.classList.add("result-panel--win");
      } else {
        els.resultEmoji.textContent = "❌";
        els.resultMessage.textContent = "Computer won the match";
        soundLose();
        clearResultClasses();
        els.resultPanel.classList.add("result-panel--lose");
      }
    }
  }

  function playRound(userChoice) {
    if (matchOver && bo5) return;

    soundClick();

    const computerChoice = randomComputerChoice();
    const outcome = decideWinner(userChoice, computerChoice);

    els.userChoiceDisplay.textContent = LABELS[userChoice];
    els.computerChoiceDisplay.textContent = LABELS[computerChoice];

    clearResultClasses();

    if (outcome === "win") {
      userScore += 1;
      els.resultEmoji.textContent = "🏆";
      els.resultMessage.textContent = "Win";
      els.resultPanel.classList.add("result-panel--win");
      soundWin();
    } else if (outcome === "lose") {
      computerScore += 1;
      els.resultEmoji.textContent = "❌";
      els.resultMessage.textContent = "Lose";
      els.resultPanel.classList.add("result-panel--lose");
      soundLose();
    } else {
      els.resultEmoji.textContent = "🤝";
      els.resultMessage.textContent = "Draw";
      els.resultPanel.classList.add("result-panel--draw");
      soundDraw();
    }

    syncScores();
    flashResult();
    checkMatchEnd();
    updateBo5UI();
  }

  function resetGame() {
    userScore = 0;
    computerScore = 0;
    matchOver = false;
    syncScores();
    setPickDisabled(false);
    els.newMatchBtn.hidden = true;
    els.userChoiceDisplay.textContent = "—";
    els.computerChoiceDisplay.textContent = "—";
    clearResultClasses();
    els.resultEmoji.textContent = "🎮";
    els.resultMessage.textContent = bo5
      ? "Best of 5 — first to " + MATCH_TARGET + " wins the match"
      : "Pick your move";
    updateBo5UI();
  }

  function newMatch() {
    if (!bo5) return;
    userScore = 0;
    computerScore = 0;
    matchOver = false;
    syncScores();
    setPickDisabled(false);
    els.newMatchBtn.hidden = true;
    els.userChoiceDisplay.textContent = "—";
    els.computerChoiceDisplay.textContent = "—";
    clearResultClasses();
    els.resultEmoji.textContent = "🎮";
    els.resultMessage.textContent = "New match — pick your move";
    updateBo5UI();
  }

  els.pickButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const choice = btn.getAttribute("data-choice");
      if (choice) playRound(choice);
    });
  });

  els.resetBtn.addEventListener("click", function () {
    resetGame();
  });

  els.newMatchBtn.addEventListener("click", function () {
    newMatch();
  });

  els.bo5Toggle.addEventListener("change", function () {
    bo5 = els.bo5Toggle.checked;
    resetGame();
  });

  document.body.addEventListener(
    "click",
    function initAudioOnce() {
      getAudioContext();
      document.body.removeEventListener("click", initAudioOnce);
    },
    { once: true }
  );

  updateBo5UI();
})();
