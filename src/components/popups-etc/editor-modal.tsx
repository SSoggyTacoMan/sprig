import { useSignal, useSignalEffect } from '@preact/signals'
import { useEffect, useRef, useState } from 'preact/hooks'
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
	// Skip write-back when text is being set by openEditor/Monaco (not the sub-editor UI)
	const skipNextWriteback = useRef(true);

	useSignalEffect(() => {
		if (openEditor.value && text.peek() !== openEditor.value.text) {
			// Suppress the write-back triggered by this sync (it's not a user edit)
			skipNextWriteback.current = true;
			text.value = openEditor.value.text
		}
	})

	// Sync sub-editor text changes back to Monaco code
	useEffect(() => {
		if (lastUpdater === LastUpdater.Monaco) {
			setLastUpdater(LastUpdater.RESET);
			return;
		}

		// Skip if this text change came from us (opening modal or Monaco sync), not the sub-editor
		if (skipNextWriteback.current) {
			skipNextWriteback.current = false;
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
		const regex = /(bitmap|tune|map|palette|color)`([\s\S]*?)`/g;

		// Map raw tag name → EditorKind (same as in widgets.ts)
		const tagToKind: Record<string, string> = {
			bitmap:  'bitmap',
			tune:    'sequencer',
			map:     'map',
			palette: 'palette',
			color:   'palette',
		};

		const editRanges: { kind: string, from: number, to: number }[] = [];
		let match;
		while ((match = regex.exec(code)) !== null) {
			const tag = match[1]!;
			const kind = tagToKind[tag] ?? tag;
			editRanges.push({
				kind,
				from: match.index + tag.length + 1,
				to: match.index + match[0]!.length - 1
			});
		}

		// Only consider ranges matching the same kind as the open editor
		const currentKind = openEditor.value.kind;
		const sameKindRanges = editRanges.filter(r => r.kind === currentKind);

		if (sameKindRanges.length === 0) return;

		// Find the range with smallest Levenshtein distance to current text
		let indexOfMinDistance = 0;
		let minDistance = Infinity;
		sameKindRanges.forEach((foldRange, didx) => {
			const theCode = code.slice(foldRange.from, foldRange.to);
			const distance = levenshtein(text.value, theCode);
			if (distance < minDistance) {
				minDistance = distance;
				indexOfMinDistance = didx;
			}
		});

		const editRange = sameKindRanges[indexOfMinDistance];
		if (!editRange) return;

		const openEditorCode = code.slice(editRange.from, editRange.to);

		if (openEditor.value?.kind === 'map') runGameHeadless(code ?? '');

		// Suppress write-back triggered by this sync
		skipNextWriteback.current = true;
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

	const closeModal = () => { openEditor.value = null; }

	usePopupCloseClick(styles.content!, closeModal, !!openEditor.value)
	useEffect(() => tinykeys(window, {
		'Escape': closeModal
	}), [])
	if (!openEditor.value) return null

	return (
		<div class={styles.overlay}>
			<div class={`${styles.container} ${editors[openEditor.value.kind].fullsizeModal ? styles.fullsize : ''}`}>
				<button class={styles.close} onClick={closeModal}><IoClose /></button>
				<div class={styles.content}><Content text={text} /></div>
			</div>
		</div>
	)
}
