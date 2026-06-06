import { useEffect, useRef, useState } from 'preact/hooks'
import Editor, { useMonaco } from '@monaco-editor/react'
import type * as monaco from 'monaco-editor'
import styles from './monaco.module.css'
import { theme, errorLog, isNewSaveStrat, ConnectionStatus, PersistenceStateKind, monacoEditorText } from '../lib/state'
import type { PersistenceState, RoomState, RoomParticipant } from '../lib/state'
import { type Signal, useSignal, useSignalEffect } from '@preact/signals'
import type { Awareness } from 'y-protocols/awareness'
import type { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
import { startSavingGame } from './big-interactive-pages/editor'
import type { MonacoBinding } from 'y-monaco'
import { setupMonacoSprig } from '../lib/monaco/widgets'

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
	const [editorRef, setEditorRef] = useState<monaco.editor.IStandaloneCodeEditor>();
	const yProviderAwarenessSignal = useSignal<Awareness | undefined>(undefined);
	const bindingRef = useRef<MonacoBinding>();
	const monacoInst = useMonaco();
	
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
		yProviderAwarenessSignal.value.on("change", () => {
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
		});
	});

	async function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monacoSystem: typeof monaco) {
		setEditorRef(editor);
		props.onEditorView?.(editor);
		
		setupMonacoSprig(monacoSystem, editor);

		editor.addCommand(monacoSystem.KeyMod.CtrlCmd | monacoSystem.KeyCode.Enter, () => {
			onRunShortcutRef.current?.();
		});

		if(!isNewSaveStrat.value) {
			editor.onDidChangeModelContent(() => {
				monacoEditorText.value = editor.getValue();
				onCodeChangeRef.current?.();
			});
			return;
		}

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

			yDoc.current.on("update", () => {
				if(!props.persistenceState) return;
				let persistenceState = props.persistenceState.peek();
				if(persistenceState.kind === PersistenceStateKind.PERSISTED && persistenceState.game !== "LOADING"){
					if(persistenceState.game.ownerId === persistenceState.session?.user.id){
						startSavingGame(props.persistenceState, props.roomState);
					}
				}
				monacoEditorText.value = editor.getValue();
				onCodeChangeRef.current?.();
			});
		} catch(e) {
			console.error(e);
		}
	}

	useEffect(() => {
		if(editorRef && monacoInst) {
			const markers = errorLog.value.filter(e => e.line).map(e => ({
				startLineNumber: e.line!,
				startColumn: e.column || 1,
				endLineNumber: e.line!,
				endColumn: 1000,
				message: e.description,
				severity: monacoInst.MarkerSeverity.Error
			}));
			monacoInst.editor.setModelMarkers(editorRef.getModel()!, "sprig", markers);
		}
	}, [errorLog.value, editorRef, monacoInst]);

	return (
		<div class={`${styles.container} ${props.class ?? ""}`}>
			<Editor 
				height="100%" 
				defaultLanguage="javascript" 
				defaultValue={props.initialCode} 
				theme={theme.value === 'dark' ? 'vs-dark' : 'vs'}
				onMount={handleEditorDidMount}
				options={{
					minimap: { enabled: false },
					wordWrap: 'on',
					tabSize: 2,
					insertSpaces: false,
					codeLens: true,
					fontFamily: 'monospace'
				}}
			/>
		</div>
	)
}
