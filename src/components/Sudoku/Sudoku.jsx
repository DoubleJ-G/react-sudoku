import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import './Sudoku.css';

import SudokuJS from './Sudoku';
const Sudoku = () => {
	const [sudoku, setSudoku] = useState(SudokuJS.blankGrid());

	const [solved, setSolved] = useState(SudokuJS.blankGrid());

	const [candidates, setCandidates] = useState(
		new Array(9).fill().map(() => new Array(9).fill().map(() => []))
	);

	const [readonly, setReadonly] = useState(
		new Array(9).fill().map(() => new Array(9).fill(false))
	);

	const [showMistakes, setShowMistakes] = useState(true);

	useEffect(() => {
		newSudoku(35);
	}, []);

	// const [visible] = useState(true);
	const [notes, setNotes] = useState(false);
	// Sudoku Controls

	const [tiles, setTiles] = useState(50);
	function handleChange(e) {
		setTiles(parseInt(e.target.value));
		newSudoku();
	}

	// Sudoku Game Logic

	function newSudoku() {
		const newSudoku = SudokuJS.newGrid(tiles);
		const copy = SudokuJS.copyGrid(newSudoku);
		const newSolve = SudokuJS.solveGrid(copy);
		setSudoku(newSudoku);
		setSolved(newSolve);

		const r = new Array(9).fill().map(() => new Array(9).fill(false));
		newSudoku.forEach((row, rIndex) => {
			row.forEach((cell, cIndex) => {
				if (cell == 0) {
					r[rIndex][cIndex] = false;
				} else {
					r[rIndex][cIndex] = true;
				}
			});
		});
		setReadonly(r);
		setCandidates(
			new Array(9).fill().map(() => new Array(9).fill().map(() => []))
		);
	}

	function setCell(x, y, value) {
		if (notes && value !== 0) {
			const copy = candidates.slice();
			if (copy[y][x].includes(value)) {
				copy[y][x].splice(copy[y][x].indexOf(value), 1);
			} else {
				copy[y][x].push(value);
			}

			setCandidates(copy);
		} else {
			if (!readonly[y][x]) {
				const copy = sudoku.slice();
				copy[y][x] = value;
				setSudoku(copy);
			}
		}
	}

	const [selected, setSelected] = useState([]);
	function isSelected(x, y) {
		if (selected.length === 1) {
			// Single Selections

			const point = selected[0];

			if (sudoku[point.y][point.x] !== 0) {
				// Cell has a value
				return sudoku[point.y][point.x] == sudoku[y][x]
					? 'selected'
					: '';
			} else {
				// Cell is blank
				return point.x === x ||
					point.y === y ||
					(Math.floor(point.x / 3) === Math.floor(x / 3) &&
						Math.floor(point.y / 3) === Math.floor(y / 3))
					? 'selected'
					: '';
			}
		} else {
			// Multi Selects

			for (var p = 0; p < selected.length; p++) {
				if (selected[p].x === x && selected[p].y === y) {
					return 'selected-main';
				}
			}
		}

		return false;
	}

	const [multi, setMulti] = useState(false);

	function addToSelected(x, y) {
		if (multi || mouseDown) {
			const copy = selected.slice();
			copy.push({ x, y });
			setSelected(copy);
		} else {
			setSelected([{ x, y }]);
		}
	}

	// User Input Logic

	function keydown(e) {
		const { key, code } = e;
		const keyNumber = parseInt(key);

		// Set number for selected cell
		if (!isNaN(keyNumber)) {
			for (const point of selected) {
				console.log(point);
				setCell(point.x, point.y, keyNumber);
			}
		}

		// Clear number for selected cell
		if (
			code === 'Escape' ||
			code === 'Backspace' ||
			code == 'Delete' ||
			key === '-'
		) {
			for (const point of selected) {
				setCell(point.x, point.y, 0);
			}
		}

		// Enable Multi Mode

		if (key === 'Control') {
			setMulti(true);
		}

		// Toggle Notes

		if (code === 'Space') {
			setNotes(!notes);
		}
	}

	// Key Press for changing cell values

	function keyup(e) {
		const { key, code } = e;
		if (key === 'Control') {
			setMulti(false);
		}
	}

	useEffect(() => {
		//Setup Listeners
		document.addEventListener('keydown', keydown);
		document.addEventListener('keyup', keyup);
		//Cleanup Listeners
		return function cleanup() {
			document.removeEventListener('keydown', keydown);
			document.removeEventListener('keyup', keyup);
		};
	}, [selected, notes]);

	// Mouse Events

	const [mouseDown, setMouseDown] = useState(false);
	const [useNew, setUseNew] = useState(false);
	function mousedown(e) {
		// setMulti(true);
		setMouseDown(true);
		if (multi) {
			setUseNew(false);
		} else {
			setSelected([]);
		}
	}

	function mouseup(e) {
		// setMulti(false);
		setMouseDown(false);
		setUseNew(true);
	}
	useEffect(() => {
		//Setup Listeners
		document.addEventListener('mousedown', mousedown);
		document.addEventListener('mouseup', mouseup);
		//Cleanup Listeners
		return function cleanup() {
			document.removeEventListener('mousedown', mousedown);
			document.removeEventListener('mouseup', mouseup);
		};
	}, [selected, multi]);

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

								classes.push(isSelected(cIndex, rIndex));

								// Exact match to row/col selected

								if (selected.length > 0) {
									const mainSelected =
										selected[0].x === cIndex &&
										selected[0].y === rIndex;

									if (mainSelected) {
										classes.push('selected-main');
									}
								}

								// Display readonly differently
								const isReadOnly = readonly[rIndex][cIndex];
								if (isReadOnly) {
									classes.push('cell-readonly');
								} else {
									const isMistake =
										sudoku[rIndex][cIndex] !=
										solved[rIndex][cIndex];
									if (isMistake && showMistakes) {
										classes.push('cell-error');
									} else {
										classes.push('cell-userinput');
									}
								}
								let cellDisplay;
								// Single Display
								if (
									candidates[rIndex][cIndex].length < 1 ||
									isReadOnly ||
									sudoku[rIndex][cIndex] !== 0
								) {
									cellDisplay = cell === 0 ? ' ' : cell;
								} else {
									const c = [];
									for (var n = 1; n < 10; n++) {
										if (
											candidates[rIndex][cIndex].includes(
												n
											)
										) {
											c.push(n);
										} else {
											c.push(' ');
										}
									}

									cellDisplay = (
										<div className='candidates'>
											{c.map((n, i) => {
												return <div key={i}>{n}</div>;
											})}
										</div>
									);
								}

								// Multi Display

								return (
									<div
										className={classes.join(' ')}
										key={cIndex}
										onClick={() => {
											addToSelected(cIndex, rIndex);
										}}
										onMouseMove={() => {
											let alreadySelected = false;

											for (const point of selected) {
												if (
													point.x == cIndex &&
													point.y == rIndex
												) {
													alreadySelected = true;
													break;
												}
											}
											if (mouseDown && !alreadySelected) {
												addToSelected(cIndex, rIndex);
											}
										}}
									>
										{cellDisplay}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
			<div className='Controls'>
				<div className='options'>
					<h1>Controls</h1>
					<button onClick={() => newSudoku(tiles)}>New Game</button>
					<button
						onClick={() => {
							setSudoku(solved);
						}}
					>
						Solve Game
					</button>
					<span>Tiles: {tiles}</span>
					<input
						type='range'
						min='30'
						max='81'
						value={tiles}
						onChange={handleChange}
					/>
					<button onClick={() => setShowMistakes(!showMistakes)}>
						Show Mistakes: {showMistakes ? 'On' : 'Off'}
					</button>
					<button onClick={() => setNotes(!notes)}>
						Notes: {notes ? 'On' : 'Off'}
					</button>

					<button onClick={() => setMulti(!multi)}>
						Select Mode: {multi ? ' Multi' : 'Single'}
					</button>
				</div>

				<div className='keypad'>
					<div
						onClick={() => {
							console.log(1);
							for (const point of selected) {
								console.log(point);
								setCell(point.x, point.y, 1);
							}
						}}
					>
						1
					</div>
					<div>2</div>
					<div>3</div>
					<div>4</div>
					<div>5</div>
					<div>6</div>
					<div>7</div>
					<div>8</div>
					<div>9</div>
					<div className='del'>Delete</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(Sudoku);
