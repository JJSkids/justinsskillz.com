/**
 * Justin's Skillz - Interactive Chess Engine & UI
 * Path: src/chess.js
 */

const PIECE_IMAGES = {
    'wP': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'wN': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'wB': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'wR': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'wQ': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'wK': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    'bP': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'bN': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'bB': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'bR': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'bQ': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'bK': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
};

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
];

let game = new Chess();
let selectedSquare = null;
let playerColor = 'w'; 
let aiDepth = 2;       

const boardElement = document.getElementById('chessboard');
const statusElement = document.getElementById('game-status');
const difficultySelect = document.getElementById('ai-difficulty');
const playerColorSelect = document.getElementById('player-color');
const resetGameBtn = document.getElementById('reset-game-btn');

function createBoard() {
    if (!boardElement) return;
    boardElement.innerHTML = '';
    const boardState = game.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareSquare = document.createElement('div');
            const rowIdx = playerColor === 'w' ? r : 7 - r;
            const colIdx = playerColor === 'w' ? c : 7 - c;
            
            const squareName = String.fromCharCode(97 + colIdx) + (8 - rowIdx);
            const isLight = (rowIdx + colIdx) % 2 === 0;

            squareSquare.className = `square ${isLight ? 'light' : 'dark'}`;
            squareSquare.dataset.square = squareName;

            const piece = boardState[rowIdx][colIdx];
            if (piece) {
                const key = `${piece.color}${piece.type.toUpperCase()}`;
                const img = document.createElement('img');
                img.src = PIECE_IMAGES[key];
                img.alt = key;
                img.className = 'chess-piece';
                squareSquare.appendChild(img);
            }

            squareSquare.addEventListener('click', () => handleSquareClick(squareName));
            boardElement.appendChild(squareSquare);
        }
    }
    updateStatus();
}

function handleSquareClick(square) {
    if (game.game_over() || game.turn() !== playerColor) return;

    if (selectedSquare === null) {
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
            selectedSquare = square;
            highlightSquare(square, true);
            highlightPossibleMoves(square);
        }
    } else {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' 
        });

        clearHighlights();
        selectedSquare = null;

        if (move !== null) {
            createBoard();
            if (!game.game_over()) {
                window.setTimeout(makeAIMove, 250);
            }
        } else {
            const piece = game.get(square);
            if (piece && piece.color === playerColor) {
                selectedSquare = square;
                highlightSquare(square, true);
                highlightPossibleMoves(square);
            }
        }
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    statusElement.innerText = "AI is thinking...";
    
    setTimeout(() => {
        const bestMove = getBestMove(game, aiDepth, game.turn() === 'w');
        if (bestMove) game.move(bestMove);
        createBoard();
    }, 50);
}

function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = PIECE_VALUES[piece.type] + getPieceSquareValue(piece, r, c);
                totalEvaluation += (piece.color === 'w') ? val : -val;
            }
        }
    }
    return totalEvaluation;
}

function getPieceSquareValue(piece, r, c) {
    const isWhite = piece.color === 'w';
    const row = isWhite ? r : 7 - r;
    const idx = row * 8 + c;

    if (piece.type === 'p') return PAWN_TABLE[idx];
    if (piece.type === 'n') return KNIGHT_TABLE[idx];
    return 0;
}

function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game.board());
    }

    const moves = game.moves({ verbose: true });

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function getBestMove(gameInstance, depth, isMaximizing) {
    const moves = gameInstance.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    let bestMove = moves[Math.floor(Math.random() * moves.length)];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
        gameInstance.move(move);
        const boardValue = minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
        gameInstance.undo();

        if (isMaximizing && boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        } else if (!isMaximizing && boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove;
}

function highlightSquare(square, isSelected) {
    const el = document.querySelector(`[data-square="${square}"]`);
    if (el) el.classList.add(isSelected ? 'selected' : 'highlight-move');
}

function highlightPossibleMoves(square) {
    const moves = game.moves({ square: square, verbose: true });
    moves.forEach(m => highlightSquare(m.to, false));
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'highlight-move');
    });
}

function updateStatus() {
    if (!statusElement) return;
    if (game.in_checkmate()) {
        statusElement.innerText = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
    } else if (game.in_draw()) {
        statusElement.innerText = 'Game Over - Draw!';
    } else if (game.in_check()) {
        statusElement.innerText = `${game.turn() === 'w' ? 'White' : 'Black'} is in Check!`;
    } else {
        statusElement.innerText = `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`;
    }
}

if (resetGameBtn) {
    resetGameBtn.addEventListener('click', () => {
        game.reset();
        playerColor = playerColorSelect ? playerColorSelect.value : 'w';
        aiDepth = difficultySelect ? parseInt(difficultySelect.value) : 2;
        createBoard();
        if (playerColor === 'b') {
            window.setTimeout(makeAIMove, 300);
        }
    });
}

createBoard();