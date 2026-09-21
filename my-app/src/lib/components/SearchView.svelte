<script>
	import { ArrowUpRight, AudioLines, Heart, ListMusic, MoreHorizontal, Play, Search, SearchX, UserRound } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let currentView = $derived(ctx.currentView);
	let activeTab = $derived(ctx.activeTab);
	let search = $derived(ctx.search);
	let loading = $derived(ctx.loading);
	let tracks = $derived(ctx.tracks);
	let albums = $derived(ctx.albums);
	let artists = $derived(ctx.artists);
	let playlists = $derived(ctx.playlists);
	let suggestions = $derived(ctx.suggestions);
	let suggestionsOpen = $derived(ctx.suggestionsOpen);
	let currentTrack = $derived(ctx.currentTrack);
	let isPlaying = $derived(ctx.isPlaying);
	let searchSpotify = $derived(ctx.searchSpotify);
	let handleSearchInput = $derived(ctx.handleSearchInput);
	let selectSuggestion = $derived(ctx.selectSuggestion);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let openAlbum = $derived(ctx.openAlbum);
	let openArtist = $derived(ctx.openArtist);
	let openPlaylist = $derived(ctx.openPlaylist);
	let playSearchTrack = $derived(ctx.playSearchTrack);
	let openTrackContext = $derived(ctx.openTrackContext);
	let formatTime = $derived(ctx.formatTime);
