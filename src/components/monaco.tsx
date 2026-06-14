import { useRef, useState, useEffect } from 'preact/hooks'
import * as monaco from 'monaco-editor'
import styles from './monaco.module.css'
import { isNewSaveStrat, monacoEditorText, errorLog, theme, PersistenceStateKind, getEffectiveTheme } from '../lib/state'
import { ConnectionStatus } from '../lib/state'
import type { PersistenceState, RoomState, RoomParticipant } from '../lib/state'
import { type Signal, useSignal, useSignalEffect } from '@preact/signals'
import type { Awareness } from 'y-protocols/awareness'
import type { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
import { startSavingGame } from './big-interactive-pages/editor'
import type { MonacoBinding } from 'y-monaco'
import { setupMonacoSprig } from '../lib/monaco/widgets'
import { defineThemes } from '../lib/monaco/themes'
import sprigTypes from '../lib/monaco/sprig-types.txt?raw'

let hasInjectedTypes = false;

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

if (typeof self !== 'undefined') {
	self.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'typescript' || label === 'javascript') {
				return new tsWorker();
			}
			return new editorWorker();
		}
	};
}

interface MonacoProps {
	class?: string | undefined
	persistenceState: Signal<PersistenceState> | undefined
	roomState: Signal<RoomState> | undefined
	initialCode?: string
	onCodeChange?: () => void
	onRunShortcut?: () => void
	onEditorView?: (editor: monaco.editor.IStandaloneCodeEditor) => void
}

