import styles from './sequencer.module.css'
import type { EditorProps } from '../../lib/state'
import { type Signal, useSignal, useSignalEffect, signal, useComputed } from '@preact/signals'
import { IoPause, IoPlay, IoStop } from 'react-icons/io5'
import { cellsToTune, height, tuneToCells, beats, type Cells, yNoteMap, playNote, play, cellsEq } from './sequencer-utils'
import { instruments , type InstrumentType, reverseInstrumentKey } from '../../../engine/src/api'
import { textToTune, tuneToText } from '../../../engine/src/base'
import { leftDown, rightDown } from '../../lib/utils/events'
import { useEffect } from 'preact/hooks'
import Button from '../design-system/button'
import ToolButton from '../design-system/tool-button'
import { IoArrowUndo, IoArrowRedo, IoTrash } from 'react-icons/io5'

interface Moment {
	cells: Cells
	previous: Moment | null
	next: Moment | null
}

interface CellProps {
	instrument: Signal<InstrumentType>
	erasing: Signal<boolean>
	lastDraw: Signal<[number, number] | null>
	cells: Signal<Cells>
	setCells: (cells: Cells) => void
	bpm: Signal<number>
	x: number
	y: number
}

const lightColorMap: Record<InstrumentType, string> = {
	sine: '#fa5252',
	square: '#4dabf7',
	sawtooth: '#ff922b',
	triangle: '#51cf66'
}

const colorMap: Record<InstrumentType, string> = {
	sine: '#c92a2a',
	square: '#1971c2',
	sawtooth: '#e8590c',
	triangle: '#099268'
}

const line = (from: [number, number], to: [number, number]): [number, number][] => {
	const dx = Math.abs(to[0] - from[0])
	const dy = Math.abs(to[1] - from[1])
	const sx = from[0] < to[0] ? 1 : -1
	const sy = from[1] < to[1] ? 1 : -1

	let err = dx - dy
	let [_fromX, _fromY] = [from[0], from[1]]

	const line: [number, number][] = []
	while (true) {
		line.push([_fromX, _fromY])
		if (_fromX === to[0] && _fromY === to[1]) break
		const e2 = 2 * err
		if (e2 > -dy) { err -= dy; _fromX += sx }
		if (e2 < dx) { err += dx; _fromY += sy }
	}
	return line
}

function Cell(props: CellProps) {
	const classes = [styles.cell]
	if (props.x % 2 === 0) classes.push(styles.beat)
	if (props.x % 8 === 0) classes.push(styles.downbeat)
	if ((height - props.y) % 7 === 1) classes.push(styles.root)

	const cellSignal = useComputed(() => props.cells.value[`${props.x}_${props.y}`])
	const cell = cellSignal.value
	const backgroundColor = cell ? colorMap[cell] : 'transparent'
	const color = cell ? lightColorMap[cell] : 'black'

	const drawAndPlay = (x: number, y: number) => {
		const key = `${x}_${y}` as const
		const numberInCol = Object.keys(props.cells.value).filter(k => k.startsWith(`${x}_`)).length
		if (numberInCol >= 5) return
		if (props.cells.value[key] !== props.instrument.value) {
			props.setCells({ ...props.cells.value, [key]: props.instrument.value })
			const note = yNoteMap[y]!
			const duration = 1000 * 60 / props.bpm.value
			playNote(note, duration, props.instrument.value)
		}
	}

	return (
		<div
			class={classes.join(' ')}
			style={{ color, backgroundColor }}
			onMouseDown={(event) => {
				event.preventDefault()
				if (leftDown(event)) {
					const key = `${props.x}_${props.y}` as const
					if (key in props.cells.value && props.cells.value[key] === props.instrument.value) {
						const newValue = { ...props.cells.value }
						delete newValue[key]
						props.setCells(newValue)
						props.erasing.value = true
					} else {
						drawAndPlay(props.x, props.y)
						props.erasing.value = false
					}
					props.lastDraw.value = [props.x, props.y]
				}

				// props.erasing.value = rightDown(event)
				if (rightDown(event)) {
					const newValue = { ...props.cells.value }
					delete newValue[`${props.x}_${props.y}`]
					props.setCells(newValue)
				}
			}}
			onMouseOver={(event) => {
				event.preventDefault()
				if (leftDown(event)) {
					const pos: [number, number] = [props.x, props.y]
					for (const [x, y] of line(props.lastDraw.value ?? pos, pos)) {
						if (props.erasing.value) {
							const newValue = { ...props.cells.value }
							delete newValue[`${x}_${y}`]
							props.setCells(newValue)
						} else {
							drawAndPlay(x, y)
						}
					}
					props.lastDraw.value = pos
				}
			}}
		>
			{cell && reverseInstrumentKey[cell]}
		</div>
	)
}

const instrument = signal<InstrumentType>('sine')

function Column({ x, height, lastDraw, instrument, erasing, cells, setCells, bpm, beat }: {
	x: number, height: number,
	lastDraw: Signal<[number, number] | null>,
	instrument: Signal<InstrumentType>,
	erasing: Signal<boolean>,
	cells: Signal<Cells>,
	setCells: (cells: Cells) => void,
	bpm: Signal<number>,
	beat: Signal<number>
}) {
	const isPlayhead = useComputed(() => beat.value === x)
	return (
		<div class={`${styles.column} ${isPlayhead.value ? styles.playhead : ''}`}>
			{new Array(height).fill(0).map((_, y) => (
				<Cell key={`${x},${y}`} {...{ x, y, lastDraw, instrument, erasing, cells, setCells, bpm }} />
			))}
		</div>
	)
}

