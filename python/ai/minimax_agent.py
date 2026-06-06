from __future__ import annotations

import math
from typing import List, Optional, Tuple

from .board_evaluator import BoardEvaluator

Player = str
BoardType = List[List[str]]


class MinimaxAgent:
    def __init__(self, evaluator: BoardEvaluator, max_depth: int = 4) -> None:
        self.evaluator = evaluator
        self.max_depth = max_depth

    def choose_move(self, board: BoardType, player: Player) -> Tuple[int, int]:
        best_value = -math.inf
        best_move: Optional[Tuple[int, int]] = None

        for row, col in self.available_moves(board):
            board[row][col] = player
            value = self.minimax(board, self.evaluator.opponent(player), 1, -math.inf, math.inf)
            board[row][col] = self.evaluator.EMPTY
            if value > best_value:
                best_value = value
                best_move = (row, col)

        if best_move is None:
            raise ValueError("No valid moves available")

        return best_move

    def minimax(
        self,
        board: BoardType,
        player: Player,
        depth: int,
        alpha: float,
        beta: float,
    ) -> float:
        if self.evaluator.is_terminal(board) or depth >= self.max_depth:
            return self.evaluator.evaluate(board, player)

        if player == self.evaluator.max_player:
            value = -math.inf
            for row, col in self.available_moves(board):
                board[row][col] = player
                value = max(value, self.minimax(board, self.evaluator.opponent(player), depth + 1, alpha, beta))
                board[row][col] = self.evaluator.EMPTY
                alpha = max(alpha, value)
                if alpha >= beta:
                    break
            return value
        else:
            value = math.inf
            for row, col in self.available_moves(board):
                board[row][col] = player
                value = min(value, self.minimax(board, self.evaluator.opponent(player), depth + 1, alpha, beta))
                board[row][col] = self.evaluator.EMPTY
                beta = min(beta, value)
                if beta <= alpha:
                    break
            return value

    def available_moves(self, board: BoardType) -> List[Tuple[int, int]]:
        return [(r, c) for r, row in enumerate(board) for c, cell in enumerate(row) if cell == self.evaluator.EMPTY]
