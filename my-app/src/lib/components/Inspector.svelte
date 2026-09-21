<script>
	import { Info, ListEnd, Mic2, PanelRightClose } from 'lucide-svelte';
	import SyncedLyrics from './SyncedLyrics.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let open = $derived(ctx.inspectorOpen);
	let tab = $derived(ctx.inspectorTab ?? 'lyrics');
	let setUiState = $derived(ctx.setUiState);
	let currentTrack = $derived(ctx.currentTrack);
	let queue = $derived(ctx.queue ?? []);
	let syncedLyrics = $derived(ctx.syncedLyrics ?? []);
	let plainLyrics = $derived(ctx.plainLyrics ?? []);
	let lyricsLoading = $derived(ctx.lyricsLoading);
	let loadLyrics = $derived(ctx.loadLyrics);
	let formatTime = $derived(ctx.formatTime);
	let inspectorWidth = $derived(ctx.inspectorWidth ?? 360);
	let setInspectorWidth = $derived(ctx.setInspectorWidth);
	let resizing = $state(false);

	/** @param {PointerEvent} event */
	function beginResize(event) {
		if (event.pointerType === 'touch') return;
		resizing = true;
		/** @type {HTMLElement | null} */ (event.currentTarget)?.setPointerCapture?.(event.pointerId);
	}
	/** @param {PointerEvent} event */
	function resize(event) {
		if (!resizing) return;
		setInspectorWidth?.(window.innerWidth - event.clientX);
	}
	function endResize() { resizing = false; }

	/** @param {string} next */
	function openTab(next) {
		setUiState('inspectorTab', next);
		if (next === 'lyrics') loadLyrics?.();
	}
</script>

{#if open}
	<aside class="unified-inspector" aria-label="Now playing inspector">
		<button type="button" class="inspector-resize" class:active={resizing} aria-label="Resize inspector" title="Resize inspector" onpointerdown={beginResize} onpointermove={resize} onpointerup={endResize} onpointercancel={endResize} onkeydown={(event) => { if (event.key === 'ArrowLeft') setInspectorWidth?.(inspectorWidth + 8); if (event.key === 'ArrowRight') setInspectorWidth?.(inspectorWidth - 8); }}></button>
		<header class="inspector-header">
			<div class="inspector-tabs" role="tablist">
				<button class:active={tab === 'lyrics'} onclick={() => openTab('lyrics')}><Mic2 size={15}/>Lyrics</button>
				<button class:active={tab === 'queue'} onclick={() => openTab('queue')}><ListEnd size={15}/>Queue</button>
				<button class:active={tab === 'info'} onclick={() => openTab('info')}><Info size={15}/>Info</button>
			</div>
			<button class="inspector-close" onclick={() => setUiState('inspectorOpen', false)} aria-label="Close inspector"><PanelRightClose size={17}/></button>
		</header>

		<div class="inspector-body">
			{#if tab === 'lyrics'}
				{#if syncedLyrics.length}<SyncedLyrics ctx={ctx} variant="inspector" />
				{:else if lyricsLoading}<div class="inspector-empty">Loading lyrics…</div>
				{:else if plainLyrics.length}<div class="inspector-plain">{#each plainLyrics as line}<p>{line}</p>{/each}</div>
				{:else}<div class="inspector-empty"><Mic2 size={25}/><span>No synced lyrics for this track</span></div>{/if}
			{:else if tab === 'queue'}
				<div class="inspector-queue">
					{#each queue as track, index}
						<div class:current={index === 0}>
							<span>{index === 0 ? 'Now' : index}</span>
							{#if track.album?.images?.[2]}<img src={track.album.images[2].url} alt="" loading="lazy" decoding="async" />{/if}
							<div><strong>{track.name}</strong><small>{track.artists?.[0]?.name}</small></div>
							<time>{formatTime(track.duration_ms)}</time>
						</div>
					{/each}
					{#if !queue.length}<div class="inspector-empty">Queue is empty</div>{/if}
				</div>
			{:else}
				<div class="inspector-info">
					{#if currentTrack?.album?.images?.[0]}<img src={currentTrack.album.images[0].url} alt={currentTrack.name} />{/if}
					<h2>{currentTrack?.name ?? 'Nothing playing'}</h2>
					<p>{currentTrack?.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(', ')}</p>
					<dl>
						<div><dt>Album</dt><dd>{currentTrack?.album?.name ?? '—'}</dd></div>
						<div><dt>Duration</dt><dd>{formatTime(currentTrack?.duration_ms ?? 0)}</dd></div>
					</dl>
				</div>
			{/if}
		</div>
	</aside>
{/if}
