import { useState, useEffect } from "preact/hooks";
import { useSignal, useComputed } from "@preact/signals";
import styles from "./problems-panel.module.css";
import {
	errorLog,
	showProblemsPanel,
	activePanelTab,
	problemsPanelHeight,
	problemsFilterQuery,
	monacoEditor,
	type NormalizedError,
	PersistenceStateKind,
	theme
} from "../../lib/state";
import {
	VscChevronDown,
	VscChevronRight,
	VscError,
	VscWarning,
	VscFilter,
	VscClose,
	VscTrash,
	VscCollapseAll,
	VscFiles
} from "react-icons/vsc";

interface Problem {
	severity: "error" | "warning";
	description: string;
	source: string;
	line: number;
	column: number;
	file: string;
	path: string;
}

const mockProblems: Problem[] = [
	{
		severity: "error",
		description: "Buttons must have discernible text: Element has no title attribute",
		source: "axe/name-role-value",
		line: 789,
		column: 9,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 665,
		column: 8,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 666,
		column: 9,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 692,
		column: 10,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 708,
		column: 16,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 826,
		column: 6,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 831,
		column: 7,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 836,
		column: 8,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	},
	{
		severity: "warning",
		description: "CSS inline styles should not be used, move styles to an external CSS file",
		source: "no-inline-styles",
		line: 840,
		column: 9,
		file: "editor.tsx",
		path: "src/components/big-interactive-pages"
	}
];

