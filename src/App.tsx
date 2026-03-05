import { useEffect, useMemo, useState } from 'react'
import { getAIMove } from './computerPlayer'
import {
  checkWinner,
  createEmptyBoard,
  dropDisc,
  isDraw,
  type Board,
  type Player,
} from './gameLogic'

const gameConfig = {
  rows: 6,
  cols: 7,
  connectN: 4,
}

const playerLabel: Record<Player, string> = {
  0: 'Player 1 (Red)',
  1: 'Player 2 (Yellow)',
}

const playerColorClass: Record<Player, string> = {
  0: 'disc-red',
  1: 'disc-yellow',
}

type GameResult = 'playing' | 'win' | 'draw'
type GameMode = 'pvp' | 'pvc'
type FirstPlayer = 'human' | 'computer'

const AI_DELAY_MS = 400

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('pvp')
  const [firstPlayer, setFirstPlayer] = useState<FirstPlayer>('human')
  const [gameStarted, setGameStarted] = useState(false)

  const [board, setBoard] = useState<Board>(() =>
    createEmptyBoard(gameConfig.rows, gameConfig.cols),
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>(0)
  const [result, setResult] = useState<GameResult>('playing')
  const [winner, setWinner] = useState<Player | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const isComputerTurn =
    gameStarted &&
    gameMode === 'pvc' &&
    result === 'playing' &&
    currentPlayer === 1

  const turnLabel = useMemo(() => {
    if (gameMode === 'pvp') return playerLabel
    return { 0: 'You', 1: 'Computer' } as Record<Player, string>
  }, [gameMode])

  const winLabel = useMemo(() => {
    if (gameMode === 'pvp') return (p: Player) => `${playerLabel[p]} wins!`
    return (p: Player) => (p === 0 ? 'You win!' : 'Computer wins!')
  }, [gameMode])

  const statusWinLabel = useMemo(() => {
    if (gameMode === 'pvp') return (p: Player) => `${playerLabel[p]} wins the game.`
    return (p: Player) => (p === 0 ? 'You win the game.' : 'Computer wins the game.')
  }, [gameMode])

  const turnText = useMemo(() => {
    if (result === 'win' && winner !== null) {
      return winLabel(winner)
    }
    if (result === 'draw') {
      return "It's a draw!"
    }
    return gameMode === 'pvc' && currentPlayer === 0
      ? 'Your turn'
      : gameMode === 'pvc' && currentPlayer === 1
        ? "Computer's turn"
        : `${turnLabel[currentPlayer]}'s turn`
  }, [currentPlayer, result, winner, turnLabel, winLabel, gameMode])

  const statusText = useMemo(() => {
    if (result === 'win' && winner !== null) {
      return statusWinLabel(winner)
    }
    if (result === 'draw') {
      return 'Board is full. The game ends in a draw.'
    }
    return statusMessage
  }, [result, winner, statusMessage, statusWinLabel])

  function applyMove(nextBoard: Board, rowPlaced: number, col: number, player: Player) {
    setBoard(nextBoard)
    setStatusMessage('')
    if (checkWinner(nextBoard, rowPlaced, col, player, gameConfig.connectN)) {
      setResult('win')
      setWinner(player)
      return
    }
    if (isDraw(nextBoard)) {
      setResult('draw')
      return
    }
    setCurrentPlayer(player === 0 ? 1 : 0)
  }

  function handleColumnClick(col: number) {
    if (result !== 'playing') {
      return
    }
    if (gameMode === 'pvc' && currentPlayer === 1) {
      return
    }

    const outcome = dropDisc(board, col, currentPlayer)
    if ('error' in outcome) {
      setStatusMessage(outcome.error)
      return
    }

    const { board: nextBoard, rowPlaced } = outcome
    applyMove(nextBoard, rowPlaced, col, currentPlayer)
  }

  useEffect(() => {
    if (!isComputerTurn) return

    const timeoutId = setTimeout(() => {
      const col = getAIMove(board, 1, gameConfig)
      const outcome = dropDisc(board, col, 1)
      if ('error' in outcome) return
      const { board: nextBoard, rowPlaced } = outcome
      applyMove(nextBoard, rowPlaced, col, 1)
    }, AI_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [isComputerTurn, board])

  function startGame() {
    setBoard(createEmptyBoard(gameConfig.rows, gameConfig.cols))
    setResult('playing')
    setWinner(null)
    setStatusMessage('')
    const startPlayer: Player = gameMode === 'pvp' ? 0 : firstPlayer === 'human' ? 0 : 1
    setCurrentPlayer(startPlayer)
    setGameStarted(true)
  }

  function restartGame() {
    setBoard(createEmptyBoard(gameConfig.rows, gameConfig.cols))
    setResult('playing')
    setWinner(null)
    setStatusMessage('')
    const nextPlayer: Player = gameMode === 'pvp' ? 0 : firstPlayer === 'human' ? 0 : 1
    setCurrentPlayer(nextPlayer)
  }

  function changeMode() {
    setGameStarted(false)
    setBoard(createEmptyBoard(gameConfig.rows, gameConfig.cols))
    setResult('playing')
    setWinner(null)
    setStatusMessage('')
    setCurrentPlayer(0)
  }

  if (!gameStarted) {
    return (
      <main className="app">
        <h1>Connect 4</h1>
        <section className="mode-select" aria-label="Game setup">
          <p className="mode-select-title">Play mode</p>
          <div className="mode-options">
            <button
              type="button"
              className={`mode-button ${gameMode === 'pvp' ? 'mode-button-active' : ''}`}
              onClick={() => setGameMode('pvp')}
            >
              Two players
            </button>
            <button
              type="button"
              className={`mode-button ${gameMode === 'pvc' ? 'mode-button-active' : ''}`}
              onClick={() => setGameMode('pvc')}
            >
              Vs Computer
            </button>
          </div>
          {gameMode === 'pvc' && (
            <>
              <p className="mode-select-title">Who goes first?</p>
              <div className="mode-options">
                <button
                  type="button"
                  className={`mode-button ${firstPlayer === 'human' ? 'mode-button-active' : ''}`}
                  onClick={() => setFirstPlayer('human')}
                >
                  You go first
                </button>
                <button
                  type="button"
                  className={`mode-button ${firstPlayer === 'computer' ? 'mode-button-active' : ''}`}
                  onClick={() => setFirstPlayer('computer')}
                >
                  Computer goes first
                </button>
              </div>
            </>
          )}
          <button type="button" className="restart-button" onClick={startGame}>
            Start
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <h1>Connect 4</h1>

      <section className="info-panel">
        <div className="turn-row">
          <span className={`turn-indicator ${playerColorClass[currentPlayer]}`} />
          <p>{turnText}</p>
        </div>
        <div className="status-message" aria-live="polite">
          {statusText || '\u00A0'}
        </div>
      </section>

      <section
        className="board"
        style={{ gridTemplateColumns: `repeat(${gameConfig.cols}, 1fr)` }}
        aria-label="Connect 4 board"
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => handleColumnClick(colIndex)}
              disabled={result !== 'playing' || isComputerTurn}
              aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
            >
              <span
                className={`disc ${
                  cell === null ? 'disc-empty' : playerColorClass[cell]
                }`}
              />
            </button>
          )),
        )}
      </section>

      <div className="game-actions">
        <button type="button" className="restart-button" onClick={restartGame}>
          Restart
        </button>
        <button type="button" className="change-mode-button" onClick={changeMode}>
          Change mode
        </button>
      </div>
    </main>
  )
}

export default App
