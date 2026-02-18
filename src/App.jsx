import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import GameScreen from './screens/GameScreen'
import ResultScreen from './screens/ResultScreen'
import TimeAttackScreen from './screens/TimeAttackScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [gameData, setGameData] = useState(null)

  function startGame(level) {
    setGameData({ level })
    setScreen('game')
  }

  function startTimeAttack() {
    setScreen('timeattack')
  }

  function showResult(result) {
    setGameData(result)
    setScreen('result')
  }

  function showLeaderboard() {
    setScreen('leaderboard')
  }

  function goHome() {
    setScreen('home')
    setGameData(null)
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onStartGame={startGame}
          onTimeAttack={startTimeAttack}
          onLeaderboard={showLeaderboard}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          level={gameData.level}
          onFinish={showResult}
          onBack={goHome}
        />
      )}
      {screen === 'result' && (
        <ResultScreen data={gameData} onHome={goHome} onRetry={() => startGame(gameData.level)} />
      )}
      {screen === 'timeattack' && (
        <TimeAttackScreen onFinish={showResult} onBack={goHome} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={goHome} />
      )}
    </div>
  )
}
