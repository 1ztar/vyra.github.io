<script>
	import { findActiveLyricIndex, getLyricLineProgress } from '$lib/lyricsEngine';
	/** @type {Record<string, any>} */
	let { ctx = {}, variant = 'fullscreen' } = $props();

	let syncedLyrics = $derived(ctx.syncedLyrics ?? []);
	let lyricOffset = $derived(ctx.lyricOffset ?? 0);
	let seekToLyric = $derived(ctx.seekToLyric);
	let getPrecisePlaybackPosition = $derived(ctx.getPrecisePlaybackPosition);
	let isPlaying = $derived(ctx.isPlaying ?? false);

	/** @type {HTMLDivElement | null} */
	let container = $state(null);
	/** @type {number | null} */
	let frame = null;
	let activeIndex = -1;
	let lastTime = 0;
	let manualUntil = 0;


	/** @param {number} index @param {number} progress */
	function applyLineState(index, progress) {
		if (!container) return;
		const buttons = /** @type {NodeListOf<HTMLElement>} */ (container.querySelectorAll('[data-precision-line]'));
		if (index !== activeIndex) {
			activeIndex = index;
			buttons.forEach((button, i) => {
				button.classList.toggle('active', i === index);
				button.classList.toggle('past', i < index);
				button.classList.toggle('next', i === index + 1);
				button.setAttribute('aria-current', i === index ? 'true' : 'false');
				if (i !== index) button.style.setProperty('--line-progress', i < index ? '1' : '0');
				if (i !== index) button.style.setProperty('--line-progress-pct', i < index ? '100%' : '0%');
			});
		}
		const active = /** @type {HTMLElement | null} */ (container.querySelector(`[data-precision-line="${index}"]`));
		if (active) {
			active.style.setProperty('--line-progress', String(progress));
			active.style.setProperty('--line-progress-pct', `${progress * 100}%`);
		}
		const next = /** @type {HTMLElement | null} */ (container.querySelector(`[data-precision-line="${index + 1}"]`));
		if (next) {
			const anticipation = Math.max(0, Math.min(1, (progress - 0.72) / 0.28));
			next.style.setProperty('--anticipation', String(anticipation));
			next.style.setProperty('--anticipation-alpha', String(0.28 + anticipation * 0.28));
			next.style.setProperty('--anticipation-x', `${anticipation * 4}px`);
		}
	}

	/** @param {number} index @param {number} progress @param {number} dt */
	function moveCamera(index, progress, dt) {
		if (!container || index < 0 || performance.now() < manualUntil) return;
		const current = /** @type {HTMLElement | null} */ (container.querySelector(`[data-precision-line="${index}"]`));
		const next = /** @type {HTMLElement | null} */ (container.querySelector(`[data-precision-line="${index + 1}"]`));
		if (!current) return;

		const anchor = variant === 'drawer' ? 0.39 : variant === 'focus' ? 0.36 : 0.43;
		const currentCenter = current.offsetTop + current.offsetHeight * 0.5;
		const nextCenter = next ? next.offsetTop + next.offsetHeight * 0.5 : currentCenter;
		const travel = Math.max(0, Math.min(1, (progress - 0.58) / 0.42));
		const easedTravel = travel * travel * (3 - 2 * travel);
		const targetCenter = currentCenter + (nextCenter - currentCenter) * easedTravel;
		const max = Math.max(0, container.scrollHeight - container.clientHeight);
		const desired = Math.max(0, Math.min(max, targetCenter - container.clientHeight * anchor));
		const smoothing = 1 - Math.exp(-Math.max(1, dt) / (variant === 'focus' ? 210 : 170));
		container.scrollTop += (desired - container.scrollTop) * smoothing;
	}

	function noteManualScroll() {
		manualUntil = performance.now() + 2200;
	}

	function stop() {
		if (frame !== null) cancelAnimationFrame(frame);
		frame = null;
	}

	function start() {
		stop();
		lastTime = performance.now();
		/** @param {number} now */
		const tick = (now) => {
			if (!container || !syncedLyrics.length) {
				frame = null;
				return;
			}
			const position = Number(getPrecisePlaybackPosition?.() ?? 0) - Number(lyricOffset || 0);
			const index = findActiveLyricIndex(syncedLyrics, position);
			if (index >= 0) {
				const progress = getLyricLineProgress(syncedLyrics, index, position);
				applyLineState(index, progress);
				moveCamera(index, progress, now - lastTime);
			}
			lastTime = now;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
	}

	$effect(() => {
		if (!container || !syncedLyrics.length) return;
		void syncedLyrics;
		void lyricOffset;
		void isPlaying;
		start();
		return stop;
	});
</script>

<div
	role="region"
	aria-label="Synced lyrics"
	class="precision-lyrics precision-{variant}"
	bind:this={container}
	onwheel={noteManualScroll}
	onpointerdown={noteManualScroll}
>
	{#each syncedLyrics as line, index}
		<button
			type="button"
			data-precision-line={index}
			class:blank={!line.text}
			onclick={() => seekToLyric?.(line.time)}
			aria-label={line.text ? `Seek to ${line.text}` : 'Seek to instrumental break'}
			aria-current="false"
		>
			{#if line.text}
				<span class="precision-line-text">
					<span class="precision-line-base">{line.text}</span>
					<span class="precision-line-fill" aria-hidden="true">{line.text}</span>
				</span>
			{:else}
				<span class="precision-break" aria-hidden="true"><i></i><i></i><i></i></span>
			{/if}
		</button>
	{/each}
</div>