export default function ProblemsPanel({ persistenceState }: { persistenceState: any }) {
	const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

	// Determine active game file name
	const getGameFileName = () => {
		const state = persistenceState?.value;
		if (state?.kind === PersistenceStateKind.PERSISTED && state.game !== "LOADING") {
			return `${state.game.name}.js`;
		}
		if (state?.kind === PersistenceStateKind.SHARED) {
			return `${state.name}.js`;
		}
		if (state?.kind === PersistenceStateKind.COLLAB && state.game !== "LOADING") {
			if (typeof state.game === "object") return `${state.game.name}.js`;
		}
		return "main.js";
	};

	const gameFileName = getGameFileName();

	// Map compile/runtime error log items
	const realProblems = errorLog.value.map((err: NormalizedError): Problem => ({
		severity: "error",
		description: err.description || String(err.raw || "Unknown compilation error"),
		source: "compiler",
		line: err.line || 1,
		column: err.column || 1,
		file: gameFileName,
		path: "src"
	}));

	const allProblems = [...realProblems, ...mockProblems];

	// Group by file
	const grouped: Record<string, { file: string; path: string; problems: Problem[] }> = {};
	allProblems.forEach((p) => {
		const key = `${p.path}/${p.file}`;
		if (!grouped[key]) {
			grouped[key] = { file: p.file, path: p.path, problems: [] };
		}
		grouped[key].problems.push(p);
	});

	// Filter
	const filterQuery = problemsFilterQuery.value.toLowerCase().trim();
	const filteredGrouped = Object.values(grouped).map((group) => {
		const filtered = group.problems.filter((p) =>
			p.description.toLowerCase().includes(filterQuery) ||
			p.file.toLowerCase().includes(filterQuery) ||
			p.source.toLowerCase().includes(filterQuery)
		);
		return { ...group, problems: filtered };
	}).filter((group) => group.problems.length > 0);

	const totalProblems = filteredGrouped.reduce((sum, g) => sum + g.problems.length, 0);

	const handleProblemClick = (problem: Problem) => {
		// Jump to line if clicking the user's game file
		if (problem.file === gameFileName && monacoEditor.value) {
			const editor = monacoEditor.value;
			editor.focus();
			editor.setPosition({ lineNumber: problem.line, column: problem.column });
			editor.revealLineInCenter(problem.line);
		}
	};

	const handleCollapseAll = () => {
		const newCollapsed: Record<string, boolean> = {};
		filteredGrouped.forEach((g) => {
			newCollapsed[`${g.path}/${g.file}`] = true;
		});
		setCollapsedFiles(newCollapsed);
	};

	const toggleFileCollapsed = (key: string) => {
		setCollapsedFiles((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};

	// CSS custom theme setup
	const themeClass = theme.value === "light" ? "theme-light" : theme.value === "busker" ? "theme-busker" : "";

	return (
		<div
			className={`${styles.panel} ${themeClass}`}
			style={{ height: `${problemsPanelHeight.value}px` }}
		>
			{/* Panel Header */}
			<div className={styles.panelHeader}>
				<div className={styles.tabs}>
					<div
						className={`${styles.tab} ${activePanelTab.value === "problems" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "problems")}
					>
						Problems
						{totalProblems > 0 && <span className={styles.badge}>{totalProblems}</span>}
					</div>
					<div
						className={`${styles.tab} ${activePanelTab.value === "output" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "output")}
					>
						Output
					</div>
					<div
						className={`${styles.tab} ${activePanelTab.value === "debug" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "debug")}
					>
						Debug Console
					</div>
					<div
						className={`${styles.tab} ${activePanelTab.value === "terminal" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "terminal")}
					>
						Terminal
					</div>
					<div
						className={`${styles.tab} ${activePanelTab.value === "ports" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "ports")}
					>
						Ports
					</div>
					<div
						className={`${styles.tab} ${activePanelTab.value === "gitlens" ? styles.activeTab : ""}`}
						onClick={() => (activePanelTab.value = "gitlens")}
					>
						GitLens
					</div>
				</div>

				<div className={styles.controls}>
					{activePanelTab.value === "problems" && (
						<div className={styles.filterWrapper}>
							<input
								type="text"
								className={styles.filterInput}
								placeholder="Filter (e.g. text, **/*.ts, !**/node_modules)"
								value={problemsFilterQuery.value}
								onInput={(e) => (problemsFilterQuery.value = (e.target as HTMLInputElement).value)}
							/>
							<span className={styles.filterIcon}>
								<VscFilter />
							</span>
						</div>
					)}

					{activePanelTab.value === "problems" && (
						<button
							className={styles.iconButton}
							title="Collapse All"
							onClick={handleCollapseAll}
						>
							<VscCollapseAll />
						</button>
					)}

					<button
						className={styles.iconButton}
						title="Clear Panel"
						onClick={() => {
							if (activePanelTab.value === "problems") {
								errorLog.value = [];
							}
						}}
					>
						<VscTrash />
					</button>

					<button
						className={styles.iconButton}
						title="Close Panel"
						onClick={() => (showProblemsPanel.value = false)}
					>
						<VscClose />
					</button>
				</div>
			</div>

			{/* Panel Content */}
			<div className={styles.panelContent}>
				{activePanelTab.value === "problems" && (
					<>
						{totalProblems === 0 ? (
							<div className={styles.emptyState}>
								No problems have been detected in the workspace.
							</div>
						) : (
							<div>
								{filteredGrouped.map((g) => {
									const key = `${g.path}/${g.file}`;
									const isCollapsed = collapsedFiles[key];
									return (
										<div key={key} className={styles.fileGroup}>
											<div className={styles.fileRow} onClick={() => toggleFileCollapsed(key)}>
												<span className={styles.chevron}>
													{isCollapsed ? <VscChevronRight /> : <VscChevronDown />}
												</span>
												<span className={styles.fileIcon}>
													<VscFiles />
												</span>
												<span className={styles.fileName}>{g.file}</span>
												<span className={styles.filePath}>{g.path}</span>
												<span className={styles.fileBadge}>{g.problems.length}</span>
											</div>

											{!isCollapsed &&
												g.problems.map((p, index) => (
													<div
														key={`${index}-${p.line}-${p.column}`}
														className={styles.problemRow}
														onClick={() => handleProblemClick(p)}
													>
														<span
															className={styles.problemIcon}
															data-severity={p.severity}
														>
															{p.severity === "error" ? <VscError /> : <VscWarning />}
														</span>
														<span className={styles.problemText}>
															{p.description}
															<span className={styles.problemSource}>({p.source})</span>
														</span>
														<span className={styles.problemLocation}>
															[Ln {p.line}, Col {p.column}]
														</span>
													</div>
												))}
										</div>
									);
								})}
							</div>
						)}
					</>
				)}

				{activePanelTab.value === "output" && (
					<div className={styles.otherTabContent}>
						<div className={styles.logLine}>[generate-metadata] 1119 games, 1119 cache hits, 0 thumbnails regenerated, metadata unchanged, cache unchanged</div>
						<div className={styles.logLine}>[vite] connected.</div>
					</div>
				)}

				{activePanelTab.value === "debug" && (
					<div className={styles.otherTabContent}>
						<div className={styles.logLine}>[Debug Console] Debugger attached.</div>
						<div className={styles.logLine} style={{ color: "#858585" }}>&gt; _</div>
					</div>
				)}

				{activePanelTab.value === "terminal" && (
					<div className={styles.otherTabContent}>
						<div className={styles.logLine} style={{ color: "#388a34" }}>
							(base) maaren@MacBook-Air-van-Maaren-1220 sprig % <span style={{ color: "#cccccc" }}>bun run dev</span>
						</div>
						<div className={styles.logLine}>[vite] connected.</div>
					</div>
				)}

				{activePanelTab.value === "ports" && (
					<div className={styles.otherTabContent} style={{ gap: "4px" }}>
						<div className={styles.logLine}><strong>Forwarded Ports:</strong></div>
						<div className={styles.logLine}>• Port 4321 → http://localhost:4321 (Astro Web Server)</div>
						<div className={styles.logLine}>• Port 4322 → http://localhost:4322 (Vite HMR Port)</div>
					</div>
				)}

				{activePanelTab.value === "gitlens" && (
					<div className={styles.otherTabContent}>
						<div className={styles.logLine} style={{ color: "#858585" }}>On branch test</div>
						<div className={styles.logLine} style={{ color: "#858585" }}>Your branch is up to date with &apos;origin/test&apos;.</div>
						<div className={styles.logLine}></div>
						<div className={styles.logLine} style={{ color: "#858585" }}>Changes not staged for commit:</div>
						<div className={styles.logLine} style={{ color: "#858585", paddingLeft: "12px" }}>
							(use &quot;git add &lt;file&gt;...&quot; to update what will be committed)
						</div>
						<div className={styles.logLine} style={{ color: "#a52a2a", paddingLeft: "24px" }}>
							modified:   src/components/big-interactive-pages/editor.tsx
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
