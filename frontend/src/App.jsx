import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

// --- Navbar Component ---
const CardNav = ({ onSelectSize, isHamburgerOpen, toggleMenu, isExpanded }) => {
  const contentRef = useRef(null)
  const items = [
    { label: "3x3", size: 3 },
    { label: "4x4", size: 4 },
    { label: "5x5", size: 5 }
  ]

  useLayoutEffect(() => {
    if (isExpanded) {
      gsap.fromTo(contentRef.current, 
        { height: 0, opacity: 0 }, 
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      )
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3 })
    }
  }, [isExpanded])

  return (
    <div className="w-[95%] max-w-[800px] mx-auto mt-8 z-[99] relative">
      <nav 
        style={{ borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
        className="overflow-hidden transition-all duration-300"
      >
        <div className="h-[80px] relative flex items-center justify-center">
          
          {/* زرار الهامبورجر الثابت الذي لا يقهر (Inline Styles) */}
          <button 
            onClick={toggleMenu} 
            style={{
              position: 'absolute',
              left: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 100,
              padding: 0,
              outline: 'none'
            }}
          >
            <span style={{ display: 'block', width: '30px', height: '3px', backgroundColor: '#ffffff', borderRadius: '9999px', transition: 'all 0.3s ease', transform: isHamburgerOpen ? 'translateY(9px) rotate(45deg)' : 'none' }}></span>
            <span style={{ display: 'block', width: '30px', height: '3px', backgroundColor: '#ffffff', borderRadius: '9999px', transition: 'all 0.3s ease', opacity: isHamburgerOpen ? 0 : 1 }}></span>
            <span style={{ display: 'block', width: '30px', height: '3px', backgroundColor: '#ffffff', borderRadius: '9999px', transition: 'all 0.3s ease', transform: isHamburgerOpen ? 'translateY(-9px) rotate(-45deg)' : 'none' }}></span>
          </button>

          <div style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '0.2em', color: '#ffffff' }}>
            AI N-PUZZLE SOLVER
          </div>
        </div>

        <div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div style={{ padding: '24px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSize(item.size)}
                style={{ cursor: 'pointer', padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', flex: '1', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              >
                <span style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

function App() {
  const [boardSize, setBoardSize] = useState(3)
  const [board, setBoard] = useState([])
  const [stats, setStats] = useState(null)
  const [heuristic, setHeuristic] = useState('manhattan')
  const [isSolving, setIsSolving] = useState(false)
  const [error, setError] = useState('')
  const [winnerMessage, setWinnerMessage] = useState('')
  const [currentScreen, setCurrentScreen] = useState('home')
  const tileRefs = useRef([])

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    resetToGoal(boardSize)
  }, [boardSize])

  const toggleMenu = () => {
    setIsHamburgerOpen(!isHamburgerOpen)
    setIsExpanded(!isExpanded)
  }

  const handleSelectSize = (size) => {
    setBoardSize(size)
    setCurrentScreen('game')
    setWinnerMessage('')
    setStats(null)
    setError('')
    resetToGoal(size)
    setIsHamburgerOpen(false)
    setIsExpanded(false)
  }

  const resetToGoal = (size) => {
    let goalBoard = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat([0])
    setBoard(goalBoard)
    setWinnerMessage('')
    setStats(null)
  }

  const shuffleBoard = () => {
    // بنبدأ دايماً من اللوحة وهي محلولة عشان نضمن إننا بنبعد عنها بخطوات محسوبة
    let currentBoard = Array.from({ length: boardSize * boardSize - 1 }, (_, i) => i + 1).concat([0])
    let size = boardSize
    let emptyIdx = currentBoard.indexOf(0)

    // عدد الحركات (مدروس جداً علشان يدي شكل متلخبط بس الـ AI يحله في ثواني)
    let shuffleMoves = 15; // لـ 3x3
    if (size === 4) shuffleMoves = 22; // لـ 4x4
    if (size === 5) shuffleMoves = 30; // لـ 5x5

    let previousEmptyIdx = -1; // علشان نمنع المربع الفاضي يرجع مكانه تاني (لخبطة حقيقية)

    for (let i = 0; i < shuffleMoves; i++) {
      const row = Math.floor(emptyIdx / size)
      const col = emptyIdx % size
      const moves = []
      
      // بنجمع الحركات المتاحة، بس بنمنع الخطوة اللي ترجعنا لورا
      if (row > 0 && emptyIdx - size !== previousEmptyIdx) moves.push(emptyIdx - size)
      if (row < size - 1 && emptyIdx + size !== previousEmptyIdx) moves.push(emptyIdx + size)
      if (col > 0 && emptyIdx - 1 !== previousEmptyIdx) moves.push(emptyIdx - 1)
      if (col < size - 1 && emptyIdx + 1 !== previousEmptyIdx) moves.push(emptyIdx + 1)

      if (moves.length === 0) break; // أمان

      // نختار حركة عشوائية من المتاحين
      const randomMove = moves[Math.floor(Math.random() * moves.length)]
      
      // التبديل
      ;[currentBoard[emptyIdx], currentBoard[randomMove]] = [currentBoard[randomMove], currentBoard[emptyIdx]]
      
      previousEmptyIdx = emptyIdx; // بنسجل المكان القديم
      emptyIdx = randomMove
    }
    
    setBoard(currentBoard)
    setWinnerMessage('')
    setStats(null)
    setError('')
  }

  const handleTileClick = (index) => {
    if (isSolving || winnerMessage) return

    const size = boardSize
    const emptyIdx = board.indexOf(0)
    const row = Math.floor(index / size)
    const col = index % size
    const emptyRow = Math.floor(emptyIdx / size)
    const emptyCol = emptyIdx % size

    if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
      let newBoard = [...board]
      ;[newBoard[index], newBoard[emptyIdx]] = [newBoard[emptyIdx], newBoard[index]]
      setBoard(newBoard)
      
      if (isGoal(newBoard, size)) {
        setWinnerMessage("Congratulations , you did it successfully")
        fireConfetti()
      }
    }
  }

  const isGoal = (currentBoard, size) => {
    if (currentBoard.length === 0) return false
    for (let i = 0; i < size * size - 1; i++) {
      if (currentBoard[i] !== i + 1) return false
    }
    return currentBoard[size * size - 1] === 0
  }

  const fireConfetti = () => {
    var count = 200;
    var defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, { particleCount: Math.floor(count * particleRatio) }));
    }
    fire(0.25, { spread: 26, startVelocity: 55, });
    fire(0.2, { spread: 60, });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45, });
  }

  const solvePuzzle = async () => {
    if (isGoal(board, boardSize)) {
      setWinnerMessage("Board is already solved!")
      return
    }
    setIsSolving(true)
    setError('')
    setWinnerMessage('')
    setStats(null)
    
    try {
const response = await axios.post('https://https://eyadmoneim-n-puzzle-api.hf.space/solve', {        initial_state: board,
        size: boardSize,
        heuristic: heuristic
      })

      if (response.data.error) {
        setError(response.data.error)
        setIsSolving(false)
        return
      }

      setStats({
        time: response.data.time_taken,
        nodes: response.data.expanded_nodes,
        moves: response.data.path.length - 1
      })

      playSolution(response.data.path)
    } catch (err) {
      setError('Error connecting to backend server.')
      setIsSolving(false)
    }
  }

  const playSolution = (path) => {
    let step = 0
    const interval = setInterval(() => {
      if (tileRefs.current.length > 0) {
        gsap.to(tileRefs.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" })
      }
      
      setBoard(path[step])
      step++
      if (step >= path.length) {
        clearInterval(interval)
        setIsSolving(false)
        setWinnerMessage("AI SOLVED SUCCSSEFFULY")
      }
    }, 300)
  }

  const heuristicsList = [
    { id: 'manhattan', label: "Manhattan Distance" },
    { id: 'misplaced', label: "Misplaced Tiles" },
    { id: 'euclidean', label: "Euclidean Distance" },
    { id: 'linear_conflict', label: "Linear Conflict" }
  ]

  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen relative flex flex-col font-sans overflow-hidden" style={{ backgroundColor: '#030712' }}>
        
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <CardNav onSelectSize={handleSelectSize} isHamburgerOpen={isHamburgerOpen} toggleMenu={toggleMenu} isExpanded={isExpanded} />

        <main className="flex-1 flex flex-col items-center justify-center px-4 z-10" style={{ marginTop: '-80px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '20px', color: '#22d3ee', textShadow: '0 0 15px rgba(34,211,238,0.5)' }}>
            START THE CHALLENGE
          </h1>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '0.2em', textAlign: 'center', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            IN AI GAME
          </h2>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans pb-10 overflow-x-hidden" style={{ backgroundColor: '#030712' }}>
      
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <CardNav onSelectSize={handleSelectSize} isHamburgerOpen={isHamburgerOpen} toggleMenu={toggleMenu} isExpanded={isExpanded} />

      <main className="flex-1 flex flex-col xl:flex-row items-center xl:items-start justify-center px-4 sm:px-10 gap-12 mt-12 z-10 w-full max-w-7xl mx-auto">
        
        {/* اللوحة */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div style={{ borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '24px', backdropFilter: 'blur(12px)', width: '100%', maxWidth: '450px' }}>
            
            <div style={{ borderRadius: '12px', textAlign: 'center', padding: '12px', background: 'linear-gradient(to right, #1d4ed8, #6d28d9)', marginBottom: '24px', border: '1px solid rgba(59,130,246,0.5)' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'white' }}>
                    {boardSize*boardSize-1}-Puzzle ({winnerMessage === 'AI SOLVED SUCCSSEFFULY' ? 'AI Play' : 'User Play'})
                </span>
            </div>

            <div 
              style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
            >
              {board.map((tile, index) => (
                <div 
                  key={index} 
                  ref={el => tileRefs.current[index] = el}
                  onClick={() => handleTileClick(index)}
                  style={{ 
                    aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: tile === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
                    border: tile === 0 ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: tile === 0 ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.3)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => { if(tile !== 0) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)' }}
                  onMouseOut={(e) => { if(tile !== 0) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
                >
                  {tile !== 0 ? tile : ''}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', maxWidth: '450px' }}>
            <button style={{ flex: 1, borderRadius: '12px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: '500', cursor: 'pointer' }} onClick={() => setCurrentScreen('home')}>New Game</button>
            <button style={{ flex: 1.5, borderRadius: '12px', padding: '12px 16px', backgroundColor: '#2563eb', border: '1px solid #60a5fa', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(37,99,235,0.5)' }} onClick={solvePuzzle} disabled={isSolving}>{isSolving ? 'Solving...' : 'AI Solve'}</button>
            <button style={{ flex: 1, borderRadius: '12px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: '500', cursor: 'pointer' }} onClick={shuffleBoard}>Shuffle</button>
          </div>
        </div>

        {/* Heuristics & Stats */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-[600px]">
          <div style={{ borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', width: '100%', backdropFilter: 'blur(12px)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: '#22d3ee', textAlign: 'center', letterSpacing: '0.05em' }}>CHOOSE AN HEURISTIC FUNCTION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {heuristicsList.map(h => (
                <div 
                  key={h.id} 
                  onClick={() => setHeuristic(h.id)}
                  style={{ 
                    borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
                    backgroundColor: heuristic === h.id ? '#2563eb' : 'rgba(255,255,255,0.05)',
                    border: heuristic === h.id ? '1px solid #93c5fd' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: heuristic === h.id ? '0 0 15px rgba(37,99,235,0.4)' : 'none',
                    color: heuristic === h.id ? 'white' : '#cbd5e1'
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{h.id.toUpperCase()}</span>
                  <span style={{ display: 'block', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{h.label}</span>
                </div>
              ))}
            </div>
            <hr style={{ marginTop: '32px', borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>

          {error && <div style={{ borderRadius: '16px', width: '100%', padding: '16px 24px', backgroundColor: 'rgba(127,29,29,0.5)', border: '1px solid #ef4444', color: '#fecaca', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
          
          {winnerMessage && (
            <div style={{ borderRadius: '16px', width: '100%', padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '24px', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: winnerMessage === 'AI SOLVED SUCCSSEFFULY' ? '1px solid #3b82f6' : '1px solid #10b981', color: winnerMessage === 'AI SOLVED SUCCSSEFFULY' ? '#60a5fa' : '#34d399' }}>
              {winnerMessage}
            </div>
          )}

          {stats && (
            <div style={{ borderRadius: '16px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
              <div style={{ flex: 1 }}><span style={{ display: 'block', fontSize: '14px', color: '#22d3ee', marginBottom: '4px' }}>Time Taken</span><span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stats.time} s</span></div>
              <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}><span style={{ display: 'block', fontSize: '14px', color: '#22d3ee', marginBottom: '4px' }}>Nodes</span><span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stats.nodes}</span></div>
              <div style={{ flex: 1 }}><span style={{ display: 'block', fontSize: '14px', color: '#22d3ee', marginBottom: '4px' }}>Moves</span><span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{stats.moves}</span></div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App