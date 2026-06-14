import { playTune } from './tune'
import { normalizeGameError } from './error'
import { bitmaps, type NormalizedError } from '../state'
import type { PlayTuneRes } from '../../../engine/src/api'
import { baseEngine, textToTune } from '../../../engine/src/base'
import { webEngine } from '../../../engine/src/web'
import * as Babel from "@babel/standalone"
import TransformDetectInfiniteLoop, { BuildDuplicateFunctionDetector, dissallowBackticksInDoubleQuotes } from '../custom-babel-transforms'
import {logInfo} from "../../components/popups-etc/help";

interface RunResult {
	error: NormalizedError | null
	cleanup: () => void
}

function getErrorObject(): Error {
    try {
        throw new Error("");
    } catch (err) {
        return err as Error;
    }
}

function parseErrorStack(err?: Error): [number | null, number | null] {
    const stack = err?.stack;
    const chromePattern = /<anonymous>:(\d+):(\d+)/;
    const firefoxPattern = /Function:(\d+):(\d+)/;

    let match = chromePattern.exec(stack ?? '') || firefoxPattern.exec(stack ?? '');
    if (match && match.length >= 3) {
        const line = parseInt(match[1]!, 10);
        const column = parseInt(match[2]!, 10);
        if (!isNaN(line) && !isNaN(column)) {
            return [line - 2, column];
        }
    }
    return [null, null];
}

export function transformAndThrowErrors(code: string, engineAPIKeys: string[], runCb: (code: any) => any) {
	try {
		const transformedCode = Babel.transform(code, {
			plugins: [TransformDetectInfiniteLoop, BuildDuplicateFunctionDetector(engineAPIKeys), dissallowBackticksInDoubleQuotes],
			retainLines: true
		});
		runCb(transformedCode);
		return null;
	} catch (error: any) {
		return normalizeGameError({ kind: "runtime", error });
	}
}

