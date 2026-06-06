package com.tictactoe;

import com.tictactoe.game.GameState;

public class GameManager {
    public static void main(String[] args) {
        int boardSize = 3;
        GameState game = new GameState(boardSize);
        System.out.println("Tic-Tac-Toe Game Manager Initialized");
        System.out.println("Board size: " + boardSize + " x " + boardSize);
        System.out.println(game.getBoard());
    }
}
