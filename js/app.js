/* 수학 펫 키우기 - 초등 1학년 사칙연산/구구단 + 다마고치형 펫 */
(() => {
'use strict';

/* ================= 상수 ================= */
const SAVE_KEY = 'mathpet_save_v1';
const QUIZ_LENGTH = 10;

// 펫 성장 단계 (xp 기준). 캐릭터: 피그미 다람쥐
// 이미지 규칙 (assets/):
//   pet_<stage>_<pose>.png  단계별 포즈 (있으면 최우선)
//   pet_<pose>.png          공통 포즈 (idle/eat/happy/sleep) - 어른 단계 기본 모습
//   pet_<stage>.png         단계별 기본 모습
// 없는 파일은 자동으로 다음 후보 → 마지막엔 이모지
const STAGES = [
  { key: 'acorn',  name: '도토리', emoji: '🌰', xp: 0 },
  { key: 'baby',   name: '아기',   emoji: '🐿️', xp: 100 },
  { key: 'child',  name: '어린이', emoji: '🐿️', xp: 300 },
  { key: 'teen',   name: '청소년', emoji: '🐿️', xp: 700 },
  { key: 'adult',  name: '어른',   emoji: '🐿️', xp: 1300 },
  { key: 'legend', name: '전설',   emoji: '👑', xp: 2200 },
];
const STAGE_DESC = {
  acorn: '도토리 속에서 새근새근 자고 있어요',
  baby: '도토리에서 나왔어요! 아직 아기 다람쥐예요',
  child: '가방 메고 씩씩하게 자라는 중이에요',
  teen: '힘이 세졌어요! 공부도 척척',
  adult: '늠름한 어른 다람쥐가 되었어요',
  legend: '전설의 수학 다람쥐! 최고 단계예요',
};
const POSES = ['idle', 'eat', 'happy', 'sleep'];

// 꾸미기 아이템 (cat: hat 모자 / outfit 옷 / acc 악세사리 / furniture 가구)
// pos: 펫 이미지 기준 위치(%), r: 펫 높이 대비 크기
const ITEM_CATS = { hat: '모자', outfit: '옷', acc: '악세사리', furniture: '가구' };
const ITEMS = [
  // 모자 (pos: 펫 이미지 기준 %, r: 펫 크기 대비 비율)
  { id: 'ribbon',   cat: 'hat', name: '리본',       emoji: '🎀', price: 30,  pos: { x: 68, y: 6 },  r: 0.22 },
  { id: 'flower',   cat: 'hat', name: '꽃핀',       emoji: '🌸', price: 25,  pos: { x: 30, y: 8 },  r: 0.2 },
  { id: 'cap',      cat: 'hat', name: '야구모자',   emoji: '🧢', price: 35,  pos: { x: 50, y: 2 },  r: 0.3 },
  { id: 'strawhat', cat: 'hat', name: '밀짚모자',   emoji: '👒', price: 45,  pos: { x: 50, y: 0 },  r: 0.34 },
  { id: 'berry',    cat: 'hat', name: '딸기 모자',  emoji: '🍓', price: 55,  pos: { x: 50, y: 2 },  r: 0.28 },
  { id: 'tophat',   cat: 'hat', name: '신사 모자',  emoji: '🎩', price: 70,  pos: { x: 50, y: -2 }, r: 0.3 },
  { id: 'helmet',   cat: 'hat', name: '안전모',     emoji: '⛑️', price: 70,  pos: { x: 50, y: 2 },  r: 0.3 },
  { id: 'gradcap',  cat: 'hat', name: '학사모',     emoji: '🎓', price: 90,  pos: { x: 50, y: 0 },  r: 0.3 },
  { id: 'pumpkin',  cat: 'hat', name: '호박 모자',  emoji: '🎃', price: 100, pos: { x: 50, y: 2 },  r: 0.3 },
  { id: 'unicorn',  cat: 'hat', name: '유니콘 뿔',  emoji: '🦄', price: 160, pos: { x: 50, y: -4 }, r: 0.26 },
  { id: 'crown',    cat: 'hat', name: '왕관',       emoji: '👑', price: 180, pos: { x: 50, y: -2 }, r: 0.28 },

  // 옷
  { id: 'shorts',   cat: 'outfit', name: '반바지',     emoji: '🩳', price: 25,  pos: { x: 50, y: 78 }, r: 0.28 },
  { id: 'tshirt',   cat: 'outfit', name: '티셔츠',     emoji: '👕', price: 40,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'tank',     cat: 'outfit', name: '운동복',     emoji: '🎽', price: 40,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'blouse',   cat: 'outfit', name: '블라우스',   emoji: '👚', price: 45,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'vest',     cat: 'outfit', name: '조끼',       emoji: '🦺', price: 50,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'dress',    cat: 'outfit', name: '원피스',     emoji: '👗', price: 55,  pos: { x: 50, y: 66 }, r: 0.32 },
  { id: 'swim',     cat: 'outfit', name: '수영복',     emoji: '🩱', price: 55,  pos: { x: 50, y: 64 }, r: 0.3 },
  { id: 'shirt',    cat: 'outfit', name: '넥타이 셔츠', emoji: '👔', price: 60,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'dobok',    cat: 'outfit', name: '도복',       emoji: '🥋', price: 80,  pos: { x: 50, y: 62 }, r: 0.3 },
  { id: 'coat',     cat: 'outfit', name: '코트',       emoji: '🧥', price: 90,  pos: { x: 50, y: 62 }, r: 0.32 },
  { id: 'labcoat',  cat: 'outfit', name: '박사 가운',  emoji: '🥼', price: 100, pos: { x: 50, y: 62 }, r: 0.32 },
  { id: 'hanbok',   cat: 'outfit', name: '전통 옷',    emoji: '👘', price: 120, pos: { x: 50, y: 64 }, r: 0.34 },

  // 악세사리
  { id: 'candy',    cat: 'acc', name: '사탕',       emoji: '🍭', price: 20,  pos: { x: 84, y: 60 }, r: 0.22 },
  { id: 'balloon',  cat: 'acc', name: '풍선',       emoji: '🎈', price: 25,  pos: { x: 92, y: 10 }, r: 0.3 },
  { id: 'icecream', cat: 'acc', name: '아이스크림', emoji: '🍦', price: 30,  pos: { x: 84, y: 58 }, r: 0.22 },
  { id: 'glasses',  cat: 'acc', name: '안경',       emoji: '👓', price: 35,  pos: { x: 50, y: 33 }, r: 0.28 },
  { id: 'scarf',    cat: 'acc', name: '목도리',     emoji: '🧣', price: 40,  pos: { x: 50, y: 52 }, r: 0.26 },
  { id: 'soccer',   cat: 'acc', name: '축구공',     emoji: '⚽', price: 45,  pos: { x: 14, y: 88 }, r: 0.22 },
  { id: 'umbrella', cat: 'acc', name: '우산',       emoji: '🌂', price: 55,  pos: { x: 88, y: 40 }, r: 0.3 },
  { id: 'sunglass', cat: 'acc', name: '선글라스',   emoji: '🕶️', price: 55,  pos: { x: 50, y: 33 }, r: 0.28 },
  { id: 'bag',      cat: 'acc', name: '가방',       emoji: '🎒', price: 65,  pos: { x: 12, y: 60 }, r: 0.28 },
  { id: 'watch',    cat: 'acc', name: '손목시계',   emoji: '⌚', price: 70,  pos: { x: 24, y: 66 }, r: 0.16 },
  { id: 'necklace', cat: 'acc', name: '목걸이',     emoji: '📿', price: 80,  pos: { x: 50, y: 56 }, r: 0.22 },
  { id: 'medal',    cat: 'acc', name: '메달',       emoji: '🏅', price: 110, pos: { x: 50, y: 60 }, r: 0.22 },
  { id: 'guitar',   cat: 'acc', name: '기타',       emoji: '🎸', price: 120, pos: { x: 72, y: 66 }, r: 0.32 },
  { id: 'wand',     cat: 'acc', name: '마법봉',     emoji: '🪄', price: 140, pos: { x: 86, y: 44 }, r: 0.26 },
  { id: 'trophy',   cat: 'acc', name: '트로피',     emoji: '🏆', price: 220, pos: { x: 84, y: 76 }, r: 0.26 },

  // 가구 (펫 카드 배경, pos: 카드 기준 %)
  { id: 'log',       cat: 'furniture', name: '통나무',   emoji: '🪵', price: 25,  pos: { x: 86, y: 90 }, r: 0.34 },
  { id: 'sunflower', cat: 'furniture', name: '해바라기', emoji: '🌻', price: 30,  pos: { x: 6,  y: 70 }, r: 0.32 },
  { id: 'plant',     cat: 'furniture', name: '화분',     emoji: '🪴', price: 35,  pos: { x: 8,  y: 92 }, r: 0.42 },
  { id: 'chair',     cat: 'furniture', name: '의자',     emoji: '🪑', price: 40,  pos: { x: 24, y: 88 }, r: 0.36 },
  { id: 'lamp',      cat: 'furniture', name: '램프',     emoji: '💡', price: 40,  pos: { x: 90, y: 22 }, r: 0.3 },
  { id: 'nest',      cat: 'furniture', name: '둥지',     emoji: '🪺', price: 45,  pos: { x: 78, y: 30 }, r: 0.32 },
  { id: 'teddy',     cat: 'furniture', name: '곰인형',   emoji: '🧸', price: 50,  pos: { x: 90, y: 92 }, r: 0.36 },
  { id: 'frame',     cat: 'furniture', name: '액자',     emoji: '🖼️', price: 55,  pos: { x: 10, y: 22 }, r: 0.34 },
  { id: 'mirror',    cat: 'furniture', name: '거울',     emoji: '🪞', price: 60,  pos: { x: 22, y: 36 }, r: 0.36 },
  { id: 'books',     cat: 'furniture', name: '책',       emoji: '📚', price: 70,  pos: { x: 76, y: 88 }, r: 0.34 },
  { id: 'bed',       cat: 'furniture', name: '침대',     emoji: '🛏️', price: 90,  pos: { x: 20, y: 70 }, r: 0.5 },
  { id: 'tv',        cat: 'furniture', name: '텔레비전', emoji: '📺', price: 110, pos: { x: 80, y: 52 }, r: 0.4 },
  { id: 'sofa',      cat: 'furniture', name: '소파',     emoji: '🛋️', price: 120, pos: { x: 82, y: 70 }, r: 0.5 },
  { id: 'computer',  cat: 'furniture', name: '컴퓨터',   emoji: '🖥️', price: 130, pos: { x: 18, y: 52 }, r: 0.4 },
  { id: 'car',       cat: 'furniture', name: '자동차',   emoji: '🚗', price: 150, pos: { x: 84, y: 86 }, r: 0.46 },
  { id: 'tree',      cat: 'furniture', name: '트리',     emoji: '🎄', price: 150, pos: { x: 88, y: 48 }, r: 0.6 },
  { id: 'slide',     cat: 'furniture', name: '미끄럼틀', emoji: '🛝', price: 170, pos: { x: 14, y: 80 }, r: 0.5 },
  { id: 'shroom',    cat: 'furniture', name: '버섯집',   emoji: '🍄', price: 180, pos: { x: 90, y: 68 }, r: 0.5 },
  { id: 'carousel',  cat: 'furniture', name: '회전목마', emoji: '🎠', price: 220, pos: { x: 12, y: 46 }, r: 0.56 },
  { id: 'house',     cat: 'furniture', name: '나무집',   emoji: '🏠', price: 250, pos: { x: 12, y: 48 }, r: 0.6 },
  { id: 'fountain',  cat: 'furniture', name: '분수',     emoji: '⛲', price: 280, pos: { x: 86, y: 44 }, r: 0.56 },
  { id: 'circus',    cat: 'furniture', name: '서커스',   emoji: '🎪', price: 320, pos: { x: 84, y: 40 }, r: 0.6 },
  { id: 'castle',    cat: 'furniture', name: '성',       emoji: '🏰', price: 500, pos: { x: 14, y: 40 }, r: 0.64 },
];
const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

const FOODS = {
  apple:  { name: '사과',   emoji: '🍎', hunger: 20, happy: 5,  xp: 5,  price: 10 },
  cookie: { name: '쿠키',   emoji: '🍪', hunger: 35, happy: 15, xp: 10, price: 25 },
  cake:   { name: '케이크', emoji: '🎂', hunger: 60, happy: 30, xp: 20, price: 60 },
};

// 7일 주기 출석 보상
const ATTEND_REWARDS = [
  { food: 'apple',  n: 1, coins: 5 },
  { food: 'apple',  n: 1, coins: 5 },
  { food: 'cookie', n: 1, coins: 10 },
  { food: 'apple',  n: 2, coins: 10 },
  { food: 'cookie', n: 1, coins: 10 },
  { food: 'apple',  n: 2, coins: 15 },
  { food: 'cake',   n: 1, coins: 30 },
];

const TOPICS = {
  add: { name: '덧셈',   sym: '+' },
  sub: { name: '뺄셈',   sym: '−' },
  mul: { name: '곱셈',   sym: '×' },
  div: { name: '나눗셈', sym: '÷' },
};
const LEVEL_DESC = {
  1: '덧셈·뺄셈 10까지 / 곱셈·나눗셈 2~5단',
  2: '덧셈·뺄셈 20까지 / 곱셈·나눗셈 6~9단',
  3: '덧셈·뺄셈 100까지 / 곱셈·나눗셈 2~9단 전체',
};
// 정답 1개당 코인: 연산 종류(덧<뺄<곱<나) × 단계(1<2<3). 섞어 풀기는 문제마다 자기 연산 기준.
const COIN_TABLE = { add: [3, 5, 7], sub: [4, 6, 8], mul: [5, 7, 9], div: [6, 8, 10] };
const coinFor = (topic, level) => COIN_TABLE[topic][level - 1];
const streakBonus = level => 1 + level;                 // 3연속 이상 정답 보너스
const starBonus = (stars, level) => stars * 5 * level;  // 세션 별점 보너스
const REVIEW_RATE = 0.5;  // 오늘 이미 다 푼 단계를 또 풀면(복습) 코인 절반

const DECAY_PER_HOUR = { hunger: 4, happy: 3, clean: 2 };
const PLAY_COST = 5;
const WASH_COST = 5;
const EVOLVE_BONUS = 50;  // 진화 시 코인 보너스
const LEVEL_BONUS = 5;    // 레벨 업 시 코인 보너스

/* ================= 유틸 ================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dateStr = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const todayStr = () => dateStr(new Date());
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); };

function deepMerge(base, src) {
  if (!src || typeof src !== 'object') return base;
  for (const k of Object.keys(src)) {
    if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && base[k] && typeof base[k] === 'object') {
      deepMerge(base[k], src[k]);
    } else if (src[k] !== undefined) {
      base[k] = src[k];
    }
  }
  return base;
}

/* ================= 저장 데이터 ================= */
let S = null;
function defaultSave() {
  return {
    version: 2,
    coins: 0,
    xp: 0,
    lastLevelSeen: 1,
    pet: { name: '알콩', hunger: 80, happy: 80, clean: 80, lastTick: Date.now() },
    food: { apple: 2, cookie: 0, cake: 0 },
    attend: { lastDate: null, total: 0, cycleDay: 0, streak: 0 },
    album: {},            // 단계 key -> 달성 날짜
    items: { owned: {}, equip: { hat: null, outfit: null, acc: null, furniture: {} } },
    stats: {
      correct: 0, wrong: 0,
      byTopic: { add: [0, 0], sub: [0, 0], mul: [0, 0], div: [0, 0] },
      lastPlayDate: null, streak: 0, sessions: 0,
      dan: {},
    },
    settings: { sound: true, level: 1 },
    daily: { date: null, done: { 1: 0, 2: 0, 3: 0 } },  // 오늘 단계별 완료 횟수 (학습 사다리)
    tutorialSeen: false,
  };
}
// 하루 학습 사다리: 1단계를 오늘 한 번 다 풀면 2단계, 2단계를 다 풀면 3단계가 열림. 날짜가 바뀌면 1단계부터.
function ensureDaily() {
  const t = todayStr();
  if (S.daily.date !== t) { S.daily = { date: t, done: { 1: 0, 2: 0, 3: 0 } }; S.settings.level = 1; save(); }
}
function levelUnlocked(l) { ensureDaily(); return l === 1 || S.daily.done[l - 1] > 0; }
function levelDoneToday(l) { ensureDaily(); return S.daily.done[l] > 0; }
function load() {
  S = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) deepMerge(S, JSON.parse(raw));
  } catch (e) { /* 저장 데이터 손상 시 새로 시작 */ }
  // 이전 버전 저장 데이터 보정
  if (S.album.egg) { S.album.acorn = S.album.acorn || S.album.egg; delete S.album.egg; }
  STAGES.forEach(s => { if (S.xp >= s.xp && !S.album[s.key]) S.album[s.key] = todayStr(); });
  if (petLevel() > S.lastLevelSeen) S.lastLevelSeen = petLevel();
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 무시 */ }
}

