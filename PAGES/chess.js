// Initial Board Setup ('uppercase' = White, 'lowercase' = Black)
const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

// Unicode Chess Symbols
const pieceSymbols = {
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
};

// State Variables
let boardState = [];
let selectedSquare = null; // { row, col, piece }
let currentTurn = 'white';
let lastMove = null; // { fromR, fromC, toR, toC }

// Initialize Game
function initGame() {
  boardState = JSON.parse(JSON.stringify(initialBoard));
  selectedSquare = null;
  currentTurn = 'white';
  lastMove = null;
  updateUI();
  renderBoard();
}

// Render Board & Attach Tap Listeners
function renderBoard() {
  const boardEl = document.getElementById('chess-board');
  boardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      
      square.className = `square ${isDark ? 'dark' : 'light'}`;
      square.dataset.row = r;
      square.dataset.col = c;

      // Render Piece Symbol
      const piece = boardState[r][c];
      if (piece) {
        square.textContent = pieceSymbols[piece];
      }

      // Highlight Selected Square
      if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
        square.classList.add('selected');
      }

      // Highlight Last Move
      if (lastMove && ((lastMove.fromR === r && lastMove.fromC === c) || (lastMove.toR === r && lastMove.toC === c))) {
        square.classList.add('last-move');
      }

      // Single Click / Tap Handler
      square.addEventListener('click', () => handleTap(r, c));

      boardEl.appendChild(square);
    }
  }
}

// Handle Tap Logic for Mobile
function handleTap(row, col) {
  const clickedPiece = boardState[row][col];
  const isOwnPiece = clickedPiece && isCurrentTurnPiece(clickedPiece);

  // CASE 1: Tap own piece -> Select it
  if (isOwnPiece) {
    selectedSquare = { row, col, piece: clickedPiece };
    renderBoard();
    return;
  }

  // CASE 2: Piece is selected and tapped a destination -> Move piece
  if (selectedSquare) {
    const fromR = selectedSquare.row;
    const fromC = selectedSquare.col;

    // Basic move execution
    boardState[row][col] = selectedSquare.piece;
    boardState[fromR][fromC] = '';

    // Track last move
    lastMove = { fromR, fromC, toR: row, toC: col };

    // Toggle Turn
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    selectedSquare = null;

    updateUI();
    renderBoard();
  }
}

// Helper: Verify if selected piece belongs to the active turn player
function isCurrentTurnPiece(piece) {
  const isWhitePiece = piece === piece.toUpperCase();
  return (currentTurn === 'white' && isWhitePiece) || (currentTurn === 'black' && !isWhitePiece);
}

// Update Status Bar UI
function updateUI() {
  const playerSpan = document.getElementById('current-player');
  const indicator = document.getElementById('turn-indicator');

  playerSpan.textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
  indicator.className = `turn-badge ${currentTurn}-turn`;
}

// Event Listeners
document.getElementById('reset-btn').addEventListener('click', initGame);
document.addEventListener('DOMContentLoaded', initGame);
