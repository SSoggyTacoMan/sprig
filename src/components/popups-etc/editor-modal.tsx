import { useSignal, useSignalEffect } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { IoClose } from 'react-icons/io5'
import { tinykeys } from 'tinykeys'
import { usePopupCloseClick } from '../../lib/utils/popup-close-click'
import { monacoEditor, editors, openEditor, monacoEditorText, type OpenEditor } from '../../lib/state'
import styles from './editor-modal.module.css'
import levenshtein from 'js-levenshtein'
import { runGameHeadless } from '../../lib/engine'

const enum LastUpdater {
	RESET,
	OpenEditor,
	Monaco
}
export default function EditorModal() {
	const Content = openEditor.value ? editors[openEditor.value.kind].modalContent : () => null
	const text = useSignal(openEditor.value?.text ?? '');
	const [lastUpdater, setLastUpdater] = useState<LastUpdater>(LastUpdater.RESET);

	useSignalEffect(() => {
		if (openEditor.value) text.value = openEditor.value.text
	})

	// Sync editor text changes with code
	useEffect(() => { 
		if (lastUpdater === LastUpdater.Monaco) {
			setLastUpdater(LastUpdater.RESET);
			return;
		}
		const _openEditor = openEditor.peek() 
		const _text = text.value 
		if (!monacoEditor.value || !_openEditor) return

		const model = monacoEditor.value.getModel()
		if (model) {
			const startPos = model.getPositionAt(_openEditor.editRange.from)
			const endPos = model.getPositionAt(_openEditor.editRange.to)
			monacoEditor.value.executeEdits("modal", [{
				range: {
					startLineNumber: startPos.lineNumber,
					startColumn: startPos.column,
					endLineNumber: endPos.lineNumber,
					endColumn: endPos.column
				},
				text: _text,
				forceMoveMarkers: true
			}])
		}

		openEditor.value = {
			..._openEditor,
			text: _text,
			editRange: {
				from: _openEditor.editRange.from,
				to: _openEditor.editRange.from + _text.length
			}
		}
		setLastUpdater(LastUpdater.OpenEditor);
	}, [text.value]);


	useEffect(() => {
		if (lastUpdater === LastUpdater.OpenEditor) {
			setLastUpdater(LastUpdater.RESET);
			return;
		}
		computeAndUpdateModalEditor();
		setLastUpdater(LastUpdater.Monaco);
	}, [monacoEditorText.value]);


	function computeAndUpdateModalEditor() {
		if (!openEditor.value) return;

		const code = monacoEditor.value?.getValue() ?? '';
		const regex = /(bitmap|tune|map|palette)`([\s\S]*?)`/g;
		const editRanges: { kind: string, from: number, to: number }[] = [];
		let match;
		while ((match = regex.exec(code)) !== null) {
			editRanges.push({
				kind: match[1],
				from: match.index,
				to: match.index + match[0].length
			});
		}

		const levenshteinDistances = editRanges.map((foldRange) => {
			if (foldRange.kind !== openEditor.value?.kind) return -1;
			const theCode = code.slice(foldRange.from, foldRange.to);
			const distance = levenshtein(text.value, theCode)
			return distance;
		});

		if (levenshteinDistances.length === 0) return;

		let indexOfMinDistance = 0;
		levenshteinDistances.forEach((distance, didx) => {
			if (levenshteinDistances[indexOfMinDistance]! < 0) indexOfMinDistance = didx;
			const min = levenshteinDistances[indexOfMinDistance]!;
			if (distance >= 0 && distance <= min) indexOfMinDistance = didx;
		});

		if (indexOfMinDistance !== -1) {
			const editRange = editRanges[indexOfMinDistance]
			const openEditorCode = code.slice(editRange.from, editRange.to)

			if (openEditor.value?.kind === 'map') runGameHeadless(code ?? '');

			text.value = openEditorCode;

			openEditor.value = {
				...openEditor.value as OpenEditor,
				editRange: {
					from: editRange.from,
					to: editRange.to
				},
				text: openEditorCode
			}
		}
	}

	usePopupCloseClick(styles.content!, () => openEditor.value = null, !!openEditor.value)
	useEffect(() => tinykeys(window, {
		'Escape': () => openEditor.value = null
	}), [])
	if (!openEditor.value) return null

	return (
		<div class={styles.overlay}>
			<div class={`${styles.container} ${editors[openEditor.value.kind].fullsizeModal ? styles.fullsize : ''}`}>
				<button class={styles.close}><IoClose /></button>
				<div class={styles.content}><Content text={text} /></div>
			</div>
		</div>
	)
}
