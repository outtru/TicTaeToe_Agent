# TicTaeToe_Agent

## Project Title
Development of an Unbeatable AI Agent for Tic-Tac-Toe using Minimax and Heuristic Search Algorithms

## Abstract
In the world of AI, games are a powerful way to test decision-making and search logic. This project focuses on building an unbeatable Tic-Tac-Toe AI agent using a scalable search strategy. The AI is driven by the Minimax algorithm and optimized with Alpha-Beta Pruning to reduce unnecessary game-tree exploration. The goal is to deliver a strong, generalized game engine and a user-friendly interface that demonstrates how deterministic logic can solve adversarial problems without mistakes.

## Scope and Objectives
- Build a flexible Tic-Tac-Toe engine that supports a general N x N board instead of being hard-coded for 3x3.
- Implement Minimax for exhaustive game-state analysis and decision-making.
- Add Alpha-Beta Pruning to improve performance by pruning unreachable branches.
- Develop the core game logic using Java for state management.
- Create a Python-based AI engine for search and evaluation.
- Provide a responsive interface for human players to test against the AI.
- Document performance improvements and pruning efficiency.

## Assumptions
- Full Board Visibility: The AI observes the complete board state at every turn.
- Rational Opponent: The human opponent is assumed to play to win rather than make random moves.

## Declarations
- Scalable Logic: The implementation is designed to scale beyond a 3x3 board using generalized evaluation functions.
- Original Implementation: The Minimax and pruning ideas are established, but the code and heuristic scoring approach are custom-developed for this project.

## Deliverables
- AI Engine: Python implementation of the decision-making algorithms.
- Game Logic: Java-based game engine and state management.
- Pruning Layer: Alpha-Beta Pruning to reduce search time.
- Interface: GUI for human vs. AI gameplay.
- Efficiency Report: Analysis of pruning performance and move reduction.

## Task Plan

### Setup and Design
- Define game state representation for a scalable N x N board.
- Design the core Tic-Tac-Toe rules and win/draw detection logic.
- Set up the Java project structure for game management.
- Outline the AI architecture and data structures for Minimax.

### Core Algorithm Implementation
- Implement the basic Minimax algorithm in Python.
- Create a general board evaluation strategy with line-based threat scoring and terminal-state scoring.
- Integrate the AI decision engine with the Java game state if needed.
- Validate correctness with simple 3x3 game scenarios.

### Optimization and Interface
- Add Alpha-Beta Pruning to the Minimax implementation.
- Measure search reduction and pruning effectiveness.
- Begin GUI development using a front-end framework or Python GUI library.
- Connect the interface to the game engine for interactive play.

### Testing, Documentation, and Finalization
- Perform stress testing with multiple board sizes and opponent strategies.
- Record performance metrics and pruning savings.
- Finalize documentation, user instructions, and project report.
- Prepare demo examples showing the AI is unbeatable on normal play.

## Tools and Technologies
- Python 3.10+ for AI algorithm implementation
- Java for game logic and state management
- React.js (or an alternative GUI framework) for the interface
- Math utilities for Minimax scoring and infinity constants
- VS Code / IntelliJ for development
- GitHub for version control and documentation

## Learning Focus
- Minimax Algorithm: Recursive decision-making in zero-sum games.
- Alpha-Beta Pruning: Optimization of search by eliminating irrelevant branches.
- State-Space Search: Navigating Tic-Tac-Toe game states efficiently.
- Heuristic Evaluation: Scoring non-terminal positions for generalized boards.
- GUI Development: Building an interactive environment for gameplay.

## Frontend GUI
- React + Vite app lives in `frontend/`.
- It provides a playable Tic-Tac-Toe board, board-size selection, and a local Minimax opponent.
- It also shows a search visualization panel with candidate move scores, explored nodes, and pruning activity.
- Run it with `cd frontend && npm install && npm run dev`.

##  Step - 1 
- Design and architecture documentation for board representation, game rules, and AI structure.
- Java game engine scaffolding in `java/src/main/java/com/tictactoe/`.
- Python AI skeleton in `python/ai/`.
- Foundation for scalable N x N board logic and terminal-state detection.

## Next Step
Strengthen the Minimax evaluation with line-based heuristics, then validate 3x3 move selection on positions that separate real threats from scattered pieces.
