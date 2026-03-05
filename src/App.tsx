import { useMemo, useState } from 'react'
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

function App() {
  const [board, setBoard] = useState<Board>(() =>
    createEmptyBoard(gameConfig.rows, gameConfig.cols),
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>(0)
  const [result, setResult] = useState<GameResult>('playing')
  const [winner, setWinner] = useState<Player | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const turnText = useMemo(() => {
    if (result === 'win' && winner !== null) {
      return `${playerLabel[winner]} wins!`
    }
    if (result === 'draw') {
      return "It's a draw!"
    }
    return `${playerLabel[currentPlayer]}'s turn`
  }, [currentPlayer, result, winner])

  const statusText = useMemo(() => {
    if (result === 'win' && winner !== null) {
      return `${playerLabel[winner]} wins the game.`
    }
    if (result === 'draw') {
      return 'Board is full. The game ends in a draw.'
    }
    return statusMessage
  }, [result, winner, statusMessage])

  function handleColumnClick(col: number) {
    if (result !== 'playing') {
      return
    }

    const outcome = dropDisc(board, col, currentPlayer)
    if ('error' in outcome) {
      setStatusMessage(outcome.error)
      return
    }

    const { board: nextBoard, rowPlaced } = outcome
    setBoard(nextBoard)
    setStatusMessage('')

    if (
      checkWinner(nextBoard, rowPlaced, col, currentPlayer, gameConfig.connectN)
    ) {
      setResult('win')
      setWinner(currentPlayer)
      return
    }

    if (isDraw(nextBoard)) {
      setResult('draw')
      return
    }

    setCurrentPlayer(currentPlayer === 0 ? 1 : 0)
  }

  function restartGame() {
    setBoard(createEmptyBoard(gameConfig.rows, gameConfig.cols))
    setCurrentPlayer(0)
    setResult('playing')
    setWinner(null)
    setStatusMessage('')
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
              disabled={result !== 'playing'}
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

      <button className="restart-button" onClick={restartGame}>
        Restart
      </button>
    </main>
  )
}

export default App
