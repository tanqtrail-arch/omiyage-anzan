import { useState, useEffect, useRef, useCallback } from 'react'

const PROBLEMS_PER_LEVEL = 10
const TIME_ATTACK_SECONDS = 60

const LEVELS = [
  { id: 1, name: 'Lv.1', desc: '一けた＋一けた', category: 'cherry-add', icon: '\u{1F352}' },
  { id: 2, name: 'Lv.2', desc: '二けた＋一けた', category: 'cherry-add', icon: '\u{1F352}' },
  { id: 3, name: 'Lv.3', desc: '二けた＋二けた', category: 'cherry-add', icon: '\u{1F352}' },
  { id: 4, name: 'Lv.4', desc: '二けた−一けた', category: 'cherry-sub', icon: '\u{1F352}' },
  { id: 5, name: 'Lv.5', desc: '二けた−二けた', category: 'cherry-sub', icon: '\u{1F352}' },
  { id: 6, name: 'Lv.6', desc: '三けた−二けた', category: 'cherry-sub', icon: '\u{1F352}' },
  { id: 7, name: 'Lv.7', desc: '11\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 8, name: 'Lv.8', desc: '12\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 9, name: 'Lv.9', desc: '13\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 10, name: 'Lv.10', desc: '14\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 11, name: 'Lv.11', desc: '15\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 12, name: 'Lv.12', desc: '16\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
  { id: 13, name: 'Lv.13', desc: '17\u301c19\u00d711\u301c19', category: 'omiyage', icon: '\u{1F381}' },
]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(levelId) {
  let a, b, op, answer
  switch (levelId) {
    case 1:
      do { a = randInt(2, 9); b = randInt(2, 9) } while (a + b < 11)
      op = '+'; answer = a + b; break
    case 2:
      b = randInt(2, 9)
      do { a = randInt(11, 99) } while ((a % 10) + b < 10)
      op = '+'; answer = a + b; break
    case 3:
      do { a = randInt(11, 99); b = randInt(11, 99) } while ((a % 10) + (b % 10) < 10)
      op = '+'; answer = a + b; break
    case 4:
      b = randInt(2, 9)
      do { a = randInt(11, 99) } while ((a % 10) >= b)
      op = '\u2212'; answer = a - b; break
    case 5:
      do { a = randInt(21, 99); b = randInt(11, a - 1) } while ((a % 10) >= (b % 10))
      op = '\u2212'; answer = a - b; break
    case 6:
      do { a = randInt(100, 999); b = randInt(11, 99) } while (a <= b || (a % 10) >= (b % 10))
      op = '\u2212'; answer = a - b; break
    case 7: a = 11; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 8: a = 12; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 9: a = 13; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 10: a = 14; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 11: a = 15; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 12: a = 16; b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 13: a = randInt(17, 19); b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    case 99:
      a = randInt(11, 19); b = randInt(11, 19); op = '\u00d7'; answer = a * b; break
    default:
      a = 1; b = 1; op = '+'; answer = 2
  }
  return { a, b, op, answer }
}

function getHint(problem) {
  const { a, b, op } = problem
  if (op === '+') {
    const toTen = 10 - (a % 10)
    const remainder = b - toTen
    if (toTen <= 0 || remainder < 0) return `${a} + ${b} = ${a + b}`
    return `${a} + ${b}\n= ${a} + ${toTen} + ${remainder}\n= ${a + toTen} + ${remainder}\n= ${a + b}`
  }
  if (op === '\u2212') {
    const onesA = a % 10
    const fromTen = b - onesA
    const roundA = a - onesA
    if (onesA >= b || fromTen <= 0) return `${a} \u2212 ${b} = ${a - b}`
    return `${a} \u2212 ${b}\n= ${a} \u2212 ${onesA} \u2212 ${fromTen}\n= ${roundA} \u2212 ${fromTen}\n= ${a - b}`
  }
  if (op === '\u00d7') {
    const onesA = a % 10
    const onesB = b % 10
    const base = (a + onesB) * 10
    const extra = onesA * onesB
    return `${a} \u00d7 ${b}\n= (${a}+${onesB})\u00d710 + ${onesA}\u00d7${onesB}\n= ${base} + ${extra}\n= ${a * b}`
  }
  return ''
}

function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

function calcStars(correctCount, avgTime) {
  if (correctCount === PROBLEMS_PER_LEVEL && avgTime < 4) return 3
  if (correctCount >= 8) return 2
  if (correctCount >= 5) return 1
  return 0
}

function calcCoins(stars, maxCombo) {
  const base = stars * 10
  const comboBonus = Math.floor(maxCombo / 3) * 5
  return base + comboBonus
}

function StarDisplay({ count, size = 24 }) {
  return (
    <span className="stars">
      {[1, 2, 3].map(i => (
        <span key={i} style={{ fontSize: size, opacity: i <= count ? 1 : 0.2 }}>
          {'\u2b50'}
        </span>
      ))}
    </span>
  )
}

function NumPad({ onInput, onDelete, onSubmit, disabled }) {
  return (
    <div className="numpad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} className="numpad-btn" onClick={() => onInput(n)} disabled={disabled}>
          {n}
        </button>
      ))}
      <button className="numpad-btn numpad-delete" onClick={onDelete} disabled={disabled}>
        {'\u232b'}
      </button>
      <button className="numpad-btn" onClick={() => onInput(0)} disabled={disabled}>
        0
      </button>
      <button className="numpad-btn numpad-ok" onClick={onSubmit} disabled={disabled}>
        OK
      </button>
    </div>
  )
}

