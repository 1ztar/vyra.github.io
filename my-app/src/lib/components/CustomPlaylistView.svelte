<script>
	import { ArrowLeft, ListMusic, Play, Search, SlidersHorizontal } from 'lucide-svelte';
	import VirtualTrackList from './VirtualTrackList.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let selectedCustomPlaylist = $derived(ctx.selectedCustomPlaylist);
	let playSelectedCustomPlaylist = $derived(ctx.playSelectedCustomPlaylist);
	let playSelectedCustomTrack = $derived(ctx.playSelectedCustomTrack);
	let removeFromSelectedCustomPlaylist = $derived(ctx.removeFromSelectedCustomPlaylist);
	let openLibrary = $derived(ctx.openLibrary);
	let formatTime = $derived(ctx.formatTime);
	let playTrackList = $derived(ctx.playTrackList);
	let addToQueue = $derived(ctx.addToQueue);
	let currentTrack = $derived(ctx.currentTrack);

	/** @param {any[]} list @param {any} track */
	function playSelectedTracks(list, track) { playTrackList(list, track); }

	let filter = $state('');
	let sort = $state('playlist');

	function visibleTracks() {
		const playlist = selectedCustomPlaylist;
		if (!playlist) return [];
		const query = filter.trim().toLowerCase();
		let items = playlist.tracks.filter(/** @param {any} track */ (track) => {
			if (!query) return true;
			const text = `${track.name ?? ''} ${track.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(' ') ?? ''} ${track.album?.name ?? ''}`.toLowerCase();
			return text.includes(query);
		});
		if (sort === 'title') items = [...items].sort((a, b) => String(a.name).localeCompare(String(b.name)));
		if (sort === 'artist') items = [...items].sort((a, b) => String(a.artists?.[0]?.name ?? '').localeCompare(String(b.artists?.[0]?.name ?? '')));
		if (sort === 'album') items = [...items].sort((a, b) => String(a.album?.name ?? '').localeCompare(String(b.album?.name ?? '')));
		if (sort === 'duration') items = [...items].sort((a, b) => (a.duration_ms ?? 0) - (b.duration_ms ?? 0));
		return items;
	}
</script>

{#if currentView === 'custom-playlist' && selectedCustomPlaylist}
	<section class="detail-page">
		<button class="back-button" onclick={openLibrary}><ArrowLeft size={17} />Library</button>

		<div class="custom-playlist-hero">
			<div class="playlist-large-mosaic">
				{#each selectedCustomPlaylist.tracks.slice(0, 4) as track}
					<div>{#if track.album?.images?.[0]}<img src={track.album.images[0].url} alt="" decoding="async" />{/if}</div>
				{/each}
				{#if !selectedCustomPlaylist.tracks.length}<ListMusic size={55} />{/if}
			</div>

			<div>
				<span class="eyebrow">VYRA PLAYLIST</span>
				<h1>{selectedCustomPlaylist.name}</h1>
				<p>{selectedCustomPlaylist.description || `${selectedCustomPlaylist.tracks.length} songs`}</p>
				{#if selectedCustomPlaylist.tracks.length}<button class="primary-button" onclick={playSelectedCustomPlaylist}><Play size={19} fill="currentColor" />Play</button>{/if}
			</div>
		</div>

		{#if selectedCustomPlaylist.tracks.length}
			<div class="playlist-tools">
				<label><Search size={15} /><input bind:value={filter} placeholder="Search in playlist" /></label>
				<label class="playlist-sort"><SlidersHorizontal size={15} /><select bind:value={sort}><option value="playlist">Playlist order</option><option value="title">Title</option><option value="artist">Artist</option><option value="album">Album</option><option value="duration">Duration</option></select></label>
			</div>
			<VirtualTrackList
				tracks={visibleTracks()}
				{currentTrack}
				{formatTime}
				onPlay={playSelectedCustomTrack}
				onPlayMany={playSelectedTracks}
				onRemove={removeFromSelectedCustomPlaylist}
				onQueue={addToQueue}
			/>
		{/if}
	</section>
{/if}
