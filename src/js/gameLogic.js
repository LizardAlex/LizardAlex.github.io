class gameLogic extends EventTarget {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
    this.board = this.generateBoard();
    this.swapBonusActive = false;
    this.swapsRemaining = 3;
    this.moves = 25;
    this.swapTile1 = null;
    this.bombBonusActive = false;
    this.bombsRemaining = 3;
    this.bombRadius = 4;
    this.bonusTileThreshold = 5;
    this.score = 0;
    this.targetGoal = 230;
    this.comboCount = 0;
    this.addEventListener('tileDestroyed', () => {
      this.comboCount += 1;
      const scoreIncrement = this.comboCount >= 10 ? 0 :  this.comboCount >= 6 ? 3 : this.comboCount >= 3 ? 2 : 1;
      this.score += scoreIncrement;
    });
  }

  generateBoard() {
    const board = [];
    for (let row = 0; row < this.height; row++) {
      board[row] = [];
      for (let col = 0; col < this.width; col++) {
        board[row][col] = Math.floor(Math.random() * 5) + 1;
      }
    }
    return board;
  }

  findAdjacentMatches(row, col, visited) {
    if (
      row < 0 ||
      row >= this.height ||
      col < 0 ||
      col >= this.width ||
      visited.has(`${row},${col}`)
    ) {
      return [];
    }

    const color = this.board[row][col];
    visited.add(`${row},${col}`);

    const matches = [{ row, col }];

    const directions = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
    ];

    for (const { r, c } of directions) {
      const newRow = row + r;
      const newCol = col + c;
      if (
        newRow >= 0 &&
        newRow < this.height &&
        newCol >= 0 &&
        newCol < this.width &&
        this.board[newRow][newCol] === color
      ) {
        matches.push(...this.findAdjacentMatches(newRow, newCol, visited));
      }
    }

    return matches;
  }

  removeTiles(matches) {
    for (const { row, col } of matches) {
      this.dispatchEvent(new CustomEvent('tileDestroyed', { detail: { row, col, type: this.board[row][col] } }));
      this.board[row][col] = null;
    }

    if (matches.length >= this.bonusTileThreshold) {
      const bonusType = Math.random() < 0.5 ? 6 : 7;
      this.board[this.tapRow][this.tapCol] = bonusType;
    }
    if (matches.length >= this.bonusTileThreshold * 1.5) {
      this.board[this.tapRow][this.tapCol] = 8;
    }
    if (matches.length >= this.bonusTileThreshold * 2) {
      this.board[this.tapRow][this.tapCol] = 9;
    }
    if (matches.length >= this.bonusTileThreshold) {
      this.dispatchEvent(new CustomEvent('tileSpawned', { detail: { row: this.tapRow, col: this.tapCol, type: this.board[this.tapRow][this.tapCol], bonus: true } }));
    }

    this.dropBlocks();
    this.generateNewBlocks();
  }

  dropBlocks() {
    for (let col = 0; col < this.width; col++) {
      let writeRow = this.height - 1;
      for (let row = this.height - 1; row >= 0; row--) {
        if (this.board[row][col] !== null) {
          if (writeRow !== row) {
            this.board[writeRow][col] = this.board[row][col];
            this.board[row][col] = null;
            this.dispatchEvent(new CustomEvent('tileMoved', { detail: { fromRow: row, fromCol: col, toRow: writeRow, toCol: col } }));
          }
          writeRow--;
        }
      }
    }
  }

  generateNewBlocks() {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.board[row][col] === null) {
          this.board[row][col] = Math.ceil(Math.random() * 5);
          this.dispatchEvent(new CustomEvent('tileSpawned', { detail: { row, col, type: this.board[row][col] } }));
        }
      }
    }
  }

  removeTilesInRadius(row, col, radius) {
    this.dispatchEvent(new CustomEvent('bonusActivated', { detail: { row, col, type: 10 } }));
    for (let r = Math.max(0, row - radius); r <= Math.min(this.height - 1, row + radius); r++) {
      for (let c = Math.max(0, col - radius); c <= Math.min(this.width - 1, col + radius); c++) {
        const distance = Math.abs(r - row) + Math.abs(c - col);
        if (distance < radius) {
          if (this.board[r][c] >= 6 && this.board[r][c] <= 9) this.removeBonusBlocks(r, c);
          this.dispatchEvent(new CustomEvent('tileDestroyed', { detail: { row: r, col: c, type: this.board[r][c] } }));
          this.board[r][c] = null;
        }
      }
    }
  }

  tap(row, col) {
    if (this.score >= this.targetGoal) return 'gameFinished';
    if (this.moves <= 0) return 'gameFinished';
    this.comboCount = 0;
    this.tapRow = row;
    this.tapCol = col;
    if (this.swapBonusActive) {
      if (!this.swapTile1) {
        this.swapTile1 = { row, col };
        return 'swap1';
      } else if (this.swapTile1.row != row || this.swapTile1.col != col) {
        const row2 = this.swapTile1.row;
        const col2 = this.swapTile1.col;
        const temp = this.board[row][col];
        this.board[row][col] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        this.swapTile1 = null;
        this.swapBonusActive = false;
        this.swapsRemaining--;
        this.dispatchEvent(new CustomEvent('tileSwapped', { detail: { fromRow: row, fromCol: col, toRow: row2, toCol: col2 } }));
        return 'swap2';
      } else {
        return 'wrongMove';
      }
    } else if (this.bombBonusActive) {
      this.removeTilesInRadius(row, col, this.bombRadius);
      this.removeTiles([]);
      this.bombBonusActive = false;
      this.bombsRemaining--;
      return 'bombBonus';
    } else {
      const visited = new Set();
      const matches = this.findAdjacentMatches(row, col, visited);
      if (matches.length >= 2 && this.board[row][col] <= 5) {
        this.removeTiles(matches);
        this.moves -= 1;
        return 'correctMove';
      } else if (this.board[row][col] >= 6 && this.board[row][col] <= 9) {
        this.removeBonusBlocks(row, col);
        this.removeTiles([]);
        return 'bonusActivated';
      } else {
        console.log('test Here 777')
        return 'wrongMove';
      }
      
    }
  }

  removeBonusBlocks(row, col) {
    const bonusType = this.board[row][col];
    this.dispatchEvent(new CustomEvent('bonusActivated', { detail: { row, col, type: bonusType } }));
    this.board[row][col] = null;

    if (bonusType === 6) { // horizontal line bonus
      for (let c = 0; c < this.width; c++) {
        if (this.board[row][c] >= 6 && this.board[row][c] <= 9) this.removeBonusBlocks(row, c);
        this.dispatchEvent(new CustomEvent('tileDestroyed', { detail: { row, col: c, type: this.board[row][c], delay: Math.abs(col - c) } }));
        this.board[row][c] = null;
      }
    } else if (bonusType === 7) { // vertical line bonus
      for (let r = 0; r < this.height; r++) {
        if (this.board[r][col] >= 6 && this.board[r][col] <= 9) this.removeBonusBlocks(r, col);
        this.dispatchEvent(new CustomEvent('tileDestroyed', { detail: { row: r, col, type: this.board[r][col], delay: Math.abs(row - r) } }));
        this.board[r][col] = null;
      }
    } else if (bonusType === 8) { // radius bonus
      this.removeTilesInRadius(row, col, this.bombRadius);
    } else if (bonusType === 9) { // clear whole board bonus
      for (let r = 0; r < this.height; r++) {
        for (let c = 0; c < this.width; c++) {
          this.dispatchEvent(new CustomEvent('tileDestroyed', { detail: { row: r, col: c, type: this.board[r][c] } }));
          this.board[r][c] = null;
        }
      }
    }
  }

  activateSwapBonus() {
    if (this.swapsRemaining > 0) {
      this.swapBonusActive = true;
    }
  }

  activateBombBonus() {
    if (this.bombsRemaining > 0) {
      this.bombBonusActive = true;
    }
  }
}

export default gameLogic;