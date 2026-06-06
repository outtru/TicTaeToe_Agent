package com.tictactoe.game;

import com.tictactoe.board.Board;
import java.util.ArrayList;
import java.util.List;

public class GameState {
    private final Board board;
    private char currentPlayer;

    public GameState(int size) {
        this.board = new Board(size);
        this.currentPlayer = Board.PLAYER_X;
    }

    public GameState(Board board, char currentPlayer) {
        this.board = board;
        this.currentPlayer = currentPlayer;
    }

    public Board getBoard() {
        return board;
    }

    public char getCurrentPlayer() {
        return currentPlayer;
    }

    public void applyMove(int row, int col) {
        if (!board.isEmptyCell(row, col)) {
            throw new IllegalArgumentException("Cell is already occupied.");
        }
        board.setCell(row, col, currentPlayer);
        currentPlayer = switchPlayer(currentPlayer);
    }

    public List<Move> getLegalMoves() {
        List<Move> moves = new ArrayList<>();
        for (int[] position : board.availableMoves()) {
            moves.add(new Move(position[0], position[1], currentPlayer));
        }
        return moves;
    }

    public boolean isDraw() {
        return board.isFull() && getWinner() == Board.EMPTY;
    }

    public char getWinner() {
        int size = board.getSize();

        // Check rows and columns
        for (int index = 0; index < size; index++) {
            char rowWinner = checkLine(board, index, 0, 0, 1);
            if (rowWinner != Board.EMPTY) {
                return rowWinner;
            }
            char colWinner = checkLine(board, 0, index, 1, 0);
            if (colWinner != Board.EMPTY) {
                return colWinner;
            }
        }

        // Check diagonals
        char diag1Winner = checkLine(board, 0, 0, 1, 1);
        if (diag1Winner != Board.EMPTY) {
            return diag1Winner;
        }
        char diag2Winner = checkLine(board, 0, size - 1, 1, -1);
        if (diag2Winner != Board.EMPTY) {
            return diag2Winner;
        }

        return Board.EMPTY;
    }

    public boolean isTerminal() {
        return getWinner() != Board.EMPTY || board.isFull();
    }

    public GameState copy() {
        return new GameState(board.copy(), currentPlayer);
    }

    private char checkLine(Board board, int startRow, int startCol, int rowDelta, int colDelta) {
        int size = board.getSize();
        char first = board.getCell(startRow, startCol);
        if (first == Board.EMPTY) {
            return Board.EMPTY;
        }

        for (int index = 1; index < size; index++) {
            int row = startRow + rowDelta * index;
            int col = startCol + colDelta * index;
            if (board.getCell(row, col) != first) {
                return Board.EMPTY;
            }
        }
        return first;
    }

    public static char switchPlayer(char player) {
        return player == Board.PLAYER_X ? Board.PLAYER_O : Board.PLAYER_X;
    }
}
