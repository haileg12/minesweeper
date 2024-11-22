// game.js
class Minesweeper {
    constructor(size = 10, mineCount = 10) {
        this.size = size;
        this.mineCount = mineCount;
        this.board = [];
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        this.moves = 0;
        this.flags = 0;
        this.muted = false;
        this.theme = 'default';
        
        // Audio elements
        this.explosionSound = new Audio('sounds/explosion.mp3');
        this.victorySound = new Audio('sounds/victory.mp3');
        this.clickSound = new Audio('sounds/click.mp3');
        this.backgroundMusic = new Audio('sounds/background.mp3');
        this.backgroundMusic.loop = true;
        
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        // Create empty board
        this.board = Array(this.size).fill().map(() => 
            Array(this.size).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0
            }))
        );

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);
            
            if (!this.board[x][y].isMine) {
                this.board[x][y].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor counts
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.board[i][j].isMine) {
                    this.board[i][j].neighborCount = this.countNeighborMines(i, j);
                }
            }
        }
    }

    countNeighborMines(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size) {
                    if (this.board[newX][newY].isMine) count++;
                }
            }
        }
        return count;
    }

    revealCell(x, y) {
        if (!this.gameStarted) {
            this.startGame();
        }

        if (this.gameOver || this.board[x][y].isRevealed || this.board[x][y].isFlagged) {
            return;
        }

        this.moves++;
        this.board[x][y].isRevealed = true;

        if (this.board[x][y].isMine) {
            this.endGame(false);
            return;
        }

        if (this.board[x][y].neighborCount === 0) {
            this.revealNeighbors(x, y);
        }

        if (!this.muted) {
            this.clickSound.play();
        }

        this.checkWin();
        this.updateDisplay();
    }

    revealNeighbors(x, y) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size) {
                    if (!this.board[newX][newY].isRevealed && !this.board[newX][newY].isFlagged) {
                        this.revealCell(newX, newY);
                    }
                }
            }
        }
    }

    toggleFlag(x, y) {
        if (!this.gameStarted || this.gameOver || this.board[x][y].isRevealed) {
            return;
        }

        this.board[x][y].isFlagged = !this.board[x][y].isFlagged;
        this.flags += this.board[x][y].isFlagged ? 1 : -1;
        this.updateDisplay();
    }

    startGame() {
        this.gameStarted = true;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
        
        if (!this.muted) {
            this.backgroundMusic.play();
        }
    }

    endGame(won) {
        this.gameOver = true;
        clearInterval(this.timerInterval);
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;

        if (!this.muted) {
            if (won) {
                this.victorySound.play();
            } else {
                this.explosionSound.play();
            }
        }

        // Reveal all mines
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j].isMine) {
                    this.board[i][j].isRevealed = true;
                }
            }
        }

        // Save game results
        this.saveGameResults(won);
        this.updateDisplay();
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = this.board[i][j];
                if (!cell.isMine && !cell.isRevealed) {
                    return;
                }
            }
        }
        this.endGame(true);
    }

    toggleSound() {
        this.muted = !this.muted;
        if (this.muted) {
            this.backgroundMusic.pause();
        } else if (this.gameStarted && !this.gameOver) {
            this.backgroundMusic.play();
        }
    }

    changeTheme(theme) {
        this.theme = theme;
        this.updateDisplay();
    }

    async saveGameResults(won) {
        try {
            const response = await fetch('save_game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    won: won,
                    time: this.timer,
                    moves: this.moves,
                    difficulty: this.size
                })
            });
            const data = await response.json();
            console.log('Game saved:', data);
        } catch (error) {
            console.error('Error saving game:', error);
        }
    }

    updateDisplay() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('td');
                const cellData = this.board[i][j];
                
                cell.className = this.getCellClass(cellData);
                
                if (cellData.isRevealed) {
                    if (cellData.isMine) {
                        cell.innerHTML = '💣';
                    } else if (cellData.neighborCount > 0) {
                        cell.innerHTML = cellData.neighborCount;
                        cell.className += ` number-${cellData.neighborCount}`;
                    }
                } else if (cellData.isFlagged) {
                    cell.innerHTML = '🚩';
                }

                cell.addEventListener('click', () => this.revealCell(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(i, j);
                });
                
                row.appendChild(cell);
            }
            board.appendChild(row);
        }

        // Update game stats
        document.getElementById('mine-count').textContent = this.mineCount - this.flags;
        document.getElementById('moves').textContent = this.moves;
    }

    updateTimer() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getCellClass(cellData) {
        const themeClasses = {
            default: {
                unrevealed: 'cell-unrevealed',
                revealed: 'cell-revealed',
            },
            ocean: {
                unrevealed: 'cell-unrevealed-ocean',
                revealed: 'cell-revealed-ocean',
            },
            forest: {
                unrevealed: 'cell-unrevealed-forest',
                revealed: 'cell-revealed-forest',
            }
        };

        let classes = ['cell'];
        if (cellData.isRevealed) {
            classes.push(themeClasses[this.theme].revealed);
        } else {
            classes.push(themeClasses[this.theme].unrevealed);
        }
        return classes.join(' ');
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('toggle-sound').addEventListener('click', () => {
            this.toggleSound();
        });

        const difficultyButtons = {
            easy: { size: 8, mines: 10 },
            medium: { size: 12, mines: 20 },
            hard: { size: 16, mines: 40 }
        };

        Object.entries(difficultyButtons).forEach(([difficulty, settings]) => {
            document.getElementById(`difficulty-${difficulty}`).addEventListener('click', () => {
                this.size = settings.size;
                this.mineCount = settings.mines;
                this.resetGame();
            });
        });
    }

    resetGame() {
        clearInterval(this.timerInterval);
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.moves = 0;
        this.flags = 0;
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        this.initializeBoard();
        this.updateDisplay();
        this.updateTimer();
    }
}