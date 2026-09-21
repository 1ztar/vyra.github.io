<script>
	import { Check, Heart, ListPlus, Play, Trash2, X } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let {
		tracks = [],
		currentTrack = null,
		formatTime = /** @param {number} value */ (value) => String(value ?? ''),
		onPlay = null,
		onPlayMany = null,
		onContext = null,
		onRemove = null,
		onLike = null,
		onQueue = null,
		liked = false,
		rowHeight = 64
	} = $props();

	/** @type {HTMLDivElement | null} */
	let viewport = $state(null);
	let scrollTop = $state(0);
	let viewportHeight = $state(560);
	let selected = $state(new Set());
	let lastSelected = $state(-1);
	const buffer = 8;

	let start = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - buffer));
	let visibleCount = $derived(Math.ceil(viewportHeight / rowHeight) + buffer * 2);
	let end = $derived(Math.min(tracks.length, start + visibleCount));
	let visible = $derived(tracks.slice(start, end));
	let selectedTracks = $derived(tracks.filter(/** @param {any} track */ (track) => selected.has(track?.uri ?? track?.id)));

	function syncViewport() {
		if (!viewport) return;
		scrollTop = viewport.scrollTop;
		viewportHeight = viewport.clientHeight || 560;
	}

	/** @param {any} track @param {number} index @param {MouseEvent | KeyboardEvent} event */
	function toggleSelected(track, index, event) {
		const key = track?.uri ?? track?.id;
		if (!key) return;
		const next = new Set(selected);
		if (event.shiftKey && lastSelected >= 0) {
			const a = Math.min(lastSelected, index);
			const b = Math.max(lastSelected, index);
			for (let i = a; i <= b; i += 1) {
				const rangeKey = tracks[i]?.uri ?? tracks[i]?.id;
				if (rangeKey) next.add(rangeKey);
			}
		} else if (next.has(key)) next.delete(key);
		else next.add(key);
		selected = next;
		lastSelected = index;
	}

	function clearSelection() {
		selected = new Set();
		lastSelected = -1;
	}

	async function queueSelected() {
		if (!onQueue) return;
		for (const track of selectedTracks) await onQueue(track);
		clearSelection();
	}

	async function removeSelected() {
		if (!onRemove) return;
		for (const track of [...selectedTracks]) await onRemove(track);
		clearSelection();
	}

	function playSelected() {
		if (!selectedTracks.length) return;
		if (onPlayMany) onPlayMany(selectedTracks, selectedTracks[0]);
		else onPlay?.(selectedTracks[0]);
	}
</script>

{#if selected.size}
	<div class="multi-select-bar" role="toolbar" aria-label="Selected tracks">
		<strong>{selected.size} selected</strong>
		<div>
			<button type="button" onclick={playSelected}><Play size={14} fill="currentColor" /> Play</button>
			{#if onQueue}<button type="button" onclick={queueSelected}><ListPlus size={14} /> Queue</button>{/if}
			{#if onRemove}<button type="button" class="danger" onclick={removeSelected}><Trash2 size={14} /> Remove</button>{/if}
			<button type="button" class="icon" onclick={clearSelection} aria-label="Clear selection"><X size={15} /></button>
		</div>
	</div>
{/if}

<div
	class="virtual-track-viewport"
	bind:this={viewport}
	onscroll={syncViewport}
	style={`height:min(${Math.max(rowHeight, tracks.length * rowHeight)}px, 62vh);--virtual-row-height:${rowHeight}px`}
>
	<div class="virtual-track-spacer" style={`height:${tracks.length * rowHeight}px`}>
		<div class="virtual-track-window" style={`transform:translateY(${start * rowHeight}px)`}>
			{#each visible as track, localIndex}
				{@const index = start + localIndex}
				{@const key = track?.uri ?? track?.id}
				<div
					class="track-row simple-row virtual-track-row"
					class:active={currentTrack?.uri === track.uri}
					class:selected={selected.has(key)}
					role="group"
					oncontextmenu={(event) => onContext?.(event, track)}
				>
					<button
						type="button"
						class="track-select-control"
						class:visible={selected.size > 0}
						onclick={(event) => toggleSelected(track, index, event)}
						aria-label={selected.has(key) ? `Deselect ${track.name}` : `Select ${track.name}`}
					>
						{#if selected.has(key)}<Check size={13} />{:else}<span>{index + 1}</span>{/if}
					</button>

					<button type="button" class="track-main" onclick={(event) => {
						if (event.metaKey || event.ctrlKey || event.shiftKey) toggleSelected(track, index, event);
						else onPlay?.(track);
					}}>
						<div class="track-art">{#if track.album?.images?.[0]}<img src={track.album.images[0].url} alt={track.name} loading="lazy" decoding="async" />{/if}</div>
						<div class="track-info"><strong>{track.name}</strong><span>{track.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(', ')}</span></div>
					</button>

					<span class="track-time">{formatTime(track.duration_ms)}</span>
					{#if onLike}
						<button type="button" class="row-action like" class:active={liked} onclick={() => onLike(track)} aria-label={liked ? `Unlike ${track.name}` : `Like ${track.name}`}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button>
					{:else if onRemove}
						<button type="button" class="row-action" onclick={() => onRemove(track)} aria-label={`Remove ${track.name}`}><X size={18} /></button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
