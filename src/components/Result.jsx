import { useEffect, useState } from 'react'

function calcStars(correct, total) {
  const ratio = correct / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.5) return 1
  return 0
}

function calcAlt(stars, combo) {
  return stars * 10 + combo * 2
}

export default function Result({ result, levelId, onHome, onRetry }) {
  const { correct, total, maxCombo, elapsed, isTimeAttack } = result
  const stars = isTimeAttack ? Math.min(3, Math.floor(correct / 10)) : calcStars(correct, total)
  const earned = calcAlt(stars, maxCombo)

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (saved) return
    setSaved(true)

    // Save best stars
    try {
      const key = `bestStars_${levelId}`
      const prev = Number(localStorage.getItem(key) || '0')
      if (stars > prev) localStorage.setItem(key, String(stars))
    } catch {}

    // Add ALT
    try {
      const prev = Number(localStorage.getItem('trailAlt') || '0')
      localStorage.setItem('trailAlt', String(prev + earned))
    } catch {}

    // Save time attack score
    if (isTimeAttack) {
      try {
        const scores = JSON.parse(localStorage.getItem('taScores') || '[]')
        scores.push({ correct, date: Date.now() })
        scores.sort((a, b) => b.correct - a.correct)
        localStorage.setItem('taScores', JSON.stringify(scores.slice(0, 50)))
      } catch {}
    }
  }, [saved, stars, earned, levelId, correct, isTimeAttack])

  return (
    <div className="result">
      <h2>けっか</h2>

      <div className="result-stars">
        {[1, 2, 3].map(s => (
          <span key={s} className={s <= stars ? 'star filled big' : 'star big'}>★</span>
        ))}
      </div>

      <div className="result-stats">
        <div className="stat">
          <span className="stat-label">正解</span>
          <span className="stat-value">{correct} / {total === Infinity ? '∞' : total}</span>
        </div>
        {isTimeAttack && (
          <div className="stat">
            <span className="stat-label">時間</span>
            <span className="stat-value">{elapsed}秒</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">最大コンボ</span>
          <span className="stat-value">🔥 {maxCombo}</span>
        </div>
        <div className="stat earned">
          <span className="stat-label">獲得ALT</span>
          <span className="stat-value">🪙 +{earned}</span>
        </div>
      </div>

      {isTimeAttack && <Ranking current={correct} />}

      <div className="result-actions">
        <button className="btn-primary" onClick={onRetry}>もう一回</button>
        <button className="btn-secondary" onClick={onHome}>ホームへ</button>
      </div>
    </div>
  )
}

function Ranking({ current }) {
  const [scores, setScores] = useState([])

  useEffect(() => {
    try {
      setScores(JSON.parse(localStorage.getItem('taScores') || '[]').slice(0, 10))
    } catch {}
  }, [])

  if (scores.length === 0) return null

  return (
    <div className="ranking">
      <h3>🏆 ランキング</h3>
      <ol className="ranking-list">
        {scores.map((s, i) => (
          <li key={i} className={s.correct === current && s.date > Date.now() - 2000 ? 'current' : ''}>
            {s.correct}問正解
          </li>
        ))}
      </ol>
    </div>
  )
}
