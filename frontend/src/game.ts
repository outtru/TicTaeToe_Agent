export type Player = 'X' | 'O';
export type Cell = Player | '';
export type Board = Cell[][];

export interface Move {
  row: number;
  col: number;
}

export interface SearchResult {
  score: number;
  move?: Move;
}

export interface MoveTrace {
  move: Move;
  score: number;
  exploredNodes: number;
  pruned: boolean;
}

export interface SearchTrace {
  bestMove: Move | null;
  bestScore: number;
  exploredNodes: number;
  prunedBranches: number;
  candidates: MoveTrace[];
}

export const EMPTY: Cell = '';

export function createBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => EMPTY));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getOpponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

export function availableMoves(board: Board): Move[] {
  const moves: Move[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] === EMPTY) {
        moves.push({ row, col });
      }
    }
  }

  return moves;
}

export function isBoardFull(board: Board): boolean {
  return availableMoves(board).length === 0;
}

export function getWinner(board: Board): Player | '' {
  const size = board.length;

  for (let index = 0; index < size; index += 1) {
    const row = board[index];
    const column = board.map((currentRow) => currentRow[index]);

    const rowWinner = lineWinner(row);
    if (rowWinner) {
      return rowWinner;
    }

    const columnWinner = lineWinner(column);
    if (columnWinner) {
      return columnWinner;
    }
  }

  const diagonalOne = board.map((row, index) => row[index]);
  const diagonalTwo = board.map((row, index) => row[size - 1 - index]);

  return lineWinner(diagonalOne) || lineWinner(diagonalTwo) || EMPTY;
}

export function isTerminal(board: Board): boolean {
  return getWinner(board) !== EMPTY || isBoardFull(board);
}

export function evaluateBoard(board: Board, aiPlayer: Player): number {
  const winner = getWinner(board);
  const opponent = getOpponent(aiPlayer);

  if (winner === aiPlayer) {
    return 100000;
  }

  if (winner === opponent) {
    return -100000;
  }

  const size = board.length;
  let score = 0;

  for (let index = 0; index < size; index += 1) {
    score += scoreLine(board[index], aiPlayer);
    score += scoreLine(board.map((row) => row[index]), aiPlayer);
  }

  score += scoreLine(board.map((row, index) => row[index]), aiPlayer);
  score += scoreLine(board.map((row, index) => row[size - 1 - index]), aiPlayer);

  return score / Math.max(2 * size + 2, 1);
}

export function chooseBestMove(board: Board, currentPlayer: Player, aiPlayer: Player, maxDepth: number): Move | null {
  const result = analyzePosition(board, currentPlayer, aiPlayer, maxDepth);
  return result.bestMove;
}

export function analyzePosition(board: Board, currentPlayer: Player, aiPlayer: Player, maxDepth: number): SearchTrace {
  const candidates: MoveTrace[] = [];
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  let exploredNodes = 0;
  let prunedBranches = 0;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of orderedMoves(board)) {
    board[move.row][move.col] = currentPlayer;

    const subtree = minimax(board, getOpponent(currentPlayer), aiPlayer, 1, maxDepth, alpha, beta);
    exploredNodes += subtree.exploredNodes + 1;
    prunedBranches += subtree.prunedBranches;

    const candidate: MoveTrace = {
      move,
      score: subtree.score,
      exploredNodes: subtree.exploredNodes + 1,
      pruned: subtree.prunedBranches > 0,
    };
    candidates.push(candidate);

    board[move.row][move.col] = EMPTY;

    if (subtree.score > bestScore) {
      bestScore = subtree.score;
      bestMove = move;
    }

    alpha = Math.max(alpha, bestScore);

    if (alpha >= beta) {
      prunedBranches += orderedMoves(board).length - candidates.length;
      break;
    }
  }

  return {
    bestMove,
    bestScore,
    exploredNodes,
    prunedBranches,
    candidates,
  };
}

function minimax(
  board: Board,
  currentPlayer: Player,
  aiPlayer: Player,
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
): SearchResult & { exploredNodes: number; prunedBranches: number } {
  if (isTerminal(board) || depth >= maxDepth) {
    return { score: evaluateBoard(board, aiPlayer), exploredNodes: 1, prunedBranches: 0 };
  }

  const moves = orderedMoves(board);
  let exploredNodes = 1;
  let prunedBranches = 0;

  if (currentPlayer === aiPlayer) {
    let bestScore = -Infinity;
    let bestMove: Move | undefined;

    for (const move of moves) {
      board[move.row][move.col] = currentPlayer;
      const result = minimax(board, getOpponent(currentPlayer), aiPlayer, depth + 1, maxDepth, alpha, beta);
      board[move.row][move.col] = EMPTY;
      exploredNodes += result.exploredNodes;
      prunedBranches += result.prunedBranches;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }

      alpha = Math.max(alpha, bestScore);

      if (alpha >= beta) {
        break;
      }
    }

    return { score: bestScore, move: bestMove, exploredNodes, prunedBranches };
  }

  let bestScore = Infinity;
  let bestMove: Move | undefined;

  for (const move of moves) {
    board[move.row][move.col] = currentPlayer;
    const result = minimax(board, getOpponent(currentPlayer), aiPlayer, depth + 1, maxDepth, alpha, beta);
    board[move.row][move.col] = EMPTY;
    exploredNodes += result.exploredNodes;
    prunedBranches += result.prunedBranches;

    if (result.score < bestScore) {
      bestScore = result.score;
      bestMove = move;
    }

    beta = Math.min(beta, bestScore);

    if (beta <= alpha) {
      break;
    }
  }

  return { score: bestScore, move: bestMove, exploredNodes, prunedBranches };
}

function orderedMoves(board: Board): Move[] {
  const size = board.length;
  const center = (size - 1) / 2;

  return availableMoves(board).sort((first, second) => {
    const firstDistance = Math.abs(first.row - center) + Math.abs(first.col - center);
    const secondDistance = Math.abs(second.row - center) + Math.abs(second.col - center);
    return firstDistance - secondDistance;
  });
}

function scoreLine(line: Cell[], aiPlayer: Player): number {
  const opponent = getOpponent(aiPlayer);

  if (line.includes(aiPlayer) && line.includes(opponent)) {
    return 0;
  }

  const aiCount = line.filter((cell) => cell === aiPlayer).length;
  const opponentCount = line.filter((cell) => cell === opponent).length;

  if (aiCount > 0 && opponentCount === 0) {
    return aiCount * 10 ** aiCount;
  }

  if (opponentCount > 0 && aiCount === 0) {
    return -(opponentCount * 10 ** opponentCount);
  }

  return 0;
}

function lineWinner(line: Cell[]): Player | '' {
  if (line.length === 0 || line[0] === EMPTY) {
    return EMPTY;
  }

  return line.every((cell) => cell === line[0]) ? line[0] : EMPTY;
}