// ============ HOME SCREEN ============
function HomeScreen({ levelStars, coins, onSelectLevel, onStartTimeAttack }) {
  return (
    <div className="screen home-screen">
      <header className="home-header">
        <h1>{'\u{1F381}'} おみやげ算ゲーム</h1>
        <div className="coin-display">{'\u{1FA99}'} {coins} TRAIL ALT</div>
      </header>

      <section className="level-section">
        <h2>{'\u{1F352}'} さくらんぼ計算（たし算）</h2>
        <div className="level-grid">
          {LEVELS.filter(l => l.category === 'cherry-add').map(level => (
            <button key={level.id} className="level-card" onClick={() => onSelectLevel(level.id)}>
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.desc}</div>
              <StarDisplay count={levelStars[level.id] || 0} size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="level-section">
        <h2>{'\u{1F352}'} さくらんぼ計算（ひき算）</h2>
        <div className="level-grid">
          {LEVELS.filter(l => l.category === 'cherry-sub').map(level => (
            <button key={level.id} className="level-card" onClick={() => onSelectLevel(level.id)}>
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.desc}</div>
              <StarDisplay count={levelStars[level.id] || 0} size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="level-section">
        <h2>{'\u{1F381}'} おみやげ算（かけ算）</h2>
        <div className="level-grid">
          {LEVELS.filter(l => l.category === 'omiyage').map(level => (
            <button key={level.id} className="level-card" onClick={() => onSelectLevel(level.id)}>
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.desc}</div>
              <StarDisplay count={levelStars[level.id] || 0} size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="level-section">
        <button className="time-attack-btn" onClick={onStartTimeAttack}>
          {'\u23f1\ufe0f'} タイムアタック（60秒チャレンジ）
        </button>
      </section>
    </div>
  )
}

// ============ GAME SCREEN ============
function GameScreen({
  level, problems, currentIndex, userAnswer, combo, showHint,
  onInput, onDelete, onSubmit, onToggleHint, onGoHome, results
}) {
  const problem = problems[currentIndex]
  if (!problem) return null
  const levelConfig = LEVELS.find(l => l.id === level)
  const correctSoFar = results.filter(r => r.correct).length

  return (
    <div className="screen game-screen">
      <div className="game-top-bar">
        <button className="back-btn" onClick={onGoHome}>{'\u2190'}</button>
        <span className="level-label">{levelConfig?.name} {levelConfig?.desc}</span>
        <span className="progress">{currentIndex + 1} / {PROBLEMS_PER_LEVEL}</span>
      </div>

      <div className="game-stats">
        <span className="correct-count">{'\u2b55'} {correctSoFar}</span>
        {combo >= 2 && <span className="combo">{'\u{1F525}'} {combo}コンボ!</span>}
      </div>

      <div className="problem-area">
        <div className="problem-text">
          {problem.a} {problem.op} {problem.b} = ?
        </div>
        <div className="answer-display">
          {userAnswer || '\u00a0'}
          <span className="cursor">|</span>
        </div>
      </div>

      {showHint && (
        <div className="hint-box">
          <div className="hint-label">{'\u{1F4A1}'} ヒント</div>
          <pre className="hint-text">{getHint(problem)}</pre>
        </div>
      )}

      <div className="game-actions">
        <button className="hint-btn" onClick={onToggleHint}>
          {showHint ? 'ヒントを隠す' : '\u{1F4D6} ヒント'}
        </button>
      </div>

      <NumPad onInput={onInput} onDelete={onDelete} onSubmit={onSubmit} disabled={false} />
    </div>
  )
}

// ============ RESULT SCREEN ============
function ResultScreen({ level, results, stars, earnedCoins, maxCombo, onGoHome, onNextLevel, onShareLine }) {
  const correctCount = results.filter(r => r.correct).length
  const totalTime = results.reduce((sum, r) => sum + r.time, 0)
  const avgTime = results.length > 0 ? (totalTime / results.length).toFixed(1) : 0
  const levelConfig = LEVELS.find(l => l.id === level)

  return (
    <div className="screen result-screen">
      <h2>{levelConfig?.name} 結果</h2>
      <StarDisplay count={stars} size={40} />
      <div className="result-stats">
        <div className="result-row">
          <span>正解数</span>
          <span>{correctCount} / {PROBLEMS_PER_LEVEL}</span>
        </div>
        <div className="result-row">
          <span>平均タイム</span>
          <span>{avgTime}秒</span>
        </div>
        <div className="result-row">
          <span>最大コンボ</span>
          <span>{'\u{1F525}'} {maxCombo}</span>
        </div>
        <div className="result-row coins-earned">
          <span>獲得コイン</span>
          <span>{'\u{1FA99}'} +{earnedCoins} TRAIL ALT</span>
        </div>
      </div>

      <div className="result-detail">
        {results.map((r, i) => (
          <div key={i} className={`result-item ${r.correct ? 'correct' : 'wrong'}`}>
            <span>{r.correct ? '\u2b55' : '\u274c'}</span>
            <span>{r.problemText}</span>
            <span>{r.correct ? '' : `\u2192 ${r.correctAnswer}`}</span>
            <span className="result-time">{r.time.toFixed(1)}s</span>
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button className="action-btn" onClick={onGoHome}>ホームに戻る</button>
        {level < 13 && (
          <button className="action-btn primary" onClick={onNextLevel}>次のレベルへ</button>
        )}
        <button className="action-btn line-btn" onClick={onShareLine}>
          {'\u{1F4AC}'} LINEで報告
        </button>
      </div>
    </div>
  )
}

// ============ TIME ATTACK SCREEN ============
function TimeAttackScreen({
  timeLeft, score, currentProblem, userAnswer, combo,
  onInput, onDelete, onSubmit, onGoHome
}) {
  const pct = (timeLeft / TIME_ATTACK_SECONDS) * 100

  return (
    <div className="screen ta-screen">
      <div className="game-top-bar">
        <button className="back-btn" onClick={onGoHome}>{'\u2190'}</button>
        <span className="level-label">{'\u23f1\ufe0f'} タイムアタック</span>
        <span className="ta-score">スコア: {score}</span>
      </div>

      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
        <span className="timer-text">{timeLeft}秒</span>
      </div>

      {combo >= 2 && <div className="combo ta-combo">{'\u{1F525}'} {combo}コンボ!</div>}

      {currentProblem && (
        <>
          <div className="problem-area">
            <div className="problem-text">
              {currentProblem.a} {currentProblem.op} {currentProblem.b} = ?
            </div>
            <div className="answer-display">
              {userAnswer || '\u00a0'}
              <span className="cursor">|</span>
            </div>
          </div>
          <NumPad onInput={onInput} onDelete={onDelete} onSubmit={onSubmit} disabled={timeLeft <= 0} />
        </>
      )}
    </div>
  )
}

// ============ TIME ATTACK RESULT ============
function TimeAttackResultScreen({ score, solved, rankings, onGoHome, onRetry, onShareLine }) {
  return (
    <div className="screen ta-result-screen">
      <h2>{'\u{1F3C6}'} タイムアタック結果</h2>
      <div className="ta-final-score">{score}問正解!</div>
      <div className="ta-solved">{solved}問チャレンジ</div>

      <div className="ranking-section">
        <h3>{'\u{1F451}'} ランキング</h3>
        <div className="ranking-list">
          {rankings.slice(0, 10).map((r, i) => (
            <div key={i} className={`ranking-item ${r.isNew ? 'new-record' : ''}`}>
              <span className="rank">#{i + 1}</span>
              <span className="rank-score">{r.score}問</span>
              <span className="rank-date">{r.date}</span>
            </div>
          ))}
          {rankings.length === 0 && <div className="no-ranking">まだ記録がありません</div>}
        </div>
      </div>

      <div className="result-actions">
        <button className="action-btn" onClick={onGoHome}>ホームに戻る</button>
        <button className="action-btn primary" onClick={onRetry}>もう一度</button>
        <button className="action-btn line-btn" onClick={onShareLine}>
          {'\u{1F4AC}'} LINEで報告
        </button>
      </div>
    </div>
  )
}

// ============ MAIN APP ============
export default function App() {
  const [screen, setScreen] = useState('home')
  const [level, setLevel] = useState(null)
  const [problems, setProblems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [results, setResults] = useState([])
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [problemStartTime, setProblemStartTime] = useState(null)

  const [coins, setCoins] = useState(() => loadFromStorage('omiyage-coins', 0))
  const [levelStars, setLevelStars] = useState(() => loadFromStorage('omiyage-stars', {}))

  // Time attack state
  const [taTimeLeft, setTaTimeLeft] = useState(TIME_ATTACK_SECONDS)
  const [taProblem, setTaProblem] = useState(null)
  const [taScore, setTaScore] = useState(0)
  const [taSolved, setTaSolved] = useState(0)
  const [taCombo, setTaCombo] = useState(0)
  const [rankings, setRankings] = useState(() => loadFromStorage('omiyage-rankings', []))
  const timerRef = useRef(null)

  useEffect(() => {
    saveToStorage('omiyage-coins', coins)
  }, [coins])

  useEffect(() => {
    saveToStorage('omiyage-stars', levelStars)
  }, [levelStars])

  useEffect(() => {
    saveToStorage('omiyage-rankings', rankings)
  }, [rankings])

  const startLevel = useCallback((lvl) => {
    const newProblems = Array.from({ length: PROBLEMS_PER_LEVEL }, () => generateProblem(lvl))
    setLevel(lvl)
    setProblems(newProblems)
    setCurrentIndex(0)
    setUserAnswer('')
    setResults([])
    setCombo(0)
    setMaxCombo(0)
    setShowHint(false)
    setProblemStartTime(Date.now())
    setScreen('game')
  }, [])

  const handleGameInput = useCallback((n) => {
    setUserAnswer(prev => {
      if (prev.length >= 4) return prev
      return prev + n
    })
  }, [])

  const handleGameDelete = useCallback(() => {
    setUserAnswer(prev => prev.slice(0, -1))
  }, [])

  const handleGameSubmit = useCallback(() => {
    if (!userAnswer) return
    const problem = problems[currentIndex]
    const elapsed = (Date.now() - problemStartTime) / 1000
    const isCorrect = parseInt(userAnswer, 10) === problem.answer
    const newCombo = isCorrect ? combo + 1 : 0
    const newMaxCombo = Math.max(maxCombo, newCombo)
    const newResult = {
      correct: isCorrect,
      time: elapsed,
      userAnswer: parseInt(userAnswer, 10),
      correctAnswer: problem.answer,
      problemText: `${problem.a} ${problem.op} ${problem.b}`,
    }
    const newResults = [...results, newResult]

    setResults(newResults)
    setCombo(newCombo)
    setMaxCombo(newMaxCombo)
    setUserAnswer('')
    setShowHint(false)

    if (currentIndex + 1 >= PROBLEMS_PER_LEVEL) {
      // Level complete
      const correctCount = newResults.filter(r => r.correct).length
      const avgTime = newResults.reduce((s, r) => s + r.time, 0) / newResults.length
      const stars = calcStars(correctCount, avgTime)
      const earned = calcCoins(stars, newMaxCombo)

      setLevelStars(prev => ({
        ...prev,
        [level]: Math.max(prev[level] || 0, stars)
      }))
      setCoins(prev => prev + earned)
      setScreen('result')
    } else {
      setCurrentIndex(currentIndex + 1)
      setProblemStartTime(Date.now())
    }
  }, [userAnswer, problems, currentIndex, problemStartTime, combo, maxCombo, results, level])

  // Time Attack
  const startTimeAttack = useCallback(() => {
    setTaTimeLeft(TIME_ATTACK_SECONDS)
    setTaProblem(generateProblem(99))
    setTaScore(0)
    setTaSolved(0)
    setTaCombo(0)
    setUserAnswer('')
    setScreen('timeAttack')

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTaTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setScreen('timeAttackResult')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleTaInput = useCallback((n) => {
    setUserAnswer(prev => {
      if (prev.length >= 4) return prev
      return prev + n
    })
  }, [])

  const handleTaDelete = useCallback(() => {
    setUserAnswer(prev => prev.slice(0, -1))
  }, [])

  const handleTaSubmit = useCallback(() => {
    if (!userAnswer || taTimeLeft <= 0) return
    const isCorrect = parseInt(userAnswer, 10) === taProblem.answer
    setTaSolved(prev => prev + 1)
    if (isCorrect) {
      setTaScore(prev => prev + 1)
      setTaCombo(prev => prev + 1)
    } else {
      setTaCombo(0)
    }
    setUserAnswer('')
    setTaProblem(generateProblem(99))
  }, [userAnswer, taTimeLeft, taProblem])

  const finishTimeAttack = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const today = new Date().toLocaleDateString('ja-JP')
    const newEntry = { score: taScore, date: today, isNew: true }
    const updatedRankings = [...rankings.map(r => ({ ...r, isNew: false })), newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
    setRankings(updatedRankings)
    setScreen('timeAttackResult')
  }, [taScore, rankings])

  // When screen changes to timeAttackResult, save ranking
  useEffect(() => {
    if (screen === 'timeAttackResult' && taTimeLeft <= 0) {
      const today = new Date().toLocaleDateString('ja-JP')
      const newEntry = { score: taScore, date: today, isNew: true }
      const updatedRankings = [...rankings.map(r => ({ ...r, isNew: false })), newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
      setRankings(updatedRankings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const goHome = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setScreen('home')
  }, [])

  const shareToLine = useCallback((text) => {
    const encoded = encodeURIComponent(text)
    window.open(`https://line.me/R/share?text=${encoded}`, '_blank')
  }, [])

  const handleLevelShareLine = useCallback(() => {
    const correctCount = results.filter(r => r.correct).length
    const stars = levelStars[level] || 0
    const lvlConfig = LEVELS.find(l => l.id === level)
    const text = `\u{1F381} おみやげ算ゲーム\n${lvlConfig?.name} ${lvlConfig?.desc}\n正解: ${correctCount}/${PROBLEMS_PER_LEVEL}\n${'\u2b50'.repeat(stars)}\n#おみやげ算ゲーム`
    shareToLine(text)
  }, [results, level, levelStars, shareToLine])

  const handleTaShareLine = useCallback(() => {
    const text = `\u{1F381} おみやげ算ゲーム\n\u23f1\ufe0f タイムアタック: ${taScore}問正解!\n#おみやげ算ゲーム`
    shareToLine(text)
  }, [taScore, shareToLine])

  // Compute result data for result screen
  const resultStars = (() => {
    if (screen !== 'result') return 0
    const correctCount = results.filter(r => r.correct).length
    const avgTime = results.length > 0 ? results.reduce((s, r) => s + r.time, 0) / results.length : 999
    return calcStars(correctCount, avgTime)
  })()

  const resultCoins = (() => {
    if (screen !== 'result') return 0
    return calcCoins(resultStars, maxCombo)
  })()

  switch (screen) {
    case 'home':
      return (
        <HomeScreen
          levelStars={levelStars}
          coins={coins}
          onSelectLevel={startLevel}
          onStartTimeAttack={startTimeAttack}
        />
      )
    case 'game':
      return (
        <GameScreen
          level={level}
          problems={problems}
          currentIndex={currentIndex}
          userAnswer={userAnswer}
          combo={combo}
          showHint={showHint}
          results={results}
          onInput={handleGameInput}
          onDelete={handleGameDelete}
          onSubmit={handleGameSubmit}
          onToggleHint={() => setShowHint(p => !p)}
          onGoHome={goHome}
        />
      )
    case 'result':
      return (
        <ResultScreen
          level={level}
          results={results}
          stars={resultStars}
          earnedCoins={resultCoins}
          maxCombo={maxCombo}
          onGoHome={goHome}
          onNextLevel={() => startLevel(level + 1)}
          onShareLine={handleLevelShareLine}
        />
      )
    case 'timeAttack':
      return (
        <TimeAttackScreen
          timeLeft={taTimeLeft}
          score={taScore}
          currentProblem={taProblem}
          userAnswer={userAnswer}
          combo={taCombo}
          onInput={handleTaInput}
          onDelete={handleTaDelete}
          onSubmit={handleTaSubmit}
          onGoHome={goHome}
        />
      )
    case 'timeAttackResult':
      return (
        <TimeAttackResultScreen
          score={taScore}
          solved={taSolved}
          rankings={rankings}
          onGoHome={goHome}
          onRetry={startTimeAttack}
          onShareLine={handleTaShareLine}
        />
      )
    default:
      return null
  }
}
