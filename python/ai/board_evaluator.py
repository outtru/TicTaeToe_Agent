from __future__ import annotations

from typing import List

BoardType = List[List[str]]


class BoardEvaluator:
    EMPTY = ' '
    PLAYER_X = 'X'
    PLAYER_O = 'O'

    def __init__(self, max_player: str = PLAYER_X) -> None:
        self.max_player = max_player

    def opponent(self, player: str) -> str:
        return self.PLAYER_O if player == self.PLAYER_X else self.PLAYER_X

    def is_terminal(self, board: BoardType) -> bool:
        return self.get_winner(board) != self.EMPTY or all(cell != self.EMPTY for row in board for cell in row)

    def get_winner(self, board: BoardType) -> str:
        size = len(board)

        # Check rows, columns, and diagonals for a winner.
        for index in range(size):
            if self._all_equal(board[index]):
                return board[index][0]
            column = [board[row][index] for row in range(size)]
            if self._all_equal(column):
                return column[0]

        diagonal1 = [board[i][i] for i in range(size)]
        if self._all_equal(diagonal1):
            return diagonal1[0]

        diagonal2 = [board[i][size - 1 - i] for i in range(size)]
        if self._all_equal(diagonal2):
            return diagonal2[0]

        return self.EMPTY

    def evaluate(self, board: BoardType, player: str) -> float:
        winner = self.get_winner(board)
        if winner == self.max_player:
            return 1.0
        if winner != self.EMPTY:
            return -1.0
        return self._heuristic_score(board)

    def _heuristic_score(self, board: BoardType) -> float:
        size = len(board)
        line_score = 0.0

        for index in range(size):
            line_score += self._score_line([board[index][col] for col in range(size)])
            line_score += self._score_line([board[row][index] for row in range(size)])

        line_score += self._score_line([board[i][i] for i in range(size)])
        line_score += self._score_line([board[i][size - 1 - i] for i in range(size)])

        return line_score / max(2 * size + 2, 1)

    def _score_line(self, line: List[str]) -> float:
        opponent = self.opponent(self.max_player)

        if self.max_player in line and opponent in line:
            return 0.0

        max_count = line.count(self.max_player)
        opponent_count = line.count(opponent)

        if max_count > 0 and opponent_count == 0:
            return float(max_count * (10 ** max_count))
        if opponent_count > 0 and max_count == 0:
            return float(-(opponent_count * (10 ** opponent_count)))
        return 0.0

    def _all_equal(self, line: List[str]) -> bool:
        return len(line) > 0 and line[0] != self.EMPTY and all(cell == line[0] for cell in line)
