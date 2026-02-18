import { useState, useEffect, useCallback } from 'react'
import { generateQuestion, getHint, QUESTIONS_PER_GAME, LEVELS } from '../utils/questions'

export default function GameScreen({ level, onFinish, onBack }) {
  const [questions] = useState(() =>
    Array.from({ length: QUESTIONS_PER_GAME }, () => generateQuestion(level))
  )
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [showHint, setShowHint] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [startTime] = useState(Date.now())

  const question = questions[current]
  const levelInfo = LEVELS.find((l) => l.id === level)

  const submit = useCallback(() => {
    if (!input.trim()) return
    const userAnswer = parseInt(input, 10)
    const correct = userAnswer === question.answer

    const newCombo = correct ? combo + 1 : 0
    setCombo(newCombo)
    if (newCombo > maxCombo) setMaxCombo(newCombo)

    setFeedback(correct ? 'correct' : 'wrong')
    setResults((prev) => [...prev, { question, userAnswer, correct }])

    setTimeout(() => {
      setFeedback(null)
      setInput('')
      setShowHint(false)
      if (current + 1 < QUESTIONS_PER_GAME) {
        setCurrent(current + 1)
      } else {
        const elapsed = (Date.now() - startTime) / 1000
        const correctCount = results.filter((r) => r.correct).length + (correct ? 1 : 0)
        onFinish({
          level,
          results: [...results, { question, userAnswer, correct }],
          correctCount,
          total: QUESTIONS_PER_GAME,
          time: elapsed,
          maxCombo: Math.max(maxCombo, newCombo),
        })
      }
    }, 600)
  }, [input, question, combo, maxCombo, current, results, startTime, level, onFinish])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Enter') submit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [submit])

  const hint = showHint ? getHint(question) : null

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <button className="btn-back" onClick={onBack}>← もどる</button>
        <span className="game-level">{levelInfo?.name} {levelInfo?.desc}</span>
        <span className="game-progress">{current + 1} / {QUESTIONS_PER_GAME}</span>
      </div>

      {combo >= 2 && (
        <div className="combo-display">🔥 {combo} コンボ!</div>
      )}

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((current) / QUESTIONS_PER_GAME) * 100}%` }}
        />
      </div>

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
            📖 ヒントを見る
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

      {feedback === 'wrong' && (
        <div className="wrong-answer">
          正解は <strong>{question.answer}</strong> でした
        </div>
      )}
    </div>
  )
}
