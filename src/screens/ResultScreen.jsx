import { useEffect, useState } from 'react'
import { setLevelStars, addCoins } from '../utils/storage'
import { LEVELS } from '../utils/questions'

function calcStars(correctCount, total) {
  const rate = correctCount / total
  if (rate >= 0.9) return 3
  if (rate >= 0.7) return 2
  if (rate >= 0.5) return 1
  return 0
}

function calcCoins(stars, maxCombo) {
  return stars * 10 + maxCombo * 2
}

export default function ResultScreen({ data, onHome, onRetry }) {
  const { level, correctCount, total, time, maxCombo, results } = data
  const stars = calcStars(correctCount, total)
  const coins = calcCoins(stars, maxCombo)
  const levelInfo = LEVELS.find((l) => l.id === level)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved && level) {
      setLevelStars(level, stars)
      if (coins > 0) addCoins(coins)
      setSaved(true)
    }
  }, [saved, level, stars, coins])

  return (
    <div className="screen result-screen">
      <h1 className="result-title">けっか</h1>
      {levelInfo && <div className="result-level">{levelInfo.name} {levelInfo.desc}</div>}

      <div className="stars-display">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`star ${i <= stars ? 'filled' : ''}`}>
            {i <= stars ? '★' : '☆'}
          </span>
        ))}
      </div>

      <div className="result-stats">
        <div className="stat">
          <div className="stat-value">{correctCount} / {total}</div>
          <div className="stat-label">正解数</div>
        </div>
        <div className="stat">
          <div className="stat-value">{time.toFixed(1)}秒</div>
          <div className="stat-label">タイム</div>
        </div>
        <div className="stat">
          <div className="stat-value">🔥 {maxCombo}</div>
          <div className="stat-label">最大コンボ</div>
        </div>
      </div>

      {coins > 0 && (
        <div className="coins-earned">
          🪙 +{coins} TRAIL ALT ゲット!
        </div>
      )}

      <div className="result-details">
        <h3>もんだい一覧</h3>
        <div className="result-list">
          {results.map((r, i) => (
            <div key={i} className={`result-item ${r.correct ? 'correct' : 'wrong'}`}>
              <span>{r.question.display} = {r.question.answer}</span>
              <span className="result-mark">{r.correct ? '⭕' : `❌ (${r.userAnswer})`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRetry}>もういちど</button>
        <button className="btn btn-secondary" onClick={onHome}>ホームへ</button>
      </div>
    </div>
  )
}
