<script>
	import { Heart, Play } from 'lucide-svelte';
	import VirtualTrackList from './VirtualTrackList.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let likedSongs = $derived(ctx.likedSongs);
	let currentTrack = $derived(ctx.currentTrack);
	let toggleLike = $derived(ctx.toggleLike);
	let playTrackList = $derived(ctx.playTrackList);
	let startPlayback = $derived(ctx.startPlayback);
	let openTrackContext = $derived(ctx.openTrackContext);
	let addToQueue = $derived(ctx.addToQueue);
	let formatTime = $derived(ctx.formatTime);

	/** @param {any} track */
	function playLikedTrack(track) { playTrackList(likedSongs, track); }
	/** @param {any[]} list @param {any} track */
	function playSelectedTracks(list, track) { playTrackList(list, track); }
</script>

{#if currentView === 'liked'}
	<section class="liked-page">
		<div class="liked-hero">
			<div class="liked-glow"></div>
			<div class="liked-cover"><Heart size={58} fill="currentColor" /></div>
			<div>
				<span class="eyebrow">YOUR LIBRARY</span>
				<h1>Liked Songs</h1>
				<p>{likedSongs.length} songs</p>
				{#if likedSongs.length}
					<button class="primary-button" onclick={() => startPlayback({ uris: likedSongs.map(/** @param {any} track */ (track) => track.uri) })}><Play size={19} fill="currentColor" />Play</button>
				{/if}
			</div>
		</div>

		{#if likedSongs.length}
			<VirtualTrackList
				tracks={likedSongs}
				{currentTrack}
				{formatTime}
				onPlay={playLikedTrack}
				onPlayMany={playSelectedTracks}
				onContext={openTrackContext}
				onLike={toggleLike}
				onQueue={addToQueue}
				liked={true}
			/>
		{:else}
			<div class="empty-state"><Heart size={34} /><h2>Your favorite music lives here.</h2><p>Heart any song to add it.</p></div>
		{/if}
	</section>
{/if}
