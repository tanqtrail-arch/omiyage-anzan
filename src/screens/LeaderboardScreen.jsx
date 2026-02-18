import { useState } from 'react'
import { getLeaderboard, getWeeklyLeaderboard } from '../utils/storage'

export default function LeaderboardScreen({ onBack }) {
  const [tab, setTab] = useState('weekly')
  const weekly = getWeeklyLeaderboard()
  const allTime = getLeaderboard()
  const list = tab === 'weekly' ? weekly : allTime

  return (
    <div className="screen leaderboard-screen">
      <div className="lb-header">
        <button className="btn-back" onClick={onBack}>← もどる</button>
        <h1>🏆 ランキング</h1>
      </div>

      <div className="lb-tabs">
        <button
          className={`lb-tab ${tab === 'weekly' ? 'active' : ''}`}
          onClick={() => setTab('weekly')}
        >
          週間
        </button>
        <button
          className={`lb-tab ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          永久
        </button>
      </div>

      {list.length === 0 ? (
        <div className="lb-empty">
          まだ記録がありません。<br />タイムアタックに挑戦しよう!
        </div>
      ) : (
        <div className="lb-list">
          {list.map((entry, i) => (
            <div key={i} className="lb-entry">
              <span className="lb-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}位`}
              </span>
              <span className="lb-name">{entry.name}</span>
              <span className="lb-score">{entry.score}点</span>
              <span className="lb-detail">
                {entry.correct}/{entry.total}問 🔥{entry.maxCombo}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
