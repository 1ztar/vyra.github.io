<script>
	import { ArrowLeft, Heart, Play, Plus } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let pageLoading = $derived(ctx.pageLoading);
	let selectedArtist = $derived(ctx.selectedArtist);
	let artistAlbums = $derived(ctx.artistAlbums);
	let artistPopularTracks = $derived(ctx.artistPopularTracks);
	let savedArtists = $derived(ctx.savedArtists);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let toggleSaveArtist = $derived(ctx.toggleSaveArtist);
	let goBack = $derived(ctx.goBack);
	let openAlbum = $derived(ctx.openAlbum);
	let playTrackList = $derived(ctx.playTrackList);
	let playArtist = $derived(ctx.playArtist);
	let openTrackContext = $derived(ctx.openTrackContext);
	let formatTime = $derived(ctx.formatTime);
</script>

		<!-- ARTIST -->

		{#if currentView === 'artist' && selectedArtist && !pageLoading}
			<section class="detail-page">
				<button
					class="back-button"
					onclick={goBack}
				>
					<ArrowLeft size={17} />
					Back
				</button>

				<div class="detail-hero artist-hero">
					<div class="detail-bg">
						{#if selectedArtist.images?.[0]}
							<img
								src={selectedArtist.images[0].url}
								alt=""
							/>
						{/if}
					</div>

					<div class="detail-overlay"></div>

					<div class="artist-detail-art">
						{#if selectedArtist.images?.[0]}
							<img
								src={selectedArtist.images[0].url}
								alt={selectedArtist.name}
							/>
						{/if}
					</div>

					<div class="detail-copy">
						<span class="eyebrow">
							ARTIST
						</span>

						<h1>
							{selectedArtist.name}
						</h1>

						{#if selectedArtist.genres?.length}
							<p>
								{selectedArtist.genres
									.slice(0, 4)
									.join(' • ')}
							</p>
						{/if}

						<div class="detail-actions">
							<button
								class="primary-button"
								onclick={() =>
									playArtist(
										selectedArtist
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
									toggleSaveArtist(
										selectedArtist
									)}
							>
								<Plus size={17} />
								{savedArtists.some(
									/** @param {any} artist */
									(artist) =>
										artist.id ===
										selectedArtist.id
								)
									? 'Saved'
									: 'Save Artist'}
							</button>
						</div>
					</div>
				</div>

				{#if artistPopularTracks.length}
					<div class="content-section artist-popular">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									POPULAR
								</span>

								<h2>
									Popular Songs
								</h2>
							</div>
						</div>

						<div class="track-list">
							{#each artistPopularTracks as track, index}
								<div
	role="group"
									class="track-row simple-row"
									oncontextmenu={(event) =>
										openTrackContext(
											event,
											track
										)}
								>
									<button
										class="track-main"
										onclick={() =>
											playTrackList(
												artistPopularTracks,
												track
											)}
									>
										<span class="track-index">
											{index + 1}
										</span>

										<div class="track-art">
											{#if track.album?.images?.[0]}
												<img
													src={track.album.images[0].url}
													alt={track.name}
												/>
											{/if}
										</div>

										<div class="track-info">
											<strong>
												{track.name}
											</strong>

											<span>
												{track.album?.name}
											</span>
										</div>
									</button>

									<span class="track-time">
										{formatTime(
											track.duration_ms
										)}
									</span>

									<button
										class="row-action like"
										class:active={
											isLiked(track)
										}
										onclick={() =>
											toggleLike(
												track
											)}
									>
										<Heart
											size={18}
											fill={
												isLiked(track)
													? 'currentColor'
													: 'none'
											}
										/>
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if artistAlbums.length}
					<div class="content-section">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									RELEASES
								</span>

								<h2>
									Discography
								</h2>
							</div>
						</div>

						<div class="media-grid">
							{#each artistAlbums as album}
								<button
									class="media-card"
									onclick={() =>
										openAlbum(album)}
								>
									<div>
										{#if album.images?.[0]}
											<img
												src={album.images[0].url}
												alt={album.name}
											/>
										{/if}
									</div>

									<strong>
										{album.name}
									</strong>

									<small>
										{album.release_date?.slice(0, 4)}
									</small>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}

