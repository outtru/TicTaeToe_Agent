package com.tictactoe.board;

import java.util.ArrayList;
import java.util.List;

public class Board {
    public static final char EMPTY = ' ';
    public static final char PLAYER_X = 'X';
    public static final char PLAYER_O = 'O';

    private final int size;
    private final char[][] grid;

    public Board(int size) {
        this.size = size;
        this.grid = new char[size][size];
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                grid[row][col] = EMPTY;
            }
        }
    }

    public int getSize() {
        return size;
    }

    public char getCell(int row, int col) {
        return grid[row][col];
    }

    public void setCell(int row, int col, char marker) {
        grid[row][col] = marker;
    }

    public boolean isEmptyCell(int row, int col) {
        return grid[row][col] == EMPTY;
    }

    public boolean isFull() {
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                if (grid[row][col] == EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    public List<int[]> availableMoves() {
        List<int[]> moves = new ArrayList<>();
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                if (grid[row][col] == EMPTY) {
                    moves.add(new int[] { row, col });
                }
            }
        }
        return moves;
    }

    public Board copy() {
        Board copy = new Board(size);
        for (int row = 0; row < size; row++) {
            System.arraycopy(this.grid[row], 0, copy.grid[row], 0, size);
        }
        return copy;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                builder.append(grid[row][col]);
                if (col < size - 1) {
                    builder.append(" | ");
                }
            }
            if (row < size - 1) {
                builder.append("\n");
                builder.append("-".repeat(size * 4 - 3));
                builder.append("\n");
            }
        }
        return builder.toString();
    }
}
