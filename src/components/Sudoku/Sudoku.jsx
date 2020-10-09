import React from 'react';
import { useEffect, useState } from 'react';
import './Sudoku.css';

import SudokuToolCollection from 'sudokutoolcollection';

const Sudoku = () => {
	const [sudoku, setSudoku] = useState(
		new Array(9).fill().map(() => new Array(9).fill(0))
	);

	const [readonly, setReadonly] = useState(
		new Array(9).fill().map(() => new Array(9).fill(false))
	);

	useEffect(() => {
		newSudoku(35);
	}, []);

	const [selected, setSelected] = useState({ x: 4, y: 4 });
	const [visible] = useState(true);

	// Sudoku Game Logic

	function newSudoku(tiles) {
		const str = SudokuToolCollection().generator.generate(32);
		const sud = SudokuToolCollection().conversions.stringToGrid(str);
		const r = new Array(9).fill().map(() => new Array(9).fill(false));
		sud.forEach((row, rIndex) => {
			row.forEach((cell, cIndex) => {
				if (cell === '.') {
					sud[rIndex][cIndex] = 0;
				} else {
					r[rIndex][cIndex] = true;
				}
			});
		});
		setSudoku(sud);
		setReadonly(r);
	}

	function setCell(x, y, value) {
		console.log(x, y);
		if (!readonly[y][x]) {
			const copy = sudoku.slice();
			copy[y][x] = value;
			setSudoku(copy);
		}
	}

	// User Input Logic

	function keydown(e) {
		const { key, code } = e;
		const keyNumber = parseInt(key);

		// Set number for selected cell
		if (!isNaN(keyNumber)) {
			setCell(selected.x, selected.y, keyNumber);
		}
		// Clear number for selected cell
		if (code === 'Escape' || code === 'Backspace' || key === '-') {
			setCell(selected.x, selected.y, 0);
		}

		// Arrow Keys and WASD for selection movement

		// Up
		if (key === 'w' || key === 'ArrowUp') {
			if (selected.y !== 0) {
				setSelected({ x: selected.x, y: selected.y - 1 });
			}
		}
		// Down
		if (key === 's' || key === 'ArrowDown') {
			if (selected.y !== 8) {
				setSelected({ x: selected.x, y: selected.y + 1 });
			}
		}
		// Left
		if (key === 'a' || key === 'ArrowLeft') {
			if (selected.x !== 0) {
				setSelected({ x: selected.x - 1, y: selected.y });
			}
		}
		// Right
		if (key === 'd' || key === 'ArrowRight') {
			if (selected.x !== 8) {
				setSelected({ x: selected.x + 1, y: selected.y });
			}
		}
	}

	// Key Press for changing cell values

	useEffect(() => {
		//Setup Listeners
		document.addEventListener('keydown', keydown);
		//Cleanup Listeners
		return function cleanup() {
			document.removeEventListener('keydown', keydown);
		};
	}, [selected]);

	return (
		<div className='SudokuGame'>
			<div className='Sudoku'>
				{sudoku.map((row, rIndex) => {
					return (
						<div className='row' key={rIndex}>
							{row.map((cell, cIndex) => {
								// Apply styling to the board
								const classes = ['cell'];

								// If in same row, col or square
								const isSelected =
									selected.x === cIndex ||
									selected.y === rIndex ||
									(Math.floor(selected.x / 3) ===
										Math.floor(cIndex / 3) &&
										Math.floor(selected.y / 3) ===
											Math.floor(rIndex / 3));

								if (isSelected) {
									classes.push('selected');
								}

								// Exact match to row/col selected
								const mainSelected =
									selected.x === cIndex &&
									selected.y === rIndex;

								if (mainSelected) {
									classes.push('selected-main');
								}

								// Display readonly differently
								const isReadOnly = readonly[rIndex][cIndex];
								if (isReadOnly) {
									classes.push('cell-readonly');
								} else {
									classes.push('cell-userinput');
								}

								// Dynamic Display

								const displayValue = visible
									? cell === 0
										? ' '
										: cell
									: ' ';

								return (
									<div
										className={classes.join(' ')}
										key={cIndex}
										onClick={() =>
											setSelected({
												x: cIndex,
												y: rIndex,
											})
										}
									>
										{displayValue}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
			<div className='Controls'>
				<h1>Controls</h1>
				<button onClick={() => newSudoku(17)}>New Game</button>
				<button
					onClick={() => {
						setSudoku(
							SudokuToolCollection().conversions.stringToGrid(
								SudokuToolCollection().solver.solve(
									SudokuToolCollection().conversions.gridToString(
										sudoku
									)
								)
							)
						);
					}}
				>
					Solve Game
				</button>
			</div>
		</div>
	);
};

export default React.memo(Sudoku);
