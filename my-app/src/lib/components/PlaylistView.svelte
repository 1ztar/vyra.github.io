<script>
	import { ArrowLeft, CirclePlus, ListMusic, Play } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let pageLoading = $derived(ctx.pageLoading);
	let artists = $derived(ctx.artists);
	let playlists = $derived(ctx.playlists);
	let selectedPlaylist = $derived(ctx.selectedPlaylist);
	let playlistTracks = $derived(ctx.playlistTracks);
	let playlistItemsUnavailable = $derived(ctx.playlistItemsUnavailable);
	let goBack = $derived(ctx.goBack);
	let playTrackList = $derived(ctx.playTrackList);
	let playSelectedSpotifyPlaylist = $derived(ctx.playSelectedSpotifyPlaylist);
	let addToQueue = $derived(ctx.addToQueue);
	let openTrackContext = $derived(ctx.openTrackContext);
	let formatTime = $derived(ctx.formatTime);
</script>

		<!-- PLAYLIST -->

		{#if currentView === 'playlist' && selectedPlaylist && !pageLoading}
			<section class="detail-page">
				<button
					class="back-button"
					onclick={goBack}
				>
					<ArrowLeft size={17} />
					Back
				</button>

				<div class="detail-hero">
					<div class="detail-bg">
						{#if selectedPlaylist.images?.[0]}
							<img
								src={selectedPlaylist.images[0].url}
								alt=""
							/>
						{/if}
					</div>

					<div class="detail-overlay"></div>

					<div class="detail-art">
						{#if selectedPlaylist.images?.[0]}
							<img
								src={selectedPlaylist.images[0].url}
								alt={selectedPlaylist.name}
							/>
						{:else}
							<ListMusic size={48} />
						{/if}
					</div>

					<div class="detail-copy">
						<span class="eyebrow">
							PLAYLIST
						</span>

						<h1>
							{selectedPlaylist.name}
						</h1>

						<p>
							{selectedPlaylist.description}
						</p>

						<button
							class="primary-button"
							onclick={playSelectedSpotifyPlaylist}
						>
							<Play
								size={19}
								fill="currentColor"
							/>
							Play
						</button>
					</div>
				</div>

				{#if playlistTracks.length}
					<div class="track-list page-track-list">
						{#each playlistTracks as track, index}
							<div
								class="track-row simple-row"
								role="group"
								oncontextmenu={(event) => openTrackContext(event, track)}
							>
								<button
									class="track-main"
									onclick={() => playTrackList(playlistTracks, track)}
								>
									<span class="track-index">{index + 1}</span>

									<div class="track-art">
										{#if track.album?.images?.[0]}
											<img
												src={track.album.images[0].url}
												alt={track.name}
											/>
										{/if}
									</div>

									<div class="track-info">
										<strong>{track.name}</strong>
										<span>
											{track.artists
												?.map(
													/** @param {any} artist */
													(artist) => artist.name
												)
												.join(', ')}
										</span>
									</div>
								</button>

								<span class="track-time">
									{formatTime(track.duration_ms)}
								</span>

								<button
									class="row-action"
									onclick={() => addToQueue(track.uri)}
									title="Play next"
								>
									<CirclePlus size={18} />
								</button>
							</div>
						{/each}
					</div>
				{:else if playlistItemsUnavailable}
					<div class="playlist-items-note">
						<ListMusic size={18} />
						<span>
							Spotify only exposes item details here for playlists you own or collaborate on. Playback still works.
						</span>
					</div>
				{/if}

			</section>
		{/if}
