// Random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// さくらんぼ計算（たし算）
function additionQuestion(level) {
  let a, b
  switch (level) {
    case 1: // 一けた＋一けた
      a = rand(1, 9)
      b = rand(1, 9)
      break
    case 2: // 二けた＋一けた
      a = rand(10, 99)
      b = rand(1, 9)
      break
    case 3: // 二けた＋二けた
      a = rand(10, 99)
      b = rand(10, 99)
      break
    default:
      a = rand(1, 9)
      b = rand(1, 9)
  }
  return { a, b, op: '+', answer: a + b, display: `${a} + ${b}` }
}

// さくらんぼ計算（ひき算）
function subtractionQuestion(level) {
  let a, b
  switch (level) {
    case 4: // 二けた−一けた
      a = rand(11, 99)
      b = rand(1, Math.min(9, a - 1))
      break
    case 5: // 二けた−二けた
      a = rand(20, 99)
      b = rand(10, a - 1)
      break
    case 6: // 三けた−二けた
      a = rand(100, 999)
      b = rand(10, 99)
      break
    default:
      a = rand(11, 99)
      b = rand(1, 9)
  }
  return { a, b, op: '-', answer: a - b, display: `${a} − ${b}` }
}

// おみやげ算（かけ算）11×11 〜 19×19
function multiplicationQuestion(level) {
  let aMin, aMax, bMin, bMax
  switch (level) {
    case 7:  aMin = 11; aMax = 11; bMin = 11; bMax = 19; break
    case 8:  aMin = 12; aMax = 12; bMin = 11; bMax = 19; break
    case 9:  aMin = 13; aMax = 13; bMin = 11; bMax = 19; break
    case 10: aMin = 14; aMax = 14; bMin = 11; bMax = 19; break
    case 11: aMin = 15; aMax = 15; bMin = 11; bMax = 19; break
    case 12: aMin = 16; aMax = 16; bMin = 11; bMax = 19; break
    case 13: aMin = 17; aMax = 19; bMin = 11; bMax = 19; break
    default: aMin = 11; aMax = 19; bMin = 11; bMax = 19; break
  }
  const a = rand(aMin, aMax)
  const b = rand(bMin, bMax)
  return { a, b, op: '×', answer: a * b, display: `${a} × ${b}` }
}

export function generateQuestion(level) {
  if (level >= 1 && level <= 3) return additionQuestion(level)
  if (level >= 4 && level <= 6) return subtractionQuestion(level)
  return multiplicationQuestion(level)
}

export function generateTimeAttackQuestion() {
  const a = rand(11, 19)
  const b = rand(11, 19)
  return { a, b, op: '×', answer: a * b, display: `${a} × ${b}` }
}

// おみやげ算ヒント
export function getOmiyageHint(a, b) {
  const onesA = a - 10
  const onesB = b - 10
  const step1 = a + onesB
  const step2 = onesA * onesB
  return {
    steps: [
      `${a} + ${onesB} = ${step1}`,
      `${step1} × 10 = ${step1 * 10}`,
      `${onesA} × ${onesB} = ${step2}`,
      `${step1 * 10} + ${step2} = ${a * b}`,
    ],
    method: 'おみやげ算',
  }
}

// さくらんぼ計算ヒント（たし算）
export function getSakuranboAddHint(a, b) {
  const target = 10 - (a % 10 || 10)
  if (target > 0 && target <= b) {
    const rest = b - target
    return {
      steps: [
        `${b} を ${target} と ${rest} にわける`,
        `${a} + ${target} = ${a + target}`,
        `${a + target} + ${rest} = ${a + b}`,
      ],
      method: 'さくらんぼ計算',
    }
  }
  return { steps: [`${a} + ${b} = ${a + b}`], method: 'そのまま計算' }
}

// さくらんぼ計算ヒント（ひき算）
export function getSakuranboSubHint(a, b) {
  const ones = a % 10
  if (b <= ones) {
    return { steps: [`${a} − ${b} = ${a - b}`], method: 'そのまま計算' }
  }
  const rest = b - ones
  return {
    steps: [
      `${b} を ${ones} と ${rest} にわける`,
      `${a} − ${ones} = ${a - ones}`,
      `${a - ones} − ${rest} = ${a - b}`,
    ],
    method: 'さくらんぼ計算',
  }
}

export function getHint(question) {
  if (question.op === '×') return getOmiyageHint(question.a, question.b)
  if (question.op === '+') return getSakuranboAddHint(question.a, question.b)
  return getSakuranboSubHint(question.a, question.b)
}

export const LEVELS = [
  { id: 1, name: 'Lv.1', desc: '一けた＋一けた', category: 'さくらんぼ計算（たし算）', icon: '🍒' },
  { id: 2, name: 'Lv.2', desc: '二けた＋一けた', category: 'さくらんぼ計算（たし算）', icon: '🍒' },
  { id: 3, name: 'Lv.3', desc: '二けた＋二けた', category: 'さくらんぼ計算（たし算）', icon: '🍒' },
  { id: 4, name: 'Lv.4', desc: '二けた−一けた', category: 'さくらんぼ計算（ひき算）', icon: '🍒' },
  { id: 5, name: 'Lv.5', desc: '二けた−二けた', category: 'さくらんぼ計算（ひき算）', icon: '🍒' },
  { id: 6, name: 'Lv.6', desc: '三けた−二けた', category: 'さくらんぼ計算（ひき算）', icon: '🍒' },
  { id: 7, name: 'Lv.7', desc: '11×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 8, name: 'Lv.8', desc: '12×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 9, name: 'Lv.9', desc: '13×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 10, name: 'Lv.10', desc: '14×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 11, name: 'Lv.11', desc: '15×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 12, name: 'Lv.12', desc: '16×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 13, name: 'Lv.13', desc: '17〜19×11〜19', category: 'おみやげ算（かけ算）', icon: '🎁' },
  { id: 14, name: 'Lv.14', desc: '全範囲ミックス', category: 'おみやげ算（かけ算）', icon: '🎁' },
]

export const QUESTIONS_PER_GAME = 10
export const TIME_ATTACK_SECONDS = 60
