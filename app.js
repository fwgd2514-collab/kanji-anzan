(() => {
  "use strict";

  const app = document.querySelector("#app");
  const ACTIVE_GROUP = window.NobiruCloud?.getGroupInfo?.() || {
    defaultGroupId: "nobiru-family-01",
    groupId: "nobiru-family-01",
    isDefaultGroup: true,
    nameMode: "file",
    groupLabel: "今までのグループ",
  };
  const STORAGE_KEY = ACTIVE_GROUP.isDefaultGroup
    ? "nobiru-progress"
    : `nobiru-progress:${ACTIVE_GROUP.groupId}`;
  const APP_LAST_UPDATED = "2026年8月14日";
  const LEVEL_ADJUSTMENT_PASSWORD = "1234";
  const MODE_INFO = {
    digits: { label: "数字記憶", short: "数字記憶", xp: 13, penalty: 4 },
    memory: { label: "フラッシュカード", short: "カード", xp: 13, penalty: 4 },
    flash: { label: "フラッシュ暗算", short: "フラッシュ", xp: 14, penalty: 4 },
    math: { label: "暗算する", short: "暗算", xp: 16, penalty: 5 },
    read: { label: "漢字を読む", short: "漢字・読み", xp: 12, penalty: 4 },
    write: { label: "漢字を選ぶ", short: "漢字・選択", xp: 18, penalty: 6 },
  };
  const MIKKUN_MODE_LABELS = {
    write: "メカを つくろう",
    read: "だんだんだんを うごかそう",
    math: "おたからを あつめよう",
    memory: "ピカッと きおく",
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
  const INITIAL_GRADE_LEVELS = [
    { value: "e1", label: "小学1年生", level: 1 },
    { value: "e2", label: "小学2年生", level: 11 },
    { value: "e3", label: "小学3年生", level: 21 },
    { value: "e4", label: "小学4年生", level: 33 },
    { value: "e5", label: "小学5年生", level: 45 },
    { value: "e6", label: "小学6年生", level: 57 },
    { value: "j1", label: "中学1年生", level: 69 },
    { value: "j2", label: "中学2年生", level: 79 },
    { value: "j3", label: "中学3年生", level: 89 },
    { value: "high", label: "高校生以上", level: 97 },
  ];
  const MIKKUN_NAME = "みっくん";
  const MAX_LEVEL = 120;
  const MIKKUN_MAX_LEVEL = 100;
  const PRESCHOOL_QUESTION_COUNT = 5;
  const QUESTION_BAND_COUNT = 10;
  const MIKKUN_STAGES = [
    { rank: 1, min: 1, max: 5, label: "年少さん・はじめ", short: "年少さん", next: "年少さん・ぐんぐん" },
    { rank: 2, min: 6, max: 10, label: "年少さん・ぐんぐん", short: "年少さん", next: "年中さん・はじめ" },
    { rank: 3, min: 11, max: 20, label: "年中さん・はじめ", short: "年中さん", next: "年中さん・チャレンジ" },
    { rank: 4, min: 21, max: 100, label: "年中さん・チャレンジ", short: "年中さん", next: "マスター" },
  ];
  const MIKKUN_SESSION_MISSIONS = {
    build: [
      { icon: "🔧", title: "パーツを あつめて ひみつメカを つくろう", prize: "レインボーレンチ" },
      { icon: "⚙️", title: "ぴったりの パーツで スーパーアームを つくろう", prize: "ゴールドギア" },
      { icon: "🛠️", title: "5つの しれんで だんだんだんを パワーアップ", prize: "メカマスターバッジ" },
    ],
    route: [
      { icon: "🧭", title: "いわを よけて ひみつの おたからへ すすめ", prize: "ほしのコンパス" },
      { icon: "🚀", title: "やじるしパワーで 5つの しまを たんけん", prize: "ダッシュタイヤ" },
      { icon: "🗺️", title: "まよいの みちを ぬけて ゴールを めざそう", prize: "たんけんマップ" },
    ],
    treasure: [
      { icon: "🎁", title: "かずを みわけて たからばこを ひらこう", prize: "にじいろキー" },
      { icon: "💎", title: "おなじものを みつけて ほしを あつめよう", prize: "きらきらメダル" },
      { icon: "👑", title: "5つの おたからで メカおうこくを すくおう", prize: "メカおうかん" },
    ],
    lights: [
      { icon: "💡", title: "さいごに ひかった えを おぼえよう", prize: "ピカピカバッテリー" },
      { icon: "🌈", title: "ひかりを おぼえて メカを フルパワーに", prize: "パワークリスタル" },
      { icon: "⚡", title: "ピカッと ひらめいて 5つの ランプを クリア", prize: "ひらめきライト" },
    ],
  };
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
    { band: 1, kanji: "山道", answer: "やまみち", choices: ["やまみち", "さんどう", "やまどう", "さんみち"] },
    { band: 1, kanji: "川上", answer: "かわかみ", choices: ["かわかみ", "せんじょう", "かわうえ", "せんかみ"] },
    { band: 1, kanji: "人口", answer: "じんこう", choices: ["じんこう", "にんこう", "ひとぐち", "じんぐち"] },
    { band: 1, kanji: "大学", answer: "だいがく", choices: ["だいがく", "たいがく", "おおがく", "だいかく"] },
    { band: 1, kanji: "休日", answer: "きゅうじつ", choices: ["きゅうじつ", "やすみび", "きゅうにち", "きゅじつ"] },
    { band: 1, kanji: "月日", answer: "つきひ", choices: ["つきひ", "げつじつ", "つきび", "げっぴ"] },
    { band: 2, kanji: "海辺", answer: "うみべ", choices: ["うみべ", "かいへん", "うみへん", "かいべ"] },
    { band: 2, kanji: "春休み", answer: "はるやすみ", choices: ["はるやすみ", "しゅんやすみ", "はるきゅうみ", "しゅんきゅう"] },
    { band: 2, kanji: "夏休み", answer: "なつやすみ", choices: ["なつやすみ", "かやすみ", "なつきゅうみ", "げやすみ"] },
    { band: 2, kanji: "秋空", answer: "あきぞら", choices: ["あきぞら", "しゅうくう", "あきそら", "しゅうぞら"] },
    { band: 2, kanji: "冬休み", answer: "ふゆやすみ", choices: ["ふゆやすみ", "とうやすみ", "ふゆきゅうみ", "とうきゅう"] },
    { band: 2, kanji: "星空", answer: "ほしぞら", choices: ["ほしぞら", "せいくう", "ほしそら", "せいぞら"] },
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

  const basicWordMeanings = {
    山道: "山の中にある道。", 川上: "川の流れてくる、上流の方。", 人口: "ある地域に住んでいる人の数。",
    大学: "専門的な学問を学び、研究する学校。", 休日: "仕事や学校が休みの日。", 月日: "月と日。また、過ぎていく時間。",
    海辺: "海の近く。", 春休み: "春の時期にある学校の休み。", 夏休み: "夏の時期にある長い休み。",
    秋空: "秋の季節の空。", 冬休み: "冬の時期にある学校の休み。", 星空: "星がたくさん見える夜空。",
    緑茶: "茶葉を発酵させずに作る、緑色のお茶。", 深海: "太陽の光が届きにくい、深い海。", 農業: "作物を育てたり、家畜を飼ったりする仕事。",
    登山: "山に登ること。", 空港: "飛行機が発着する場所。", 歩道橋: "人が道路を安全に渡るための橋。",
    愛情: "人や物を大切に思う、温かい気持ち。", 案内: "道や内容を知らせ、導くこと。", 位置: "物や人がある場所。",
    印刷: "文字や絵を、紙などに刷ること。", 衣服: "体に着るもの。", 英語: "イギリスやアメリカなどで使われる言語。",
    圧力: "物を押す力。また、人に無理をさせる力。", 移動: "場所を別の所へ移ること。", 原因: "ある結果を起こしたもと。",
    永遠: "いつまでも終わらず続くこと。", 営業: "店や会社が仕事を行うこと。", 衛生: "健康を守るため、清潔にすること。",
    異常: "いつもの正常な状態と違うこと。", 遺産: "亡くなった人が残した財産や文化。", 地域: "一定の広がりを持つ土地。",
    宇宙: "地球や星を含む、すべての空間。", 映画: "映像と音で物語などを表す作品。", 延長: "時間や距離を、さらに長くすること。",
    概要: "物事の大切な点をまとめた、おおよその内容。", 包括: "複数のものを、一つにまとめて含むこと。", 据える: "物を動かないよう、ある場所に置くこと。",
    推薦: "よい人や物として、他の人にすすめること。", 遂行: "仕事や計画を、最後までやりとげること。", 乏しい: "必要なものが少なく、十分でないこと。",
    曖昧: "内容や態度が、はっきりしないこと。", 憂慮: "悪いことにならないか、心配すること。", 顕著: "はっきり目立っていること。",
    把握: "内容や状況を、しっかり理解すること。", 矛盾: "二つのことのつじつまが合わないこと。", 著しい: "変化や違いが、はっきり分かるほど大きいこと。",
    凝縮: "広がっているものを、濃く小さくまとめること。", 脈絡: "話や物事の、前後のつながり。", 培養: "細胞や微生物などを、条件を整えて育てること。",
    媒体: "情報を伝える仲立ちとなるもの。", 謙虚: "自分を偉いと思わず、素直に学ぶ態度。", 養う: "食べ物を与えて育てる。また、力を身につける。",
    抽象: "共通する特徴を取り出し、一般的に考えたもの。", 論理: "考えや説明を組み立てる筋道。", 俯瞰: "高い所から見下ろすように、全体を見ること。",
    踏襲: "以前のやり方を、そのまま受け継ぐこと。", 漸進: "少しずつ、順を追って進むこと。", 帰納: "いくつもの具体例から、共通する結論を導くこと。",
    安泰: "危険や心配がなく、安心できる状態が続くこと。「家族の暮らしは安泰だ」のように、先のことまで安心できる場面で使います。",
  };
  readingProblems.forEach((problem) => {
    problem.meaning = basicWordMeanings[problem.kanji] || "";
  });

  const fallbackIdiomEntries = [
    [1, "一石二鳥", "いっせきにちょう", "一つの行動で、二つのよい結果を得ること。"],
    [2, "温故知新", "おんこちしん", "昔のことを学び、そこから新しい知識や考えを得ること。"],
    [3, "臨機応変", "りんきおうへん", "その場の状況に合わせて、うまく対応すること。"],
    [4, "切磋琢磨", "せっさたくま", "仲間どうしで励まし合い、学問や技を高めること。"],
    [5, "画竜点睛", "がりょうてんせい", "最後に大切な仕上げをして、全体を完成させること。"],
    [6, "森羅万象", "しんらばんしょう", "宇宙に存在する、あらゆる物事や現象。"],
    [7, "疑心暗鬼", "ぎしんあんき", "疑う気持ちがあると、何でも怖く怪しく感じること。"],
    [8, "不撓不屈", "ふとうふくつ", "どんな困難にも負けず、くじけないこと。"],
    [9, "臥薪嘗胆", "がしんしょうたん", "目的を果たすため、苦労に耐えて努力すること。"],
    [10, "虚心坦懐", "きょしんたんかい", "先入観を持たず、素直で落ち着いた心で向き合うこと。"],
  ];
  const idiomEntries =
    Array.isArray(window.NOBIRU_IDIOMS) && window.NOBIRU_IDIOMS.length
      ? window.NOBIRU_IDIOMS
      : fallbackIdiomEntries;
  const idiomProblems = buildIdiomProblems(idiomEntries);
  readingProblems.push(...buildIdiomReadingProblems(idiomEntries));

  function buildIdiomProblems(entries) {
    const safeEntries = entries
      .map(([band, idiom, reading, meaning]) => ({
        band: Number(band),
        idiom: String(idiom || ""),
        reading: String(reading || ""),
        meaning: String(meaning || window.NOBIRU_IDIOM_MEANINGS?.[idiom] || ""),
      }))
      .filter((entry) => entry.band >= 1 && entry.band <= 10 && Array.from(entry.idiom).length === 4);
    const fallbackKanji = Array.from("山川天地春夏秋冬東西南北上下左右大小心力学道光風花月");

    return safeEntries.flatMap((entry, entryIndex) => {
      const characters = Array.from(entry.idiom);
      const first = (entryIndex + entry.band) % 4;
      const second = (first + 2) % 4;
      const third = (first + 1) % 4;
      const masks = entry.band <= 3
        ? [[first], [second], [third]]
        : entry.band <= 6
          ? [[first], [second], [first, second]]
          : [[first], [first, second], [second, third]];
      const peers = safeEntries.filter(
        (candidate) => candidate.band === entry.band && candidate.idiom !== entry.idiom,
      );

      return masks.map((mask, variantIndex) => {
        const hiddenIndexes = [...new Set(mask)].sort((left, right) => left - right);
        const answer = hiddenIndexes.map((index) => characters[index]).join("・");
        const candidates = peers
          .map((candidate) => {
            const peerCharacters = Array.from(candidate.idiom);
            return hiddenIndexes.map((index) => peerCharacters[index]).join("・");
          })
          .filter((candidate, index, list) =>
            candidate !== answer && list.indexOf(candidate) === index,
          );
        for (let offset = 0; candidates.length < 3 && offset < fallbackKanji.length; offset += 1) {
          const filler = hiddenIndexes
            .map((_, index) => fallbackKanji[(entryIndex + variantIndex + offset + index * 7) % fallbackKanji.length])
            .join("・");
          if (filler !== answer && !candidates.includes(filler)) candidates.push(filler);
        }
        return {
          band: entry.band,
          idiom: entry.idiom,
          reading: entry.reading,
          meaning: entry.meaning,
          masked: characters
            .map((character, index) => hiddenIndexes.includes(index) ? "□" : character)
            .join(""),
          hiddenCount: hiddenIndexes.length,
          answer,
          choices: [answer, ...candidates.slice(0, 3)],
        };
      });
    });
  }

  function buildIdiomReadingProblems(entries) {
    const safeEntries = entries
      .map(([band, idiom, reading, meaning]) => ({
        band: Number(band),
        idiom: String(idiom || ""),
        reading: String(reading || ""),
        meaning: String(meaning || window.NOBIRU_IDIOM_MEANINGS?.[idiom] || ""),
      }))
      .filter((entry) => entry.band >= 1 && entry.band <= 10 && entry.idiom && entry.reading);

    return safeEntries.map((entry, entryIndex) => {
      const candidates = safeEntries
        .filter((candidate) => candidate.band === entry.band && candidate.reading !== entry.reading)
        .map((candidate) => candidate.reading);
      if (candidates.length < 3) {
        safeEntries.forEach((candidate) => {
          if (
            candidate.reading !== entry.reading &&
            !candidates.includes(candidate.reading)
          ) {
            candidates.push(candidate.reading);
          }
        });
      }
      const start = candidates.length ? entryIndex % candidates.length : 0;
      const rotated = [...candidates.slice(start), ...candidates.slice(0, start)];
      return {
        band: entry.band,
        kanji: entry.idiom,
        answer: entry.reading,
        meaning: entry.meaning,
        choices: [entry.reading, ...rotated.slice(0, 3)],
        isIdiom: true,
      };
    });
  }

  const additionalKanjiProblems = Array.isArray(window.NOBIRU_ADDITIONAL_KANJI)
    ? window.NOBIRU_ADDITIONAL_KANJI
    : [];

  additionalKanjiProblems.forEach(([band, kanji, reading, word]) => {
    kanjiProblems.push({ band, kanji, reading, word, strokes: null });
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
    { id: "owl", symbol: "🦉", label: "ふくろう", artX: 0, artY: 0, sheet: "adventure" },
    { id: "squirrel", symbol: "🐿️", label: "りす", artX: 33.333, artY: 0, sheet: "adventure" },
    { id: "hedgehog", symbol: "🦔", label: "はりねずみ", artX: 66.667, artY: 0, sheet: "adventure" },
    { id: "frog", symbol: "🐸", label: "かえる", artX: 100, artY: 0, sheet: "adventure" },
    { id: "tiger", symbol: "🐯", label: "とら", artX: 0, artY: 33.333, sheet: "adventure" },
    { id: "cow", symbol: "🐮", label: "うし", artX: 33.333, artY: 33.333, sheet: "adventure" },
    { id: "sheep", symbol: "🐑", label: "ひつじ", artX: 66.667, artY: 33.333, sheet: "adventure" },
    { id: "horse", symbol: "🐴", label: "うま", artX: 100, artY: 33.333, sheet: "adventure" },
    { id: "cake", symbol: "🎂", label: "けーき", artX: 0, artY: 66.667, sheet: "adventure" },
    { id: "rainbow", symbol: "🌈", label: "にじ", artX: 33.333, artY: 66.667, sheet: "adventure" },
    { id: "clock", symbol: "⏰", label: "とけい", artX: 66.667, artY: 66.667, sheet: "adventure" },
    { id: "rocket", symbol: "🚀", label: "ろけっと", artX: 100, artY: 66.667, sheet: "adventure" },
    { id: "book", symbol: "📘", label: "ほん", artX: 0, artY: 100, sheet: "adventure" },
    { id: "drum", symbol: "🥁", label: "たいこ", artX: 33.333, artY: 100, sheet: "adventure" },
    { id: "treasure-chest", symbol: "🧰", label: "たからばこ", artX: 66.667, artY: 100, sheet: "adventure" },
    { id: "crown", symbol: "👑", label: "おうかん", artX: 100, artY: 100, sheet: "adventure" },
  ];

  const mikkunCards = [
    { id: "anpan-hero", label: "あんぱんのヒーロー", artX: 0, artY: 0, sheet: "mikkun" },
    { id: "dadandandan", label: "だんだんだん", artX: 33.333, artY: 0, sheet: "mikkun" },
    { id: "anpan-bun", label: "あんぱん", artX: 66.667, artY: 0, sheet: "mikkun" },
    { id: "bakery-town", label: "パンのまち", artX: 100, artY: 0, sheet: "mikkun" },
    { id: "mech-bolt", label: "ねじ", artX: 0, artY: 33.333, sheet: "mikkun" },
    { id: "mech-gear", label: "はぐるま", artX: 33.333, artY: 33.333, sheet: "mikkun" },
    { id: "mech-wrench", label: "れんち", artX: 66.667, artY: 33.333, sheet: "mikkun" },
    { id: "mech-battery", label: "でんち", artX: 100, artY: 33.333, sheet: "mikkun" },
    { id: "red-light", label: "あかいランプ", artX: 0, artY: 66.667, sheet: "mikkun" },
    { id: "blue-light", label: "あおいランプ", artX: 33.333, artY: 66.667, sheet: "mikkun" },
    { id: "star-power", label: "きらきらパワー", artX: 66.667, artY: 66.667, sheet: "mikkun" },
    { id: "delivery-bag", label: "おとどけバッグ", artX: 100, artY: 66.667, sheet: "mikkun" },
    { id: "robot-arm", label: "メカのうで", artX: 0, artY: 100, sheet: "mikkun" },
    { id: "robot-foot", label: "メカのあし", artX: 33.333, artY: 100, sheet: "mikkun" },
    { id: "repair-cart", label: "しゅうりカート", artX: 66.667, artY: 100, sheet: "mikkun" },
    { id: "power-crystal", label: "にじいろパワー", artX: 100, artY: 100, sheet: "mikkun" },
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
    { prompt: "パンヒーローと おなじ パンは？", displayItems: ["🍞"], answer: "🍞", answerLabel: "パン", choices: ["🍞", "🔩", "⭐"] },
    { stage: 2, prompt: "だだんメカの ねじと おなじものは？", displayItems: ["🔩"], answer: "🔩", answerLabel: "ねじ", choices: ["⚙️", "🔩", "🔧"] },
    { stage: 3, prompt: "きらきらパワーと おなじものは？", displayItems: ["✨"], answer: "✨", answerLabel: "きらきら", choices: ["⭐", "✨", "⚡"] },
    { stage: 4, prompt: "メカの うでと おなじものは？", displayItems: ["🦾"], answer: "🦾", answerLabel: "メカの うで", choices: ["🦿", "🦾", "🔧"] },
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
    { prompt: "メカを なおす どうぐは どれ？", display: "🤖", answer: "🔧", answerLabel: "れんち", choices: ["🔧", "🍎", "🌼"] },
    { stage: 2, prompt: "メカの パーツは どれ？", display: "🦾", answer: "⚙️", answerLabel: "はぐるま", choices: ["🍞", "⚙️", "☂️"] },
    { stage: 3, prompt: "パンヒーローが とどけるものは？", display: "🦸", answer: "🍞", answerLabel: "パン", choices: ["🔩", "🍞", "🚲"] },
    { stage: 4, prompt: "メカを うごかす パワーは？", display: "🤖", answer: "⚡", answerLabel: "でんき", choices: ["🌧️", "⚡", "🍇"] },
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
    { prompt: "パンは いくつ？", displayItems: ["🍞", "🍞"], answer: "2", answerLabel: "2こ", choices: ["1", "2", "3"] },
    { stage: 2, prompt: "ねじは いくつ？", displayItems: ["🔩", "🔩", "🔩", "🔩"], answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
    { stage: 3, prompt: "はぐるまは いくつ？", displayItems: ["⚙️", "⚙️", "⚙️", "⚙️", "⚙️", "⚙️"], answer: "6", answerLabel: "6こ", choices: ["5", "6", "7"] },
    { stage: 4, prompt: "きいろい ねじは いくつ？", displayItems: ["🔩", "🟡", "🔩", "🟡", "🟡", "🔩", "🟡"], answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
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
    { prompt: "メカの ランプ。つぎは どれ？", patternItems: ["🔴", "🔵", "🔴", "🔵"], answer: "🔴", answerLabel: "あか", choices: ["🔴", "🔵", "🟡"] },
    { stage: 2, prompt: "パーツの ならび。つぎは？", patternItems: ["🔩", "⚙️", "🔩", "⚙️"], answer: "🔩", answerLabel: "ねじ", choices: ["🔩", "⚙️", "🔧"] },
    { stage: 3, prompt: "パンパワーの ならび。つぎは？", patternItems: ["🍞", "⭐", "⚡", "🍞", "⭐"], answer: "⚡", answerLabel: "でんき", choices: ["🍞", "⭐", "⚡"] },
    { stage: 4, prompt: "だだんメカの うごき。つぎは？", patternItems: ["🦾", "🦾", "🦿", "🦾", "🦾"], answer: "🦿", answerLabel: "メカの あし", choices: ["🦾", "🦿", "⚙️"] },
  ];

  // みっくん専用の絵だけで遊べる問題群。各段階に複数問を用意し、
  // 以前の動物・果物問題が混ざらないように通常の問題群とは分けている。
  const mikkunHeroTreasureProblems = [
    { prompt: "あんぱんのヒーローと おなじ えは どれ？", displayCard: "anpan-hero", answer: "anpan-hero", answerLabel: "あんぱんのヒーロー", choices: ["anpan-hero", "dadandandan", "anpan-bun"] },
    { prompt: "だんだんだんと おなじ えは どれ？", displayCard: "dadandandan", answer: "dadandandan", answerLabel: "だんだんだん", choices: ["dadandandan", "anpan-hero", "repair-cart"] },
    { prompt: "あんぱんと おなじ えは どれ？", displayCard: "anpan-bun", answer: "anpan-bun", answerLabel: "あんぱん", choices: ["anpan-bun", "mech-gear", "delivery-bag"] },
    { prompt: "パンのまちと おなじ えは どれ？", displayCard: "bakery-town", answer: "bakery-town", answerLabel: "パンのまち", choices: ["bakery-town", "delivery-bag", "mech-battery"] },
    { prompt: "ねじと おなじ えは どれ？", displayCard: "mech-bolt", answer: "mech-bolt", answerLabel: "ねじ", choices: ["mech-bolt", "mech-gear", "mech-wrench"] },
    { prompt: "はぐるまと おなじ えは どれ？", displayCard: "mech-gear", answer: "mech-gear", answerLabel: "はぐるま", choices: ["mech-gear", "mech-bolt", "mech-battery"] },
    { prompt: "れんちと おなじ えは どれ？", displayCard: "mech-wrench", answer: "mech-wrench", answerLabel: "れんち", choices: ["mech-wrench", "robot-arm", "repair-cart"] },
    { prompt: "でんちと おなじ えは どれ？", displayCard: "mech-battery", answer: "mech-battery", answerLabel: "でんち", choices: ["mech-battery", "red-light", "star-power"] },
    { stage: 2, prompt: "あかいランプと おなじ えは どれ？", displayCard: "red-light", answer: "red-light", answerLabel: "あかいランプ", choices: ["red-light", "blue-light", "star-power"] },
    { stage: 2, prompt: "あおいランプと おなじ えは どれ？", displayCard: "blue-light", answer: "blue-light", answerLabel: "あおいランプ", choices: ["blue-light", "red-light", "mech-battery"] },
    { stage: 2, prompt: "きらきらパワーと おなじ えは どれ？", displayCard: "star-power", answer: "star-power", answerLabel: "きらきらパワー", choices: ["star-power", "power-crystal", "red-light"] },
    { stage: 2, prompt: "おとどけバッグと おなじ えは どれ？", displayCard: "delivery-bag", answer: "delivery-bag", answerLabel: "おとどけバッグ", choices: ["delivery-bag", "anpan-bun", "repair-cart"] },
    { stage: 3, prompt: "メカのうでと おなじ えは どれ？", displayCard: "robot-arm", answer: "robot-arm", answerLabel: "メカのうで", choices: ["robot-arm", "robot-foot", "mech-wrench"] },
    { stage: 3, prompt: "メカのあしと おなじ えは どれ？", displayCard: "robot-foot", answer: "robot-foot", answerLabel: "メカのあし", choices: ["robot-foot", "robot-arm", "mech-bolt"] },
    { stage: 4, prompt: "しゅうりカートと おなじ えは どれ？", displayCard: "repair-cart", answer: "repair-cart", answerLabel: "しゅうりカート", choices: ["repair-cart", "dadandandan", "bakery-town"] },
    { stage: 4, prompt: "にじいろパワーと おなじ えは どれ？", displayCard: "power-crystal", answer: "power-crystal", answerLabel: "にじいろパワー", choices: ["power-crystal", "star-power", "mech-battery"] },
  ];

  const mikkunMechGroupProblems = [
    { prompt: "まちを まもる ヒーローは どれ？", displayCard: "bakery-town", answer: "anpan-hero", answerLabel: "あんぱんのヒーロー", choices: ["anpan-hero", "dadandandan", "repair-cart"] },
    { prompt: "おおきな メカは どれ？", displayCard: "dadandandan", answer: "dadandandan", answerLabel: "だんだんだん", choices: ["dadandandan", "anpan-bun", "mech-gear"] },
    { prompt: "ヒーローが とどけるものは どれ？", displayCard: "anpan-hero", answer: "anpan-bun", answerLabel: "あんぱん", choices: ["anpan-bun", "mech-battery", "robot-foot"] },
    { prompt: "パンを やく まちは どれ？", displayCard: "anpan-bun", answer: "bakery-town", answerLabel: "パンのまち", choices: ["bakery-town", "repair-cart", "delivery-bag"] },
    { prompt: "メカを とめる ねじは どれ？", displayCard: "dadandandan", answer: "mech-bolt", answerLabel: "ねじ", choices: ["mech-bolt", "mech-gear", "star-power"] },
    { prompt: "くるくる まわる パーツは どれ？", displayCard: "dadandandan", answer: "mech-gear", answerLabel: "はぐるま", choices: ["mech-gear", "mech-wrench", "robot-arm"] },
    { prompt: "なおす どうぐは どれ？", displayCard: "repair-cart", answer: "mech-wrench", answerLabel: "れんち", choices: ["mech-wrench", "mech-battery", "anpan-bun"] },
    { prompt: "メカを うごかすものは どれ？", displayCard: "dadandandan", answer: "mech-battery", answerLabel: "でんち", choices: ["mech-battery", "delivery-bag", "mech-bolt"] },
    { stage: 2, prompt: "あかく ひかるものは どれ？", displayCard: "dadandandan", answer: "red-light", answerLabel: "あかいランプ", choices: ["red-light", "blue-light", "mech-battery"] },
    { stage: 2, prompt: "あおく ひかるものは どれ？", displayCard: "dadandandan", answer: "blue-light", answerLabel: "あおいランプ", choices: ["blue-light", "red-light", "star-power"] },
    { stage: 2, prompt: "キラキラ ひかるものは どれ？", displayCard: "anpan-hero", answer: "star-power", answerLabel: "きらきらパワー", choices: ["star-power", "mech-bolt", "robot-foot"] },
    { stage: 2, prompt: "あんぱんを はこぶものは どれ？", displayCard: "anpan-bun", answer: "delivery-bag", answerLabel: "おとどけバッグ", choices: ["delivery-bag", "mech-gear", "power-crystal"] },
    { stage: 3, prompt: "ものを もつ パーツは どれ？", displayCard: "dadandandan", answer: "robot-arm", answerLabel: "メカのうで", choices: ["robot-arm", "robot-foot", "mech-battery"] },
    { stage: 3, prompt: "あるく パーツは どれ？", displayCard: "dadandandan", answer: "robot-foot", answerLabel: "メカのあし", choices: ["robot-foot", "robot-arm", "mech-wrench"] },
    { stage: 4, prompt: "メカを はこぶ のりものは どれ？", displayCard: "dadandandan", answer: "repair-cart", answerLabel: "しゅうりカート", choices: ["repair-cart", "bakery-town", "delivery-bag"] },
    { stage: 4, prompt: "いちばん ふしぎな パワーは どれ？", displayCard: "anpan-hero", answer: "power-crystal", answerLabel: "にじいろパワー", choices: ["power-crystal", "mech-gear", "red-light"] },
  ];

  const repeatedCards = (id, count) => Array.from({ length: count }, () => id);
  const mikkunMechCountingProblems = [
    { prompt: "あんぱんは いくつ？", displayCards: repeatedCards("anpan-bun", 1), answer: "1", answerLabel: "1こ", choices: ["1", "2", "3"] },
    { prompt: "あんぱんは いくつ？", displayCards: repeatedCards("anpan-bun", 2), answer: "2", answerLabel: "2こ", choices: ["1", "2", "3"] },
    { prompt: "ねじは いくつ？", displayCards: repeatedCards("mech-bolt", 3), answer: "3", answerLabel: "3こ", choices: ["2", "3", "4"] },
    { prompt: "はぐるまは いくつ？", displayCards: repeatedCards("mech-gear", 4), answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
    { prompt: "きらきらパワーは いくつ？", displayCards: repeatedCards("star-power", 5), answer: "5", answerLabel: "5こ", choices: ["3", "4", "5"] },
    { prompt: "でんちは いくつ？", displayCards: repeatedCards("mech-battery", 2), answer: "2", answerLabel: "2こ", choices: ["1", "2", "4"] },
    { prompt: "ランプは いくつ？", displayCards: repeatedCards("red-light", 3), answer: "3", answerLabel: "3こ", choices: ["2", "3", "4"] },
    { prompt: "れんちは いくつ？", displayCards: repeatedCards("mech-wrench", 4), answer: "4", answerLabel: "4こ", choices: ["3", "4", "5"] },
    { stage: 2, prompt: "ねじは いくつ？", displayCards: repeatedCards("mech-bolt", 6), answer: "6", answerLabel: "6こ", choices: ["5", "6", "7"] },
    { stage: 2, prompt: "はぐるまは いくつ？", displayCards: repeatedCards("mech-gear", 7), answer: "7", answerLabel: "7こ", choices: ["6", "7", "8"] },
    { stage: 2, prompt: "バッグは いくつ？", displayCards: repeatedCards("delivery-bag", 6), answer: "6", answerLabel: "6こ", choices: ["4", "5", "6"] },
    { stage: 2, prompt: "でんちは いくつ？", displayCards: repeatedCards("mech-battery", 7), answer: "7", answerLabel: "7こ", choices: ["6", "7", "8"] },
    { stage: 3, prompt: "きらきらパワーは いくつ？", displayCards: repeatedCards("star-power", 8), answer: "8", answerLabel: "8こ", choices: ["7", "8", "9"] },
    { stage: 3, prompt: "ねじは いくつ？", displayCards: repeatedCards("mech-bolt", 9), answer: "9", answerLabel: "9こ", choices: ["8", "9", "10"] },
    { stage: 4, prompt: "はぐるまは いくつ？", displayCards: repeatedCards("mech-gear", 10), answer: "10", answerLabel: "10こ", choices: ["8", "9", "10"] },
    { stage: 4, prompt: "あおいランプは いくつ？", displayCards: repeatedCards("blue-light", 8), answer: "8", answerLabel: "8こ", choices: ["7", "8", "9"] },
  ];

  const mikkunMechPatternProblems = [
    { prompt: "つぎに くる えは どれ？", patternCards: ["anpan-hero", "dadandandan", "anpan-hero", "dadandandan"], answer: "anpan-hero", answerLabel: "あんぱんのヒーロー", choices: ["anpan-hero", "dadandandan", "anpan-bun"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["anpan-bun", "delivery-bag", "anpan-bun", "delivery-bag"], answer: "anpan-bun", answerLabel: "あんぱん", choices: ["anpan-bun", "delivery-bag", "mech-battery"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["mech-bolt", "mech-gear", "mech-bolt", "mech-gear"], answer: "mech-bolt", answerLabel: "ねじ", choices: ["mech-bolt", "mech-gear", "mech-wrench"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["red-light", "blue-light", "red-light", "blue-light"], answer: "red-light", answerLabel: "あかいランプ", choices: ["red-light", "blue-light", "star-power"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["mech-wrench", "mech-battery", "mech-wrench", "mech-battery"], answer: "mech-wrench", answerLabel: "れんち", choices: ["mech-wrench", "mech-battery", "mech-bolt"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["star-power", "anpan-bun", "star-power", "anpan-bun"], answer: "star-power", answerLabel: "きらきらパワー", choices: ["star-power", "anpan-bun", "power-crystal"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["robot-arm", "robot-foot", "robot-arm", "robot-foot"], answer: "robot-arm", answerLabel: "メカのうで", choices: ["robot-arm", "robot-foot", "mech-wrench"] },
    { prompt: "つぎに くる えは どれ？", patternCards: ["bakery-town", "repair-cart", "bakery-town", "repair-cart"], answer: "bakery-town", answerLabel: "パンのまち", choices: ["bakery-town", "repair-cart", "dadandandan"] },
    { stage: 2, prompt: "3つの ならび。つぎは どれ？", patternCards: ["mech-bolt", "mech-gear", "mech-battery", "mech-bolt", "mech-gear"], answer: "mech-battery", answerLabel: "でんち", choices: ["mech-bolt", "mech-gear", "mech-battery"] },
    { stage: 2, prompt: "3つの ならび。つぎは どれ？", patternCards: ["red-light", "blue-light", "star-power", "red-light", "blue-light"], answer: "star-power", answerLabel: "きらきらパワー", choices: ["red-light", "blue-light", "star-power"] },
    { stage: 2, prompt: "3つの ならび。つぎは どれ？", patternCards: ["anpan-hero", "anpan-bun", "delivery-bag", "anpan-hero", "anpan-bun"], answer: "delivery-bag", answerLabel: "おとどけバッグ", choices: ["anpan-hero", "anpan-bun", "delivery-bag"] },
    { stage: 2, prompt: "3つの ならび。つぎは どれ？", patternCards: ["robot-arm", "robot-foot", "repair-cart", "robot-arm", "robot-foot"], answer: "repair-cart", answerLabel: "しゅうりカート", choices: ["robot-arm", "robot-foot", "repair-cart"] },
    { stage: 3, prompt: "ならびを よくみて。つぎは どれ？", patternCards: ["mech-bolt", "mech-bolt", "mech-gear", "mech-bolt", "mech-bolt"], answer: "mech-gear", answerLabel: "はぐるま", choices: ["mech-bolt", "mech-gear", "mech-wrench"] },
    { stage: 3, prompt: "ならびを よくみて。つぎは どれ？", patternCards: ["anpan-hero", "dadandandan", "dadandandan", "anpan-hero", "dadandandan"], answer: "dadandandan", answerLabel: "だんだんだん", choices: ["anpan-hero", "dadandandan", "repair-cart"] },
    { stage: 4, prompt: "むずかしい ならび。つぎは どれ？", patternCards: ["red-light", "blue-light", "blue-light", "red-light", "blue-light"], answer: "blue-light", answerLabel: "あおいランプ", choices: ["red-light", "blue-light", "star-power"] },
    { stage: 4, prompt: "むずかしい ならび。つぎは どれ？", patternCards: ["star-power", "star-power", "power-crystal", "star-power", "star-power"], answer: "power-crystal", answerLabel: "にじいろパワー", choices: ["star-power", "power-crystal", "mech-battery"] },
  ];

  const mikkunRouteProblems = [
    { prompt: "おたからは みぎ！ どっちへ すすむ？", display: "route-right-1", route: "right", answer: "➡️", answerLabel: "みぎ", choices: ["⬅️", "➡️", "⬆️"] },
    { prompt: "パンを とどけに ひだりへ すすもう", display: "route-left-1", route: "left", answer: "⬅️", answerLabel: "ひだり", choices: ["⬅️", "➡️", "⬇️"] },
    { prompt: "きらきらパワーは うえ！", display: "route-up-1", route: "up", answer: "⬆️", answerLabel: "うえ", choices: ["⬅️", "⬆️", "⬇️"] },
    { prompt: "しゅうりカートは したに いるよ", display: "route-down-1", route: "down", answer: "⬇️", answerLabel: "した", choices: ["➡️", "⬆️", "⬇️"] },
    { prompt: "あおい おたからへ みぎ！", display: "route-right-2", route: "right", answer: "➡️", answerLabel: "みぎ", choices: ["⬅️", "➡️", "⬇️"] },
    { prompt: "あんぱんは ひだりに あるよ", display: "route-left-2", route: "left", answer: "⬅️", answerLabel: "ひだり", choices: ["⬅️", "⬆️", "⬇️"] },
    { prompt: "ほしの パワーへ うえ！", display: "route-up-2", route: "up", answer: "⬆️", answerLabel: "うえ", choices: ["➡️", "⬆️", "⬇️"] },
    { prompt: "ねじを ひろいに したへ！", display: "route-down-2", route: "down", answer: "⬇️", answerLabel: "した", choices: ["⬅️", "➡️", "⬇️"] },
    { stage: 2, prompt: "いわを よけて みぎへ すすもう", display: "route-right-3", route: "right", obstacle: true, answer: "➡️", answerLabel: "みぎ", choices: ["⬅️", "➡️", "⬆️"] },
    { stage: 2, prompt: "でんちは ひだり。どの やじるし？", display: "route-left-3", route: "left", obstacle: true, answer: "⬅️", answerLabel: "ひだり", choices: ["⬅️", "➡️", "⬇️"] },
    { stage: 2, prompt: "にじいろパワーへ うえ！", display: "route-up-3", route: "up", obstacle: true, answer: "⬆️", answerLabel: "うえ", choices: ["⬅️", "⬆️", "⬇️"] },
    { stage: 2, prompt: "れんちは した。どっちへ すすむ？", display: "route-down-3", route: "down", obstacle: true, answer: "⬇️", answerLabel: "した", choices: ["➡️", "⬆️", "⬇️"] },
    { stage: 3, prompt: "パンの まちは みぎだよ！", display: "route-right-4", route: "right", obstacle: true, answer: "➡️", answerLabel: "みぎ", choices: ["⬅️", "➡️", "⬆️"] },
    { stage: 3, prompt: "ひみつの パーツは うえ！", display: "route-up-4", route: "up", obstacle: true, answer: "⬆️", answerLabel: "うえ", choices: ["➡️", "⬆️", "⬇️"] },
    { stage: 4, prompt: "きんの おたからは ひだり！", display: "route-left-4", route: "left", obstacle: true, answer: "⬅️", answerLabel: "ひだり", choices: ["⬅️", "➡️", "⬇️"] },
    { stage: 4, prompt: "さいごの パワーは しただよ！", display: "route-down-4", route: "down", obstacle: true, answer: "⬇️", answerLabel: "した", choices: ["⬅️", "⬆️", "⬇️"] },
  ];

  const mikkunLightProblems = [
    { prompt: "さいごに ひかった えは どれ？", lightSequence: ["red-light", "blue-light"], answer: "blue-light", answerLabel: "あおいランプ", choices: ["red-light", "blue-light", "star-power"] },
    { prompt: "さいごの えを おぼえてね", lightSequence: ["mech-bolt", "mech-gear"], answer: "mech-gear", answerLabel: "はぐるま", choices: ["mech-bolt", "mech-gear", "mech-wrench"] },
    { prompt: "さいごに ピカッとしたのは？", lightSequence: ["anpan-bun", "star-power"], answer: "star-power", answerLabel: "きらきらパワー", choices: ["anpan-bun", "star-power", "delivery-bag"] },
    { prompt: "さいごの パーツは どれ？", lightSequence: ["mech-wrench", "mech-battery"], answer: "mech-battery", answerLabel: "でんち", choices: ["mech-wrench", "mech-battery", "mech-bolt"] },
    { prompt: "さいごに でた えは どれ？", lightSequence: ["dadandandan", "repair-cart"], answer: "repair-cart", answerLabel: "しゅうりカート", choices: ["dadandandan", "repair-cart", "robot-foot"] },
    { prompt: "さいごの いろを おぼえてね", lightSequence: ["blue-light", "red-light"], answer: "red-light", answerLabel: "あかいランプ", choices: ["red-light", "blue-light", "star-power"] },
    { prompt: "さいごに ピカッとした えは？", lightSequence: ["delivery-bag", "anpan-hero"], answer: "anpan-hero", answerLabel: "あんぱんのヒーロー", choices: ["delivery-bag", "anpan-hero", "dadandandan"] },
    { prompt: "さいごの メカパーツは どれ？", lightSequence: ["robot-arm", "robot-foot"], answer: "robot-foot", answerLabel: "メカのあし", choices: ["robot-arm", "robot-foot", "mech-wrench"] },
    { stage: 2, prompt: "3つめに ひかった えは？", lightSequence: ["red-light", "blue-light", "star-power"], answer: "star-power", answerLabel: "きらきらパワー", choices: ["red-light", "blue-light", "star-power"] },
    { stage: 2, prompt: "さいごの パーツを おぼえてね", lightSequence: ["mech-bolt", "mech-gear", "mech-battery"], answer: "mech-battery", answerLabel: "でんち", choices: ["mech-bolt", "mech-gear", "mech-battery"] },
    { stage: 2, prompt: "3つめに でた えは どれ？", lightSequence: ["anpan-bun", "delivery-bag", "bakery-town"], answer: "bakery-town", answerLabel: "パンのまち", choices: ["anpan-bun", "delivery-bag", "bakery-town"] },
    { stage: 2, prompt: "さいごに ひかった メカは？", lightSequence: ["dadandandan", "repair-cart", "robot-arm"], answer: "robot-arm", answerLabel: "メカのうで", choices: ["dadandandan", "repair-cart", "robot-arm"] },
    { stage: 3, prompt: "4つめの えを おぼえよう", lightSequence: ["red-light", "blue-light", "star-power", "power-crystal"], answer: "power-crystal", answerLabel: "にじいろパワー", choices: ["blue-light", "star-power", "power-crystal"] },
    { stage: 3, prompt: "さいごの どうぐは どれ？", lightSequence: ["mech-bolt", "mech-gear", "mech-battery", "mech-wrench"], answer: "mech-wrench", answerLabel: "れんち", choices: ["mech-gear", "mech-battery", "mech-wrench"] },
    { stage: 4, prompt: "5つめの えを おぼえてね", lightSequence: ["anpan-hero", "anpan-bun", "delivery-bag", "bakery-town", "star-power"], answer: "star-power", answerLabel: "きらきらパワー", choices: ["delivery-bag", "bakery-town", "star-power"] },
    { stage: 4, prompt: "さいごに でた メカパーツは？", lightSequence: ["robot-arm", "robot-foot", "mech-bolt", "mech-gear", "power-crystal"], answer: "power-crystal", answerLabel: "にじいろパワー", choices: ["mech-bolt", "mech-gear", "power-crystal"] },
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
    { start: 101, end: 110, label: "大学レベル", color: "#532B75" },
    { start: 111, end: 120, label: "天才レベル", color: "#8A5A00" },
  ];

  const curriculumKanji = (
    Array.isArray(window.NOBIRU_KANJI_CURRICULUM)
      ? window.NOBIRU_KANJI_CURRICULUM
      : []
  )
    .map((row) => ({
      grade: Number(row[0]),
      character: String(row[1] || ""),
      primaryReading: String(row[2] || ""),
      readings: String(row[3] || "")
        .split("|")
        .filter(Boolean),
      strokes: Number(row[4]) || 0,
      frequency: Number(row[5]) || 0,
      word: String(row[6] || ""),
      wordReading: String(row[7] || ""),
    }))
    .filter((item) => item.character && item.primaryReading);
  const middleSchoolKanji = curriculumKanji.filter((item) => item.grade === 8);
  const examKanjiUsage = idiomEntries
    .filter(([band]) => Number(band) >= 8)
    .reduce((counts, [, idiom]) => {
      Array.from(String(idiom || "")).forEach((character) => {
        counts.set(character, (counts.get(character) || 0) + 1);
      });
      return counts;
    }, new Map());
  const middleExamKanji = curriculumKanji
    .filter((item) => examKanjiUsage.has(item.character))
    .sort(
      (left, right) =>
        (examKanjiUsage.get(right.character) || 0) -
          (examKanjiUsage.get(left.character) || 0) ||
        right.strokes - left.strokes ||
        left.frequency - right.frequency,
    );
  const KANJI_CURRICULUM_STAGES = [
    { id: "e1", start: 1, end: 10, label: "小学1年", grade: 1, rows: curriculumKanji.filter((item) => item.grade === 1) },
    { id: "e2", start: 11, end: 20, label: "小学2年", grade: 2, rows: curriculumKanji.filter((item) => item.grade === 2) },
    { id: "e3", start: 21, end: 32, label: "小学3年", grade: 3, rows: curriculumKanji.filter((item) => item.grade === 3) },
    { id: "e4", start: 33, end: 44, label: "小学4年", grade: 4, rows: curriculumKanji.filter((item) => item.grade === 4) },
    { id: "e5", start: 45, end: 56, label: "小学5年", grade: 5, rows: curriculumKanji.filter((item) => item.grade === 5) },
    { id: "e6", start: 57, end: 68, label: "小学6年", grade: 6, rows: curriculumKanji.filter((item) => item.grade === 6) },
    { id: "j1", start: 69, end: 78, label: "中学1年", grade: 8, rows: middleSchoolKanji.slice(0, 400) },
    { id: "j2", start: 79, end: 88, label: "中学2年", grade: 8, rows: middleSchoolKanji.slice(400, 800) },
    { id: "j3", start: 89, end: 96, label: "中学3年", grade: 8, rows: middleSchoolKanji.slice(800) },
  ];
  const quizMasterRareWordEntries = [
    ["魑魅魍魎", "ちみもうりょう", "山や川にすむとされた怪物や妖怪の総称です。", [["魑", "ち"], ["魅", "み"], ["魍", "もう"], ["魎", "りょう"]]],
    ["薔薇", "ばら", "とげのある枝に、香り高い花を咲かせる植物です。", [["薔", "しょう"], ["薇", "び"]]],
    ["檸檬", "れもん", "黄色い実と強い酸味を持つ果物です。", [["檸", "ねい"], ["檬", "もう"]]],
    ["髑髏", "どくろ", "骨だけになった頭を表す言葉で、しゃれこうべともいいます。", [["髑", "どく"], ["髏", "ろ"]]],
    ["饕餮", "とうてつ", "古代中国の伝説上の怪物で、大食いのたとえにも使われます。", [["饕", "とう"], ["餮", "てつ"]]],
    ["躑躅", "つつじ", "春に赤や白などの花を咲かせる低木です。", [["躑", "てき"], ["躅", "ちょく"]]],
    ["蒟蒻", "こんにゃく", "こんにゃく芋から作る、弾力のある食品です。", [["蒟", "こん"], ["蒻", "じゃく"]]],
    ["顰蹙", "ひんしゅく", "人から嫌がられ、顔をしかめられるような反感を買うことです。", [["顰", "ひん"], ["蹙", "しゅく"]]],
    ["齷齪", "あくせく", "目先のことに追われ、落ち着かずせわしない様子です。", [["齷", "あく"], ["齪", "さく"]]],
    ["躊躇", "ちゅうちょ", "迷って決められず、ためらうことです。", [["躊", "ちゅう"], ["躇", "ちょ"]]],
    ["蹂躙", "じゅうりん", "権利や尊厳を乱暴に踏みにじることです。", [["蹂", "じゅう"], ["躙", "りん"]]],
    ["朦朧", "もうろう", "意識や景色がぼんやりして、はっきりしない様子です。", [["朦", "もう"], ["朧", "ろう"]]],
    ["齟齬", "そご", "話や考えがかみ合わず、食い違うことです。", [["齟", "そ"], ["齬", "ご"]]],
    ["邂逅", "かいこう", "思いがけず人と出会うことです。", [["邂", "かい"], ["逅", "こう"]]],
    ["瀟洒", "しょうしゃ", "すっきり洗練され、しゃれている様子です。", [["瀟", "しょう"], ["洒", "しゃ"]]],
    ["斟酌", "しんしゃく", "相手の事情や気持ちをくみ取り、ほどよく取り計らうことです。", [["斟", "しん"], ["酌", "しゃく"]]],
    ["贔屓", "ひいき", "気に入った人やものを、特に応援して大切にすることです。", [["贔", "ひ"], ["屓", "き"]]],
    ["蹉跌", "さてつ", "物事がうまくいかず、途中でつまずくことです。", [["蹉", "さ"], ["跌", "てつ"]]],
    ["憔悴", "しょうすい", "心配や疲れで、ひどくやつれることです。", [["憔", "しょう"], ["悴", "すい"]]],
    ["鸚鵡", "おうむ", "人の声をまねることで知られる鳥です。", [["鸚", "おう"], ["鵡", "む"]]],
    ["鮟鱇", "あんこう", "大きな口を持つ海の魚で、鍋料理でも知られます。", [["鮟", "あん"], ["鱇", "こう"]]],
    ["玉蜀黍", "とうもろこし", "夏に黄色い粒が穂に並ぶ作物です。", [["蜀", "しょく"], ["黍", "しょ"]]],
    ["獺祭", "だっさい", "カワウソが捕った魚を並べる様子を表し、酒の名にも使われます。", [["獺", "だつ"], ["祭", "さい"]]],
    ["螽斯", "きりぎりす", "キリギリスを表す古い漢字表記です。", [["螽", "しゅう"], ["斯", "し"]]],
    ["鳳凰", "ほうおう", "めでたいしるしとされる、中国の伝説上の霊鳥です。", [["鳳", "ほう"], ["凰", "おう"]]],
    ["鶺鴒", "せきれい", "水辺で長い尾を上下に振る小鳥です。", [["鶺", "せき"], ["鴒", "れい"]]],
    ["鵺", "ぬえ", "日本の物語に登場する、さまざまな動物の特徴を持つ怪物です。", [["鵺", "ぬえ"]]],
    ["瓢箪", "ひょうたん", "くびれた形の実で、乾かして入れ物にも使います。", [["瓢", "ひょう"], ["箪", "たん"]]],
    ["轆轤", "ろくろ", "陶器を回して形作る道具や、回転する仕掛けを表します。", [["轆", "ろく"], ["轤", "ろ"]]],
    ["襤褸", "ぼろ", "使い古して破れた衣服や布を表す言葉です。", [["襤", "らん"], ["褸", "る"]]],
    ["攫う", "さらう", "すばやく奪い取ったり、連れ去ったりすることです。", [["攫", "かく"]]],
    ["鏤める", "ちりばめる", "小さな美しいものを、あちこちにはめ込んで飾ることです。", [["鏤", "る"]]],
    ["犇めく", "ひしめく", "多くのものがすき間なく集まり、押し合うように動くことです。", [["犇", "ほん"]]],
    ["囀る", "さえずる", "小鳥が続けて美しい声で鳴くことです。", [["囀", "てん"]]],
    ["蠢く", "うごめく", "虫などが、もぞもぞと動くことです。", [["蠢", "しゅん"]]],
    ["齧る", "かじる", "歯で少しずつかみ取ることです。", [["齧", "げつ"]]],
    ["蔓延る", "はびこる", "好ましくないものが勢いを増して広がることです。", [["蔓", "まん"]]],
    ["靡く", "なびく", "風や水の流れに従って横に揺れることです。", [["靡", "び"]]],
    ["囁く", "ささやく", "相手にだけ聞こえるほどの小さな声で話すことです。", [["囁", "しょう"]]],
    ["嘯く", "うそぶく", "大きなことを平然と言ったり、知らないふりをしたりすることです。", [["嘯", "しょう"]]],
    ["躓く", "つまずく", "歩いて物に足を引っかけたり、物事の途中で失敗したりすることです。", [["躓", "ち"]]],
    ["蹲る", "うずくまる", "体を丸め、低くしゃがみ込むことです。", [["蹲", "そん"]]],
    ["滾る", "たぎる", "液体が激しく沸き立つことや、感情が強く湧き上がることです。", [["滾", "こん"]]],
    ["擽る", "くすぐる", "皮膚に軽く触れ、むずむずして笑いたくなる感じにすることです。", [["擽", "りゃく"]]],
    ["毟る", "むしる", "つかんで強く引き抜くことです。", [["毟", "むし"]]],
    ["抓る", "つねる", "指先で皮膚を強く挟むことです。", [["抓", "そう"]]],
  ];
  const rareKanjiSeen = new Set();
  const quizMasterRareKanji = quizMasterRareWordEntries.flatMap(
    ([word, wordReading, meaning, characters]) =>
      characters.map(([character, primaryReading]) => {
        const curriculumRow = curriculumKanji.find(
          (item) => item.character === character,
        );
        return {
          ...(curriculumRow || {}),
          grade: 10,
          character,
          primaryReading,
          readings: [
            ...new Set([primaryReading, ...(curriculumRow?.readings || [])]),
          ],
          strokes: curriculumRow?.strokes || 0,
          frequency: curriculumRow?.frequency || 9999,
          word,
          wordReading,
          meaning,
        };
      }),
  ).filter((item) => {
    if (rareKanjiSeen.has(item.character)) return false;
    rareKanjiSeen.add(item.character);
    return true;
  });
  const quizMasterSeen = new Set();
  const quizMasterKanji = [
    ...quizMasterRareKanji,
    ...[...middleSchoolKanji]
      .filter(
        (item) =>
          item.strokes >= 12 || item.frequency === 0 || item.frequency >= 1800,
      )
      .sort((left, right) => {
        const leftRarity = left.frequency > 0 ? left.frequency : 2600;
        const rightRarity = right.frequency > 0 ? right.frequency : 2600;
        return (
          rightRarity + right.strokes * 55 -
            (leftRarity + left.strokes * 55) ||
          right.strokes - left.strokes ||
          left.character.localeCompare(right.character, "ja")
        );
      }),
  ]
    .filter((item) => {
      if (quizMasterSeen.has(item.character)) return false;
      quizMasterSeen.add(item.character);
      return true;
    })
    .slice(0, 220);
  const KANJI_LIST_STAGES = [
    ...KANJI_CURRICULUM_STAGES.slice(0, 6),
    {
      id: "exam",
      label: "お受験",
      grade: 7,
      rows: middleExamKanji,
    },
    ...KANJI_CURRICULUM_STAGES.slice(6),
    {
      id: "quiz-master",
      label: "漢字王",
      grade: 10,
      rows: quizMasterKanji,
    },
  ];

  const state = {
    view: "home",
    level: 24,
    xp: 68,
    streak: 7,
    learnerName: ACTIVE_GROUP.isDefaultGroup ? DEFAULT_NAMES[0] : "",
    learnerNames: ACTIVE_GROUP.isDefaultGroup ? [...DEFAULT_NAMES] : [],
    namesSource: ACTIVE_GROUP.isDefaultGroup ? "初期名簿" : "Firebaseの登録名",
    learnerGateReady: false,
    learnerConfirmed: false,
    hasPreviousLearner: false,
    groupRegistrationBusy: false,
    groupRegistrationError: "",
    groupRegistrationDraftName: "",
    groupRegistrationDraftGrade: "",
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
    kanjiListStageId: "e1",
    kanjiListSelectedCharacter: "",
    placementMode: "write",
    placementDraftLevel: 1,
    placementOpen: false,
    levelPasswordOpen: false,
    levelPasswordError: "",
    pendingPlacementMode: "write",
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
    strokeKanji: "",
    readingChoice: "",
    readingChecked: false,
    readingChoices: [],
    lastReadingAnswerIndex: -1,
    mikkunRouteStep: 0,
    mikkunRouteMessage: "",
    mikkunRouteLastMove: "",
    mikkunRouteBumped: false,
    mathAnswer: "",
    mathResult: "idle",
    flashSequence: [],
    flashAnswer: "",
    flashResult: "idle",
    flashPhase: "ready",
    flashCue: "3",
    flashReplayUsed: false,
    flashSequenceRevealed: false,
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
  bootstrapApplication();
  app.addEventListener("pointerdown", unlockTapAudio, { passive: true });
  app.addEventListener("click", handleClick);
  app.addEventListener("change", handleChange);
  app.addEventListener("keydown", handleKeydown);
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

  async function bootstrapApplication() {
    await loadLearnerNames();
    state.learnerGateReady = true;
    render();
    initializeCloudSync();
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (Number.isFinite(saved.level)) state.level = clamp(saved.level, 1, MAX_LEVEL);
      if (Number.isFinite(saved.xp)) state.xp = clamp(saved.xp, 0, 100);
      if (Number.isFinite(saved.streak)) state.streak = Math.max(0, Number(saved.streak));
      if (typeof saved.learnerName === "string" && saved.learnerName.trim()) {
        state.learnerName = saved.learnerName.trim().slice(0, 20);
        state.hasPreviousLearner = saved.learnerWasConfirmed !== false;
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
    if (!state.learnerName) state.learnerName = state.learnerNames[0] || "";
    if (state.learnerName) applyActiveProfile();
  }

  async function loadLearnerNames(showFeedback = false) {
    if (ACTIVE_GROUP.nameMode === "registration") {
      try {
        const names = await window.NobiruCloud.loadLearnerNames();
        const changed = applyLearnerNames(names, "Firebaseの登録名");
        if (showFeedback) {
          showToast(changed ? `${names.length}人の登録名を読み込みました` : "登録名は最新です");
          render();
        }
        return true;
      } catch {
        state.cloudReady = false;
        if (showFeedback) showToast("登録名を読み込めませんでした");
        render();
        return false;
      }
    }
    if (location.protocol === "file:") {
      if (showFeedback) {
        showToast("下の「names.txtを選ぶ」から読み込んでください");
        render();
      }
      return true;
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
      return true;
    } catch {
      if (showFeedback) {
        showToast("names.txtを読み込めませんでした");
        render();
      }
      return false;
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

  function initialGradeOptionsTemplate(selectedValue = "") {
    return INITIAL_GRADE_LEVELS.map(
      (grade) => `<option value="${grade.value}" ${grade.value === selectedValue ? "selected" : ""}>${grade.label}</option>`,
    ).join("");
  }

  function initialLevelForGrade(value) {
    return INITIAL_GRADE_LEVELS.find((grade) => grade.value === value)?.level || 0;
  }

  function applyLearnerNames(names, source) {
    const changed = state.learnerNames.join("\n") !== names.join("\n");
    state.learnerNames = [...names];
    state.namesSource = source;
    state.learnerNames.forEach((name) => ensureProfile(name));
    if (!state.learnerNames.includes(state.learnerName)) {
      state.hasPreviousLearner = false;
      state.learnerName = "";
      if (state.learnerNames[0]) activateLearner(state.learnerNames[0], false);
    }
    saveProgress();
    if (changed) render();
    if (state.cloudReady) syncCloudProfiles();
    return changed;
  }

  function normalizeSkill(skill, fallbackLevel = 1, fallbackXp = 0, fallbackUpdatedAt = 0) {
    return {
      level: clamp(skill?.level ?? fallbackLevel, 1, MAX_LEVEL),
      xp: clamp(skill?.xp ?? fallbackXp, 0, 100),
      updatedAt: Math.max(
        0,
        Math.floor(Number(skill?.updatedAt ?? fallbackUpdatedAt) || 0),
      ),
    };
  }

  function normalizeProfile(profile) {
    const legacyLevel = clamp(profile?.level ?? 1, 1, MAX_LEVEL);
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
      MAX_LEVEL,
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
    if (!state.learnerName) return;
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
    if (state.learnerName) applyActiveProfile();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 4,
          level: state.level,
          xp: state.xp,
          streak: state.streak,
          learnerName: state.learnerName,
          learnerWasConfirmed: state.hasPreviousLearner,
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
    if (state.learnerName && SKILL_MODES.includes(changedMode)) {
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
    return group ? group.label : "天才レベル";
  }

  function practiceLevel(level) {
    return clamp(Number(level) - 12, 1, MAX_LEVEL);
  }

  function bandForLevel(level) {
    const safeLevel = clamp(Number(level), 1, MAX_LEVEL);
    if (safeLevel <= 20) return 1;
    if (safeLevel <= 32) return 2;
    if (safeLevel <= 44) return 3;
    if (safeLevel <= 56) return 4;
    if (safeLevel <= 68) return 5;
    if (safeLevel <= 78) return 6;
    if (safeLevel <= 88) return 7;
    if (safeLevel <= 100) return 8;
    if (safeLevel <= 110) return 9;
    return 10;
  }

  function curriculumStageForLevel(level) {
    const safeLevel = clamp(Number(level), 1, MAX_LEVEL);
    return (
      KANJI_CURRICULUM_STAGES.find(
        (stage) => safeLevel >= stage.start && safeLevel <= stage.end,
      ) || null
    );
  }

  function curriculumProgressForLevel(level, minimumPoolSize = 24) {
    const stage = curriculumStageForLevel(level);
    if (!stage) return null;
    const span = Math.max(1, stage.end - stage.start + 1);
    const step = clamp(Number(level), stage.start, stage.end) - stage.start + 1;
    const ratio = clamp(step / span, 0, 1);
    const unlockedCount = Math.min(
      stage.rows.length,
      Math.max(minimumPoolSize, Math.ceil(stage.rows.length * ratio)),
    );
    const stageIndex = KANJI_CURRICULUM_STAGES.indexOf(stage);
    return {
      stage,
      stageIndex,
      ratio,
      unlockedCount,
      unlockedRows: stage.rows.slice(0, unlockedCount),
      previousRows: stageIndex > 0 ? KANJI_CURRICULUM_STAGES[stageIndex - 1].rows : [],
      learnedRows: KANJI_CURRICULUM_STAGES.slice(0, stageIndex)
        .flatMap((item) => item.rows)
        .concat(stage.rows.slice(0, unlockedCount)),
    };
  }

  function curriculumProgressText(level) {
    const progress = curriculumProgressForLevel(level);
    if (!progress?.stage.rows.length) return "漢字チャレンジ";
    return `${progress.stage.label}配当 ${progress.unlockedCount}/${progress.stage.rows.length}字`;
  }

  function displayName() {
    return state.learnerName || "ゲスト";
  }

  function dailyQuestForLearner() {
    const quests = [
      { mode: "digits", icon: "🔐", title: "数字の暗号を解こう", detail: "流れる数字を見破れるかな？" },
      { mode: "memory", icon: "🃏", title: "絵カード探検", detail: "新しい絵との出会いを楽しもう！" },
      { mode: "flash", icon: "⚡", title: "ひらめき暗算", detail: "数字の流れをつかんで一発回答！" },
      { mode: "math", icon: "🎯", title: "暗算ターゲット", detail: "自分の記録にチャレンジしよう！" },
      { mode: "read", icon: "🔎", title: "ことば博士", detail: "熟語の読みと意味を発見しよう！" },
      { mode: "write", icon: "🏆", title: "漢字王への一歩", detail: "ぴったりの漢字を選び抜こう！" },
    ];
    const today = new Date();
    const seedText = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${displayName()}`;
    const seed = Array.from(seedText).reduce(
      (sum, character) => sum + character.codePointAt(0),
      0,
    );
    return quests[seed % quests.length];
  }

  function mikkunMissionFor(type, seed = Date.now()) {
    const missions = MIKKUN_SESSION_MISSIONS[type] || MIKKUN_SESSION_MISSIONS.build;
    const safeSeed = Math.abs(Number(seed) || 0);
    return { ...missions[safeSeed % missions.length], type };
  }

  function mikkunDailyAdventure() {
    const adventures = [
      { mode: "write", type: "build", label: "メカこうじょう" },
      { mode: "read", type: "route", label: "まよいの しま" },
      { mode: "math", type: "treasure", label: "おたからどうくつ" },
      { mode: "memory", type: "lights", label: "ピカッとタワー" },
    ];
    const today = new Date();
    const seedText = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${displayName()}`;
    const seed = Array.from(seedText).reduce(
      (sum, character) => sum + character.codePointAt(0),
      0,
    );
    const adventure = adventures[seed % adventures.length];
    return { ...adventure, ...mikkunMissionFor(adventure.type, seed) };
  }

  function mikkunPrizeForResult(session, ratio) {
    if (ratio === 100) {
      return { icon: "🏆", name: session.mikkunMission?.prize || "でんせつメダル", rank: "パーフェクト！" };
    }
    if (ratio >= 60) {
      return { icon: "🌟", name: "きらきらシール", rank: "ミッション クリア！" };
    }
    return { icon: "🔩", name: "がんばりネジ", rank: "つぎの パワーに へんしん！" };
  }

  function praiseForCurrentQuestion() {
    const praises = [
      "いいひらめき！",
      "その調子、さえてる！",
      "見事にクリア！",
      "集中力ばっちり！",
      "やったね、レベルアップに前進！",
      "すばらしい一答！",
    ];
    const session = state.session;
    const seed =
      (session?.completed || 0) +
      (session?.attempts || 0) +
      Array.from(displayName()).reduce(
        (sum, character) => sum + character.codePointAt(0),
        0,
      );
    return praises[seed % praises.length];
  }

  function isMikkunLearner(name = state.learnerName) {
    return String(name || "").trim() === MIKKUN_NAME;
  }

  function mikkunStage(level) {
    const safeLevel = clamp(level, 1, MIKKUN_MAX_LEVEL);
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

  function playAudioCue(tones, options = {}) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      unlockTapAudio();
      if (!tapAudioContext) return;
      const emitCue = () => {
        const now = tapAudioContext.currentTime + 0.008;
        const master = tapAudioContext.createGain();
        const compressor = tapAudioContext.createDynamicsCompressor();
        master.gain.setValueAtTime(options.volume ?? 0.78, now);
        compressor.threshold.setValueAtTime(-26, now);
        compressor.knee.setValueAtTime(18, now);
        compressor.ratio.setValueAtTime(4, now);
        compressor.attack.setValueAtTime(0.004, now);
        compressor.release.setValueAtTime(0.2, now);
        master.connect(compressor);
        compressor.connect(tapAudioContext.destination);

        const echoAmount = Number(options.echo || 0);
        if (echoAmount > 0) {
          const delay = tapAudioContext.createDelay(0.4);
          const echoGain = tapAudioContext.createGain();
          delay.delayTime.setValueAtTime(options.echoDelay || 0.11, now);
          echoGain.gain.setValueAtTime(echoAmount, now);
          master.connect(delay);
          delay.connect(echoGain);
          echoGain.connect(compressor);
        }

        tones.forEach((tone) => {
          const oscillator = tapAudioContext.createOscillator();
          const gain = tapAudioContext.createGain();
          const filter = tapAudioContext.createBiquadFilter();
          const beginsAt = now + Number(tone.start || 0);
          const attack = Math.max(0.004, Number(tone.attack || 0.014));
          oscillator.type = tone.type;
          oscillator.frequency.setValueAtTime(tone.frequency, beginsAt);
          if (tone.endFrequency) {
            oscillator.frequency.exponentialRampToValueAtTime(
              tone.endFrequency,
              beginsAt + tone.duration,
            );
          }
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(tone.filter || 6200, beginsAt);
          filter.Q.setValueAtTime(0.65, beginsAt);
          gain.gain.setValueAtTime(0.0001, beginsAt);
          gain.gain.exponentialRampToValueAtTime(tone.gain, beginsAt + attack);
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            beginsAt + tone.duration,
          );
          oscillator.connect(filter);
          filter.connect(gain);
          gain.connect(master);
          oscillator.start(beginsAt);
          oscillator.stop(beginsAt + tone.duration + 0.025);
        });
      };
      if (tapAudioContext.state === "running") {
        emitCue();
        return;
      }
      const resumed = tapAudioContext.resume();
      if (resumed?.then) {
        resumed.then(emitCue).catch(() => {});
      } else {
        emitCue();
      }
    } catch {
      // 音が使えないブラウザでも、操作そのものは止めません。
    }
  }

  function playTapSound() {
    playAudioCue(
      [
        { frequency: 1174.66, type: "sine", gain: 0.036, duration: 0.085 },
        { frequency: 2349.32, type: "triangle", gain: 0.008, duration: 0.05 },
      ],
      { volume: 0.72, echo: 0.025, echoDelay: 0.075 },
    );
  }

  function playCorrectSound() {
    playAudioCue(
      [
        { frequency: 1046.5, type: "sine", start: 0, duration: 0.58, gain: 0.045 },
        { frequency: 1318.51, type: "sine", start: 0.085, duration: 0.64, gain: 0.047 },
        { frequency: 1567.98, type: "sine", start: 0.17, duration: 0.72, gain: 0.048 },
        { frequency: 2093, type: "triangle", start: 0.27, duration: 0.82, gain: 0.025 },
        { frequency: 523.25, type: "sine", start: 0.27, duration: 0.7, gain: 0.018 },
      ],
      { volume: 0.82, echo: 0.12, echoDelay: 0.14 },
    );
  }

  function playWrongSound() {
    playAudioCue(
      [
        { frequency: 392, endFrequency: 369.99, type: "sine", start: 0, duration: 0.3, gain: 0.036 },
        { frequency: 329.63, endFrequency: 311.13, type: "triangle", start: 0.14, duration: 0.42, gain: 0.027 },
      ],
      { volume: 0.7, echo: 0.035, echoDelay: 0.12 },
    );
  }

  function playStartSound() {
    playAudioCue(
      [
        { frequency: 523.25, type: "sine", start: 0, duration: 0.28, gain: 0.03 },
        { frequency: 783.99, type: "sine", start: 0.09, duration: 0.34, gain: 0.033 },
        { frequency: 1046.5, type: "triangle", start: 0.18, duration: 0.46, gain: 0.026 },
      ],
      { volume: 0.76, echo: 0.075, echoDelay: 0.12 },
    );
  }

  function playLevelUpSound() {
    playAudioCue(
      [
        { frequency: 783.99, type: "sine", start: 0, duration: 0.45, gain: 0.028 },
        { frequency: 1046.5, type: "sine", start: 0.08, duration: 0.55, gain: 0.034 },
        { frequency: 1318.51, type: "sine", start: 0.17, duration: 0.68, gain: 0.038 },
        { frequency: 1567.98, type: "triangle", start: 0.28, duration: 0.78, gain: 0.026 },
        { frequency: 2093, type: "sine", start: 0.42, duration: 0.88, gain: 0.024 },
      ],
      { volume: 0.82, echo: 0.14, echoDelay: 0.15 },
    );
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
    if (!state.learnerConfirmed) {
      app.innerHTML = learnerGateTemplate();
      return;
    }
    const views = {
      home: homeTemplate,
      write: writeTemplate,
      read: readTemplate,
      math: mathTemplate,
      flash: flashTemplate,
      memory: memoryTemplate,
      digits: digitsTemplate,
      levels: levelsTemplate,
      "kanji-list": kanjiListTemplate,
      profile: profileTemplate,
      result: resultTemplate,
    };
    const showNav = ["home", "levels", "kanji-list", "profile"].includes(state.view);
    app.innerHTML = `
      ${views[state.view]()}
      ${showNav ? bottomNavTemplate() : ""}
      ${state.levelPasswordOpen ? levelPasswordTemplate() : ""}
      ${state.placementOpen ? placementTemplate() : ""}
      ${state.checkpointOpen ? checkpointTemplate() : ""}
      ${state.exitConfirmOpen ? exitConfirmTemplate() : ""}
      ${state.toast ? `<div class="toast" role="status"><span>★</span> ${state.toast}</div>` : ""}
    `;
    if (
      (["write", "read"].includes(state.view) && state.kanjiDemoOpen) ||
      (state.view === "kanji-list" && state.kanjiListSelectedCharacter)
    ) {
      setupKanjiStrokeDemo();
    } else if (state.view === "write") {
      setupWritingCanvas();
    }
    if (
      state.session?.preschool &&
      state.view === state.session.mode &&
      !state.readingChecked &&
      !state.checkpointOpen &&
      !state.exitConfirmOpen &&
      currentSessionProblem()?.missionType === "route"
    ) {
      scrollToMikkunRouteControls();
    }
  }

  function learnerGateTemplate() {
    if (!state.learnerGateReady) {
      return `
        <div class="screen learner-gate-screen learner-gate-loading" aria-live="polite">
          <span class="brand-mark">の</span>
          <p>名前の一覧を読み込んでいます…</p>
        </div>
      `;
    }
    if (ACTIVE_GROUP.nameMode === "registration") {
      return registeredLearnerGateTemplate();
    }
    const previousLearnerAvailable =
      state.hasPreviousLearner && state.learnerNames.includes(state.learnerName);
    return `
      <div class="screen learner-gate-screen">
        <div class="learner-gate-brand"><span class="brand-mark">の</span><b>のびる</b></div>
        <section class="learner-gate-card" aria-labelledby="learner-gate-title">
          <span class="learner-gate-icon" aria-hidden="true">人</span>
          <p class="eyebrow">WHO IS LEARNING?</p>
          <h1 id="learner-gate-title">
            ${previousLearnerAvailable
              ? `前回の「${escapeHtml(state.learnerName)}」で<br />続けますか？`
              : "自分の名前を<br />選んでください"
            }
          </h1>
          <p>${previousLearnerAvailable
            ? "同じ人なら、名前を選び直さずに始められます。"
            : "選んだ名前に、今日のレベルと学習記録が保存されます。"
          }</p>
          ${previousLearnerAvailable ? `
            <button type="button" class="primary-button wide learner-continue-button" data-action="continue-last-learner">
              <span>前回の学習者</span><b>${escapeHtml(state.learnerName)}</b><i>この人で続ける →</i>
            </button>
            <div class="learner-gate-divider"><span>別の人に変える</span></div>
          ` : ""}
          <label class="learner-gate-field" for="startupLearnerName">
            <span>学習する人</span>
            <select id="startupLearnerName" aria-label="自分の名前を選ぶ" required>
              <option value="" selected disabled>ここを押して名前を選ぶ</option>
              ${state.learnerNames.map((name) => `
                <option value="${escapeHtml(name)}">${escapeHtml(name)}</option>
              `).join("")}
            </select>
          </label>
          <button type="button" class="primary-button wide learner-gate-confirm" data-action="confirm-startup-learner" disabled>
            この名前で始める
          </button>
          <small>${previousLearnerAvailable
            ? "違う人が使う場合だけ、上の一覧から名前を選び直してください。"
            : "間違った人のレベルへ記録しないため、最初に名前を確認します。"
          }</small>
        </section>
        <p class="app-update-date">最終更新：${APP_LAST_UPDATED}</p>
        <button type="button" class="gate-update-button" data-action="refresh-app" aria-label="最新版に更新する">
          <span aria-hidden="true">↻</span><b>最新版に更新</b>
        </button>
      </div>
    `;
  }

  function registeredLearnerGateTemplate() {
    const previousLearnerAvailable =
      state.hasPreviousLearner && state.learnerNames.includes(state.learnerName);
    const hasLearners = state.learnerNames.length > 0;
    return `
      <div class="screen learner-gate-screen registered-learner-screen">
        <div class="learner-gate-brand"><span class="brand-mark">の</span><b>のびる</b></div>
        <section class="learner-gate-card" aria-labelledby="learner-gate-title">
          <span class="learner-gate-icon" aria-hidden="true">人</span>
          <p class="eyebrow">${escapeHtml(ACTIVE_GROUP.groupLabel)} · WHO IS LEARNING?</p>
          <h1 id="learner-gate-title">
            ${previousLearnerAvailable
              ? `前回の「${escapeHtml(state.learnerName)}」で<br />続けますか？`
              : hasLearners
                ? "自分の名前を<br />選んでください"
                : "最初の名前を<br />登録してください"
            }
          </h1>
          ${previousLearnerAvailable ? `
            <button type="button" class="primary-button wide learner-continue-button" data-action="continue-last-learner">
              <span>前回の学習者</span><b>${escapeHtml(state.learnerName)}</b><i>この人で続ける →</i>
            </button>
            <div class="learner-gate-divider"><span>別の人に変える</span></div>
          ` : ""}
          ${hasLearners ? `
            <label class="learner-gate-field" for="startupLearnerName">
              <span>登録済みの人</span>
              <select id="startupLearnerName" aria-label="自分の名前を選ぶ" required>
                <option value="" selected disabled>ここを押して名前を選ぶ</option>
                ${state.learnerNames.map((name) => `
                  <option value="${escapeHtml(name)}">${escapeHtml(name)}</option>
                `).join("")}
              </select>
            </label>
            <button type="button" class="primary-button wide learner-gate-confirm" data-action="confirm-startup-learner" disabled>
              この名前で始める
            </button>
            <div class="learner-gate-divider"><span>新しい人</span></div>
          ` : ""}
          <div class="registered-name-form">
            <label class="learner-gate-field" for="startupNewLearnerName">
              <span>新しく登録する名前</span>
              <input
                id="startupNewLearnerName"
                type="text"
                maxlength="20"
                autocomplete="off"
                placeholder="名前を入力（20文字まで）"
                value="${escapeHtml(state.groupRegistrationDraftName)}"
                ${state.groupRegistrationBusy ? "disabled" : ""}
              />
            </label>
            <label class="learner-gate-field registration-grade-field" for="startupNewLearnerGrade">
              <span>今の学年（最初の登録時だけ）</span>
              <select id="startupNewLearnerGrade" required ${state.groupRegistrationBusy ? "disabled" : ""}>
                <option value="" ${state.groupRegistrationDraftGrade ? "" : "selected"} disabled>学年を選んでください</option>
                ${initialGradeOptionsTemplate(state.groupRegistrationDraftGrade)}
              </select>
            </label>
            <p class="registration-grade-note">選んだ学年の最初のレベルから始まります。</p>
            ${state.groupRegistrationError ? `<p class="group-form-error" role="alert">${escapeHtml(state.groupRegistrationError)}</p>` : ""}
            <button type="button" class="secondary-button wide register-learner-button" data-action="register-group-learner" data-source="startup" ${state.groupRegistrationBusy ? "disabled" : ""}>
              ${state.groupRegistrationBusy ? "登録しています…" : "この名前を登録して始める"}
            </button>
          </div>
          <small>名前と学習レベルは、このグループの端末間だけで共有されます。</small>
        </section>
        <p class="app-update-date">最終更新：${APP_LAST_UPDATED}</p>
        <button type="button" class="gate-update-button" data-action="refresh-app" aria-label="最新版に更新する">
          <span aria-hidden="true">↻</span><b>最新版に更新</b>
        </button>
      </div>
    `;
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
    const dailyQuest = dailyQuestForLearner();
    const mikkunDailyQuest = mikkun ? mikkunDailyAdventure() : null;
    return `
      <div class="screen home-screen">
        <header class="topbar">
          <button class="brand" type="button" data-view="home" aria-label="ホーム">
            <span class="brand-mark">の</span><span>のびる</span>
          </button>
          <div class="topbar-actions">
            <button type="button" class="app-update-button" data-action="refresh-app" aria-label="最新版に更新する">
              <span aria-hidden="true">↻</span><b>最新版</b>
            </button>
            <div class="streak-pill" aria-label="${state.streak}日連続">
              <span class="flame">●</span><b>${state.streak}</b>日連続
            </div>
          </div>
        </header>

        <section class="today-section home-training-primary ${mikkun ? "mikkun-training" : ""}">
          <div class="section-heading">
            <div>
              <p class="eyebrow">${mikkun ? currentMikkunStage.label : `おかえり、${escapeHtml(displayName())}`}</p>
              <h1>${mikkun ? "みっくん メカたんけん" : "きょうのトレーニング"}</h1>
            </div>
            <button class="daily-count settings-link" type="button" data-view="profile">${mikkun ? "5もんずつ" : "問題数を変更"}</button>
          </div>
          ${mikkun ? `
            <div class="mikkun-intro">
              <span>🚀</span>
              <p>
                <b>だんだんだんと メカのしまを たんけん！</b>
                <small>きょうの ぶたいは「${mikkunDailyQuest.label}」</small>
                <span class="mikkun-stage-meter"><i style="width:${currentMikkunProgress}%"></i></span>
              </p>
            </div>
            <button
              type="button"
              class="mikkun-surprise-quest"
              data-start="${mikkunDailyQuest.mode}"
              data-preschool="true"
              data-preschool-type="${mikkunDailyQuest.type}"
              aria-label="きょうのびっくりミッション、${mikkunDailyQuest.title}を始める"
            >
              <span class="mikkun-surprise-icon" aria-hidden="true">${mikkunDailyQuest.icon}</span>
              <span><small>きょうの びっくりミッション</small><b>${mikkunDailyQuest.title}</b><i>ごほうび：${mikkunDailyQuest.prize}</i></span>
              <strong>しゅっぱつ！</strong>
            </button>
              ` : ""}
          ${mikkun ? "" : `
            <button type="button" class="daily-quest-card" data-start="${dailyQuest.mode}" aria-label="今日のおすすめ、${dailyQuest.title}を始める">
              <span class="daily-quest-icon" aria-hidden="true">${dailyQuest.icon}</span>
              <span><small>TODAY'S QUEST</small><b>${dailyQuest.title}</b><i>${dailyQuest.detail}</i></span>
              <strong>挑戦する →</strong>
            </button>
          `}
          <div class="subject-grid">
            ${mikkun
              ? `
                ${mikkunSubjectCard("write", "🛠️", "メカを つくろう", "ぴったりの パーツを つける", "kanji-card", "kanji-icon", "build")}
                ${mikkunSubjectCard("read", "🧭", "だんだんだんを うごかそう", "やじるしで おたからへ すすむ", "reading-subject-card", "reading-icon", "route")}
                ${mikkunSubjectCard("math", "🎁", "おたからを あつめよう", currentMikkunStage.rank >= 3 ? "1から10まで かぞえる" : "1から5まで かぞえる", "math-card", "math-icon color-card-icon", "treasure")}
                ${mikkunSubjectCard("memory", "💡", "ピカッと きおく", "ひかった えを おぼえる", "memory-subject-card", "memory-icon", "lights")}
              `
              : `
                ${subjectCard("digits", "123", "数字記憶", "流れる数字を記憶", "digits-subject-card", "digits-icon")}
                ${subjectCard("memory", "絵", "フラッシュカード", "絵カードを記憶", "memory-subject-card", "memory-icon")}
                ${subjectCard("flash", "瞬", "フラッシュ暗算", "数字を記憶", "flash-subject-card", "flash-icon")}
                ${subjectCard("math", "12", "暗算する", "数字パッド", "math-card", "math-icon")}
                ${subjectCard("read", "読", "漢字を読む", "学年別漢字・熟語", "reading-subject-card", "reading-icon")}
                ${subjectCard("write", "選", "漢字を選ぶ", "学年別漢字・熟語", "kanji-card", "kanji-icon")}
              `}
          </div>
        </section>

        <button type="button" class="registration-prompt home-learner-prompt" data-view="profile">
          <span class="registration-icon">人</span>
          <span><b>学習する人：${escapeHtml(displayName())}</b><small>タップして名前・問題数を変更できます</small></span>
          <i>›</i>
        </button>

        ${mikkun ? "" : `
          <button type="button" class="kanji-list-link" data-view="kanji-list">
            <span class="kanji-list-link-icon">字</span>
            <span><b>学年別漢字一覧</b><small>小学1年からお受験・漢字王まで、書き順と使い方を学習</small></span>
            <i aria-hidden="true">›</i>
          </button>
        `}

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
          <p class="road-note"><span>◆</span> ${mikkun ? "1回5つの短いミッション。絵・光・動きで遊べます" : "漢字は学年別配当表に合わせ、習った範囲の復習も混ぜて出題します"}</p>
        </section>

        <div class="encouragement">
          <span class="mini-face">☺</span>
          <p><b>毎日5分でも、ちゃんとのびる。</b><br />${state.checkpointEvery}問ごとに、続けるか休むか選べます。</p>
        </div>
      </div>
    `;
  }

  function kanjiUsageExamples(row) {
    const examples = [];
    const usedWords = new Set();
    const addExample = (word, reading = "", meaning = "") => {
      const cleanWord = String(word || "").trim();
      if (!cleanWord || usedWords.has(cleanWord)) return;
      usedWords.add(cleanWord);
      examples.push({
        word: cleanWord,
        reading: String(reading || "").trim(),
        meaning:
          String(meaning || "").trim() ||
          basicWordMeanings[cleanWord] ||
          `「${cleanWord}」と読みます。「${row.character}」が言葉のどこで、どんな意味を添えているか想像してみよう。声に出すと覚えやすくなります。`,
      });
    };

    addExample(row.word, row.wordReading, row.meaning);
    readingProblems.forEach((problem) => {
      if (String(problem.kanji || "").includes(row.character)) {
        addExample(problem.kanji, problem.answer, problem.meaning);
      }
    });
    additionalKanjiProblems.forEach(([, character, reading, word]) => {
      if (String(word || "").includes(row.character) || character === row.character) {
        addExample(word || character, reading);
      }
    });
    idiomEntries.forEach(([, idiom, reading, meaning]) => {
      if (String(idiom || "").includes(row.character)) {
        addExample(idiom, reading, meaning || window.NOBIRU_IDIOM_MEANINGS?.[idiom]);
      }
    });
    return examples.slice(0, 5);
  }

  function kanjiListDetailTemplate(row, stage) {
    const readings = [...new Set([row.primaryReading, ...row.readings].filter(Boolean))];
    const examples = kanjiUsageExamples(row);
    return `
      <div class="screen sub-screen kanji-list-screen kanji-detail-screen">
        <header class="sub-header kanji-list-header">
          <button class="round-button" type="button" data-action="close-kanji-list-detail" aria-label="漢字一覧へ戻る">‹</button>
          <div>
            <p class="eyebrow">KANJI STUDY</p>
            <h1>漢字をくわしく学ぶ</h1>
          </div>
        </header>

        <section class="kanji-detail-card kanji-detail-strokes kanji-detail-strokes-first" aria-labelledby="kanji-strokes-title">
          <div class="kanji-detail-section-heading">
            <span aria-hidden="true">書</span>
            <div><p class="eyebrow">STROKE ORDER</p><h2 id="kanji-strokes-title">「${row.character}」の書き順</h2></div>
          </div>
          <p class="kanji-detail-help">一画ずつゆっくり動きます。止まったら「もう一度」で繰り返せます。</p>
          <section class="kanji-stroke-stage" id="kanjiStrokeStage" aria-live="polite">
            <div class="kanji-stroke-loading" id="kanjiStrokeLoading">
              <span aria-hidden="true">${row.character}</span>
              <p id="kanjiStrokeLoadingText">書き順を準備しています…</p>
            </div>
            <svg
              id="kanjiStrokeSvg"
              viewBox="0 0 109 109"
              role="img"
              aria-label="${row.character}の書き順アニメーション"
              hidden
            ></svg>
          </section>
          <div class="kanji-stroke-status kanji-stroke-status-below" id="kanjiStrokeStatus" role="status" aria-live="polite">準備中</div>
          <div class="kanji-stroke-actions kanji-detail-stroke-actions">
            <button type="button" class="secondary-button" id="kanjiStrokeReplay" data-action="replay-kanji-strokes" disabled>↺ もう一度</button>
            <button type="button" class="primary-button" data-action="close-kanji-list-detail">一覧に戻る</button>
          </div>
          <p class="kanji-stroke-source">
            書き順データ：<a href="https://kanjivg.tagaini.net/" target="_blank" rel="noopener noreferrer">KanjiVG</a>（CC BY-SA 3.0）
          </p>
        </section>

        <section class="kanji-detail-hero" aria-labelledby="kanji-detail-title">
          <span class="kanji-detail-character" aria-hidden="true">${row.character}</span>
          <div>
            <p class="eyebrow">${stage.label}${["exam", "quiz-master"].includes(stage.id) ? "・発展" : ""}</p>
            <h2 id="kanji-detail-title">「${row.character}」を学ぼう</h2>
            <p>${row.strokes ? `${row.strokes}画` : "画数を確認中"} ・ 主な読み「${escapeHtml(row.primaryReading)}」</p>
          </div>
        </section>

        <section class="kanji-detail-card" aria-labelledby="kanji-readings-title">
          <div class="kanji-detail-section-heading">
            <span aria-hidden="true">読</span>
            <div><p class="eyebrow">READINGS</p><h2 id="kanji-readings-title">読み方</h2></div>
          </div>
          <div class="kanji-detail-reading-chips">
            ${readings.map((reading, index) => `
              <span class="${index === 0 ? "primary" : ""}">${escapeHtml(reading)}</span>
            `).join("")}
          </div>
          <p class="kanji-detail-help">最初の色付き表示は、このアプリで最初に覚える代表的な読み方です。</p>
        </section>

        <section class="kanji-detail-card" aria-labelledby="kanji-examples-title">
          <div class="kanji-detail-section-heading">
            <span aria-hidden="true">例</span>
            <div><p class="eyebrow">WORDS &amp; USAGE</p><h2 id="kanji-examples-title">ことば・活用事例</h2></div>
          </div>
          <div class="kanji-usage-list">
            ${examples.length ? examples.map((example) => `
              <article>
                <div><b>${escapeHtml(example.word)}</b>${example.reading ? `<span>${escapeHtml(example.reading)}</span>` : ""}</div>
                <p>${escapeHtml(example.meaning)}</p>
              </article>
            `).join("") : `
              <article><div><b>${row.character}</b><span>${escapeHtml(row.primaryReading)}</span></div><p>この漢字を使う言葉を学習問題の中でも探してみましょう。</p></article>
            `}
          </div>
        </section>
      </div>
    `;
  }

  function kanjiListTemplate() {
    const stage =
      KANJI_LIST_STAGES.find((item) => item.id === state.kanjiListStageId) ||
      KANJI_LIST_STAGES[0];
    const selectedRow = stage.rows.find(
      (row) => row.character === state.kanjiListSelectedCharacter,
    );
    if (selectedRow) return kanjiListDetailTemplate(selectedRow, stage);
    const middleSchoolStage = stage.id.startsWith("j");
    const examStage = stage.id === "exam";
    const quizMasterStage = stage.id === "quiz-master";
    return `
      <div class="screen sub-screen kanji-list-screen">
        <header class="sub-header kanji-list-header">
          <button class="round-button" type="button" data-view="home" aria-label="ホームへ戻る">‹</button>
          <div>
            <p class="eyebrow">KANJI BY GRADE</p>
            <h1>学年別漢字一覧</h1>
          </div>
        </header>

        <section class="kanji-list-intro">
          <span aria-hidden="true">字</span>
          <div>
            <b>漢字を押して、読み方・使い方・書き順を学習</b>
            <p>学年を選び、気になる漢字をタップしてください。</p>
          </div>
        </section>

        <div class="kanji-grade-tabs" role="tablist" aria-label="表示する学年">
          ${KANJI_LIST_STAGES.map((item) => `
            <button
              type="button"
              role="tab"
              aria-selected="${item.id === stage.id}"
              class="${item.id === stage.id ? "active" : ""}"
              data-kanji-list-stage="${item.id}"
            >${item.label}${item.id.startsWith("j") ? "目安" : ""}<small>${item.rows.length}字</small></button>
          `).join("")}
        </div>

        <section class="kanji-list-panel" aria-labelledby="kanji-list-title">
          <div class="kanji-list-panel-heading" id="kanji-list-heading">
            <div>
              <p class="eyebrow">${quizMasterStage ? "高校卒業後のクイズ番組級" : examStage ? "中学受験で差がつく発展漢字" : middleSchoolStage ? "中学校で学ぶ常用漢字" : "学年別漢字配当表"}</p>
              <h2 id="kanji-list-title">${quizMasterStage ? "漢字王・難問漢字" : examStage ? "お受験・発展漢字" : `${stage.label}${middleSchoolStage ? "目安" : "で習う漢字"}`}</h2>
            </div>
            <strong>${stage.rows.length}<small>字</small></strong>
          </div>
          <p class="kanji-list-source-note">
            ${quizMasterStage
              ? "高校までの範囲を超えた難読語を中心に、「魑魅魍魎」「躊躇」「鸚鵡」などで使う難字と、画数・使用頻度から選んだ常用漢字を集めた最難関一覧です。"
              : examStage
              ? "小学6年までの範囲を終えた人向けに、中学受験レベルの四字熟語で使われる漢字を集めたアプリ独自の発展一覧です。"
              : middleSchoolStage
              ? "中学校では学年別の公的な配当がないため、小学校配当外の常用漢字を、このアプリの学習順に3段階へ分けています。"
              : "文部科学省の学年別漢字配当表に沿った一覧です。"
            }
          </p>
          <div class="kanji-index-grid">
            ${stage.rows.map((row) => `
              <button type="button" class="kanji-index-item" data-kanji-detail="${escapeHtml(row.character)}" aria-label="${row.character}、${escapeHtml(row.primaryReading)}。詳しく学ぶ">
                <b>${row.character}</b>
                <span>${escapeHtml(row.primaryReading)}</span>
                <i aria-hidden="true">›</i>
              </button>
            `).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function subjectCard(mode, icon, name, detail, cardClass, iconClass) {
    const skill = activeSkill(mode);
    const subjectDetail = ["read", "write"].includes(mode) && skill.level <= 96
      ? curriculumProgressText(skill.level)
      : detail;
    return `
      <button type="button" class="subject-card ${cardClass}" data-start="${mode}">
        <span class="subject-icon ${iconClass}">${icon}</span>
        <span class="subject-time">約${mode === "flash" ? 2 : 3}分</span>
        <span class="subject-level-chip">Lv.${skill.level} ・ ${gradeForLevel(skill.level)}</span>
        <span class="subject-name">${name}</span>
        <span class="subject-detail">${state.counts[mode]}問 ・ ${subjectDetail}</span>
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
    return (
      memoryCards.find((card) => card.id === id) ||
      mikkunCards.find((card) => card.id === id) ||
      null
    );
  }

  function learningCardArt(id, className = "") {
    const card = learningCardById(id);
    if (!card) return `<span class="learning-card-fallback ${className}">${escapeHtml(id)}</span>`;
    return `
      <span
        class="learning-card-art ${card.sheet === "extra" ? "learning-card-art-extra" : ""} ${card.sheet === "adventure" ? "learning-card-art-adventure" : ""} ${card.sheet === "mikkun" ? "learning-card-art-mikkun" : ""} ${className}"
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
    playStartSound();
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
    const mikkunMission = usePreschoolMenu
      ? mikkunMissionFor(
          safePreschoolType,
          Date.now() + skill.level + skill.xp + state.streak,
        )
      : null;
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
      mikkunRewards: [],
      mikkunMission,
      mikkunCombo: 0,
      mikkunBestCombo: 0,
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
    if (usePreschoolMenu && safePreschoolType === "lights") {
      window.setTimeout(startMikkunLightSequence, 320);
    }
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
      const mission = state.session.mikkunMission;
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
        ${mission ? `
          <div class="mikkun-session-mission">
            <span aria-hidden="true">${mission.icon}</span>
            <p><small>ひみつミッション</small><b>${mission.title}</b></p>
            ${state.session.mikkunCombo >= 2 ? `<em>${state.session.mikkunCombo}れんぞく！</em>` : ""}
          </div>
        ` : ""}
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

  function kanjiCharactersForProblem(problem) {
    const source = String(
      problem?.strokeCharacters || problem?.idiom || problem?.kanji || "",
    );
    return [...new Set(Array.from(source).filter((character) => /\p{Script=Han}/u.test(character)))];
  }

  function meaningForProblem(problem) {
    if (problem?.meaning) return problem.meaning;
    const word = String(problem?.idiom || problem?.kanji || "このことば");
    return `「${word}」が表す内容や使い方を、読みといっしょに覚えよう。`;
  }

  function answerStudyTemplate(problem) {
    if (!state.readingChecked || state.session?.preschool) return "";
    const characters = kanjiCharactersForProblem(problem);
    return `
      <section class="answer-study-card ${problem?.kind === "curriculum" ? "curriculum-study-card" : ""}" aria-label="答えの解説">
        <span class="answer-study-label">${problem?.kind === "curriculum" ? "この漢字の学習ポイント" : "ことばの意味"}</span>
        <p>${escapeHtml(meaningForProblem(problem))}</p>
        ${characters.length
          ? `
            <div class="stroke-choice-row">
              <span>書き順を見る</span>
              <div>
                ${characters.map((character) => `
                  <button type="button" class="stroke-choice-button" data-action="open-stroke-order" data-kanji="${character}">
                    <b>${character}</b><small>書き順</small>
                  </button>
                `).join("")}
              </div>
            </div>
          `
          : ""
        }
      </section>
    `;
  }

  function curriculumLessonBadge(problem) {
    if (problem?.kind !== "curriculum") return "";
    return `<span class="curriculum-progress-pill">${escapeHtml(problem.curriculumProgress)}</span>`;
  }

  function scrollToAnswerReview() {
    window.setTimeout(() => {
      const target =
        document.querySelector(".reading-feedback-slot") ||
        document.querySelector(".answer-study-card");
      if (!target) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 60);
  }

  function scrollToMemoryReview() {
    window.setTimeout(() => {
      const target =
        document.querySelector(".memory-answer-comparison") ||
        document.querySelector(".memory-correct-review") ||
        document.querySelector(".memory-answer-stage .reading-feedback-slot");
      if (!target) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 80);
  }

  function scrollToFlashReview() {
    window.setTimeout(() => {
      const target = document.querySelector(".flash-sequence-review");
      if (!target) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 80);
  }

  function scrollToMikkunReview(showCelebration = false, showNextButton = false) {
    window.setTimeout(() => {
      const target = showNextButton
        ? document.querySelector(".mikkun-adventure-lesson .answer-next-button")
        : document.querySelector(".mikkun-adventure-lesson .reading-feedback-slot");
      if (!target) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: showNextButton ? "end" : "center",
      });
    }, showCelebration ? 820 : 120);
  }

  function scrollToMikkunRouteControls() {
    window.setTimeout(() => {
      const target = document.querySelector(".mikkun-route-controls");
      if (!target) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
      const rect = target.getBoundingClientRect();
      const safeMargin = 18;
      const fullyVisible =
        rect.top >= viewportTop + safeMargin &&
        rect.bottom <= viewportBottom - safeMargin;
      if (fullyVisible) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 100);
  }

  function writeTemplate() {
    const problem = currentSessionProblem();
    const preschool = state.session?.preschool;
    if (preschool) return mikkunAdventureTemplate();
    if (state.kanjiDemoOpen) return kanjiStrokeReviewTemplate(problem);
    const choices = state.readingChoices.length ? state.readingChoices : problem.choices;
    const correct = state.readingChecked && state.readingChoice === problem.answer;
    const curriculum = problem.kind === "curriculum";
    const curriculumWord = curriculum && problem.questionType === "word";
    const answerLabel = curriculum
      ? `${problem.idiom}（${problem.reading}）`
      : `${problem.idiom}（${problem.reading}）`;
    const feedback = state.readingChecked
      ? correct
        ? `<div class="reading-feedback correct"><b>正解！</b> ${praiseForCurrentQuestion()} ${answerLabel}</div>`
        : `<div class="reading-feedback wrong"><b>おしい！</b> 正解は「${problem.answer}」。<br />${answerLabel}</div>`
      : "";
    return `
      <div class="screen lesson-screen kanji-lesson idiom-choice-lesson">
        ${lessonHeader("漢字を選ぶ")}
        ${lessonLevelRow(curriculumLessonBadge(problem))}
        <section class="idiom-prompt">
          <p class="eyebrow">${curriculum ? `${problem.curriculumLabel}で習う漢字` : "□に入る漢字を選ぼう"}</p>
          <h1>${curriculum
            ? curriculumWord
              ? "熟語を完成させよう"
              : `「${problem.reading}」と読む漢字は？`
            : "四字熟語を完成させよう"
          }</h1>
          <div class="idiom-card ${curriculum ? `curriculum-idiom-card kanji-count-${Math.min(4, Array.from(problem.masked).length)}` : ""}" aria-label="${problem.masked}">
            ${Array.from(problem.masked).map((character) => `
              <span class="${character === "□" ? "blank" : ""}">${character}</span>
            `).join("")}
          </div>
          <p class="idiom-hint">${curriculum
            ? curriculumWord
              ? `「${problem.reading}」になる漢字を選ぼう`
              : "同じ学年で習う漢字から選ぼう"
            : problem.hiddenCount > 1
              ? `${problem.hiddenCount}文字を順番どおり選んでね`
              : "入る漢字はどれかな？"
          }</p>
        </section>
        <div class="reading-options idiom-options">
          ${choices.map((choice) => {
            const selected = state.readingChoice === choice;
            const rightChoice = state.readingChecked && choice === problem.answer;
            const wrongChoice = state.readingChecked && selected && choice !== problem.answer;
            return `
              <button type="button" data-reading="${choice}" class="${selected ? "selected" : ""} ${rightChoice ? "correct" : ""} ${wrongChoice ? "wrong" : ""}" ${state.readingChecked ? "disabled" : ""}>
                <span>${choice}</span><i>${rightChoice ? "✓" : wrongChoice ? "×" : "›"}</i>
              </button>
            `;
          }).join("")}
        </div>
        <div class="reading-feedback-slot">${feedback}</div>
        ${answerStudyTemplate(problem)}
        ${state.readingChecked
          ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-reading">結果を確認したら次へ →</button>'
          : '<p class="choice-note">答えをひとつ選んでね</p>'
        }
      </div>
    `;
  }

  function kanjiStrokeReviewTemplate(problem) {
    const character = state.strokeKanji || kanjiCharactersForProblem(problem)[0] || "字";
    return `
      <div class="screen lesson-screen kanji-lesson kanji-stroke-review">
        ${lessonHeader(currentLessonLabel())}
        ${lessonLevelRow('<span class="timer stroke-order-pill">● 書き順</span>')}
        <section class="prompt-area">
          <p class="eyebrow">お手本の動きを見よう</p>
          <h1>「${character}」を<br />一画ずつ確認</h1>
          <p class="word-example">結果はそのまま残っています。確認後に戻って「次へ」を押せます。</p>
        </section>
        <section class="kanji-stroke-stage" id="kanjiStrokeStage" aria-live="polite">
          <div class="kanji-stroke-loading" id="kanjiStrokeLoading">
            <span aria-hidden="true">${character}</span>
            <p id="kanjiStrokeLoadingText">書き順を準備しています…</p>
          </div>
          <svg
            id="kanjiStrokeSvg"
            viewBox="0 0 109 109"
            role="img"
            aria-label="${character}の書き順アニメーション"
            hidden
          ></svg>
        </section>
        <div class="kanji-stroke-status kanji-stroke-status-below" id="kanjiStrokeStatus" role="status" aria-live="polite">準備中</div>
        <div class="kanji-stroke-actions">
          <button type="button" class="secondary-button" id="kanjiStrokeReplay" data-action="replay-kanji-strokes" disabled>
            ↺ もう一度
          </button>
          <button type="button" class="primary-button" data-action="close-stroke-order">
            結果に戻る
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
    let pageScrollLocked = false;
    const preventPageScroll = (event) => {
      if (event.cancelable) event.preventDefault();
    };
    const lockPageScroll = () => {
      if (pageScrollLocked) return;
      pageScrollLocked = true;
      document.documentElement.classList.add("is-writing");
      document.addEventListener("touchmove", preventPageScroll, {
        passive: false,
        capture: true,
      });
    };
    const unlockPageScroll = () => {
      if (!pageScrollLocked) return;
      pageScrollLocked = false;
      document.documentElement.classList.remove("is-writing");
      document.removeEventListener("touchmove", preventPageScroll, true);
    };
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
        if (event.pointerType !== "mouse") lockPageScroll();
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
      unlockPageScroll();
    };
    canvas.addEventListener("pointerup", stop, { passive: false });
    canvas.addEventListener("pointercancel", stop, { passive: false });
    canvas.addEventListener("lostpointercapture", stop, { passive: false });
    const preventCanvasScroll = (event) => event.preventDefault();
    canvas.addEventListener("touchstart", preventCanvasScroll, { passive: false });
    canvas.addEventListener("touchmove", preventCanvasScroll, { passive: false });
  }

  async function setupKanjiStrokeDemo() {
    const character = state.strokeKanji;
    const stage = document.querySelector("#kanjiStrokeStage");
    if (!character || !stage || !state.kanjiDemoOpen) return;
    stopKanjiStrokeAnimation();
    const requestToken = kanjiStrokeRunToken;
    try {
      const paths = await loadKanjiStrokePaths(character, requestToken);
      if (
        requestToken !== kanjiStrokeRunToken ||
        !state.kanjiDemoOpen ||
        !["write", "read", "kanji-list"].includes(state.view)
      ) {
        return;
      }
      buildKanjiStrokeAnimation(paths);
    } catch {
      if (
        requestToken !== kanjiStrokeRunToken ||
        !state.kanjiDemoOpen ||
        !["write", "read", "kanji-list"].includes(state.view)
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
      if (status) {
        status.textContent = state.view === "kanji-list"
          ? "一覧へ戻ることはできます"
          : "「結果に戻る」はそのまま押せます";
      }
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
    svg.append(guideGroup, drawingGroup);
    // `hidden` is not reflected reliably by the `.hidden` property on SVGElement.
    // Remove the attribute itself so the `svg[hidden]` rule no longer collapses
    // the drawing area on Safari or Chromium.
    svg.removeAttribute("hidden");
    svg.style.display = "block";
    if (loading) loading.hidden = true;
    stage.classList.remove("has-error", "is-complete");
    if (replay) replay.disabled = false;
    startKanjiStrokeAnimation(drawingPaths);
  }

  async function startKanjiStrokeAnimation(drawingPaths) {
    cancelKanjiStrokeAnimations();
    const token = ++kanjiStrokeRunToken;
    const status = document.querySelector("#kanjiStrokeStatus");
    const stage = document.querySelector("#kanjiStrokeStage");
    stage?.classList.remove("is-complete");
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
      path.classList.add("active");
      if (status) {
        status.textContent = `第 ${index + 1} 画 ／ ${drawingPaths.length}画`;
      }
      const duration = reducedMotion
        ? 20
        : Math.round(Math.max(520, Math.min(1050, length * 12)));
      await animateKanjiStroke(path, length, duration);
      if (token !== kanjiStrokeRunToken || !state.kanjiDemoOpen) return;
      path.style.strokeDashoffset = "0";
      path.classList.remove("active");
      path.classList.add("complete");
      if (!reducedMotion) await waitForKanjiStroke(220);
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

  function waitForKanjiStroke(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function replayKanjiStrokeAnimation() {
    const drawingPaths = [
      ...document.querySelectorAll("#kanjiStrokeSvg .kanji-stroke-drawing path"),
    ];
    if (!drawingPaths.length) {
      setupKanjiStrokeDemo();
      return;
    }
    startKanjiStrokeAnimation(drawingPaths);
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
    if (state.kanjiDemoOpen) return kanjiStrokeReviewTemplate(problem);
    const choices = state.readingChoices.length ? state.readingChoices : problem.choices;
    const curriculum = problem.kind === "curriculum";
    const feedback = state.readingChecked
      ? state.readingChoice === problem.answer
        ? `<div class="reading-feedback correct"><b>${preschool ? "はなまる！" : "正解！"}</b> ${preschool ? "" : praiseForCurrentQuestion()} ${problem.kanji}（${problem.answer}）</div>`
        : `<div class="reading-feedback wrong"><b>おしい！</b> 正解は「${problem.answer}」です。<br />${problem.kanji}（${problem.answer}）</div>`
      : "";
    return `
      <div class="screen lesson-screen reading-lesson">
        ${lessonHeader(preschool ? "どうぶつの なまえ" : "漢字を読む")}
        ${lessonLevelRow(curriculumLessonBadge(problem))}
        <section class="reading-prompt">
          <p class="eyebrow">${preschool
            ? "この どうぶつは なあに？"
            : curriculum && problem.questionType === "character"
              ? `${problem.curriculumLabel}で習う漢字・なんて読む？`
              : "この熟語、なんて読む？"
          }</p>
          <div class="reading-card compound-reading-card"><span>${problem.kanji}</span></div>
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
        ${answerStudyTemplate(problem)}
        ${state.readingChecked
          ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-reading">結果を確認したら次へ →</button>'
          : '<p class="choice-note">読み方をひとつ選んでね</p>'
        }
      </div>
    `;
  }

  function mikkunBuildDisplay(correct) {
    const collectedParts = Array.isArray(state.session?.mikkunRewards)
      ? state.session.mikkunRewards.slice(0, state.session.total)
      : [];
    const latestPart = learningCardById(collectedParts.at(-1));
    return `
      <div class="mikkun-build-scene ${correct ? "is-powered" : ""}">
        <div class="mikkun-build-robot">
          ${learningCardArt("dadandandan", "mikkun-build-robot-art")}
          <span class="mikkun-build-spark">★</span>
        </div>
        <div class="mikkun-build-parts" aria-label="集めたパーツ ${collectedParts.length}個">
          ${Array.from({ length: state.session.total }, (_, index) => `
            <span class="${collectedParts[index] ? "filled" : ""}">
              ${collectedParts[index]
                ? learningCardArt(collectedParts[index], "mikkun-collected-part-art")
                : '<i aria-hidden="true">＋</i>'
              }
            </span>
          `).join("")}
        </div>
        <b>ゲットした え ${collectedParts.length} / ${state.session.total}</b>
        <small>${latestPart ? `「${latestPart.label}」を つけたよ！` : "ぴったりの えを えらぼう"}</small>
      </div>
    `;
  }

  function mikkunRouteLayout(problem) {
    const stageRank = mikkunStage(state.session?.levelAtStart || 1).rank;
    const columns = stageRank >= 2 ? 5 : 4;
    const rows = 4;
    const path = [];
    const add = (x, y) => path.push(y * columns + x);
    if (problem.route === "left") {
      for (let x = columns - 1; x >= 0; x -= 1) add(x, rows - 1);
      for (let y = rows - 2; y >= 0; y -= 1) add(0, y);
    } else if (problem.route === "up") {
      for (let y = rows - 1; y >= 0; y -= 1) add(0, y);
      for (let x = 1; x < columns; x += 1) add(x, 0);
    } else if (problem.route === "down") {
      for (let y = 0; y < rows; y += 1) add(0, y);
      for (let x = 1; x < columns; x += 1) add(x, rows - 1);
    } else {
      for (let x = 0; x < columns; x += 1) add(x, rows - 1);
      for (let y = rows - 2; y >= 0; y -= 1) add(columns - 1, y);
    }
    const pathSet = new Set(path);
    const candidates = Array.from({ length: columns * rows }, (_, index) => index)
      .filter((index) => !pathSet.has(index));
    const seed = Array.from(String(problem.display || problem.prompt || ""))
      .reduce((total, character) => total + character.codePointAt(0), 0);
    const orderedCandidates = [...candidates].sort(
      (left, right) => ((left * 17 + seed) % 101) - ((right * 17 + seed) % 101),
    );
    const obstacleCount = columns === 4 ? 3 : 5;
    const obstacleSymbols = ["🪨", "🌲", "🌊", "🪵", "🌳"];
    const obstacles = new Map(
      orderedCandidates
        .slice(0, obstacleCount)
        .map((cell, index) => [cell, obstacleSymbols[(seed + index) % obstacleSymbols.length]]),
    );
    return { columns, rows, path, pathSet, obstacles };
  }

  const MIKKUN_ROUTE_DIRECTIONS = {
    up: { symbol: "↑", label: "うえ" },
    left: { symbol: "←", label: "ひだり" },
    right: { symbol: "→", label: "みぎ" },
    down: { symbol: "↓", label: "した" },
  };

  function mikkunRouteDirection(layout, step) {
    const currentCell = layout.path[step];
    const nextCell = layout.path[step + 1];
    if (!Number.isInteger(currentCell) || !Number.isInteger(nextCell)) return "";
    const difference = nextCell - currentCell;
    if (difference === 1) return "right";
    if (difference === -1) return "left";
    if (difference === layout.columns) return "down";
    if (difference === -layout.columns) return "up";
    return "";
  }

  function mikkunRouteControlsTemplate() {
    return `
      <div class="mikkun-route-controls" aria-label="だんだんだんを動かす矢印">
        ${Object.entries(MIKKUN_ROUTE_DIRECTIONS).map(([direction, item]) => `
          <button type="button" class="route-${direction}" data-route-move="${direction}" aria-label="${item.label}へ進む">
            <b aria-hidden="true">${item.symbol}</b>
            <small>${item.label}</small>
          </button>
        `).join("")}
        <span class="mikkun-route-control-center" aria-hidden="true">★</span>
      </div>
    `;
  }

  function mikkunRouteDisplay(problem) {
    const layout = mikkunRouteLayout(problem);
    const finalStep = layout.path.length - 1;
    const currentStep = Math.max(0, Math.min(finalStep, state.mikkunRouteStep));
    const currentCell = layout.path[currentStep];
    const goalCell = layout.path.at(-1);
    const reachedGoal = currentStep >= finalStep;
    return `
      <div class="mikkun-route-game">
        <div
          class="mikkun-route-board mikkun-route-map-${layout.columns}"
          style="--route-columns:${layout.columns}"
          aria-label="${layout.columns * layout.rows}マスの障害物マップ"
        >
          ${Array.from({ length: layout.columns * layout.rows }, (_, cell) => {
            const isPath = layout.pathSet.has(cell);
            const obstacle = layout.obstacles.get(cell);
            const pathPosition = layout.path.indexOf(cell);
            const traveled = pathPosition >= 0 && pathPosition < currentStep;
            return `
              <span class="mikkun-map-cell ${isPath ? "is-path" : ""} ${traveled ? "is-traveled" : ""} ${cell === currentCell ? "is-current" : ""} ${obstacle ? "has-obstacle" : ""}">
                ${cell === currentCell
                  ? `<span class="mikkun-map-robot route-${state.mikkunRouteLastMove || problem.route || "right"} ${state.mikkunRouteLastMove ? "is-stepping" : ""} ${state.mikkunRouteBumped ? "is-bumped" : ""}">${learningCardArt("dadandandan", "mikkun-map-robot-art")}</span>${reachedGoal ? '<span class="mikkun-map-arrival-star" aria-hidden="true">★</span>' : ""}`
                  : cell === goalCell
                    ? '<span class="mikkun-map-goal" aria-label="おたから">🎁</span>'
                    : obstacle
                      ? `<span class="mikkun-map-obstacle" aria-hidden="true">${obstacle}</span>`
                      : isPath
                        ? '<i aria-hidden="true">•</i>'
                        : ""
                }
              </span>
            `;
          }).join("")}
        </div>
        <div class="mikkun-route-caption">
          <b>${layout.columns * layout.rows}マスの メカマップ</b>
          <span>${reachedGoal ? "おたからに とうちゃく！" : `すすんだ ${currentStep} / ${finalStep}マス`}</span>
        </div>
        <div class="mikkun-route-progress" aria-label="${finalStep}マス中${currentStep}マス進みました">
          <i style="--route-progress:${finalStep ? currentStep / finalStep : 1}"></i>
        </div>
      </div>
    `;
  }

  function handleMikkunRouteMove(direction) {
    const session = state.session;
    const problem = currentSessionProblem();
    if (
      !session?.preschool ||
      problem?.missionType !== "route" ||
      state.readingChecked ||
      !MIKKUN_ROUTE_DIRECTIONS[direction]
    ) return;

    const layout = mikkunRouteLayout(problem);
    const finalStep = layout.path.length - 1;
    const currentStep = Math.max(0, Math.min(finalStep, state.mikkunRouteStep));
    const neededDirection = mikkunRouteDirection(layout, currentStep);
    if (direction !== neededDirection) {
      state.mikkunRouteLastMove = "";
      state.mikkunRouteBumped = true;
      state.mikkunRouteMessage = "そっちは とおれないよ。きいろい みちを みてね！";
      playTapSound();
      render();
      return;
    }

    state.mikkunRouteStep = currentStep + 1;
    state.mikkunRouteLastMove = direction;
    state.mikkunRouteBumped = false;
    const remaining = finalStep - state.mikkunRouteStep;
    if (remaining > 0) {
      state.mikkunRouteMessage = `すすんだ！ おたからまで あと ${remaining}マス`;
      playTapSound();
      render();
      return;
    }

    state.mikkunRouteMessage = "おたからに とうちゃく！";
    state.readingChoice = problem.answer;
    state.readingChecked = true;
    session.attempts += 1;
    session.correct += 1;
    session.mikkunCombo = Number(session.mikkunCombo || 0) + 1;
    session.mikkunBestCombo = Math.max(
      Number(session.mikkunBestCombo || 0),
      session.mikkunCombo,
    );
    if (!Array.isArray(session.mikkunRewards)) session.mikkunRewards = [];
    session.mikkunRewards.push("dadandandan");
    playCorrectSound();
    earnXp(MODE_INFO[session.mode].xp);
    render();
    scrollToMikkunReview(true, true);
  }

  function mikkunLightRecallDisplay() {
    return `
      <div class="mikkun-light-recall">
        <span>？</span>
        <b>さいごに ひかった えは？</b>
      </div>
    `;
  }

  function mikkunAdventureDisplay(problem, correct = false) {
    if (problem.missionType === "build") return mikkunBuildDisplay(correct);
    if (problem.missionType === "route") return mikkunRouteDisplay(problem, correct);
    if (problem.missionType === "lights") return mikkunLightRecallDisplay();
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
    if (problem.displayCards) {
      return `
        <div class="mikkun-counting-scene mikkun-picture-counting">
          ${problem.displayCards.map((id) => learningCardArt(id, "mikkun-counting-card")).join("")}
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
    const lightMission = problem.missionType === "lights";
    const routeMission = problem.missionType === "route";
    if (lightMission && !state.readingChecked && state.memoryPhase !== "answer") {
      const visibleCard = state.memoryVisible?.id
        ? learningCardArt(state.memoryVisible.id, "mikkun-light-card-art")
        : '<span class="mikkun-light-off">●</span>';
      return `
        <div class="screen lesson-screen mikkun-adventure-lesson mikkun-light-lesson">
          ${lessonHeader(theme)}
          ${lessonLevelRow()}
          <section class="mikkun-light-mission" aria-live="polite">
            <p class="eyebrow">ピカッと ひかるよ！</p>
            <h1>さいごの えを<br />おぼえてね</h1>
            <div class="mikkun-light-machine">
              <span class="mikkun-light-glow" aria-hidden="true"></span>
              <div id="mikkunLightSlot">${visibleCard}</div>
            </div>
            <div class="mikkun-light-progress" id="mikkunLightProgress">
              ${problem.lightSequence.map((_, index) => `<i class="${index === 0 && state.memoryPhase === "showing" ? "active" : ""}"></i>`).join("")}
            </div>
            <small>${state.memoryPhase === "showing" ? "よく みてね" : "まもなく ひかるよ"}</small>
          </section>
        </div>
      `;
    }
    const rewardLabel =
      problem.missionType === "build"
        ? "メカパーツ ゲット！"
        : problem.missionType === "route"
          ? "おたからに とうちゃく！"
          : problem.missionType === "treasure"
            ? "おたから ゲット！"
            : "ひかりパワー ゲット！";
    const comboLabel = state.session.mikkunCombo >= 2
      ? `<span class="mikkun-combo-pop">${state.session.mikkunCombo}れんぞく！</span>`
      : "";
    const feedback = state.readingChecked
      ? correct
        ? `<div class="reading-feedback correct mikkun-win"><b>せいかい！</b> ${rewardLabel}${comboLabel}</div>`
        : `<div class="reading-feedback wrong"><b>おしい！</b> こたえは「${problem.answerLabel || problem.answer}」。つぎは できるよ！</div>`
      : "";
    return `
      <div class="screen lesson-screen mikkun-choice-lesson mikkun-adventure-lesson">
        ${lessonHeader(theme)}
          ${lessonLevelRow()}
          <section class="reading-prompt mikkun-choice-prompt">
            <p class="eyebrow">ミッション ${currentNumber()}</p>
            <h1 class="mikkun-mission-question">${routeMission ? "やじるしで おたからまで すすめよう！" : problem.prompt || "どれかな？"}</h1>
            <div class="reading-card mikkun-choice-display">
              ${mikkunAdventureDisplay(problem, correct)}
            </div>
          </section>
        ${routeMission
          ? state.readingChecked ? "" : mikkunRouteControlsTemplate()
          : `
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
          `
        }
        ${routeMission && !state.readingChecked
          ? `<p class="mikkun-route-message ${state.mikkunRouteBumped ? "is-warning" : ""}" aria-live="polite">${state.mikkunRouteMessage || "やじるしは なんどでも おせるよ"}</p>`
          : ""
        }
        <div class="reading-feedback-slot">${feedback}</div>
        ${state.readingChecked
          ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-reading">つぎの ミッションへ →</button>'
          : routeMission ? "" : '<p class="choice-note">こたえを ひとつ タップしてね</p>'
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
        ? `<p class="result-message">おしい！ 正解は ${problem.answer} です。</p>`
        : state.mathResult === "correct"
          ? `<p class="result-message success">正解！ ${praiseForCurrentQuestion()}</p>`
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
            ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-math">結果を確認したら次へ →</button>'
            : `<button type="button" class="primary-button wide" data-action="submit-math" ${state.mathAnswer ? "" : "disabled"}>こたえる</button>`
          }
        </div>
      </div>
    `;
  }

  function timedBand(mode = state.session?.mode) {
    return bandForLevel(
      state.session?.levelAtStart ?? activeSkill(mode || "flash").level,
    );
  }

  function speedLabel(mode = state.session?.mode) {
    if (state.session?.preschool) return "ゆっくり";
    const band = timedBand(mode);
    if (band <= 2) return "ゆっくり";
    if (band <= 5) return "ふつう";
    if (band <= 7) return "やや速い";
    if (band <= 9) return "高速";
    return "天才スピード";
  }

  function flashCountdownDuration() {
    if (state.session?.preschool) return 2800;
    return [2700, 2600, 2500, 2400, 2300, 2200, 2000, 1800, 1600, 1400][timedBand("flash") - 1];
  }

  function memoryCountdownDuration(mode) {
    return [2600, 2500, 2400, 2300, 2200, 2100, 1950, 1800, 1600, 1400][timedBand(mode) - 1];
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
          ? `<p class="result-message">おしい！ 正解は ${total} です。出題された数字を確認しよう。</p>`
          : state.flashResult === "correct"
            ? `<p class="result-message success">正解！ ${praiseForCurrentQuestion()} 合計は ${total} です。</p>`
            : state.flashResult === "given-up"
              ? `<p class="result-message">答えは ${total} でした。</p>`
            : '<p class="result-message placeholder" aria-hidden="true">&nbsp;</p>';
      stage = `
        <div class="flash-answer-stage">
          <p class="eyebrow">ぜんぶでいくつ？</p>
          <h1>合計を答えよう</h1>
          <div class="answer-box ${state.flashResult}">${state.flashAnswer || "<span>?</span>"}</div>
          ${message}
          ${state.flashSequenceRevealed ? `
            <div class="flash-sequence-review" aria-label="出題された数字 ${state.flashSequence.join("、")}">
              <b>出題された数字</b>
              <div>
                ${state.flashSequence.map((number, index) => `
                  <span>${number}</span>${index < state.flashSequence.length - 1 ? '<i aria-hidden="true">＋</i>' : ""}
                `).join("")}
              </div>
            </div>
          ` : ""}
        </div>
        ${numberPad("flash")}
        ${["correct", "wrong", "given-up"].includes(state.flashResult)
          ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-flash">結果を確認したら次へ →</button>'
          : `<button type="button" class="primary-button wide" data-action="submit-flash" ${state.flashAnswer ? "" : "disabled"}>こたえる</button>`
        }
        ${["correct", "wrong", "given-up"].includes(state.flashResult)
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
        ${lessonLevelRow(`<span class="timer">● ${speedLabel("flash")}</span>`)}
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
          <p>${problem.sequence.length}枚の絵カードが順番に出ます。<br /><b>文字は出ないので、絵と順番を見てね。</b></p>
          <button type="button" class="primary-button wide" data-action="start-memory">カードを始める</button>
        </div>
      `;
    } else if (state.memoryPhase === "countdown") {
      stage = `
        <div class="flash-countdown" aria-live="polite">
          <p>もうすぐ はじまります</p>
          <div class="flash-countdown-bar memory-countdown-bar" style="--countdown-duration:${memoryCountdownDuration("memory")}ms">
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
            <div class="memory-card-visual" id="memoryFlashCardVisual">
              ${state.memoryVisible
                ? learningCardArt(state.memoryVisible.id, "memory-main-card-art memory-card-pop")
                : '<strong class="memory-card-placeholder">★</strong>'
              }
            </div>
            <small>絵だけをおぼえよう</small>
          </div>
        </div>
      `;
    } else {
      const correct = state.memoryChecked && state.memoryResult === "correct";
      const selectedCards = state.memorySelected
        .map((id) => learningCardById(id))
        .filter(Boolean);
      const reviewCards = (cards, compareWithAnswer = false) => cards.map((card, index) => {
        const matches = !compareWithAnswer || card.id === problem.sequence[index]?.id;
        return `
          <span class="${matches ? "is-match" : "is-mismatch"}">
            <small>${index + 1}</small>
            ${learningCardArt(card.id, "memory-order-card-art")}
            <em>${card.label}</em>
          </span>
        `;
      }).join("");
      const feedback = state.memoryChecked
        ? correct
          ? `<div class="reading-feedback correct"><b>正解！</b> ${praiseForCurrentQuestion()} 順番まで覚えられました。</div>`
          : '<div class="reading-feedback wrong"><b>おしい！</b> 2段のカードを見比べて確認しよう。</div>'
        : "";
      stage = `
        <div class="memory-answer-stage">
          <p class="eyebrow">どの順番だった？</p>
          <h1>出てきた順にタップしよう</h1>
          ${state.memoryChecked
            ? correct
              ? `
                <div class="memory-answer-comparison" aria-label="正解した順番">
                  <section class="memory-review-row correct-answer">
                    <b>あなたの順番（正解）</b>
                    <div style="--memory-review-count:${selectedCards.length}">${reviewCards(selectedCards)}</div>
                  </section>
                </div>
              `
              : `
                <div class="memory-answer-comparison" aria-label="あなたの順番と正しい順番">
                  <section class="memory-review-row user-answer">
                    <b>あなたが入れた順番</b>
                    <div style="--memory-review-count:${selectedCards.length}">${reviewCards(selectedCards, true)}</div>
                  </section>
                  <section class="memory-review-row correct-answer">
                    <b>正しい順番</b>
                    <div style="--memory-review-count:${problem.sequence.length}">${reviewCards(problem.sequence)}</div>
                  </section>
                </div>
              `
            : `
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
                    <button type="button" data-memory-order="${card.id}" class="${selected ? "selected" : ""}" ${selected ? "disabled" : ""}>
                      ${learningCardArt(card.id, "memory-choice-card-art")}<span class="visually-hidden">${card.label}</span>
                    </button>
                  `;
                }).join("")}
              </div>
              ${state.memorySelected.length
                ? '<button type="button" class="memory-undo-button" data-action="undo-memory">ひとつ戻す</button>'
                : ""
              }
            `
          }
          <div class="reading-feedback-slot">${feedback}</div>
          ${state.memoryChecked
            ? '<button type="button" class="primary-button wide answer-next-button" data-action="next-memory">答え合わせを見たら次へ →</button>'
            : `<p class="choice-note">${state.memorySelected.length} / ${problem.sequence.length}枚選択</p>`
          }
        </div>
      `;
    }
    return `
      <div class="screen lesson-screen memory-lesson">
        ${lessonHeader("フラッシュカード")}
        ${lessonLevelRow(`<span class="timer">● ${speedLabel("memory")}</span>`)}
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
          <div class="flash-countdown-bar digits-countdown-bar" style="--countdown-duration:${memoryCountdownDuration("digits")}ms">
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
            ? `<p class="result-message success">正解！ ${praiseForCurrentQuestion()} 順番まで覚えられました。</p>`
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
              : '<button type="button" class="primary-button wide answer-next-button" data-action="next-digits">結果を確認したら次へ →</button>'
            }
          </div>
        </div>
      `;
    }
    return `
      <div class="screen lesson-screen digits-lesson">
        ${lessonHeader("数字記憶")}
        ${lessonLevelRow(`<span class="timer">● ${speedLabel("digits")}</span>`)}
        <section class="memory-stage digits-stage ${state.digitsPhase === "answer" ? "is-answering" : ""}">${stage}</section>
      </div>
    `;
  }

  function numberPad(target) {
    const locked =
      (target === "math" && state.mathResult !== "idle") ||
      (target === "flash" && ["correct", "wrong", "given-up"].includes(state.flashResult)) ||
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
      state.flashSequenceRevealed = false;
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
    state.flashSequenceRevealed = false;
  }

  function startFlashSequence() {
    stopFlash();
    playStartSound();
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
    const band = timedBand("flash");
    const numberDelay = state.session?.preschool
      ? 1100
      : [1100, 1000, 920, 850, 780, 720, 660, 600, 540, 460][band - 1];
    const separatorDelay = state.session?.preschool
      ? 360
      : [350, 320, 295, 270, 245, 220, 195, 170, 150, 130][band - 1];
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
    playStartSound();
    const token = ++state.memoryRunToken;
    state.memoryPhase = "countdown";
    render();
    state.memoryTimer = window.setTimeout(() => {
      if (token !== state.memoryRunToken || state.view !== "memory") return;
      state.memoryPhase = "showing";
      state.memoryVisible = null;
      render();
      runMemoryCards(token);
    }, memoryCountdownDuration("memory"));
  }

  function runMemoryCards(token) {
    const problem = currentSessionProblem();
    let index = 0;
    let nextFrameAt = performance.now();
    const step = () => {
      if (token !== state.memoryRunToken || state.view !== "memory") return;
      if (index < problem.sequence.length) {
        state.memoryVisible = problem.sequence[index];
        index += 1;
        const cardSlot = document.querySelector("#memoryFlashCardVisual");
        if (cardSlot) {
          cardSlot.innerHTML = learningCardArt(
            state.memoryVisible.id,
            "memory-main-card-art memory-card-pop",
          );
        } else {
          render();
        }
        nextFrameAt += problem.delay;
        state.memoryTimer = window.setTimeout(
          step,
          Math.max(16, nextFrameAt - performance.now()),
        );
        return;
      }
      state.memoryVisible = null;
      state.memoryPhase = "answer";
      render();
    };
    step();
  }

  function startMikkunLightSequence() {
    if (
      state.session?.preschoolType !== "lights" ||
      state.view !== "memory" ||
      state.readingChecked
    ) {
      return;
    }
    stopMemory();
    const token = ++state.memoryRunToken;
    state.memoryPhase = "showing";
    state.memoryVisible = null;
    render();
    state.memoryTimer = window.setTimeout(
      () => runMikkunLightCards(token),
      420,
    );
  }

  function runMikkunLightCards(token) {
    const problem = currentSessionProblem();
    const sequence = problem?.lightSequence || [];
    let index = 0;
    const showNext = () => {
      if (
        token !== state.memoryRunToken ||
        state.view !== "memory" ||
        state.session?.preschoolType !== "lights"
      ) {
        return;
      }
      if (index >= sequence.length) {
        state.memoryVisible = null;
        state.memoryPhase = "answer";
        render();
        return;
      }
      const card = learningCardById(sequence[index]);
      state.memoryVisible = card;
      const slot = document.querySelector("#mikkunLightSlot");
      const dots = [...document.querySelectorAll("#mikkunLightProgress i")];
      if (slot && card) {
        slot.innerHTML = learningCardArt(
          card.id,
          "mikkun-light-card-art mikkun-light-pop",
        );
      } else {
        render();
      }
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      index += 1;
      state.memoryTimer = window.setTimeout(() => {
        if (token !== state.memoryRunToken || state.view !== "memory") return;
        const currentSlot = document.querySelector("#mikkunLightSlot");
        if (currentSlot) currentSlot.innerHTML = '<span class="mikkun-light-off">●</span>';
        state.memoryTimer = window.setTimeout(showNext, 180);
      }, 690);
    };
    showNext();
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
    playStartSound();
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
    }, memoryCountdownDuration("digits"));
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
    if (problem.lightSequence) {
      return `${problem.lightSequence.join("-")}:${problem.answer}`;
    }
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
    if (mode === "write") return `${problem.idiom}:${problem.masked}:${problem.answer}`;
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

  function curriculumSourceStage(row) {
    return (
      KANJI_CURRICULUM_STAGES.find((stage) => stage.rows.includes(row)) || null
    );
  }

  function curriculumChoiceValues(target, pool, mode, useWord, harder) {
    const answer = mode === "write"
      ? target.character
      : useWord
        ? target.wordReading
        : target.primaryReading;
    const valueFor = (row) =>
      mode === "write"
        ? row.character
        : useWord
          ? row.wordReading
          : row.primaryReading;
    const scored = shuffled(pool)
      .filter((row) => row !== target && valueFor(row) && valueFor(row) !== answer)
      .filter(
        (row) =>
          mode !== "read" ||
          useWord ||
          !target.readings.includes(valueFor(row)),
      )
      .filter((row, index, rows) =>
        rows.findIndex((candidate) => valueFor(candidate) === valueFor(row)) === index,
      )
      .map((row) => {
        const reading = useWord ? row.wordReading : row.primaryReading;
        const targetReading = useWord ? target.wordReading : target.primaryReading;
        const score = mode === "write"
          ? Math.abs(row.strokes - target.strokes) * 2 +
            (row.primaryReading.length === target.primaryReading.length ? 0 : 1)
          : Math.abs(reading.length - targetReading.length) * 2 +
            Math.abs(row.strokes - target.strokes) / 4;
        return { row, score };
      });
    if (harder) scored.sort((left, right) => left.score - right.score);
    return [answer, ...scored.slice(0, 3).map(({ row }) => valueFor(row))];
  }

  function takeCurriculumRows(pool, count, recentSet, usedCharacters) {
    const fresh = shuffled(
      pool.filter(
        (row) =>
          !recentSet.has(row.character) && !usedCharacters.has(row.character),
      ),
    );
    const older = shuffled(
      pool.filter(
        (row) =>
          recentSet.has(row.character) && !usedCharacters.has(row.character),
      ),
    );
    return [...fresh, ...older].slice(0, count).filter((row) => {
      if (usedCharacters.has(row.character)) return false;
      usedCharacters.add(row.character);
      return true;
    });
  }

  function createCurriculumSessionProblems(mode, total, level) {
    const progress = curriculumProgressForLevel(
      level,
      Math.max(24, Number(total)),
    );
    if (!progress?.stage.rows.length) return [];
    const recentKey = `${state.learnerName}:curriculum:${mode}:${progress.stage.id}`;
    const recent = Array.isArray(state.recentProblems[recentKey])
      ? state.recentProblems[recentKey]
      : [];
    const recentSet = new Set(recent);
    const usedCharacters = new Set();
    const reviewCount = progress.previousRows.length
      ? Math.max(1, Math.round(Number(total) * 0.1))
      : 0;
    const currentCount = Math.max(0, Number(total) - reviewCount);
    const selectedRows = [
      ...takeCurriculumRows(
        progress.unlockedRows,
        currentCount,
        recentSet,
        usedCharacters,
      ),
      ...takeCurriculumRows(
        progress.previousRows,
        reviewCount,
        recentSet,
        usedCharacters,
      ),
    ];
    if (selectedRows.length < total) {
      selectedRows.push(
        ...takeCurriculumRows(
          progress.learnedRows,
          total - selectedRows.length,
          recentSet,
          usedCharacters,
        ),
      );
    }

    const learnedCharacterSet = new Set(
      progress.learnedRows.map((row) => row.character),
    );
    const wordRows = progress.learnedRows.filter(
      (row) =>
        row.word &&
        row.wordReading &&
        Array.from(row.word).every((character) => learnedCharacterSet.has(character)),
    );
    const compoundRate = progress.stage.grade === 8
      ? 0.38 + progress.ratio * 0.32
      : progress.stage.grade <= 2
        ? progress.ratio < 0.3
          ? 0.08
          : 0.16 + (progress.ratio - 0.3) * 0.35
        : progress.ratio < 0.2
          ? 0.1
          : 0.22 + (progress.ratio - 0.2) * 0.4;
    const seenCompoundWords = new Set();
    const compoundCandidates = shuffled(
      selectedRows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => wordRows.includes(row)),
    ).filter(({ row }) => {
      if (seenCompoundWords.has(row.word)) return false;
      seenCompoundWords.add(row.word);
      return true;
    });
    const compoundIndexes = new Set(
      compoundCandidates
        .slice(0, Math.round(selectedRows.length * compoundRate))
        .map(({ index }) => index),
    );
    const choicePool = [...progress.unlockedRows, ...progress.previousRows];
    const problems = selectedRows.map((row, index) => {
      const useWord = compoundIndexes.has(index);
      const sourceStage = curriculumSourceStage(row) || progress.stage;
      const readings = row.readings.slice(0, 4).join("・") || row.primaryReading;
      const learningPoint = useWord
        ? `${sourceStage.label}で習う「${row.character}」を使う熟語です。「${row.word}」は「${row.wordReading}」と読みます。`
        : `${sourceStage.label}で習う漢字「${row.character}」。主な読みは「${readings}」です。`;
      const suitableChoicePool = useWord ? wordRows : choicePool;
      const choices = curriculumChoiceValues(
        row,
        suitableChoicePool,
        mode,
        useWord,
        progress.ratio >= 0.32,
      );
      if (mode === "write") {
        return {
          kind: "curriculum",
          band: bandForLevel(level),
          curriculumLabel: sourceStage.label,
          curriculumProgress: `${progress.stage.label}配当 ${progress.unlockedCount}/${progress.stage.rows.length}字`,
          questionType: useWord ? "word" : "character",
          targetKanji: row.character,
          strokeCharacters: row.character,
          idiom: useWord ? row.word : row.character,
          reading: useWord ? row.wordReading : row.primaryReading,
          meaning: learningPoint,
          masked: useWord ? row.word.replace(row.character, "□") : "□",
          hiddenCount: 1,
          answer: row.character,
          choices,
        };
      }
      return {
        kind: "curriculum",
        band: bandForLevel(level),
        curriculumLabel: sourceStage.label,
        curriculumProgress: `${progress.stage.label}配当 ${progress.unlockedCount}/${progress.stage.rows.length}字`,
        questionType: useWord ? "word" : "character",
        targetKanji: row.character,
        strokeCharacters: row.character,
        kanji: useWord ? row.word : row.character,
        answer: useWord ? row.wordReading : row.primaryReading,
        meaning: learningPoint,
        choices,
      };
    });

    if (
      problems.length > 1 &&
      problemSignature(mode, problems[0]) === state.lastFirstByMode[mode]
    ) {
      const swapIndex = problems.findIndex(
        (problem, index) =>
          index > 0 &&
          problemSignature(mode, problem) !== state.lastFirstByMode[mode],
      );
      if (swapIndex > 0) {
        [problems[0], problems[swapIndex]] = [problems[swapIndex], problems[0]];
      }
    }
    if (problems.length) {
      state.lastFirstByMode[mode] = problemSignature(mode, problems[0]);
    }
    const updatedRecent = [...recent];
    selectedRows.forEach((row) => {
      const previousIndex = updatedRecent.indexOf(row.character);
      if (previousIndex >= 0) updatedRecent.splice(previousIndex, 1);
      updatedRecent.push(row.character);
    });
    state.recentProblems[recentKey] = updatedRecent.slice(-160);
    return problems;
  }

  function createWriteSessionProblems(total, level) {
    if (Number(level) <= 96 && curriculumKanji.length >= 2100) {
      const curriculumProblems = createCurriculumSessionProblems(
        "write",
        total,
        level,
      );
      if (curriculumProblems.length) return curriculumProblems;
    }
    const band = bandForLevel(level);
    const variantsByIdiom = new Map();
    idiomProblems.forEach((problem) => {
      if (!variantsByIdiom.has(problem.idiom)) variantsByIdiom.set(problem.idiom, []);
      variantsByIdiom.get(problem.idiom).push(problem);
    });

    const targetPoolSize = Math.min(
      variantsByIdiom.size,
      Math.max(40, Number(total) || 10),
    );
    const pool = [];
    const usedIdioms = new Set();
    const addBand = (targetBand) => {
      if (targetBand < 1 || targetBand > QUESTION_BAND_COUNT) return;
      idiomProblems.forEach((problem) => {
        if (
          pool.length >= targetPoolSize ||
          problem.band !== targetBand ||
          usedIdioms.has(problem.idiom)
        ) {
          return;
        }
        usedIdioms.add(problem.idiom);
        pool.push(problem.idiom);
      });
    };

    addBand(band);
    for (
      let distance = 1;
      pool.length < targetPoolSize && distance < QUESTION_BAND_COUNT;
      distance += 1
    ) {
      addBand(band - distance);
      addBand(band + distance);
    }

    const recentKey = `${state.learnerName}:write-idiom:${band}`;
    const recent = Array.isArray(state.recentProblems[recentKey])
      ? state.recentProblems[recentKey]
      : [];
    const recentSet = new Set(recent);
    const freshPool = pool.filter((idiom) => !recentSet.has(idiom));
    const olderPool = pool.filter((idiom) => recentSet.has(idiom));
    const result = [];
    let cycle = [...shuffled(freshPool), ...shuffled(olderPool)];

    while (result.length < total && pool.length) {
      if (!cycle.length) cycle = shuffled(pool);
      if (
        result.length &&
        cycle.length > 1 &&
        result[result.length - 1].idiom === cycle[0]
      ) {
        cycle.push(cycle.shift());
      }
      const idiom = cycle.shift();
      const variants = variantsByIdiom.get(idiom) || [];
      if (variants.length) result.push(shuffled(variants)[0]);
    }

    if (
      result.length > 1 &&
      result[0].idiom === state.lastFirstByMode.write
    ) {
      const swapIndex = result.findIndex(
        (problem, index) => index > 0 && problem.idiom !== state.lastFirstByMode.write,
      );
      if (swapIndex > 0) {
        [result[0], result[swapIndex]] = [result[swapIndex], result[0]];
      }
    }
    if (result.length) state.lastFirstByMode.write = result[0].idiom;

    const updatedRecent = [...recent];
    result.forEach((problem) => {
      const previousIndex = updatedRecent.indexOf(problem.idiom);
      if (previousIndex >= 0) updatedRecent.splice(previousIndex, 1);
      updatedRecent.push(problem.idiom);
    });
    state.recentProblems[recentKey] = updatedRecent.slice(-30);
    return result;
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
      const missionType = ["build", "route", "treasure", "lights"].includes(
        preschoolType,
      )
        ? preschoolType
        : "build";
      const bank =
        missionType === "build"
          ? mikkunMechGroupProblems
          : missionType === "route"
            ? mikkunRouteProblems
            : missionType === "treasure"
              ? mikkunMechCountingProblems
              : mikkunLightProblems;
      const stageRank = mikkunStage(level).rank;
      const unlockedBank = bank.filter(
        (problem) => Number(problem.stage || 1) <= stageRank,
      );
      const result = [];
      while (result.length < total) {
        const cycle = shuffled(unlockedBank);
        result.push(
          ...cycle
            .slice(0, total - result.length)
            .map((problem) => ({ ...problem, missionType })),
        );
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
    if (mode === "write") return createWriteSessionProblems(total, level);
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

    if (mode === "read" && Number(level) <= 96 && curriculumKanji.length >= 2100) {
      const curriculumProblems = createCurriculumSessionProblems(
        "read",
        total,
        level,
      );
      if (curriculumProblems.length) return curriculumProblems;
    }

    const band = bandForLevel(level);
    const bank = readingProblems;
    const pool = bank.filter((problem) => problem.band === band);
    /*
     * question-data.js のアップロード漏れや一時的な読込失敗があっても、
     * 旧6問だけを繰り返さない。まず同じ難易度帯を使い、不足分だけ
     * 隣接する難易度帯から近い順に補って30問の候補を確保する。
     */
    for (let distance = 1; pool.length < 30 && distance < QUESTION_BAND_COUNT; distance += 1) {
      [band - distance, band + distance].forEach((nearbyBand) => {
        if (nearbyBand < 1 || nearbyBand > QUESTION_BAND_COUNT || pool.length >= 30) return;
        const nearbyProblems = bank.filter((problem) => problem.band === nearbyBand);
        pool.push(...nearbyProblems.slice(0, 30 - pool.length));
      });
    }
    const uniqueSignatures = new Set();
    const uniquePool = pool.filter((problem) => {
      const signature = problemSignature(mode, problem);
      if (uniqueSignatures.has(signature)) return false;
      uniqueSignatures.add(signature);
      return true;
    });
    const recentKey = `${state.learnerName}:${mode}:${band}`;
    const recent = Array.isArray(state.recentProblems[recentKey])
      ? state.recentProblems[recentKey]
      : [];
    const recentSet = new Set(recent);
    const freshPool = uniquePool.filter(
      (problem) => !recentSet.has(problemSignature(mode, problem)),
    );
    const olderPool = uniquePool.filter((problem) =>
      recentSet.has(problemSignature(mode, problem)),
    );
    const result = [];
    let cycle = [...shuffled(freshPool), ...shuffled(olderPool)];
    while (result.length < total) {
      if (!cycle.length) cycle = shuffled(uniquePool);
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
      if (Number(level) <= 96 && curriculumKanji.length >= 2100) {
        return createCurriculumSessionProblems("write", 1, level)[0];
      }
      return idiomProblems.find((problem) => problem.band === bandForLevel(level));
    }
    if (session?.mode === "read") {
      if (Number(level) <= 96 && curriculumKanji.length >= 2100) {
        return createCurriculumSessionProblems("read", 1, level)[0];
      }
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
      ["write", "read"].includes(state.session?.mode) ||
      Boolean(state.session?.preschool);
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
      playWrongSound();
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
    const mikkunPrize = preschoolComplete
      ? mikkunPrizeForResult(session, ratio)
      : null;
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
        ${mikkunPrize ? `
          <section class="mikkun-prize-card" aria-label="今回のごほうび">
            <span aria-hidden="true">${mikkunPrize.icon}</span>
            <div><small>こんかいの ごほうび</small><h2>${mikkunPrize.name}</h2><p>${mikkunPrize.rank} ・ さいこう ${session.mikkunBestCombo || 0}れんぞく</p></div>
            <i aria-hidden="true">✨</i>
          </section>
        ` : ""}
        <div class="result-score-card">
          <div class="result-main-score"><b>${session.completed}</b><span>問できた</span></div>
          <div><b>${session.correct}</b><span>${session.preschool ? "ゲットした ほし" : "できた問題"}</span></div>
          <div><b>${ratio}%</b><span>達成率</span></div>
        </div>
        <div class="result-actions">
          <button type="button" class="primary-button wide result-home-button" data-action="back-home">ホームへ戻る</button>
          <button type="button" class="secondary-button wide" data-action="restart-session">もう一度する</button>
        </div>
        <div class="result-message-card">
          <span>☺</span>
          <p><b>${session.preschool ? "ぼうけん だいせいこう！" : session.completed >= state.checkpointEvery ? "小さな積み重ねが、力になります。" : "まず始められたことが大切です。"}</b><br />${session.preschool ? "つぎは どの ぼうけんに いく？" : "次も自分のペースで進めよう。"}</p>
        </div>
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
            <p class="eyebrow">${mikkun ? "MIKKUN ADVENTURE / 4 STEPS" : `6 SKILLS / LEVEL 1–${MAX_LEVEL}`}</p>
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
          <span>${mikkun ? "★" : MAX_LEVEL}</span>
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
    const nameManagement = ACTIVE_GROUP.nameMode === "registration"
      ? `
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
          <div class="profile-registration-block">
            <p class="eyebrow">ADD LEARNER</p>
            <label class="name-field" for="profileNewLearnerName">
              <span>新しい人を登録する</span>
              <input id="profileNewLearnerName" type="text" maxlength="20" autocomplete="off" placeholder="名前を入力（20文字まで）" value="${escapeHtml(state.groupRegistrationDraftName)}" />
            </label>
            <label class="name-field registration-grade-field" for="profileNewLearnerGrade">
              <span>今の学年（最初の登録時だけ）</span>
              <select id="profileNewLearnerGrade" required>
                <option value="" ${state.groupRegistrationDraftGrade ? "" : "selected"} disabled>学年を選んでください</option>
                ${initialGradeOptionsTemplate(state.groupRegistrationDraftGrade)}
              </select>
            </label>
            <p class="registration-grade-note">選んだ学年の最初のレベルから始まります。</p>
            ${state.groupRegistrationError ? `<p class="group-form-error" role="alert">${escapeHtml(state.groupRegistrationError)}</p>` : ""}
            <button type="button" class="secondary-button wide register-learner-button" data-action="register-group-learner" data-source="profile" ${state.groupRegistrationBusy ? "disabled" : ""}>
              ${state.groupRegistrationBusy ? "登録しています…" : "この名前を追加する"}
            </button>
          </div>
          <p class="settings-note names-file-note">
            グループ：${escapeHtml(ACTIVE_GROUP.groupLabel)}<br />
            名前とレベルは、このグループ内だけで共有されます。
          </p>
        `
      : `
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
        `;
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
          ${nameManagement}
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
            <div><p class="eyebrow">SOUND</p><h2>学習サウンド</h2></div>
            <span>5種類</span>
          </div>
          <div class="sound-preview-grid">
            <button type="button" data-action="test-sound"><span>◇</span>操作</button>
            <button type="button" data-action="test-start-sound"><span>▶</span>開始</button>
            <button type="button" data-action="test-correct-sound"><span>○</span>正解</button>
            <button type="button" data-action="test-wrong-sound"><span>△</span>不正解</button>
            <button type="button" data-action="test-level-sound"><span>★</span>レベルUP</button>
          </div>
          <p class="settings-note">音が聞こえない場合は、iPhoneの消音モードを解除して音量を上げてください。</p>
        </section>

        <section class="settings-card data-source-card">
          <div class="settings-heading">
            <div><p class="eyebrow">DATA SOURCE</p><h2>問題データの出典</h2></div>
            <span>CC BY-SA</span>
          </div>
          <p class="settings-note">四字熟語の表記・読みの一部は、EDRDGのJMdict/EDICTを参照しています。</p>
          <a class="data-source-link" href="https://www.edrdg.org/edrdg/licence.html" target="_blank" rel="noopener noreferrer">出典と利用条件を見る ↗</a>
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
    const placementMax = mikkun ? MIKKUN_MAX_LEVEL : MAX_LEVEL;
    const placementModes = mikkun
      ? ["write", "read", "math", "memory"]
      : SKILL_MODES;
    const mode = placementModes.includes(state.placementMode)
      ? state.placementMode
      : placementModes[0];
    const draftLevel = clamp(
      state.placementDraftLevel || activeSkill(mode).level,
      1,
      placementMax,
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
              max="${placementMax}"
              step="1"
              value="${draftLevel}"
              aria-label="開始レベルを1から${placementMax}で選ぶ"
            />
            <button type="button" class="primary-button wide placement-apply-button placement-finish-button" data-action="finish-placement">
              レベル調整を終える
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
          <p class="sheet-note">上の「レベル調整を終える」で微調整した値を保存します。${mikkun ? "ぼうけんステップ" : "学年の目安"}を押した場合は、その場ですぐ保存されます。</p>
        </section>
      </div>
    `;
  }

  function levelPasswordTemplate() {
    return `
      <div class="sheet-backdrop" data-action="close-level-password">
        <section class="level-password-sheet" role="dialog" aria-modal="true" aria-labelledby="level-password-title">
          <span class="level-password-mark" aria-hidden="true">鍵</span>
          <p class="eyebrow">PARENT CHECK</p>
          <h2 id="level-password-title">レベル調整を開く</h2>
          <p>レベルを変更するには、保護者用パスワードを入力してください。</p>
          <label for="levelAdjustmentPassword">
            <span>パスワード</span>
            <input
              id="levelAdjustmentPassword"
              type="password"
              inputmode="numeric"
              autocomplete="off"
              enterkeyhint="done"
              aria-describedby="level-password-error"
            />
          </label>
          <p class="level-password-error" id="level-password-error" role="alert">${escapeHtml(state.levelPasswordError)}</p>
          <button type="button" class="primary-button wide" data-action="confirm-level-password">確認して開く</button>
          <button type="button" class="secondary-button wide" data-action="close-level-password">キャンセル</button>
          <small>この確認は、レベルの誤操作を防ぐための簡易ロックです。</small>
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

  async function refreshApplication(button) {
    if (button?.disabled) return;
    if (button) {
      button.disabled = true;
      button.classList.add("is-updating");
      button.setAttribute("aria-busy", "true");
      const label = button.querySelector("b");
      if (label) label.textContent = "確認中…";
    }
    saveProgress();
    if (location.protocol === "file:") {
      location.reload();
      return;
    }

    const refreshToken = Date.now().toString();
    let latestVersion = window.__NOBIRU_APP_VERSION__ || refreshToken;
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 4500);
      try {
        const response = await fetch(`./version.json?refresh=${refreshToken}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store" },
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          latestVersion = String(data.version || latestVersion);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    } catch {
      // version.jsonを取得できなくても、一意なURLで再読込して古い表示を避けます。
    }

    const freshUrl = new URL(location.href);
    freshUrl.searchParams.delete("updated");
    freshUrl.searchParams.set("update", latestVersion);
    freshUrl.searchParams.set("refresh", refreshToken);
    location.replace(freshUrl.toString());
  }

  function applyPlacementLevel(mode, level, closeAfter = false) {
    const safeMode = SKILL_MODES.includes(mode) ? mode : "write";
    const profile = ensureProfile(state.learnerName);
    profile.skills[safeMode] = {
      level: clamp(level, 1, isMikkunLearner() ? MIKKUN_MAX_LEVEL : MAX_LEVEL),
      xp: 0,
      updatedAt: Date.now(),
    };
    profile.updatedAt = Math.max(
      profile.updatedAt,
      profile.skills[safeMode].updatedAt,
    );
    applyActiveProfile();
    state.placementDraftLevel = profile.skills[safeMode].level;
    if (closeAfter) state.placementOpen = false;
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
    const usesStartCue =
      Boolean(event.target.closest("[data-start]")) ||
      ["restart-session", "start-flash", "replay-flash", "start-memory", "start-digits"].includes(
        tapAction,
      );
    const soundPreview = tapAction.startsWith("test-");
    if (
      tappedControl &&
      !tappedControl.disabled &&
      !answerCommit &&
      !usesStartCue &&
      !soundPreview
    ) {
      playTapSound();
    }

    const kanjiDetailButton = event.target.closest("[data-kanji-detail]");
    if (kanjiDetailButton) {
      const stage =
        KANJI_LIST_STAGES.find(
          (item) => item.id === state.kanjiListStageId,
        ) || KANJI_LIST_STAGES[0];
      const character = String(kanjiDetailButton.dataset.kanjiDetail || "").trim();
      if (stage.rows.some((row) => row.character === character)) {
        state.kanjiListSelectedCharacter = character;
        state.strokeKanji = character;
        state.kanjiDemoOpen = true;
        render();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      return;
    }

    const kanjiListStageButton = event.target.closest("[data-kanji-list-stage]");
    if (kanjiListStageButton) {
      const stageId = kanjiListStageButton.dataset.kanjiListStage;
      if (KANJI_LIST_STAGES.some((stage) => stage.id === stageId)) {
        stopKanjiStrokeAnimation();
        state.kanjiListStageId = stageId;
        state.kanjiListSelectedCharacter = "";
        state.kanjiDemoOpen = false;
        state.strokeKanji = "";
        render();
        window.setTimeout(() => {
          document.querySelector("#kanji-list-heading")?.scrollIntoView({
            behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
              ? "auto"
              : "smooth",
            block: "start",
          });
        }, 60);
      }
      return;
    }

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
      if (viewButton.dataset.view !== "kanji-list") {
        state.kanjiListSelectedCharacter = "";
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

    const routeMoveButton = event.target.closest("[data-route-move]");
    if (routeMoveButton) {
      handleMikkunRouteMove(routeMoveButton.dataset.routeMove);
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
        if (state.session?.preschool) {
          state.session.mikkunCombo = Number(state.session.mikkunCombo || 0) + 1;
          state.session.mikkunBestCombo = Math.max(
            Number(state.session.mikkunBestCombo || 0),
            state.session.mikkunCombo,
          );
          if (!Array.isArray(state.session.mikkunRewards)) {
            state.session.mikkunRewards = [];
          }
          state.session.mikkunRewards.push(problem.answer);
        }
        playCorrectSound();
        earnXp(MODE_INFO[mode].xp);
      } else {
        if (state.session?.preschool) {
          state.session.mikkunCombo = 0;
          playTapSound();
        } else {
          playWrongSound();
          applyWrongAnswerPenalty(mode);
        }
      }
      render();
      if (state.session?.preschool) {
        scrollToMikkunReview(correct);
      } else if (mode === "write" || mode === "read") {
        scrollToAnswerReview();
      }
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
          playWrongSound();
          applyWrongAnswerPenalty("memory");
        }
      } else {
        playTapSound();
      }
      render();
      if (state.memoryChecked) scrollToMemoryReview();
      return;
    }

    const numberButton = event.target.closest("[data-number]");
    if (numberButton) {
      const target = numberButton.dataset.numberTarget;
      if (target === "flash") {
        if (["correct", "wrong", "given-up"].includes(state.flashResult)) return;
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
    if (
      action === "close-level-password" &&
      event.target.closest(".level-password-sheet") &&
      !event.target.closest("button[data-action='close-level-password']")
    ) {
      return;
    }

    const actions = {
      "refresh-app"() {
        refreshApplication(actionButton);
      },
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
      "close-kanji-list-detail"() {
        stopKanjiStrokeAnimation();
        state.kanjiListSelectedCharacter = "";
        state.kanjiDemoOpen = false;
        state.strokeKanji = "";
        render();
        window.setTimeout(() => {
          document.querySelector("#kanji-list-heading")?.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
        }, 40);
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
        if (state.session?.preschoolType === "lights") {
          window.setTimeout(startMikkunLightSequence, 240);
        }
      },
      "discard-session"() {
        discardCurrentSession();
      },
      "open-placement"() {
        state.pendingPlacementMode = SKILL_MODES.includes(actionButton.dataset.mode)
          ? actionButton.dataset.mode
          : state.placementMode;
        state.levelPasswordError = "";
        state.levelPasswordOpen = true;
        render();
        window.setTimeout(() => {
          document.querySelector("#levelAdjustmentPassword")?.focus();
        }, 60);
      },
      "confirm-level-password"() {
        const input = document.querySelector("#levelAdjustmentPassword");
        if (String(input?.value || "") !== LEVEL_ADJUSTMENT_PASSWORD) {
          state.levelPasswordError = "パスワードが違います。もう一度入力してください。";
          render();
          window.setTimeout(() => {
            const passwordInput = document.querySelector("#levelAdjustmentPassword");
            passwordInput?.focus();
            passwordInput?.select();
          }, 40);
          return;
        }
        state.placementMode = state.pendingPlacementMode;
        state.placementDraftLevel = activeSkill(state.placementMode).level;
        state.levelPasswordOpen = false;
        state.levelPasswordError = "";
        state.placementOpen = true;
        render();
      },
      "close-level-password"() {
        state.levelPasswordOpen = false;
        state.levelPasswordError = "";
        render();
      },
      "placement-step"() {
        state.placementDraftLevel = clamp(
          state.placementDraftLevel + Number(actionButton.dataset.delta || 0),
          1,
          isMikkunLearner() ? MIKKUN_MAX_LEVEL : MAX_LEVEL,
        );
        render();
      },
      "apply-placement-level"() {
        applyPlacementLevel(state.placementMode, state.placementDraftLevel);
      },
      "finish-placement"() {
        applyPlacementLevel(state.placementMode, state.placementDraftLevel, true);
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
      "open-stroke-order"() {
        const character = String(actionButton.dataset.kanji || "").trim();
        if (!character || !state.readingChecked) return;
        state.strokeKanji = Array.from(character)[0] || "";
        state.kanjiDemoOpen = Boolean(state.strokeKanji);
        render();
      },
      "close-stroke-order"() {
        stopKanjiStrokeAnimation();
        state.kanjiDemoOpen = false;
        state.strokeKanji = "";
        render();
      },
      "finish-kanji-demo"() {
        stopKanjiStrokeAnimation();
        state.kanjiDemoOpen = false;
        state.strokeKanji = "";
        render();
      },
      "kanji-difficult"() {
        finishQuestion(false);
      },
      "next-reading"() {
        if (!state.readingChecked) return;
        const problem = currentSessionProblem();
        const wasCorrect = state.readingChoice === problem.answer;
        const autoStartMikkunLights = state.session?.preschoolType === "lights";
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
        if (autoStartMikkunLights && !state.checkpointOpen) {
          window.setTimeout(startMikkunLightSequence, 260);
        }
      },
      "delete-number"() {
        const target = actionButton.dataset.numberTarget;
        if (target === "flash") {
          if (["correct", "wrong", "given-up"].includes(state.flashResult)) return;
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
          playWrongSound();
          applyWrongAnswerPenalty("math");
        }
        render();
      },
      "next-math"() {
        if (!["correct", "wrong"].includes(state.mathResult)) return;
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "start-flash"() {
        startFlashSequence();
      },
      "replay-flash"() {
        if (state.flashReplayUsed || state.flashResult !== "idle") return;
        state.flashReplayUsed = true;
        state.flashSequenceRevealed = false;
        state.flashAnswer = "";
        state.flashResult = "idle";
        startFlashSequence();
      },
      "give-up-flash"() {
        if (
          !state.flashReplayUsed ||
          ["correct", "wrong", "given-up"].includes(state.flashResult)
        ) {
          return;
        }
        state.session.attempts += 1;
        state.flashResult = "given-up";
        state.flashSequenceRevealed = true;
        playWrongSound();
        applyWrongAnswerPenalty("flash");
        render();
        scrollToFlashReview();
      },
      "submit-flash"() {
        if (
          !state.flashAnswer ||
          state.flashResult !== "idle"
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
          state.flashSequenceRevealed = true;
          playWrongSound();
          applyWrongAnswerPenalty("flash");
        }
        render();
        if (state.flashResult === "wrong") scrollToFlashReview();
      },
      "next-flash"() {
        if (!["correct", "wrong", "given-up"].includes(state.flashResult)) return;
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
      "next-memory"() {
        if (!state.memoryChecked) return;
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
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
          playWrongSound();
          applyWrongAnswerPenalty("digits");
        }
        render();
      },
      "next-digits"() {
        if (!["correct", "wrong"].includes(state.digitsResult)) return;
        state.session.completed += 1;
        advanceAfterCompletedQuestion();
      },
      "continue-session"() {
        state.checkpointOpen = false;
        render();
        if (state.session?.mode === "flash") startFlashSequence();
        if (state.session?.mode === "digits") startDigitsSequence();
        if (state.session?.preschoolType === "lights") {
          window.setTimeout(startMikkunLightSequence, 220);
        }
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
      "register-group-learner"() {
        registerGroupLearner(actionButton.dataset.source || "startup");
      },
      "confirm-startup-learner"() {
        confirmStartupLearner();
      },
      "continue-last-learner"() {
        finishStartupLearner(state.learnerName);
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
        playTapSound();
        showToast("操作音を再生しました");
        render();
      },
      "test-start-sound"() {
        playStartSound();
        showToast("開始音を再生しました");
        render();
      },
      "test-correct-sound"() {
        playCorrectSound();
        showToast("正解音を再生しました");
        render();
      },
      "test-wrong-sound"() {
        playWrongSound();
        showToast("不正解音を再生しました");
        render();
      },
      "test-level-sound"() {
        playLevelUpSound();
        showToast("レベルアップ音を再生しました");
        render();
      },
    };
    actions[action]?.();
  }

  async function handleChange(event) {
    if (event.target.id === "startupLearnerName") {
      const confirmButton = document.querySelector(
        "[data-action='confirm-startup-learner']",
      );
      if (confirmButton) confirmButton.disabled = !event.target.value;
      return;
    }
    if (event.target.id === "placementLevelRange") {
      state.placementDraftLevel = clamp(
        event.target.value,
        1,
        isMikkunLearner() ? MIKKUN_MAX_LEVEL : MAX_LEVEL,
      );
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

  function handleKeydown(event) {
    if (event.key !== "Enter") return;
    const actionByInput = {
      levelAdjustmentPassword: "confirm-level-password",
      startupNewLearnerName: "register-group-learner",
      startupNewLearnerGrade: "register-group-learner",
      profileNewLearnerName: "register-group-learner",
      profileNewLearnerGrade: "register-group-learner",
    };
    const action = actionByInput[event.target.id];
    if (!action) return;
    event.preventDefault();
    if (event.target.id.startsWith("profileNewLearner")) {
      document.querySelector("[data-action='register-group-learner'][data-source='profile']")?.click();
      return;
    }
    document.querySelector(`[data-action='${action}']`)?.click();
  }

  function advanceAfterCompletedQuestion() {
    stopAutoAdvance();
    if (state.session.completed >= state.session.total) {
      finishSession(false);
      return;
    }
    const autoStartFlash = state.session.mode === "flash";
    const autoStartDigits = state.session.mode === "digits";
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
    if (autoStartDigits && !state.checkpointOpen) startDigitsSequence();
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

  async function registerGroupLearner(source = "startup") {
    if (ACTIVE_GROUP.nameMode !== "registration" || state.groupRegistrationBusy) return;
    const inputId = source === "profile" ? "profileNewLearnerName" : "startupNewLearnerName";
    const gradeId = source === "profile" ? "profileNewLearnerGrade" : "startupNewLearnerGrade";
    const input = document.querySelector(`#${inputId}`);
    const gradeSelect = document.querySelector(`#${gradeId}`);
    const cleanName = String(input?.value || "").trim().slice(0, 20);
    const selectedGrade = String(gradeSelect?.value || "");
    state.groupRegistrationDraftName = cleanName;
    state.groupRegistrationDraftGrade = selectedGrade;
    const grade = INITIAL_GRADE_LEVELS.find((item) => item.value === selectedGrade);
    const initialLevel = initialLevelForGrade(selectedGrade);
    if (!cleanName) {
      state.groupRegistrationError = "登録する名前を入力してください。";
      render();
      document.querySelector(`#${inputId}`)?.focus();
      return;
    }
    if (!grade || !initialLevel) {
      state.groupRegistrationError = "今の学年を選んでください。";
      render();
      document.querySelector(`#${gradeId}`)?.focus();
      return;
    }
    if (state.learnerNames.includes(cleanName)) {
      state.groupRegistrationError = "この名前は登録済みです。上の一覧から選んでください。";
      render();
      return;
    }

    state.groupRegistrationBusy = true;
    state.groupRegistrationError = "";
    const button = document.querySelector(
      `[data-action='register-group-learner'][data-source='${source}']`,
    );
    if (button) {
      button.disabled = true;
      button.textContent = "登録しています…";
    }
    if (input) input.disabled = true;
    if (gradeSelect) gradeSelect.disabled = true;
    try {
      const now = Date.now();
      const profile = normalizeProfile({
        level: initialLevel,
        xp: 0,
        streak: 0,
        updatedAt: now,
      });
      await window.NobiruCloud.saveProfile(cleanName, profile);
      state.profiles[cleanName] = profile;
      state.learnerNames = [...state.learnerNames, cleanName].sort((a, b) =>
        a.localeCompare(b, "ja"),
      );
      state.learnerName = cleanName;
      state.hasPreviousLearner = true;
      state.groupRegistrationError = "";
      state.groupRegistrationDraftName = "";
      state.groupRegistrationDraftGrade = "";
      applyActiveProfile();
      saveProgress();
      state.cloudReady = true;
      state.cloudLastSyncedAt = Date.now();
      setCloudStatus("Firebaseと同期済み", "online");
      if (source === "startup") {
        state.learnerConfirmed = true;
        state.view = "home";
        showToast(`${grade.label}のレベルから学習を始めます`);
        window.scrollTo({ top: 0, left: 0 });
      } else {
        showToast(`${cleanName}を${grade.label}のレベルで登録しました`);
      }
    } catch {
      state.groupRegistrationError = "名前を登録できませんでした。通信状態とFirebaseの設定を確認してください。";
    } finally {
      state.groupRegistrationBusy = false;
      render();
    }
  }

  function confirmStartupLearner() {
    const nameField = document.querySelector("#startupLearnerName");
    const selectedName = String(nameField?.value || "").trim();
    finishStartupLearner(selectedName);
  }

  function finishStartupLearner(selectedName) {
    const cleanName = String(selectedName || "").trim();
    if (!cleanName || !state.learnerNames.includes(cleanName)) return;
    state.hasPreviousLearner = true;
    activateLearner(cleanName, false);
    state.learnerConfirmed = true;
    state.view = "home";
    saveProgress();
    showToast(`${displayName()}で学習を始めます`);
    render();
    window.scrollTo({ top: 0, left: 0 });
    if (state.cloudReady) syncCloudProfiles();
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
    state.strokeKanji = "";
    state.readingChoice = "";
    state.readingChecked = false;
    state.mikkunRouteStep = 0;
    state.mikkunRouteMessage = "";
    state.mikkunRouteLastMove = "";
    state.mikkunRouteBumped = false;
    prepareReadingChoices();
    state.mathAnswer = "";
    state.mathResult = "idle";
    state.flashAnswer = "";
    state.flashResult = "idle";
    state.flashCue = "3";
    state.flashReplayUsed = false;
    state.flashSequenceRevealed = false;
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
    const learnerMaxLevel = isMikkunLearner() ? MIKKUN_MAX_LEVEL : MAX_LEVEL;
    const total = skill.xp + amount;
    if (total >= 100 && skill.level < learnerMaxLevel) {
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
      window.setTimeout(playLevelUpSound, 420);
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
