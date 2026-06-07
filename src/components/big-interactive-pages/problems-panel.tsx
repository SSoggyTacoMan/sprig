import { useState } from "preact/hooks";
import styles from "./problems-panel.module.css";
import {
	errorLog,
	showProblemsPanel,
	problemsPanelHeight,
	problemsFilterQuery,
	monacoEditor,
	type NormalizedError,
	PersistenceStateKind,
} from "../../lib/state";
import {
	VscError,
	VscWarning,
	VscInfo,
	VscFilter,
	VscClose,
	VscTrash,
	VscChevronDown,
	VscChevronRight,
} from "react-icons/vsc";

interface ParsedProblem {
	severity: "error" | "warning";
	message: string;
	source: string;
	line: number;
	col: number;
	codeFrame: string;
}

function parseError(err: NormalizedError): ParsedProblem {
	const raw = err.description || String(err.raw ?? "Unknown error");
	const lines = raw.split("\n");
	const firstLine = (lines[0] ?? "").trim();

	// Babel: "SyntaxError: unknown: Missing semicolon. (5:4)"
	const locMatch = firstLine.match(/\((\d+):(\d+)\)\s*$/);
	const line = locMatch ? parseInt(locMatch[1]!, 10) : (err.line ?? 1);
	const col  = locMatch ? parseInt(locMatch[2]!, 10) : (err.column ?? 1);
	const message = firstLine.replace(/\s*\(\d+:\d+\)\s*$/, "").trim();

	// Everything after the first blank line is the code frame
	const blankIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "");
	const codeFrame = blankIdx !== -1 ? lines.slice(blankIdx + 1).join("\n").trim() : "";

	return { severity: "error", message, source: "compiler", line, col, codeFrame };
}

// ─── Problem row ───────────────────────────────────────────────────────────────

function ProblemRow({
	p,
	idx,
	onJump,
}: {
	p: ParsedProblem;
	idx: number;
	onJump: (p: ParsedProblem) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const hasFrame = !!p.codeFrame;

	return (
		<div className={styles.problemItem}>
			<div
				className={`${styles.problemRow} ${idx % 2 === 0 ? styles.rowEven : styles.rowOdd}`}
				onClick={() => {
					onJump(p);
					if (hasFrame) setExpanded((v) => !v);
				}}
			>
				{/* chevron (only shown when code frame exists) */}
				<span className={`${styles.chevron} ${hasFrame ? styles.chevronVisible : ""}`}>
					{expanded ? <VscChevronDown /> : <VscChevronRight />}
				</span>

				{/* severity icon */}
				<span className={p.severity === "error" ? styles.iconError : styles.iconWarn}>
					{p.severity === "error" ? <VscError /> : <VscWarning />}
				</span>

				{/* message */}
				<span className={styles.message}>{p.message}</span>

				{/* meta: source + line:col */}
				<span className={styles.meta}>
					<span className={styles.source}>{p.source}</span>
					<span className={styles.loc}>[{p.line}, {p.col}]</span>
				</span>
			</div>

			{/* expandable code frame */}
			{expanded && hasFrame && (
				<pre className={styles.codeFrame}>{p.codeFrame}</pre>
			)}
		</div>
	);
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export default function ProblemsPanel({ persistenceState }: { persistenceState: any }) {
	// Build parsed problems
	const allProblems: ParsedProblem[] = errorLog.value.map(parseError);

	// Filter
	const q = problemsFilterQuery.value.toLowerCase().trim();
	const filtered = q
		? allProblems.filter(
				(p) =>
					p.message.toLowerCase().includes(q) ||
					p.source.toLowerCase().includes(q)
		  )
		: allProblems;

	const totalErrors = filtered.filter((p) => p.severity === "error").length;
	const totalWarns  = filtered.filter((p) => p.severity === "warning").length;
	const total = filtered.length;

	const jumpTo = (p: ParsedProblem) => {
		const ed = monacoEditor.value;
		if (!ed) return;
		ed.focus();
		ed.setPosition({ lineNumber: p.line, column: p.col });
		ed.revealLineInCenter(p.line);
	};

	return (
		<div
			className={styles.panel}
			style={{ height: `${problemsPanelHeight.value}px` }}
		>
			{/* ── Header ─────────────────────────────────────────────────────────── */}
			<div className={styles.header}>
				<div className={styles.titleArea}>
					<span className={styles.title}>Problems</span>
					{total > 0 && (
						<span className={total > 0 ? styles.badgeError : styles.badge}>
							{total}
						</span>
					)}
				</div>

				<div className={styles.controls}>
					<div className={styles.filterWrap}>
						<VscFilter className={styles.filterIcon} />
						<input
							type="text"
							className={styles.filterInput}
							placeholder="Filter…"
							value={problemsFilterQuery.value}
							onInput={(e) =>
								(problemsFilterQuery.value = (e.target as HTMLInputElement).value)
							}
						/>
					</div>

					<button
						className={styles.btn}
						title="Clear"
						onClick={() => (errorLog.value = [])}
					>
						<VscTrash />
					</button>

					<button
						className={styles.btn}
						title="Close"
						onClick={() => (showProblemsPanel.value = false)}
					>
						<VscClose />
					</button>
				</div>
			</div>

			{/* ── Content ────────────────────────────────────────────────────────── */}
			<div className={styles.body}>
				{total === 0 ? (
					<div className={styles.empty}>
						<VscInfo className={styles.emptyIcon} />
						No problems detected.
					</div>
				) : (
					<>
						{/* summary strip */}
						<div className={styles.summary}>
							{totalErrors > 0 && (
								<span className={styles.summaryError}>
									<VscError /> {totalErrors} error{totalErrors !== 1 ? "s" : ""}
								</span>
							)}
							{totalWarns > 0 && (
								<span className={styles.summaryWarn}>
									<VscWarning /> {totalWarns} warning{totalWarns !== 1 ? "s" : ""}
								</span>
							)}
						</div>

						{/* problem list — no file header since it's always one file */}
						<div className={styles.list}>
							{filtered.map((p, i) => (
								<ProblemRow key={`${i}-${p.line}-${p.col}`} p={p} idx={i} onJump={jumpTo} />
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
