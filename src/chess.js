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

const pieceSymbols = {
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
};

let boardState = [];
let selectedSquare = null;
let currentTurn = 'white';

function initGame() {
  boardState = JSON.parse(JSON.stringify(initialBoard));
  selectedSquare = null;
  currentTurn = 'white';
  renderBoard();
}

function renderBoard() {
  const boardEl = document.getElementById('chess-board');
  if (!boardEl) return;
  boardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      
      square.style.display = 'flex';
      square.style.alignItems = 'center';
      square.style.justifyContent = 'center';
      square.style.fontSize = '2rem';
      square.style.cursor = 'pointer';
      square.style.backgroundColor = isDark ? '#475569' : '#e2e8f0';
      square.style.color = isDark ? '#f8fafc' : '#0f172a';

      const piece = boardState[r][c];
      if (piece) square.textContent = pieceSymbols[piece];

      if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
        square.style.backgroundColor = '#f59e0b';
      }

      square.addEventListener('click', () => handleTap(r, c));
      boardEl.appendChild(square);
    }
  }
}

function handleTap(r, c) {
  const piece = boardState[r][c];
  if (piece) {
    selectedSquare = { row: r, col: c, piece };
    renderBoard();
    return;
  }
  if (selectedSquare) {
    boardState[r][c] = selectedSquare.piece;
    boardState[selectedSquare.row][selectedSquare.col] = '';
    selectedSquare = null;
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    document.getElementById('turn-indicator').textContent = 'Turn: ' + currentTurn;
    renderBoard();
  }
}

document.getElementById('reset-btn')?.addEventListener('click', initGame);
document.addEventListener('DOMContentLoaded', initGame);