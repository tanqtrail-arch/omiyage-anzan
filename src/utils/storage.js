const STORAGE_KEY = 'omiyage-game'

function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getLevelStars(level) {
  const data = load()
  return data.stars?.[level] || 0
}

export function setLevelStars(level, stars) {
  const data = load()
  if (!data.stars) data.stars = {}
  if ((data.stars[level] || 0) < stars) {
    data.stars[level] = stars
  }
  save(data)
}

export function getAllStars() {
  const data = load()
  return data.stars || {}
}

export function getCoins() {
  const data = load()
  return data.coins || 0
}

export function addCoins(amount) {
  const data = load()
  data.coins = (data.coins || 0) + amount
  save(data)
  return data.coins
}

export function getLeaderboard() {
  const data = load()
  return data.leaderboard || []
}

export function addLeaderboardEntry(entry) {
  const data = load()
  if (!data.leaderboard) data.leaderboard = []
  data.leaderboard.push({ ...entry, date: new Date().toISOString() })
  data.leaderboard.sort((a, b) => b.score - a.score)
  data.leaderboard = data.leaderboard.slice(0, 50)
  save(data)
}

export function getWeeklyLeaderboard() {
  const board = getLeaderboard()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return board.filter((e) => new Date(e.date) >= oneWeekAgo)
}
