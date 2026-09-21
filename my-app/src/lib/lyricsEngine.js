/**
 * Find the active line for a precise playback timestamp.
 * The timestamp is expected to already include any user lyric offset adjustment.
 * @param {{time:number}[]} lines
 * @param {number} time
 * @returns {number}
 */
export function findActiveLyricIndex(lines, time) {
	let low = 0;
	let high = lines.length - 1;
	let result = -1;
	while (low <= high) {
		const middle = (low + high) >> 1;
		if ((lines[middle]?.time ?? Infinity) <= time) {
			result = middle;
			low = middle + 1;
		} else high = middle - 1;
	}
	return result;
}

/**
 * End of the current line's timestamp window. LRCLIB provides line start times,
 * so the next line timestamp is the exact boundary available to the client.
 * @param {{time:number}[]} lines
 * @param {number} index
 * @returns {number}
 */
export function getLyricLineEnd(lines, index) {
	const start = lines[index]?.time ?? 0;
	const next = lines[index + 1]?.time;
	if (Number.isFinite(next) && Number(next) > start) return Number(next);
	return start + 3200;
}

/**
 * Progress through the timestamp window for the active line.
 * This is line timing progress, not claimed word-level timing.
 * @param {{time:number}[]} lines
 * @param {number} index
 * @param {number} time
 */
export function getLyricLineProgress(lines, index, time) {
	if (index < 0 || !lines[index]) return 0;
	const start = lines[index].time;
	const end = getLyricLineEnd(lines, index);
	return Math.max(0, Math.min(1, (time - start) / Math.max(1, end - start)));
}
