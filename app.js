(() => {
  "use strict";

  const app = document.querySelector("#app");
  const STORAGE_KEY = "nobiru-progress";

  const mathProblems = [
    { question: "36 + 27", answer: "63", hint: "30と20、6と7に分けよう" },
    { question: "84 − 39", answer: "45", hint: "39を40にして考えてみよう" },
    { question: "7 × 8", answer: "56", hint: "7のだんを思い出そう" },
    { question: "96 ÷ 8", answer: "12", hint: "8を何回たすと96？" },
  ];

  const kanjiProblems = [
    { kanji: "泳", reading: "およぐ", word: "水泳", strokes: 8 },
    { kanji: "深", reading: "ふかい", word: "深海", strokes: 11 },
    { kanji: "緑", reading: "みどり", word: "緑茶", strokes: 14 },
  ];

  const levelGroups = [
    { start: 1, end: 10, label: "小学1年生相当", color: "#FF8B67" },
    { start: 11, end: 20, label: "小学2年生相当", color: "#F6B94B" },
    { start: 21, end: 32, label: "小学3年生相当", color: "#31B7A0" },
    { start: 33, end: 44, label: "小学4年生相当", color: "#55A7E8" },
    { start: 45, end: 56, label: "小学5年生相当", color: "#7774E7" },
    { start: 57, end: 68, label: "小学6年生相当", color: "#A970D9" },
    { start: 69, end: 78, label: "中学1年生相当", color: "#5471C8" },
    { start: 79, end: 88, label: "中学2年生相当", color: "#39559F" },
    { start: 89, end: 96, label: "中学3年生相当", color: "#243B72" },
    { start: 97, end: 100, label: "高校入試チャレンジ", color: "#18294F" },
  ];

  const state = {
    view: "home",
    level: 24,
    xp: 68,
    streak: 7,
    placementOpen: false,
    toast: "",
    toastTimer: 0,
    kanjiIndex: 0,
    kanjiMarks: 0,
    kanjiChecking: false,
    mathIndex: 0,
    mathAnswer: "",
    mathResult: "idle",
  };

  loadProgress();
  render();

  app.addEventListener("click", handleClick);

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (Number.isFinite(saved.level)) state.level = clamp(saved.level, 1, 100);
      if (Number.isFinite(saved.xp)) state.xp = clamp(saved.xp, 0, 100);
    } catch {
      // 保存内容が壊れていても初期値で学習を続ける。
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ level: state.level, xp: state.xp }),
      );
    } catch {
      // プライベートブラウズなどで保存できない場合は画面内だけで継続する。
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  function gradeForLevel(level) {
    const group = levelGroups.find((item) => level >= item.start && level <= item.end);
    return group ? group.label : "高校入試チャレンジ";
  }

  function render() {
    const views = {
      home: homeTemplate,
      kanji: kanjiTemplate,
      math: mathTemplate,
      levels: levelsTemplate,
      profile: profileTemplate,
    };
    const showNav = !["kanji", "math"].includes(state.view);

    app.innerHTML = `
      ${views[state.view]()}
      ${showNav ? bottomNavTemplate() : ""}
      ${state.placementOpen ? placementTemplate() : ""}
      ${state.toast ? `<div class="toast" role="status"><span>★</span> ${state.toast}</div>` : ""}
    `;

    if (state.view === "kanji") setupWritingCanvas();
  }

  function homeTemplate() {
    const roadLevels = [
      state.level - 2,
      state.level - 1,
      state.level,
      state.level + 1,
      state.level + 2,
    ].map((level) => clamp(level, 1, 100));

    return `
      <div class="screen home-screen">
        <header class="topbar">
          <button class="brand" type="button" data-action="home" aria-label="ホーム">
            <span class="brand-mark">の</span><span>のびる</span>
          </button>
          <div class="streak-pill" aria-label="${state.streak}日連続">
            <span class="flame">●</span><b>${state.streak}</b>日連続
          </div>
        </header>

        <section class="welcome">
          <div>
            <p class="eyebrow">おかえり、ゆうきさん</p>
            <h1>きょうも、ひとつ<br /><span>のびよう。</span></h1>
          </div>
          <button class="profile-dot" type="button" data-view="profile" aria-label="プロフィールを開く">ゆ</button>
        </section>

        <section class="level-card" aria-label="現在レベル${state.level}">
          <div class="level-copy">
            <span class="level-kicker">あなたのレベル</span>
            <div class="level-number"><small>Lv.</small>${state.level}</div>
            <span class="grade-chip">${gradeForLevel(state.level)}</span>
            <button type="button" class="text-link" data-action="open-placement">
              実力チェックで調整 <span aria-hidden="true">›</span>
            </button>
          </div>
          <div class="progress-orbit" style="--progress: ${state.xp * 3.6}deg">
            <div><b>${state.xp}%</b><span>あと${Math.max(1, Math.ceil((100 - state.xp) / 16))}問</span></div>
          </div>
          <span class="level-card-shape shape-one"></span>
          <span class="level-card-shape shape-two"></span>
        </section>

        <section class="today-section">
          <div class="section-heading">
            <div><p class="eyebrow">TODAY'S TRAINING</p><h2>きょうのトレーニング</h2></div>
            <span class="daily-count">0 / 2</span>
          </div>
          <div class="subject-grid">
            <button type="button" class="subject-card kanji-card" data-view="kanji">
              <span class="subject-icon kanji-icon">漢</span>
              <span class="subject-time">約3分</span>
              <span class="subject-name">漢字を書く</span>
              <span class="subject-detail">3問 ・ 手書き</span>
              <span class="start-arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" class="subject-card math-card" data-view="math">
              <span class="subject-icon math-icon">12</span>
              <span class="subject-time">約2分</span>
              <span class="subject-name">暗算する</span>
              <span class="subject-detail">5問 ・ テンポよく</span>
              <span class="start-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section class="road-section">
          <div class="section-heading compact">
            <div><p class="eyebrow">LEVEL ROAD</p><h2>つぎの景色まで</h2></div>
            <button type="button" class="text-link" data-view="levels">すべて見る <span>›</span></button>
          </div>
          <div class="level-road" aria-label="レベルロード">
            ${roadLevels.map((level) => `
              <div class="road-step ${level < state.level ? "done" : ""} ${level === state.level ? "current" : ""}">
                <span>${level < state.level ? "✓" : level}</span>
                ${level === state.level ? "<small>いま</small>" : ""}
              </div>
            `).join("")}
            <div class="road-line"></div>
          </div>
          <p class="road-note"><span>◆</span> Lv.${Math.min(100, state.level + 1)}で新しいテーマがオープン</p>
        </section>

        <div class="encouragement">
          <span class="mini-face">☺</span>
          <p><b>毎日5分でも、ちゃんとのびる。</b><br />きのうの自分を少しだけこえよう。</p>
        </div>
      </div>
    `;
  }

  function lessonHeader(title, current, total) {
    return `
      <header class="lesson-header">
        <button class="round-button" type="button" data-action="back-home" aria-label="戻る">‹</button>
        <div class="lesson-heading">
          <span>${title}</span>
          <div class="lesson-progress"><i style="width:${(current / total) * 100}%"></i></div>
        </div>
        <span class="question-count">${current}<small> / ${total}</small></span>
      </header>
    `;
  }

  function kanjiTemplate() {
    const problem = kanjiProblems[state.kanjiIndex];
    return `
      <div class="screen lesson-screen kanji-lesson">
        ${lessonHeader("漢字を書く", state.kanjiIndex + 1, kanjiProblems.length)}
        <div class="lesson-level-row"><span>Lv.${state.level}</span><span>${gradeForLevel(state.level)}</span></div>
        <section class="prompt-area">
          <p class="eyebrow">お題</p>
          <h1>「${problem.reading}」を<br />漢字で書こう</h1>
          <p class="word-example">ことば：<b>${problem.word}</b> ・ ${problem.strokes}画</p>
        </section>
        <div class="writing-pad ${state.kanjiChecking ? "checking" : ""}">
          <span class="guide-kanji" aria-hidden="true">${problem.kanji}</span>
          <canvas id="writingCanvas" width="640" height="640" aria-label="${problem.reading}を手書きするスペース"></canvas>
          <span class="pad-label">ゆびやペンで書いてね</span>
        </div>
        ${state.kanjiChecking ? `
          <div class="self-check-card">
            <div>
              <span class="answer-stamp">${problem.kanji}</span>
              <p><b>形と書き順を見くらべよう</b><br />うまく書けたかな？</p>
            </div>
            <div class="self-check-actions">
              <button type="button" data-action="kanji-retry">もう一度</button>
              <button type="button" data-action="kanji-success">できた！</button>
            </div>
          </div>
        ` : `
          <div class="lesson-actions">
            <button type="button" class="secondary-button" data-action="clear-kanji">↺ 書きなおす</button>
            <button type="button" class="primary-button" data-action="check-kanji" ${state.kanjiMarks < 5 ? "disabled" : ""}>
              お手本とくらべる
            </button>
          </div>
        `}
      </div>
    `;
  }

  function setupWritingCanvas() {
    const canvas = document.querySelector("#writingCanvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    let drawing = false;
    let previous = null;

    const pointFor = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    canvas.addEventListener("pointerdown", (event) => {
      drawing = true;
      previous = pointFor(event);
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drawing || !previous) return;
      const point = pointFor(event);
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = "#20304b";
      context.lineWidth = 12;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      previous = point;
      state.kanjiMarks += 1;
      const checkButton = document.querySelector("[data-action='check-kanji']");
      if (checkButton && state.kanjiMarks >= 5) checkButton.disabled = false;
    });
    const stop = () => {
      drawing = false;
      previous = null;
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  }

  function mathTemplate() {
    const problem = mathProblems[state.mathIndex];
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const message =
      state.mathResult === "wrong"
        ? '<p class="result-message">おしい！ もう一度考えよう</p>'
        : state.mathResult === "correct"
          ? '<p class="result-message success">正解！ いいテンポ！</p>'
          : "";

    return `
      <div class="screen lesson-screen math-lesson">
        ${lessonHeader("暗算する", state.mathIndex + 1, 5)}
        <div class="lesson-level-row">
          <span>Lv.${state.level}</span><span>${gradeForLevel(state.level)}</span><span class="timer">◷ 00:12</span>
        </div>
        <section class="math-question">
          <p class="eyebrow">こたえはいくつ？</p>
          <h1>${problem.question}</h1>
          <div class="answer-box ${state.mathResult}">${state.mathAnswer || "<span>?</span>"}</div>
          ${message}
        </section>
        <div class="hint-box"><span>ヒント</span><p>${problem.hint}</p></div>
        <div class="number-pad" aria-label="数字キーパッド">
          ${keys.map((key) => `<button type="button" data-number="${key}">${key}</button>`).join("")}
          <button type="button" class="pad-blank" tabindex="-1" aria-hidden="true"></button>
          <button type="button" data-number="0">0</button>
          <button type="button" class="delete-key" data-action="delete-number" aria-label="一文字消す">⌫</button>
        </div>
        ${state.mathResult === "correct"
          ? '<button type="button" class="primary-button wide" data-action="next-math">つぎの問題へ →</button>'
          : `<button type="button" class="primary-button wide" data-action="submit-math" ${state.mathAnswer ? "" : "disabled"}>こたえる</button>`
        }
      </div>
    `;
  }

  function levelsTemplate() {
    return `
      <div class="screen sub-screen level-map-screen">
        <header class="sub-header">
          <button class="round-button" type="button" data-action="back-home" aria-label="戻る">‹</button>
          <div><p class="eyebrow">LEVEL 1–100</p><h1>レベルロード</h1></div>
        </header>
        <div class="map-intro"><span>現在地</span><b>Lv.${state.level}</b><p>${gradeForLevel(state.level)}</p></div>
        <div class="level-groups">
          ${levelGroups.map((group) => {
            const complete = state.level > group.end;
            const active = state.level >= group.start && state.level <= group.end;
            const percent = complete
              ? 100
              : active
                ? Math.round(((state.level - group.start + 1) / (group.end - group.start + 1)) * 100)
                : 0;
            return `
              <article class="level-group ${active ? "active" : ""}">
                <span class="group-orb" style="background:${group.color}">${complete ? "✓" : group.start}</span>
                <div>
                  <p>LEVEL ${group.start}–${group.end}</p>
                  <h2>${group.label}</h2>
                  <div class="group-progress"><i style="width:${percent}%;background:${group.color}"></i></div>
                </div>
                <span class="group-status">${complete ? "修了" : active ? `${percent}%` : "🔒"}</span>
              </article>
            `;
          }).join("")}
        </div>
        <div class="fine-level-note">
          <span>100</span>
          <p><b>得意な人にも、次の一歩を。</b><br />高いレベルほどテーマを細かく分け、達成のチャンスがたくさんあります。</p>
        </div>
      </div>
    `;
  }

  function profileTemplate() {
    return `
      <div class="screen sub-screen profile-screen">
        <header class="sub-header">
          <button class="round-button" type="button" data-action="back-home" aria-label="戻る">‹</button>
          <div><p class="eyebrow">MY PAGE</p><h1>これまでの記録</h1></div>
        </header>
        <div class="profile-card">
          <span class="profile-avatar">ゆ</span><h2>ゆうきさん</h2>
          <p>${gradeForLevel(state.level)}</p><strong>Lv.${state.level}</strong>
        </div>
        <div class="stat-grid">
          <div><span>●</span><b>${state.streak}日</b><small>連続学習</small></div>
          <div><span>✓</span><b>128問</b><small>できた問題</small></div>
          <div><span>★</span><b>6こ</b><small>獲得バッジ</small></div>
        </div>
        <section class="badge-section">
          <p class="eyebrow">COLLECTION</p><h2>がんばりバッジ</h2>
          <div class="badges"><span>7</span><span>漢</span><span>＋</span><span class="locked-badge">?</span></div>
        </section>
        <button type="button" class="placement-button" data-action="open-placement">
          <span class="placement-symbol">↗</span>
          <span><b>はじめのレベルを見なおす</b><small>得意なら上のレベルへ進めます</small></span>
          <i>›</i>
        </button>
      </div>
    `;
  }

  function placementTemplate() {
    const choices = [
      { level: 1, title: "まずはゆっくり", detail: "ひらがな・1けたの計算から" },
      { level: 24, title: "学校の勉強は得意", detail: "小学3年生相当から" },
      { level: 72, title: "かなり自信あり", detail: "中学1年生相当から" },
      { level: 90, title: "入試問題に挑戦", detail: "中学3年生相当から" },
    ];
    return `
      <div class="sheet-backdrop" data-action="close-placement">
        <section class="placement-sheet" role="dialog" aria-modal="true" aria-labelledby="placement-title">
          <div class="sheet-handle"></div>
          <button type="button" class="sheet-close" data-action="close-placement" aria-label="閉じる">×</button>
          <p class="eyebrow">STARTING POINT</p><h2 id="placement-title">どこから始める？</h2>
          <p class="sheet-lead">今の自分に近いものを選んでね。<br />あとからいつでも変えられます。</p>
          <div class="placement-options">
            ${choices.map((choice) => `
              <button type="button" data-placement="${choice.level}">
                <span>Lv.${choice.level}</span>
                <span><b>${choice.title}</b><small>${choice.detail}</small></span><i>›</i>
              </button>
            `).join("")}
          </div>
          <p class="sheet-note">高いレベルほど1テーマを細かく分け、テンポよくレベルアップできます。</p>
        </section>
      </div>
    `;
  }

  function bottomNavTemplate() {
    const items = [
      { id: "home", icon: "⌂", label: "ホーム" },
      { id: "levels", icon: "◫", label: "レベル" },
      { id: "profile", icon: "○", label: "きろく" },
    ];
    return `
      <nav class="bottom-nav" aria-label="メインメニュー">
        ${items.map((item) => `
          <button type="button" data-view="${item.id}" class="${state.view === item.id ? "active" : ""}">
            <span>${item.icon}</span>${item.label}
          </button>
        `).join("")}
      </nav>
    `;
  }

  function handleClick(event) {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      state.view = viewButton.dataset.view;
      resetLessonState();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const placement = event.target.closest("[data-placement]");
    if (placement) {
      state.level = clamp(placement.dataset.placement, 1, 100);
      state.xp = 0;
      state.placementOpen = false;
      saveProgress();
      showToast(`レベル ${state.level} からスタート！`);
      render();
      return;
    }

    const numberButton = event.target.closest("[data-number]");
    if (numberButton) {
      if (state.mathAnswer.length < 3) state.mathAnswer += numberButton.dataset.number;
      state.mathResult = "idle";
      render();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;

    if (action === "close-placement" && event.target.closest(".placement-sheet") && !event.target.closest(".sheet-close")) {
      return;
    }

    const actions = {
      home() {
        state.view = "home";
        render();
      },
      "back-home"() {
        state.view = "home";
        resetLessonState();
        render();
      },
      "open-placement"() {
        state.placementOpen = true;
        render();
      },
      "close-placement"() {
        state.placementOpen = false;
        render();
      },
      "clear-kanji"() {
        state.kanjiMarks = 0;
        state.kanjiChecking = false;
        render();
      },
      "check-kanji"() {
        if (state.kanjiMarks < 5) return;
        state.kanjiChecking = true;
        render();
      },
      "kanji-retry"() {
        state.kanjiMarks = 0;
        state.kanjiChecking = false;
        render();
      },
      "kanji-success"() {
        earnXp(18);
        state.kanjiIndex = (state.kanjiIndex + 1) % kanjiProblems.length;
        state.kanjiMarks = 0;
        state.kanjiChecking = false;
        render();
      },
      "delete-number"() {
        state.mathAnswer = state.mathAnswer.slice(0, -1);
        state.mathResult = "idle";
        render();
      },
      "submit-math"() {
        if (!state.mathAnswer) return;
        const problem = mathProblems[state.mathIndex];
        state.mathResult = state.mathAnswer === problem.answer ? "correct" : "wrong";
        if (state.mathResult === "correct") earnXp(16);
        render();
      },
      "next-math"() {
        state.mathIndex = (state.mathIndex + 1) % mathProblems.length;
        state.mathAnswer = "";
        state.mathResult = "idle";
        render();
      },
    };

    actions[action]?.();
  }

  function resetLessonState() {
    state.kanjiMarks = 0;
    state.kanjiChecking = false;
    state.mathAnswer = "";
    state.mathResult = "idle";
  }

  function earnXp(amount) {
    const total = state.xp + amount;
    if (total >= 100 && state.level < 100) {
      state.level += 1;
      state.xp = total - 100;
      showToast(`レベル ${state.level} にアップ！`);
    } else {
      state.xp = Math.min(100, total);
      showToast(`+${amount} XP！`);
    }
    saveProgress();
  }

  function showToast(message) {
    state.toast = message;
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      state.toast = "";
      render();
    }, 2400);
  }
})();