/* ================= 소리 ================= */
let audioCtx = null;
function beep(seq) {
  if (!S.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let t = audioCtx.currentTime;
    seq.forEach(([freq, dur, type]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
      t += dur;
    });
  } catch (e) { /* 소리 미지원 */ }
}
const SFX = {
  tap:     () => beep([[600, 0.05]]),
  correct: () => beep([[660, 0.1], [880, 0.12], [1100, 0.2]]),
  wrong:   () => beep([[220, 0.18, 'square'], [170, 0.24, 'square']]),
  coin:    () => beep([[1200, 0.07], [1600, 0.12]]),
  eat:     () => beep([[400, 0.08], [520, 0.08], [400, 0.1]]),
  evolve:  () => beep([[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.35]]),
  stamp:   () => beep([[900, 0.06], [700, 0.08], [1100, 0.15]]),
};

/* ================= 펫 상태 ================= */
function stageIndex() {
  let i = 0;
  STAGES.forEach((s, k) => { if (S.xp >= s.xp) i = k; });
  return i;
}
const stage = () => STAGES[stageIndex()];
const nextStage = () => STAGES[stageIndex() + 1] || null;
const petLevel = () => Math.floor(S.xp / 50) + 1;
function stageProgress() {
  const st = stage(), nx = nextStage();
  if (!nx) return 1;
  return clamp((S.xp - st.xp) / (nx.xp - st.xp), 0, 1);
}
// 같은 단계 안에서도 XP가 쌓일수록 조금씩 커짐 (0.8배 → 1.1배)
const growScale = () => (0.8 + 0.3 * stageProgress()).toFixed(2);

