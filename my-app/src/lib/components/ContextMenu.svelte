<script>
	import { Disc3, ExternalLink, Heart, ListEnd, ListMusic,
		Info, Play, UserRound } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let artists = $derived(ctx.artists);
	let contextMenuOpen = $derived(ctx.contextMenuOpen);
	let contextX = $derived(ctx.contextX);
	let contextY = $derived(ctx.contextY);
	let contextTrack = $derived(ctx.contextTrack);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let openAddToPlaylist = $derived(ctx.openAddToPlaylist);
	let openAlbum = $derived(ctx.openAlbum);
	let openArtist = $derived(ctx.openArtist);
	let playTrackList = $derived(ctx.playTrackList);
	let addToQueue = $derived(ctx.addToQueue);
	let openTrackInfo = $derived(ctx.openTrackInfo);
</script>

	<!-- ========================================================
	     CONTEXT MENU
	     ======================================================== -->

	{#if contextMenuOpen && contextTrack}
		<div
			class="context-menu"
			style={`left:${contextX}px;top:${contextY}px`}
		>
			<div class="context-track">
				{#if contextTrack.album?.images?.[0]}
					<img
						src={contextTrack.album.images[0].url}
						alt={contextTrack.name}
					/>
				{/if}

				<span>
					<strong>
						{contextTrack.name}
					</strong>

					<small>
						{contextTrack.artists?.[0]?.name}
					</small>
				</span>
			</div>

			<button
				onclick={() => {
					playTrackList(
						[
							contextTrack
						],
						contextTrack
					);

					setUiState('contextMenuOpen', false);
				}}
			>
				<Play size={16} />
				Play
			</button>

			<button
				onclick={() => {
					addToQueue(
						contextTrack.uri
					);

					setUiState('contextMenuOpen', false);
				}}
			>
				<ListEnd size={16} />
				Play Next
			</button>

			<button onclick={() => openTrackInfo(contextTrack)}><Info size={16} /> Song Info</button>

			<button
				onclick={() => {
					toggleLike(
						contextTrack
					);

					setUiState('contextMenuOpen', false);
				}}
			>
				<Heart size={16} />

				{isLiked(contextTrack)
					? 'Remove Like'
					: 'Like Song'}
			</button>

			<button
				onclick={() => {
					openAddToPlaylist(
						contextTrack
					);

					setUiState('contextMenuOpen', false);
				}}
			>
				<ListMusic size={16} />
				Add to Playlist
			</button>

			{#if contextTrack.album}
				<button
					onclick={() => {
						openAlbum(
							contextTrack.album
						);

						setUiState('contextMenuOpen', false);
					}}
				>
					<Disc3 size={16} />
					Go to Album
				</button>
			{/if}

			{#if contextTrack.artists?.[0]}
				<button
					onclick={() => {
						openArtist(
							contextTrack.artists[0]
						);

						setUiState('contextMenuOpen', false);
					}}
				>
					<UserRound size={16} />
					Go to Artist
				</button>
			{/if}

			{#if contextTrack.external_urls?.spotify}
				<a
					href={contextTrack.external_urls.spotify}
					target="_blank"
					rel="noreferrer"
				>
					<ExternalLink size={16} />
					Open in Spotify
				</a>
			{/if}
		</div>
	{/if}

