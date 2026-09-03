import styles from './editor-mode-picker.module.css'

export type EditorMode = 'legacy' | 'monaco'

interface EditorModePickerProps {
	onSelect: (mode: EditorMode) => void
}

export default function EditorModePicker({ onSelect }: EditorModePickerProps) {
	return (
		<section class={styles.picker} aria-labelledby="editor-mode-title">
			<p class={styles.eyebrow}>Choose your editor</p>
			<h2 id="editor-mode-title">How do you want to code?</h2>
			<p class={styles.description}>
				Pick an editor for this browser. Choice is saved for future visits.
			</p>
			<div class={styles.options}>
				<button class={styles.option} onClick={() => onSelect('legacy')}>
					<strong>Legacy editor</strong>
					<span>Stable Sprig editor with familiar controls.</span>
				</button>
				<button class={`${styles.option} ${styles.beta}`} onClick={() => onSelect('monaco')}>
					<span class={styles.badge}>Beta</span>
					<strong>Monaco editor</strong>
					<span>VS Code-style editor with richer suggestions.</span>
				</button>
			</div>
		</section>
	)
}