function mood() {
  const avg = (S.pet.hunger + S.pet.happy + S.pet.clean) / 3;
  return avg >= 70 ? 'happy' : avg >= 40 ? 'soso' : 'sad';
}
const MOOD_EMOJI = { happy: '😊', soso: '😐', sad: '😢' };

function petSpeech() {
  if (S.pet.hunger < 30) return '배고파요... 간식 주세요 🍎';
  if (S.pet.clean < 30) return '씻고 싶어요! 🛁';
  if (S.pet.happy < 30) return '같이 놀아줘요! 🎈';
  const m = mood();
  if (m === 'happy') return pick(['오늘도 공부 파이팅!', '나랑 구구단 외우자!', '문제 풀면 간식 줘!', '최고야! 😆', '열 문제만 풀어볼까?']);
  if (m === 'soso') return pick(['조금 심심해...', '뭐 하고 놀까?', '간식 있어?']);
  return '힘이 없어요...';
}

function tickPet() {
  const now = Date.now();
  let hrs = (now - (S.pet.lastTick || now)) / 3.6e6;
  if (hrs < 0) hrs = 0;
  hrs = Math.min(hrs, 72); // 오래 안 켜도 최악은 3일치만
  S.pet.hunger = clamp(S.pet.hunger - hrs * DECAY_PER_HOUR.hunger, 5);
  S.pet.happy  = clamp(S.pet.happy  - hrs * DECAY_PER_HOUR.happy, 5);
  S.pet.clean  = clamp(S.pet.clean  - hrs * DECAY_PER_HOUR.clean, 5);
  S.pet.lastTick = now;
}

// 이미지 파일이 있으면 이미지, 없으면 이모지
const imgOk = {};   // path -> true/false
let ready = false;
// 프레임 동작(여러 장을 순서대로 넘김): walk=걷기, cheer=기쁨(만세). 있으면 조각 인형 대신 사용 → 잘림 없음.
const FRAME_SETS = ['walk', 'cheer', 'idle', 'eat', 'sleep'];
const MAX_FRAMES = 8;
const FRAME_SPEED = { walk: 0.5, cheer: 0.6, idle: 1.6, eat: 0.7, sleep: 2.4 };   // 한 바퀴(초)
function framesFor(stageKey, set) {
  const pick = prefix => { const out = []; for (let n = 1; n <= MAX_FRAMES; n++) { const p = `${prefix}_${n}.png`; if (imgOk[p]) out.push(p); else break; } return out; };
  let f = pick(`assets/pet_${stageKey}_${set}`);
  if (!f.length && (stageKey === 'adult' || stageKey === 'legend')) f = pick(`assets/pet_${set}`);
  return f;
}
function framesHTML(frames, set, glow) {
  const n = frames.length, dur = FRAME_SPEED[set] || 0.5;
  return `<div class="frames f${n}${glow}" style="--n:${n};--fd:${dur}s">${frames.map((src, i) => `<img class="frame" src="${src}" alt="" style="--i:${i}">`).join('')}</div>`;
}
function probeImages() {
  const paths = new Set();
  STAGES.forEach(s => { paths.add(`assets/pet_${s.key}.png`); POSES.forEach(p => paths.add(`assets/pet_${s.key}_${p}.png`)); });
  POSES.forEach(p => paths.add(`assets/pet_${p}.png`));
  // 동작 프레임: pet_<동작>_<번호>.png (어른), pet_<단계>_<동작>_<번호>.png (단계별). 번호 1부터, 최대 8장.
  const probe = src => new Promise(res => {
    const im = new Image();
    im.onload = () => { imgOk[src] = true; if (ready) render(); res(true); };
    im.onerror = () => { imgOk[src] = false; res(false); };
    im.src = src;
  });
  const all = [...paths].map(probe);
  // 프레임은 1번부터 차례로 확인하고 없으면 멈춤 (없는 파일 요청을 줄이기 위해)
  const seq = async prefix => { for (let n = 1; n <= MAX_FRAMES; n++) { if (!(await probe(`${prefix}_${n}.png`))) break; } };
  FRAME_SETS.forEach(set => { all.push(seq(`assets/pet_${set}`)); STAGES.forEach(s => all.push(seq(`assets/pet_${s.key}_${set}`))); });
  // 이미지 확인이 끝나거나 2초가 지나면 진행
  return Promise.race([Promise.all(all), new Promise(res => setTimeout(res, 2000))]);
}
// 단계+포즈에 맞는 이미지 경로 (없으면 null)
function petImagePath(stageKey, pose) {
  const c = [`assets/pet_${stageKey}_${pose}.png`];
  if (pose === 'idle') c.push(`assets/pet_${stageKey}.png`);   // 단계 기본 모습이 있으면 공통 포즈보다 우선 (전설 등)
  if (stageKey === 'adult' || stageKey === 'legend') c.push(`assets/pet_${pose}.png`);
  c.push(`assets/pet_${stageKey}.png`);
  if (stageKey === 'adult' || stageKey === 'legend') c.push('assets/pet_idle.png');
  return c.find(p => imgOk[p]) || null;
}
function stageImg(st, cls = '', pose = 'idle') {
  const src = petImagePath(st.key, pose);
  const glow = st.key === 'legend' && !imgOk[`assets/pet_legend.png`] ? ' legend-glow' : '';
  return src
    ? `<img class="${cls}${glow}" src="${src}" alt="${st.name}">`
    : `<span class="pet-emoji ${cls}">${st.emoji}</span>`;
}

// 포즈: 기본은 기분에 따라 idle/sleep, 반응은 잠깐 다른 포즈
let reactPose = null, reactTimer = null;
function basePose() { return mood() === 'sad' ? 'sleep' : 'idle'; }
function currentPose() { return reactPose || basePose(); }
function react(pose, ms = 1500) {
  reactPose = pose;
  clearTimeout(reactTimer);
  if (walking) stopWalking();
  $$('.pet-slot').forEach(s => { if (s.closest('.screen.active')) s.innerHTML = petHTML(); });
  reactTimer = setTimeout(() => { reactPose = null; $$('.pet-slot').forEach(s => { if (s.closest('.screen.active')) s.innerHTML = petHTML(); }); }, ms);
}

// 착용 아이템 오버레이 (모자/옷/악세사리)
function wearablesHTML() {
  const eq = S.items.equip;
  return ['outfit', 'acc', 'hat'].map(slot => {
    const it = eq[slot] && ITEM_BY_ID[eq[slot]];
    if (!it) return '';
    return `<span class="wear" style="left:${it.pos.x}%;top:${it.pos.y}%;--r:${it.r}">${it.emoji}</span>`;
  }).join('');
}
// 가구 오버레이 (펫 카드 배경)
function furnitureHTML() {
  return Object.keys(S.items.equip.furniture).filter(id => S.items.equip.furniture[id] && ITEM_BY_ID[id]).map(id => {
    const it = ITEM_BY_ID[id];
    return `<span class="furn" style="left:${it.pos.x}%;top:${it.pos.y}%;--r:${it.r}">${it.emoji}</span>`;
  }).join('');
}
function renderFurniture(screenEl) {
  const host = $('.pet-stage', screenEl);
  if (!host) return;
  ensureScene(host);
  let layer = $('.furn-layer', host);
  if (!layer) { layer = document.createElement('div'); layer.className = 'furn-layer'; host.prepend(layer); }
  layer.innerHTML = furnitureHTML();
}

// 배경 무대(하늘·해·구름·언덕·꽃·나비). CSS로만 그림. 밤(19~6시)에는 body.night로 달·별 버전.
function ensureScene(host) {
  if ($('.scene', host)) return;
  const sc = document.createElement('div');
  sc.className = 'scene';
  sc.innerHTML = `
    <i class="stars"></i><i class="sun"></i>
    <i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i>
    <i class="hill h1"></i><i class="hill h2"></i><i class="ground"></i>
    <b class="deco d1">🌷</b><b class="deco d2">🌼</b><b class="deco d3">🍄</b><b class="deco d4">🌱</b><b class="deco d5">🌸</b>
    <b class="bfly">🦋</b>`;
  host.prepend(sc);
}
function isNight() { const h = new Date().getHours(); return h >= 19 || h < 6; }

