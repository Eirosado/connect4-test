export type Player = 0 | 1
export type Cell = Player | null
export type Board = Cell[][]

export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill(null))
}

export function dropDisc(
  board: Board,
  col: number,
  player: Player,
): { board: Board; rowPlaced: number } | { error: string } {
  if (col < 0 || col >= board[0]?.length) {
    return { error: 'That column is out of bounds.' }
  }

  for (let row = board.length - 1; row >= 0; row -= 1) {
    if (board[row][col] === null) {
      const nextBoard = board.map((currentRow) => [...currentRow])
      nextBoard[row][col] = player
      return { board: nextBoard, rowPlaced: row }
    }
  }

  return { error: 'That column is full. Try another one.' }
}

export function checkWinner(
  board: Board,
  lastRow: number,
  lastCol: number,
  player: Player,
  connectN: number,
): boolean {
  const directions: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]

  for (const [rowDelta, colDelta] of directions) {
    let count = 1

    for (const step of [1, -1]) {
      let row = lastRow + rowDelta * step
      let col = lastCol + colDelta * step

      while (
        row >= 0 &&
        row < board.length &&
        col >= 0 &&
        col < board[0].length &&
        board[row][col] === player
      ) {
        count += 1
        row += rowDelta * step
        col += colDelta * step
      }
    }

    if (count >= connectN) {
      return true
    }
  }

  return false
}

export function isDraw(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null))
}
