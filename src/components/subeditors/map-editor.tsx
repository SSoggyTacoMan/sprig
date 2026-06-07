import styles from './map-editor.module.css'
import { bitmaps, type EditorProps } from '../../lib/state'
import BitmapPreview from '../design-system/bitmap-preview'
import { type Signal, useSignal, useSignalEffect } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { transparentBgUrl } from '../../lib/utils/transparent-bg'
import { leftDown, rightDown } from '../../lib/utils/events'
import ToolButton from '../design-system/tool-button'
import { IoArrowUndo, IoArrowRedo, IoTrash } from 'react-icons/io5'

const textToGrid = (text: string): string[][] => text.trim().split('\n').map(line => [ ...line.trim() ])
const gridToText = (grid: string[][]): string => '\n' + grid.map(row => row.join('')).join('\n')

interface Moment {
	grid: string[][]
	previous: Moment | null
	next: Moment | null
}

interface ResizeControlsProps {
	grid: string[][]
	setGrid: (grid: string[][]) => void
	dw: -1 | 0 | 1
	dh: -1 | 0 | 1
}

function ResizeControls(props: ResizeControlsProps) {
	const grid = props.grid
    return (
		<div class={styles.resizeControls}>
			<button
				onClick={() => {
					const newGrid = grid.map(row => [...row])
					if (props.dw) newGrid.forEach(row => row[props.dw > 0 ? 'push' : 'unshift']('.')) // Add a column
					if (props.dh) newGrid[props.dh > 0 ? 'push' : 'unshift'](new Array(newGrid[0]!.length).fill('.')) // Add a row
					props.setGrid(newGrid)
				}}
			>
				+
			</button>

			<button
				onClick={() => {
					const newGrid = grid.map(row => [...row])
					if (props.dw) newGrid.forEach(row => row.splice(props.dw > 0 ? row.length - 1 : 0, 1)) // Remove a column
					if (props.dh) newGrid.splice(props.dh > 0 ? newGrid.length - 1 : 0, 1) // Remove a row
					props.setGrid(newGrid)
				}}
				disabled={!!(props.dw && grid[0]!.length <= 1) || !!(props.dh && grid.length <= 1)}
			>
				-
			</button>
		</div>
    )
}

export default function MapEditor(props: EditorProps) {
	const active = useSignal(bitmaps.value[0]?.[0] ?? '.')
	const drawing = useSignal(false)
	const erasing = useSignal(false)
	
	const gridContainer = useRef<HTMLDivElement>(null)
	const gridContainerSize = useSignal<{ width: number, height: number }>({ width: 1, height: 1 })
	useEffect(() => {
		const observer = new ResizeObserver(() => {
			if (!gridContainer.current) return
			gridContainerSize.value = gridContainer.current.getBoundingClientRect()
		})
		observer.observe(gridContainer.current!)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		const mouseup = (event: MouseEvent) => {
			if (!leftDown(event) && !rightDown(event)) drawing.value = false
			erasing.value = rightDown(event)
		}
		window.addEventListener('mouseup', mouseup)
		return () => window.removeEventListener('mouseup', mouseup)
	})

	const moment = useSignal<Moment>({
		grid: textToGrid(props.text.value),
		previous: null,
		next: null
	})

	useSignalEffect(() => {
		const newGrid = textToGrid(props.text.value)
		if (JSON.stringify(newGrid) !== JSON.stringify(moment.peek().grid)) {
			moment.value = {
				grid: newGrid,
				previous: moment.peek(),
				next: null
			}
		}
	})

	const setGrid = (grid: string[][]) => {
		moment.value = {
			grid,
			previous: moment.value,
			next: null
		}
		props.text.value = gridToText(grid)
	}

	const undo = () => {
		if (!moment.value.previous) return
		moment.value = moment.value.previous
		props.text.value = gridToText(moment.value.grid)
	}

	const redo = () => {
		if (!moment.value.next) return
		moment.value = moment.value.next
		props.text.value = gridToText(moment.value.grid)
	}

	const clear = () => {
		const newGrid = moment.value.grid.map(row => row.map(() => '.'))
		setGrid(newGrid)
	}

	const grid = moment.value.grid
	const placeSprite = (x: number, y: number) => {
		const newGrid = grid.map(row => [...row])
		newGrid[y]![x] = erasing.value ? '.' : active.value
		setGrid(newGrid)
	}

	return (
		<div class={styles.container}>
			<div class={styles.sidebar}>
				<div class={styles.spriteButtons}>
					{bitmaps.value.map(([ key, text ]) => (
						<button
							key={key}
							class={`${styles.spriteButton} ${active.value === key && !erasing.value ? styles.active : ''}`}
							style={{ backgroundImage: `url("${transparentBgUrl}")` }}
							onClick={() => active.value = key}
						>
							<BitmapPreview text={text} />
						</button>
					))}
					<button
						class={`${styles.spriteButton} ${active.value === '.' || erasing.value ? styles.active : ''}`}
						style={{ backgroundImage: `url("${transparentBgUrl}")` }}
						onClick={() => active.value = '.'}
					/>
				</div>

				<div class={styles.helpText}>
					<p>Dimensions: {grid[0]?.length ?? 0}&times;{grid.length}</p>
					<p>Drag right click to erase.</p>
				</div>
				<div class={styles.configTools}>
					<div class={styles.toolGrid}>
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
							onActivate={clear}
							tooltipSide='top'
						/>
					</div>
				</div>
			</div>

			<div class={styles.resizeX}>
				<ResizeControls grid={grid} setGrid={setGrid} dw={-1} dh={0} />
				
				<div class={styles.resizeY}>
					<ResizeControls grid={grid} setGrid={setGrid} dw={0} dh={-1} />

					<div
						ref={gridContainer}
						class={styles.gridContainer}
						style={{
							'--cell-size': Math.min(
								gridContainerSize.value.width / grid[0]!.length,
								gridContainerSize.value.height / grid.length
							) + 'px'
						}}
					>
						<div class={styles.grid} style={{ backgroundImage: `url("${transparentBgUrl}")` }}>
							{grid.map((row, y) => (
								<div key={y} class={styles.row}>
									{row.map((cell, x) => {
										const bitmap = bitmaps.value.find(([key]) => key === cell)
										const isError = !bitmap && cell !== '.'
										return (
											<div
												key={x}
												class={`${styles.cell} ${isError ? styles.error : ''}`}
												onContextMenu={(event) => event.preventDefault()}
												onMouseDown={(event) => {
													event.preventDefault()
													erasing.value = rightDown(event)
													if (leftDown(event) || rightDown(event)) {
														drawing.value = true
														placeSprite(x, y)
													}
												}}
												onMouseMove={(event) => {
													event.preventDefault()
													erasing.value = rightDown(event)
													if (drawing.value) {
														if (leftDown(event) || rightDown(event)) {
															placeSprite(x, y)
														} else {
															drawing.value = false
														}
													}
												}}
											>
												{bitmap && <BitmapPreview text={bitmap[1]} />}
											</div>
										)
									})}
								</div>
							))}
						</div>
					</div>

					<ResizeControls grid={grid} setGrid={setGrid} dw={0} dh={1} />
				</div>

				<ResizeControls grid={grid} setGrid={setGrid} dw={1} dh={0} />
			</div>
		</div>
	)
}