// 기본 상태 움직임: 가끔 산책(좌우로 걷기), 깡충, 갸웃, 뒤돌기. 반응 포즈 중이거나 졸릴 땐 쉼.
let walkX = 0, face = 1, walking = false, idleTimer = null, walkEndTimer = null;
function applyWalk(dur) {
  $$('.pet-stage .pet-slot').forEach(el => { el.style.setProperty('--wt', dur + 's'); el.style.setProperty('--wx', walkX + 'px'); });
  $$('.pet-body').forEach(el => el.style.setProperty('--face', face));
  rerenderPets();   // 걷기 프레임/조각 인형 전환은 다시 그려야 반영됨 (위치는 .pet-slot에 있어 안 튐)
}
function stopWalking() { walking = false; clearTimeout(walkEndTimer); rerenderPets(); }
function idleAct() {
  clearTimeout(idleTimer);
  const slot = $('.screen.active .pet-stage .pet-slot');
  let wait = 1800 + Math.random() * 2600;
  if (slot && !reactPose && !document.hidden && !walking && basePose() === 'idle' && !$('#modal').classList.contains('show')) {
    const r = Math.random();
    if (r < 0.5) {
      const body = $('.pet-body', slot);
      const w = body ? body.offsetWidth : 120;
      const range = Math.max(0, (slot.clientWidth - w) / 2 - 10);
      // 지금 있는 쪽의 반대편으로 걸어감 (항상 눈에 띄게 이동)
      const side = walkX > 0 ? -1 : (walkX < 0 ? 1 : (Math.random() < 0.5 ? -1 : 1));
      const tx = Math.round(side * range * (0.35 + Math.random() * 0.65));
      const dur = Math.max(0.5, Math.abs(tx - walkX) / 55);
      face = tx < walkX ? -1 : 1;
      walkX = tx; walking = true;
      applyWalk(dur);
      walkEndTimer = setTimeout(stopWalking, dur * 1000);
      wait = dur * 1000 + 400 + Math.random() * 1500;
    } else if (r < 0.68) {
      react('happy', 700); wait = 1600 + Math.random() * 1500;
    } else if (r < 0.86) {
      $$('.screen.active .pet-wrap').forEach(w => { w.classList.add('wiggle'); setTimeout(() => w.classList.remove('wiggle'), 900); });
    } else {
      face = -face; applyWalk(0);
    }
  }
  idleTimer = setTimeout(idleAct, wait);
}

// 팔다리 움직임(종이 인형 방식): 한 장의 이미지를 clip-path로 머리/몸통/팔/발 조각으로 나눠 겹쳐 놓고
// 조각마다 따로 애니메이션. 사각형은 [top, right, bottom, left] % inset. 조각끼리 겹치지 않게 나눔(잔상 방지).
// 키: 어른 포즈 시트는 포즈 이름, 성장 단계 기본 이미지는 단계 이름. 없으면 통째로 표시.
const PUPPETS = {
  // 움직이는 조각과 가만히 있는 조각은 2~3% 겹치게 해서 움직일 때 틈이 안 보이게 함.
  idle:  { head: [0, 0, 53, 0], t1: [45, 0, 42, 0], t2: [56, 62, 26, 0], paws: [56, 36, 28, 36], t3: [56, 0, 26, 62], t4: [70, 0, 11, 0], footL: [87, 50, 0, 0], footR: [87, 0, 0, 50] },
  eat:   { head: [0, 0, 53, 0], t1: [45, 0, 48, 0], t2: [50, 68, 28, 0], paws: [50, 30, 30, 30], t3: [50, 0, 28, 68], t4: [68, 0, 11, 0], footL: [87, 50, 0, 0], footR: [87, 0, 0, 50] },
  happy: { head: [0, 28, 48, 28], armL: [30, 68, 50, 0], armR: [30, 0, 50, 68], t1: [48, 0, 10, 0], footL: [88, 50, 0, 0], footR: [88, 0, 0, 50] },
  baby:  { head: [0, 0, 43, 0], t1: [55, 0, 16, 0], footL: [82, 50, 0, 0], footR: [82, 0, 0, 50] },
  child: { head: [0, 22, 50, 22], armL: [32, 74, 42, 0], t1: [48, 0, 10, 0], footL: [88, 50, 0, 0], footR: [88, 0, 0, 50] },
  teen:  { head: [0, 20, 53, 20], armL: [36, 72, 45, 0], t1: [45, 0, 10, 0], footL: [88, 50, 0, 0], footR: [88, 0, 0, 50] },
};
function puppetHTML(st, pose) {
  const src = petImagePath(st.key, pose);
  if (!src) return stageImg(st, '', pose);
  const isPoseSheet = src === `assets/pet_${pose}.png` || src === `assets/pet_${st.key}_${pose}.png`;
  const parts = PUPPETS[isPoseSheet ? pose : st.key];
  if (!parts) return stageImg(st, '', pose);
  const glow = st.key === 'legend' && !imgOk['assets/pet_legend.png'] ? ' legend-glow' : '';
  const imgs = Object.entries(parts).map(([name, [t, r, b, l]]) =>
    `<img class="part p-${name}" src="${src}" alt="" style="clip-path:inset(${t}% ${r}% ${b}% ${l}%)">`).join('');
  return `<div class="puppet${glow}"><img class="base" src="${src}" alt="${st.name}">${imgs}</div>`;
}

function petHTML(pose = currentPose()) {
  const st = stage();
  const m = mood();
  const glow = st.key === 'legend' && !imgOk['assets/pet_legend.png'] ? ' legend-glow' : '';
  // 걷는 중이면 걷기 프레임, 기쁨 포즈면 만세 프레임, 없으면 조각 인형/정지 이미지
  let body, anim = '';
  const wf = walking ? framesFor(st.key, 'walk') : [];
  const cf = !wf.length && pose === 'happy' ? framesFor(st.key, 'cheer') : [];
  const pf = !wf.length && !cf.length && pose !== 'happy' ? framesFor(st.key, pose) : [];   // idle/eat/sleep 프레임
  if (wf.length) { body = framesHTML(wf, 'walk', glow); anim = ' frames-anim'; }
  else if (cf.length) { body = framesHTML(cf, 'cheer', glow); anim = ' frames-anim'; }
  else if (pf.length) { body = framesHTML(pf, pose, glow); anim = ' frames-anim'; }
  else body = puppetHTML(st, pose);
  return `<div class="pet-shadow"></div><div class="pet-wrap ${m} pose-${pose}${walking ? ' walking' : ''}${anim}" style="--grow:${growScale()}"><div class="pet-body" style="--face:${face}">${body}${wearablesHTML()}</div><span class="mood-badge">${MOOD_EMOJI[m]}</span></div>`;
}
function rerenderPets() { $$('.pet-slot').forEach(s => { if (s.closest('.screen.active')) s.innerHTML = petHTML(); }); }
function popPet(slot) {
  const w = slot.querySelector('.pet-wrap');
  if (!w) return;
  w.classList.remove('pop');
  void w.offsetWidth;
  w.classList.add('pop');
}

/* ================= 성장(레벨 업 / 진화) ================= */
// XP가 바뀐 뒤 호출. 레벨 업 보너스와 토스트.
function checkGrowth() {
  const lv = petLevel();
  if (lv > S.lastLevelSeen) {
    const gained = lv - S.lastLevelSeen;
    S.coins += LEVEL_BONUS * gained;
    S.lastLevelSeen = lv;
    save();
    toast(`⬆️ 레벨 업! Lv.${lv}  🪙 +${LEVEL_BONUS * gained}`);
    SFX.coin();
  }
}

function showEvolve() {
  const st = stage();
  let bonusTxt = '';
  if (!S.album[st.key]) {
    S.album[st.key] = todayStr();
    S.coins += EVOLVE_BONUS;
    save();
    bonusTxt = `<div class="reward-box">진화 보너스 🪙 +${EVOLVE_BONUS}</div>`;
  }
  SFX.evolve();
  showModal({
    title: '🎉 진화했어요!',
    html: `<span class="big-emoji">${stageImg(st, 'evo', 'happy')}</span>${S.pet.name}이(가) <b>${st.name}</b> 단계가 되었어요!<br><small>${STAGE_DESC[st.key]}</small>${bonusTxt}`,
    buttons: [
      { label: '멋지다!', cls: 'primary', onClick: () => render() },
      { label: '📔 성장 앨범 보기', onClick: () => go('album') },
    ],
  });
}

/* ================= 출석 ================= */
// 오늘 처음 켰으면 도장 찍고 보상 지급. 찍었으면 true.
function checkAttendance() {
  const A = S.attend;
  const today = todayStr();
  if (A.lastDate === today) return false;
  A.cycleDay = (A.cycleDay % 7) + 1;
  A.total++;
  A.streak = A.lastDate === yesterdayStr() ? A.streak + 1 : 1;
  A.lastDate = today;
  const r = ATTEND_REWARDS[A.cycleDay - 1];
  S.food[r.food] += r.n;
  S.coins += r.coins;
  save();
  return true;
}
function attendanceHTML(justNow) {
  const A = S.attend;
  const cells = ATTEND_REWARDS.map((r, i) => {
    const day = i + 1;
    const done = day <= A.cycleDay;
    const isToday = day === A.cycleDay;
    const f = FOODS[r.food];
    return `<div class="stamp ${done ? 'done' : ''} ${isToday ? 'today' : ''} ${isToday && justNow ? 'pop' : ''} ${day === 7 ? 'big' : ''}">
      <div class="s-day">${day}일</div>
      <div class="s-icon">${done ? '✅' : f.emoji}</div>
      <div class="s-reward">${f.emoji}×${r.n}<br>🪙${r.coins}</div>
    </div>`;
  }).join('');
  return `<div class="stamps">${cells}</div><div class="hint center">총 ${A.total}일 출석 · 연속 ${A.streak}일</div>`;
}
function showAttendance(justNow) {
  const A = S.attend;
  const r = ATTEND_REWARDS[Math.max(0, A.cycleDay - 1)];
  const f = FOODS[r.food];
  const msg = justNow
    ? `<div class="reward-box">오늘의 선물: ${f.emoji} ${f.name} ${r.n}개 + 🪙 ${r.coins}</div>`
    : `<div class="hint center">오늘은 이미 출석했어요. 내일 또 만나요! 👋</div>`;
  if (justNow) SFX.stamp();
  showModal({
    title: justNow ? '📅 출석 도장 쾅!' : '📅 출석 도장',
    cls: 'wide',
    html: attendanceHTML(justNow) + msg,
    buttons: [{ label: justNow ? '받았어요!' : '닫기', cls: 'primary', onClick: () => { if (justNow) SFX.coin(); render(); } }],
  });
}

