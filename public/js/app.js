/**
 * ==========================================================================
 * SECOPS x SAN ANDREAS — ASK CJ CTF APPLICATION LOGIC
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Flag Generator
  const F = [83, 101, 99, 79, 112, 115, 123, 71, 84, 65, 95, 83, 65, 78, 95, 65, 78, 68, 82, 69, 65, 83, 125];
  const getFlag = () => String.fromCharCode(...F);

  // Localization Dialogue Quotes
  const DIALOGUE = {
    EN: {
      subhead: "Welcome to Los Santos. Get 6 of 10 right and capture the flag.",
      welcome: "Ah, here we go again. Name's <b>CJ</b>, straight outta Grove Street. Welcome to the <b>SecOps Club</b> challenge. Think you know San Andreas? Get <b>6 out of 10</b> right and I'll hand you the <b>flag</b>.",
      ok: [
        "Hell yeah! That's what I'm talkin' about.",
        "Respect. You know your Grove Street.",
        "Straight up! Keep it rollin', homie.",
        "Now you're cookin', cuz."
      ],
      ko: [
        "Aw man, you been sleepin' on that one.",
        "Nah homie, that ain't it.",
        "Damn... ain't nobody told you about that?",
        "Wrong turn, cuz. Watch the road."
      ],
      itWas: "It was",
      wrap: "That's a wrap. You scored",
      missionPassed: "MISSION PASSED!",
      wasted: "WASTED",
      respectWin: "Respect +++. You're Grove Street for life. Here's your flag:",
      respectLose: "You needed 6 to get the flag. Hit me up again, the questions change every round.",
      copyBtn: "Copy flag",
      copiedMsg: "Copied!",
      tryAgain: "Try again"
    },
    FR: {
      subhead: "Bienvenue à Los Santos. Obtiens 6/10 pour capturer le flag.",
      welcome: "Ah, c'est reparti pour un tour ! Moi c'est <b>CJ</b>, en direct de Grove Street. Bienvenue dans le challenge <b>SecOps Club</b>. Tu penses connaître San Andreas ? Donne <b>6 bonnes réponses sur 10</b> et je te donne le <b>flag</b>.",
      ok: [
        "Ouais mon gars ! C'est exactement ça.",
        "Respect. Tu connais ton hood sur le bout des doigts.",
        "Carré ! Continue comme ça homie.",
        "Bien vu, ça gère !"
      ],
      ko: [
        "Ah la poisse, t'as dormi sur cette question.",
        "Nan homie, c'est pas la bonne réponse.",
        "Bordel... personne t'a briefé là-dessus ?",
        "Mauvaise route, mon vieux."
      ],
      itWas: "La réponse était",
      wrap: "C'est terminé ! Ton score final est de",
      missionPassed: "MISSION REUSSIE !",
      wasted: "WASTED",
      respectWin: "Respect +++. T'es de Grove Street à vie ! Voici ton flag :",
      respectLose: "Il te fallait au moins 6/10 pour avoir le flag. Retente ta chance !",
      copyBtn: "Copier le flag",
      copiedMsg: "Copié !",
      tryAgain: "Recommencer"
    }
  };

  // State Variables
  let currentLang = 'FR';
  let questions = [];
  let index = 0;
  let score = 0;
  let respect = 0; // Starts at 0, increases ONLY on correct answers
  let wanted = 0;  // Starts at 0, increases ONLY on wrong answers
  let cash = 250000;
  let activeQuestion = null;
  let isAnswering = false;

  // DOM Elements
  const log = document.getElementById('log');
  const bar = document.getElementById('bar');
  const wantedStars = document.getElementById('wanted-stars');
  const hudCnt = document.getElementById('hud-cnt');
  const hudCash = document.getElementById('hud-cash');
  const subheadText = document.getElementById('subhead-text');
  const btnLang = document.getElementById('btn-lang');
  const langLabel = document.getElementById('lang-label');
  const btnSound = document.getElementById('btn-sound');

  // Cheat Modal Elements
  const btnCheatToggle = document.getElementById('btn-cheat-toggle');
  const cheatModal = document.getElementById('cheat-modal');
  const cheatInput = document.getElementById('cheat-input');
  const cheatSubmitBtn = document.getElementById('cheat-submit-btn');
  const cheatClose = document.getElementById('cheat-close');

  // Helpers
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    arr = arr.slice();
    for (let k = arr.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    return arr;
  };
  const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // Pick Questions from Pool with localStorage memory
  function pickQuestions() {
    const rawPool = (currentLang === 'FR' && typeof POOL_FR !== 'undefined') ? POOL_FR : POOL_EN;
    let seen = [];
    try {
      seen = JSON.parse(localStorage.getItem('sa_seen_' + currentLang) || '[]');
    } catch (e) {}

    const ids = rawPool.map((_, k) => k);
    let fresh = ids.filter(k => !seen.includes(k));
    if (fresh.length < 10) {
      seen = [];
      fresh = ids;
    }

    const chosen = shuffle(fresh).slice(0, 10);
    try {
      localStorage.setItem('sa_seen_' + currentLang, JSON.stringify(seen.concat(chosen)));
    } catch (e) {}

    return chosen.map(k => rawPool[k]);
  }

  // Avatar SVG
  const AV = `<div class="av">
    <svg viewBox="0 0 40 40">
      <rect width="40" height="40" fill="#0d2a12"/>
      <path d="M6 40c2-9 8-12 14-12s12 3 14 12z" fill="#e8e8e8"/>
      <circle cx="20" cy="18" r="9" fill="#8a5a3c"/>
      <path d="M10 15c1-8 7-10 11-10s9 2 10 10c-4-3-9-4-10-4s-7 1-11 4z" fill="#39d353"/>
      <path d="M9 15h22v3H9z" fill="#2aa83f"/>
      <rect x="11" y="18" width="8" height="4" rx="1.5" fill="#111"/>
      <rect x="21" y="18" width="8" height="4" rx="1.5" fill="#111"/>
      <path d="M16 26q4 2 8 0" stroke="#3a2012" stroke-width="1.5" fill="none"/>
    </svg>
  </div>`;

  function addRow(html, cls = "", isMe = false) {
    const r = document.createElement("div");
    r.className = "row" + (isMe ? " me" : "");
    r.innerHTML = (isMe ? "" : AV) + '<div class="msg ' + cls + '">' + html + '</div>';
    log.appendChild(r);
    log.scrollTop = log.scrollHeight;
    return r;
  }

  async function cjSay(html, cls = "") {
    const t = addRow('<span class="dots"><span></span><span></span><span></span></span>');
    if (typeof AudioEngine !== 'undefined') AudioEngine.playTypewriter();
    await sleep(450 + Math.random() * 200);
    t.remove();
    return addRow(html, cls);
  }

  // Update HUD Display
  function updateHUD() {
    hudCnt.textContent = `${index}/10`;
    hudCash.textContent = `$${cash.toLocaleString()}`;

    // Respect segments (10 LED bars matching current respect count)
    const segments = bar.querySelectorAll('i');
    segments.forEach((seg, i) => {
      if (i < respect) {
        seg.className = "ok";
      } else {
        seg.className = "";
      }
    });

    // Wanted stars (6 max)
    const stars = wantedStars.querySelectorAll('span');
    stars.forEach((star, i) => {
      if (i < wanted) {
        star.textContent = '★';
        star.classList.add('active');
      } else {
        star.textContent = '☆';
        star.classList.remove('active');
      }
    });
  }

  // Start / Restart Challenge Game
  async function startGame() {
    log.innerHTML = "";
    index = 0;
    score = 0;
    respect = 0; // Starts at 0
    wanted = 0;  // Starts at 0
    questions = pickQuestions();

    // Rebuild 10 segment indicators
    bar.innerHTML = "<i></i>".repeat(10);
    updateHUD();

    const locale = DIALOGUE[currentLang];
    subheadText.textContent = locale.subhead;

    await cjSay(locale.welcome);
    askQuestion();
  }

  // Display Next Question
  async function askQuestion() {
    if (index >= 10) {
      endGame();
      return;
    }

    isAnswering = false;
    activeQuestion = questions[index];
    const n = activeQuestion;

    const m = await cjSay(
      `<div class="q">${index + 1}. ${esc(n.q)}</div><div class="opts"></div>`
    );

    const box = m.querySelector(".opts");
    const choices = shuffle([n.a, ...n.w]);
    const badges = ['A', 'B', 'C', 'D'];

    choices.forEach((optText, optIdx) => {
      const b = document.createElement("button");
      b.dataset.val = optText;
      b.innerHTML = `<span class="opt-badge">${badges[optIdx]}</span><span>${esc(optText)}</span>`;
      b.onclick = () => handleAnswer(optText, box);
      b.onmouseenter = () => { if (typeof AudioEngine !== 'undefined') AudioEngine.playHover(); };
      box.appendChild(b);
    });

    log.scrollTop = log.scrollHeight;
  }

  // Handle User Selected Option
  async function handleAnswer(selectedOpt, box) {
    if (isAnswering) return;
    isAnswering = true;

    const n = activeQuestion;
    const isCorrect = selectedOpt === n.a;
    const locale = DIALOGUE[currentLang];

    // Disable all options & highlight right/wrong
    box.querySelectorAll("button").forEach(b => {
      b.disabled = true;
      if (b.dataset.val === n.a) b.classList.add("right");
      else if (b.dataset.val === selectedOpt) b.classList.add("wrong");
    });

    addRow(esc(selectedOpt), "", true);
    if (typeof AudioEngine !== 'undefined') AudioEngine.playBeep();

    if (isCorrect) {
      score++;
      respect = Math.min(10, respect + 1); // Respect increases on correct answer
      if (wanted > 0) wanted--;            // Wanted decreases on correct answer
      cash += 15000;
      if (typeof AudioEngine !== 'undefined') AudioEngine.playCorrect();
    } else {
      respect = Math.max(0, respect - 1);  // Respect decreases on wrong answer
      wanted = Math.min(6, wanted + 1);    // Wanted increases on wrong answer
      if (typeof AudioEngine !== 'undefined') AudioEngine.playWrong();
    }

    index++;
    updateHUD();

    const responseMsg = isCorrect
      ? `✅ ${rnd(locale.ok)}`
      : `❌ ${rnd(locale.ko)} ${locale.itWas} <b>${esc(n.a)}</b>.`;

    await cjSay(responseMsg, isCorrect ? "ok" : "ko");

    await sleep(400);
    if (index < 10) askQuestion();
    else endGame();
  }

  // Mission End Screen
  async function endGame() {
    const locale = DIALOGUE[currentLang];
    await cjSay(`${locale.wrap} <b>${score}/10</b>.`);

    if (score >= 6) {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playMissionPassed();
      triggerConfetti();

      const f = getFlag();
      const m = await cjSay(
        `<div class="big win">${locale.missionPassed}</div>` +
        `${locale.respectWin}` +
        `<span class="flag">${f}</span>` +
        `<button class="btn" id="cp-flag">${locale.copyBtn}</button>` +
        `<button class="btn alt" id="rp-game">${locale.tryAgain}</button>`,
        "ok"
      );

      m.querySelector("#cp-flag").onclick = e => {
        try {
          navigator.clipboard.writeText(f);
          e.target.textContent = locale.copiedMsg;
          if (typeof AudioEngine !== 'undefined') AudioEngine.playBeep();
        } catch (x) {
          e.target.textContent = "Select manually";
        }
      };
      m.querySelector("#rp-game").onclick = startGame;
    } else {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playMissionFailed();

      const m = await cjSay(
        `<div class="big lose">${locale.wasted}</div>` +
        `${locale.respectLose}<br>` +
        `<button class="btn" id="rp-game">${locale.tryAgain}</button>`,
        "ko"
      );

      m.querySelector("#rp-game").onclick = startGame;
    }
  }

  // Keyboard Shortcuts (1-4, A-D)
  document.addEventListener('keydown', e => {
    if (cheatModal && cheatModal.classList.contains('hidden') === false) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCheat(cheatInput.value);
      }
      return;
    }
    if (isAnswering) return;

    const key = e.key.toUpperCase();
    const map = { '1': 0, '2': 1, '3': 2, '4': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    if (key in map) {
      const lastOpts = log.querySelectorAll('.opts:last-child button:not(:disabled)');
      if (lastOpts.length >= 4) {
        lastOpts[map[key]].click();
      }
    }
  });

  // Sound Toggle Button
  btnSound.onclick = () => {
    const isMuted = AudioEngine.toggleMute();
    document.getElementById('icon-sound-on').style.display = isMuted ? 'none' : 'block';
    document.getElementById('icon-sound-off').style.display = isMuted ? 'block' : 'none';
  };

  // Language Toggle Button
  btnLang.onclick = () => {
    currentLang = currentLang === 'FR' ? 'EN' : 'FR';
    langLabel.textContent = currentLang;
    if (typeof AudioEngine !== 'undefined') AudioEngine.playBeep();
    startGame();
  };

  // Cheat Console Controls
  btnCheatToggle.onclick = () => {
    cheatModal.classList.remove('hidden');
    cheatInput.value = '';
    setTimeout(() => cheatInput.focus(), 100);
    if (typeof AudioEngine !== 'undefined') AudioEngine.playBeep();
  };

  cheatClose.onclick = () => cheatModal.classList.add('hidden');

  function executeCheat(rawCode) {
    const code = (rawCode || '').trim().toUpperCase();
    cheatModal.classList.add('hidden');

    if (!code) return;

    if (code === 'HESOYAM') {
      cash += 250000;
      respect = 10;
      updateHUD();
      if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
      cjSay("💰 <b>CHEAT ACTIVATED</b>: Respect Max (10/10) + $250k Cash!", "ok");
    } else if (code === 'AEZAKMI') {
      wanted = 0;
      updateHUD();
      if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
      cjSay("🚔 <b>CHEAT ACTIVATED</b>: Wanted Level Cleared!", "ok");
    } else if (code === 'BAGUVIX') {
      if (activeQuestion && !isAnswering) {
        const btns = Array.from(log.querySelectorAll('.opts:last-child button:not(:disabled)'));
        const wrongs = btns.filter(b => b.dataset.val !== activeQuestion.a);
        if (wrongs.length > 0) {
          const toRemove = wrongs[0];
          toRemove.classList.add('hint-removed');
          if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
          cjSay("🛡️ <b>CHEAT ACTIVATED</b>: One wrong answer removed!", "ok");
        } else {
          if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
          cjSay("🛡️ <b>CHEAT ACTIVATED</b>: Answer hint shield online!", "ok");
        }
      } else {
        if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
        cjSay("🛡️ <b>CHEAT ACTIVATED</b>: Invincibility enabled!", "ok");
      }
    } else if (code === 'ROCKETMAN' || code === 'JUMPJET') {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playCheatCode();
      cjSay("🚀 <b>CHEAT ACTIVATED</b>: Jetpack inbound, cuz!", "ok");
    } else {
      if (typeof AudioEngine !== 'undefined') AudioEngine.playWrong();
      cjSay("❌ Code de triche invalide / Invalid cheat code, homie.", "ko");
    }
  }

  cheatSubmitBtn.onclick = () => executeCheat(cheatInput.value);

  // Clickable cheat hint buttons in modal
  document.querySelectorAll('.cheat-badge').forEach(badge => {
    badge.onclick = () => {
      const code = badge.dataset.code;
      executeCheat(code);
    };
  });

  // Confetti Particle Generator
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#39d353', '#34e0d0', '#ffd24a', '#ff5d3a', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        color: rnd(colors),
        vy: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1,
        rot: Math.random() * 360,
        vRot: Math.random() * 6 - 3
      });
    }

    let frames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vRot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frames++;
      if (frames < 180) requestAnimationFrame(render);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    render();
  }

  // Background Canvas Matrix Rain & Cyber Network
  (function initSceneCanvas() {
    const n = document.getElementById("net");
    const r = document.getElementById("rain");
    if (!n || !r) return;

    const nx = n.getContext("2d");
    const rx = r.getContext("2d");
    let W, H, cols, drops, nodes;
    const fs = 14;
    const ch = "01ABCDEF{}<>/$#アカサタナ";
    let last = 0;
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    function size() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      [n, r].forEach(c => {
        c.width = W * d;
        c.height = H * d;
      });
      nx.setTransform(d, 0, 0, d, 0, 0);
      rx.setTransform(d, 0, 0, d, 0, 0);

      cols = Math.ceil(W / fs);
      drops = [];
      for (let i = 0; i < cols; i++) drops.push(Math.random() * -40);

      const k = Math.min(Math.round((W * H) / 30000), 36);
      nodes = [];
      for (let j = 0; j < k; j++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2
        });
      }
    }

    function draw() {
      rx.globalCompositeOperation = "destination-out";
      rx.fillStyle = "rgba(0,0,0,.1)";
      rx.fillRect(0, 0, W, H);
      rx.globalCompositeOperation = "source-over";
      rx.font = fs + "px monospace";

      for (let i = 0; i < cols; i++) {
        if (i % 3 === 1) continue;
        rx.fillStyle = i % 7 === 0 ? "rgba(52,224,208,.6)" : "rgba(57,211,83,.38)";
        rx.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, drops[i] * fs);
        if (drops[i] * fs > H * 0.7 && Math.random() > 0.96) drops[i] = 0;
        drops[i] += 0.5;
      }

      nx.clearRect(0, 0, W, H);
      for (let a = 0; a < nodes.length; a++) {
        const p = nodes[a];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H * 0.5) p.vy *= -1;

        for (let b = a + 1; b < nodes.length; b++) {
          const q = nodes[b];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            nx.strokeStyle = "rgba(52,224,208," + 0.4 * (1 - d / 150) + ")";
            nx.lineWidth = 1;
            nx.beginPath();
            nx.moveTo(p.x, p.y);
            nx.lineTo(q.x, q.y);
            nx.stroke();
          }
        }
        nx.fillStyle = "rgba(52,224,208,.9)";
        nx.beginPath();
        nx.arc(p.x, p.y, 2, 0, 6.3);
        nx.fill();
      }
    }

    function loop(t) {
      if (!document.hidden && t - last > 45) {
        last = t;
        draw();
      }
      requestAnimationFrame(loop);
    }

    size();
    window.addEventListener("resize", size);
    if (still) {
      for (let i = 0; i < 60; i++) draw();
    } else {
      requestAnimationFrame(loop);
    }
  })();

  // Audio Context auto unlock on first click anywhere
  document.body.addEventListener('click', () => {
    if (typeof AudioEngine !== 'undefined') AudioEngine.init();
  }, { once: true });

  // Launch initial game
  startGame();
});
