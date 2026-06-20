import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Board,
  MoveTrace,
  Player,
  SearchTrace,
  analyzePosition,
  cloneBoard,
  createBoard,
  getWinner,
  isBoardFull,
  isTerminal,
} from './game';

const MIN_BOARD_SIZE = 3;
const MAX_BOARD_SIZE = 8;

function clampBoardSize(value: number): number {
  return Math.max(MIN_BOARD_SIZE, Math.min(MAX_BOARD_SIZE, value));
}

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'game'>('setup');
  const [boardSize, setBoardSize] = useState<number>(3);
  const [humanPlayer, setHumanPlayer] = useState<Player>('X');
  const [board, setBoard] = useState<Board>(() => createBoard(3));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [isThinking, setIsThinking] = useState(false);
  const [recordedOutcome, setRecordedOutcome] = useState<'human' | 'ai' | 'draw' | null>(null);
  const [scoreboard, setScoreboard] = useState({ human: 0, ai: 0, draws: 0 });
  const [searchTrace, setSearchTrace] = useState<SearchTrace | null>(null);

  const aiPlayer: Player = humanPlayer === 'X' ? 'O' : 'X';
  const maxDepth = useMemo(() => {
    if (boardSize <= 3) {
      return 9;
    }

    if (boardSize === 4) {
      return 6;
    }

    if (boardSize <= 5) {
      return 5;
    }

    return 4;
  }, [boardSize]);

  useEffect(() => {
    if (phase !== 'game') {
      return;
    }

    if (currentPlayer !== aiPlayer || isTerminal(board)) {
      return;
    }

    setIsThinking(true);
    const timer = window.setTimeout(() => {
      const trace = analyzePosition(cloneBoard(board), currentPlayer, aiPlayer, maxDepth);
      const move = trace.bestMove;

      setSearchTrace(trace);

      if (!move) {
        setIsThinking(false);
        return;
      }

      setBoard((currentBoard) => {
        const nextBoard = cloneBoard(currentBoard);
        nextBoard[move.row][move.col] = aiPlayer;
        return nextBoard;
      });
      setCurrentPlayer(humanPlayer);
      setIsThinking(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [aiPlayer, board, currentPlayer, humanPlayer, maxDepth, phase]);

  const winner = getWinner(board);
  const draw = !winner && isBoardFull(board);
  const finished = Boolean(winner || draw);

  useEffect(() => {
    if (!finished || recordedOutcome) {
      return;
    }

    const outcome = winner ? (winner === humanPlayer ? 'human' : 'ai') : 'draw';

    setScoreboard((currentScoreboard) => ({
      human: currentScoreboard.human + (outcome === 'human' ? 1 : 0),
      ai: currentScoreboard.ai + (outcome === 'ai' ? 1 : 0),
      draws: currentScoreboard.draws + (outcome === 'draw' ? 1 : 0),
    }));
    setRecordedOutcome(outcome);
  }, [finished, humanPlayer, recordedOutcome, winner]);

  const statusMessage = finished
    ? winner
      ? `${winner} wins the round.`
      : 'The board is full. It is a draw.'
    : isThinking
      ? 'AI is calculating the best move.'
      : currentPlayer === humanPlayer
        ? `Your turn as ${humanPlayer}.`
        : `AI turn as ${aiPlayer}.`;

  const handleCellClick = (row: number, col: number) => {
    if (finished || isThinking || currentPlayer !== humanPlayer || board[row][col]) {
      return;
    }

    setBoard((currentBoard) => {
      const nextBoard = cloneBoard(currentBoard);
      nextBoard[row][col] = humanPlayer;
      return nextBoard;
    });
    setCurrentPlayer(aiPlayer);
  };

  const startGame = () => {
    setBoard(createBoard(boardSize));
    setCurrentPlayer('X');
    setIsThinking(false);
    setRecordedOutcome(null);
    setSearchTrace(null);
    setPhase('game');
  };

  const restartGame = () => {
    setBoard(createBoard(boardSize));
    setCurrentPlayer('X');
    setIsThinking(false);
    setRecordedOutcome(null);
    setSearchTrace(null);
  };

  const changeSettings = () => {
    setPhase('setup');
    setIsThinking(false);
  };

  const occupiedCells = board.reduce(
    (count, row) => count + row.reduce((rowCount, cell) => rowCount + (cell ? 1 : 0), 0),
    0,
  );
  const progressPercent = Math.round((occupiedCells / (boardSize * boardSize)) * 100);

  const searchMoveMap = useMemo(() => {
    const map = new Map<string, MoveTrace>();
    searchTrace?.candidates.forEach((candidate) => {
      map.set(`${candidate.move.row}-${candidate.move.col}`, candidate);
    });
    return map;
  }, [searchTrace]);

  const bestSearchMove = useMemo(() => {
    if (!searchTrace?.candidates.length) {
      return null;
    }

    return [...searchTrace.candidates].sort((first, second) => second.score - first.score)[0] ?? null;
  }, [searchTrace]);

  return phase === 'setup' ? (
    <main className="app-shell setup-page">
      <section className="setup-card">
        <div className="hero-copy">
          <p className="eyebrow">Game Setup</p>
          <h1>Choose your board and symbol.</h1>
          <p className="lede">
            Pick the board size and decide whether you want X or O. Then start the match and the game screen will
            open with the board on the left and the AI details on the right.
          </p>
        </div>

        <div className="control-panel setup-controls">
          <div className="control-group">
            <div className="control-head">
              <span className="control-label">Board size</span>
              <span className="control-value">{boardSize} x {boardSize}</span>
            </div>
            <div className="size-control">
              <input
                type="range"
                min={MIN_BOARD_SIZE}
                max={MAX_BOARD_SIZE}
                step={1}
                value={boardSize}
                aria-label="Board size slider"
                onChange={(event) => setBoardSize(clampBoardSize(Number(event.target.value)))}
              />
              <div className="size-input-row">
                <label className="size-input-label" htmlFor="board-size-input">
                  Size
                </label>
                <input
                  id="board-size-input"
                  className="size-input"
                  type="number"
                  min={MIN_BOARD_SIZE}
                  max={MAX_BOARD_SIZE}
                  step={1}
                  value={boardSize}
                  onChange={(event) => setBoardSize(clampBoardSize(Number(event.target.value) || MIN_BOARD_SIZE))}
                />
              </div>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Play as</span>
            <div className="segmented-control" role="tablist" aria-label="Player side">
              {(['X', 'O'] as Player[]).map((player) => (
                <button
                  key={player}
                  type="button"
                  className={player === humanPlayer ? 'segment active' : 'segment'}
                  onClick={() => setHumanPlayer(player)}
                >
                  {player}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="reset-button" onClick={startGame}>
            Start game
          </button>
        </div>
      </section>

      <section className="setup-card setup-note">
        <p className="status-label">What happens next</p>
        <h2>The game screen shows the board on the left and the AI guide on the right.</h2>
        <p className="lede">
          You can always return here to change the size or symbol. The match will restart with your new choices.
        </p>
      </section>
    </main>
  ) : (
    <main className="app-shell game-page">
      <section className="game-layout">
        <div className="game-board-panel">
          <div className="status-row">
            <div>
              <p className="status-label">Match status</p>
              <h2>{statusMessage}</h2>
            </div>
            <div className="status-badges">
              <span className="badge">You: {humanPlayer}</span>
              <span className="badge badge-ghost">AI: {aiPlayer}</span>
            </div>
          </div>

          <div className="board" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }} aria-label="Tic tac toe board">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isWinningCell = Boolean(winner && cell === winner);

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    className={isWinningCell ? 'cell winning' : 'cell'}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={Boolean(cell) || finished || isThinking || currentPlayer !== humanPlayer}
                    aria-label={`Row ${rowIndex + 1} column ${colIndex + 1}`}
                  >
                    {cell}
                  </button>
                );
              }),
            )}
          </div>

          <div className="footer-note">
            <span>{isThinking ? 'Pruning branches and evaluating threats...' : 'Alpha-beta style search is built into the local AI.'}</span>
            <span>{boardSize} x {boardSize} board support is enabled.</span>
          </div>

          <div className="inline-actions">
            <button type="button" className="reset-button" onClick={restartGame}>
              Restart match
            </button>
            <button type="button" className="segment" onClick={changeSettings}>
              Change settings
            </button>
          </div>
        </div>

        <aside className="game-sidebar">
          <div className="summary-grid" aria-label="Game summary">
            <div className="summary-card">
              <span>Human wins</span>
              <strong>{scoreboard.human}</strong>
            </div>
            <div className="summary-card">
              <span>AI wins</span>
              <strong>{scoreboard.ai}</strong>
            </div>
            <div className="summary-card">
              <span>Draws</span>
              <strong>{scoreboard.draws}</strong>
            </div>
          </div>

          <div className="progress-panel">
            <div className="progress-label-row">
              <span>Board progress</span>
              <span>{progressPercent}% filled</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="search-visualization">
            <div className="search-visualization-header">
              <div>
                <p className="status-label">AI guide</p>
                <h3>How the AI picked a move</h3>
              </div>
              <div className="search-metrics">
                <span>{searchTrace ? `${searchTrace.exploredNodes} positions checked` : 'Waiting for AI turn'}</span>
                <span>{searchTrace ? `${searchTrace.prunedBranches} branches skipped` : 'No analysis yet'}</span>
              </div>
            </div>

            <div className="tile-key" aria-label="Tile number explanation">
              <div className="tile-key-item">
                <strong>Square</strong>
                <span>This is the spot on the board the AI is considering.</span>
              </div>
              <div className="tile-key-item">
                <strong>Number</strong>
                <span>Higher numbers mean the move looks better for the AI. Lower numbers mean it is better for you.</span>
              </div>
              <div className="tile-key-item">
                <strong>Checked / skipped</strong>
                <span>Checked means the AI looked at that move. Skipped means it ignored that path because it was already clearly worse.</span>
              </div>
            </div>

            {searchTrace?.candidates?.length ? (
              <>
                <div className="decision-legend">
                  <div className="legend-item">
                    <span className="legend-swatch best" />
                    <span>AI will likely choose this</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch positive" />
                    <span>Good for the AI</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch negative" />
                    <span>Good for you</span>
                  </div>
                </div>

                <div className="decision-grid" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }} aria-label="Minimax decision map">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const candidate = searchMoveMap.get(`${rowIndex}-${colIndex}`);
                      const isBest = bestSearchMove?.move.row === rowIndex && bestSearchMove?.move.col === colIndex;
                      const score = candidate?.score ?? 0;
                      const intensity = Math.min(1, Math.abs(Math.max(-100, Math.min(100, score))) / 100);

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={isBest ? 'decision-cell best' : 'decision-cell'}
                          style={{ '--decision-intensity': intensity } as CSSProperties}
                        >
                          <span className="decision-coord">
                            {rowIndex + 1},{colIndex + 1}
                          </span>
                          {cell ? (
                            <strong className="decision-piece">{cell}</strong>
                          ) : candidate ? (
                            <>
                              <strong className={score >= 0 ? 'decision-score positive' : 'decision-score negative'}>
                                {score.toFixed(1)}
                              </strong>
                              <span className="decision-detail">{candidate.pruned ? 'skipped' : 'checked'}</span>
                            </>
                          ) : (
                            <span className="decision-detail muted">not checked</span>
                          )}
                        </div>
                      );
                    }),
                  )}
                </div>

                <div className="decision-summary">
                  <div>
                    <span>Move the AI wants</span>
                    <strong>{bestSearchMove ? `(${bestSearchMove.move.row + 1}, ${bestSearchMove.move.col + 1})` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Strength</span>
                    <strong>{bestSearchMove ? bestSearchMove.score.toFixed(1) : '0.0'}</strong>
                  </div>
                  <div>
                    <span>Search mode</span>
                    <strong>{searchTrace.prunedBranches > 0 ? 'some paths skipped' : 'all paths checked'}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="search-placeholder">This explanation appears after the AI makes its first move.</div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}