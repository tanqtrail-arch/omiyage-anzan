import { useState, useEffect, useCallback, useRef } from 'react'
import { generateTimeAttackQuestion, getHint, TIME_ATTACK_SECONDS } from '../utils/questions'
import { addLeaderboardEntry } from '../utils/storage'

export default function TimeAttackScreen({ onFinish, onBack }) {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_SECONDS)
  const [question, setQuestion] = useState(() => generateTimeAttackQuestion())
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [results, setResults] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (started && !finished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setFinished(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [started, finished])

  const finishGame = useCallback(() => {
    const entry = {
      score,
      correct: results.filter((r) => r.correct).length,
      total: results.length,
      maxCombo,
      name: 'プレイヤー',
    }
    addLeaderboardEntry(entry)
    onFinish({
      level: null,
      results,
      correctCount: entry.correct,
      total: entry.total,
      time: TIME_ATTACK_SECONDS,
      maxCombo,
      isTimeAttack: true,
      score,
    })
  }, [score, results, maxCombo, onFinish])

  useEffect(() => {
    if (finished) finishGame()
  }, [finished, finishGame])

  const submit = useCallback(() => {
    if (!input.trim() || !started || finished) return
    const userAnswer = parseInt(input, 10)
    const correct = userAnswer === question.answer

    const newCombo = correct ? combo + 1 : 0
    setCombo(newCombo)
    if (newCombo > maxCombo) setMaxCombo(newCombo)
    if (correct) setScore((s) => s + 10 + newCombo * 2)

    setFeedback(correct ? 'correct' : 'wrong')
    setResults((prev) => [...prev, { question, userAnswer, correct }])

    setTimeout(() => {
      setFeedback(null)
      setInput('')
      setShowHint(false)
      setQuestion(generateTimeAttackQuestion())
    }, 300)
  }, [input, question, combo, maxCombo, started, finished])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Enter') {
        if (!started) setStarted(true)
        else submit()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [submit, started])

  const hint = showHint ? getHint(question) : null

  if (!started) {
    return (
      <div className="screen timeattack-screen">
        <div className="ta-intro">
          <h1>⏱ タイムアタック</h1>
          <p>おみやげ算（11×11 〜 19×19）</p>
          <p className="ta-rule">60秒でできるだけ多く解こう!</p>
          <button className="btn btn-primary btn-large" onClick={() => setStarted(true)}>
            スタート!
          </button>
          <button className="btn btn-secondary" onClick={onBack}>もどる</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen timeattack-screen">
      <div className="ta-header">
        <div className="ta-timer" data-urgent={timeLeft <= 10}>
          ⏱ {timeLeft}秒
        </div>
        <div className="ta-score">スコア: {score}</div>
      </div>

      {combo >= 2 && (
        <div className="combo-display">🔥 {combo} コンボ!</div>
      )}

      <div className={`question-card ${feedback || ''}`}>
        <div className="question-text">{question.display} = ?</div>
      </div>

      <div className="answer-area">
        <input
          type="number"
          inputMode="numeric"
          className="answer-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="こたえ"
          autoFocus
        />
        <button className="btn btn-primary" onClick={submit}>
          こたえる
        </button>
      </div>

      <div className="hint-area">
        {!showHint ? (
          <button className="btn btn-hint" onClick={() => setShowHint(true)}>
            📖 ヒント
          </button>
        ) : hint && (
          <div className="hint-box">
            <div className="hint-title">{hint.method}</div>
            {hint.steps.map((s, i) => (
              <div key={i} className="hint-step">{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
