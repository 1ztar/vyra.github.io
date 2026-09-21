<script>
	import { LoaderCircle, Mic2, X } from 'lucide-svelte';
	import SyncedLyrics from './SyncedLyrics.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let lyricsOpen = $derived(ctx.lyricsOpen);
	let lyricsLoading = $derived(ctx.lyricsLoading);
	let lyricsSynced = $derived(ctx.lyricsSynced);
	let syncedLyrics = $derived(ctx.syncedLyrics);
	let plainLyrics = $derived(ctx.plainLyrics);
	let lyricOffset = $derived(ctx.lyricOffset);
	let adjustLyricOffset = $derived(ctx.adjustLyricOffset);
</script>

{#if lyricsOpen}
	<button class="drawer-backdrop" onclick={() => setUiState('lyricsOpen', false)} aria-label="Close lyrics"></button>

	<aside class="drawer lyrics-drawer">
		<div class="drawer-header">
			<div><span>{lyricsSynced ? 'LINE SYNCED' : 'LYRICS'}</span><h2>Lyrics</h2></div>
			<button onclick={() => setUiState('lyricsOpen', false)} aria-label="Close lyrics"><X size={19} /></button>
		</div>

		<div class="drawer-sync precision-sync-toolbar">
			<button onclick={() => adjustLyricOffset(-100)}>−100ms</button>
			<strong>{lyricOffset > 0 ? '+' : ''}{lyricOffset}ms</strong>
			<button onclick={() => adjustLyricOffset(100)}>+100ms</button>
		</div>

		{#if syncedLyrics.length}
			<SyncedLyrics ctx={ctx} variant="drawer" />
		{:else if plainLyrics.length}
			<div class="drawer-plain">{#each plainLyrics as line}<p>{line}</p>{/each}</div>
		{:else if lyricsLoading}
			<div class="drawer-loading"><LoaderCircle size={24} class="spin" /></div>
		{:else}
			<div class="lyrics-empty"><Mic2 size={34} /><h3>No lyrics found</h3></div>
		{/if}
	</aside>
{/if}
