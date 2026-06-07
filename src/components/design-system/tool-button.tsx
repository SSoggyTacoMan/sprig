import { useRef, useEffect } from 'preact/hooks'
import { tinykeys } from 'tinykeys'
import type { IconType } from 'react-icons'
import { modIcon } from '../../lib/utils/events'
import styles from './tool-button.module.css'

export interface ToolButtonProps {
	onActivate?: () => void
	active?: boolean
	name: string
	shortcut?: string
	tooltipSide: 'top' | 'bottom'
	disabled?: boolean
	iconOnly?: boolean
	icon: IconType
}

export default function ToolButton(props: ToolButtonProps) {
	const ref = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		return props.shortcut ? tinykeys(window, {
			[props.shortcut]: (event: KeyboardEvent) => {
				event.preventDefault()
				props.onActivate?.()
				ref.current?.focus({ focusVisible: false } as any)
			}
		}) : undefined
	}, [ props.shortcut ])

	const formattedShortcut = props.shortcut
		?.replaceAll('Shift', '⇧')
		?.replaceAll('$mod', modIcon())
		?.replaceAll('+', '')

	return (
		<button
			class={`${styles.tool} ${props.active ? styles.active : ''}`}
			onClick={() => props.onActivate?.()}
			disabled={props.disabled ?? false}
			ref={ref}
		>
			<props.icon />
			<div class={`${styles.tooltip} ${styles[props.tooltipSide]}`}>
				{props.name}
				{props.shortcut ? <span class={styles.shortcut}>{' '}({formattedShortcut})</span> : ''}
			</div>
			{/* {!props.iconOnly && <div class={styles.toolName}>{props.name}</div>} */}
		</button>
	)
}