/* ================= 화면 전환 ================= */
let current = 'home';
function go(name) {
  current = name;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  render(name);
  stopWalking();
  walkX = 0; applyWalk(0);
  window.scrollTo(0, 0);
}
function render(name = current) {
  document.body.classList.toggle('night', isNight());
  const map = {
    home: renderHome, study: renderStudy, quiz: renderQuiz,
    pet: renderPetScreen, gugudan: renderGugudan, settings: renderSettings, album: renderAlbum, shop: renderShop,
  };
  if (map[name]) map[name]();
}

function renderBars(screenEl) {
  $$('.fill[data-bar]', screenEl).forEach(el => {
    const v = S.pet[el.dataset.bar];
    el.style.width = v + '%';
    el.classList.toggle('low', v < 30);
  });
}
function renderXp(fillEl, textEl, levelEl, stageEl) {
  const st = stage(), nx = nextStage();
  if (nx) {
    fillEl.style.width = (stageProgress() * 100) + '%';
    textEl.textContent = `다음 단계(${nx.name})까지 ${nx.xp - S.xp} XP`;
  } else {
    fillEl.style.width = '100%';
    textEl.textContent = '최고 단계에 도달했어요!';
  }
  levelEl.textContent = petLevel();
  stageEl.textContent = st.name;
}

/* ================= 홈 ================= */
function renderHome() {
  const el = $('#screen-home');
  $('#home-coins').textContent = S.coins;
  $('#home-streak').textContent = S.stats.streak;
  $('#home-pet').innerHTML = petHTML();
  $('#home-pet-name').textContent = S.pet.name;
  $('#home-speech').textContent = petSpeech();
  renderXp($('#home-xp-fill'), $('#home-xp-text'), $('#home-pet-level'), $('#home-stage-name'));
  renderBars(el);
  renderFurniture(el);
  const needs = S.pet.hunger < 30 || S.pet.happy < 30 || S.pet.clean < 30;
  $('#pet-alert').classList.toggle('hidden', !needs);
  $('#attend-day').textContent = S.attend.cycleDay;
}

/* ================= 꾸미기 상점 ================= */
let shopCat = 'hat';
function isEquipped(it) {
  const eq = S.items.equip;
  return it.cat === 'furniture' ? !!eq.furniture[it.id] : eq[it.cat] === it.id;
}
function renderShop() {
  $('#shop-coins').textContent = S.coins;
  $('#shop-pet').innerHTML = petHTML();
  renderFurniture($('#screen-shop'));
  $$('#shop-tabs button').forEach(b => b.classList.toggle('active', b.dataset.cat === shopCat));
  $('#shop-grid').innerHTML = ITEMS.filter(i => i.cat === shopCat).map(it => {
    const owned = !!S.items.owned[it.id];
    const on = isEquipped(it);
    let btn;
    if (!owned) btn = `<button class="item-btn buy" data-buy-item="${it.id}" ${S.coins < it.price ? 'disabled' : ''}>🪙 ${it.price}</button>`;
    else if (on) btn = `<button class="item-btn off" data-toggle-item="${it.id}">벗기</button>`;
    else btn = `<button class="item-btn on" data-toggle-item="${it.id}">착용</button>`;
    return `<div class="item-card ${owned ? 'owned' : ''} ${on ? 'equipped' : ''}">
      <span class="i-emoji">${it.emoji}</span><span class="i-name">${it.name}</span>${btn}
    </div>`;
  }).join('');
}
function buyItem(id) {
  const it = ITEM_BY_ID[id];
  if (!it || S.items.owned[id]) return;
  if (S.coins < it.price) { toast('코인이 부족해요. 문제를 풀어보자!'); return; }
  S.coins -= it.price;
  S.items.owned[id] = true;
  equipItem(id, true);
  SFX.coin();
  toast(`${it.emoji} ${it.name} 샀어요! 바로 착용했어요`);
}
function equipItem(id, on) {
  const it = ITEM_BY_ID[id];
  if (!it || !S.items.owned[id]) return;
  const eq = S.items.equip;
  if (it.cat === 'furniture') { if (on) eq.furniture[id] = true; else delete eq.furniture[id]; }
  else eq[it.cat] = on ? id : null;
  save();
  renderShop();
  react('happy', 1200);
}