export function checkMetadata(code: string): NormalizedError[] {
    const warnings: NormalizedError[] = [];
    const blockMatch = code.match(/\/\*([\s\S]*?@title[\s\S]*?)\*\//);
    if (!blockMatch) {
        warnings.push({
            raw: "Missing metadata block",
            description: "Missing metadata block.\n\nYour game should start with a /* ... */ comment block containing @title, @author, etc.",
            severity: "warning",
            line: 1,
            column: 1
        });
        return warnings;
    }

    const blockStartIdx = code.indexOf(blockMatch[0]);
    
    function getLine(strToFind: string): number {
        const idx = code.indexOf(strToFind, blockStartIdx);
        if (idx === -1) return 1;
        return code.substring(0, idx).split("\n").length;
    }

    function getMetadataValue(key: string): { value: string, line: number } | null {
        // Matches e.g. "@title: My Game" until the next "@" or "*/"
        const match = code.match(new RegExp(`@${key}:\\s*([\\s\\S]*?)(?=\\n\\s*@|\\n\\s*\\*\\/|$)`));
        if (!match) return null;
        return { 
            value: match[1]!.trim(), 
            line: getLine(`@${key}:`)
        };
    }

    const title = getMetadataValue("title");
    if (!title || !title.value) {
        warnings.push({ raw: "Missing @title", description: "Missing @title.\n\nPlease add a @title: to your metadata.", severity: "warning", line: title?.line ?? 1, column: 1 });
    } else {
        const t = title.value.toLowerCase();
        if (t === "change me" || t === "getting started" || t === "getting_started" || t === "template" || t === "my game") {
            warnings.push({ raw: "Boilerplate @title", description: "Boilerplate @title.\n\nPlease change the @title from the template value to your game's unique name.", severity: "warning", line: title.line, column: 1 });
        }
    }

    const author = getMetadataValue("author");
    if (!author || !author.value) {
        warnings.push({ raw: "Missing @author", description: "Missing @author.\n\nPlease add an @author: to your metadata.", severity: "warning", line: author?.line ?? 1, column: 1 });
    } else {
        const a = author.value.toLowerCase();
        if (a === "change me" || a.includes("leo, edits") || a === "my name") {
            warnings.push({ raw: "Boilerplate @author", description: "Boilerplate @author.\n\nPlease change the @author from the template value to your name.", severity: "warning", line: author.line, column: 1 });
        }
    }

    const desc = getMetadataValue("description");
    if (!desc || !desc.value) {
        warnings.push({ raw: "Missing @description", description: "Missing @description.\n\nPlease add a @description: to your metadata.", severity: "warning", line: desc?.line ?? 1, column: 1 });
    } else {
        const d = desc.value.toLowerCase();
        if (d.includes("short description about the game")) {
            warnings.push({ raw: "Boilerplate @description", description: "Boilerplate @description.\n\nPlease update the @description to actually describe your game.", severity: "warning", line: desc.line, column: 1 });
        }
    }

    const tags = getMetadataValue("tags");
    if (!tags || !tags.value) {
        warnings.push({ raw: "Missing @tags", description: "Missing @tags.\n\nPlease add at least one tag in @tags: [].", severity: "warning", line: tags?.line ?? 1, column: 1 });
    } else {
        try {
            const parsed = JSON.parse(tags.value.replaceAll("'", '"'));
            if (!Array.isArray(parsed) || parsed.length === 0) {
                warnings.push({ raw: "Invalid @tags", description: "Invalid @tags.\n\nTags must be a non-empty array (e.g. ['maze', 'puzzle']).", severity: "warning", line: tags.line, column: 1 });
            } else if (parsed.some((t: any) => typeof t !== "string")) {
                warnings.push({ raw: "Invalid @tags", description: "Invalid @tags.\n\nTags must be strings.", severity: "warning", line: tags.line, column: 1 });
            } else {
                const hasExampleTags = parsed.some((t: string) => ["tag1", "tag2", "example", "another-example"].includes(t.toLowerCase()));
                if (hasExampleTags) {
                    warnings.push({ raw: "Boilerplate @tags", description: "Boilerplate @tags.\n\nPlease change the @tags from template tags to relevant ones.", severity: "warning", line: tags.line, column: 1 });
                }
            }
        } catch (e) {
            warnings.push({ raw: "Parse error @tags", description: "Parse error in @tags.\n\nPlease ensure tags are formatted like ['tag1', 'tag2'].", severity: "warning", line: tags.line, column: 1 });
        }
    }

    const addedOn = getMetadataValue("addedOn");
    if (!addedOn || !addedOn.value) {
        warnings.push({ raw: "Missing @addedOn", description: "Missing @addedOn.\n\nPlease add an @addedOn: date.", severity: "warning", line: addedOn?.line ?? 1, column: 1 });
    } else {
        const dateStr = addedOn.value;
        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
        if (!validDate) {
            warnings.push({ raw: "Invalid @addedOn format", description: "Invalid @addedOn format.\n\nThe @addedOn date should be in YYYY-MM-DD format.", severity: "warning", line: addedOn.line, column: 1 });
        } else {
            const parsedDate = new Date(`${dateStr}T00:00:00Z`);
            const now = new Date();
            const tooOld = Math.abs(now.getTime() - parsedDate.getTime()) > 183 * 86_400_000;
            if (tooOld || Number.isNaN(parsedDate.getTime())) {
                warnings.push({ raw: "Outdated @addedOn", description: "Outdated @addedOn.\n\nPlease update the @addedOn date to a recent date (within 6 months).", severity: "warning", line: addedOn.line, column: 1 });
            }
        }
    }

    return warnings;
}

export function _performSyntaxCheck(code: string): { error: NormalizedError | null, warnings: NormalizedError[], cleanup: () => void } {
	const game = baseEngine();

	const engineAPIKeys = Object.keys(game.api);
	return { 
		error: transformAndThrowErrors(code, engineAPIKeys, () => {}), 
		warnings: checkMetadata(code),
		cleanup: () => void 0 
	};
}

export function runGame(code: string, canvas: HTMLCanvasElement, onPageError: (error: NormalizedError) => void): RunResult | undefined {
	const game = webEngine(canvas)
	const tunes: PlayTuneRes[] = []
	const timeouts: number[] = []
	const intervals: number[] = []

	const errorListener = (event: ErrorEvent) => {
		onPageError(normalizeGameError({ kind: 'page', error: event.error }))
	}
	window.addEventListener('error', errorListener)

	const cleanup = () => {
		game.cleanup()
		tunes.forEach(tune => tune.end())
		timeouts.forEach(clearTimeout)
		intervals.forEach(clearInterval)
		window.removeEventListener('error', errorListener)
	}

	const api = {
		...game.api,
		setTimeout: (fn: TimerHandler, ms: number) => {
			const timer = setTimeout(fn, ms)
			timeouts.push(timer)
			return timer
		},
		setInterval: (fn: TimerHandler, ms: number) => {
			const timer = setInterval(fn, ms)
			intervals.push(timer)
			return timer
		},
		setLegend: (..._bitmaps: [string, string][]) => {
			// this is bad; but for some reason i could not do _bitmaps === [undefined]
			// @ts-ignore
			if(JSON.stringify(_bitmaps) === "[null]") {
				// @ts-ignore
				bitmaps.value = [[]];
				throw new Error('The sprites passed into setLegend each need to be in square brackets, like setLegend([player, bitmap`...`]).')
			} else {
				bitmaps.value = _bitmaps;
			}
			return game.api.setLegend(...bitmaps.value)
		},
		playTune: (text: string, n: number) => {
			const tune = textToTune(text)
			const playTuneRes = playTune(tune, n)
			tunes.push(playTuneRes)
			return playTuneRes
		},
		console: {
			...console,
			log: (...args: any[]) => {
				console.log(...args)
				const err = getErrorObject();
				const nums = parseErrorStack(err);
				logInfo.value = [...logInfo.value, {
					args: args,
					nums: nums as number[],
					isErr: false
				}]
			},
			error: (...args: any[]) => {
				console.error(...args)
				const err = getErrorObject();
				const nums = parseErrorStack(err);
				logInfo.value = [...logInfo.value, {
					args: args,
					nums: nums as number[],
					isErr: true
				}]
			}
		}
	}

    const engineAPIKeys = Object.keys(api);
	return { error: transformAndThrowErrors(code, engineAPIKeys, (transformedCode) => {
		logInfo.value = [];
		const fn = new Function(...engineAPIKeys, transformedCode.code!)
		fn(...Object.values(api))
	}), cleanup };
}

export function runGameHeadless(code: string): void {
	const game = webEngine(document.createElement('canvas'))

	const api = {
		...game.api,
		setTimeout: () => {},
		setInterval: () => {},
		setLegend: (..._bitmaps: [string, string][]) => {
			// this is bad; but for some reason i could not do _bitmaps === [undefined]
			if(JSON.stringify(_bitmaps) === "[null]") {
				// @ts-ignore
				bitmaps.value = [[]];
				throw new Error('The sprites passed into setLegend each need to be in square brackets, like setLegend([player, bitmap`...`]).');
			} else
				bitmaps.value = _bitmaps
			return game.api.setLegend(..._bitmaps)
		},
		playTune: () => {}
	}

	code = `"use strict";\n${code}`
	try {
		const fn = new Function(...Object.keys(api), code)
		fn(...Object.values(api))
	} catch (error: any) {
		normalizeGameError({ kind: 'runtime', error })
	}

	game.cleanup()
}
