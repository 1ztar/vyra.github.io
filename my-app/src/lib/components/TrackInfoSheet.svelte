<script>
	import { Album, Bookmark, CirclePlus, ExternalLink, Heart, ListMusic, NotebookPen, Tag, UserRound, X } from 'lucide-svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let trackInfoOpen = $derived(ctx.trackInfoOpen);
	let track = $derived(ctx.trackInfoTrack);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let addToQueue = $derived(ctx.addToQueue);
	let openAddToPlaylist = $derived(ctx.openAddToPlaylist);
	let openAlbum = $derived(ctx.openAlbum);
	let openArtist = $derived(ctx.openArtist);
	let formatTime = $derived(ctx.formatTime);
	let getTrackMemory = $derived(ctx.getTrackMemory);
	let updateTrackNote = $derived(ctx.updateTrackNote);
	let updateTrackTags = $derived(ctx.updateTrackTags);
	let saveCurrentMoment = $derived(ctx.saveCurrentMoment);
	let smoothPosition = $derived(ctx.smoothPosition ?? 0);
	let currentTrack = $derived(ctx.currentTrack);
	let noteDraft = $state('');
	let tagsDraft = $state('');

	$effect(() => {
		if (!trackInfoOpen || !track?.uri || !getTrackMemory) return;
		const memory = getTrackMemory(track);
		noteDraft = memory?.note ?? '';
		tagsDraft = (memory?.tags ?? []).join(', ');
	});
</script>

{#if trackInfoOpen && track}
	<button class="modal-backdrop" onclick={() => setUiState('trackInfoOpen', false)} aria-label="Close track information"></button>
	<section class="track-info-sheet">
		<header>
			<span>Song info</span>
			<button onclick={() => setUiState('trackInfoOpen', false)} aria-label="Close"><X size={18} /></button>
		</header>
		<div class="track-info-hero">
			{#if track.album?.images?.[0]?.url}<img src={track.album.images[0].url} alt={track.name} />{/if}
			<div>
				<h2>{track.name}</h2>
				<p>{track.artists?.map((artist) => artist.name).join(', ')}</p>
				<small>{track.album?.name ?? 'Single'} · {formatTime(track.duration_ms ?? 0)}</small>
			</div>
		</div>
		<div class="track-info-actions">
			<button class:active={isLiked(track)} onclick={() => toggleLike(track)}><Heart size={17} fill={isLiked(track) ? 'currentColor' : 'none'} /> {isLiked(track) ? 'Liked' : 'Like'}</button>
			<button onclick={() => addToQueue(track.uri)}><CirclePlus size={17} /> Play next</button>
			<button onclick={() => openAddToPlaylist(track)}><ListMusic size={17} /> Add to playlist</button>
		</div>

		<div class="track-memory-editor">
			<div class="track-memory-heading"><NotebookPen size={16}/><div><strong>Personal memory</strong><span>Stored only in VYRA on this device.</span></div></div>
			<textarea bind:value={noteDraft} placeholder="Add a note about this song…"></textarea>
			<div class="track-memory-tags"><Tag size={14}/><input bind:value={tagsDraft} placeholder="night, gym, reference…" /></div>
			<div class="track-memory-actions">
				<button onclick={() => updateTrackNote(track, noteDraft)}>Save note</button>
				<button onclick={() => updateTrackTags(track, tagsDraft)}>Save tags</button>
				{#if track.uri === currentTrack?.uri}<button onclick={saveCurrentMoment}><Bookmark size={14}/>Save moment</button>{/if}
			</div>
		</div>
		<div class="track-info-links">
			{#if track.album}<button onclick={() => { setUiState('trackInfoOpen', false); openAlbum(track.album); }}><Album size={17} /><span><small>Album</small><strong>{track.album.name}</strong></span></button>{/if}
			{#if track.artists?.[0]}<button onclick={() => { setUiState('trackInfoOpen', false); openArtist(track.artists[0]); }}><UserRound size={17} /><span><small>Artist</small><strong>{track.artists[0].name}</strong></span></button>{/if}
			{#if track.external_urls?.spotify}<a href={track.external_urls.spotify} target="_blank" rel="noreferrer"><ExternalLink size={17} /><span><small>External</small><strong>Open in Spotify</strong></span></a>{/if}
		</div>
	</section>
{/if}
