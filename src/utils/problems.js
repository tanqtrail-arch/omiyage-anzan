// Random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a problem for the given level
export function generateProblem(level) {
  switch (level) {
    // --- Sakuranbo Addition ---
    case 1: { // 1-digit + 1-digit (sum > 10 for sakuranbo)
      const a = randInt(2, 9)
      const b = randInt(2, 9)
      return { a, b, op: '+', answer: a + b }
    }
    case 2: { // 2-digit + 1-digit
      const a = randInt(11, 99)
      const b = randInt(2, 9)
      return { a, b, op: '+', answer: a + b }
    }
    case 3: { // 2-digit + 2-digit
      const a = randInt(11, 99)
      const b = randInt(11, 99)
      return { a, b, op: '+', answer: a + b }
    }

    // --- Sakuranbo Subtraction ---
    case 4: { // 2-digit - 1-digit
      const a = randInt(11, 99)
      const b = randInt(2, 9)
      return { a, b, op: '-', answer: a - b }
    }
    case 5: { // 2-digit - 2-digit
      const a = randInt(30, 99)
      const b = randInt(11, a - 1)
      return { a, b, op: '-', answer: a - b }
    }
    case 6: { // 3-digit - 2-digit
      const a = randInt(100, 999)
      const b = randInt(11, Math.min(99, a - 1))
      return { a, b, op: '-', answer: a - b }
    }

    // --- Omiyage Multiplication ---
    case 7:  return omiyageProblem(11, 11)
    case 8:  return omiyageProblem(12, 12)
    case 9:  return omiyageProblem(13, 13)
    case 10: return omiyageProblem(14, 14)
    case 11: return omiyageProblem(15, 15)
    case 12: return omiyageProblem(16, 17)
    case 13: return omiyageProblem(18, 19)

    // Time attack: full range 11-19
    case 14: return omiyageProblem(11, 19)

    default:
      return { a: 1, b: 1, op: '+', answer: 2 }
  }
}

function omiyageProblem(minBase, maxBase) {
  const a = randInt(minBase, maxBase)
  const b = randInt(11, 19)
  return { a, b, op: '×', answer: a * b }
}

// Level metadata
export const levels = [
  { id: 1,  name: 'Lv.1',  label: '一けた＋一けた',       category: 'sakuranbo-add', questions: 10 },
  { id: 2,  name: 'Lv.2',  label: '二けた＋一けた',       category: 'sakuranbo-add', questions: 10 },
  { id: 3,  name: 'Lv.3',  label: '二けた＋二けた',       category: 'sakuranbo-add', questions: 10 },
  { id: 4,  name: 'Lv.4',  label: '二けた−一けた',        category: 'sakuranbo-sub', questions: 10 },
  { id: 5,  name: 'Lv.5',  label: '二けた−二けた',        category: 'sakuranbo-sub', questions: 10 },
  { id: 6,  name: 'Lv.6',  label: '三けた−二けた',        category: 'sakuranbo-sub', questions: 10 },
  { id: 7,  name: 'Lv.7',  label: '11のだん',             category: 'omiyage', questions: 10 },
  { id: 8,  name: 'Lv.8',  label: '12のだん',             category: 'omiyage', questions: 10 },
  { id: 9,  name: 'Lv.9',  label: '13のだん',             category: 'omiyage', questions: 10 },
  { id: 10, name: 'Lv.10', label: '14のだん',             category: 'omiyage', questions: 10 },
  { id: 11, name: 'Lv.11', label: '15のだん',             category: 'omiyage', questions: 10 },
  { id: 12, name: 'Lv.12', label: '16〜17のだん',         category: 'omiyage', questions: 10 },
  { id: 13, name: 'Lv.13', label: '18〜19のだん',         category: 'omiyage', questions: 10 },
  { id: 14, name: 'TA',    label: 'タイムアタック(60秒)',  category: 'timeattack', questions: Infinity },
]

// Get hint text for a problem
export function getHint(problem) {
  const { a, b, op } = problem

  if (op === '+') {
    // Sakuranbo: split b to make a round to 10
    const toTen = 10 - (a % 10)
    if (toTen <= b && toTen > 0 && a % 10 !== 0) {
      const rest = b - toTen
      return `${a} + ${b} → ${a} + ${toTen} + ${rest} = ${a + toTen} + ${rest} = ${a + b}`
    }
    return `${a} + ${b} = ${a + b}`
  }

  if (op === '-') {
    const fromTen = a % 10
    if (fromTen < b && b <= 9) {
      const rest = b - fromTen
      return `${a} - ${b} → ${a} - ${fromTen} - ${rest} = ${a - fromTen} - ${rest} = ${a - b}`
    }
    return `${a} - ${b} = ${a - b}`
  }

  if (op === '×') {
    // Omiyage method: a × b where both are 11-19
    // (10+x)(10+y) = 100 + 10(x+y) + xy
    // Quick method: a + (b%10) then *10 + (a%10)*(b%10)
    const x = a - 10
    const y = b - 10
    const base = (a + y) * 10
    const omiyage = x * y
    return `${a} × ${b} → (${a}+${y})×10 + ${x}×${y} = ${base} + ${omiyage} = ${a * b}`
  }

  return ''
}
