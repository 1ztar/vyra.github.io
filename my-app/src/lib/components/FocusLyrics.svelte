<script>
	import { LoaderCircle, Pause, X } from 'lucide-svelte';
	import PlayGlyph from './PlayGlyph.svelte';
	import SyncedLyrics from './SyncedLyrics.svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let open = $derived(ctx.focusLyricsOpen);
	let currentTrack = $derived(ctx.currentTrack);
	let syncedLyrics = $derived(ctx.syncedLyrics);
	let plainLyrics = $derived(ctx.plainLyrics);
	let lyricsLoading = $derived(ctx.lyricsLoading);
	let lyricsError = $derived(ctx.lyricsError);
	let lyricOffset = $derived(ctx.lyricOffset);
	let adjustLyricOffset = $derived(ctx.adjustLyricOffset);
	let isPlaying = $derived(ctx.isPlaying);
	let togglePlayback = $derived(ctx.togglePlayback);
</script>

{#if open && currentTrack}
	<section class="focus-lyrics-mode">
		<div class="focus-lyrics-bg">{#if currentTrack.album?.images?.[1]?.url || currentTrack.album?.images?.[0]?.url}<img src={currentTrack.album?.images?.[1]?.url ?? currentTrack.album?.images?.[0]?.url} alt="" />{/if}</div>
		<header>
			<div><strong>{currentTrack.name}</strong><span>{currentTrack.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(', ')}</span></div>
			<div class="focus-controls">
				<span class="precision-badge"><i></i> Line-synced</span>
				<button onclick={() => adjustLyricOffset(-100)}>−100</button><small>{lyricOffset > 0 ? '+' : ''}{lyricOffset}ms</small><button onclick={() => adjustLyricOffset(100)}>+100</button>
				<button class="focus-play" onclick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>{#if isPlaying}<Pause size={18} fill="currentColor" />{:else}<PlayGlyph size={14} />{/if}</button>
				<button onclick={() => setUiState('focusLyricsOpen', false)} aria-label="Close"><X size={20} /></button>
			</div>
		</header>
		{#if lyricsLoading}<div class="focus-empty"><LoaderCircle class="spin" size={25} /></div>
		{:else if lyricsError}<div class="focus-empty">{lyricsError}</div>
		{:else if syncedLyrics.length}<SyncedLyrics ctx={ctx} variant="focus" />
		{:else}<div class="focus-lyrics-scroll plain-focus">{#each plainLyrics as line}<p>{line}</p>{/each}</div>{/if}
	</section>
{/if}
