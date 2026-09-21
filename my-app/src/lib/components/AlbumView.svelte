<script>
	import { ArrowLeft, CirclePlus, Play, Plus } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let pageLoading = $derived(ctx.pageLoading);
	let tracks = $derived(ctx.tracks);
	let artists = $derived(ctx.artists);
	let selectedAlbum = $derived(ctx.selectedAlbum);
	let albumTracks = $derived(ctx.albumTracks);
	let savedAlbums = $derived(ctx.savedAlbums);
	let toggleSaveAlbum = $derived(ctx.toggleSaveAlbum);
	let goBack = $derived(ctx.goBack);
	let playAlbumTrack = $derived(ctx.playAlbumTrack);
	let addToQueue = $derived(ctx.addToQueue);
	let formatTime = $derived(ctx.formatTime);
</script>

		<!-- ALBUM -->

		{#if currentView === 'album' && selectedAlbum && !pageLoading}
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
						{#if selectedAlbum.images?.[0]}
							<img
								src={selectedAlbum.images[0].url}
								alt=""
							/>
						{/if}
					</div>

					<div class="detail-overlay"></div>

					<div class="detail-art">
						{#if selectedAlbum.images?.[0]}
							<img
								src={selectedAlbum.images[0].url}
								alt={selectedAlbum.name}
							/>
						{/if}
					</div>

					<div class="detail-copy">
						<span class="eyebrow">
							{selectedAlbum.album_type?.toUpperCase()}
						</span>

						<h1>
							{selectedAlbum.name}
						</h1>

						<p>
							{selectedAlbum.artists
								?.map(
									/** @param {any} artist */
									(artist) =>
										artist.name
								)
								.join(', ')}
						</p>

						<span>
							{selectedAlbum.release_date?.slice(0, 4)}
							• {selectedAlbum.total_tracks}
							tracks
						</span>

						<div class="detail-actions">
							<button
								class="primary-button"
								onclick={() =>
									playAlbumTrack(
										selectedAlbum,
										0
									)}
							>
								<Play
									size={19}
									fill="currentColor"
								/>
								Play
							</button>

							<button
								class="glass-button"
								onclick={() =>
									toggleSaveAlbum(
										selectedAlbum
									)}
							>
								<Plus size={17} />
								{savedAlbums.some(
									/** @param {any} album */
									(album) =>
										album.id ===
										selectedAlbum.id
								)
									? 'Saved'
									: 'Save Album'}
							</button>
						</div>
					</div>
				</div>

				<div class="album-track-list">
					{#each albumTracks as track, index}
						<div class="album-track-row">
							<button
								onclick={() =>
									playAlbumTrack(
										selectedAlbum,
										index
									)}
							>
								<span>
									{index + 1}
								</span>

								<div>
									<strong>
										{track.name}
									</strong>

									<small>
										{track.artists?.[0]?.name}
									</small>
								</div>
							</button>

							<span>
								{formatTime(
									track.duration_ms
								)}
							</span>

							<button
								class="row-action"
								onclick={() =>
									addToQueue(
										track.uri
									)}
							>
								<CirclePlus
									size={18}
								/>
							</button>
						</div>
					{/each}
				</div>
			</section>
		{/if}

