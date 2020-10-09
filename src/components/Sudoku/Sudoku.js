module.exports = {
	copyGrid,
	gridToString,
	stringToGrid,
	solveGrid,
	newGrid,
	blankGrid,
	isUnique,
};
// Helper functions for creating, saving and exporting grids

// 9x9 Grid of 0's
function blankGrid() {
	return new Array(9).fill().map(() => new Array(9).fill(0));
}

// Convert to 81 character string
function gridToString(grid) {
	let str = '';
	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 9; c++) {
			str += grid[r][c];
		}
	}
	return str;
}

// Convert 81 character string of 0-9 to a 9x9 array
function stringToGrid(str) {
	let grid = blankGrid();
	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 9; c++) {
			grid[r][c] = parseInt(str.charAt(r * 9 + c));
		}
	}
	return grid;
}

// Copy a grids value rather than reference
function copyGrid(grid) {
	return stringToGrid(gridToString(grid));
}

// Shuffle a random array
function shuffleArray(arr) {
	let copy = arr.slice();
	let shuffle = [];
	while (copy.length > 0) {
		// Get a random index from copy
		let rIndex = Math.floor(Math.random() * copy.length);
		// Add value to new shuffled array
		shuffle.push(copy[rIndex]);
		// Remove index from copy so it can't be used again
		copy.splice(rIndex, 1);
	}
	return shuffle;
}

// I expect to want 1-9 shuffled a lot
function getShuffledNine() {
	return shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
}

// Check if a number is possible in a position
function possible(grid, row, col, num, zeroIsValid = true) {
	// Only accept 0-9
	if (num >= 0 && num <= 9) {
		/* Handle what we want to do when the number is 0
        Sometimes we want to ignore zeros in our checks */
		if (num == 0) {
			return zeroIsValid;
		}
		/* Start checking rows, cols and squares for the same number
        Ignore checking the [row][col] we are searching */
		// Row Check
		for (var r = 0; r < 9; r++) {
			if (row != r && grid[r][col] == num) {
				return false;
			}
		}
		// Col Check
		for (var c = 0; c < 9; c++) {
			// c != col skips current cell
			if (c != col && grid[row][c] === num) {
				return false;
			}
		}
		// Square Check
		// Get Starting points of the square
		let x = Math.floor(col / 3) * 3; // Possible 0, 3 or 6
		let y = Math.floor(row / 3) * 3; // Possible 0, 3 or 6
		// Start at y, then go y+1, y+2
		for (var r = y; r < y + 3; r++) {
			// Start at x, then go x+1, x+2
			for (var c = x; c < x + 3; c++) {
				// c != col && r != row prevents checking current cell
				if (c != col && r != row && grid[r][c] == num) {
					return false;
				}
			}
		}
		// Survied all check then return true
		return true;
	} else {
		throw new Error('Number outside of range 0-9');
	}
}

// Check if a grid is currently breaking any rules, 0's allowed
function isValid(grid) {
	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 9; c++) {
			// Check row
			if (!possible(grid, r, c, grid[r][c], true)) {
				return false;
			}
		}
	}
	return true;
}

/* Backtracking algorithim for solving a valid Sudoku board
   Uses a reference value to keep track of all soloutions */
function backtrack(grid, soloutions = [], maxSearch = 1) {
	// Make sure the first grid being passed is actually possible
	if (!isValid(grid)) {
		return false;
	}

	// Loop over each row and cell
	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 9; c++) {
			// If currently empty cell
			if (grid[r][c] == 0) {
				// Check if 1-9 is possible
				let shuffle = getShuffledNine();
				for (var n = 0; n < 9; n++) {
					// If number is possible proceed down this branch
					if (possible(grid, r, c, shuffle[n], false)) {
						grid[r][c] = shuffle[n];
						backtrack(grid, soloutions, maxSearch);
						if (soloutions.length >= maxSearch) {
							return true;
						}
						// Only return here if no more soloutions in grid
						grid[r][c] = 0;
					}
				}
				// All numbers 1-9 failed
				return false;
			}
		}
	}
	soloutions.push(copyGrid(grid));
	return true;
}

// Check if a grid only has one soloution
function isUnique(grid) {
	const soloutions = [];
	const copy = copyGrid(grid);
	backtrack(copy, soloutions, 2);
	return soloutions.length < 2;
}

// Get the one soloution from a grid
function solveGrid(grid) {
	const soloution = [];
	backtrack(grid, soloution, 1);
	return soloution[0];
}

// Currently wouldn't recommend trying below 30
function newGrid(cells) {
	// limit cells between 17 and 81
	cells = cells > 81 ? 81 : cells < 17 ? 17 : cells;
	// New Solved Grid
	let grid = solveGrid(blankGrid());
	let tiles = 81;
	while (tiles > cells) {
		// Get random row and column
		let row = Math.floor(Math.random() * 9);
		let col = Math.floor(Math.random() * 9);
		// Check its not blank
		while (grid[row][col] == 0) {
			row = Math.floor(Math.random() * 9);
			col = Math.floor(Math.random() * 9);
		}
		// Remember previous value for backtracking
		let value = grid[row][col];
		grid[row][col] = 0;
		if (!isUnique(grid)) {
			grid[row][col] = value;
		} else {
			tiles--;
		}
	}
	return grid;
}