export default function MonacoComponent(props: MonacoProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [editorRef, setEditorRef] = useState<monaco.editor.IStandaloneCodeEditor>();
	const yProviderAwarenessSignal = useSignal<Awareness | undefined>(undefined);
	const bindingRef = useRef<MonacoBinding>();
	
	let yDoc = useRef<Y.Doc>();
	let provider = useRef<WebrtcProvider>();

	useEffect(() => {
		isNewSaveStrat.value = props.roomState ? true : false;
	}, [])

	const onCodeChangeRef = useRef(props.onCodeChange)
	useEffect(() => { onCodeChangeRef.current = props.onCodeChange }, [props.onCodeChange])

	const onRunShortcutRef = useRef(props.onRunShortcut)
	useEffect(() => { onRunShortcutRef.current = props.onRunShortcut }, [props.onRunShortcut])

	useSignalEffect(() => {
		if(!isNewSaveStrat.value) return
		if(yProviderAwarenessSignal.value === undefined) return;
		
		const onChange = () => {
			yProviderAwarenessSignal.value?.getStates().forEach((state) => {
				try{
					if(props.persistenceState === undefined) throw new Error("Persistence state is undefined");
					if(state.saved == "saved"){
						let persistenceState = props.persistenceState.peek();
						if((persistenceState.kind === PersistenceStateKind.PERSISTED || persistenceState.kind === PersistenceStateKind.COLLAB) && persistenceState.game !== "LOADING"){
							props.persistenceState.value = {...persistenceState, cloudSaveState: "SAVED"};
						}
					} else if(state.saved == "error"){
						let persistenceState = props.persistenceState.peek();
						if((persistenceState.kind === PersistenceStateKind.PERSISTED || persistenceState.kind === PersistenceStateKind.COLLAB) && persistenceState.game !== "LOADING"){
							props.persistenceState.value = {...persistenceState, cloudSaveState: "ERROR"};
						}
					}
				} catch(e){}	
			});
		};

		yProviderAwarenessSignal.value.on("change", onChange);
		
		return () => {
			yProviderAwarenessSignal.value?.off("change", onChange);
		};
	});

	useEffect(() => {
		return () => {
			provider.current?.destroy();
			yDoc.current?.destroy();
			bindingRef.current?.destroy();
		};
	}, []);

	async function setupYjs(editor: monaco.editor.IStandaloneCodeEditor) {
		if(!props.roomState || !props.persistenceState) return;

		try {
			props.roomState.value = { ...props.roomState.value, connectionStatus: ConnectionStatus.CONNECTING };
			yDoc.current = new Y.Doc();

			const [{ WebrtcProvider }, { MonacoBinding }] = await Promise.all([
				import('y-webrtc'),
				import('y-monaco')
			]);

			provider.current = new WebrtcProvider(props.roomState.value.roomId, yDoc.current, {
				signaling: [ import.meta.env.PUBLIC_SIGNALING_SERVER_HOST as string ],
			});
			
			let ytext = yDoc.current.getText("monaco");
			yProviderAwarenessSignal.value = provider.current.awareness;

			let persistenceState = props.persistenceState.peek();
			const isHost = ((persistenceState.kind == PersistenceStateKind.PERSISTED && persistenceState.game != "LOADING") && persistenceState.session?.user.id === persistenceState.game.ownerId)
			provider.current.awareness.setLocalStateField("user", {
				name: props.persistenceState.peek().session?.user.email ?? "Anonymous",
				host: isHost
			});

			bindingRef.current = new MonacoBinding(ytext, editor.getModel()!, new Set([editor]), provider.current.awareness);

			setTimeout(() => {
				if (ytext.toString() === "") {
					ytext.insert(0, props.initialCode ?? "");
				}
				if(props.roomState)
					props.roomState.value = { ...props.roomState?.value, connectionStatus: ConnectionStatus.CONNECTED };
			}, 1500);

			provider.current.awareness.on("update", () => {
				let participants: RoomParticipant[] = [];
				provider.current?.awareness.getStates().forEach((state) => {
					try{
						participants.push({ userEmail: state.user.name, isHost: state.user.host })
					} catch(e){ return; }
				});
				if(props.roomState) props.roomState.value.participants = participants;
			});

			let updateTimeoutId: ReturnType<typeof setTimeout>;
			yDoc.current.on("update", () => {
				if(!props.persistenceState) return;
				let persistenceState = props.persistenceState.peek();
				if(persistenceState.kind === PersistenceStateKind.PERSISTED && persistenceState.game !== "LOADING"){
					if(persistenceState.game.ownerId === persistenceState.session?.user.id){
						startSavingGame(props.persistenceState, props.roomState);
					}
				}
				clearTimeout(updateTimeoutId);
				updateTimeoutId = setTimeout(() => {
					monacoEditorText.value = editor.getValue();
					onCodeChangeRef.current?.();
				}, 300);
			});
		} catch(e) {
			console.error(e);
		}
	}

	useEffect(() => {
		if (containerRef.current) {
			defineThemes(monaco);

			if (!hasInjectedTypes) {
				monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
					target: monaco.languages.typescript.ScriptTarget.ES2020,
					allowNonTsExtensions: true,
					lib: ['es2020', 'dom']
				});
				monaco.languages.typescript.javascriptDefaults.addExtraLib(sprigTypes, 'sprig.d.ts');

				monaco.languages.registerCompletionItemProvider('javascript', {
					provideCompletionItems: (model, position) => {
						const word = model.getWordUntilPosition(position);
						const range = {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: word.startColumn,
							endColumn: word.endColumn
						};
						return {
							suggestions: [
								{
									label: 'sprite',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "const player = {\n\ttype: 'player',\n\tx: 0,\n\ty: 0\n};\naddSprite(player.x, player.y, player.type);",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Boilerplate for a new Sprig sprite object',
									range
								},
								{
									label: 'metadata',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "/*\n@title: ${1:Game Title}\n@author: ${2:Your Name}\n@tags: ${3:tag1, tag2}\n@addedOn: ${4:YYYY-MM-DD}\n*/\n$0",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Metadata header for your Sprig game',
									range
								},
								{
									label: 'map',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "const level = map\\`\n........\n........\n........\n........\n........\n........\n........\n........\n\\`;\nsetMap(level);",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Boilerplate for an 8x8 map literal',
									range
								},
								{
									label: 'onInput',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "onInput('${1:w}', () => {\n\t$0\n});",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Event listener for a button press',
									range
								},
								{
									label: 'setLegend',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "setLegend(\n\t[ '${1:player}', bitmap\\`\n........\n........\n........\n........\n........\n........\n........\n........\n\\` ]\n);\n$0",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Define the game legend (characters and their sprites)',
									range
								},
								{
									label: 'addText',
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertText: "addText('${1:Hello World!}', { x: ${2:1}, y: ${3:1}, color: color\\`${4:3}\` });\n$0",
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									documentation: 'Add text to the screen',
									range
								}
							]
						};
					}
				});
				hasInjectedTypes = true;
			}

			const editor = monaco.editor.create(containerRef.current, {
				value: props.initialCode,
				language: 'javascript',
				theme: getEffectiveTheme(theme.value) === 'dark' ? 'sprig-dark' : 'sprig-light',
				minimap: { enabled: false },
				wordWrap: 'on',
				tabSize: 2,
				insertSpaces: false,
				codeLens: true,
				fontFamily: 'monospace',
				automaticLayout: true,
				formatOnPaste: true,
				formatOnType: true,
				bracketPairColorization: { enabled: true },
				autoClosingBrackets: 'always',
				cursorBlinking: "smooth",
				cursorSmoothCaretAnimation: "on",
				smoothScrolling: true,
				stickyScroll: { enabled: true }
			});

			setEditorRef(editor);
			props.onEditorView?.(editor);
			
			setupMonacoSprig(monaco, editor);
			monacoEditorText.value = editor.getValue();

			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
				onRunShortcutRef.current?.();
			});

			let timeoutId: ReturnType<typeof setTimeout>;
			if (!isNewSaveStrat.value) {
				editor.onDidChangeModelContent(() => {
					clearTimeout(timeoutId);
					timeoutId = setTimeout(() => {
						monacoEditorText.value = editor.getValue();
						onCodeChangeRef.current?.();
					}, 300);
				});
			} else {
				setupYjs(editor);
			}

			return () => {
				clearTimeout(timeoutId);
				editor.dispose();
			};
		}
	}, []);

	useEffect(() => {
		if(editorRef && theme.value) {
			monaco.editor.setTheme(getEffectiveTheme(theme.value) === 'dark' ? 'sprig-dark' : 'sprig-light');
		}
	}, [theme.value, editorRef]);

	useEffect(() => {
		if(editorRef) {
			const markers = errorLog.value.filter(e => e.line).map(e => ({
				startLineNumber: e.line!,
				startColumn: e.column || 1,
				endLineNumber: e.line!,
				endColumn: 1000,
				message: e.description,
				severity: monaco.MarkerSeverity.Error
			}));
			monaco.editor.setModelMarkers(editorRef.getModel()!, "sprig", markers);
		}
	}, [errorLog.value, editorRef]);

	return (
		<div class={`${styles.container} ${props.class ?? ""}`} ref={containerRef}></div>
	)
}
