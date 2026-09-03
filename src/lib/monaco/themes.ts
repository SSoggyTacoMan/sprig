import type * as monaco from 'monaco-editor'

export function defineThemes(monacoInst: typeof monaco) {
	monacoInst.editor.defineTheme('sprig-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'keyword', foreground: '#569CD6' },
			{ token: 'keyword.control', foreground: '#C586C0' },
			{ token: 'operator', foreground: '#D4D4D4' },
			{ token: 'identifier', foreground: '#9CDCFE' },
			{ token: 'type.identifier', foreground: '#4EC9B0' },
			{ token: 'type', foreground: '#4EC9B0' },
			{ token: 'class', foreground: '#4EC9B0' },
			{ token: 'string', foreground: '#CE9178' },
			{ token: 'number', foreground: '#B5CEA8' },
			{ token: 'comment', foreground: '#6A9955', fontStyle: 'italic' },
			{ token: 'function', foreground: '#DCDCAA' },
			{ token: 'variable', foreground: '#9CDCFE' },
			{ token: 'variable.parameter', foreground: '#9CDCFE' },
			{ token: 'property', foreground: '#9CDCFE' },
			{ token: 'constant', foreground: '#4FC1FF' },
			{ token: 'regexp', foreground: '#D16969' }
		],
		colors: {
			'editor.background': '#1e1e1e',
			'editor.foreground': '#D4D4D4',
			'editor.lineHighlightBackground': '#2A2D2E',
			'editorCursor.foreground': '#AEAFAD',
			'editorWhitespace.foreground': '#3B3A32',
			'editorIndentGuide.background': '#404040',
			'editorIndentGuide.activeBackground': '#707070',
			'editorSuggestWidget.background': '#252526',
			'editorSuggestWidget.border': '#454545',
			'editorSuggestWidget.foreground': '#D4D4D4',
			'editorSuggestWidget.selectedBackground': '#062F4A',
			'editorSuggestWidget.highlightForeground': '#18A3FF',
		}
	})

	monacoInst.editor.defineTheme('sprig-light', {
		base: 'vs',
		inherit: true,
		rules: [
			{ token: 'keyword', foreground: '#0000FF' },
			{ token: 'operator', foreground: '#000000' },
			{ token: 'identifier', foreground: '#001080' },
			{ token: 'type.identifier', foreground: '#267F99' },
			{ token: 'type', foreground: '#267F99' },
			{ token: 'class', foreground: '#267F99' },
			{ token: 'string', foreground: '#A31515' },
			{ token: 'number', foreground: '#098658' },
			{ token: 'comment', foreground: '#008000', fontStyle: 'italic' },
			{ token: 'function', foreground: '#795E26' },
			{ token: 'variable', foreground: '#001080' },
			{ token: 'property', foreground: '#001080' },
			{ token: 'constant', foreground: '#0070C1' },
			{ token: 'regexp', foreground: '#811F3F' }
		],
		colors: {
			'editor.background': '#ffffff',
			'editor.foreground': '#000000',
			'editor.lineHighlightBackground': '#F3F3F3',
			'editorSuggestWidget.background': '#F3F3F3',
			'editorSuggestWidget.border': '#C8C8C8',
			'editorSuggestWidget.foreground': '#000000',
			'editorSuggestWidget.selectedBackground': '#D6EBFF',
			'editorSuggestWidget.highlightForeground': '#0066CC',
		}
	})
}
