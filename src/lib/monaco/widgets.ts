import type * as monaco from 'monaco-editor';
import { openEditor, type EditorKind } from '../state';

let isSetup = false;

export function setupMonacoSprig(monacoInst: typeof monaco, editor: monaco.editor.IStandaloneCodeEditor) {
	if (isSetup) return;
	isSetup = true;

	const commandId = 'sprig.openSubEditor';

	// Register the command globally so it receives arguments from CodeLens
	monacoInst.editor.registerCommand(commandId, (_, kind: EditorKind, from: number, to: number, text: string) => {
		console.log("COMMAND CALLBACK:", { kind, from, to, textLength: text.length });
		openEditor.value = {
			kind,
			editRange: { from, to },
			text
		};
	});

	// Register CodeLens Provider for bitmap, tune, map
	monacoInst.languages.registerCodeLensProvider('javascript', {
		provideCodeLenses: function (model, token) {
			const lenses: monaco.languages.CodeLens[] = [];
			const text = model.getValue();
			const regex = /(bitmap|tune|map|palette)`([\s\S]*?)`/g;
			
			let match;
			while ((match = regex.exec(text)) !== null) {
				const kind = match[1] as EditorKind;
				const startPos = model.getPositionAt(match.index);
				const endPos = model.getPositionAt(match.index + match[0].length);

				lenses.push({
					range: new monacoInst.Range(
						startPos.lineNumber,
						startPos.column,
						endPos.lineNumber,
						endPos.column
					),
					id: match.index.toString(),
					command: {
						id: commandId,
						title: `🎨 Edit ${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
						arguments: [
							kind,
							match.index + match[1].length + 1,
							match.index + match[0].length - 1,
							match[2]
						]
					}
				});
			}

			return {
				lenses,
				dispose: () => {}
			};
		},
		resolveCodeLens: function (model, codeLens, token) {
			return codeLens;
		}
	});
}
