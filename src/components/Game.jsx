import { useState, useEffect, useCallback, useRef } from 'react'
import { generateProblem, levels, getHint } from '../utils/problems'

const TOTAL_QUESTIONS = 10
const TIME_ATTACK_DURATION = 60

export default function Game({ levelId, onFinish, onBack }) {
  const levelMeta = levels.find(l => l.id === levelId)
  const isTimeAttack = levelMeta.category === 'timeattack'

  const [problem, setProblem] = useState(() => generateProblem(levelId))
  const [input, setInput] = useState('')
  const [questionNum, setQuestionNum] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [timeLeft, setTimeLeft] = useState(isTimeAttack ? TIME_ATTACK_DURATION : null)
  const [startTime] = useState(Date.now())
  const inputRef = useRef(null)

  // Time attack timer
  useEffect(() => {
    if (!isTimeAttack) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimeAttack])

  // End time attack when time runs out
  useEffect(() => {
    if (isTimeAttack && timeLeft === 0) {
      onFinish({
        correct,
        total: questionNum - 1,
        maxCombo,
        elapsed: TIME_ATTACK_DURATION,
        isTimeAttack: true,
      })
    }
  }, [timeLeft, isTimeAttack, correct, questionNum, maxCombo, onFinish])

  // Focus input on new problem
  useEffect(() => {
    inputRef.current?.focus()
  }, [problem])

  const handleSubmit = useCallback(() => {
    const userAnswer = parseInt(input, 10)
    if (isNaN(userAnswer)) return

    const isCorrect = userAnswer === problem.answer

    if (isCorrect) {
      setCorrect(c => c + 1)
      setCombo(c => {
        const next = c + 1
        setMaxCombo(m => Math.max(m, next))
        return next
      })
      setFeedback('correct')
    } else {
      setCombo(0)
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setShowHint(false)
      setInput('')

      if (!isTimeAttack && questionNum >= TOTAL_QUESTIONS) {
        const finalCorrect = isCorrect ? correct + 1 : correct
        onFinish({
          correct: finalCorrect,
          total: TOTAL_QUESTIONS,
          maxCombo: isCorrect ? Math.max(maxCombo, combo + 1) : maxCombo,
          elapsed: Math.round((Date.now() - startTime) / 1000),
          isTimeAttack: false,
        })
      } else {
        setQuestionNum(q => q + 1)
        setProblem(generateProblem(levelId))
      }
    }, 600)
  }, [input, problem, questionNum, correct, combo, maxCombo, isTimeAttack, levelId, onFinish, startTime])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="game">
      <div className="game-top-bar">
        <button className="back-btn" onClick={onBack}>← もどる</button>
        <div className="game-info">
          <span className="level-badge">{levelMeta.name}</span>
          {isTimeAttack ? (
            <span className="timer">⏱️ {timeLeft}秒</span>
          ) : (
            <span className="progress">{questionNum} / {TOTAL_QUESTIONS}</span>
          )}
        </div>
        {combo >= 2 && <div className="combo">🔥 {combo}コンボ!</div>}
      </div>

      <div className={`problem-area ${feedback || ''}`}>
        <div className="problem-text">
          <span className="num">{problem.a}</span>
          <span className="op">{problem.op}</span>
          <span className="num">{problem.b}</span>
          <span className="eq">=</span>
          <span className="answer-slot">?</span>
        </div>
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="こたえ"
          className="answer-input"
          disabled={feedback !== null}
        />
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={feedback !== null || input === ''}
        >
          OK
        </button>
      </div>

      <div className="hint-area">
        {showHint ? (
          <div className="hint-text">📖 {getHint(problem)}</div>
        ) : (
          <button className="hint-btn" onClick={() => setShowHint(true)}>
            📖 ヒントを見る
          </button>
        )}
      </div>

      {feedback && (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? '⭕ 正解！' : `❌ 不正解… 答えは ${problem.answer}`}
        </div>
      )}
    </div>
  )
}
