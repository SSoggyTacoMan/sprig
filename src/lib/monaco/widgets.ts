import type * as monaco from 'monaco-editor';
import { openEditor, type EditorKind } from '../state';

// Monotonically increasing version so each HMR re-run gets a unique command ID
// (monacoInst.editor.registerCommand throws if the same ID is registered twice)
let commandVersion = 0;
// Dispose old CodeLens provider on HMR re-runs to avoid duplicate lenses
let codeLensDisposable: { dispose(): void } | null = null;
let foldingDisposable: { dispose(): void } | null = null;

export function setupMonacoSprig(monacoInst: typeof monaco, _editor: monaco.editor.IStandaloneCodeEditor) {
	// Each call gets a fresh unique command ID — safe to call on every HMR reload
	commandVersion++;
	const commandId = `sprig.openSubEditor.v${commandVersion}`;

	// Dispose old CodeLens provider so we don't accumulate duplicate lenses
	codeLensDisposable?.dispose();
	foldingDisposable?.dispose();

	// Register the command globally — required so CodeLens clicks can invoke it
	monacoInst.editor.registerCommand(commandId, (_, kind: EditorKind, from: number, to: number, text: string) => {
		openEditor.value = { kind, editRange: { from, to }, text };
	});

	// Map template-literal tag names → EditorKind keys in state.ts
	const tagToKind: Record<string, EditorKind> = {
		bitmap:  'bitmap',
		tune:    'sequencer', // tag is "tune", editor kind is "sequencer"
		map:     'map',
		palette: 'palette',
		color:   'palette',   // alias
	};

	// Human-readable labels for the CodeLens button title
	const tagToLabel: Record<string, string> = {
		bitmap:  '🎨 Edit Bitmap',
		tune:    '🎵 Edit Tune',
		map:     '🗺️ Edit Map',
		palette: '🎨 Edit Color',
		color:   '🎨 Edit Color',
	};

	// Register CodeLens Provider for bitmap, tune, map, palette/color
	codeLensDisposable = monacoInst.languages.registerCodeLensProvider('javascript', {
		provideCodeLenses(model, _token) {
			const lenses: monaco.languages.CodeLens[] = [];
			const text = model.getValue();
			const regex = /(bitmap|tune|map|palette|color)`([\s\S]*?)`/g;

			let match;
			while ((match = regex.exec(text)) !== null) {
				const tag  = match[1]!;
				const kind = tagToKind[tag];
				if (!kind) continue;

				const startPos = model.getPositionAt(match.index);
				const endPos   = model.getPositionAt(match.index + match[0].length);

				lenses.push({
					range: new monacoInst.Range(
						startPos.lineNumber, startPos.column,
						endPos.lineNumber,   endPos.column
					),
					id: match.index.toString(),
					command: {
						id: commandId,
						title: tagToLabel[tag] ?? `✏️ Edit ${tag}`,
						arguments: [
							kind,
							match.index + tag.length + 1,      // from: start of content after "tag`"
							match.index + match[0].length - 1, // to:   end of content before closing "`"
							match[2]                           // initial text inside backticks
						]
					}
				});
			}

			return { lenses, dispose: () => {} };
		},
		resolveCodeLens(_model, codeLens, _token) {
			return codeLens;
		}
	});

	// Add native Monaco folding for bitmap template literals.
	foldingDisposable = monacoInst.languages.registerFoldingRangeProvider('javascript', {
		provideFoldingRanges(model) {
			const ranges: monaco.languages.FoldingRange[] = [];
			const regex = /bitmap`([\s\S]*?)`/g;
			const text = model.getValue();
			let match;

			while ((match = regex.exec(text)) !== null) {
				const startLine = model.getPositionAt(match.index).lineNumber;
				const endLine = model.getPositionAt(match.index + match[0].length).lineNumber;
				if (endLine > startLine) {
					ranges.push({ start: startLine, end: endLine, kind: monacoInst.languages.FoldingRangeKind.Region });
				}
			}

			return ranges;
		}
	});
}
