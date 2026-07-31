(() => {
  "use strict";

  const app = document.querySelector("#app");
  const STORAGE_KEY = "nobiru-progress";
  const MODE_INFO = {
    digits: { label: "数字記憶", short: "数字記憶", xp: 13, penalty: 4 },
    memory: { label: "フラッシュカード", short: "カード", xp: 13, penalty: 4 },
    flash: { label: "フラッシュ暗算", short: "フラッシュ", xp: 14, penalty: 4 },
    math: { label: "暗算する", short: "暗算", xp: 16, penalty: 5 },
    read: { label: "漢字を読む", short: "漢字・読み", xp: 12, penalty: 4 },
    write: { label: "漢字を書く", short: "漢字・書き", xp: 18, penalty: 6 },
  };
  const MIKKUN_MODE_LABELS = {
    write: "おたから さがし",
    read: "なかま さがし",
    math: "かずの たからばこ",
    memory: "つぎは どっち？",
  };
  const SKILL_MODES = Object.keys(MODE_INFO);
  const DEFAULT_COUNTS = {
    write: 10,
    read: 10,
    math: 10,
    flash: 10,
    memory: 10,
    digits: 10,
  };
  const DEFAULT_NAMES = ["ゆうき", "あおい", "さくら", "はると"];
  const MIKKUN_NAME = "みっくん";
  const PRESCHOOL_QUESTION_COUNT = 5;
  const DIFFICULTY_OFFSET = 12;
  const MIKKUN_STAGES = [
    { rank: 1, min: 1, max: 5, label: "年少さん・はじめ", short: "年少さん", next: "年少さん・ぐんぐん" },
    { rank: 2, min: 6, max: 10, label: "年少さん・ぐんぐん", short: "年少さん", next: "年中さん・はじめ" },
    { rank: 3, min: 11, max: 20, label: "年中さん・はじめ", short: "年中さん", next: "年中さん・チャレンジ" },
    { rank: 4, min: 21, max: 100, label: "年中さん・チャレンジ", short: "年中さん", next: "マスター" },
  ];
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const KANJIVG_SOURCES = [
    "https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/",
    "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/",
  ];
  const kanjiStrokeCache = new Map();
  let tapAudioContext = null;
  let kanjiStrokeRunToken = 0;
  let kanjiStrokeFetchController = null;
  let kanjiStrokeAnimations = [];

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

  const additionalKanjiProblems = Array.isArray(window.NOBIRU_ADDITIONAL_KANJI)
    ? window.NOBIRU_ADDITIONAL_KANJI
    : [];

  additionalKanjiProblems.forEach(([band, kanji, reading, word]) => {
    kanjiProblems.push({ band, kanji, reading, word, strokes: null });
  });

  additionalKanjiProblems.forEach(([band, kanji, reading]) => {
    const distractors = [
      ...new Set(
        additionalKanjiProblems
          .filter((item) => item[0] === band && item[2] !== reading)
          .map((item) => item[2]),
      ),
    ].slice(0, 3);
    readingProblems.push({
      band,
      kanji,
      answer: reading,
      choices: [reading, ...distractors],
    });
  });

  const memoryCards = [
    { id: "dog", symbol: "🐶", label: "いぬ", artX: 0, artY: 0 },
    { id: "cat", symbol: "🐱", label: "ねこ", artX: 33.333, artY: 0 },
    { id: "rabbit", symbol: "🐰", label: "うさぎ", artX: 66.667, artY: 0 },
    { id: "elephant", symbol: "🐘", label: "ぞう", artX: 100, artY: 0 },
    { id: "giraffe", symbol: "🦒", label: "きりん", artX: 0, artY: 33.333 },
    { id: "lion", symbol: "🦁", label: "らいおん", artX: 33.333, artY: 33.333 },
    { id: "panda", symbol: "🐼", label: "ぱんだ", artX: 66.667, artY: 33.333 },
    { id: "monkey", symbol: "🐵", label: "さる", artX: 100, artY: 33.333 },
    { id: "apple", symbol: "🍎", label: "りんご", artX: 0, artY: 66.667 },
    { id: "banana", symbol: "🍌", label: "ばなな", artX: 33.333, artY: 66.667 },
    { id: "car", symbol: "🚗", label: "くるま", artX: 66.667, artY: 66.667 },
    { id: "train", symbol: "🚃", label: "でんしゃ", artX: 100, artY: 66.667 },
    { id: "plane", symbol: "✈️", label: "ひこうき", artX: 0, artY: 100 },
    { id: "sun", symbol: "☀️", label: "たいよう", artX: 33.333, artY: 100 },
    { id: "flower", symbol: "🌷", label: "はな", artX: 66.667, artY: 100 },
    { id: "umbrella", symbol: "☂️", label: "かさ", artX: 100, artY: 100 },
    { id: "fox", symbol: "🦊", label: "きつね", artX: 0, artY: 0, sheet: "extra" },
    { id: "bear", symbol: "🐻", label: "くま", artX: 33.333, artY: 0, sheet: "extra" },
    { id: "penguin", symbol: "🐧", label: "ぺんぎん", artX: 66.667, artY: 0, sheet: "extra" },
    { id: "koala", symbol: "🐨", label: "こあら", artX: 100, artY: 0, sheet: "extra" },
    { id: "dolphin", symbol: "🐬", label: "いるか", artX: 0, artY: 33.333, sheet: "extra" },
    { id: "whale", symbol: "🐳", label: "くじら", artX: 33.333, artY: 33.333, sheet: "extra" },
    { id: "turtle", symbol: "🐢", label: "かめ", artX: 66.667, artY: 33.333, sheet: "extra" },
    { id: "octopus", symbol: "🐙", label: "たこ", artX: 100, artY: 33.333, sheet: "extra" },
    { id: "strawberry", symbol: "🍓", label: "いちご", artX: 0, artY: 66.667, sheet: "extra" },
    { id: "orange", symbol: "🍊", label: "みかん", artX: 33.333, artY: 66.667, sheet: "extra" },
    { id: "watermelon", symbol: "🍉", label: "すいか", artX: 66.667, artY: 66.667, sheet: "extra" },
    { id: "grapes", symbol: "🍇", label: "ぶどう", artX: 100, artY: 66.667, sheet: "extra" },
    { id: "bus", symbol: "🚌", label: "ばす", artX: 0, artY: 100, sheet: "extra" },
    { id: "bicycle", symbol: "🚲", label: "じてんしゃ", artX: 33.333, artY: 100, sheet: "extra" },
    { id: "ship", symbol: "🚢", label: "ふね", artX: 66.667, artY: 100, sheet: "extra" },
    { id: "helicopter", symbol: "🚁", label: "へりこぷたー", artX: 100, artY: 100, sheet: "extra" },
  ];

  const mikkunTreasureProblems = [
    { prompt: "おだいと おなじ えは どれ？", displayCard: "dog", answer: "dog", answerLabel: "いぬ", choices: ["dog", "cat", "rabbit"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "cat", answer: "cat", answerLabel: "ねこ", choices: ["cat", "lion", "monkey"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "rabbit", answer: "rabbit", answerLabel: "うさぎ", choices: ["rabbit", "dog", "panda"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "elephant", answer: "elephant", answerLabel: "ぞう", choices: ["elephant", "giraffe", "lion"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "apple", answer: "apple", answerLabel: "りんご", choices: ["apple", "sun", "flower"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "car", answer: "car", answerLabel: "くるま", choices: ["car", "train", "plane"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "umbrella", answer: "umbrella", answerLabel: "かさ", choices: ["umbrella", "flower", "banana"] },
    { prompt: "おだいと おなじ えは どれ？", displayCard: "panda", answer: "panda", answerLabel: "ぱんだ", choices: ["panda", "monkey", "cat"] },
    { stage: 2, prompt: "おだいと おなじ えは どれ？", displayCard: "fox", answer: "fox", answerLabel: "きつね", choices: ["fox", "bear", "cat"] },
    { stage: 2, prompt: "おだいと おなじ えは どれ？", displayCard: "penguin", answer: "penguin", answerLabel: "ぺんぎん", choices: ["penguin", "koala", "rabbit"] },
    { stage: 2, prompt: "おだいと おなじ えは どれ？", displayCard: "turtle", answer: "turtle", answerLabel: "かめ", choices: ["turtle", "dolphin", "octopus"] },
    { stage: 2, prompt: "おだいと おなじ えは どれ？", displayCard: "strawberry", answer: "strawberry", answerLabel: "いちご", choices: ["strawberry", "orange", "grapes"] },
    { stage: 3, prompt: "よくみて おなじ えを みつけよう", displayCard: "dolphin", answer: "dolphin", answerLabel: "いるか", choices: ["whale", "dolphin", "turtle"] },
    { stage: 3, prompt: "よくみて おなじ えを みつけよう", displayCard: "bicycle", answer: "bicycle", answerLabel: "じてんしゃ", choices: ["bus", "ship", "bicycle"] },
    { stage: 3, prompt: "よくみて おなじ えを みつけよう", displayCard: "helicopter", answer: "helicopter", answerLabel: "へりこぷたー", choices: ["plane", "helicopter", "ship"] },
    { stage: 3, prompt: "よくみて おなじ えを みつけよう", displayCard: "watermelon", answer: "watermelon", answerLabel: "すいか", choices: ["orange", "watermelon", "apple"] },
    { stage: 4, prompt: "よくみて おなじ えを みつけよう", displayCard: "whale", answer: "whale", answerLabel: "くじら", choices: ["dolphin", "whale", "turtle"] },
    { stage: 4, prompt: "よくみて おなじ えを みつけよう", displayCard: "octopus", answer: "octopus", answerLabel: "たこ", choices: ["octopus", "flower", "grapes"] },
    { stage: 4, prompt: "よくみて おなじ えを みつけよう", displayCard: "ship", answer: "ship", answerLabel: "ふね", choices: ["bus", "ship", "helicopter"] },
    { stage: 4, prompt: "よくみて おなじ えを みつけよう", displayCard: "grapes", answer: "grapes", answerLabel: "ぶどう", choices: ["grapes", "watermelon", "orange"] },
  ];

  const mikkunGroupProblems = [
    { prompt: "たべものを みつけよう", display: "🧺", answer: "apple", answerLabel: "りんご", choices: ["dog", "apple", "car"] },
    { prompt: "たべものを みつけよう", display: "🧺", answer: "banana", answerLabel: "ばなな", choices: ["banana", "rabbit", "train"] },
    { prompt: "のりものを みつけよう", display: "🛣️", answer: "car", answerLabel: "くるま", choices: ["flower", "car", "lion"] },
    { prompt: "のりものを みつけよう", display: "🛤️", answer: "train", answerLabel: "でんしゃ", choices: ["train", "elephant", "apple"] },
    { prompt: "そらを とぶものは どれ？", display: "☁️", answer: "plane", answerLabel: "ひこうき", choices: ["umbrella", "plane", "panda"] },
    { prompt: "どうぶつを みつけよう", display: "🐾", answer: "giraffe", answerLabel: "きりん", choices: ["banana", "giraffe", "sun"] },
    { prompt: "あめの ひに つかうのは？", display: "🌧️", answer: "umbrella", answerLabel: "かさ", choices: ["umbrella", "apple", "monkey"] },
    { prompt: "おはなを みつけよう", display: "🌱", answer: "flower", answerLabel: "はな", choices: ["car", "flower", "rabbit"] },
    { stage: 2, prompt: "もりの どうぶつは どれ？", display: "🌳", answer: "fox", answerLabel: "きつね", choices: ["fox", "ship", "orange"] },
    { stage: 2, prompt: "くだものを みつけよう", display: "🧺", answer: "strawberry", answerLabel: "いちご", choices: ["koala", "strawberry", "bus"] },
    { stage: 2, prompt: "うみの なかまは どれ？", display: "🌊", answer: "turtle", answerLabel: "かめ", choices: ["turtle", "bear", "bicycle"] },
    { stage: 2, prompt: "みんなを はこぶものは？", display: "🚏", answer: "bus", answerLabel: "ばす", choices: ["bus", "grapes", "penguin"] },
    { stage: 3, prompt: "うみの なかまを みつけよう", display: "🐚", answer: "octopus", answerLabel: "たこ", choices: ["octopus", "fox", "helicopter"] },
    { stage: 3, prompt: "そらを とぶ のりものは？", display: "☁️", answer: "helicopter", answerLabel: "へりこぷたー", choices: ["ship", "helicopter", "bicycle"] },
    { stage: 3, prompt: "みずの うえを すすむものは？", display: "⚓", answer: "ship", answerLabel: "ふね", choices: ["ship", "bus", "watermelon"] },
    { stage: 3, prompt: "むらさきの くだものは？", display: "🟣", answer: "grapes", answerLabel: "ぶどう", choices: ["orange", "grapes", "strawberry"] },
    { stage: 4, prompt: "うみで およぐ どうぶつは？", display: "🌊", answer: "dolphin", answerLabel: "いるか", choices: ["dolphin", "koala", "bicycle"] },
    { stage: 4, prompt: "みずの なかを すすむ のりものは？", display: "⚓", answer: "ship", answerLabel: "ふね", choices: ["helicopter", "ship", "bus"] },
    { stage: 4, prompt: "たねが みえる くだものは？", display: "●", answer: "watermelon", answerLabel: "すいか", choices: ["watermelon", "orange", "grapes"] },
    { stage: 4, prompt: "タイヤが 2つの のりものは？", display: "◯ ◯", answer: "bicycle", answerLabel: "じてんしゃ", choices: ["bus", "bicycle", "ship"] },
  ];

  const mikkunCountingProblems = [
    { prompt: "ほしは いくつ？", displayItems: ["⭐"], answer: "1", answerLabel: "1こ", choices: ["1", "2", "3"] },
    { prompt: "りんごは いくつ？", displayItems: ["🍎", "🍎"], answer: "2", answerLabel: "2こ", choices: ["1", "2", "3"] },
    { prompt: "くるまは いくつ？", displayItems: ["🚗", "🚗", "🚗"], answer: "3", answerLabel: "3こ", choices: ["2", "3", "4"] },
    { prompt: "おはなは いくつ？", displayItems: ["🌼", "🌼", "🌼", "🌼"], answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
    { prompt: "いちごは いくつ？", displayItems: ["🍓", "🍓", "🍓", "🍓", "🍓"], answer: "5", answerLabel: "5こ", choices: ["3", "4", "5"] },
    { prompt: "でんしゃは いくつ？", displayItems: ["🚃", "🚃"], answer: "2", answerLabel: "2こ", choices: ["1", "2", "4"] },
    { prompt: "ふうせんは いくつ？", displayItems: ["🎈", "🎈", "🎈", "🎈"], answer: "4", answerLabel: "4こ", choices: ["2", "3", "4"] },
    { prompt: "おさかなは いくつ？", displayItems: ["🐟", "🐟", "🐟"], answer: "3", answerLabel: "3こ", choices: ["1", "3", "5"] },
    { stage: 2, prompt: "みかんは いくつ？", displayItems: ["🍊", "🍊", "🍊", "🍊", "🍊", "🍊"], answer: "6", answerLabel: "6こ", choices: ["5", "6", "7"] },
    { stage: 2, prompt: "かめは いくつ？", displayItems: ["🐢", "🐢", "🐢", "🐢", "🐢", "🐢", "🐢"], answer: "7", answerLabel: "7こ", choices: ["6", "7", "8"] },
    { stage: 3, prompt: "ほしは いくつ？", displayItems: ["⭐", "⭐", "⭐", "⭐", "⭐", "⭐", "⭐", "⭐"], answer: "8", answerLabel: "8こ", choices: ["7", "8", "9"] },
    { stage: 3, prompt: "ぶどうは いくつ？", displayItems: ["🍇", "🍇", "🍇", "🍇", "🍇", "🍇", "🍇", "🍇", "🍇"], answer: "9", answerLabel: "9こ", choices: ["8", "9", "10"] },
    { stage: 3, prompt: "おさかなは いくつ？", displayItems: ["🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟"], answer: "10", answerLabel: "10こ", choices: ["8", "9", "10"] },
    { stage: 3, prompt: "ばすは いくつ？", displayItems: ["🚌", "🚌", "🚌", "🚌", "🚌", "🚌"], answer: "6", answerLabel: "6こ", choices: ["4", "5", "6"] },
    { stage: 4, prompt: "あかい まるは いくつ？", displayItems: ["🔴", "🔵", "🔴", "🟡", "🔴"], answer: "3", answerLabel: "3こ", choices: ["2", "3", "4"] },
    { stage: 4, prompt: "ほしは いくつ？", displayItems: ["⭐", "🌙", "⭐", "⭐", "🌙", "⭐"], answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
    { stage: 4, prompt: "りんごは いくつ？", displayItems: ["🍎", "🍊", "🍎", "🍎", "🍊", "🍎", "🍎"], answer: "5", answerLabel: "5こ", choices: ["4", "5", "6"] },
    { stage: 4, prompt: "あおい まるは いくつ？", displayItems: ["🔵", "🟢", "🔵", "🟡", "🔵", "🔵"], answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
  ];

  const mikkunPatternProblems = [
    { prompt: "つぎに くるのは どれ？", patternCards: ["dog", "cat", "dog", "cat"], answer: "dog", answerLabel: "いぬ", choices: ["dog", "cat", "rabbit"] },
    { prompt: "つぎに くるのは どれ？", patternCards: ["apple", "banana", "apple", "banana"], answer: "apple", answerLabel: "りんご", choices: ["apple", "banana", "flower"] },
    { prompt: "つぎに くるのは どれ？", patternCards: ["car", "train", "car", "train"], answer: "car", answerLabel: "くるま", choices: ["car", "train", "plane"] },
    { prompt: "つぎに くるのは どれ？", patternItems: ["🔴", "🔵", "🔴", "🔵"], answer: "🔴", answerLabel: "あか", choices: ["🔴", "🔵", "🟡"] },
    { prompt: "つぎに くるのは どれ？", patternItems: ["⭐", "🌙", "⭐", "🌙"], answer: "⭐", answerLabel: "ほし", choices: ["⭐", "🌙", "☀️"] },
    { prompt: "つぎに くるのは どれ？", patternItems: ["🍓", "🍓", "🍌", "🍓", "🍓", "🍌"], answer: "🍓", answerLabel: "いちご", choices: ["🍓", "🍌", "🍎"] },
    { prompt: "つぎに くるのは どれ？", patternCards: ["sun", "umbrella", "sun", "umbrella"], answer: "sun", answerLabel: "たいよう", choices: ["sun", "umbrella", "flower"] },
    { prompt: "つぎに くるのは どれ？", patternItems: ["🐟", "🐠", "🐟", "🐠"], answer: "🐟", answerLabel: "あおい さかな", choices: ["🐟", "🐠", "🐙"] },
    { stage: 2, prompt: "つぎに くるのは どれ？", patternCards: ["fox", "bear", "fox", "bear"], answer: "fox", answerLabel: "きつね", choices: ["fox", "bear", "koala"] },
    { stage: 2, prompt: "つぎに くるのは どれ？", patternCards: ["strawberry", "orange", "strawberry", "orange"], answer: "strawberry", answerLabel: "いちご", choices: ["grapes", "orange", "strawberry"] },
    { stage: 2, prompt: "つぎに くるのは どれ？", patternCards: ["bus", "bicycle", "bus", "bicycle"], answer: "bus", answerLabel: "ばす", choices: ["bus", "bicycle", "ship"] },
    { stage: 2, prompt: "つぎに くるのは どれ？", patternItems: ["🟢", "🟡", "🟢", "🟡"], answer: "🟢", answerLabel: "みどり", choices: ["🟢", "🟡", "🔵"] },
    { stage: 3, prompt: "3つの ならび。つぎは どれ？", patternCards: ["dolphin", "whale", "turtle", "dolphin", "whale"], answer: "turtle", answerLabel: "かめ", choices: ["dolphin", "whale", "turtle"] },
    { stage: 3, prompt: "3つの ならび。つぎは どれ？", patternCards: ["orange", "grapes", "watermelon", "orange", "grapes"], answer: "watermelon", answerLabel: "すいか", choices: ["orange", "grapes", "watermelon"] },
    { stage: 3, prompt: "3つの ならび。つぎは どれ？", patternItems: ["⭐", "🌙", "☀️", "⭐", "🌙"], answer: "☀️", answerLabel: "たいよう", choices: ["⭐", "🌙", "☀️"] },
    { stage: 3, prompt: "おなじ ならび。つぎは どれ？", patternCards: ["ship", "ship", "helicopter", "ship", "ship"], answer: "helicopter", answerLabel: "へりこぷたー", choices: ["ship", "helicopter", "bus"] },
    { stage: 4, prompt: "ならびを よくみて。つぎは？", patternCards: ["fox", "bear", "bear", "fox", "bear"], answer: "bear", answerLabel: "くま", choices: ["fox", "bear", "koala"] },
    { stage: 4, prompt: "ならびを よくみて。つぎは？", patternCards: ["bus", "bicycle", "ship", "bus", "bicycle"], answer: "ship", answerLabel: "ふね", choices: ["bus", "bicycle", "ship"] },
    { stage: 4, prompt: "ならびを よくみて。つぎは？", patternItems: ["🔴", "🔵", "🔵", "🔴", "🔵"], answer: "🔵", answerLabel: "あお", choices: ["🔴", "🔵", "🟡"] },
    { stage: 4, prompt: "ならびを よくみて。つぎは？", patternCards: ["strawberry", "strawberry", "orange", "grapes", "strawberry", "strawberry", "orange"], answer: "grapes", answerLabel: "ぶどう", choices: ["orange", "grapes", "watermelon"] },
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
    lastFirstByMode: {
      write: "",
      read: "",
      math: "",
      flash: "",
      memory: "",
      digits: "",
    },
    recentProblems: {},
    counts: { ...DEFAULT_COUNTS },
    checkpointEvery: 5,
    levelViewMode: "write",
    placementMode: "write",
    placementDraftLevel: 1,
    placementOpen: false,
    checkpointOpen: false,
    exitConfirmOpen: false,
    toast: "",
    toastTimer: 0,
    answerAdvanceTimer: 0,
    questionPenaltyApplied: false,
    session: null,
    kanjiMarks: 0,
    kanjiStrokes: 0,
    kanjiChecking: false,
    kanjiImage: "",
    kanjiFeedback: null,
    kanjiDemoOpen: false,
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
    flashReplayUsed: false,
    flashTimer: 0,
    flashRunToken: 0,
    memoryPhase: "ready",
    memoryVisible: null,
    memoryChoice: "",
    memorySelected: [],
    memoryResult: "idle",
    memoryChecked: false,
    memoryChoices: [],
    memoryTimer: 0,
    memoryRunToken: 0,
    digitsPhase: "ready",
    digitsVisible: "",
    digitsAnswer: "",
    digitsResult: "idle",
    digitsTimer: 0,
    digitsRunToken: 0,
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
  app.addEventListener("pointerdown", unlockTapAudio, { passive: true });
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
      if (saved.recentProblems && typeof saved.recentProblems === "object") {
        Object.entries(saved.recentProblems).forEach(([key, signatures]) => {
          if (!Array.isArray(signatures)) return;
          state.recentProblems[key] = signatures
            .filter((signature) => typeof signature === "string" && signature)
            .slice(-20);
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
      lastStudiedAt: Math.max(
        0,
        Math.floor(Number(profile?.lastStudiedAt) || 0),
      ),
      updatedAt: Math.max(
        legacyUpdatedAt,
        Math.floor(Number(profile?.lastStudiedAt) || 0),
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
          version: 4,
          level: state.level,
          xp: state.xp,
          streak: state.streak,
          learnerName: state.learnerName,
          learnerNames: state.learnerNames,
          profiles: state.profiles,
          lastFirstByMode: state.lastFirstByMode,
          recentProblems: state.recentProblems,
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
        merged.lastStudiedAt = Math.max(
          local.lastStudiedAt || 0,
          remote.lastStudiedAt || 0,
        );
        if ((local.lastStudiedAt || 0) > (remote.lastStudiedAt || 0)) {
          needsUpload = true;
        }
        merged.updatedAt = Math.max(
          local.updatedAt,
          remote.updatedAt,
          merged.lastStudiedAt,
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

  function practiceLevel(level) {
    return clamp(Number(level) - DIFFICULTY_OFFSET, 1, 100);
  }

  function bandForLevel(level) {
    const adjustedLevel = practiceLevel(level);
    const index = levelGroups.findIndex(
      (group) =>
        adjustedLevel >= group.start && adjustedLevel <= group.end,
    );
    return index >= 0 ? index + 1 : levelGroups.length;
  }

  function displayName() {
    return state.learnerName || "ゲスト";
  }

  function isMikkunLearner(name = state.learnerName) {
    return String(name || "").trim() === MIKKUN_NAME;
  }

  function mikkunStage(level) {
    const safeLevel = clamp(level, 1, 100);
    return (
      MIKKUN_STAGES.find(
        (stage) => safeLevel >= stage.min && safeLevel <= stage.max,
      ) || MIKKUN_STAGES[MIKKUN_STAGES.length - 1]
    );
  }

  function mikkunStageProgress(level, xp = 0) {
    const stage = mikkunStage(level);
    const stageSpan = Math.max(1, stage.max - stage.min + 1);
    const completedLevels = clamp(level, stage.min, stage.max) - stage.min;
    return clamp(
      Math.round(((completedLevels * 100 + clamp(xp, 0, 100)) / (stageSpan * 100)) * 100),
      0,
      100,
    );
  }

  function unlockTapAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      if (!tapAudioContext) tapAudioContext = new AudioContextClass();
      if (tapAudioContext.state !== "running") {
        tapAudioContext.resume()?.catch?.(() => {});
      }
    } catch {
      // 音声を開始できない端末では、画面操作を優先します。
    }
  }

  function playTapSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      unlockTapAudio();
      if (!tapAudioContext) return;
      const emitTone = () => {
        const now = tapAudioContext.currentTime + 0.005;
        [
          { frequency: 1480, type: "sine", gain: 0.042, duration: 0.075 },
          { frequency: 2220, type: "triangle", gain: 0.012, duration: 0.045 },
        ].forEach((tone) => {
          const oscillator = tapAudioContext.createOscillator();
          const gain = tapAudioContext.createGain();
          oscillator.type = tone.type;
          oscillator.frequency.setValueAtTime(tone.frequency, now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(tone.gain, now + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);
          oscillator.connect(gain);
          gain.connect(tapAudioContext.destination);
          oscillator.start(now);
          oscillator.stop(now + tone.duration + 0.015);
        });
      };
      if (tapAudioContext.state === "running") {
        emitTone();
        return;
      }
      const resumed = tapAudioContext.resume();
      if (resumed?.then) {
        resumed.then(emitTone).catch(() => {});
      } else {
        emitTone();
      }
    } catch {
      // 音が使えないブラウザでも、操作そのものは止めません。
    }
  }

  function playCorrectSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      unlockTapAudio();
      if (!tapAudioContext) return;
      const emitChime = () => {
        const now = tapAudioContext.currentTime + 0.015;
        [
          { frequency: 1318.51, type: "sine", start: 0, duration: 0.32, gain: 0.07 },
          { frequency: 2637.02, type: "triangle", start: 0, duration: 0.2, gain: 0.014 },
          { frequency: 1046.5, type: "sine", start: 0.16, duration: 0.62, gain: 0.075 },
          { frequency: 2093, type: "triangle", start: 0.16, duration: 0.4, gain: 0.013 },
          { frequency: 523.25, type: "sine", start: 0.16, duration: 0.5, gain: 0.018 },
        ].forEach((tone) => {
          const oscillator = tapAudioContext.createOscillator();
          const gain = tapAudioContext.createGain();
          const beginsAt = now + tone.start;
          oscillator.type = tone.type;
          oscillator.frequency.setValueAtTime(tone.frequency, beginsAt);
          gain.gain.setValueAtTime(0.0001, beginsAt);
          gain.gain.exponentialRampToValueAtTime(
            tone.gain,
            beginsAt + 0.018,
          );
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            beginsAt + tone.duration,
          );
          oscillator.connect(gain);
          gain.connect(tapAudioContext.destination);
          oscillator.start(beginsAt);
          oscillator.stop(beginsAt + tone.duration + 0.02);
        });
      };
      if (tapAudioContext.state === "running") {
        emitChime();
      } else {
        tapAudioContext.resume()?.then(emitChime).catch(() => {});
      }
    } catch {
      // 正解音を使えない端末でも学習は続けられます。
    }
  }

  function lastStudiedText(timestamp) {
    const value = Number(timestamp) || 0;
    if (!value) return "まだ学習していません";
    const date = new Date(value);
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    const sameDay =
      sameYear &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const time = date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (sameDay) return `今日 ${time}`;
    const day = date.toLocaleDateString("ja-JP", {
      ...(sameYear ? {} : { year: "numeric" }),
      month: "numeric",
      day: "numeric",
    });
    return `${day} ${time}`;
  }

  function currentNumber() {
    return state.session ? state.session.completed + 1 : 1;
  }

  function currentLessonLabel(mode = state.session?.mode) {
    if (state.session?.preschool) return MIKKUN_MODE_LABELS[mode] || "みっくんメニュー";
    return MODE_INFO[mode]?.label || "学習";
  }

  function render() {
    const views = {
      home: homeTemplate,
      write: writeTemplate,
      read: readTemplate,
      math: mathTemplate,
      flash: flashTemplate,
      memory: memoryTemplate,
      digits: digitsTemplate,
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
    if (state.view === "write") {
      if (state.kanjiDemoOpen) {
        setupKanjiStrokeDemo();
      } else {
        setupWritingCanvas();
      }
    }
  }

  function homeTemplate() {
    const mikkun = isMikkunLearner();
    const homeModes = mikkun ? ["write", "read", "math", "memory"] : SKILL_MODES;
    const homeProfile = ensureProfile(state.learnerName);
    const homeLevel = mikkun
      ? Math.round(
          homeModes.reduce(
            (sum, mode) => sum + homeProfile.skills[mode].level,
            0,
          ) / homeModes.length,
        )
      : state.level;
    const homeXp = mikkun
      ? Math.round(
          homeModes.reduce(
            (sum, mode) => sum + homeProfile.skills[mode].xp,
            0,
          ) / homeModes.length,
        )
      : state.xp;
    const currentMikkunStage = mikkunStage(homeLevel);
    const currentMikkunProgress = mikkunStageProgress(homeLevel, homeXp);
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

        <section class="today-section home-training-primary ${mikkun ? "mikkun-training" : ""}">
          <div class="section-heading">
            <div>
              <p class="eyebrow">${mikkun ? currentMikkunStage.label : `おかえり、${escapeHtml(displayName())}`}</p>
              <h1>${mikkun ? "みっくんメニュー" : "きょうのトレーニング"}</h1>
            </div>
            <button class="daily-count settings-link" type="button" data-view="profile">${mikkun ? "5もんずつ" : "問題数を変更"}</button>
          </div>
          ${mikkun ? `
            <div class="mikkun-intro">
              <span>🚀</span>
              <p>
                <b>4つの ぼうけんで ほしを あつめよう！</b>
                <small>つぎは「${currentMikkunStage.next}」</small>
                <span class="mikkun-stage-meter"><i style="width:${currentMikkunProgress}%"></i></span>
              </p>
            </div>
              ` : ""}
          <div class="subject-grid">
            ${mikkun
              ? `
                ${mikkunSubjectCard("write", "🔎", "おたから さがし", "おなじ絵を みつける", "kanji-card", "kanji-icon", "treasure")}
                ${mikkunSubjectCard("read", "🧺", "なかま さがし", "なかまを みわける", "reading-subject-card", "reading-icon", "groups")}
                ${mikkunSubjectCard("math", "⭐", "かずの たからばこ", currentMikkunStage.rank >= 3 ? "1から10まで かぞえる" : "1から5まで かぞえる", "math-card", "math-icon color-card-icon", "counting")}
                ${mikkunSubjectCard("memory", "🚀", "つぎは どっち？", "ならびの つづきを えらぶ", "memory-subject-card", "memory-icon", "patterns")}
              `
              : `
                ${subjectCard("digits", "123", "数字記憶", "流れる数字を記憶", "digits-subject-card", "digits-icon")}
                ${subjectCard("memory", "絵", "フラッシュカード", "絵カードを記憶", "memory-subject-card", "memory-icon")}
                ${subjectCard("flash", "瞬", "フラッシュ暗算", "数字を記憶", "flash-subject-card", "flash-icon")}
                ${subjectCard("math", "12", "暗算する", "数字パッド", "math-card", "math-icon")}
                ${subjectCard("read", "読", "漢字を読む", "4択クイズ", "reading-subject-card", "reading-icon")}
                ${subjectCard("write", "漢", "漢字を書く", "手書き＋形チェック", "kanji-card", "kanji-icon")}
              `}
          </div>
        </section>

        <button type="button" class="registration-prompt home-learner-prompt" data-view="profile">
          <span class="registration-icon">人</span>
          <span><b>学習する人：${escapeHtml(displayName())}</b><small>タップして名前・問題数を変更できます</small></span>
          <i>›</i>
        </button>

        <section class="level-card" aria-label="${mikkun ? "みっくんのがんばり" : "6分野の総合"}レベル${homeLevel}">
          <div class="level-copy">
            <span class="level-kicker">${mikkun ? "みっくんの がんばりレベル" : "6分野の総合レベル"}</span>
            <div class="level-number"><small>Lv.</small>${homeLevel}</div>
            <span class="grade-chip">${mikkun ? currentMikkunStage.label : gradeForLevel(homeLevel)}</span>
            <button type="button" class="text-link" data-action="open-placement" data-mode="write">
              分野別の開始レベルを調整 <span aria-hidden="true">›</span>
            </button>
          </div>
          <div class="progress-orbit" style="--progress: ${homeXp * 3.6}deg">
            <div><b>${homeXp}%</b><span>${mikkun ? "4コース" : "6分野"}の平均XP</span></div>
          </div>
          <span class="level-card-shape shape-one"></span>
          <span class="level-card-shape shape-two"></span>
        </section>

        <section class="road-section">
          <div class="section-heading compact">
            <div><p class="eyebrow">${mikkun ? "MIKKUN ADVENTURE" : "SIX SKILLS"}</p><h2>${mikkun ? "4つの ぼうけんレベル" : "6つのレベル"}</h2></div>
            <button type="button" class="text-link" data-view="levels">すべて見る <span>›</span></button>
          </div>
          <div class="skill-overview-grid">
            ${homeModes.map((mode) => {
              const skill = activeSkill(mode);
              return `
                <button type="button" data-view="levels" data-level-mode="${mode}">
                  <span>${mikkun ? MIKKUN_MODE_LABELS[mode] : MODE_INFO[mode].short}</span>
                  <b>Lv.${skill.level}</b>
                  <small>${mikkun ? mikkunStage(skill.level).label : gradeForLevel(skill.level)} ・ ${skill.xp}%</small>
                </button>
              `;
            }).join("")}
          </div>
          <p class="road-note"><span>◆</span> ${mikkun ? "文字がまだ読めなくても、絵を見ながら遊べます" : "表示レベルより少しやさしい復習問題から出ます"}</p>
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

  function mikkunSubjectCard(
    mode,
    icon,
    name,
    detail,
    cardClass,
    iconClass,
    preschoolType,
  ) {
    const stage = mikkunStage(activeSkill(mode).level);
    return `
      <button type="button" class="subject-card mikkun-subject-card ${cardClass}" data-start="${mode}" data-preschool="true" data-preschool-type="${preschoolType}">
        <span class="subject-icon ${iconClass}">${icon}</span>
        <span class="subject-time">ゆっくり</span>
        <span class="subject-level-chip">${stage.label}</span>
        <span class="subject-name">${name}</span>
        <span class="subject-detail">${PRESCHOOL_QUESTION_COUNT}もん ・ ${detail}</span>
        <span class="start-arrow" aria-hidden="true">→</span>
      </button>
    `;
  }

  function learningCardById(id) {
    return memoryCards.find((card) => card.id === id) || null;
  }

  function learningCardArt(id, className = "") {
    const card = learningCardById(id);
    if (!card) return `<span class="learning-card-fallback ${className}">${escapeHtml(id)}</span>`;
    return `
      <span
        class="learning-card-art ${card.sheet === "extra" ? "learning-card-art-extra" : ""} ${className}"
        data-card-id="${card.id}"
        role="img"
        aria-label="${card.label}"
        style="--card-x:${card.artX}%;--card-y:${card.artY}%"
      ></span>
    `;
  }

  function startSession(mode, preschool = false, preschoolType = "") {
    stopFlash();
    stopMemory();
    stopDigits();
    stopAutoAdvance();
    const skill = activeSkill(mode);
    const usePreschoolMenu = Boolean(preschool && isMikkunLearner());
    const total = usePreschoolMenu ? PRESCHOOL_QUESTION_COUNT : state.counts[mode];
    const safePreschoolType = usePreschoolMenu ? preschoolType : "";
    const problems = createSessionProblems(
      mode,
      total,
      skill.level,
      usePreschoolMenu,
      safePreschoolType,
    );
    state.session = {
      mode,
      total,
      preschool: usePreschoolMenu,
      preschoolType: safePreschoolType,
      levelAtStart: skill.level,
      skillAtStart: {
        level: skill.level,
        xp: skill.xp,
        updatedAt: skill.updatedAt,
      },
      lastStudiedAtAtStart:
        ensureProfile(state.learnerName).lastStudiedAt || 0,
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
    if (mode === "memory" && !usePreschoolMenu) prepareMemoryQuestion();
    if (mode === "digits") prepareDigitsQuestion();
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
    if (state.session?.preschool) {
      const completed = state.session.completed;
      const stage = mikkunStage(state.session.levelAtStart);
      return `
        <div class="lesson-level-row mikkun-lesson-level">
          <span>みっくんの ぼうけん</span><span>${stage.label}</span>${extra}
        </div>
        <div class="mikkun-quest-progress" aria-label="ほし ${completed}こ、ぜんぶで${state.session.total}こ">
          <span class="mikkun-quest-mascot">🚀</span>
          <div class="mikkun-quest-stars">
            ${Array.from({ length: state.session.total }, (_, index) => `
              <i class="${index < completed ? "complete" : index === completed ? "current" : ""}">★</i>
            `).join("")}
          </div>
          <b>${completed}/${state.session.total}</b>
        </div>
      `;
    }
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
    const preschool = state.session?.preschool;
    if (preschool) return mikkunAdventureTemplate();
    if (state.kanjiDemoOpen) return kanjiStrokeReviewTemplate(problem);
    return `
      <div class="screen lesson-screen kanji-lesson">
        ${lessonHeader(preschool ? "あいうえお" : "漢字を書く")}
        ${lessonLevelRow()}
        <section class="prompt-area">
          <p class="eyebrow">${preschool ? "ひらがなを ゆびで なぞろう" : "お題"}</p>
          <h1>「${problem.reading}」を<br />${preschool ? "かいてみよう" : "漢字で書こう"}</h1>
          <p class="word-example">${preschool ? "ことば" : "ことば"}：<b>${problem.word}</b>${problem.strokes ? ` ・ ${problem.strokes}かく` : " ・ お手本をよく見よう"}</p>
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
              <p><b>アプリの形チェック</b><br />大きさ・位置・画数・形のバランスを目安にしています。</p>
            </div>
            ${kanjiFeedbackTemplate()}
            <div class="self-check-actions">
              <button type="button" data-action="kanji-retry">書き直す</button>
              <button type="button" class="kanji-difficult" data-action="kanji-difficult">もう少し練習</button>
              <button type="button" data-action="kanji-success">この字でOK</button>
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

  function kanjiStrokeReviewTemplate(problem) {
    return `
      <div class="screen lesson-screen kanji-lesson kanji-stroke-review">
        ${lessonHeader("漢字を書く")}
        ${lessonLevelRow('<span class="timer stroke-order-pill">● 書き順</span>')}
        <section class="prompt-area">
          <p class="eyebrow">お手本の動きを見よう</p>
          <h1>「${problem.kanji}」を<br />一画ずつ確認</h1>
          <p class="word-example">書いた文字を消して、正しい順番で再生します。</p>
        </section>
        <section class="kanji-stroke-stage" id="kanjiStrokeStage" aria-live="polite">
          <div class="kanji-stroke-loading" id="kanjiStrokeLoading">
            <span aria-hidden="true">${problem.kanji}</span>
            <p id="kanjiStrokeLoadingText">書き順を準備しています…</p>
          </div>
          <svg
            id="kanjiStrokeSvg"
            viewBox="0 0 109 109"
            role="img"
            aria-label="${problem.kanji}の書き順アニメーション"
            hidden
          ></svg>
          <div class="kanji-stroke-status" id="kanjiStrokeStatus">準備中</div>
        </section>
        <div class="kanji-stroke-actions">
          <button type="button" class="secondary-button" id="kanjiStrokeReplay" data-action="replay-kanji-strokes" disabled>
            ↺ もう一度見る
          </button>
          <button type="button" class="primary-button" data-action="finish-kanji-demo">
            次の問題へ
          </button>
        </div>
        <p class="kanji-stroke-source">
          書き順データ：
          <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener noreferrer">KanjiVG</a>
          （CC BY-SA 3.0）
        </p>
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
    canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (state.kanjiChecking) return;
        event.preventDefault();
        drawing = true;
        state.kanjiStrokes += 1;
        previous = pointFor(event);
        canvas.setPointerCapture(event.pointerId);
      },
      { passive: false },
    );
    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (!drawing || !previous) return;
        event.preventDefault();
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
      },
      { passive: false },
    );
    const stop = (event) => {
      event?.preventDefault();
      drawing = false;
      previous = null;
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    const preventCanvasScroll = (event) => event.preventDefault();
    canvas.addEventListener("touchstart", preventCanvasScroll, { passive: false });
    canvas.addEventListener("touchmove", preventCanvasScroll, { passive: false });
  }

  async function setupKanjiStrokeDemo() {
    const problem = currentSessionProblem();
    const stage = document.querySelector("#kanjiStrokeStage");
    if (!problem?.kanji || !stage || !state.kanjiDemoOpen) return;
    stopKanjiStrokeAnimation();
    const requestToken = kanjiStrokeRunToken;
    try {
      const paths = await loadKanjiStrokePaths(problem.kanji, requestToken);
      if (
        requestToken !== kanjiStrokeRunToken ||
        !state.kanjiDemoOpen ||
        state.view !== "write"
      ) {
        return;
      }
      buildKanjiStrokeAnimation(paths);
    } catch {
      if (
        requestToken !== kanjiStrokeRunToken ||
        !state.kanjiDemoOpen ||
        state.view !== "write"
      ) {
        return;
      }
      const loadingText = document.querySelector("#kanjiStrokeLoadingText");
      const status = document.querySelector("#kanjiStrokeStatus");
      stage.classList.add("has-error");
      if (loadingText) {
        loadingText.textContent =
          "書き順を読み込めませんでした。通信を確認してください。";
      }
      if (status) status.textContent = "「次の問題へ」はそのまま押せます";
    }
  }

  async function loadKanjiStrokePaths(character, requestToken) {
    const glyph = Array.from(String(character || ""))[0];
    if (!glyph) throw new Error("kanji is empty");
    if (kanjiStrokeCache.has(glyph)) return kanjiStrokeCache.get(glyph);
    const filename = `${glyph.codePointAt(0).toString(16).padStart(5, "0")}.svg`;
    let lastError = null;
    for (const source of KANJIVG_SOURCES) {
      if (requestToken !== kanjiStrokeRunToken) {
        throw new Error("stroke loading cancelled");
      }
      const controller = new AbortController();
      kanjiStrokeFetchController = controller;
      const timeout = window.setTimeout(() => controller.abort(), 6500);
      try {
        const response = await fetch(`${source}${filename}`, {
          cache: "force-cache",
          mode: "cors",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`KanjiVG ${response.status}`);
        const paths = parseKanjiStrokePaths(await response.text());
        if (!paths.length) throw new Error("stroke paths are empty");
        kanjiStrokeCache.set(glyph, paths);
        return paths;
      } catch (error) {
        lastError = error;
      } finally {
        window.clearTimeout(timeout);
        if (kanjiStrokeFetchController === controller) {
          kanjiStrokeFetchController = null;
        }
      }
    }
    throw lastError || new Error("stroke data is unavailable");
  }

  function parseKanjiStrokePaths(svgText) {
    const xml = new DOMParser().parseFromString(svgText, "image/svg+xml");
    if (xml.querySelector("parsererror")) return [];
    return [...xml.getElementsByTagName("path")]
      .map((path) => {
        const id = path.getAttribute("id") || "";
        const order = Number(id.match(/-s(\d+)$/)?.[1] || 0);
        const d = path.getAttribute("d") || "";
        return { order, d };
      })
      .filter(
        (stroke) =>
          stroke.order > 0 &&
          stroke.d.length > 3 &&
          /^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/.test(stroke.d),
      )
      .sort((left, right) => left.order - right.order);
  }

  function buildKanjiStrokeAnimation(strokes) {
    const svg = document.querySelector("#kanjiStrokeSvg");
    const loading = document.querySelector("#kanjiStrokeLoading");
    const replay = document.querySelector("#kanjiStrokeReplay");
    const stage = document.querySelector("#kanjiStrokeStage");
    if (!svg || !stage || !strokes.length) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const guideGroup = document.createElementNS(SVG_NAMESPACE, "g");
    guideGroup.setAttribute("class", "kanji-stroke-guides");
    const drawingGroup = document.createElementNS(SVG_NAMESPACE, "g");
    drawingGroup.setAttribute("class", "kanji-stroke-drawing");
    const markerGroup = document.createElementNS(SVG_NAMESPACE, "g");
    markerGroup.setAttribute("class", "kanji-stroke-markers");
    const drawingPaths = strokes.map((stroke) => {
      const guide = document.createElementNS(SVG_NAMESPACE, "path");
      guide.setAttribute("d", stroke.d);
      guideGroup.appendChild(guide);
      const drawing = document.createElementNS(SVG_NAMESPACE, "path");
      drawing.setAttribute("d", stroke.d);
      drawing.dataset.strokeOrder = String(stroke.order);
      drawingGroup.appendChild(drawing);
      return drawing;
    });
    svg.append(guideGroup, drawingGroup, markerGroup);
    // `hidden` is not reflected reliably by the `.hidden` property on SVGElement.
    // Remove the attribute itself so the `svg[hidden]` rule no longer collapses
    // the drawing area on Safari or Chromium.
    svg.removeAttribute("hidden");
    svg.style.display = "block";
    if (loading) loading.hidden = true;
    stage.classList.remove("has-error", "is-complete");
    if (replay) replay.disabled = false;
    startKanjiStrokeAnimation(drawingPaths, markerGroup);
  }

  async function startKanjiStrokeAnimation(drawingPaths, markerGroup) {
    cancelKanjiStrokeAnimations();
    const token = ++kanjiStrokeRunToken;
    const status = document.querySelector("#kanjiStrokeStatus");
    const stage = document.querySelector("#kanjiStrokeStage");
    stage?.classList.remove("is-complete");
    while (markerGroup.firstChild) markerGroup.removeChild(markerGroup.firstChild);
    drawingPaths.forEach((path) => {
      const length = Math.max(1, path.getTotalLength());
      path.dataset.pathLength = String(length);
      path.style.transition = "none";
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = String(length);
      path.style.opacity = "1";
      path.classList.remove("active", "complete");
    });
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    for (let index = 0; index < drawingPaths.length; index += 1) {
      if (token !== kanjiStrokeRunToken || !state.kanjiDemoOpen) return;
      const path = drawingPaths[index];
      const length = Number(path.dataset.pathLength);
      const marker = createKanjiStrokeMarker(path, index + 1);
      markerGroup.appendChild(marker);
      marker.classList.add("active");
      path.classList.add("active");
      if (status) {
        status.textContent = `第 ${index + 1} 画 ／ ${drawingPaths.length}画`;
      }
      const duration = reducedMotion
        ? 20
        : Math.round(Math.max(330, Math.min(760, length * 9)));
      await animateKanjiStroke(path, length, duration);
      if (token !== kanjiStrokeRunToken || !state.kanjiDemoOpen) return;
      path.style.strokeDashoffset = "0";
      path.classList.remove("active");
      path.classList.add("complete");
      marker.classList.remove("active");
      if (!reducedMotion) await waitForKanjiStroke(130);
    }
    if (token !== kanjiStrokeRunToken || !state.kanjiDemoOpen) return;
    if (status) status.textContent = "書き順を確認できました";
    stage?.classList.add("is-complete");
  }

  function animateKanjiStroke(path, length, duration) {
    if (typeof path.animate !== "function") {
      path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;
      path.style.strokeDashoffset = "0";
      return waitForKanjiStroke(duration);
    }
    const animation = path.animate(
      [
        { strokeDashoffset: String(length) },
        { strokeDashoffset: "0" },
      ],
      {
        duration,
        easing: "ease-in-out",
        fill: "forwards",
      },
    );
    kanjiStrokeAnimations.push(animation);
    return new Promise((resolve) => {
      animation.onfinish = resolve;
      animation.oncancel = resolve;
    });
  }

  function createKanjiStrokeMarker(path, order) {
    const point = path.getPointAtLength(0);
    const marker = document.createElementNS(SVG_NAMESPACE, "g");
    marker.setAttribute("class", "kanji-stroke-marker");
    marker.setAttribute("transform", `translate(${point.x} ${point.y})`);
    const circle = document.createElementNS(SVG_NAMESPACE, "circle");
    circle.setAttribute("r", order >= 10 ? "6.5" : "5.8");
    const number = document.createElementNS(SVG_NAMESPACE, "text");
    number.setAttribute("text-anchor", "middle");
    number.setAttribute("dominant-baseline", "central");
    number.textContent = String(order);
    marker.append(circle, number);
    return marker;
  }

  function waitForKanjiStroke(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function replayKanjiStrokeAnimation() {
    const drawingPaths = [
      ...document.querySelectorAll("#kanjiStrokeSvg .kanji-stroke-drawing path"),
    ];
    const markerGroup = document.querySelector(
      "#kanjiStrokeSvg .kanji-stroke-markers",
    );
    if (!drawingPaths.length || !markerGroup) {
      setupKanjiStrokeDemo();
      return;
    }
    startKanjiStrokeAnimation(drawingPaths, markerGroup);
  }

  function cancelKanjiStrokeAnimations() {
    kanjiStrokeAnimations.forEach((animation) => {
      try {
        animation.cancel();
      } catch {
        // 終了済みのアニメーションはそのまま破棄する。
      }
    });
    kanjiStrokeAnimations = [];
  }

  function stopKanjiStrokeAnimation() {
    kanjiStrokeRunToken += 1;
    cancelKanjiStrokeAnimations();
    kanjiStrokeFetchController?.abort();
    kanjiStrokeFetchController = null;
  }

  function kanjiFeedbackTemplate() {
    const feedback = state.kanjiFeedback;
    if (!feedback) return "";
    return `
      <div class="kanji-auto-feedback">
        <div class="kanji-feedback-score">
          <span>かたちの めやす</span>
          <b>${feedback.score}<small> / ${feedback.total}</small></b>
        </div>
        <div class="kanji-feedback-checks">
          ${feedback.checks.map((check) => `
            <span class="${check.ok ? "ok" : "retry"}">
              <i>${check.ok ? "✓" : "△"}</i>
              <b>${check.label}</b>
              <small>${check.detail}</small>
            </span>
          `).join("")}
        </div>
        <p>${feedback.message}</p>
      </div>
    `;
  }

  function analyzeKanjiWriting(canvas, problem) {
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = context.getImageData(0, 0, width, height);
    const handBounds = inkBounds(imageData.data, width, height);
    if (!handBounds) {
      return {
        score: 0,
        total: 3,
        checks: [
          { label: "大きさ", ok: false, detail: "もう少し大きく" },
          { label: "まんなか", ok: false, detail: "中央を意識" },
          { label: "形", ok: false, detail: "お手本を見よう" },
        ],
        message: "お手本を見ながら、もう一度ゆっくり書いてみよう。",
      };
    }

    const referenceCanvas = document.createElement("canvas");
    referenceCanvas.width = width;
    referenceCanvas.height = height;
    const referenceContext = referenceCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    referenceContext.fillStyle = "#000";
    referenceContext.font =
      '700 470px "Yu Mincho", "Hiragino Mincho ProN", serif';
    referenceContext.textAlign = "center";
    referenceContext.textBaseline = "middle";
    referenceContext.fillText(problem.kanji, width / 2, height / 2 + 18);
    const referenceData = referenceContext.getImageData(0, 0, width, height);
    const referenceBounds =
      inkBounds(referenceData.data, width, height) || handBounds;

    const handWidth = handBounds.maxX - handBounds.minX + 1;
    const handHeight = handBounds.maxY - handBounds.minY + 1;
    const referenceWidth = referenceBounds.maxX - referenceBounds.minX + 1;
    const referenceHeight = referenceBounds.maxY - referenceBounds.minY + 1;
    const widthRatio = handWidth / Math.max(1, referenceWidth);
    const heightRatio = handHeight / Math.max(1, referenceHeight);
    const sizeOk =
      widthRatio >= 0.52 &&
      widthRatio <= 1.38 &&
      heightRatio >= 0.46 &&
      heightRatio <= 1.55;

    const centerX = (handBounds.minX + handBounds.maxX) / 2;
    const centerY = (handBounds.minY + handBounds.maxY) / 2;
    const centerOk =
      Math.abs(centerX - width / 2) <= width * 0.15 &&
      Math.abs(centerY - height / 2) <= height * 0.15;

    const handDistribution = inkDistribution(
      imageData.data,
      width,
      height,
      handBounds,
    );
    const referenceDistribution = inkDistribution(
      referenceData.data,
      width,
      height,
      referenceBounds,
    );
    const shapeSimilarity = handDistribution.reduce(
      (sum, value, index) =>
        sum + Math.min(value, referenceDistribution[index]),
      0,
    );
    const shapeOk = shapeSimilarity >= 0.43;

    const checks = [
      {
        label: "大きさ",
        ok: sizeOk,
        detail: sizeOk ? "ちょうどいい" : widthRatio < 0.52 ? "もう少し大きく" : "少し小さめに",
      },
      {
        label: "まんなか",
        ok: centerOk,
        detail: centerOk ? "中央に書けた" : "中央へ寄せよう",
      },
      {
        label: "形",
        ok: shapeOk,
        detail: shapeOk ? "バランス良好" : "お手本と比べよう",
      },
    ];

    if (Number.isFinite(problem.strokes)) {
      const strokeDifference = Math.abs(state.kanjiStrokes - problem.strokes);
      const strokeOk = strokeDifference <= Math.max(1, Math.round(problem.strokes * 0.3));
      checks.push({
        label: "画数",
        ok: strokeOk,
        detail: `${state.kanjiStrokes}画 / お手本${problem.strokes}画`,
      });
    }

    const score = checks.filter((check) => check.ok).length;
    return {
      score,
      total: checks.length,
      checks,
      message:
        score === checks.length
          ? "いいバランスです！ 最後はお手本と見比べて決めよう。"
          : score >= checks.length - 1
            ? "あと少し！ △のところを意識すると、もっと整います。"
            : "△のところを意識して、書き直してみるのもおすすめです。",
    };
  }

  function inkBounds(data, width, height) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] < 24) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    return maxX >= 0 ? { minX, minY, maxX, maxY } : null;
  }

  function inkDistribution(data, width, height, bounds) {
    const bins = Array(9).fill(0);
    const boundWidth = Math.max(1, bounds.maxX - bounds.minX + 1);
    const boundHeight = Math.max(1, bounds.maxY - bounds.minY + 1);
    let total = 0;
    for (let y = bounds.minY; y <= bounds.maxY; y += 2) {
      for (let x = bounds.minX; x <= bounds.maxX; x += 2) {
        if (data[(y * width + x) * 4 + 3] < 24) continue;
        const column = Math.min(2, Math.floor(((x - bounds.minX) / boundWidth) * 3));
        const row = Math.min(2, Math.floor(((y - bounds.minY) / boundHeight) * 3));
        bins[row * 3 + column] += 1;
        total += 1;
      }
    }
    return bins.map((value) => value / Math.max(1, total));
  }

  function readTemplate() {
    const problem = currentSessionProblem();
    const preschool = state.session?.preschool;
    if (preschool) return mikkunAdventureTemplate();
    const choices = state.readingChoices.length ? state.readingChoices : problem.choices;
    const feedback = state.readingChecked
      ? state.readingChoice === problem.answer
        ? `<div class="reading-feedback correct"><b>${preschool ? "はなまる！" : "正解！"}</b> よく読めました。</div>`
        : `<div class="reading-feedback wrong"><b>おしい！</b> 正解は「${problem.answer}」です。</div>`
      : "";
    return `
      <div class="screen lesson-screen reading-lesson">
        ${lessonHeader(preschool ? "どうぶつの なまえ" : "漢字を読む")}
        ${lessonLevelRow()}
        <section class="reading-prompt">
          <p class="eyebrow">${preschool ? "この どうぶつは なあに？" : "この漢字、なんて読む？"}</p>
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

  function mikkunAdventureDisplay(problem) {
    if (problem.displayCard) {
      return learningCardArt(problem.displayCard, "mikkun-target-card");
    }
    if (problem.patternCards) {
      return `
        <div class="mikkun-pattern-row">
          ${problem.patternCards.map((id) => learningCardArt(id, "mikkun-pattern-card")).join("")}
          <span class="mikkun-pattern-question">？</span>
        </div>
      `;
    }
    if (problem.patternItems) {
      return `
        <div class="mikkun-pattern-row mikkun-emoji-pattern">
          ${problem.patternItems.map((item) => `<span>${item}</span>`).join("")}
          <span class="mikkun-pattern-question">？</span>
        </div>
      `;
    }
    if (problem.displayItems) {
      return `
        <div class="mikkun-counting-scene">
          ${problem.displayItems.map((item) => `<span>${item}</span>`).join("")}
        </div>
      `;
    }
    return `<span class="mikkun-theme-symbol">${problem.display || "★"}</span>`;
  }

  function mikkunAdventureChoice(choice) {
    const card = learningCardById(choice);
    if (card) {
      return `${learningCardArt(choice, "mikkun-choice-card")}<small>${card.label}</small>`;
    }
    return `<span>${escapeHtml(choice)}</span>`;
  }

  function mikkunAdventureTemplate() {
    const problem = currentSessionProblem();
    const choices = state.readingChoices.length ? state.readingChoices : problem.choices;
    const correct = state.readingChecked && state.readingChoice === problem.answer;
    const hasPictureChoices = choices.some((choice) => learningCardById(choice));
    const theme = MIKKUN_MODE_LABELS[state.session.mode] || "みっくんの ぼうけん";
    const feedback = state.readingChecked
      ? correct
        ? '<div class="reading-feedback correct mikkun-win"><b>ほし ゲット！</b> やったね！</div>'
        : `<div class="reading-feedback wrong"><b>おしい！</b> こたえは「${problem.answerLabel || problem.answer}」です。</div>`
      : "";
    return `
      <div class="screen lesson-screen mikkun-choice-lesson mikkun-adventure-lesson">
        ${lessonHeader(theme)}
        ${lessonLevelRow()}
        <section class="reading-prompt mikkun-choice-prompt">
          <p class="eyebrow">${problem.prompt || "どれかな？"}</p>
          <div class="reading-card mikkun-choice-display">
            ${mikkunAdventureDisplay(problem)}
          </div>
        </section>
        <div class="reading-options mikkun-options ${hasPictureChoices ? "mikkun-picture-options" : "mikkun-number-options"}">
          ${choices.map((choice) => {
            const selected = state.readingChoice === choice;
            const rightChoice = state.readingChecked && choice === problem.answer;
            const wrongChoice =
              state.readingChecked && selected && choice !== problem.answer;
            return `
              <button type="button" data-reading="${choice}" class="${selected ? "selected" : ""} ${rightChoice ? "correct" : ""} ${wrongChoice ? "wrong" : ""}" ${state.readingChecked ? "disabled" : ""}>
                ${mikkunAdventureChoice(choice)}<i>${rightChoice ? "✓" : wrongChoice ? "×" : ""}</i>
              </button>
            `;
          }).join("")}
        </div>
        <div class="reading-feedback-slot">${feedback}</div>
        ${state.readingChecked
          ? correct
            ? '<p class="auto-next-note mikkun-auto-next" aria-live="polite">★を 1こ ゲット！ つぎへ しゅっぱつ…</p>'
            : '<button type="button" class="primary-button wide" data-action="next-reading">つぎのもんだいへ →</button>'
          : '<p class="choice-note">こたえを ひとつ タップしてね</p>'
        }
      </div>
    `;
  }

  function mathTemplate() {
    if (state.session?.preschool) return mikkunAdventureTemplate();
    const problem = currentSessionProblem();
    const preschool = state.session?.preschool;
    const answered = state.mathResult !== "idle";
    const message =
      state.mathResult === "wrong"
        ? `<p class="result-message">おしい！ 正解は ${problem.answer}。つぎへ進みます。</p>`
        : state.mathResult === "correct"
          ? '<p class="result-message success">正解！ いいテンポ！</p>'
          : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
    return `
      <div class="screen lesson-screen math-lesson">
        ${lessonHeader(preschool ? "かずあそび" : "暗算する")}
        ${lessonLevelRow(`<span class="timer">${preschool ? "★ ゆっくり" : "◷ テンポよく"}</span>`)}
        <section class="math-question">
          <p class="eyebrow">こたえはいくつ？</p>
          <h1 class="${problem.question.length > 12 ? "compact" : ""}">${problem.question}</h1>
          <div class="answer-box ${state.mathResult}">${state.mathAnswer || "<span>?</span>"}</div>
          ${message}
        </section>
        <div class="hint-box"><span>ヒント</span><p>${problem.hint}</p></div>
        ${numberPad("math")}
        <div class="math-answer-dock">
          ${answered
            ? `<p class="auto-next-note ${state.mathResult === "wrong" ? "wrong" : ""}" aria-live="polite">${state.mathResult === "correct" ? "正解！" : "今回は不正解です。"} 次の問題へ進みます…</p>`
            : `<button type="button" class="primary-button wide" data-action="submit-math" ${state.mathAnswer ? "" : "disabled"}>こたえる</button>`
          }
        </div>
      </div>
    `;
  }

  function flashCountdownDuration() {
    return state.session?.preschool ? 2800 : 2400;
  }

  function flashTemplate() {
    const preschool = state.session?.preschool;
    const total = state.flashSequence.reduce((sum, number) => sum + number, 0);
    let stage = "";
    if (state.flashPhase === "ready") {
      stage = `
        <div class="flash-ready">
          <span class="flash-symbol">${preschool ? "★" : "瞬"}</span>
          <h1>${preschool ? "ゆっくり見て、" : "数字を見て、"}<br />ぜんぶ足そう</h1>
          <p>${state.flashSequence.length}つの数字が順番に出ます。</p>
          <button type="button" class="primary-button wide" data-action="start-flash">カウントを始める</button>
        </div>
      `;
    } else if (state.flashPhase === "countdown") {
      stage = `
        <div class="flash-countdown" aria-live="polite">
          <p>もうすぐ はじまります</p>
          <div class="flash-countdown-bar" style="--countdown-duration:${flashCountdownDuration()}ms">
            <i></i>
          </div>
          <small>バーがなくなったら数字が出ます</small>
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
          ? `<p class="result-message">おしい！ ${state.flashReplayUsed ? "もう一度こたえるか、降参できます。" : "1回だけ、もう一度見られます。"}</p>`
          : state.flashResult === "correct"
            ? `<p class="result-message success">正解！ 合計は ${total} です。</p>`
            : state.flashResult === "given-up"
              ? `<p class="result-message">答えは ${total} でした。次の問題へ進みます。</p>`
            : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
      stage = `
        <div class="flash-answer-stage">
          <p class="eyebrow">ぜんぶでいくつ？</p>
          <h1>合計を答えよう</h1>
          <div class="answer-box ${state.flashResult}">${state.flashAnswer || "<span>?</span>"}</div>
          ${message}
        </div>
        ${numberPad("flash")}
        ${["correct", "given-up"].includes(state.flashResult)
          ? `<p class="auto-next-note ${state.flashResult === "given-up" ? "wrong" : ""}" aria-live="polite">${state.flashResult === "correct" ? "正解！" : "答えを確認しました。"} 次の問題へ進みます…</p>`
          : `<button type="button" class="primary-button wide" data-action="submit-flash" ${state.flashAnswer ? "" : "disabled"}>こたえる</button>`
        }
        ${["correct", "given-up"].includes(state.flashResult)
          ? ""
          : state.flashReplayUsed
            ? '<button type="button" class="replay-button give-up-button" data-action="give-up-flash">降参する</button>'
            : '<button type="button" class="replay-button" data-action="replay-flash">もう一度見る（1回だけ）</button>'
        }
      `;
    }
    return `
      <div class="screen lesson-screen flash-lesson">
        ${lessonHeader(preschool ? "ピカッとあんざん" : "フラッシュ暗算")}
        ${lessonLevelRow(`<span class="timer">${preschool ? "★ ゆっくり" : "● 集中モード"}</span>`)}
        <section class="flash-stage">${stage}</section>
      </div>
    `;
  }

  function memoryTemplate() {
    if (state.session?.preschool) return mikkunAdventureTemplate();
    const problem = currentSessionProblem();
    let stage = "";
    if (state.memoryPhase === "ready") {
      stage = `
        <div class="memory-ready">
          <span class="memory-symbol">絵</span>
          <h1>出てくるカードを<br />おぼえよう</h1>
          <p>${problem.sequence.length}枚の絵カードが順番に出ます。</p>
          <button type="button" class="primary-button wide" data-action="start-memory">カードを始める</button>
        </div>
      `;
    } else if (state.memoryPhase === "countdown") {
      stage = `
        <div class="flash-countdown" aria-live="polite">
          <p>もうすぐ はじまります</p>
          <div class="flash-countdown-bar memory-countdown-bar" style="--countdown-duration:2200ms">
            <i></i>
          </div>
          <small>バーがなくなったらカードが出ます</small>
        </div>
      `;
    } else if (state.memoryPhase === "showing") {
      stage = `
        <div class="memory-showing" aria-live="assertive">
          <p>よく見て おぼえてね</p>
          <div class="memory-flash-card">
            ${state.memoryVisible
              ? learningCardArt(state.memoryVisible.id, "memory-main-card-art")
              : '<strong class="memory-card-placeholder">★</strong>'
            }
            <span>${state.memoryVisible?.label || ""}</span>
          </div>
        </div>
      `;
    } else {
      const correct = state.memoryChecked && state.memoryResult === "correct";
      const answerSequence = problem.sequence
        .map((card) => `${card.symbol} ${card.label}`)
        .join(" → ");
      const feedback = state.memoryChecked
        ? correct
          ? '<div class="reading-feedback correct"><b>正解！</b> 順番まで覚えられました。</div>'
          : `<div class="reading-feedback wrong"><b>おしい！</b> 正しい順番は「${answerSequence}」です。</div>`
        : "";
      stage = `
        <div class="memory-answer-stage">
          <p class="eyebrow">どの順番だった？</p>
          <h1>出てきた順にタップしよう</h1>
          <div class="memory-order-strip" aria-label="選んだ順番">
            ${problem.sequence.map((_, index) => {
              const selectedId = state.memorySelected[index];
              const card = memoryCards.find((item) => item.id === selectedId);
              return `
                 <span class="${card ? "filled" : ""}">
                   <small>${index + 1}</small>${card ? learningCardArt(card.id, "memory-order-card-art") : "？"}
                 </span>
              `;
            }).join("")}
          </div>
          <div class="memory-choice-grid">
            ${state.memoryChoices.map((card) => {
              const selected = state.memorySelected.includes(card.id);
              return `
                <button type="button" data-memory-order="${card.id}" class="${selected ? "selected" : ""}" ${state.memoryChecked || selected ? "disabled" : ""}>
                  ${learningCardArt(card.id, "memory-choice-card-art")}<span>${card.label}</span>
                </button>
              `;
            }).join("")}
          </div>
          ${!state.memoryChecked && state.memorySelected.length
            ? '<button type="button" class="memory-undo-button" data-action="undo-memory">ひとつ戻す</button>'
            : ""
          }
          <div class="reading-feedback-slot">${feedback}</div>
          ${state.memoryChecked
            ? `<p class="auto-next-note ${correct ? "" : "wrong"}" aria-live="polite">${correct ? "正解！" : "今回は不正解です。"} 次の問題へ進みます…</p>`
            : `<p class="choice-note">${state.memorySelected.length} / ${problem.sequence.length}枚選択</p>`
          }
        </div>
      `;
    }
    return `
      <div class="screen lesson-screen memory-lesson">
        ${lessonHeader("フラッシュカード")}
        ${lessonLevelRow('<span class="timer">● 記憶モード</span>')}
        <section class="memory-stage">${stage}</section>
      </div>
    `;
  }

  function digitsTemplate() {
    const problem = currentSessionProblem();
    let stage = "";
    if (state.digitsPhase === "ready") {
      stage = `
        <div class="memory-ready digits-ready">
          <span class="memory-symbol digits-symbol">123</span>
          <h1>流れる数字を<br />順番におぼえよう</h1>
          <p>${problem.digits.length}けたの数字が右から左へ流れます。</p>
          <button type="button" class="primary-button wide" data-action="start-digits">数字を始める</button>
        </div>
      `;
    } else if (state.digitsPhase === "countdown") {
      stage = `
        <div class="flash-countdown" aria-live="polite">
          <p>もうすぐ はじまります</p>
          <div class="flash-countdown-bar digits-countdown-bar" style="--countdown-duration:2200ms">
            <i></i>
          </div>
          <small>バーがなくなったら数字が流れます</small>
        </div>
      `;
    } else if (state.digitsPhase === "showing") {
      stage = `
        <div class="digits-showing" aria-live="assertive" style="--digits-duration:${problem.duration}ms">
          <p>順番も おぼえてね</p>
          <div class="digits-lane">
            <strong>${problem.digits.split("").join("　")}</strong>
          </div>
        </div>
      `;
    } else {
      const message =
        state.digitsResult === "wrong"
          ? `<p class="result-message">おしい！ 正解は ${problem.digits} です。</p>`
          : state.digitsResult === "correct"
            ? '<p class="result-message success">正解！ 順番まで覚えられました。</p>'
            : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
      stage = `
        <div class="digits-answer-stage">
          <p class="eyebrow">どんな数字だった？</p>
          <h1>同じ順番で入力しよう</h1>
          <div class="answer-box ${state.digitsResult}">${state.digitsAnswer || "<span>?</span>"}</div>
          ${message}
          ${numberPad("digits")}
          <div class="digits-submit-dock">
            ${state.digitsResult === "idle"
              ? `<button type="button" class="primary-button wide" data-action="submit-digits" ${state.digitsAnswer ? "" : "disabled"}>こたえる</button>`
              : `<p class="auto-next-note ${state.digitsResult === "wrong" ? "wrong" : ""}" aria-live="polite">${state.digitsResult === "correct" ? "正解！" : "今回は不正解です。"} 次の問題へ進みます…</p>`
            }
          </div>
        </div>
      `;
    }
    return `
      <div class="screen lesson-screen digits-lesson">
        ${lessonHeader("数字記憶")}
        ${lessonLevelRow('<span class="timer">● 記憶モード</span>')}
        <section class="memory-stage digits-stage ${state.digitsPhase === "answer" ? "is-answering" : ""}">${stage}</section>
      </div>
    `;
  }

  function numberPad(target) {
    const locked =
      (target === "math" && state.mathResult !== "idle") ||
      (target === "flash" && ["correct", "given-up"].includes(state.flashResult)) ||
      (target === "digits" && state.digitsResult !== "idle");
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
    if (state.session?.preschool) {
      let sequence = [];
      let signature = "";
      let attempts = 0;
      do {
        sequence = [randomInt(1, 3), randomInt(1, 3)];
        signature = sequence.join("+");
        attempts += 1;
      } while (
        state.session.completed === 0 &&
        signature === state.lastFirstByMode.flash &&
        attempts < 20
      );
      state.flashSequence = sequence;
      if (state.session.completed === 0) state.lastFirstByMode.flash = signature;
      state.flashPhase = "ready";
      state.flashCue = "3";
      state.flashAnswer = "";
      state.flashResult = "idle";
      state.flashReplayUsed = false;
      return;
    }
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
    state.flashReplayUsed = false;
  }

  function startFlashSequence() {
    stopFlash();
    const token = ++state.flashRunToken;
    state.flashPhase = "countdown";
    render();
    state.flashTimer = window.setTimeout(() => {
      if (token !== state.flashRunToken || state.view !== "flash") return;
      state.flashPhase = "showing";
      render();
      runFlashNumbers(token);
    }, flashCountdownDuration());
  }

  function runFlashNumbers(token) {
    let index = 0;
    const numberDelay = state.session?.preschool ? 1100 : 700;
    const separatorDelay = state.session?.preschool ? 360 : 240;
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
            state.flashTimer = window.setTimeout(step, separatorDelay);
          } else {
            step();
          }
        }, numberDelay);
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

  function prepareMemoryQuestion() {
    const problem = currentSessionProblem();
    state.memoryPhase = "ready";
    state.memoryVisible = null;
    state.memoryChoice = "";
    state.memorySelected = [];
    state.memoryResult = "idle";
    state.memoryChecked = false;
    state.memoryChoices = shuffled(problem.choices || []);
  }

  function startMemorySequence() {
    stopMemory();
    const token = ++state.memoryRunToken;
    state.memoryPhase = "countdown";
    render();
    state.memoryTimer = window.setTimeout(() => {
      if (token !== state.memoryRunToken || state.view !== "memory") return;
      state.memoryPhase = "showing";
      state.memoryVisible = null;
      render();
      runMemoryCards(token);
    }, 2200);
  }

  function runMemoryCards(token) {
    const problem = currentSessionProblem();
    let index = 0;
    const step = () => {
      if (token !== state.memoryRunToken || state.view !== "memory") return;
      if (index < problem.sequence.length) {
        state.memoryVisible = problem.sequence[index];
        index += 1;
        render();
        state.memoryTimer = window.setTimeout(step, problem.delay);
        return;
      }
      state.memoryVisible = null;
      state.memoryPhase = "answer";
      render();
    };
    step();
  }

  function stopMemory() {
    window.clearTimeout(state.memoryTimer);
    state.memoryTimer = 0;
    state.memoryRunToken += 1;
  }

  function prepareDigitsQuestion() {
    state.digitsPhase = "ready";
    state.digitsVisible = "";
    state.digitsAnswer = "";
    state.digitsResult = "idle";
  }

  function startDigitsSequence() {
    stopDigits();
    const token = ++state.digitsRunToken;
    state.digitsPhase = "countdown";
    render();
    state.digitsTimer = window.setTimeout(() => {
      if (token !== state.digitsRunToken || state.view !== "digits") return;
      const problem = currentSessionProblem();
      state.digitsPhase = "showing";
      state.digitsVisible = problem.digits;
      render();
      state.digitsTimer = window.setTimeout(() => {
        if (token !== state.digitsRunToken || state.view !== "digits") return;
        state.digitsVisible = "";
        state.digitsPhase = "answer";
        render();
      }, problem.duration);
    }, 2200);
  }

  function stopDigits() {
    window.clearTimeout(state.digitsTimer);
    state.digitsTimer = 0;
    state.digitsRunToken += 1;
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
    if (problem.displayCard) return `${problem.displayCard}:${problem.answer}`;
    if (problem.patternCards) {
      return `${problem.patternCards.join("-")}:${problem.answer}`;
    }
    if (problem.patternItems) {
      return `${problem.patternItems.join("-")}:${problem.answer}`;
    }
    if (problem.displayItems) {
      return `${problem.prompt}:${problem.displayItems.join("-")}:${problem.answer}`;
    }
    if (problem.display && problem.answer) {
      return `${problem.prompt}:${problem.display}:${problem.answer}`;
    }
    if (mode === "write") return problem.kanji;
    if (mode === "read") return `${problem.kanji}:${problem.answer}`;
    if (mode === "memory") {
      return problem.sequence
        ? problem.sequence.map((card) => card.id).join("-")
        : `${problem.display}:${problem.answer}`;
    }
    if (mode === "digits") return problem.digits;
    if (problem.choices) return `${problem.display}:${problem.answer}`;
    return `${problem.question}:${problem.answer}`;
  }

  function createSessionProblems(
    mode,
    total,
    level,
    preschool = false,
    preschoolType = "",
  ) {
    if (mode === "flash") return [];
    if (preschool) {
      const bank =
        preschoolType === "treasure"
          ? mikkunTreasureProblems
          : preschoolType === "groups"
            ? mikkunGroupProblems
            : preschoolType === "counting"
              ? mikkunCountingProblems
              : mikkunPatternProblems;
      const stageRank = mikkunStage(level).rank;
      const unlockedBank = bank.filter(
        (problem) => Number(problem.stage || 1) <= stageRank,
      );
      const result = [];
      while (result.length < total) {
        const cycle = shuffled(unlockedBank);
        result.push(...cycle.slice(0, total - result.length));
      }
      if (
        result.length > 1 &&
        problemSignature(mode, result[0]) === state.lastFirstByMode[mode]
      ) {
        [result[0], result[1]] = [result[1], result[0]];
      }
      state.lastFirstByMode[mode] = problemSignature(mode, result[0]);
      return result;
    }
    if (mode === "memory" || mode === "digits") {
      const generator =
        mode === "memory" ? generateMemoryProblem : generateDigitsProblem;
      const result = [];
      const used = new Set();
      while (result.length < total) {
        let problem = generator(level);
        let signature = problemSignature(mode, problem);
        let attempts = 0;
        while (
          (used.has(signature) ||
            (result.length === 0 && signature === state.lastFirstByMode[mode])) &&
          attempts < 40
        ) {
          problem = generator(level);
          signature = problemSignature(mode, problem);
          attempts += 1;
        }
        used.add(signature);
        result.push(problem);
      }
      state.lastFirstByMode[mode] = problemSignature(mode, result[0]);
      return result;
    }
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
    /*
     * question-data.js のアップロード漏れや一時的な読込失敗があっても、
     * 旧6問だけを繰り返さない。まず同じ難易度帯を使い、不足分だけ
     * 隣接する難易度帯から近い順に補って30問の候補を確保する。
     */
    for (let distance = 1; pool.length < 30 && distance < levelGroups.length; distance += 1) {
      [band - distance, band + distance].forEach((nearbyBand) => {
        if (nearbyBand < 1 || nearbyBand > levelGroups.length || pool.length >= 30) return;
        const nearbyProblems = bank.filter((problem) => problem.band === nearbyBand);
        pool.push(...nearbyProblems.slice(0, 30 - pool.length));
      });
    }
    const recentKey = `${state.learnerName}:${mode}:${band}`;
    const recent = Array.isArray(state.recentProblems[recentKey])
      ? state.recentProblems[recentKey]
      : [];
    const recentSet = new Set(recent);
    const freshPool = pool.filter(
      (problem) => !recentSet.has(problemSignature(mode, problem)),
    );
    const olderPool = pool.filter((problem) =>
      recentSet.has(problemSignature(mode, problem)),
    );
    const result = [];
    let cycle = [...shuffled(freshPool), ...shuffled(olderPool)];
    while (result.length < total) {
      if (!cycle.length) cycle = shuffled(pool);
      if (
        result.length &&
        problemSignature(mode, result[result.length - 1]) ===
          problemSignature(mode, cycle[0])
      ) {
        cycle.push(cycle.shift());
      }
      result.push(...cycle.slice(0, total - result.length));
      cycle = [];
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
    const updatedRecent = [...recent];
    result.forEach((problem) => {
      const signature = problemSignature(mode, problem);
      const previousIndex = updatedRecent.indexOf(signature);
      if (previousIndex >= 0) updatedRecent.splice(previousIndex, 1);
      updatedRecent.push(signature);
    });
    state.recentProblems[recentKey] = updatedRecent.slice(-20);
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
    if (session?.mode === "memory") return generateMemoryProblem(level);
    if (session?.mode === "digits") return generateDigitsProblem(level);
    return generateMathProblem(level);
  }

  function generateMemoryProblem(level) {
    const band = bandForLevel(level);
    const lengths = [2, 2, 3, 3, 4, 4, 5, 5, 6, 7];
    const delays = [1250, 1150, 1050, 950, 880, 820, 760, 700, 640, 580];
    const sequence = shuffled(memoryCards).slice(0, lengths[band - 1]);
    const decoyCount = sequence.length <= 3 ? 3 : 2;
    const decoys = shuffled(
      memoryCards.filter((card) => !sequence.some((shown) => shown.id === card.id)),
    ).slice(0, decoyCount);
    return {
      sequence,
      choices: shuffled([...sequence, ...decoys]),
      delay: delays[band - 1],
    };
  }

  function generateDigitsProblem(level) {
    const band = bandForLevel(level);
    const lengths = [3, 4, 4, 5, 6, 7, 8, 9, 10, 12];
    const durations = [5200, 5000, 4700, 4500, 4300, 4100, 3900, 3700, 3500, 3300];
    const length = lengths[band - 1];
    let digits = String(randomInt(1, 9));
    while (digits.length < length) digits += String(randomInt(0, 9));
    return { digits, duration: durations[band - 1] };
  }

  function generateMathProblem(level) {
    const adjustedLevel = practiceLevel(level);
    const band = bandForLevel(level);
    const choice = randomInt(0, 3);

    if (band === 1) {
      const max =
        adjustedLevel <= 3 ? 5 : adjustedLevel <= 6 ? 10 : 20;
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
      if (adjustedLevel >= 16 && choice === 3) {
        const left = randomInt(2, 9);
        const right = randomInt(2, 9);
        return {
          question: `${left} × ${right}`,
          answer: String(left * right),
          hint: `${left}のだんを思い出そう`,
        };
      }
      const max = adjustedLevel < 16 ? 50 : 100;
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
    const problem = state.session ? currentSessionProblem() : null;
    const usesChoiceButtons =
      state.session?.mode === "read" || Boolean(state.session?.preschool);
    if (!usesChoiceButtons || !problem?.choices) {
      state.readingChoices = [];
      return;
    }
    const possibleIndexes = problem.choices
      .map((_, index) => index)
      .filter((index) => index !== state.lastReadingAnswerIndex);
    const answerIndex = possibleIndexes[randomInt(0, possibleIndexes.length - 1)];
    const wrongChoices = shuffled(problem.choices.filter((choice) => choice !== problem.answer));
    wrongChoices.splice(answerIndex, 0, problem.answer);
    state.readingChoices = wrongChoices;
    state.lastReadingAnswerIndex = answerIndex;
  }

  function finishQuestion(correct, options = {}) {
    const session = state.session;
    session.completed += 1;
    session.attempts += 1;
    if (correct) {
      session.correct += 1;
      if (options.playFeedback !== false) playCorrectSound();
      earnXp(MODE_INFO[session.mode].xp);
    } else {
      applyWrongAnswerPenalty(session.mode);
    }
    if (session.completed >= session.total) {
      finishSession(false);
      return;
    }
    resetQuestionState();
    if (session.mode === "flash") prepareFlashQuestion();
    if (session.mode === "memory" && !session.preschool) prepareMemoryQuestion();
    if (session.mode === "digits") prepareDigitsQuestion();
    if (session.completed % state.checkpointEvery === 0) {
      state.checkpointOpen = true;
    }
    render();
  }

  function finishSession(endedEarly) {
    stopFlash();
    stopMemory();
    stopDigits();
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

  function currentAnswerCanAdvance(mode) {
    if (!state.session || state.session.mode !== mode) return false;
    if (
      mode === "read" ||
      state.session.preschool
    ) {
      return (
        state.readingChecked &&
        Boolean(state.readingChoice)
      );
    }
    if (mode === "math") return ["correct", "wrong"].includes(state.mathResult);
    if (mode === "flash") {
      return ["correct", "given-up"].includes(state.flashResult);
    }
    if (mode === "memory") return state.memoryChecked;
    if (mode === "digits") {
      return ["correct", "wrong"].includes(state.digitsResult);
    }
    return false;
  }

  function scheduleAnswerAdvance(mode) {
    stopAutoAdvance();
    const session = state.session;
    if (!session || !currentAnswerCanAdvance(mode)) return;
    const delay =
      (mode === "math" && state.mathResult === "wrong") ||
      (mode === "digits" && state.digitsResult === "wrong") ||
      (mode === "memory" &&
        state.memoryChecked &&
        state.memoryResult === "wrong")
        ? 1400
        : mode === "flash" && state.flashResult === "given-up"
          ? 1500
          : 700;
    state.answerAdvanceTimer = window.setTimeout(() => {
      state.answerAdvanceTimer = 0;
      if (
        state.session !== session ||
        state.exitConfirmOpen ||
        !currentAnswerCanAdvance(mode)
      ) {
        return;
      }
      state.session.completed += 1;
      advanceAfterCompletedQuestion();
    }, delay);
  }

  function resumeAnswerAdvance() {
    const mode = state.session?.mode;
    if (
      ["read", "math", "flash", "memory", "digits"].includes(mode) &&
      currentAnswerCanAdvance(mode)
    ) {
      scheduleAnswerAdvance(mode);
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
    stopMemory();
    stopDigits();
    stopAutoAdvance();
    const profile = ensureProfile(state.learnerName);
    const restoredAt = Date.now();
    profile.skills[session.mode] = {
      level: session.skillAtStart?.level ?? session.levelAtStart,
      xp: session.skillAtStart?.xp ?? 0,
      updatedAt: restoredAt,
    };
    profile.lastStudiedAt = session.lastStudiedAtAtStart || 0;
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
          <p>${currentLessonLabel(session.mode)}はあと${remaining}問です。<br />もう少し続けますか？</p>
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
            今回の「${mode ? currentLessonLabel(mode) : "学習"}」で増えたXPやレベルは、
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
    const preschoolComplete = session.preschool && !session.endedEarly;
    return `
      <div class="screen result-screen ${session.preschool ? "mikkun-result-screen" : ""}">
        <header class="result-topbar"><span class="brand-mark">の</span><b>学習結果</b></header>
        <section class="result-hero">
          <span class="result-burst">${session.endedEarly ? "休" : preschoolComplete ? "🚀" : "★"}</span>
          <p class="eyebrow">${session.endedEarly ? "GOOD PAUSE" : preschoolComplete ? "ADVENTURE COMPLETE" : "SESSION COMPLETE"}</p>
          <h1>${session.endedEarly ? "ここまで、よくできました。" : preschoolComplete ? `ほしを ${session.correct}こ ゲット！` : "さいごまで、できました！"}</h1>
          <p>
            ${escapeHtml(displayName())}の「${currentLessonLabel(session.mode)}」
            ・ ${session.preschool ? mikkunStage(activeSkill(session.mode).level).label : `Lv.${activeSkill(session.mode).level}`}
          </p>
        </section>
        <div class="result-score-card">
          <div class="result-main-score"><b>${session.completed}</b><span>問できた</span></div>
          <div><b>${session.correct}</b><span>${session.preschool ? "ゲットした ほし" : "できた問題"}</span></div>
          <div><b>${ratio}%</b><span>達成率</span></div>
        </div>
        <div class="result-message-card">
          <span>☺</span>
          <p><b>${session.preschool ? "ぼうけん だいせいこう！" : session.completed >= state.checkpointEvery ? "小さな積み重ねが、力になります。" : "まず始められたことが大切です。"}</b><br />${session.preschool ? "つぎは どの ぼうけんに いく？" : "次も自分のペースで進めよう。"}</p>
        </div>
        <button type="button" class="primary-button wide" data-action="restart-session">もう一度する</button>
        <button type="button" class="secondary-button wide result-home-button" data-action="back-home">ホームへ戻る</button>
      </div>
    `;
  }

  function levelsTemplate() {
    const mikkun = isMikkunLearner();
    const levelModes = mikkun
      ? ["write", "read", "math", "memory"]
      : SKILL_MODES;
    const mode = levelModes.includes(state.levelViewMode)
      ? state.levelViewMode
      : levelModes[0];
    const skill = activeSkill(mode);
    return `
      <div class="screen sub-screen level-map-screen">
        <header class="sub-header">
          <button class="round-button" type="button" data-action="back-home" aria-label="戻る">‹</button>
          <div>
            <p class="eyebrow">${mikkun ? "MIKKUN ADVENTURE / 4 STEPS" : "6 SKILLS / LEVEL 1–100"}</p>
            <h1>${mikkun ? "ぼうけんステップ" : "分野別レベル"}</h1>
          </div>
        </header>
        <div class="skill-mode-tabs ${mikkun ? "mikkun-level-tabs" : ""}" aria-label="表示する分野">
          ${levelModes.map((itemMode) => `
            <button
              type="button"
              class="${itemMode === mode ? "active" : ""}"
              data-level-mode="${itemMode}"
            >${mikkun ? MIKKUN_MODE_LABELS[itemMode] : MODE_INFO[itemMode].short}</button>
          `).join("")}
        </div>
        <div class="map-intro">
          <span>${mikkun ? MIKKUN_MODE_LABELS[mode] : MODE_INFO[mode].label}の現在地</span>
          <b>Lv.${skill.level}</b>
          <p>${mikkun ? mikkunStage(skill.level).label : gradeForLevel(skill.level)} ・ XP ${skill.xp}%</p>
        </div>
        ${mikkun ? "" : learnerLevelListTemplate()}
        ${mikkun ? mikkunStageMapTemplate(skill) : `
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
        `}
        <div class="fine-level-note">
          <span>${mikkun ? "★" : "100"}</span>
          <p>
            <b>${mikkun ? "できることが、ひとつずつふえていく！" : "得意な人にも、次の一歩を。"}</b><br />
            ${mikkun
              ? "年少さんから年中さんへ、4つのぼうけんでステップアップできます。"
              : "高いレベルほどテーマを細かく分け、達成のチャンスがたくさんあります。"}
          </p>
        </div>
      </div>
    `;
  }

  function mikkunStageMapTemplate(skill) {
    const colors = ["#f4a64d", "#f07c64", "#55bca5", "#756bd7"];
    return `
      <div class="level-groups mikkun-stage-groups">
        ${MIKKUN_STAGES.map((stage, index) => {
          const complete = skill.level > stage.max;
          const active = skill.level >= stage.min && skill.level <= stage.max;
          const levelProgress = Math.max(
            0,
            Math.min(
              1,
              (skill.level - stage.min + skill.xp / 100) /
                (stage.max - stage.min + 1),
            ),
          );
          const percent = complete ? 100 : active ? Math.round(levelProgress * 100) : 0;
          return `
            <article class="level-group mikkun-stage-group ${active ? "active" : ""}">
              <span class="group-orb" style="background:${colors[index]}">${complete ? "✓" : index + 1}</span>
              <div>
                <p>STEP ${index + 1} ・ LEVEL ${stage.min}–${stage.max}</p>
                <h2>${stage.label}</h2>
                <div class="group-progress"><i style="width:${percent}%;background:${colors[index]}"></i></div>
              </div>
              <span class="group-status">${complete ? "できた！" : active ? `${percent}%` : "🔒"}</span>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function learnerLevelListTemplate() {
    return `
      <section class="learner-levels-card">
        <div class="settings-heading">
          <div><p class="eyebrow">LEARNERS</p><h2>みんなの6分野レベル</h2></div>
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
                  <small class="learner-last-study">最終学習：${escapeHtml(lastStudiedText(profile.lastStudiedAt))}</small>
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
        <p class="settings-note">名前をタップすると学習する人を切り替えられます。最終学習日時も端末間で共有されます。</p>
      </section>
    `;
  }

  function profileTemplate() {
    const mikkun = isMikkunLearner();
    const profileModes = mikkun
      ? ["write", "read", "math", "memory"]
      : SKILL_MODES;
    const profileLevel = mikkun
      ? Math.round(
          profileModes.reduce((sum, mode) => sum + activeSkill(mode).level, 0) /
            profileModes.length,
        )
      : state.level;
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

        <section class="settings-card sound-check-card">
          <div class="settings-heading">
            <div><p class="eyebrow">SOUND</p><h2>操作音</h2></div>
            <span>ピ</span>
          </div>
          <button type="button" class="secondary-button wide" data-action="test-sound">「ピ」音を確認する</button>
          <p class="settings-note">音が聞こえない場合は、iPhoneの消音モードを解除して音量を上げてください。</p>
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
            <span>${mikkun ? "現在のぼうけんステップ" : "現在の分野別レベル"}</span>
            <b>${mikkun ? mikkunStage(profileLevel).label : `総合 Lv.${state.level}`}</b>
          </div>
          <div class="profile-skill-list">
            ${profileModes.map((mode) => {
              const skill = activeSkill(mode);
              return `
                <button type="button" data-action="open-placement" data-mode="${mode}">
                  <span>${mikkun ? MIKKUN_MODE_LABELS[mode] : MODE_INFO[mode].short}</span>
                  <b>Lv.${skill.level}</b>
                  <small>${mikkun ? mikkunStage(skill.level).label : gradeForLevel(skill.level)} ・ XP ${skill.xp}%</small>
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
    const mikkun = isMikkunLearner();
    const placementModes = mikkun
      ? ["write", "read", "math", "memory"]
      : SKILL_MODES;
    const mode = placementModes.includes(state.placementMode)
      ? state.placementMode
      : placementModes[0];
    const draftLevel = clamp(
      state.placementDraftLevel || activeSkill(mode).level,
      1,
      100,
    );
    const choices = (mikkun ? MIKKUN_STAGES : levelGroups).map((group) => ({
      level: mikkun ? group.min : group.start,
      title: group.label,
      detail: `Lv.${mikkun ? group.min : group.start}〜${mikkun ? group.max : group.end}`,
    }));
    return `
      <div class="sheet-backdrop" data-action="close-placement">
        <section class="placement-sheet" role="dialog" aria-modal="true" aria-labelledby="placement-title">
          <div class="sheet-handle"></div>
          <button type="button" class="sheet-close" data-action="close-placement" aria-label="閉じる">×</button>
          <p class="eyebrow">STARTING POINT</p><h2 id="placement-title">${mikkun ? "ぼうけんごとに調整" : "分野ごとに調整"}</h2>
          <div class="placement-skill-tabs ${mikkun ? "mikkun-level-tabs" : ""}" aria-label="調整する分野">
            ${placementModes.map((itemMode) => `
              <button
                type="button"
                class="${itemMode === mode ? "active" : ""}"
                data-placement-skill="${itemMode}"
              >${mikkun ? MIKKUN_MODE_LABELS[itemMode] : MODE_INFO[itemMode].short}</button>
            `).join("")}
          </div>
          <p class="sheet-lead"><b>${mikkun ? MIKKUN_MODE_LABELS[mode] : MODE_INFO[mode].label}</b>はどこから始める？<br />ほかの${mikkun ? "ぼうけん" : "分野"}のレベルは変わりません。</p>
          <div class="placement-fine-tune">
            <div class="placement-fine-heading">
              <span>1レベルずつ微調整</span>
              <small>現在は Lv.${activeSkill(mode).level}</small>
            </div>
            <div class="placement-stepper">
              <button type="button" data-action="placement-step" data-delta="-1" aria-label="開始レベルを1下げる">−</button>
              <div>
                <small>開始レベル</small>
                <b>Lv.${draftLevel}</b>
                <span>${mikkun ? mikkunStage(draftLevel).label : gradeForLevel(draftLevel)}</span>
              </div>
              <button type="button" data-action="placement-step" data-delta="1" aria-label="開始レベルを1上げる">＋</button>
            </div>
            <input
              id="placementLevelRange"
              type="range"
              min="1"
              max="100"
              step="1"
              value="${draftLevel}"
              aria-label="開始レベルを1から100で選ぶ"
            />
            <button type="button" class="primary-button wide placement-apply-button" data-action="apply-placement-level">
              Lv.${draftLevel} から始める
            </button>
          </div>
          <p class="placement-option-title">${mikkun ? "ぼうけんステップから選ぶ" : "学年の目安から選ぶ"}</p>
          <div class="placement-options">
            ${choices.map((choice) => `
              <button type="button" data-placement="${choice.level}">
                <span>Lv.${choice.level}</span>
                <span><b>${choice.title}</b><small>${choice.detail}</small></span><i>›</i>
              </button>
            `).join("")}
          </div>
          <p class="sheet-note">変更後もこの画面は閉じません。上の${mikkun ? "ぼうけん" : "分野"}タブから、ほかの${mikkun ? "ぼうけん" : "分野"}を続けて調整できます。</p>
          <button type="button" class="secondary-button wide placement-finish-button" data-action="close-placement">レベル調整を終える</button>
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

  function applyPlacementLevel(mode, level) {
    const safeMode = SKILL_MODES.includes(mode) ? mode : "write";
    const profile = ensureProfile(state.learnerName);
    profile.skills[safeMode] = {
      level: clamp(level, 1, 100),
      xp: 0,
      updatedAt: Date.now(),
    };
    profile.updatedAt = Math.max(
      profile.updatedAt,
      profile.skills[safeMode].updatedAt,
    );
    applyActiveProfile();
    state.placementDraftLevel = profile.skills[safeMode].level;
    saveProgress(safeMode);
    showToast(
      `${MODE_INFO[safeMode].short}をレベル ${profile.skills[safeMode].level} に保存しました`,
    );
    render();
  }

  function handleClick(event) {
    const tappedControl = event.target.closest(
      "button, select, input, label, [role='button']",
    );
    const tapAction = tappedControl?.dataset?.action || "";
    const answerCommit =
      tappedControl?.dataset?.reading !== undefined ||
      tappedControl?.dataset?.memoryOrder !== undefined ||
      ["kanji-success", "submit-math", "submit-flash", "submit-digits"].includes(
        tapAction,
      );
    if (tappedControl && !tappedControl.disabled && !answerCommit) playTapSound();

    const startButton = event.target.closest("[data-start]");
    if (startButton) {
      startSession(
        startButton.dataset.start,
        startButton.dataset.preschool === "true",
        startButton.dataset.preschoolType || "",
      );
      return;
    }

    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      stopFlash();
      stopMemory();
      stopDigits();
      stopAutoAdvance();
      stopKanjiStrokeAnimation();
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
      state.placementDraftLevel = activeSkill(state.placementMode).level;
      render();
      return;
    }

    const placement = event.target.closest("[data-placement]");
    if (placement) {
      const mode = SKILL_MODES.includes(state.placementMode)
        ? state.placementMode
        : "write";
      applyPlacementLevel(mode, placement.dataset.placement);
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
      const mode = state.session.mode;
      state.readingChoice = readingButton.dataset.reading;
      state.readingChecked = true;
      state.session.attempts += 1;
      const correct = state.readingChoice === problem.answer;
      if (correct) {
        state.session.correct += 1;
        playCorrectSound();
        earnXp(MODE_INFO[mode].xp);
      } else {
        playTapSound();
        applyWrongAnswerPenalty(mode);
      }
      render();
      if (correct) scheduleAnswerAdvance(mode);
      return;
    }

    const memoryButton = event.target.closest("[data-memory-order]");
    if (
      memoryButton &&
      !state.memoryChecked &&
      !state.memorySelected.includes(memoryButton.dataset.memoryOrder)
    ) {
      const problem = currentSessionProblem();
      state.memorySelected.push(memoryButton.dataset.memoryOrder);
      if (state.memorySelected.length >= problem.sequence.length) {
        state.memoryChecked = true;
        state.session.attempts += 1;
        const correct = problem.sequence.every(
          (card, index) => state.memorySelected[index] === card.id,
        );
        state.memoryResult = correct ? "correct" : "wrong";
        if (correct) {
          state.session.correct += 1;
          playCorrectSound();
          earnXp(MODE_INFO.memory.xp);
        } else {
          playTapSound();
          applyWrongAnswerPenalty("memory");
        }
      } else {
        playTapSound();
      }
      render();
      if (state.memoryChecked) scheduleAnswerAdvance("memory");
      return;
    }

    const numberButton = event.target.closest("[data-number]");
    if (numberButton) {
      const target = numberButton.dataset.numberTarget;
      if (target === "flash") {
        if (["correct", "given-up"].includes(state.flashResult)) return;
        if (state.flashAnswer.length < 4) state.flashAnswer += numberButton.dataset.number;
        state.flashResult = "idle";
      } else if (target === "digits") {
        if (state.digitsResult !== "idle") return;
        const maxLength = currentSessionProblem().digits.length;
        if (state.digitsAnswer.length < maxLength) {
          state.digitsAnswer += numberButton.dataset.number;
        }
      } else {
        if (state.mathResult !== "idle") return;
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
      !event.target.closest(".sheet-close") &&
      !event.target.closest(".placement-finish-button")
    ) {
      return;
    }

    const actions = {
      "back-home"() {
        stopFlash();
        stopMemory();
        stopDigits();
        stopAutoAdvance();
        stopKanjiStrokeAnimation();
        state.view = "home";
        state.session = null;
        state.checkpointOpen = false;
        state.exitConfirmOpen = false;
        resetQuestionState();
        render();
      },
      "ask-exit"() {
        stopFlash();
        stopMemory();
        stopDigits();
        stopAutoAdvance();
        stopKanjiStrokeAnimation();
        if (
          state.session?.mode === "flash" &&
          ["countdown", "showing"].includes(state.flashPhase)
        ) {
          state.flashPhase = "ready";
          state.flashAnswer = "";
          state.flashResult = "idle";
        }
        if (
          state.session?.mode === "memory" &&
          ["countdown", "showing"].includes(state.memoryPhase)
        ) {
          state.memoryPhase = "ready";
          state.memoryVisible = null;
        }
        if (
          state.session?.mode === "digits" &&
          ["countdown", "showing"].includes(state.digitsPhase)
        ) {
          state.digitsPhase = "ready";
          state.digitsVisible = "";
          state.digitsAnswer = "";
          state.digitsResult = "idle";
        }
        state.exitConfirmOpen = true;
        render();
      },
      "continue-learning"() {
        state.exitConfirmOpen = false;
        render();
        resumeAnswerAdvance();
      },
      "discard-session"() {
        discardCurrentSession();
      },
      "open-placement"() {
        state.placementMode = SKILL_MODES.includes(actionButton.dataset.mode)
          ? actionButton.dataset.mode
          : state.placementMode;
        state.placementDraftLevel = activeSkill(state.placementMode).level;
        state.placementOpen = true;
        render();
      },
      "placement-step"() {
        state.placementDraftLevel = clamp(
          state.placementDraftLevel + Number(actionButton.dataset.delta || 0),
          1,
          100,
        );
        render();
      },
      "apply-placement-level"() {
        applyPlacementLevel(state.placementMode, state.placementDraftLevel);
      },
      "close-placement"() {
        state.placementOpen = false;
        render();
      },
      "clear-kanji"() {
        state.kanjiMarks = 0;
        state.kanjiStrokes = 0;
        state.kanjiChecking = false;
        state.kanjiImage = "";
        state.kanjiFeedback = null;
        render();
      },
      "check-kanji"() {
        if (state.kanjiMarks < 5) return;
        const canvas = document.querySelector("#writingCanvas");
        const problem = currentSessionProblem();
        state.kanjiFeedback = analyzeKanjiWriting(canvas, problem);
        state.kanjiImage = canvas?.toDataURL("image/png") || "";
        state.kanjiChecking = true;
        render();
      },
      "kanji-retry"() {
        state.kanjiMarks = 0;
        state.kanjiStrokes = 0;
        state.kanjiChecking = false;
        state.kanjiImage = "";
        state.kanjiFeedback = null;
        render();
      },
      "kanji-success"() {
        playCorrectSound();
        state.kanjiDemoOpen = true;
        state.kanjiChecking = false;
        state.kanjiImage = "";
        state.kanjiFeedback = null;
        render();
      },
      "replay-kanji-strokes"() {
        replayKanjiStrokeAnimation();
      },
      "finish-kanji-demo"() {
        stopKanjiStrokeAnimation();
        finishQuestion(true, { playFeedback: false });
      },
      "kanji-difficult"() {
        finishQuestion(false);
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
        } else if (target === "digits") {
          state.digitsAnswer = state.digitsAnswer.slice(0, -1);
          state.digitsResult = "idle";
        } else {
          state.mathAnswer = state.mathAnswer.slice(0, -1);
          state.mathResult = "idle";
        }
        render();
      },
      "submit-math"() {
        if (!state.mathAnswer || state.mathResult !== "idle") return;
        const problem = currentSessionProblem();
        state.session.attempts += 1;
        state.mathResult = state.mathAnswer === problem.answer ? "correct" : "wrong";
        if (state.mathResult === "correct") {
          state.session.correct += 1;
          playCorrectSound();
          earnXp(MODE_INFO.math.xp);
        } else {
          playTapSound();
          applyWrongAnswerPenalty("math");
        }
        render();
        scheduleAnswerAdvance("math");
      },
      "next-math"() {
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "start-flash"() {
        startFlashSequence();
      },
      "replay-flash"() {
        if (state.flashReplayUsed) return;
        state.flashReplayUsed = true;
        state.flashAnswer = "";
        state.flashResult = "idle";
        startFlashSequence();
      },
      "give-up-flash"() {
        if (!state.flashReplayUsed || ["correct", "given-up"].includes(state.flashResult)) {
          return;
        }
        state.session.attempts += 1;
        state.flashResult = "given-up";
        applyWrongAnswerPenalty("flash");
        render();
        scheduleAnswerAdvance("flash");
      },
      "submit-flash"() {
        if (
          !state.flashAnswer ||
          ["correct", "given-up"].includes(state.flashResult)
        ) {
          return;
        }
        const total = state.flashSequence.reduce((sum, number) => sum + number, 0);
        state.session.attempts += 1;
        state.flashResult = Number(state.flashAnswer) === total ? "correct" : "wrong";
        if (state.flashResult === "correct") {
          state.session.correct += 1;
          playCorrectSound();
          if (!state.questionPenaltyApplied) earnXp(MODE_INFO.flash.xp);
        } else {
          playTapSound();
          applyWrongAnswerPenalty("flash");
        }
        render();
        if (state.flashResult === "correct") scheduleAnswerAdvance("flash");
      },
      "next-flash"() {
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "start-memory"() {
        startMemorySequence();
      },
      "undo-memory"() {
        if (state.memoryChecked) return;
        state.memorySelected.pop();
        render();
      },
      "start-digits"() {
        startDigitsSequence();
      },
      "submit-digits"() {
        if (!state.digitsAnswer || state.digitsResult !== "idle") return;
        const problem = currentSessionProblem();
        state.session.attempts += 1;
        state.digitsResult =
          state.digitsAnswer === problem.digits ? "correct" : "wrong";
        if (state.digitsResult === "correct") {
          state.session.correct += 1;
          playCorrectSound();
          earnXp(MODE_INFO.digits.xp);
        } else {
          playTapSound();
          applyWrongAnswerPenalty("digits");
        }
        render();
        scheduleAnswerAdvance("digits");
      },
      "continue-session"() {
        state.checkpointOpen = false;
        render();
        if (state.session?.mode === "flash") startFlashSequence();
      },
      "end-session"() {
        finishSession(true);
      },
      "restart-session"() {
        const mode = state.session.mode;
        const preschool = state.session.preschool;
        const preschoolType = state.session.preschoolType || "";
        startSession(mode, preschool, preschoolType);
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
      "test-sound"() {
        showToast("操作音を再生しました");
        render();
      },
    };
    actions[action]?.();
  }

  async function handleChange(event) {
    if (event.target.id === "placementLevelRange") {
      state.placementDraftLevel = clamp(event.target.value, 1, 100);
      render();
      return;
    }
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
    const autoStartFlash = state.session.mode === "flash";
    resetQuestionState();
    state.exitConfirmOpen = false;
    if (autoStartFlash) prepareFlashQuestion();
    if (state.session.mode === "memory" && !state.session.preschool) {
      prepareMemoryQuestion();
    }
    if (state.session.mode === "digits") prepareDigitsQuestion();
    if (state.session.completed % state.checkpointEvery === 0) {
      state.checkpointOpen = true;
    }
    render();
    if (autoStartFlash && !state.checkpointOpen) startFlashSequence();
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
    state.view = "home";
    showToast("設定を保存しました");
    render();
    window.scrollTo({ top: 0, left: 0 });
  }

  async function saveLearnerSelection() {
    const nameField = document.querySelector("#learnerName");
    activateLearner(nameField?.value || state.learnerName, false);
    saveProgress();
    state.view = "home";
    showToast(`${displayName()}に切り替えました`);
    render();
    window.scrollTo({ top: 0, left: 0 });
    if (state.cloudReady) {
      await flushPendingCloudSaves();
      await syncCloudProfiles();
    } else if (window.NobiruCloud?.isConfigured?.()) {
      await initializeCloudSync();
    }
  }

  function resetQuestionState() {
    stopKanjiStrokeAnimation();
    state.kanjiMarks = 0;
    state.kanjiStrokes = 0;
    state.questionPenaltyApplied = false;
    state.kanjiChecking = false;
    state.kanjiImage = "";
    state.kanjiFeedback = null;
    state.kanjiDemoOpen = false;
    state.readingChoice = "";
    state.readingChecked = false;
    prepareReadingChoices();
    state.mathAnswer = "";
    state.mathResult = "idle";
    state.flashAnswer = "";
    state.flashResult = "idle";
    state.flashCue = "3";
    state.flashReplayUsed = false;
    if (state.session?.mode !== "flash") state.flashPhase = "ready";
    state.memoryPhase = "ready";
    state.memoryVisible = null;
    state.memoryChoice = "";
    state.memorySelected = [];
    state.memoryResult = "idle";
    state.memoryChecked = false;
    state.memoryChoices = [];
    state.digitsPhase = "ready";
    state.digitsVisible = "";
    state.digitsAnswer = "";
    state.digitsResult = "idle";
  }

  function earnXp(amount) {
    const mode = state.session?.mode;
    if (!SKILL_MODES.includes(mode)) return;
    const profile = ensureProfile(state.learnerName);
    const skill = profile.skills[mode];
    const previousMikkunStage = isMikkunLearner()
      ? mikkunStage(skill.level)
      : null;
    const total = skill.xp + amount;
    if (total >= 100 && skill.level < 100) {
      skill.level += 1;
      skill.xp = total - 100;
      const nextMikkunStage = previousMikkunStage
        ? mikkunStage(skill.level)
        : null;
      const advancedMikkunStage =
        previousMikkunStage !== null &&
        nextMikkunStage !== null &&
        nextMikkunStage.rank > previousMikkunStage.rank;
      showToast(
        advancedMikkunStage
          ? `おめでとう！「${nextMikkunStage.label}」にステップアップ！`
          : `${MODE_INFO[mode].short}がレベル ${skill.level} にアップ！`,
      );
    } else {
      skill.xp = Math.min(100, total);
    }
    const studiedAt = Date.now();
    skill.updatedAt = studiedAt;
    profile.lastStudiedAt = studiedAt;
    profile.updatedAt = Math.max(profile.updatedAt, skill.updatedAt);
    applyActiveProfile();
    saveProgress(mode);
  }

  function applyWrongAnswerPenalty(mode) {
    if (
      state.questionPenaltyApplied ||
      !SKILL_MODES.includes(mode) ||
      !MODE_INFO[mode]?.penalty
    ) {
      return;
    }
    state.questionPenaltyApplied = true;
    const profile = ensureProfile(state.learnerName);
    const skill = profile.skills[mode];
    const previousLevel = skill.level;
    const previousScore = (skill.level - 1) * 100 + skill.xp;
    const stageFloorScore = isMikkunLearner()
      ? (mikkunStage(previousLevel).min - 1) * 100
      : 0;
    const nextScore = Math.max(
      stageFloorScore,
      previousScore - MODE_INFO[mode].penalty,
    );
    skill.level = Math.floor(nextScore / 100) + 1;
    skill.xp = nextScore % 100;
    const studiedAt = Date.now();
    skill.updatedAt = studiedAt;
    profile.lastStudiedAt = studiedAt;
    profile.updatedAt = Math.max(profile.updatedAt, skill.updatedAt);
    applyActiveProfile();
    saveProgress(mode);
    showToast(
      nextScore === previousScore
        ? `${MODE_INFO[mode].short}は最低レベルのままです`
        : skill.level < previousLevel
        ? `${MODE_INFO[mode].short}は Lv.${skill.level}・XP ${skill.xp}% に調整`
        : `${MODE_INFO[mode].short}のXPを ${MODE_INFO[mode].penalty}% だけ調整`,
    );
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