/* ================= 성장 앨범 ================= */
function renderAlbum() {
  const cur = stageIndex();
  $('#album-summary').textContent = `Lv.${petLevel()} · 총 ${S.xp} XP · 정답 ${S.stats.correct}개`;
  $('#album-list').innerHTML = STAGES.map((s, i) => {
    const unlocked = i <= cur;
    const isCur = i === cur;
    const img = unlocked ? stageImg(s) : `<span class="pet-emoji locked">❓</span>`;
    let sub;
    if (isCur) { const nx = nextStage(); sub = nx ? `다음 단계까지 ${nx.xp - S.xp} XP` : '최고 단계 달성!'; }
    else if (unlocked) sub = `${S.album[s.key] || ''} 달성 ✔`;
    else sub = `${s.xp} XP 필요 · ${s.xp - S.xp} XP 더 모으기`;
    return `<div class="album-card ${unlocked ? 'on' : 'off'} ${isCur ? 'cur' : ''}">
      <div class="a-img">${img}</div>
      <div class="a-info">
        <div class="a-name">${i + 1}단계 · ${unlocked ? s.name : '???'} ${isCur ? '<span class="a-badge">지금</span>' : ''}</div>
        <div class="a-desc">${unlocked ? STAGE_DESC[s.key] : '더 키우면 알 수 있어요'}</div>
        <div class="a-sub">${sub}</div>
        ${isCur ? `<div class="xp-bar small"><div class="xp-fill" style="width:${stageProgress() * 100}%"></div></div>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ================= 공부 선택 ================= */
function renderStudy() {
  ensureDaily();
  if (!levelUnlocked(S.settings.level)) S.settings.level = 1;
  const lv = S.settings.level;
  $$('#level-segment button').forEach(b => {
    const l = +b.dataset.level;
    b.classList.toggle('active', l === lv);
    b.classList.toggle('locked', !levelUnlocked(l));
    b.textContent = `${l}단계${levelDoneToday(l) ? ' ✅' : (!levelUnlocked(l) ? ' 🔒' : '')}`;
  });
  let desc = LEVEL_DESC[lv];
  if (levelDoneToday(lv)) desc += `<br>오늘 이미 다 푼 단계예요. 또 풀면 복습(코인 절반)!${lv < 3 ? ` ${lv + 1}단계에 도전해 봐요.` : ''}`;
  else if (lv < 3) desc += `<br>10문제를 다 풀면 ${lv + 1}단계가 열려요.`;
  $('#level-desc').innerHTML = desc;
  $$('.topic-card').forEach(b => {
    const t = b.dataset.topic;
    let tag = $('.t-coin', b);
    if (!tag) { tag = document.createElement('span'); tag.className = 't-coin'; b.appendChild(tag); }
    tag.textContent = t === 'mix' ? `🪙 ${coinFor('add', lv)}~${coinFor('div', lv)}` : `🪙 ${coinFor(t, lv)}`;
  });
  $('#study-hint').textContent = `한 번에 10문제 · 정답마다 🪙 ${coinFor('add', lv)}~${coinFor('div', lv)}개 · 3연속 정답 +${streakBonus(lv)}`;
}

/* ================= 문제 생성 ================= */
function danRange(level) {
  return level === 1 ? rnd(2, 5) : level === 2 ? rnd(6, 9) : rnd(2, 9);
}
function genProblem(topic, level, dan) {
  let a, b, ans;
  switch (topic) {
    case 'add':
      if (level === 1)      { a = rnd(1, 9); b = rnd(1, 10 - a); }
      else if (level === 2) { a = rnd(1, 19); b = rnd(1, 20 - a); }
      else                  { a = rnd(10, 89); b = rnd(1, 99 - a); }
      ans = a + b; break;
    case 'sub':
      if (level === 1)      { a = rnd(2, 10); b = rnd(1, a); }
      else if (level === 2) { a = rnd(2, 20); b = rnd(1, a); }
      else                  { a = rnd(10, 99); b = rnd(1, a); }
      ans = a - b; break;
    case 'mul':
      a = dan || danRange(level); b = rnd(1, 9);
      ans = a * b; break;
    case 'div': {
      const d = dan || danRange(level);
      const q = rnd(1, 9);
      a = d * q; b = d; ans = q; break;
    }
  }
  return { topic, a, b, sym: TOPICS[topic].sym, ans, text: `${a} ${TOPICS[topic].sym} ${b}` };
}

/* ================= 오답 풀이 설명 ================= */
function dots(n, cls = '', strike = 0) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<span class="dot ${cls} ${i >= n - strike ? 'x' : ''}"></span>`;
  return `<div class="dots">${s}</div>`;
}
function dotGrid(cols, rows) {
  let s = '';
  for (let r = 0; r < rows; r++) s += dots(cols, r % 2 ? 'b' : 'r');
  return `<div class="dot-grid">${s}</div>`;
}
function dotGroups(groups, per) {
  let s = '';
  for (let g = 0; g < groups; g++) s += `<div class="dot-group">${dots(per, g % 2 ? 'b' : 'r')}</div>`;
  return `<div class="dot-groups">${s}</div>`;
}
const steps = (...lines) => `<ol class="steps">${lines.map(l => `<li>${l}</li>`).join('')}</ol>`;
const split10 = n => [Math.floor(n / 10) * 10, n % 10];

function explainHTML(p) {
  const { a, b, ans, topic } = p;
  const eq = `<div class="ex-eq">${p.text} = <b>${ans}</b></div>`;
  let body = '';
  if (topic === 'add') {
    if (ans <= 10) {
      body = dots(a, 'r') + `<div class="ex-op">+</div>` + dots(b, 'b')
        + steps(`빨간 점 <b>${a}</b>개, 파란 점 <b>${b}</b>개`, `이어서 세어 보면 모두 <b>${ans}</b>개!`);
    } else if (a < 10 && b < 10) {
      const need = 10 - a, rest = b - need;
      body = steps(
        `<b>10 만들기!</b> ${a}에 <b>${need}</b>을(를) 더하면 10`,
        `${b}에서 ${need}을(를) 주고 나면 <b>${rest}</b> 남아요`,
        `10 + ${rest} = <b>${ans}</b>`);
    } else if (a < 10 || b < 10) {
      const big = Math.max(a, b), small = Math.min(a, b);
      const [tb, ob] = split10(big);
      body = ob === 0
        ? steps(`${big}에 ${small}을(를) 그냥 붙여요`, `${big} + ${small} = <b>${ans}</b>`)
        : steps(`<b>${big}</b>은(는) ${tb}과(와) <b>${ob}</b>`, `${ob} + ${small} = <b>${ob + small}</b>`, `${tb} + ${ob + small} = <b>${ans}</b>`);
    } else {
      const [ta, oa] = split10(a), [tb, ob] = split10(b);
      body = steps(
        `십의 자리끼리: ${ta} + ${tb} = <b>${ta + tb}</b>`,
        `일의 자리끼리: ${oa} + ${ob} = <b>${oa + ob}</b>`,
        `${ta + tb} + ${oa + ob} = <b>${ans}</b>`);
    }
  } else if (topic === 'sub') {
    if (a <= 10) {
      body = dots(a, 'r', b)
        + steps(`점 <b>${a}</b>개에서 <b>${b}</b>개를 지워요`, `남은 점을 세어 보면 <b>${ans}</b>개!`);
    } else if (b < 10) {
      const [ta, oa] = split10(a);
      if (oa === 0) {
        body = steps(`<b>${a}</b>은(는) ${ta - 10}과(와) <b>10</b>`, `10 − ${b} = <b>${10 - b}</b>`, `${ta - 10} + ${10 - b} = <b>${ans}</b>`);
      } else if (b <= oa) {
        body = steps(`<b>${a}</b>은(는) ${ta}과(와) <b>${oa}</b>`, `${oa} − ${b} = <b>${oa - b}</b>`, `${ta} + ${oa - b} = <b>${ans}</b>`);
      } else {
        body = steps(`<b>${a}</b>에서 먼저 <b>${oa}</b>을(를) 빼면 ${ta}`, `아직 <b>${b - oa}</b>을(를) 더 빼야 해요`, `${ta} − ${b - oa} = <b>${ans}</b>`);
      }
    } else {
      const [ta, oa] = split10(a), [tb, ob] = split10(b);
      if (ob <= oa) {
        body = steps(
          `십의 자리끼리: ${ta} − ${tb} = <b>${ta - tb}</b>`,
          `일의 자리끼리: ${oa} − ${ob} = <b>${oa - ob}</b>`,
          `${ta - tb} + ${oa - ob} = <b>${ans}</b>`);
      } else {
        const mid = a - tb;
        body = steps(`먼저 ${tb}을(를) 빼요: ${a} − ${tb} = <b>${mid}</b>`, `그다음 ${ob}을(를) 빼요: ${mid} − ${ob} = <b>${ans}</b>`);
      }
    }
  } else if (topic === 'mul') {
    const adds = Array(b).fill(a).join(' + ');
    body = dotGrid(a, b) + steps(
      `한 줄에 <b>${a}</b>개씩 <b>${b}</b>줄이에요`,
      b === 1 ? `${a}이(가) 한 번이니까 <b>${ans}</b>` : `${adds} = <b>${ans}</b>`,
      `구구단으로: ${a} × ${b} = <b>${ans}</b>`);
  } else {
    body = dotGroups(ans, b) + steps(
      `<b>${a}</b>개를 <b>${b}</b>개씩 묶어요`,
      `묶음이 <b>${ans}</b>개 생겼어요!`,
      `${b}단에서 찾기: ${b} × <b>${ans}</b> = ${a}`);
  }
  return eq + body;
}

/* ================= 퀴즈 ================= */
let Q = null;
function startQuiz(topic, dan = null) {
  const level = S.settings.level;
  const problems = [];
  let last = '';
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    const t = topic === 'mix' ? pick(['add', 'sub', 'mul', 'div']) : topic;
    let p, tries = 0;
    do { p = genProblem(t, level, dan); tries++; } while (p.text === last && tries < 10);
    last = p.text;
    problems.push(p);
  }
  Q = {
    topic, dan, level, problems, idx: 0,
    correct: 0, streak: 0, coins: 0, answer: '', locked: false, retry: false,
    review: levelDoneToday(level),   // 오늘 이미 완료한 단계 → 복습(코인 절반)
    stageBefore: stageIndex(),
  };
  go('quiz');
  if (Q.review) toast('오늘 이미 푼 단계라서 복습이에요 (코인 절반)');
}

function renderQuiz() {
  if (!Q) { go('home'); return; }
  const p = Q.problems[Q.idx];
  $('#quiz-progress').style.width = (Q.idx / QUIZ_LENGTH) * 100 + '%';
  $('#quiz-count').textContent = `${Q.idx + 1}/${QUIZ_LENGTH}`;
  $('#problem-text').textContent = p.text + ' =';
  $('#answer-text').textContent = Q.answer;
  $('#quiz-pet').innerHTML = petHTML();
  const sc = $('#quiz-streak');
  sc.classList.toggle('hidden', Q.streak < 2);
  sc.querySelector('span').textContent = Q.streak;
  $('#quiz-retry').classList.toggle('hidden', !Q.retry);
}

function keyPress(key) {
  if (!Q || Q.locked) return;
  if (key === 'back') { Q.answer = Q.answer.slice(0, -1); SFX.tap(); }
  else if (key === 'ok') { submitAnswer(); return; }
  else if (Q.answer.length < 3) { Q.answer += key; SFX.tap(); }
  $('#answer-text').textContent = Q.answer;
}

function showFeedback(ok, text) {
  const fb = $('#quiz-feedback');
  $('#quiz-feedback-text').innerHTML = text;
  fb.classList.remove('ok', 'bad');
  fb.classList.add('show', ok ? 'ok' : 'bad');
}
function hideFeedback() { $('#quiz-feedback').classList.remove('show'); }
function shakeAnswer() { const ab = $('#answer-box'); ab.classList.remove('shake'); void ab.offsetWidth; ab.classList.add('shake'); }

function nextProblem() {
  Q.idx++; Q.answer = ''; Q.locked = false; Q.retry = false;
  if (Q.idx >= QUIZ_LENGTH) finishQuiz();
  else renderQuiz();
}
function showExplain(p) {
  showModal({
    title: '💡 이렇게 풀어요',
    cls: 'wide',
    html: explainHTML(p),
    buttons: [
      { label: '알겠어요! 다음 문제 →', cls: 'primary', onClick: nextProblem },
      { label: '다시 풀어볼래요', onClick: () => { Q.answer = ''; Q.locked = false; Q.retry = true; renderQuiz(); } },
    ],
  });
}

function submitAnswer() {
  if (!Q || Q.locked) return;
  if (Q.answer === '') { shakeAnswer(); return; }
  const p = Q.problems[Q.idx];
  const ok = parseInt(Q.answer, 10) === p.ans;
  Q.locked = true;

  // 풀이를 보고 다시 푸는 중: 점수/코인 없이 격려만
  if (Q.retry) {
    if (ok) {
      S.xp += 2; save();
      SFX.correct(); popPet($('#quiz-pet'));
      showFeedback(true, `맞았어요! 👍<br><small>이제 알겠지?</small>`);
      setTimeout(() => { hideFeedback(); nextProblem(); }, 1000);
    } else {
      SFX.wrong(); shakeAnswer();
      showFeedback(false, `다시 한번 볼까?`);
      setTimeout(() => { hideFeedback(); showExplain(p); }, 900);
    }
    return;
  }

  const stat = S.stats.byTopic[p.topic];
  if (ok) {
    Q.correct++; Q.streak++;
    let gain = coinFor(p.topic, Q.level);
    if (Q.streak >= 3) gain += streakBonus(Q.level);
    if (Q.review) gain = Math.ceil(gain * REVIEW_RATE);
    Q.coins += gain; S.coins += gain; S.xp += 5;
    S.stats.correct++; stat[0]++;
    SFX.correct();
    react('happy', 900);
    popPet($('#quiz-pet'));
    showFeedback(true, `정답! 🎉<br><small>🪙 +${gain}${Q.streak >= 3 ? ' (연속 보너스!)' : ''}</small>`);
    save();
    setTimeout(() => { hideFeedback(); nextProblem(); }, 900);
  } else {
    Q.streak = 0;
    S.stats.wrong++; stat[1]++;
    SFX.wrong();
    shakeAnswer();
    showFeedback(false, `아쉬워요!<br><small>${p.text} = <b>${p.ans}</b></small>`);
    save();
    setTimeout(() => { hideFeedback(); showExplain(p); }, 1200);
  }
}

function quitQuiz() {
  showModal({
    title: '그만할까요?',
    html: '지금까지 받은 코인은 그대로 남아요.',
    buttons: [
      { label: '계속 풀기', cls: 'primary' },
      { label: '그만하기', onClick: () => { Q = null; go('home'); } },
    ],
  });
}

function finishQuiz() {
  const c = Q.correct;
  const stars = c >= 9 ? 3 : c >= 7 ? 2 : 1;
  const rewardKey = stars === 3 ? 'cake' : stars === 2 ? 'cookie' : 'apple';
  let bonus = starBonus(stars, Q.level);
  if (Q.review) bonus = Math.ceil(bonus * REVIEW_RATE);
  S.coins += bonus;
  S.food[rewardKey]++;
  S.stats.sessions++;
  // 학습 사다리: 오늘 이 단계 첫 완료면 다음 단계 열기
  ensureDaily();
  const firstToday = S.daily.done[Q.level] === 0;
  S.daily.done[Q.level]++;
  let unlockMsg = '';
  if (firstToday && Q.level < 3) { S.settings.level = Q.level + 1; unlockMsg = `🔓 ${Q.level + 1}단계가 열렸어요! 다음엔 더 많은 코인을 받아요.`; }
  else if (firstToday && Q.level === 3) unlockMsg = '🏆 오늘 3단계까지 모두 완료!';
  const unlockEl = $('#result-unlock');
  unlockEl.textContent = unlockMsg;
  unlockEl.classList.toggle('hidden', !unlockMsg);
  const today = todayStr();
  if (S.stats.lastPlayDate !== today) {
    S.stats.streak = S.stats.lastPlayDate === yesterdayStr() ? S.stats.streak + 1 : 1;
    S.stats.lastPlayDate = today;
  }
  if (Q.dan) S.stats.dan[Q.dan] = Math.max(S.stats.dan[Q.dan] || 0, stars);
  save();

  $('#result-title').textContent = stars === 3 ? '완벽해요! 🏆' : stars === 2 ? '잘했어요! 👏' : '수고했어요! 💪';
  $$('#result-stars span').forEach((s, i) => { s.textContent = i < stars ? '★' : '☆'; s.classList.toggle('on', i < stars); });
  $('#result-pet').innerHTML = petHTML();
  $('#result-correct').textContent = c;
  $('#result-coins').textContent = Q.coins + bonus;
  const f = FOODS[rewardKey];
  $('#result-reward').innerHTML = `<span class="r-emoji">${f.emoji}</span>간식 선물: ${f.name} 1개!`;
  go('result');
  SFX.coin();
  checkGrowth();
  if (stageIndex() > Q.stageBefore) setTimeout(showEvolve, 700);
}

/* ================= 펫 돌보기 ================= */
function renderPetScreen() {
  const el = $('#screen-pet');
  $('#pet-title').textContent = `${S.pet.name} 돌보기`;
  $('#pet-coins').textContent = S.coins;
  $('#pet-pet').innerHTML = petHTML();
  $('#pet-speech').textContent = petSpeech();
  renderXp($('#pet-xp-fill'), $('#pet-xp-text'), $('#pet-level'), $('#pet-stage-name'));
  renderBars(el);
  renderFurniture(el);

  $('#food-row').innerHTML = Object.entries(FOODS).map(([k, f]) =>
    `<button class="food-btn" data-feed="${k}" ${S.food[k] <= 0 ? 'disabled' : ''}>
       <span class="f-emoji">${f.emoji}</span><span class="f-name">${f.name}</span><span class="f-count">${S.food[k]}개</span>
     </button>`).join('');
  $('#shop-row').innerHTML = Object.entries(FOODS).map(([k, f]) =>
    `<button class="food-btn shop" data-buy="${k}" ${S.coins < f.price ? 'disabled' : ''}>
       <span class="f-emoji">${f.emoji}</span><span class="f-name">${f.name}</span><span class="f-count">🪙 ${f.price}</span>
     </button>`).join('');
  $('#btn-play').disabled = S.coins < PLAY_COST;
  $('#btn-wash').disabled = S.coins < WASH_COST;
}

function withEvolveCheck(fn) {
  const before = stageIndex();
  fn();
  save();
  checkGrowth();
  renderPetScreen();
  if (stageIndex() > before) setTimeout(showEvolve, 400);
}

function feed(key) {
  const f = FOODS[key];
  if (S.food[key] <= 0) return;
  if (S.pet.hunger >= 95) { toast('지금은 배불러요! 😋'); return; }
  withEvolveCheck(() => {
    S.food[key]--;
    S.pet.hunger = clamp(S.pet.hunger + f.hunger);
    S.pet.happy = clamp(S.pet.happy + f.happy);
    S.xp += f.xp;
    SFX.eat();
  });
  react('eat', 1800);
  popPet($('#pet-pet'));
  $('#pet-speech').textContent = pick(['냠냠! 맛있어! 😋', '고마워!', '더 먹고 싶어!']);
  floatText($('#pet-pet'), `${f.emoji} +${f.xp} XP`);
}
function buy(key) {
  const f = FOODS[key];
  if (S.coins < f.price) { toast('코인이 부족해요. 문제를 풀어보자!'); return; }
  S.coins -= f.price;
  S.food[key]++;
  SFX.coin();
  save();
  renderPetScreen();
  toast(`${f.emoji} ${f.name} 샀어요!`);
}
function play() {
  if (S.coins < PLAY_COST) { toast('코인이 부족해요. 문제를 풀어보자!'); return; }
  withEvolveCheck(() => {
    S.coins -= PLAY_COST;
    S.pet.happy = clamp(S.pet.happy + 20);
    S.pet.hunger = clamp(S.pet.hunger - 3);
    S.xp += 3;
    SFX.correct();
  });
  react('happy', 1500);
  popPet($('#pet-pet'));
  $('#pet-speech').textContent = pick(['재밌다! 🎈', '또 놀자!', '신난다~!']);
  floatText($('#pet-pet'), '🎈 +20');
}
function wash() {
  if (S.coins < WASH_COST) { toast('코인이 부족해요. 문제를 풀어보자!'); return; }
  withEvolveCheck(() => {
    S.coins -= WASH_COST;
    S.pet.clean = 100;
    S.pet.happy = clamp(S.pet.happy + 5);
    S.xp += 3;
    SFX.eat();
  });
  react('happy', 1500);
  popPet($('#pet-pet'));
  $('#pet-speech').textContent = pick(['깨끗해졌다! ✨', '시원해~ 🛁', '반짝반짝!']);
  floatText($('#pet-pet'), '🛁 깨끗!');
}

/* ================= 구구단 ================= */
let selectedDan = null;
function renderGugudan() {
  $('#dan-grid').innerHTML = [2, 3, 4, 5, 6, 7, 8, 9].map(d => {
    const st = S.stats.dan[d] || 0;
    return `<button class="dan-btn ${selectedDan === d ? 'active' : ''}" data-dan="${d}">
      <span class="d-num">${d}단</span><span class="d-stars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>
    </button>`;
  }).join('');
  const panel = $('#dan-panel');
  if (selectedDan) {
    panel.classList.remove('hidden');
    $('#dan-title').textContent = `${selectedDan}단`;
    $('#dan-list').innerHTML = Array.from({ length: 9 }, (_, i) =>
      `<li data-i="${i}">${selectedDan} × ${i + 1} = ${selectedDan * (i + 1)}</li>`).join('');
  } else {
    panel.classList.add('hidden');
  }
}
let speaking = false;
function speakDan() {
  if (!('speechSynthesis' in window) || !selectedDan || speaking) return;
  const items = $$('#dan-list li');
  const KO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const num = n => n < 10 ? KO[n] : (n < 20 ? '십' + KO[n % 10] : KO[Math.floor(n / 10)] + '십' + KO[n % 10]);
  speaking = true;
  window.speechSynthesis.cancel();
  items.forEach((li, i) => {
    const d = selectedDan, b = i + 1;
    const u = new SpeechSynthesisUtterance(`${num(d)} ${num(b)}은 ${num(d * b)}`);
    u.lang = 'ko-KR'; u.rate = 0.9;
    u.onstart = () => { items.forEach(x => x.classList.remove('speaking')); li.classList.add('speaking'); };
    if (i === items.length - 1) u.onend = () => { speaking = false; li.classList.remove('speaking'); };
    window.speechSynthesis.speak(u);
  });
}

/* ================= 설정 ================= */
function renderSettings() {
  $('#input-pet-name').value = S.pet.name;
  $('#btn-sound').textContent = S.settings.sound ? '🔊 소리 켜짐' : '🔇 소리 꺼짐';
  const rows = Object.entries(TOPICS).map(([k, t]) => {
    const [c, w] = S.stats.byTopic[k];
    const total = c + w;
    const pct = total ? Math.round((c / total) * 100) : 0;
    return `<tr><td>${t.name}</td><td>${c}</td><td>${w}</td><td>${total ? pct + '%' : '-'}</td></tr>`;
  }).join('');
  $('#stats-table').innerHTML = `<tr><th>영역</th><th>정답</th><th>오답</th><th>정답률</th></tr>${rows}`;
  $('#stats-summary').textContent = `총 ${S.stats.sessions}회 학습 · 연속 학습 ${S.stats.streak}일 · 출석 ${S.attend.total}일 · 전체 정답 ${S.stats.correct}개`;
}

/* ================= 공용 UI ================= */
function showModal({ title, html, buttons, cls = '' }) {
  $('#modal .modal-box').className = 'modal-box ' + cls;
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = html;
  const bb = $('#modal-buttons');
  bb.innerHTML = '';
  buttons.forEach(b => {
    const el = document.createElement('button');
    el.className = 'big-btn ' + (b.cls || '');
    el.textContent = b.label;
    el.onclick = () => { hideModal(); if (b.onClick) b.onClick(); };
    bb.appendChild(el);
  });
  $('#modal').classList.add('show');
  $('#modal').scrollTop = 0;
}
function hideModal() { $('#modal').classList.remove('show'); }

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}
function floatText(anchor, text) {
  const r = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = (r.left + r.width / 2 - 40) + 'px';
  el.style.top = (r.top + 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* ================= 이벤트 ================= */
function bind() {
  // 공통 뒤로가기 / 이동
  $$('[data-go]').forEach(b => b.addEventListener('click', () => { SFX.tap(); go(b.dataset.go); }));

  // 홈
  $('#btn-study').onclick = () => { SFX.tap(); go('study'); };
  $('#btn-pet').onclick = () => { SFX.tap(); go('pet'); };
  $('#btn-gugudan').onclick = () => { SFX.tap(); go('gugudan'); };
  $('#btn-settings').onclick = () => { SFX.tap(); go('settings'); };
  $('#btn-attend').onclick = () => { SFX.tap(); showAttendance(checkAttendance()); };
  $('#btn-album').onclick = () => { SFX.tap(); go('album'); };
  $('#btn-shop').onclick = () => { SFX.tap(); go('shop'); };

  // 꾸미기 상점
  $('#shop-tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    SFX.tap(); shopCat = b.dataset.cat; renderShop();
  });
  $('#shop-grid').addEventListener('click', e => {
    const buy = e.target.closest('[data-buy-item]');
    if (buy) { buyItem(buy.dataset.buyItem); return; }
    const tg = e.target.closest('[data-toggle-item]');
    if (tg) { SFX.tap(); const it = ITEM_BY_ID[tg.dataset.toggleItem]; equipItem(it.id, !isEquipped(it)); }
  });
  $('#shop-pet').onclick = () => { react('happy', 1200); SFX.tap(); };
  $('#home-pet').onclick = () => { react('happy', 1200); popPet($('#home-pet')); SFX.tap(); $('#home-speech').textContent = petSpeech(); };

  // 공부 선택
  $$('#level-segment button').forEach(b => b.onclick = () => {
    const l = +b.dataset.level;
    if (!levelUnlocked(l)) { SFX.wrong(); toast(`먼저 ${l - 1}단계를 오늘 한 번 다 풀면 열려요 🔒`); return; }
    S.settings.level = l; save(); SFX.tap(); renderStudy();
  });
  $$('.topic-card').forEach(b => b.onclick = () => { SFX.tap(); startQuiz(b.dataset.topic); });

  // 퀴즈
  $('#keypad').addEventListener('click', e => {
    const btn = e.target.closest('button[data-key]');
    if (btn) keyPress(btn.dataset.key);
  });
  document.addEventListener('keydown', e => {
    if (current !== 'quiz') return;
    if (/^[0-9]$/.test(e.key)) keyPress(e.key);
    else if (e.key === 'Backspace') keyPress('back');
    else if (e.key === 'Enter') keyPress('ok');
  });
  $('#btn-quiz-quit').onclick = quitQuiz;

  // 결과
  $('#btn-result-pet').onclick = () => { SFX.tap(); go('pet'); };
  $('#btn-result-retry').onclick = () => { SFX.tap(); if (Q) startQuiz(Q.topic, Q.dan); else go('study'); };

  // 펫
  $('#food-row').addEventListener('click', e => { const b = e.target.closest('[data-feed]'); if (b) feed(b.dataset.feed); });
  $('#shop-row').addEventListener('click', e => { const b = e.target.closest('[data-buy]'); if (b) buy(b.dataset.buy); });
  $('#btn-play').onclick = play;
  $('#btn-wash').onclick = wash;
  $('#pet-pet').onclick = () => {
    react('happy', 1200); popPet($('#pet-pet')); SFX.tap();
    S.pet.happy = clamp(S.pet.happy + 1); save(); renderBars($('#screen-pet'));
    $('#pet-speech').textContent = pick(['히히 😆', '간지러워!', '안녕!', '좋아해!']);
  };

  // 구구단
  $('#dan-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-dan]');
    if (!b) return;
    SFX.tap();
    selectedDan = +b.dataset.dan;
    renderGugudan();
    $('#dan-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#btn-dan-speak').onclick = speakDan;
  $('#btn-dan-practice').onclick = () => { SFX.tap(); startQuiz('mul', selectedDan); };
  $('#btn-dan-div').onclick = () => { SFX.tap(); startQuiz('div', selectedDan); };

  // 설정
  $('#btn-save-name').onclick = () => {
    const v = $('#input-pet-name').value.trim();
    if (!v) { toast('이름을 입력해 주세요'); return; }
    S.pet.name = v; save(); toast(`이름이 "${v}"로 바뀌었어요!`); SFX.coin();
  };
  $('#btn-sound').onclick = () => { S.settings.sound = !S.settings.sound; save(); renderSettings(); SFX.tap(); };
  $('#btn-reset').onclick = () => showModal({
    title: '정말 지울까요?',
    html: '펫, 코인, 학습 기록이 모두 사라져요.<br>되돌릴 수 없어요.',
    buttons: [
      { label: '취소', cls: 'primary' },
      { label: '모두 지우기', cls: 'danger', onClick: () => { localStorage.removeItem(SAVE_KEY); load(); go('home'); showWelcome(checkAttendance()); } },
    ],
  });
}

function showWelcome(attendedNow) {
  showModal({
    title: '🌰 도토리를 발견했어요!',
    html: `<span class="big-emoji">${stageImg(STAGES[0], 'evo')}</span>도토리 안에 아기 다람쥐가 자고 있어요!<br>수학 문제를 풀면 <b>코인</b>과 <b>간식</b>을 받아요.<br>간식을 주고 놀아주면 멋진 다람쥐로 자라요!`,
    buttons: [{ label: '시작하기!', cls: 'primary', onClick: () => { S.tutorialSeen = true; save(); if (attendedNow) showAttendance(true); } }],
  });
}

/* ================= 시작 ================= */
async function init() {
  load();
  tickPet();
  save();
  bind();
  await probeImages();
  ready = true;
  go('home');
  const attended = checkAttendance();
  if (!S.tutorialSeen) showWelcome(attended);
  else if (attended) showAttendance(true);

  // PWA: 오프라인 캐시 + 안드로이드 설치 버튼
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    const btn = $('#btn-install');
    btn.classList.remove('hidden');
    btn.onclick = () => { e.prompt(); btn.classList.add('hidden'); };
  });

  setInterval(() => { tickPet(); save(); if (current === 'home' || current === 'pet') render(); }, 60 * 1000);
  idleTimer = setTimeout(idleAct, 2500);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      tickPet(); save();
      if (checkAttendance()) showAttendance(true);
      render();
    }
  });
}
document.addEventListener('DOMContentLoaded', init);
})();
