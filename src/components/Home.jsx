import { useState } from 'react'
import { levels } from '../utils/problems'

const categories = [
  { key: 'sakuranbo-add', title: 'さくらんぼ計算（たし算）', icon: '🍒' },
  { key: 'sakuranbo-sub', title: 'さくらんぼ計算（ひき算）', icon: '🍒' },
  { key: 'omiyage',       title: 'おみやげ算（かけ算）',     icon: '🎁' },
  { key: 'timeattack',    title: 'タイムアタック',           icon: '⏱️' },
]

export default function Home({ onSelectLevel, bestStars }) {
  const [alt, setAlt] = useState(() => {
    try { return Number(localStorage.getItem('trailAlt') || '0') } catch { return 0 }
  })

  return (
    <div className="home">
      <header className="home-header">
        <h1>おみやげ算ゲーム</h1>
        <div className="alt-display">🪙 {alt} ALT</div>
      </header>

      {categories.map(cat => (
        <section key={cat.key} className="category-section">
          <h2>{cat.icon} {cat.title}</h2>
          <div className="level-grid">
            {levels.filter(l => l.category === cat.key).map(level => {
              const stars = bestStars[level.id] || 0
              return (
                <button
                  key={level.id}
                  className="level-card"
                  onClick={() => onSelectLevel(level.id)}
                >
                  <div className="level-name">{level.name}</div>
                  <div className="level-label">{level.label}</div>
                  <div className="level-stars">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={s <= stars ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