export default function SequencerEditor(props: EditorProps) {
	const erasing = useSignal(false)
	const bpm = useSignal(120)
	const cells = useSignal<Cells>({})
	const lastDraw = useSignal<[number, number] | null>(null)

	// Prevent right click context menu
	const preventContextMenu = (event: MouseEvent) => { event.preventDefault(); }
	window.addEventListener('contextmenu', preventContextMenu)

	const moment = useSignal<Moment>({
		cells: tuneToCells(textToTune(props.text.value)),
		previous: null,
		next: null
	})

	const setCells = (newCells: Cells) => {
		cells.value = newCells
		moment.value = {
			cells: newCells,
			previous: moment.value,
			next: null
		}
		props.text.value = '\n' + tuneToText(cellsToTune(newCells, bpm.value)).trim()
	}

	const undo = () => {
		if (!moment.value.previous) return
		moment.value = moment.value.previous
		cells.value = moment.value.cells
		props.text.value = '\n' + tuneToText(cellsToTune(moment.value.cells, bpm.value)).trim()
	}

	const redo = () => {
		if (!moment.value.next) return
		moment.value = moment.value.next
		cells.value = moment.value.cells
		props.text.value = '\n' + tuneToText(cellsToTune(moment.value.cells, bpm.value)).trim()
	}

	const clearSequencer = () => {
		setCells({})
		lastDraw.value = null
	}

	// Sync text changes with cells and moment
	useSignalEffect(() => {
		const newCells = tuneToCells(textToTune(props.text.value));
		const count = props.text.value.match(/(.+):/)
		bpm.value = count ? Math.round(60 * 1000 / Number(count[1])) : 120
		
		if (!cellsEq(newCells, cells.peek())) {
			cells.value = newCells
		}
		if (!cellsEq(newCells, moment.peek().cells)) {
			moment.value = {
				cells: newCells,
				previous: moment.peek(),
				next: null
			}
		}
	})

	// Playback state
	const beat = useSignal(0)
	const stop = useSignal<(() => void) | null>(null)

	// On Unmount
	useEffect(() => () => {
		window.removeEventListener('contextmenu', preventContextMenu) // Remove context name block
		stop.value?.() // Stop music
	}, []) // Stop on unmount

	return (
		<div class={styles.container}>
			<div class={styles.grid}>
				{new Array(beats).fill(0).map((_, x) => (
					<Column key={x} {...{ x, height, lastDraw, instrument, erasing, cells, setCells, bpm, beat }} />
				))}
			</div>

			<div class={styles.toolbox}>
				<div class={`${styles.buttons} ${styles.transportControls}`}>
					<Button
						accent
						icon={stop.value ? IoPause : IoPlay}
						onClick={() => {
							if (stop.value) {
								stop.value()
								stop.value = null
							} else {
								stop.value = play(cells, bpm, beat)
							}
						}}
					>
						{stop.value ? 'Pause' : 'Play'}
					</Button>

					<Button
						icon={IoStop}
						onClick={() => {
							stop.value?.()
							stop.value = null
							beat.value = 0
						}}
					/>
					<div class={styles.tools}>
						<ToolButton
							key='undo'
							name='Undo'
							shortcut='$mod+Z'
							icon={IoArrowUndo}
							onActivate={undo}
							disabled={!moment.value.previous}
							tooltipSide='top'
						/>
						<ToolButton
							key='redo'
							name='Redo'
							shortcut='$mod+Shift+Z'
							icon={IoArrowRedo}
							onActivate={redo}
							disabled={!moment.value.next}
							tooltipSide='top'
						/>
						<ToolButton
							key='clear'
							name='Clear'
							icon={IoTrash}
							onActivate={() => {
								const isConfirmed = confirm('Are you sure you want to clear the sequencer?');
								if (isConfirmed) clearSequencer();
							}}
							tooltipSide='top'
						/>
					</div>
				</div>

				<div class={styles.bpm}>
					<div class={styles.label}>Speed (BPM):</div>
					<input
						type='range'
						min='1'
						max='800'
						value={bpm.value / 2}
						onInput={event => bpm.value = parseInt(event.currentTarget.value) * 2}
						class={styles.slider}
					/>
					<input
						type='number'
						value={bpm.value / 2}
						onInput={event => bpm.value = parseInt(event.currentTarget.value) * 2}
						class={styles.number}
					/>
				</div>

				<div class={styles.instruments}>
					<div class={styles.label}>Instrument:</div>

					<div class={styles.buttons}>
						{instruments.map(name => (
							<Button key={name} class={instrument.value === name ? styles.active : ''} onClick={() => instrument.value = name}>
								<span class={styles.key} style={{ color: lightColorMap[name] }}>
									{reverseInstrumentKey[name]}
								</span>
								{' ' + name[0]?.toUpperCase() + name.slice(1)}
							</Button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
