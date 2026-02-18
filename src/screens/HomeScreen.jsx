import { LEVELS } from '../utils/questions'
import { getAllStars, getCoins } from '../utils/storage'

export default function HomeScreen({ onStartGame, onTimeAttack, onLeaderboard }) {
  const stars = getAllStars()
  const coins = getCoins()

  const categories = []
  let currentCat = null
  for (const lv of LEVELS) {
    if (!currentCat || currentCat.name !== lv.category) {
      currentCat = { name: lv.category, icon: lv.icon, levels: [] }
      categories.push(currentCat)
    }
    currentCat.levels.push(lv)
  }

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <h1>おみやげ算ゲーム</h1>
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <span>{coins} TRAIL ALT</span>
        </div>
      </header>

      <div className="categories">
        {categories.map((cat) => (
          <div key={cat.name} className="category">
            <h2 className="category-title">
              {cat.icon} {cat.name}
            </h2>
            <div className="level-grid">
              {cat.levels.map((lv) => {
                const s = stars[lv.id] || 0
                return (
                  <button
                    key={lv.id}
                    className="level-btn"
                    onClick={() => onStartGame(lv.id)}
                  >
                    <div className="level-name">{lv.name}</div>
                    <div className="level-desc">{lv.desc}</div>
                    <div className="level-stars">
                      {'★'.repeat(s)}{'☆'.repeat(3 - s)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="home-actions">
        <button className="btn btn-accent" onClick={onTimeAttack}>
          ⏱ タイムアタック
        </button>
        <button className="btn btn-secondary" onClick={onLeaderboard}>
          🏆 ランキング
        </button>
      </div>
    </div>
  )
}