</script>

		<!-- SEARCH -->

		{#if currentView === 'search'}
			<header class="page-header">
				<div>
					<span class="eyebrow">
						DISCOVER
					</span>

					<h1>
						Search
					</h1>
				</div>

				<div class="page-search">
					<Search size={19} />

					<input
						data-search-input
						value={search}
						placeholder="Songs, artists, albums..."
						oninput={handleSearchInput}
						onfocus={() => setUiState('suggestionsOpen', true)}
						onkeydown={(event) => {
							if (
								event.key ===
								'Enter'
							) {
								searchSpotify();
							}
						}}
					/>

					<button
						onclick={searchSpotify}
					>
						<Search size={17} />
					</button>

					{#if suggestionsOpen && suggestions.length}
						<div class="suggestions page-suggestions">
							{#each suggestions as suggestion}
								<button
									onclick={() =>
										selectSuggestion(
											suggestion
										)}
								>
									<div>
										{#if suggestion.type === 'track'}
											{#if suggestion.item.album?.images?.[0]}
												<img
													src={suggestion.item.album.images[0].url}
													alt=""
												/>
											{/if}
										{:else if suggestion.item.images?.[0]}
											<img
												src={suggestion.item.images[0].url}
												alt=""
											/>
										{/if}
									</div>

									<span>
										<strong>
											{suggestion.item.name}
										</strong>

										<small>
											{suggestion.type}
										</small>
									</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</header>

			{#if tracks.length || albums.length || artists.length || playlists.length}
				<div class="tabs">
					<button
						class:active={
							activeTab === 'all'
						}
						onclick={() => setUiState('activeTab', 'all')}
					>
						All
					</button>

					<button
						class:active={
							activeTab === 'tracks'
						}
						onclick={() => setUiState('activeTab', 'tracks')}
					>
						Songs
					</button>

					<button
						class:active={
							activeTab === 'albums'
						}
						onclick={() => setUiState('activeTab', 'albums')}
					>
						Albums
					</button>

					<button
						class:active={
							activeTab === 'artists'
						}
						onclick={() => setUiState('activeTab', 'artists')}
					>
						Artists
					</button>

					<button
						class:active={
							activeTab ===
								'playlists'
						}
						onclick={() => setUiState('activeTab', 'playlists')}
					>
						Playlists
					</button>
				</div>
			{/if}

			<section class="results">
				{#if (activeTab === 'all' || activeTab === 'tracks') && tracks.length}
					<div class="content-section">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									SONGS
								</span>

								<h2>
									Top Results
								</h2>
							</div>
						</div>

						<div class="track-list">
							{#each tracks as track, index}
								<div
	role="group"
									class="track-row"
									class:active={
										currentTrack?.uri ===
										track.uri
									}
									oncontextmenu={(event) =>
										openTrackContext(
											event,
											track
										)}
								>
									<button
										class="track-main"
										onclick={() =>
											playSearchTrack(
												track
											)}
									>
										<span class="track-index">
											{#if currentTrack?.uri === track.uri && isPlaying}
												<AudioLines
													size={16}
												/>
											{:else}
												{String(
													index + 1
												).padStart(
													2,
													'0'
												)}
											{/if}
										</span>

										<div class="track-art">
											{#if track.album?.images?.[0]}
												<img
													src={track.album.images[0].url}
													alt={track.name}
												/>
											{/if}

											<span class="play-hover">
												<Play
													size={17}
													fill="currentColor"
												/>
											</span>
										</div>

										<div class="track-info">
											<strong>
												{track.name}
											</strong>

											<span>
												{track.artists
													?.map(
														/**
														 * @param {any} artist
														 */
														(artist) =>
															artist.name
													)
													.join(', ')}
											</span>
										</div>
									</button>

									<button
										class="album-link"
										onclick={() =>
											openAlbum(
												track.album
											)}
									>
										{track.album?.name}
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
											size={19}
											fill={
												isLiked(track)
													? 'currentColor'
													: 'none'
											}
										/>
									</button>

									<button
										class="row-action"
										onclick={() =>
											openTrackContext(
												/** @type {any} */ ({
													preventDefault() {},
													clientX:
														window.innerWidth -
														280,
													clientY:
														180
												}),
												track
											)}
									>
										<MoreHorizontal
											size={19}
										/>
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if (activeTab === 'all' || activeTab === 'albums') && albums.length}
					<div class="content-section">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									ALBUMS
								</span>

								<h2>
									Albums
								</h2>
							</div>
						</div>

						<div class="media-grid">
							{#each albums as album}
								<button
									class="media-card"
									onclick={() =>
										openAlbum(
											album
										)}
								>
									<div>
										{#if album.images?.[0]}
											<img
												src={album.images[0].url}
												alt={album.name}
											/>
										{/if}

										<span>
											<ArrowUpRight
												size={18}
											/>
										</span>
									</div>

									<strong>
										{album.name}
									</strong>

									<small>
										{album.artists?.[0]?.name}
									</small>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if (activeTab === 'all' || activeTab === 'artists') && artists.length}
					<div class="content-section">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									ARTISTS
								</span>

								<h2>
									Artists
								</h2>
							</div>
						</div>

						<div class="artist-grid">
							{#each artists as artist}
								<button
									class="artist-card"
									onclick={() =>
										openArtist(
											artist
										)}
								>
									<div>
										{#if artist.images?.[0]}
											<img
												src={artist.images[0].url}
												alt={artist.name}
											/>
										{:else}
											<UserRound
												size={38}
											/>
										{/if}
									</div>

									<strong>
										{artist.name}
									</strong>

									<span>
										Artist
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if (activeTab === 'all' || activeTab === 'playlists') && playlists.length}
					<div class="content-section">
						<div class="section-heading">
							<div>
								<span class="eyebrow">
									PLAYLISTS
								</span>

								<h2>
									Playlists
								</h2>
							</div>
						</div>

						<div class="media-grid">
							{#each playlists as playlist}
								<button
									class="media-card"
									onclick={() =>
										openPlaylist(
											playlist
										)}
								>
									<div>
										{#if playlist.images?.[0]}
											<img
												src={playlist.images[0].url}
												alt={playlist.name}
											/>
										{:else}
											<ListMusic
												size={37}
											/>
										{/if}
									</div>

									<strong>
										{playlist.name}
									</strong>

									<small>
										Playlist
									</small>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if !loading && search.trim() && !tracks.length && !albums.length && !artists.length && !playlists.length}
					<div class="empty-state">
						<SearchX size={34} />

						<h2>
							Nothing found
						</h2>

						<p>
							Try searching for something else.
						</p>
					</div>
				{/if}
			</section>
		{/if}

