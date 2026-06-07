import { type Signal, signal } from '@preact/signals'
import { IoColorPalette, IoImage, IoMap, IoMusicalNotes } from 'react-icons/io5'
export interface FromTo {
	from: number
	to: number
}

import BitmapEditor from '../components/subeditors/bitmap-editor'
import ColorPickerEditor from '../components/subeditors/color-picker'
import MapEditor from '../components/subeditors/map-editor'
import SequencerEditor from '../components/subeditors/sequencer'
import type { Game, SessionInfo, RoomParticipant } from './game-saving/account-types'
export type { RoomParticipant } from './game-saving/account-types'

// Error handling
export interface NormalizedError {
	raw: unknown
	description: string
	line?: number | null
	column?: number | null
}

// Editor types
export interface EditorProps {
	text: Signal<string>
}
export const editors = {
	bitmap: {
		label: 'bitmap',
		icon: IoImage,
		modalContent: BitmapEditor,
		fullsizeModal: true,
		needsBitmaps: false
	},
	sequencer: {
		label: 'tune',
		icon: IoMusicalNotes,
		modalContent: SequencerEditor,
		fullsizeModal: true,
		needsBitmaps: false
	},
	map: {
		label: 'map',
		icon: IoMap,
		modalContent: MapEditor,
		fullsizeModal: true,
		needsBitmaps: true
	},
	palette: {
		label: 'color',
		icon: IoColorPalette,
		modalContent: ColorPickerEditor,
		fullsizeModal: false,
		needsBitmaps: false
	}
}
export type EditorKind = keyof typeof editors
export const editorKinds = Object.keys(editors) as EditorKind[]

export interface OpenEditor {
	kind: EditorKind
	editRange: FromTo
	text: string
}

export enum PersistenceStateKind {
	IN_MEMORY = 'IN_MEMORY',
	PERSISTED = 'PERSISTED',
	SHARED = 'SHARED',
	COLLAB = 'COLLAB'
}

// Persistence
export type PersistenceState = ({
	kind: PersistenceStateKind.IN_MEMORY
	showInitialWarning: boolean
} | {
	kind: PersistenceStateKind.PERSISTED
	cloudSaveState: 'SAVED' | 'SAVING' | 'ERROR'
	game: 'LOADING' | Game,
	tutorial?: string[] | undefined,
	tutorialIndex?: number | undefined
} | {
	kind: PersistenceStateKind.SHARED
	name: string
	authorName: string
	code: string,
	tutorial?: string[] | undefined
	tutorialName?: string | undefined
	tutorialIndex?: number | undefined
} | {
	kind: PersistenceStateKind.COLLAB
	game: string | 'LOADING' | Game // String means the game is restricted and only the roomId needs to be shown to the user
	password: string | undefined
	cloudSaveState: 'SAVED' | 'SAVING' | 'ERROR'
}) & {
	session: SessionInfo | null
	stale: boolean
}

export enum ConnectionStatus {
	CONNECTED,
	CONNECTING,
	DISCONNECTED
}

export type RoomState = {
	connectionStatus: ConnectionStatus
	roomId: string
	participants: RoomParticipant[]
}

export type GithubState = {
	username: string,
	session: string
}

export const monacoEditor = signal<any | null>(null)
export const monacoEditorText = signal<string>('');
export const muted = signal<boolean>(false)
export const errorLog = signal<NormalizedError[]>([])
export const showProblemsPanel = signal<boolean>(false)
export const activePanelTab = signal<string>('problems')
export const problemsPanelHeight = signal<number>(250)
export const problemsFilterQuery = signal<string>('')
export const openEditor = signal<OpenEditor | null>(null)
export const bitmaps = signal<[string, string][]>([])
export const editSessionLength = signal<Date>(new Date());
export const showKeyBinding = signal(false);
export const showSaveConflictModal = signal<boolean>(false);
export const continueSaving = signal<boolean>(true);
export const _foldRanges = signal<FromTo[]>([]);
export const _widgets = signal<any[]>([]);
export const LAST_SAVED_SESSION_ID = 'lastSavedSessionId';

export type ThemeType = "dark" | "light" | "busker" | "system";
export const theme = signal<ThemeType>("system");
type Theme = {
	navbarIcon: string,
	accent: string,
	accentDark: string,
	accentLight: string,
	fgMutedOnAccent: string,
	background: string,
	color: string
	copyContainerText: string
};

const baseTheme: Theme = {
	navbarIcon: "/SPRIGDINO.png",
	accent: "#078969",
	accentDark: "#136853",
	accentLight: '#80c3a0',
	fgMutedOnAccent: "#8fcabb",
	background: "#2f2f2f",
	color: "black",
	copyContainerText: "white",
};

export const themes: Partial<Record<ThemeType, Theme>> = {
	"dark": {
		...baseTheme,
		background: "#2f2f2f",
	},
	"light": {
		...baseTheme,
		background: "#fafed7",
		copyContainerText: "black"
	},
	"busker": {
		...baseTheme,
		navbarIcon: "/PENNY_HEAD.png",
		accent: "#FFAE06",
	 	accentDark: "#ff9d00",
		accentLight: "#06b0ffb0",
		fgMutedOnAccent: "#6d83ff",
		background: "#3E29ED",
	},
	"system": {
		...baseTheme,
		background: "linear-gradient(135deg, #2f2f2f 50%, #fafed7 50%)",
		accent: "#8fcabb"
	}
};

export const getEffectiveTheme = (themeType: ThemeType): "dark" | "light" | "busker" => {
	if (themeType === "system") {
		if (typeof window !== "undefined" && window.matchMedia) {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
		}
		return "dark";
	}
	return themeType as "dark" | "light" | "busker";
};

if (typeof window !== "undefined" && window.matchMedia) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (theme.peek() === "system") {
			switchTheme("system");
		}
	});
}

export const switchTheme = (themeType: ThemeType) => {
	theme.value = themeType;

	// store the new theme value in local storage
	localStorage.setItem("theme", themeType);

	const effective = getEffectiveTheme(themeType);
	const themeValue = themes[effective];
	// set the document values
	const documentStyle = document.body.style;
	document.body.classList.remove('theme-dark', 'theme-light', 'theme-busker', 'theme-system');
	document.body.classList.add(`theme-${effective}`);

	documentStyle.background = themeValue?.background?? '';
	document.documentElement.style.setProperty(`--accent`, themeValue?.accent?? '');
	document.documentElement.style.setProperty(`--accent-dark`, themeValue?.accentDark?? '');
	document.documentElement.style.setProperty(`--accent-light`, themeValue?.accentLight?? '');
	document.documentElement.style.setProperty(`--fg-muted-on-accent`, themeValue?.fgMutedOnAccent?? '');
	documentStyle.color = themeValue?.color ?? '';

	// change the color of the text in elements having .copy-container style
	// These includes pages such as 'Gallery' and 'Your Games'
	const copyContainer = document.querySelector(".copy-container") as HTMLDivElement;
	if (copyContainer) {
		copyContainer.style.color = themeValue?.copyContainerText ?? '';
	}
}
export const isNewSaveStrat = signal<boolean>(false)
export const screenRef = signal<HTMLCanvasElement | null>(null);
export const cleanupRef = signal<(() => void) | undefined>(undefined);

export interface ReviewState {
	isReviewMode: boolean;
	reviewCode: string | null;
}

export const reviewState = signal<ReviewState>({
	isReviewMode: false,
	reviewCode: null
});
