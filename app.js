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
  const SKILL_MODES = Object.keys(MODE_INFO);
  const DEFAULT_COUNTS = { write: 10, read: 10, math: 10, flash: 10 };
  const DEFAULT_NAMES = ["ゆうき", "あおい", "さくら", "はると"];

  const kanjiProblems = [
    { band: 1, kanji: "山", reading: "やま", word: "山道", strokes: 3 },
    { band: 1, kanji: "川", reading: "かわ", word: "川上", strokes: 3 },
    { band: 1, kanji: "人", reading: "ひと", word: "人びと", strokes: 2 },
    { band: 1, kanji: "大", reading: "おおきい", word: "大空", strokes: 3 },
    { band: 1, kanji: "日", reading: "ひ", word: "日の出", strokes: 4 },
    { band: 1, kanji: "月", reading: "つき", word: "月日", strokes: 4 },
    { band: 2, kanji: "海", reading: "うみ", word: "海辺", strokes: 9 },
    { band: 2, kanji: "春", reading: "はる", word: "春風", strokes: 9 },
    { band: 2, kanji: "夏", reading: "なつ", word: "夏休み", strokes: 10 },
    { band: 2, kanji: "秋", reading: "あき", word: "秋空", strokes: 9 },
    { band: 2, kanji: "冬", reading: "ふゆ", word: "冬休み", strokes: 5 },
    { band: 2, kanji: "星", reading: "ほし", word: "星空", strokes: 9 },
    { band: 3, kanji: "泳", reading: "およぐ", word: "泳ぐ", strokes: 8 },
    { band: 3, kanji: "深", reading: "ふかい", word: "深い", strokes: 11 },
    { band: 3, kanji: "緑", reading: "みどり", word: "緑色", strokes: 14 },
    { band: 3, kanji: "橋", reading: "はし", word: "橋を渡る", strokes: 16 },
    { band: 3, kanji: "農", reading: "のう", word: "農業", strokes: 13 },
    { band: 3, kanji: "港", reading: "みなと", word: "港町", strokes: 12 },
    { band: 4, kanji: "愛", reading: "あい", word: "愛情", strokes: 13 },
    { band: 4, kanji: "案", reading: "あん", word: "案内", strokes: 10 },
    { band: 4, kanji: "以", reading: "い", word: "以上", strokes: 5 },
    { band: 4, kanji: "衣", reading: "ころも", word: "衣", strokes: 6 },
    { band: 4, kanji: "位", reading: "くらい", word: "一の位", strokes: 7 },
    { band: 4, kanji: "印", reading: "しるし", word: "目印", strokes: 6 },
    { band: 5, kanji: "圧", reading: "あつ", word: "圧力", strokes: 5 },
    { band: 5, kanji: "移", reading: "うつる", word: "場所を移る", strokes: 11 },
    { band: 5, kanji: "因", reading: "いん", word: "原因", strokes: 6 },
    { band: 5, kanji: "永", reading: "ながい", word: "永い年月", strokes: 5 },
    { band: 5, kanji: "営", reading: "いとなむ", word: "店を営む", strokes: 12 },
    { band: 5, kanji: "衛", reading: "えい", word: "衛生", strokes: 16 },
    { band: 6, kanji: "異", reading: "ことなる", word: "意見が異なる", strokes: 11 },
    { band: 6, kanji: "遺", reading: "い", word: "遺産", strokes: 15 },
    { band: 6, kanji: "域", reading: "いき", word: "地域", strokes: 11 },
    { band: 6, kanji: "宇", reading: "う", word: "宇宙", strokes: 6 },
    { band: 6, kanji: "映", reading: "うつる", word: "鏡に映る", strokes: 9 },
    { band: 6, kanji: "延", reading: "のびる", word: "期限が延びる", strokes: 8 },
    { band: 7, kanji: "概", reading: "がい", word: "概要", strokes: 14 },
    { band: 7, kanji: "括", reading: "かつ", word: "包括", strokes: 9 },
    { band: 7, kanji: "据", reading: "すえる", word: "据える", strokes: 11 },
    { band: 7, kanji: "薦", reading: "すすめる", word: "本を薦める", strokes: 16 },
    { band: 7, kanji: "遂", reading: "とげる", word: "役目を遂げる", strokes: 12 },
    { band: 7, kanji: "乏", reading: "とぼしい", word: "資源が乏しい", strokes: 4 },
    { band: 8, kanji: "曖", reading: "あい", word: "曖昧", strokes: 17 },
    { band: 8, kanji: "昧", reading: "まい", word: "曖昧", strokes: 9 },
    { band: 8, kanji: "憂", reading: "うれえる", word: "将来を憂える", strokes: 15 },
    { band: 8, kanji: "慮", reading: "りょ", word: "考慮", strokes: 15 },
    { band: 8, kanji: "顕", reading: "けん", word: "顕著", strokes: 18 },
    { band: 8, kanji: "著", reading: "あらわす", word: "本を著す", strokes: 11 },
    { band: 9, kanji: "把", reading: "は", word: "把握", strokes: 7 },
    { band: 9, kanji: "握", reading: "にぎる", word: "手を握る", strokes: 12 },
    { band: 9, kanji: "矛", reading: "ほこ", word: "矛", strokes: 5 },
    { band: 9, kanji: "盾", reading: "たて", word: "盾", strokes: 9 },
    { band: 9, kanji: "凝", reading: "こる", word: "肩が凝る", strokes: 16 },
    { band: 9, kanji: "縮", reading: "ちぢむ", word: "布が縮む", strokes: 17 },
    { band: 10, kanji: "脈", reading: "みゃく", word: "脈絡", strokes: 10 },
    { band: 10, kanji: "絡", reading: "からむ", word: "糸が絡む", strokes: 9 },
    { band: 10, kanji: "培", reading: "つちかう", word: "能力を培う", strokes: 11 },
    { band: 10, kanji: "養", reading: "やしなう", word: "家族を養う", strokes: 15 },
    { band: 10, kanji: "媒", reading: "ばい", word: "媒体", strokes: 12 },
    { band: 10, kanji: "謙", reading: "けん", word: "謙虚", strokes: 17 },
  ];

  const readingProblems = [
    { band: 1, kanji: "山", answer: "やま", choices: ["やま", "かわ", "そら", "もり"] },
    { band: 1, kanji: "川", answer: "かわ", choices: ["かわ", "やま", "うみ", "みち"] },
    { band: 1, kanji: "人", answer: "ひと", choices: ["ひと", "いぬ", "こども", "おとな"] },
    { band: 1, kanji: "大きい", answer: "おおきい", choices: ["おおきい", "ちいさい", "たかい", "ひろい"] },
    { band: 1, kanji: "日", answer: "ひ", choices: ["ひ", "つき", "ほし", "そら"] },
    { band: 1, kanji: "月", answer: "つき", choices: ["つき", "ひ", "よる", "ほし"] },
    { band: 2, kanji: "海", answer: "うみ", choices: ["うみ", "かわ", "いけ", "そら"] },
    { band: 2, kanji: "春", answer: "はる", choices: ["はる", "なつ", "あき", "ふゆ"] },
    { band: 2, kanji: "夏", answer: "なつ", choices: ["なつ", "はる", "あき", "ふゆ"] },
    { band: 2, kanji: "秋", answer: "あき", choices: ["あき", "はる", "なつ", "ふゆ"] },
    { band: 2, kanji: "冬", answer: "ふゆ", choices: ["ふゆ", "はる", "なつ", "あき"] },
    { band: 2, kanji: "星", answer: "ほし", choices: ["ほし", "つき", "そら", "くも"] },
    { band: 3, kanji: "緑茶", answer: "りょくちゃ", choices: ["りょくちゃ", "みどりちゃ", "りくちゃ", "ろくちゃ"] },
    { band: 3, kanji: "深海", answer: "しんかい", choices: ["しんかい", "ふかうみ", "じんかい", "しんがい"] },
    { band: 3, kanji: "農業", answer: "のうぎょう", choices: ["のうぎょう", "のぎょう", "のうごう", "のうきょう"] },
    { band: 3, kanji: "登山", answer: "とざん", choices: ["とざん", "とうざん", "のぼりやま", "とさん"] },
    { band: 3, kanji: "空港", answer: "くうこう", choices: ["くうこう", "そらみなと", "くこう", "くうごう"] },
    { band: 3, kanji: "歩道橋", answer: "ほどうきょう", choices: ["ほどうきょう", "ほどうばし", "ふどうきょう", "ほどうはし"] },
    { band: 4, kanji: "愛情", answer: "あいじょう", choices: ["あいじょう", "あいしょう", "えじょう", "あいせい"] },
    { band: 4, kanji: "案内", answer: "あんない", choices: ["あんない", "あない", "あんだい", "あんうち"] },
    { band: 4, kanji: "位置", answer: "いち", choices: ["いち", "いじ", "くらい", "いところ"] },
    { band: 4, kanji: "印刷", answer: "いんさつ", choices: ["いんさつ", "いんしつ", "しるしずり", "いんざつ"] },
    { band: 4, kanji: "衣服", answer: "いふく", choices: ["いふく", "ころもふく", "いぶく", "えふく"] },
    { band: 4, kanji: "英語", answer: "えいご", choices: ["えいご", "えご", "ひでご", "えいかた"] },
    { band: 5, kanji: "圧力", answer: "あつりょく", choices: ["あつりょく", "あつりき", "おうりょく", "あっりょく"] },
    { band: 5, kanji: "移動", answer: "いどう", choices: ["いどう", "うつどう", "いとう", "えどう"] },
    { band: 5, kanji: "原因", answer: "げんいん", choices: ["げんいん", "げんにん", "はらいん", "げいいん"] },
    { band: 5, kanji: "永遠", answer: "えいえん", choices: ["えいえん", "ながとお", "えいおん", "えんえい"] },
    { band: 5, kanji: "営業", answer: "えいぎょう", choices: ["えいぎょう", "えいごう", "いぎょう", "えいきょう"] },
    { band: 5, kanji: "衛生", answer: "えいせい", choices: ["えいせい", "えせい", "えいしょう", "えいなま"] },
    { band: 6, kanji: "異常", answer: "いじょう", choices: ["いじょう", "ことじょう", "いしょう", "いじょ"] },
    { band: 6, kanji: "遺産", answer: "いさん", choices: ["いさん", "ゆいさん", "いざん", "のこりもの"] },
    { band: 6, kanji: "地域", answer: "ちいき", choices: ["ちいき", "じいき", "ちえき", "ちいぎ"] },
    { band: 6, kanji: "宇宙", answer: "うちゅう", choices: ["うちゅう", "うそら", "ゆちゅう", "うじゅう"] },
    { band: 6, kanji: "映画", answer: "えいが", choices: ["えいが", "うつしえ", "えが", "えいかく"] },
    { band: 6, kanji: "延長", answer: "えんちょう", choices: ["えんちょう", "のびなが", "えんしょう", "えんじょう"] },
    { band: 7, kanji: "概要", answer: "がいよう", choices: ["がいよう", "かいよう", "がいりゃく", "がいしょう"] },
    { band: 7, kanji: "包括", answer: "ほうかつ", choices: ["ほうかつ", "ほうがつ", "つつみかつ", "ほうけつ"] },
    { band: 7, kanji: "据える", answer: "すえる", choices: ["すえる", "そえる", "こえる", "たえる"] },
    { band: 7, kanji: "推薦", answer: "すいせん", choices: ["すいせん", "すいぜん", "ついせん", "すいしょう"] },
    { band: 7, kanji: "遂行", answer: "すいこう", choices: ["すいこう", "ついこう", "すいぎょう", "すいごう"] },
    { band: 7, kanji: "乏しい", answer: "とぼしい", choices: ["とぼしい", "まずしい", "さびしい", "ほしい"] },
    { band: 8, kanji: "曖昧", answer: "あいまい", choices: ["あいまい", "あいみ", "えいまい", "あんまい"] },
    { band: 8, kanji: "憂慮", answer: "ゆうりょ", choices: ["ゆうりょ", "うりょ", "ゆうろ", "ゆりょ"] },
    { band: 8, kanji: "顕著", answer: "けんちょ", choices: ["けんちょ", "けんしょ", "げんちょ", "けんじゃく"] },
    { band: 8, kanji: "把握", answer: "はあく", choices: ["はあく", "ばあく", "はにぎり", "はかく"] },
    { band: 8, kanji: "矛盾", answer: "むじゅん", choices: ["むじゅん", "ほこたて", "むしゅん", "ぼうじゅん"] },
    { band: 8, kanji: "著しい", answer: "いちじるしい", choices: ["いちじるしい", "あらわしい", "ちょしい", "めずらしい"] },
    { band: 9, kanji: "凝縮", answer: "ぎょうしゅく", choices: ["ぎょうしゅく", "ぎょうしゅう", "こりちぢみ", "ぎょしゅく"] },
    { band: 9, kanji: "脈絡", answer: "みゃくらく", choices: ["みゃくらく", "みゃくかく", "みらく", "みゃくろ"] },
    { band: 9, kanji: "培養", answer: "ばいよう", choices: ["ばいよう", "つちよう", "はいよう", "ばいしょう"] },
    { band: 9, kanji: "媒体", answer: "ばいたい", choices: ["ばいたい", "まいたい", "ばいからだ", "ばいだい"] },
    { band: 9, kanji: "謙虚", answer: "けんきょ", choices: ["けんきょ", "けんこ", "きょうきょ", "けんきょう"] },
    { band: 9, kanji: "養う", answer: "やしなう", choices: ["やしなう", "つちかう", "になう", "うしなう"] },
    { band: 10, kanji: "抽象", answer: "ちゅうしょう", choices: ["ちゅうしょう", "ちゅうぞう", "ちゅしょう", "ぬきぞう"] },
    { band: 10, kanji: "論理", answer: "ろんり", choices: ["ろんり", "りんり", "ろんじ", "ろんことわり"] },
    { band: 10, kanji: "俯瞰", answer: "ふかん", choices: ["ふかん", "ふがん", "はいかん", "ふけん"] },
    { band: 10, kanji: "踏襲", answer: "とうしゅう", choices: ["とうしゅう", "ふしゅう", "とうじゅう", "ふみおそい"] },
    { band: 10, kanji: "漸進", answer: "ぜんしん", choices: ["ぜんしん", "ざんしん", "せんしん", "ぜんじん"] },
    { band: 10, kanji: "帰納", answer: "きのう", choices: ["きのう", "きな", "かえりのう", "きどう"] },
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
    learnerName: DEFAULT_NAMES[0],
    learnerNames: [...DEFAULT_NAMES],
    namesSource: "初期名簿",
    profiles: {},
    lastFirstByMode: { write: "", read: "", math: "", flash: "" },
    counts: { ...DEFAULT_COUNTS },
    checkpointEvery: 5,
    levelViewMode: "write",
    placementMode: "write",
    placementOpen: false,
    checkpointOpen: false,
    exitConfirmOpen: false,
    toast: "",
    toastTimer: 0,
    answerAdvanceTimer: 0,
    session: null,
    kanjiMarks: 0,
    kanjiChecking: false,
    kanjiImage: "",
    readingChoice: "",
    readingChecked: false,
    readingChoices: [],
    lastReadingAnswerIndex: -1,
    mathAnswer: "",
    mathResult: "idle",
    flashSequence: [],
    flashAnswer: "",
    flashResult: "idle",
    flashPhase: "ready",
    flashCue: "3",
    flashTimer: 0,
    flashRunToken: 0,
    cloudReady: false,
    cloudApplying: false,
    cloudSyncing: false,
    cloudStatus: "端末内保存（Firebase未設定）",
    cloudTone: "local",
    cloudSaveTimers: {},
    cloudPendingSaves: {},
    cloudLastSyncedAt: 0,
  };

  updateViewportMetrics();
  window.addEventListener?.("resize", updateViewportMetrics, { passive: true });
  window.visualViewport?.addEventListener("resize", updateViewportMetrics, {
    passive: true,
  });
  window.visualViewport?.addEventListener("scroll", updateViewportMetrics, {
    passive: true,
  });
  loadProgress();
  initializeLearnerProfiles();
  render();
  loadLearnerNames().finally(initializeCloudSync);
  app.addEventListener("click", handleClick);
  app.addEventListener("change", handleChange);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushPendingCloudSaves();
      return;
    }
    const namesTask =
      location.protocol === "file:" ? Promise.resolve() : loadLearnerNames();
    namesTask.finally(() => syncCloudProfiles());
  });
  window.addEventListener?.("pagehide", flushPendingCloudSaves);

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (Number.isFinite(saved.level)) state.level = clamp(saved.level, 1, 100);
      if (Number.isFinite(saved.xp)) state.xp = clamp(saved.xp, 0, 100);
      if (Number.isFinite(saved.streak)) state.streak = Math.max(0, Number(saved.streak));
      if (typeof saved.learnerName === "string" && saved.learnerName.trim()) {
        state.learnerName = saved.learnerName.trim().slice(0, 20);
      }
      if (Array.isArray(saved.learnerNames)) {
        const savedNames = parseLearnerNames(saved.learnerNames.join("\n"));
        if (savedNames.length) {
          state.learnerNames = savedNames;
          state.namesSource = "保存済み名簿";
        }
      }
      if (saved.profiles && typeof saved.profiles === "object") {
        Object.entries(saved.profiles).forEach(([name, profile]) => {
          const cleanName = String(name).trim().slice(0, 20);
          if (!cleanName || !profile || typeof profile !== "object") return;
          state.profiles[cleanName] = normalizeProfile(profile);
        });
      }
      if (saved.lastFirstByMode && typeof saved.lastFirstByMode === "object") {
        Object.keys(state.lastFirstByMode).forEach((mode) => {
          if (typeof saved.lastFirstByMode[mode] === "string") {
            state.lastFirstByMode[mode] = saved.lastFirstByMode[mode];
          }
        });
      }
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

  function initializeLearnerProfiles() {
    if (state.learnerName && !state.learnerNames.includes(state.learnerName)) {
      state.learnerNames.unshift(state.learnerName);
    }
    state.learnerNames.forEach((name, index) => {
      if (!state.profiles[name]) {
        state.profiles[name] = normalizeProfile(
          index === 0
            ? { level: state.level, xp: state.xp, streak: state.streak }
            : { level: 1, xp: 0, streak: 0 },
        );
      }
    });
    if (!state.learnerName) state.learnerName = state.learnerNames[0];
    applyActiveProfile();
  }

  async function loadLearnerNames(showFeedback = false) {
    if (location.protocol === "file:") {
      if (showFeedback) {
        showToast("下の「names.txtを選ぶ」から読み込んでください");
        render();
      }
      return;
    }
    try {
      const response = await fetch(`./names.txt?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error("names.txt was not found");
      const names = parseLearnerNames(await response.text());
      if (!names.length) throw new Error("names.txt is empty");
      const changed = applyLearnerNames(names, "GitHubのnames.txt");
      if (showFeedback) {
        showToast(changed ? `${names.length}人の名簿を読み込みました` : "名簿は最新です");
        render();
      }
    } catch {
      if (showFeedback) {
        showToast("names.txtを読み込めませんでした");
        render();
      }
    }
  }

  function parseLearnerNames(text) {
    const names = String(text || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((name) => name.trim().slice(0, 20))
      .filter((name) => name && !name.startsWith("#"));
    return [...new Set(names)].slice(0, 50);
  }

  function applyLearnerNames(names, source) {
    const changed = state.learnerNames.join("\n") !== names.join("\n");
    state.learnerNames = [...names];
    state.namesSource = source;
    state.learnerNames.forEach((name) => ensureProfile(name));
    if (!state.learnerNames.includes(state.learnerName)) {
      activateLearner(state.learnerNames[0], false);
    }
    saveProgress();
    if (changed) render();
    if (state.cloudReady) syncCloudProfiles();
    return changed;
  }

  function normalizeSkill(skill, fallbackLevel = 1, fallbackXp = 0, fallbackUpdatedAt = 0) {
    return {
      level: clamp(skill?.level ?? fallbackLevel, 1, 100),
      xp: clamp(skill?.xp ?? fallbackXp, 0, 100),
      updatedAt: Math.max(
        0,
        Math.floor(Number(skill?.updatedAt ?? fallbackUpdatedAt) || 0),
      ),
    };
  }

  function normalizeProfile(profile) {
    const legacyLevel = clamp(profile?.level ?? 1, 1, 100);
    const legacyXp = clamp(profile?.xp ?? 0, 0, 100);
    const legacyUpdatedAt = Math.max(
      0,
      Math.floor(Number(profile?.updatedAt) || 0),
    );
    const rawSkills =
      profile?.skills && typeof profile.skills === "object" ? profile.skills : {};
    const skills = {};
    SKILL_MODES.forEach((mode) => {
      skills[mode] = normalizeSkill(
        rawSkills[mode],
        legacyLevel,
        legacyXp,
        legacyUpdatedAt,
      );
    });
    return {
      skills,
      streak: Math.max(0, Number(profile?.streak) || 0),
      updatedAt: Math.max(
        legacyUpdatedAt,
        ...SKILL_MODES.map((mode) => skills[mode].updatedAt),
      ),
    };
  }

  function ensureProfile(name) {
    if (!state.profiles[name]) {
      state.profiles[name] = normalizeProfile({ level: 1, xp: 0, streak: 0 });
    }
    return state.profiles[name];
  }

  function activeSkill(mode) {
    const profile = ensureProfile(state.learnerName);
    const safeMode = SKILL_MODES.includes(mode) ? mode : "write";
    return profile.skills[safeMode];
  }

  function overallLevel(profile = ensureProfile(state.learnerName)) {
    const normalized = normalizeProfile(profile);
    return clamp(
      Math.round(
        SKILL_MODES.reduce(
          (sum, mode) => sum + normalized.skills[mode].level,
          0,
        ) / SKILL_MODES.length,
      ),
      1,
      100,
    );
  }

  function overallXp(profile = ensureProfile(state.learnerName)) {
    const normalized = normalizeProfile(profile);
    return clamp(
      Math.round(
        SKILL_MODES.reduce(
          (sum, mode) => sum + normalized.skills[mode].xp,
          0,
        ) / SKILL_MODES.length,
      ),
      0,
      100,
    );
  }

  function applyActiveProfile() {
    const profile = ensureProfile(state.learnerName);
    state.level = overallLevel(profile);
    state.xp = overallXp(profile);
    state.streak = profile.streak;
  }

  function activateLearner(name, persist = true) {
    const cleanName = String(name || "").trim().slice(0, 20);
    if (!cleanName || !state.learnerNames.includes(cleanName)) return;
    state.learnerName = cleanName;
    applyActiveProfile();
    if (persist) saveProgress();
  }

  function saveProgress(changedMode = "") {
    applyActiveProfile();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 3,
          level: state.level,
          xp: state.xp,
          streak: state.streak,
          learnerName: state.learnerName,
          learnerNames: state.learnerNames,
          profiles: state.profiles,
          lastFirstByMode: state.lastFirstByMode,
          counts: state.counts,
          checkpointEvery: state.checkpointEvery,
        }),
      );
    } catch {
      // 保存できない環境では画面内だけで学習を続ける。
    }
    if (SKILL_MODES.includes(changedMode)) {
      queueCloudSave(state.learnerName, changedMode);
    }
  }

  function setCloudStatus(message, tone = "local") {
    state.cloudStatus = message;
    state.cloudTone = tone;
    const text = document.querySelector("#cloudStatusText");
    const badge = document.querySelector("#cloudStatusBadge");
    const syncedAt = document.querySelector("#cloudLastSyncedAt");
    if (text) text.textContent = message;
    if (badge) {
      badge.textContent = tone === "online" ? "同期ON" : tone === "busy" ? "同期中" : "端末保存";
      badge.className = `cloud-status-badge ${tone}`;
    }
    if (syncedAt) syncedAt.textContent = cloudLastSyncedText();
  }

  function cloudLastSyncedText() {
    if (!state.cloudLastSyncedAt) return "最終同期：まだ同期していません";
    return `最終同期：${new Date(state.cloudLastSyncedAt).toLocaleTimeString(
      "ja-JP",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    )}`;
  }

  async function initializeCloudSync() {
    const cloud = window.NobiruCloud;
    if (!cloud?.isConfigured?.()) {
      setCloudStatus("端末内保存（Firebase未設定）", "local");
      return;
    }
    setCloudStatus("Firebaseへ接続しています…", "busy");
    try {
      await cloud.initialize();
      state.cloudReady = true;
      await syncCloudProfiles();
    } catch {
      state.cloudReady = false;
      setCloudStatus("Firebaseへ接続できません（端末内へ保存中）", "error");
    }
  }

  async function syncCloudProfiles() {
    const cloud = window.NobiruCloud;
    if (!state.cloudReady || state.cloudSyncing || !cloud) return;
    state.cloudSyncing = true;
    setCloudStatus("クラウドのレベルを確認しています…", "busy");
    try {
      const remoteProfiles = await cloud.loadProfiles(state.learnerNames);
      const uploads = [];
      state.cloudApplying = true;
      state.learnerNames.forEach((name) => {
        const local = ensureProfile(name);
        const remoteValue = remoteProfiles[name];
        if (!remoteValue) {
          uploads.push([name, local]);
          return;
        }
        const remote = normalizeProfile(remoteValue);
        const merged = normalizeProfile(local);
        let needsUpload =
          !remoteValue.skills || typeof remoteValue.skills !== "object";

        SKILL_MODES.forEach((mode) => {
          const remoteSkill = remote.skills[mode];
          const localSkill = local.skills[mode];
          const remoteHasSkill = Boolean(remoteValue.skills?.[mode]);
          const remoteHasLegacyLevel = Number.isFinite(Number(remoteValue.level));
          if (
            (remoteHasSkill || remoteHasLegacyLevel) &&
            remoteSkill.updatedAt >= localSkill.updatedAt
          ) {
            merged.skills[mode] = remoteSkill;
          } else {
            merged.skills[mode] = localSkill;
            needsUpload = true;
          }
        });

        if (remote.updatedAt >= local.updatedAt) {
          merged.streak = remote.streak;
        } else {
          merged.streak = local.streak;
          needsUpload = true;
        }
        merged.updatedAt = Math.max(
          local.updatedAt,
          remote.updatedAt,
          ...SKILL_MODES.map((mode) => merged.skills[mode].updatedAt),
        );
        state.profiles[name] = merged;
        if (needsUpload) uploads.push([name, merged]);
      });
      applyActiveProfile();
      saveProgress();
      state.cloudApplying = false;
      await Promise.all(uploads.map(([name, profile]) => cloud.saveProfile(name, profile)));
      state.cloudLastSyncedAt = Date.now();
      setCloudStatus("Firebaseと同期済み", "online");
      if (["home", "levels", "profile"].includes(state.view)) render();
    } catch {
      state.cloudApplying = false;
      setCloudStatus("同期できません（端末内へ保存中）", "error");
    } finally {
      state.cloudApplying = false;
      state.cloudSyncing = false;
    }
  }

  function queueCloudSave(name, mode) {
    if (
      !state.cloudReady ||
      state.cloudApplying ||
      !name ||
      !SKILL_MODES.includes(mode)
    ) {
      return;
    }
    const timerKey = `${name}:${mode}`;
    window.clearTimeout(state.cloudSaveTimers[timerKey]);
    state.cloudPendingSaves[timerKey] = { name, mode };
    state.cloudSaveTimers[timerKey] = window.setTimeout(() => {
      delete state.cloudSaveTimers[timerKey];
      delete state.cloudPendingSaves[timerKey];
      pushCloudProfile(name, mode);
    }, 120);
  }

  function flushPendingCloudSaves() {
    if (!state.cloudReady) return Promise.resolve([]);
    const pending = Object.entries(state.cloudPendingSaves);
    if (!pending.length) return Promise.resolve([]);
    pending.forEach(([key]) => {
      window.clearTimeout(state.cloudSaveTimers[key]);
      delete state.cloudSaveTimers[key];
      delete state.cloudPendingSaves[key];
    });
    return Promise.allSettled(
      pending.map(([, request]) =>
        pushCloudProfile(request.name, request.mode, false),
      ),
    );
  }

  async function pushCloudProfile(name, mode, showBusy = true) {
    const cloud = window.NobiruCloud;
    if (!state.cloudReady || !cloud) return;
    const profile = normalizeProfile(ensureProfile(name));
    if (showBusy) {
      setCloudStatus("学習結果をFirebaseへ保存しています…", "busy");
    }
    try {
      await cloud.saveProfile(name, profile, mode);
      state.cloudLastSyncedAt = Date.now();
      setCloudStatus("Firebaseと同期済み", "online");
    } catch {
      setCloudStatus("クラウド保存に失敗（端末内には保存済み）", "error");
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  function updateViewportMetrics() {
    const viewport = window.visualViewport;
    const height = Math.max(
      320,
      Math.round(viewport?.height || window.innerHeight || 0),
    );
    const coveredBottom = viewport
      ? Math.max(
          0,
          Math.min(
            96,
            Math.round(
              (window.innerHeight || viewport.height) -
                viewport.height -
                viewport.offsetTop,
            ),
          ),
        )
      : 0;
    document.documentElement?.style?.setProperty(
      "--app-viewport-height",
      `${height}px`,
    );
    document.documentElement?.style?.setProperty(
      "--visual-viewport-bottom",
      `${coveredBottom}px`,
    );
  }

  function gradeForLevel(level) {
    const group = levelGroups.find((item) => level >= item.start && level <= item.end);
    return group ? group.label : "高校入試チャレンジ";
  }

  function bandForLevel(level) {
    const index = levelGroups.findIndex(
      (group) => level >= group.start && level <= group.end,
    );
    return index >= 0 ? index + 1 : levelGroups.length;
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
      ${state.exitConfirmOpen ? exitConfirmTemplate() : ""}
      ${state.toast ? `<div class="toast" role="status"><span>★</span> ${state.toast}</div>` : ""}
    `;
    if (state.view === "write") setupWritingCanvas();
  }

  function homeTemplate() {
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
            <p class="eyebrow">おかえり、${escapeHtml(displayName())}</p>
            <h1>きょうも、ひとつ<br /><span>のびよう。</span></h1>
          </div>
          <button class="profile-dot" type="button" data-view="profile" aria-label="プロフィールを開く">
            ${escapeHtml(displayName().slice(0, 1))}
          </button>
        </section>

        <button type="button" class="registration-prompt" data-view="profile">
          <span class="registration-icon">人</span>
          <span><b>学習する人：${escapeHtml(displayName())}</b><small>タップして名前を切り替えられます</small></span>
          <i>›</i>
        </button>

        <section class="level-card" aria-label="4分野の総合レベル${state.level}">
          <div class="level-copy">
            <span class="level-kicker">4分野の総合レベル</span>
            <div class="level-number"><small>Lv.</small>${state.level}</div>
            <span class="grade-chip">${gradeForLevel(state.level)}</span>
            <button type="button" class="text-link" data-action="open-placement" data-mode="write">
              分野別の開始レベルを調整 <span aria-hidden="true">›</span>
            </button>
          </div>
          <div class="progress-orbit" style="--progress: ${state.xp * 3.6}deg">
            <div><b>${state.xp}%</b><span>4分野の平均XP</span></div>
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
            <div><p class="eyebrow">FOUR SKILLS</p><h2>4つのレベル</h2></div>
            <button type="button" class="text-link" data-view="levels">すべて見る <span>›</span></button>
          </div>
          <div class="skill-overview-grid">
            ${SKILL_MODES.map((mode) => {
              const skill = activeSkill(mode);
              return `
                <button type="button" data-view="levels" data-level-mode="${mode}">
                  <span>${MODE_INFO[mode].short}</span>
                  <b>Lv.${skill.level}</b>
                  <small>${gradeForLevel(skill.level)} ・ ${skill.xp}%</small>
                </button>
              `;
            }).join("")}
          </div>
          <p class="road-note"><span>◆</span> 選んだ分野のレベルに合う問題が出ます</p>
        </section>

        <div class="encouragement">
          <span class="mini-face">☺</span>
          <p><b>毎日5分でも、ちゃんとのびる。</b><br />${state.checkpointEvery}問ごとに、続けるか休むか選べます。</p>
        </div>
      </div>
    `;
  }

  function subjectCard(mode, icon, name, detail, cardClass, iconClass) {
    const skill = activeSkill(mode);
    return `
      <button type="button" class="subject-card ${cardClass}" data-start="${mode}">
        <span class="subject-icon ${iconClass}">${icon}</span>
        <span class="subject-time">約${mode === "flash" ? 2 : 3}分</span>
        <span class="subject-level-chip">Lv.${skill.level} ・ ${gradeForLevel(skill.level)}</span>
        <span class="subject-name">${name}</span>
        <span class="subject-detail">${state.counts[mode]}問 ・ ${detail}</span>
        <span class="start-arrow" aria-hidden="true">→</span>
      </button>
    `;
  }

  function startSession(mode) {
    stopFlash();
    stopAutoAdvance();
    const skill = activeSkill(mode);
    const problems = createSessionProblems(mode, state.counts[mode], skill.level);
    state.session = {
      mode,
      total: state.counts[mode],
      levelAtStart: skill.level,
      skillAtStart: {
        level: skill.level,
        xp: skill.xp,
        updatedAt: skill.updatedAt,
      },
      problems,
      completed: 0,
      correct: 0,
      attempts: 0,
      endedEarly: false,
    };
    state.exitConfirmOpen = false;
    state.view = mode;
    resetQuestionState();
    if (mode === "flash") prepareFlashQuestion();
    saveProgress();
    render();
    window.scrollTo({ top: 0, left: 0 });
  }

  function lessonHeader(title) {
    const session = state.session;
    return `
      <header class="lesson-header">
        <button class="lesson-exit-button" type="button" data-action="ask-exit" aria-label="途中でやめる">
          <span>×</span> やめる
        </button>
        <div class="lesson-heading">
          <span>${title}</span>
          <div class="lesson-progress"><i style="width:${(session.completed / session.total) * 100}%"></i></div>
        </div>
        <span class="question-count">${currentNumber()}<small> / ${session.total}</small></span>
      </header>
    `;
  }

  function lessonLevelRow(extra = "") {
    const lessonLevel =
      state.session?.levelAtStart ??
      activeSkill(state.session?.mode || state.levelViewMode).level;
    return `
      <div class="lesson-level-row">
        <span>Lv.${lessonLevel}</span><span>${gradeForLevel(lessonLevel)}</span>${extra}
      </div>
    `;
  }

  function writeTemplate() {
    const problem = currentSessionProblem();
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
    const problem = currentSessionProblem();
    const choices = state.readingChoices.length ? state.readingChoices : problem.choices;
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
          ${choices.map((choice) => {
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
        <div class="reading-feedback-slot">${feedback}</div>
        ${state.readingChecked
          ? state.readingChoice === problem.answer
            ? '<p class="auto-next-note" aria-live="polite">正解！ 次の問題へ進みます…</p>'
            : '<button type="button" class="primary-button wide" data-action="next-reading">つぎの問題へ →</button>'
          : '<p class="choice-note">読み方をひとつ選んでね</p>'
        }
      </div>
    `;
  }

  function mathTemplate() {
    const problem = currentSessionProblem();
    const message =
      state.mathResult === "wrong"
        ? '<p class="result-message">おしい！ もう一度考えよう</p>'
        : state.mathResult === "correct"
          ? '<p class="result-message success">正解！ いいテンポ！</p>'
          : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
    return `
      <div class="screen lesson-screen math-lesson">
        ${lessonHeader("暗算する")}
        ${lessonLevelRow('<span class="timer">◷ テンポよく</span>')}
        <section class="math-question">
          <p class="eyebrow">こたえはいくつ？</p>
          <h1 class="${problem.question.length > 12 ? "compact" : ""}">${problem.question}</h1>
          <div class="answer-box ${state.mathResult}">${state.mathAnswer || "<span>?</span>"}</div>
          ${message}
        </section>
        <div class="hint-box"><span>ヒント</span><p>${problem.hint}</p></div>
        ${numberPad("math")}
        <div class="math-answer-dock">
          ${state.mathResult === "correct"
            ? '<p class="auto-next-note" aria-live="polite">正解！ 次の問題へ進みます…</p>'
            : `<button type="button" class="primary-button wide" data-action="submit-math" ${state.mathAnswer ? "" : "disabled"}>こたえる</button>`
          }
        </div>
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
          <button type="button" class="primary-button wide" data-action="start-flash">カウントを始める</button>
        </div>
      `;
    } else if (state.flashPhase === "countdown") {
      stage = `
        <div class="flash-countdown" aria-live="assertive">
          <p>フラッシュ暗算</p>
          <strong id="flashCue">${state.flashCue}</strong>
          <small>合図のあとに数字が出ます</small>
        </div>
      `;
    } else if (state.flashPhase === "showing") {
      stage = `
        <div class="flash-showing" aria-live="assertive">
          <p>よく見てね</p>
          <strong id="flashNumber">${state.flashSequence[0]}</strong>
          <div class="flash-dots">${state.flashSequence.map(() => "<i></i>").join("")}</div>
          <span class="flash-step" id="flashStep">1 / ${state.flashSequence.length}</span>
        </div>
      `;
    } else {
      const message =
        state.flashResult === "wrong"
          ? `<p class="result-message">おしい！ もう一度。合計はまだ秘密です。</p>`
          : state.flashResult === "correct"
            ? `<p class="result-message success">正解！ 合計は ${total} です。</p>`
            : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
      stage = `
        <div class="flash-answer-stage">
          <p class="eyebrow">ぜんぶでいくつ？</p>
          <h1>合計を答えよう</h1>
          <div class="answer-box ${state.flashResult}">${state.flashAnswer || "<span>?</span>"}</div>
          ${message}
        </div>
        ${numberPad("flash")}
        ${state.flashResult === "correct"
          ? '<p class="auto-next-note" aria-live="polite">正解！ 次の問題へ進みます…</p>'
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
    const locked =
      (target === "math" && state.mathResult === "correct") ||
      (target === "flash" && state.flashResult === "correct");
    const disabled = locked ? "disabled" : "";
    return `
      <div class="number-pad" aria-label="数字キーパッド">
        ${["1", "2", "3", "4", "5", "6", "7", "8", "9"]
          .map((key) => `<button type="button" data-number="${key}" data-number-target="${target}" ${disabled}>${key}</button>`)
          .join("")}
        <button type="button" class="pad-blank" tabindex="-1" aria-hidden="true"></button>
        <button type="button" data-number="0" data-number-target="${target}" ${disabled}>0</button>
        <button type="button" class="delete-key" data-action="delete-number" data-number-target="${target}" aria-label="一文字消す" ${disabled}>⌫</button>
      </div>
    `;
  }

  function prepareFlashQuestion() {
    const band = bandForLevel(
      state.session?.levelAtStart ?? activeSkill("flash").level,
    );
    const lengths = [3, 3, 3, 4, 4, 5, 5, 6, 6, 7];
    const maximums = [5, 10, 20, 30, 50, 75, 99, 99, 150, 200];
    const length = lengths[band - 1];
    const max = maximums[band - 1];
    let sequence = [];
    let signature = "";
    let attempts = 0;
    do {
      sequence = Array.from({ length }, () => randomInt(1, max));
      signature = sequence.join("+");
      attempts += 1;
    } while (
      state.session?.completed === 0 &&
      signature === state.lastFirstByMode.flash &&
      attempts < 20
    );
    state.flashSequence = sequence;
    if (state.session?.completed === 0) state.lastFirstByMode.flash = signature;
    state.flashPhase = "ready";
    state.flashCue = "3";
    state.flashAnswer = "";
    state.flashResult = "idle";
  }

  function startFlashSequence() {
    stopFlash();
    const token = ++state.flashRunToken;
    state.flashPhase = "countdown";
    state.flashCue = "3";
    render();

    const cues = ["3", "2", "1", "スタート！"];
    let cueIndex = 0;
    const showCue = () => {
      if (token !== state.flashRunToken || state.view !== "flash") return;
      if (cueIndex < cues.length) {
        state.flashCue = cues[cueIndex];
        const cueElement = document.querySelector("#flashCue");
        if (cueElement) {
          cueElement.textContent = state.flashCue;
          cueElement.classList.toggle("is-count", cueIndex < 3);
        }
        cueIndex += 1;
        state.flashTimer = window.setTimeout(showCue, cueIndex === cues.length ? 700 : 620);
        return;
      }
      state.flashPhase = "showing";
      render();
      runFlashNumbers(token);
    };
    showCue();
  }

  function runFlashNumbers(token) {
    let index = 0;
    const step = () => {
      if (token !== state.flashRunToken || state.view !== "flash") return;
      const numberElement = document.querySelector("#flashNumber");
      const dots = [...document.querySelectorAll(".flash-dots i")];
      const stepElement = document.querySelector("#flashStep");
      if (numberElement && index < state.flashSequence.length) {
        numberElement.classList.remove("is-separator");
        numberElement.textContent = state.flashSequence[index];
        dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
        if (stepElement) stepElement.textContent = `${index + 1} / ${state.flashSequence.length}`;
        index += 1;
        state.flashTimer = window.setTimeout(() => {
          if (token !== state.flashRunToken || state.view !== "flash") return;
          if (index < state.flashSequence.length) {
            numberElement.textContent = "＋";
            numberElement.classList.add("is-separator");
            state.flashTimer = window.setTimeout(step, 240);
          } else {
            step();
          }
        }, 700);
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

  function shuffled(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(0, index);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function problemSignature(mode, problem) {
    if (!problem) return "";
    if (mode === "write") return problem.kanji;
    if (mode === "read") return `${problem.kanji}:${problem.answer}`;
    return `${problem.question}:${problem.answer}`;
  }

  function createSessionProblems(mode, total, level) {
    if (mode === "flash") return [];
    if (mode === "math") {
      const result = [];
      const used = new Set();
      while (result.length < total) {
        let problem = generateMathProblem(level);
        let signature = problemSignature(mode, problem);
        let attempts = 0;
        while (
          (used.has(signature) ||
            (result.length === 0 && signature === state.lastFirstByMode.math)) &&
          attempts < 40
        ) {
          problem = generateMathProblem(level);
          signature = problemSignature(mode, problem);
          attempts += 1;
        }
        used.add(signature);
        result.push(problem);
      }
      state.lastFirstByMode.math = problemSignature(mode, result[0]);
      return result;
    }

    const band = bandForLevel(level);
    const bank = mode === "write" ? kanjiProblems : readingProblems;
    const pool = bank.filter((problem) => problem.band === band);
    const result = [];
    while (result.length < total) {
      const cycle = shuffled(pool);
      if (
        result.length &&
        problemSignature(mode, result[result.length - 1]) ===
          problemSignature(mode, cycle[0])
      ) {
        cycle.push(cycle.shift());
      }
      result.push(...cycle.slice(0, total - result.length));
    }
    if (
      result.length > 1 &&
      problemSignature(mode, result[0]) === state.lastFirstByMode[mode]
    ) {
      const swapIndex = result.findIndex(
        (problem, index) =>
          index > 0 &&
          problemSignature(mode, problem) !== state.lastFirstByMode[mode],
      );
      if (swapIndex > 0) [result[0], result[swapIndex]] = [result[swapIndex], result[0]];
    }
    state.lastFirstByMode[mode] = problemSignature(mode, result[0]);
    return result;
  }

  function currentSessionProblem() {
    const session = state.session;
    const queued = session?.problems?.[session.completed];
    if (queued) return queued;
    const mode = session?.mode || "write";
    const level = session?.levelAtStart ?? activeSkill(mode).level;
    if (session?.mode === "write") {
      return kanjiProblems.find((problem) => problem.band === bandForLevel(level));
    }
    if (session?.mode === "read") {
      return readingProblems.find((problem) => problem.band === bandForLevel(level));
    }
    return generateMathProblem(level);
  }

  function generateMathProblem(level) {
    const band = bandForLevel(level);
    const choice = randomInt(0, 3);

    if (band === 1) {
      const max = level <= 3 ? 5 : level <= 6 ? 10 : 20;
      if (choice % 2 === 0) {
        const left = randomInt(1, max - 1);
        const right = randomInt(1, max - left);
        return {
          question: `${left} + ${right}`,
          answer: String(left + right),
          hint: `${left}から順番に数えてみよう`,
        };
      }
      const left = randomInt(2, max);
      const right = randomInt(1, left - 1);
      return {
        question: `${left} − ${right}`,
        answer: String(left - right),
        hint: `${right}こ分だけ戻ってみよう`,
      };
    }

    if (band === 2) {
      if (level >= 16 && choice === 3) {
        const left = randomInt(2, 9);
        const right = randomInt(2, 9);
        return {
          question: `${left} × ${right}`,
          answer: String(left * right),
          hint: `${left}のだんを思い出そう`,
        };
      }
      const max = level < 16 ? 50 : 100;
      if (choice % 2 === 0) {
        const left = randomInt(10, max - 10);
        const right = randomInt(5, max - left);
        return {
          question: `${left} + ${right}`,
          answer: String(left + right),
          hint: "10のまとまりと、1のまとまりに分けよう",
        };
      }
      const left = randomInt(20, max);
      const right = randomInt(5, left - 1);
      return {
        question: `${left} − ${right}`,
        answer: String(left - right),
        hint: "10のまとまりから考えてみよう",
      };
    }

    if (band === 3) {
      if (choice === 0) {
        const left = randomInt(25, 199);
        const right = randomInt(12, 99);
        return {
          question: `${left} + ${right}`,
          answer: String(left + right),
          hint: "百・十・一の位に分けよう",
        };
      }
      if (choice === 1) {
        const left = randomInt(80, 250);
        const right = randomInt(12, left - 1);
        return {
          question: `${left} − ${right}`,
          answer: String(left - right),
          hint: "近いきりのよい数を使おう",
        };
      }
      const divisor = randomInt(2, 9);
      const quotient = randomInt(2, 9);
      return choice === 2
        ? {
            question: `${divisor} × ${quotient}`,
            answer: String(divisor * quotient),
            hint: `${divisor}のだんを思い出そう`,
          }
        : {
            question: `${divisor * quotient} ÷ ${divisor}`,
            answer: String(quotient),
            hint: `${divisor}を何回かけると${divisor * quotient}？`,
          };
    }

    if (band === 4) {
      if (choice === 0) {
        const left = randomInt(120, 650);
        const right = randomInt(80, 300);
        return {
          question: `${left} + ${right}`,
          answer: String(left + right),
          hint: "百の位から順にまとめよう",
        };
      }
      if (choice === 1) {
        const left = randomInt(300, 900);
        const right = randomInt(80, left - 1);
        return {
          question: `${left} − ${right}`,
          answer: String(left - right),
          hint: "引く数をきりのよい数にしよう",
        };
      }
      const factor = randomInt(2, 9);
      const value = randomInt(12, 89);
      return choice === 2
        ? {
            question: `${value} × ${factor}`,
            answer: String(value * factor),
            hint: `${value}を十の位と一の位に分けよう`,
          }
        : {
            question: `${value * factor} ÷ ${factor}`,
            answer: String(value),
            hint: "かけ算に直して考えよう",
          };
    }

    if (band === 5) {
      if (choice === 0) {
        const left = randomInt(12, 35);
        const right = randomInt(11, 24);
        return {
          question: `${left} × ${right}`,
          answer: String(left * right),
          hint: `${right}を10と残りに分けよう`,
        };
      }
      if (choice === 1) {
        const divisor = randomInt(4, 20);
        const quotient = randomInt(5, 40);
        return {
          question: `${divisor * quotient} ÷ ${divisor}`,
          answer: String(quotient),
          hint: `${divisor}の何倍かを考えよう`,
        };
      }
      const left = randomInt(350, 1800);
      const right = randomInt(120, 900);
      return choice === 2
        ? {
            question: `${left} + ${right}`,
            answer: String(left + right),
            hint: "百のまとまりを先に計算しよう",
          }
        : {
            question: `${left + right} − ${right}`,
            answer: String(left),
            hint: "引く数を分けて計算しよう",
          };
    }

    if (band === 6) {
      if (choice === 0) {
        const percent = [10, 20, 25, 50][randomInt(0, 3)];
        const base = randomInt(2, 20) * 100;
        return {
          question: `${base} の ${percent}%`,
          answer: String((base * percent) / 100),
          hint: `${percent}%が何分のいくつか考えよう`,
        };
      }
      if (choice === 1) {
        const left = randomInt(12, 45);
        const right = randomInt(5, 25);
        const factor = randomInt(2, 6);
        return {
          question: `(${left} + ${right}) × ${factor}`,
          answer: String((left + right) * factor),
          hint: "かっこの中を先に計算しよう",
        };
      }
      if (choice === 2) {
        const divisor = randomInt(12, 30);
        const quotient = randomInt(12, 60);
        return {
          question: `${divisor * quotient} ÷ ${divisor}`,
          answer: String(quotient),
          hint: "わる数の何倍かを見つけよう",
        };
      }
      const average = randomInt(20, 100);
      const gap = randomInt(2, 15);
      return {
        question: `(${average - gap} + ${average} + ${average + gap}) ÷ 3`,
        answer: String(average),
        hint: "3つの数の真ん中に注目しよう",
      };
    }

    if (band === 7) {
      if (choice === 0) {
        const answer = randomInt(8, 60);
        const add = randomInt(10, 50);
        return {
          question: `x + ${add} = ${answer + add}`,
          answer: String(answer),
          hint: "右の数から足した数を引こう",
        };
      }
      if (choice === 1) {
        const factor = randomInt(3, 12);
        const answer = randomInt(4, 30);
        return {
          question: `${factor} × x = ${factor * answer}`,
          answer: String(answer),
          hint: "右の数を係数で割ろう",
        };
      }
      const left = randomInt(12, 40);
      const right = randomInt(3, 12);
      const subtract = randomInt(5, 30);
      return {
        question: `${left} × ${right} − ${subtract}`,
        answer: String(left * right - subtract),
        hint: "かけ算を先に計算しよう",
      };
    }

    if (band === 8) {
      if (choice === 0) {
        const value = randomInt(11, 30);
        return {
          question: `${value}²`,
          answer: String(value * value),
          hint: `${value} × ${value}を計算しよう`,
        };
      }
      if (choice === 1) {
        const value = randomInt(8, 30);
        return {
          question: `√${value * value}`,
          answer: String(value),
          hint: "同じ数を2回かけてできる数を探そう",
        };
      }
      const factor = randomInt(2, 9);
      const answer = randomInt(5, 35);
      const add = randomInt(4, 25);
      return {
        question: `${factor} × x + ${add} = ${factor * answer + add}`,
        answer: String(answer),
        hint: "足した数を引いてから係数で割ろう",
      };
    }

    if (band === 9) {
      if (choice === 0) {
        const left = randomInt(18, 60);
        const right = randomInt(4, 15);
        const factor = randomInt(3, 9);
        return {
          question: `(${left} − ${right}) × ${factor}`,
          answer: String((left - right) * factor),
          hint: "かっこの中を先に計算しよう",
        };
      }
      if (choice === 1) {
        const left = randomInt(15, 40);
        const right = randomInt(3, left - 1);
        return {
          question: `(${left} + ${right}) × (${left} − ${right})`,
          answer: String((left + right) * (left - right)),
          hint: "2つのかっこを別々に計算しよう",
        };
      }
      const base = randomInt(3, 20) * 200;
      const percent = [15, 20, 30, 40][randomInt(0, 3)];
      return {
        question: `${base} の ${percent}%`,
        answer: String((base * percent) / 100),
        hint: "10%を作ってから必要な倍数にしよう",
      };
    }

    if (choice === 0) {
      const left = randomInt(25, 80);
      const right = randomInt(8, 24);
      const factor = randomInt(4, 12);
      return {
        question: `${left} × ${factor} + ${right}²`,
        answer: String(left * factor + right * right),
        hint: "累乗とかけ算を先に計算しよう",
      };
    }
    if (choice === 1) {
      const answer = randomInt(12, 80);
      const factor = randomInt(4, 15);
      const add = randomInt(20, 90);
      return {
        question: `(${factor} × x) − ${add} = ${factor * answer - add}`,
        answer: String(answer),
        hint: "両辺に同じ数を足してから割ろう",
      };
    }
    const left = randomInt(30, 90);
    const right = randomInt(10, 29);
    const divisor = randomInt(2, 9);
    return {
      question: `(${left + right} − ${right}) × ${divisor}`,
      answer: String(left * divisor),
      hint: "かっこの中を整理してからかけよう",
    };
  }

  function prepareReadingChoices() {
    if (!state.session || state.session.mode !== "read") {
      state.readingChoices = [];
      return;
    }
    const problem = currentSessionProblem();
    const possibleIndexes = problem.choices
      .map((_, index) => index)
      .filter((index) => index !== state.lastReadingAnswerIndex);
    const answerIndex = possibleIndexes[randomInt(0, possibleIndexes.length - 1)];
    const wrongChoices = shuffled(problem.choices.filter((choice) => choice !== problem.answer));
    wrongChoices.splice(answerIndex, 0, problem.answer);
    state.readingChoices = wrongChoices;
    state.lastReadingAnswerIndex = answerIndex;
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
    stopAutoAdvance();
    if (state.session) state.session.endedEarly = endedEarly;
    state.checkpointOpen = false;
    state.exitConfirmOpen = false;
    state.view = "result";
    render();
  }

  function stopAutoAdvance() {
    window.clearTimeout(state.answerAdvanceTimer);
    state.answerAdvanceTimer = 0;
  }

  function currentAnswerIsCorrect(mode) {
    if (!state.session || state.session.mode !== mode) return false;
    if (mode === "read") {
      return (
        state.readingChecked &&
        state.readingChoice === currentSessionProblem().answer
      );
    }
    if (mode === "math") return state.mathResult === "correct";
    if (mode === "flash") return state.flashResult === "correct";
    return false;
  }

  function scheduleCorrectAdvance(mode) {
    stopAutoAdvance();
    const session = state.session;
    if (!session || !currentAnswerIsCorrect(mode)) return;
    state.answerAdvanceTimer = window.setTimeout(() => {
      state.answerAdvanceTimer = 0;
      if (
        state.session !== session ||
        state.exitConfirmOpen ||
        !currentAnswerIsCorrect(mode)
      ) {
        return;
      }
      state.session.completed += 1;
      advanceAfterCompletedQuestion();
    }, 700);
  }

  function resumeCorrectAdvance() {
    const mode = state.session?.mode;
    if (["read", "math", "flash"].includes(mode) && currentAnswerIsCorrect(mode)) {
      scheduleCorrectAdvance(mode);
    }
  }

  function discardCurrentSession() {
    const session = state.session;
    if (!session || !SKILL_MODES.includes(session.mode)) {
      state.exitConfirmOpen = false;
      state.view = "home";
      render();
      return;
    }

    stopFlash();
    stopAutoAdvance();
    const profile = ensureProfile(state.learnerName);
    const restoredAt = Date.now();
    profile.skills[session.mode] = {
      level: session.skillAtStart?.level ?? session.levelAtStart,
      xp: session.skillAtStart?.xp ?? 0,
      updatedAt: restoredAt,
    };
    profile.updatedAt = Math.max(profile.updatedAt, restoredAt);
    applyActiveProfile();
    state.session = null;
    state.checkpointOpen = false;
    state.exitConfirmOpen = false;
    state.view = "home";
    resetQuestionState();
    saveProgress(session.mode);
    showToast("今回の学習は記録せずに終了しました");
    render();
    window.scrollTo({ top: 0, left: 0 });
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

  function exitConfirmTemplate() {
    const mode = state.session?.mode;
    return `
      <div class="sheet-backdrop">
        <section class="exit-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="exit-confirm-title">
          <span class="exit-confirm-mark">×</span>
          <p class="eyebrow">QUIT SESSION</p>
          <h2 id="exit-confirm-title">途中でやめますか？</h2>
          <p>
            今回の「${mode ? MODE_INFO[mode].label : "学習"}」で増えたXPやレベルは、
            すべて開始前の状態に戻ります。
          </p>
          <button type="button" class="primary-button wide" data-action="continue-learning">学習を続ける</button>
          <button type="button" class="secondary-button wide" data-action="discard-session">ノーカウントでやめる</button>
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
          <p>
            ${escapeHtml(displayName())}の「${MODE_INFO[session.mode].label}」
            ・ Lv.${activeSkill(session.mode).level}
          </p>
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
    const mode = SKILL_MODES.includes(state.levelViewMode)
      ? state.levelViewMode
      : "write";
    const skill = activeSkill(mode);
    return `
      <div class="screen sub-screen level-map-screen">
        <header class="sub-header">
          <button class="round-button" type="button" data-action="back-home" aria-label="戻る">‹</button>
          <div><p class="eyebrow">4 SKILLS / LEVEL 1–100</p><h1>分野別レベル</h1></div>
        </header>
        <div class="skill-mode-tabs" aria-label="表示する分野">
          ${SKILL_MODES.map((itemMode) => `
            <button
              type="button"
              class="${itemMode === mode ? "active" : ""}"
              data-level-mode="${itemMode}"
            >${MODE_INFO[itemMode].short}</button>
          `).join("")}
        </div>
        <div class="map-intro">
          <span>${MODE_INFO[mode].label}の現在地</span>
          <b>Lv.${skill.level}</b>
          <p>${gradeForLevel(skill.level)} ・ XP ${skill.xp}%</p>
        </div>
        ${learnerLevelListTemplate()}
        <div class="level-groups">
          ${levelGroups.map((group) => {
            const complete = skill.level > group.end;
            const active = skill.level >= group.start && skill.level <= group.end;
            const percent = complete
              ? 100
              : active
                ? Math.round(((skill.level - group.start + 1) / (group.end - group.start + 1)) * 100)
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

  function learnerLevelListTemplate() {
    return `
      <section class="learner-levels-card">
        <div class="settings-heading">
          <div><p class="eyebrow">LEARNERS</p><h2>みんなの4分野レベル</h2></div>
          <span>${state.learnerNames.length}人</span>
        </div>
        <div class="learner-level-list">
          ${state.learnerNames.map((name) => {
            const profile = ensureProfile(name);
            const active = name === state.learnerName;
            return `
              <button type="button" class="${active ? "active" : ""}" data-select-learner="${escapeHtml(name)}">
                <span class="learner-avatar">${escapeHtml(name.slice(0, 1))}</span>
                <span class="learner-copy">
                  <b>${escapeHtml(name)}</b>
                  <small>総合 Lv.${overallLevel(profile)} ・ ${gradeForLevel(overallLevel(profile))}</small>
                </span>
                <span class="learner-skill-levels">
                  ${SKILL_MODES.map((mode) => {
                    const skill = profile.skills[mode];
                    return `<span><small>${MODE_INFO[mode].short}</small><b>Lv.${skill.level}</b></span>`;
                  }).join("")}
                </span>
              </button>
            `;
          }).join("")}
        </div>
        <p class="settings-note">名前をタップすると、学習する人を切り替えられます。</p>
      </section>
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
            <div><p class="eyebrow">LEARNER</p><h2>なまえを選ぶ</h2></div>
          </div>
          <label class="name-field">
            <span>学習する人のなまえ</span>
            <select id="learnerName" aria-label="学習する人のなまえ">
              ${state.learnerNames.map((name) => `
                <option value="${escapeHtml(name)}" ${name === state.learnerName ? "selected" : ""}>${escapeHtml(name)}</option>
              `).join("")}
            </select>
          </label>
          <button type="button" class="primary-button wide save-learner-button" data-action="save-learner">
            この名前で学習する
          </button>
          <div class="name-file-actions">
            <button type="button" data-action="reload-names">名簿を再読み込み</button>
            <label>
              names.txtを選ぶ
              <input id="namesFileInput" type="file" accept=".txt,text/plain" />
            </label>
          </div>
          <p class="settings-note names-file-note">
            読込元：${escapeHtml(state.namesSource)}<br />
            GitHubでは「再読み込み」、このファイルを直接開いている場合は「names.txtを選ぶ」を使います。
          </p>
        </section>

        <section class="settings-card cloud-sync-card">
          <div class="settings-heading">
            <div><p class="eyebrow">FIREBASE SYNC</p><h2>端末間のレベル共有</h2></div>
            <span id="cloudStatusBadge" class="cloud-status-badge ${state.cloudTone}">
              ${state.cloudTone === "online" ? "同期ON" : state.cloudTone === "busy" ? "同期中" : "端末保存"}
            </span>
          </div>
          <p id="cloudStatusText" class="cloud-status-text">${escapeHtml(state.cloudStatus)}</p>
          <p id="cloudLastSyncedAt" class="cloud-sync-time">${escapeHtml(cloudLastSyncedText())}</p>
          <button
            type="button"
            class="secondary-button wide cloud-sync-button"
            data-action="sync-cloud"
            ${window.NobiruCloud?.isConfigured?.() ? "" : "disabled"}
          >今すぐ同期する</button>
          <p class="settings-note">
            正解・レベル調整の直後に自動保存します。アプリを開いた時、画面へ戻った時、名前を切り替えた時に最新データを取得します。
          </p>
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

        <button type="button" class="primary-button wide save-settings-button" data-action="save-settings">問題数・間隔を保存する</button>

        <section class="profile-summary">
          <div class="profile-summary-heading">
            <span>現在の分野別レベル</span>
            <b>総合 Lv.${state.level}</b>
          </div>
          <div class="profile-skill-list">
            ${SKILL_MODES.map((mode) => {
              const skill = activeSkill(mode);
              return `
                <button type="button" data-action="open-placement" data-mode="${mode}">
                  <span>${MODE_INFO[mode].short}</span>
                  <b>Lv.${skill.level}</b>
                  <small>${gradeForLevel(skill.level)} ・ XP ${skill.xp}%</small>
                  <i>調整 ›</i>
                </button>
              `;
            }).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function placementTemplate() {
    const mode = SKILL_MODES.includes(state.placementMode)
      ? state.placementMode
      : "write";
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
          <p class="eyebrow">STARTING POINT</p><h2 id="placement-title">分野ごとに調整</h2>
          <div class="placement-skill-tabs" aria-label="調整する分野">
            ${SKILL_MODES.map((itemMode) => `
              <button
                type="button"
                class="${itemMode === mode ? "active" : ""}"
                data-placement-skill="${itemMode}"
              >${MODE_INFO[itemMode].short}</button>
            `).join("")}
          </div>
          <p class="sheet-lead"><b>${MODE_INFO[mode].label}</b>はどこから始める？<br />ほかの分野のレベルは変わりません。</p>
          <div class="placement-options">
            ${choices.map((choice) => `
              <button type="button" data-placement="${choice.level}">
                <span>Lv.${choice.level}</span>
                <span><b>${choice.title}</b><small>${choice.detail}</small></span><i>›</i>
              </button>
            `).join("")}
          </div>
          <p class="sheet-note">選んだ分野だけを変更します。高いレベルほどテーマを細かく分けています。</p>
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
      stopAutoAdvance();
      state.exitConfirmOpen = false;
      if (SKILL_MODES.includes(viewButton.dataset.levelMode)) {
        state.levelViewMode = viewButton.dataset.levelMode;
      }
      state.view = viewButton.dataset.view;
      state.session = null;
      resetQuestionState();
      render();
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const levelModeButton = event.target.closest("[data-level-mode]");
    if (levelModeButton) {
      state.levelViewMode = SKILL_MODES.includes(levelModeButton.dataset.levelMode)
        ? levelModeButton.dataset.levelMode
        : "write";
      render();
      return;
    }

    const placementSkillButton = event.target.closest("[data-placement-skill]");
    if (placementSkillButton) {
      state.placementMode = SKILL_MODES.includes(
        placementSkillButton.dataset.placementSkill,
      )
        ? placementSkillButton.dataset.placementSkill
        : "write";
      render();
      return;
    }

    const placement = event.target.closest("[data-placement]");
    if (placement) {
      const mode = SKILL_MODES.includes(state.placementMode)
        ? state.placementMode
        : "write";
      const profile = ensureProfile(state.learnerName);
      profile.skills[mode] = {
        level: clamp(placement.dataset.placement, 1, 100),
        xp: 0,
        updatedAt: Date.now(),
      };
      profile.updatedAt = Math.max(profile.updatedAt, profile.skills[mode].updatedAt);
      applyActiveProfile();
      state.placementOpen = false;
      saveProgress(mode);
      showToast(
        `${MODE_INFO[mode].short}はレベル ${profile.skills[mode].level} から！`,
      );
      render();
      return;
    }

    const learnerButton = event.target.closest("[data-select-learner]");
    if (learnerButton) {
      activateLearner(learnerButton.dataset.selectLearner);
      showToast(`${displayName()}に切り替えました`);
      render();
      if (state.cloudReady) syncCloudProfiles();
      return;
    }

    const readingButton = event.target.closest("[data-reading]");
    if (readingButton && !state.readingChecked) {
      const problem = currentSessionProblem();
      state.readingChoice = readingButton.dataset.reading;
      state.readingChecked = true;
      state.session.attempts += 1;
      const correct = state.readingChoice === problem.answer;
      if (correct) {
        state.session.correct += 1;
        earnXp(MODE_INFO.read.xp);
      }
      render();
      if (correct) scheduleCorrectAdvance("read");
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
        stopAutoAdvance();
        state.view = "home";
        state.session = null;
        state.checkpointOpen = false;
        state.exitConfirmOpen = false;
        resetQuestionState();
        render();
      },
      "ask-exit"() {
        stopFlash();
        stopAutoAdvance();
        if (
          state.session?.mode === "flash" &&
          ["countdown", "showing"].includes(state.flashPhase)
        ) {
          state.flashPhase = "ready";
          state.flashAnswer = "";
          state.flashResult = "idle";
        }
        state.exitConfirmOpen = true;
        render();
      },
      "continue-learning"() {
        state.exitConfirmOpen = false;
        render();
        resumeCorrectAdvance();
      },
      "discard-session"() {
        discardCurrentSession();
      },
      "open-placement"() {
        state.placementMode = SKILL_MODES.includes(actionButton.dataset.mode)
          ? actionButton.dataset.mode
          : state.placementMode;
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
        const problem = currentSessionProblem();
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
        const problem = currentSessionProblem();
        state.session.attempts += 1;
        state.mathResult = state.mathAnswer === problem.answer ? "correct" : "wrong";
        if (state.mathResult === "correct") {
          state.session.correct += 1;
          earnXp(MODE_INFO.math.xp);
        }
        render();
        if (state.mathResult === "correct") scheduleCorrectAdvance("math");
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
        if (state.flashResult === "correct") scheduleCorrectAdvance("flash");
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
      "save-learner"() {
        saveLearnerSelection();
      },
      "reload-names"() {
        loadLearnerNames(true);
      },
      "sync-cloud"() {
        if (state.cloudReady) {
          flushPendingCloudSaves().finally(() => syncCloudProfiles());
        } else {
          initializeCloudSync();
        }
      },
    };
    actions[action]?.();
  }

  async function handleChange(event) {
    if (event.target.id !== "namesFileInput") return;
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text =
        typeof file.text === "function"
          ? await file.text()
          : await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.addEventListener("load", () => resolve(reader.result), { once: true });
              reader.addEventListener("error", reject, { once: true });
              reader.readAsText(file, "UTF-8");
            });
      const names = parseLearnerNames(text);
      if (!names.length) {
        showToast("名前が1件も見つかりませんでした");
      } else {
        applyLearnerNames(names, "選択したnames.txt");
        showToast(`${names.length}人の名簿を読み込みました`);
      }
    } catch {
      showToast("選択したファイルを読み込めませんでした");
    }
    event.target.value = "";
    render();
  }

  function advanceAfterCompletedQuestion() {
    stopAutoAdvance();
    if (state.session.completed >= state.session.total) {
      finishSession(false);
      return;
    }
    resetQuestionState();
    state.exitConfirmOpen = false;
    if (state.session.mode === "flash") prepareFlashQuestion();
    if (state.session.completed % state.checkpointEvery === 0) {
      state.checkpointOpen = true;
    }
    render();
  }

  function saveSettingsFromForm() {
    const nameField = document.querySelector("#learnerName");
    activateLearner(nameField?.value || state.learnerName, false);
    document.querySelectorAll("[data-count-mode]").forEach((input) => {
      state.counts[input.dataset.countMode] = clamp(input.value || 10, 3, 50);
    });
    const checkpoint = document.querySelector("input[name='checkpoint']:checked");
    state.checkpointEvery = Number(checkpoint?.value) === 3 ? 3 : 5;
    saveProgress();
    showToast("設定を保存しました");
    render();
  }

  async function saveLearnerSelection() {
    const nameField = document.querySelector("#learnerName");
    activateLearner(nameField?.value || state.learnerName, false);
    saveProgress();
    showToast(`${displayName()}に切り替えました`);
    render();
    if (state.cloudReady) {
      await flushPendingCloudSaves();
      await syncCloudProfiles();
    } else if (window.NobiruCloud?.isConfigured?.()) {
      await initializeCloudSync();
    }
  }

  function resetQuestionState() {
    state.kanjiMarks = 0;
    state.kanjiChecking = false;
    state.kanjiImage = "";
    state.readingChoice = "";
    state.readingChecked = false;
    prepareReadingChoices();
    state.mathAnswer = "";
    state.mathResult = "idle";
    state.flashAnswer = "";
    state.flashResult = "idle";
    state.flashCue = "3";
    if (state.session?.mode !== "flash") state.flashPhase = "ready";
  }

  function earnXp(amount) {
    const mode = state.session?.mode;
    if (!SKILL_MODES.includes(mode)) return;
    const profile = ensureProfile(state.learnerName);
    const skill = profile.skills[mode];
    const total = skill.xp + amount;
    if (total >= 100 && skill.level < 100) {
      skill.level += 1;
      skill.xp = total - 100;
      showToast(`${MODE_INFO[mode].short}がレベル ${skill.level} にアップ！`);
    } else {
      skill.xp = Math.min(100, total);
    }
    skill.updatedAt = Date.now();
    profile.updatedAt = Math.max(profile.updatedAt, skill.updatedAt);
    applyActiveProfile();
    saveProgress(mode);
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
