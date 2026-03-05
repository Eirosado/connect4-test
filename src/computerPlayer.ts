import {
  checkWinner,
  dropDisc,
  type Board,
  type Player,
} from './gameLogic'

export type AIConfig = {
  rows: number
  cols: number
  connectN: number
}

export function getAIMove(
  board: Board,
  player: Player,
  config: AIConfig,
): number {
  const { cols, connectN } = config
  const opponent: Player = player === 0 ? 1 : 0

  for (let col = 0; col < cols; col += 1) {
    const outcome = dropDisc(board, col, player)
    if ('board' in outcome && checkWinner(outcome.board, outcome.rowPlaced, col, player, connectN)) {
      return col
    }
  }

  for (let col = 0; col < cols; col += 1) {
    const outcome = dropDisc(board, col, opponent)
    if ('board' in outcome && checkWinner(outcome.board, outcome.rowPlaced, col, opponent, connectN)) {
      return col
    }
  }

  const validColumns: number[] = []
  for (let col = 0; col < cols; col += 1) {
    const outcome = dropDisc(board, col, player)
    if ('board' in outcome) {
      validColumns.push(col)
    }
  }

  if (validColumns.length === 0) {
    return 0
  }

  const center = (cols - 1) / 2
  validColumns.sort((a, b) => Math.abs(a - center) - Math.abs(b - center))
  return validColumns[0]
}
