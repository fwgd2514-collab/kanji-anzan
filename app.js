(() => {
  "use strict";

  const app = document.querySelector("#app");
  const STORAGE_KEY = "nobiru-progress";
  const MODE_INFO = {
    write: { label: "漢字を書く", short: "漢字・書き", xp: 18 },
    read: { label: "漢字を読む", short: "漢字・読み", xp: 12 },
    math: { label: "暗算する", short: "暗算", xp: 16 },
    flash: { label: "フラッシュ暗算", short: "フラッシュ", xp: 14 },
  };
  const DEFAULT_COUNTS = { write: 10, read: 10, math: 10, flash: 10 };

  const kanjiProblems = [
    { kanji: "泳", reading: "およぐ", word: "水泳", strokes: 8 },
    { kanji: "深", reading: "ふかい", word: "深海", strokes: 11 },
    { kanji: "緑", reading: "みどり", word: "緑茶", strokes: 14 },
    { kanji: "橋", reading: "はし", word: "歩道橋", strokes: 16 },
    { kanji: "農", reading: "のう", word: "農業", strokes: 13 },
    { kanji: "港", reading: "みなと", word: "空港", strokes: 12 },
    { kanji: "温", reading: "あたたかい", word: "温度", strokes: 12 },
    { kanji: "章", reading: "しょう", word: "文章", strokes: 11 },
    { kanji: "登", reading: "のぼる", word: "登山", strokes: 12 },
    { kanji: "植", reading: "うえる", word: "植物", strokes: 12 },
    { kanji: "薬", reading: "くすり", word: "薬局", strokes: 16 },
    { kanji: "整", reading: "ととのえる", word: "整理", strokes: 16 },
  ];

  const readingProblems = [
    { kanji: "希望", answer: "きぼう", choices: ["きぼう", "きもう", "きほう", "のぞみ"] },
    { kanji: "緑茶", answer: "りょくちゃ", choices: ["りょくちゃ", "みどりちゃ", "りくちゃ", "ろくちゃ"] },
    { kanji: "深海", answer: "しんかい", choices: ["しんかい", "ふかうみ", "じんかい", "しんがい"] },
    { kanji: "農業", answer: "のうぎょう", choices: ["のうぎょう", "のぎょう", "のうごう", "のうきょう"] },
    { kanji: "登山", answer: "とざん", choices: ["とざん", "とうざん", "のぼりやま", "とさん"] },
    { kanji: "温度", answer: "おんど", choices: ["おんど", "あつど", "おんたく", "うんど"] },
    { kanji: "整理", answer: "せいり", choices: ["せいり", "せいじ", "しょうり", "せり"] },
    { kanji: "植物", answer: "しょくぶつ", choices: ["しょくぶつ", "うえもの", "しょくもの", "しょくもつ"] },
    { kanji: "薬局", answer: "やっきょく", choices: ["やっきょく", "くすりきょく", "やくきょく", "やっきょう"] },
    { kanji: "文章", answer: "ぶんしょう", choices: ["ぶんしょう", "もんしょう", "ぶんそう", "ふみあき"] },
    { kanji: "空港", answer: "くうこう", choices: ["くうこう", "そらみなと", "くこう", "くうごう"] },
    { kanji: "歩道橋", answer: "ほどうきょう", choices: ["ほどうきょう", "ほどうばし", "ふどうきょう", "ほどうはし"] },
  ];

  const mathProblems = [
    { question: "36 + 27", answer: "63", hint: "30と20、6と7に分けよう" },
    { question: "84 − 39", answer: "45", hint: "39を40にして考えてみよう" },
    { question: "7 × 8", answer: "56", hint: "7のだんを思い出そう" },
    { question: "96 ÷ 8", answer: "12", hint: "8を何回たすと96？" },
    { question: "48 + 35", answer: "83", hint: "48に30、そのあと5をたそう" },
    { question: "120 − 47", answer: "73", hint: "47を40と7に分けよう" },
    { question: "9 × 6", answer: "54", hint: "10×6から6をひこう" },
    { question: "144 ÷ 12", answer: "12", hint: "12×12を思い出そう" },
    { question: "75 + 68", answer: "143", hint: "75に25をたして100を作ろう" },
    { question: "203 − 89", answer: "114", hint: "89を90にして考えよう" },
    { question: "25 × 4", answer: "100", hint: "25が4つで100" },
    { question: "180 ÷ 15", answer: "12", hint: "15×10に、15をあと2つ" },
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
    learnerName: "",
    counts: { ...DEFAULT_COUNTS },
    checkpointEvery: 5,
    placementOpen: false,
    checkpointOpen: false,
    toast: "",
    toastTimer: 0,
    session: null,
    kanjiMarks: 0,
    kanjiChecking: false,
    kanjiImage: "",
    readingChoice: "",
    readingChecked: false,
    mathAnswer: "",
    mathResult: "idle",
    flashSequence: [],
    flashAnswer: "",
    flashResult: "idle",
    flashPhase: "ready",
    flashTimer: 0,
    flashRunToken: 0,
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
      if (typeof saved.learnerName === "string") state.learnerName = saved.learnerName.slice(0, 20);
      if (saved.counts && typeof saved.counts === "object") {
        Object.keys(DEFAULT_COUNTS).forEach((mode) => {
          state.counts[mode] = clamp(saved.counts[mode] || 10, 3, 50);
        });
      }
      if ([3, 5].includes(Number(saved.checkpointEvery))) {
        state.checkpointEvery = Number(saved.checkpointEvery);
      }
    } catch {
      // 保存内容が壊れていても初期設定で学習を続ける。
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          level: state.level,
          xp: state.xp,
          learnerName: state.learnerName,
          counts: state.counts,
          checkpointEvery: state.checkpointEvery,
        }),
      );
    } catch {
      // 保存できない環境では画面内だけで学習を続ける。
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  function gradeForLevel(level) {
    const group = levelGroups.find((item) => level >= item.start && level <= item.end);
    return group ? group.label : "高校入試チャレンジ";
  }

  function displayName() {
    return state.learnerName || "ゲスト";
  }

  function currentNumber() {
    return state.session ? state.session.completed + 1 : 1;
  }

  function render() {
    const views = {
      home: homeTemplate,
      write: writeTemplate,
      read: readTemplate,
      math: mathTemplate,
      flash: flashTemplate,
      levels: levelsTemplate,
      profile: profileTemplate,
      result: resultTemplate,
    };
    const showNav = ["home", "levels", "profile"].includes(state.view);
    app.innerHTML = `
      ${views[state.view]()}
      ${showNav ? bottomNavTemplate() : ""}
      ${state.placementOpen ? placementTemplate() : ""}
      ${state.checkpointOpen ? checkpointTemplate() : ""}
      ${state.toast ? `<div class="toast" role="status"><span>★</span> ${state.toast}</div>` : ""}
    `;
    if (state.view === "write") setupWritingCanvas();
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
          <button class="brand" type="button" data-view="home" aria-label="ホーム">
            <span class="brand-mark">の</span><span>のびる</span>
          </button>
          <div class="streak-pill" aria-label="${state.streak}日連続">
            <span class="flame">●</span><b>${state.streak}</b>日連続
          </div>
        </header>

        <section class="welcome">
          <div>
            <p class="eyebrow">おかえり、${escapeHtml(displayName())}さん</p>
            <h1>きょうも、ひとつ<br /><span>のびよう。</span></h1>
          </div>
          <button class="profile-dot" type="button" data-view="profile" aria-label="プロフィールを開く">
            ${escapeHtml(displayName().slice(0, 1))}
          </button>
        </section>

        ${state.learnerName ? "" : `
          <button type="button" class="registration-prompt" data-view="profile">
            <span class="registration-icon">＋</span>
            <span><b>なまえを登録しよう</b><small>学習画面に自分の名前が表示されます</small></span>
            <i>›</i>
          </button>
        `}

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
            <button class="daily-count settings-link" type="button" data-view="profile">問題数を変更</button>
          </div>
          <div class="subject-grid">
            ${subjectCard("write", "漢", "漢字を書く", "手書き", "kanji-card", "kanji-icon")}
            ${subjectCard("read", "読", "漢字を読む", "4択クイズ", "reading-subject-card", "reading-icon")}
            ${subjectCard("math", "12", "暗算する", "数字パッド", "math-card", "math-icon")}
            ${subjectCard("flash", "瞬", "フラッシュ暗算", "数字を記憶", "flash-subject-card", "flash-icon")}
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
          <p><b>毎日5分でも、ちゃんとのびる。</b><br />${state.checkpointEvery}問ごとに、続けるか休むか選べます。</p>
        </div>
      </div>
    `;
  }

  function subjectCard(mode, icon, name, detail, cardClass, iconClass) {
    return `
      <button type="button" class="subject-card ${cardClass}" data-start="${mode}">
        <span class="subject-icon ${iconClass}">${icon}</span>
        <span class="subject-time">約${mode === "flash" ? 2 : 3}分</span>
        <span class="subject-name">${name}</span>
        <span class="subject-detail">${state.counts[mode]}問 ・ ${detail}</span>
        <span class="start-arrow" aria-hidden="true">→</span>
      </button>
    `;
  }

  function startSession(mode) {
    stopFlash();
    state.session = {
      mode,
      total: state.counts[mode],
      completed: 0,
      correct: 0,
      attempts: 0,
      endedEarly: false,
    };
    state.view = mode;
    resetQuestionState();
    if (mode === "flash") prepareFlashQuestion();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function lessonHeader(title) {
    const session = state.session;
    return `
      <header class="lesson-header">
        <button class="round-button" type="button" data-action="ask-exit" aria-label="戻る">‹</button>
        <div class="lesson-heading">
          <span>${title}</span>
          <div class="lesson-progress"><i style="width:${(session.completed / session.total) * 100}%"></i></div>
        </div>
        <span class="question-count">${currentNumber()}<small> / ${session.total}</small></span>
      </header>
    `;
  }

  function lessonLevelRow(extra = "") {
    return `
      <div class="lesson-level-row">
        <span>Lv.${state.level}</span><span>${gradeForLevel(state.level)}</span>${extra}
      </div>
    `;
  }

  function writeTemplate() {
    const problem = kanjiProblems[state.session.completed % kanjiProblems.length];
    return `
      <div class="screen lesson-screen kanji-lesson">
        ${lessonHeader("漢字を書く")}
        ${lessonLevelRow()}
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
    if (state.kanjiImage) {
      const savedImage = new Image();
      savedImage.addEventListener("load", () => context.drawImage(savedImage, 0, 0));
      savedImage.src = state.kanjiImage;
    }
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

  function readTemplate() {
    const problem = readingProblems[state.session.completed % readingProblems.length];
    const feedback = state.readingChecked
      ? state.readingChoice === problem.answer
        ? '<div class="reading-feedback correct"><b>正解！</b> よく読めました。</div>'
        : `<div class="reading-feedback wrong"><b>おしい！</b> 正解は「${problem.answer}」です。</div>`
      : "";
    return `
      <div class="screen lesson-screen reading-lesson">
        ${lessonHeader("漢字を読む")}
        ${lessonLevelRow()}
        <section class="reading-prompt">
          <p class="eyebrow">この漢字、なんて読む？</p>
          <div class="reading-card"><span>${problem.kanji}</span></div>
        </section>
        <div class="reading-options">
          ${problem.choices.map((choice) => {
            const selected = state.readingChoice === choice;
            const correct = state.readingChecked && choice === problem.answer;
            const wrong = state.readingChecked && selected && choice !== problem.answer;
            return `
              <button type="button" data-reading="${choice}" class="${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" ${state.readingChecked ? "disabled" : ""}>
                <span>${choice}</span><i>${correct ? "✓" : wrong ? "×" : "›"}</i>
              </button>
            `;
          }).join("")}
        </div>
        ${feedback}
        ${state.readingChecked
          ? '<button type="button" class="primary-button wide" data-action="next-reading">つぎの問題へ →</button>'
          : '<p class="choice-note">読み方をひとつ選んでね</p>'
        }
      </div>
    `;
  }

  function mathTemplate() {
    const problem = mathProblems[state.session.completed % mathProblems.length];
    const message =
      state.mathResult === "wrong"
        ? '<p class="result-message">おしい！ もう一度考えよう</p>'
        : state.mathResult === "correct"
          ? '<p class="result-message success">正解！ いいテンポ！</p>'
          : "";
    return `
      <div class="screen lesson-screen math-lesson">
        ${lessonHeader("暗算する")}
        ${lessonLevelRow('<span class="timer">◷ テンポよく</span>')}
        <section class="math-question">
          <p class="eyebrow">こたえはいくつ？</p>
          <h1>${problem.question}</h1>
          <div class="answer-box ${state.mathResult}">${state.mathAnswer || "<span>?</span>"}</div>
          ${message}
        </section>
        <div class="hint-box"><span>ヒント</span><p>${problem.hint}</p></div>
        ${numberPad("math")}
        ${state.mathResult === "correct"
          ? '<button type="button" class="primary-button wide" data-action="next-math">つぎの問題へ →</button>'
          : `<button type="button" class="primary-button wide" data-action="submit-math" ${state.mathAnswer ? "" : "disabled"}>こたえる</button>`
        }
      </div>
    `;
  }

  function flashTemplate() {
    const total = state.flashSequence.reduce((sum, number) => sum + number, 0);
    let stage = "";
    if (state.flashPhase === "ready") {
      stage = `
        <div class="flash-ready">
          <span class="flash-symbol">瞬</span>
          <h1>数字を見て、<br />ぜんぶ足そう</h1>
          <p>${state.flashSequence.length}つの数字が順番に出ます。</p>
          <button type="button" class="primary-button wide" data-action="start-flash">スタート</button>
        </div>
      `;
    } else if (state.flashPhase === "showing") {
      stage = `
        <div class="flash-showing" aria-live="assertive">
          <p>よく見てね</p>
          <strong id="flashNumber">${state.flashSequence[0]}</strong>
          <div class="flash-dots">${state.flashSequence.map(() => "<i></i>").join("")}</div>
        </div>
      `;
    } else {
      const message =
        state.flashResult === "wrong"
          ? `<p class="result-message">おしい！ もう一度。合計はまだ秘密です。</p>`
          : state.flashResult === "correct"
            ? `<p class="result-message success">正解！ 合計は ${total} です。</p>`
            : "";
      stage = `
        <div class="flash-answer-stage">
          <p class="eyebrow">ぜんぶでいくつ？</p>
          <h1>合計を答えよう</h1>
          <div class="answer-box ${state.flashResult}">${state.flashAnswer || "<span>?</span>"}</div>
          ${message}
        </div>
        ${numberPad("flash")}
        ${state.flashResult === "correct"
          ? '<button type="button" class="primary-button wide" data-action="next-flash">つぎの問題へ →</button>'
          : `<button type="button" class="primary-button wide" data-action="submit-flash" ${state.flashAnswer ? "" : "disabled"}>こたえる</button>`
        }
        ${state.flashResult === "idle" ? '<button type="button" class="replay-button" data-action="replay-flash">もう一度見る</button>' : ""}
      `;
    }
    return `
      <div class="screen lesson-screen flash-lesson">
        ${lessonHeader("フラッシュ暗算")}
        ${lessonLevelRow('<span class="timer">● 集中モード</span>')}
        <section class="flash-stage">${stage}</section>
      </div>
    `;
  }

  function numberPad(target) {
    return `
      <div class="number-pad" aria-label="数字キーパッド">
        ${["1", "2", "3", "4", "5", "6", "7", "8", "9"]
          .map((key) => `<button type="button" data-number="${key}" data-number-target="${target}">${key}</button>`)
          .join("")}
        <button type="button" class="pad-blank" tabindex="-1" aria-hidden="true"></button>
        <button type="button" data-number="0" data-number-target="${target}">0</button>
        <button type="button" class="delete-key" data-action="delete-number" data-number-target="${target}" aria-label="一文字消す">⌫</button>
      </div>
    `;
  }

  function prepareFlashQuestion() {
    const length = state.level >= 69 ? 5 : state.level >= 33 ? 4 : 3;
    const max = state.level >= 69 ? 30 : state.level >= 33 ? 20 : 9;
    state.flashSequence = Array.from({ length }, () => randomInt(1, max));
    state.flashPhase = "ready";
    state.flashAnswer = "";
    state.flashResult = "idle";
  }

  function startFlashSequence() {
    stopFlash();
    state.flashPhase = "showing";
    const token = ++state.flashRunToken;
    render();
    let index = 0;
    const step = () => {
      if (token !== state.flashRunToken || state.view !== "flash") return;
      const numberElement = document.querySelector("#flashNumber");
      const dots = [...document.querySelectorAll(".flash-dots i")];
      if (numberElement && index < state.flashSequence.length) {
        numberElement.textContent = state.flashSequence[index];
        dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
        index += 1;
        state.flashTimer = window.setTimeout(step, 850);
        return;
      }
      state.flashPhase = "answer";
      render();
    };
    step();
  }

  function stopFlash() {
    window.clearTimeout(state.flashTimer);
    state.flashTimer = 0;
    state.flashRunToken += 1;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function finishQuestion(correct) {
    const session = state.session;
    session.completed += 1;
    session.attempts += 1;
    if (correct) {
      session.correct += 1;
      earnXp(MODE_INFO[session.mode].xp);
    }
    if (session.completed >= session.total) {
      finishSession(false);
      return;
    }
    resetQuestionState();
    if (session.mode === "flash") prepareFlashQuestion();
    if (session.completed % state.checkpointEvery === 0) {
      state.checkpointOpen = true;
    }
    render();
  }

  function finishSession(endedEarly) {
    stopFlash();
    if (state.session) state.session.endedEarly = endedEarly;
    state.checkpointOpen = false;
    state.view = "result";
    render();
  }

  function checkpointTemplate() {
    const session = state.session;
    const remaining = session.total - session.completed;
    return `
      <div class="sheet-backdrop">
        <section class="checkpoint-sheet" role="dialog" aria-modal="true" aria-labelledby="checkpoint-title">
          <span class="checkpoint-mark">✓</span>
          <p class="eyebrow">GOOD PAUSE</p>
          <h2 id="checkpoint-title">${session.completed}問できました！</h2>
          <p>${MODE_INFO[session.mode].label}はあと${remaining}問です。<br />もう少し続けますか？</p>
          <div class="checkpoint-stats">
            <span><b>${session.completed}</b>問完了</span>
            <span><b>${session.correct}</b>問できた</span>
          </div>
          <button type="button" class="primary-button wide" data-action="continue-session">つぎの問題へ</button>
          <button type="button" class="secondary-button wide" data-action="end-session">ここで終了する</button>
        </section>
      </div>
    `;
  }

  function resultTemplate() {
    const session = state.session;
    if (!session) {
      state.view = "home";
      return homeTemplate();
    }
    const ratio = session.completed ? Math.round((session.correct / session.completed) * 100) : 0;
    return `
      <div class="screen result-screen">
        <header class="result-topbar"><span class="brand-mark">の</span><b>学習結果</b></header>
        <section class="result-hero">
          <span class="result-burst">${session.endedEarly ? "休" : "★"}</span>
          <p class="eyebrow">${session.endedEarly ? "GOOD PAUSE" : "SESSION COMPLETE"}</p>
          <h1>${session.endedEarly ? "ここまで、よくできました。" : "さいごまで、できました！"}</h1>
          <p>${escapeHtml(displayName())}さんの「${MODE_INFO[session.mode].label}」</p>
        </section>
        <div class="result-score-card">
          <div class="result-main-score"><b>${session.completed}</b><span>問できた</span></div>
          <div><b>${session.correct}</b><span>できた問題</span></div>
          <div><b>${ratio}%</b><span>達成率</span></div>
        </div>
        <div class="result-message-card">
          <span>☺</span>
          <p><b>${session.completed >= state.checkpointEvery ? "小さな積み重ねが、力になります。" : "まず始められたことが大切です。"}</b><br />次も自分のペースで進めよう。</p>
        </div>
        <button type="button" class="primary-button wide" data-action="restart-session">もう一度する</button>
        <button type="button" class="secondary-button wide result-home-button" data-action="back-home">ホームへ戻る</button>
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
                  <p>LEVEL ${group.start}–${group.end}</p><h2>${group.label}</h2>
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
          <div><p class="eyebrow">MY SETTINGS</p><h1>なまえ・学習設定</h1></div>
        </header>

        <section class="settings-card name-settings">
          <div class="settings-title">
            <span class="settings-icon name-icon">${escapeHtml(displayName().slice(0, 1))}</span>
            <div><p class="eyebrow">LEARNER</p><h2>なまえを登録</h2></div>
          </div>
          <label class="name-field">
            <span>学習する人のなまえ</span>
            <input id="learnerName" type="text" maxlength="20" value="${escapeHtml(state.learnerName)}" placeholder="例：ゆうき" autocomplete="name" />
          </label>
        </section>

        <section class="settings-card">
          <div class="settings-heading">
            <div><p class="eyebrow">QUESTION COUNT</p><h2>1回の問題数</h2></div>
            <span>3〜50問</span>
          </div>
          <div class="count-settings-grid">
            ${Object.entries(MODE_INFO).map(([mode, info]) => `
              <label class="count-setting">
                <span>${info.short}</span>
                <div><input type="number" min="3" max="50" step="1" value="${state.counts[mode]}" data-count-mode="${mode}" /><small>問</small></div>
              </label>
            `).join("")}
          </div>
          <p class="settings-note">すべて初期値は10問です。コースごとに変更できます。</p>
        </section>

        <section class="settings-card">
          <div class="settings-heading">
            <div><p class="eyebrow">CHECKPOINT</p><h2>ひと休みの間隔</h2></div>
          </div>
          <div class="checkpoint-choice">
            <label class="${state.checkpointEvery === 3 ? "selected" : ""}">
              <input type="radio" name="checkpoint" value="3" ${state.checkpointEvery === 3 ? "checked" : ""} />
              <span><b>3問ごと</b><small>こまめに確認</small></span>
            </label>
            <label class="${state.checkpointEvery === 5 ? "selected" : ""}">
              <input type="radio" name="checkpoint" value="5" ${state.checkpointEvery === 5 ? "checked" : ""} />
              <span><b>5問ごと</b><small>テンポよく進む</small></span>
            </label>
          </div>
        </section>

        <button type="button" class="primary-button wide save-settings-button" data-action="save-settings">設定を保存する</button>

        <div class="profile-summary">
          <span>現在</span><b>Lv.${state.level}</b><small>${gradeForLevel(state.level)}</small>
          <button type="button" class="text-link" data-action="open-placement">開始レベルを見なおす ›</button>
        </div>
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
      { id: "profile", icon: "○", label: "設定" },
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
    const startButton = event.target.closest("[data-start]");
    if (startButton) {
      startSession(startButton.dataset.start);
      return;
    }

    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      stopFlash();
      state.view = viewButton.dataset.view;
      state.session = null;
      resetQuestionState();
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

    const readingButton = event.target.closest("[data-reading]");
    if (readingButton && !state.readingChecked) {
      const problem = readingProblems[state.session.completed % readingProblems.length];
      state.readingChoice = readingButton.dataset.reading;
      state.readingChecked = true;
      state.session.attempts += 1;
      if (state.readingChoice === problem.answer) {
        state.session.correct += 1;
        earnXp(MODE_INFO.read.xp);
      }
      render();
      return;
    }

    const numberButton = event.target.closest("[data-number]");
    if (numberButton) {
      const target = numberButton.dataset.numberTarget;
      if (target === "flash") {
        if (state.flashAnswer.length < 4) state.flashAnswer += numberButton.dataset.number;
        state.flashResult = "idle";
      } else {
        if (state.mathAnswer.length < 4) state.mathAnswer += numberButton.dataset.number;
        state.mathResult = "idle";
      }
      render();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (
      action === "close-placement" &&
      event.target.closest(".placement-sheet") &&
      !event.target.closest(".sheet-close")
    ) {
      return;
    }

    const actions = {
      "back-home"() {
        stopFlash();
        state.view = "home";
        state.session = null;
        state.checkpointOpen = false;
        resetQuestionState();
        render();
      },
      "ask-exit"() {
        finishSession(true);
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
        state.kanjiImage = "";
        render();
      },
      "check-kanji"() {
        if (state.kanjiMarks < 5) return;
        const canvas = document.querySelector("#writingCanvas");
        state.kanjiImage = canvas?.toDataURL("image/png") || "";
        state.kanjiChecking = true;
        render();
      },
      "kanji-retry"() {
        state.kanjiMarks = 0;
        state.kanjiChecking = false;
        state.kanjiImage = "";
        render();
      },
      "kanji-success"() {
        finishQuestion(true);
      },
      "next-reading"() {
        const problem = readingProblems[state.session.completed % readingProblems.length];
        const wasCorrect = state.readingChoice === problem.answer;
        state.session.completed += 1;
        if (state.session.completed >= state.session.total) {
          finishSession(false);
          return;
        }
        resetQuestionState();
        if (state.session.completed % state.checkpointEvery === 0) {
          state.checkpointOpen = true;
        }
        if (!wasCorrect) showToast("次で取り返そう！");
        render();
      },
      "delete-number"() {
        const target = actionButton.dataset.numberTarget;
        if (target === "flash") {
          state.flashAnswer = state.flashAnswer.slice(0, -1);
          state.flashResult = "idle";
        } else {
          state.mathAnswer = state.mathAnswer.slice(0, -1);
          state.mathResult = "idle";
        }
        render();
      },
      "submit-math"() {
        if (!state.mathAnswer) return;
        const problem = mathProblems[state.session.completed % mathProblems.length];
        state.session.attempts += 1;
        state.mathResult = state.mathAnswer === problem.answer ? "correct" : "wrong";
        if (state.mathResult === "correct") {
          state.session.correct += 1;
          earnXp(MODE_INFO.math.xp);
        }
        render();
      },
      "next-math"() {
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "start-flash"() {
        startFlashSequence();
      },
      "replay-flash"() {
        state.flashAnswer = "";
        state.flashResult = "idle";
        startFlashSequence();
      },
      "submit-flash"() {
        if (!state.flashAnswer) return;
        const total = state.flashSequence.reduce((sum, number) => sum + number, 0);
        state.session.attempts += 1;
        state.flashResult = Number(state.flashAnswer) === total ? "correct" : "wrong";
        if (state.flashResult === "correct") {
          state.session.correct += 1;
          earnXp(MODE_INFO.flash.xp);
        }
        render();
      },
      "next-flash"() {
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "continue-session"() {
        state.checkpointOpen = false;
        render();
      },
      "end-session"() {
        finishSession(true);
      },
      "restart-session"() {
        const mode = state.session.mode;
        startSession(mode);
      },
      "save-settings"() {
        saveSettingsFromForm();
      },
    };
    actions[action]?.();
  }

  function advanceAfterCompletedQuestion() {
    if (state.session.completed >= state.session.total) {
      finishSession(false);
      return;
    }
    resetQuestionState();
    if (state.session.mode === "flash") prepareFlashQuestion();
    if (state.session.completed % state.checkpointEvery === 0) {
      state.checkpointOpen = true;
    }
    render();
  }

  function saveSettingsFromForm() {
    const nameField = document.querySelector("#learnerName");
    state.learnerName = String(nameField?.value || "").trim().slice(0, 20);
    document.querySelectorAll("[data-count-mode]").forEach((input) => {
      state.counts[input.dataset.countMode] = clamp(input.value || 10, 3, 50);
    });
    const checkpoint = document.querySelector("input[name='checkpoint']:checked");
    state.checkpointEvery = Number(checkpoint?.value) === 3 ? 3 : 5;
    saveProgress();
    showToast("設定を保存しました");
    render();
  }

  function resetQuestionState() {
    state.kanjiMarks = 0;
    state.kanjiChecking = false;
    state.kanjiImage = "";
    state.readingChoice = "";
    state.readingChecked = false;
    state.mathAnswer = "";
    state.mathResult = "idle";
    state.flashAnswer = "";
    state.flashResult = "idle";
    if (state.session?.mode !== "flash") state.flashPhase = "ready";
  }

  function earnXp(amount) {
    const total = state.xp + amount;
    if (total >= 100 && state.level < 100) {
      state.level += 1;
      state.xp = total - 100;
      showToast(`レベル ${state.level} にアップ！`);
    } else {
      state.xp = Math.min(100, total);
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
