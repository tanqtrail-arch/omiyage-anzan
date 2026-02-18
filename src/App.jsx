import { useState, useCallback, useEffect } from 'react'
import Home from './components/Home'
import Game from './components/Game'
import Result from './components/Result'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'game' | 'result'
  const [levelId, setLevelId] = useState(null)
  const [result, setResult] = useState(null)
  const [bestStars, setBestStars] = useState({})

  // Load best stars from localStorage
  useEffect(() => {
    const stars = {}
    for (let i = 1; i <= 14; i++) {
      try {
        const v = localStorage.getItem(`bestStars_${i}`)
        if (v) stars[i] = Number(v)
      } catch {}
    }
    setBestStars(stars)
  }, [screen])

  const handleSelectLevel = useCallback((id) => {
    setLevelId(id)
    setScreen('game')
  }, [])

  const handleFinish = useCallback((res) => {
    setResult(res)
    setScreen('result')
  }, [])

  const handleHome = useCallback(() => {
    setScreen('home')
    setLevelId(null)
    setResult(null)
  }, [])

  const handleRetry = useCallback(() => {
    setScreen('game')
    setResult(null)
  }, [])

  const handleBack = useCallback(() => {
    setScreen('home')
  }, [])

  return (
    <div className="app">
      {screen === 'home' && (
        <Home onSelectLevel={handleSelectLevel} bestStars={bestStars} />
      )}
      {screen === 'game' && levelId && (
        <Game levelId={levelId} onFinish={handleFinish} onBack={handleBack} />
      )}
      {screen === 'result' && result && (
        <Result result={result} levelId={levelId} onHome={handleHome} onRetry={handleRetry} />
      )}
    </div>
  )
}
