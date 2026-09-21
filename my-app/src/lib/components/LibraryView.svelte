<script>
	import { Check, Clock3, Heart, History, ListMusic, LoaderCircle, Moon, Plus, Repeat, Sparkles, Trash2 } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let currentView = $derived(ctx.currentView);
	let tracks = $derived(ctx.tracks);
	let artists = $derived(ctx.artists);
	let playlists = $derived(ctx.playlists);
	let likedSongs = $derived(ctx.likedSongs);
	let savedAlbums = $derived(ctx.savedAlbums);
	let savedArtists = $derived(ctx.savedArtists);
	let spotifyPlaylists = $derived(ctx.spotifyPlaylists);
	let libraryLoading = $derived(ctx.libraryLoading);
	let spotifyLibraryReady = $derived(ctx.spotifyLibraryReady);
	let customPlaylists = $derived(ctx.customPlaylists);
	let playlistModalOpen = $derived(ctx.playlistModalOpen);
	let getRecentlyPlayedSmartPlaylist = $derived(ctx.getRecentlyPlayedSmartPlaylist);
	let getOnRepeatSmartPlaylist = $derived(ctx.getOnRepeatSmartPlaylist);
	let getForgottenFavoritesSmartPlaylist = $derived(ctx.getForgottenFavoritesSmartPlaylist);
	let getThisWeekSmartPlaylist = $derived(ctx.getThisWeekSmartPlaylist);
	let getLateNightSmartPlaylist = $derived(ctx.getLateNightSmartPlaylist);
	let playSmartPlaylist = $derived(ctx.playSmartPlaylist);
	let openCustomPlaylist = $derived(ctx.openCustomPlaylist);
	let deleteCustomPlaylist = $derived(ctx.deleteCustomPlaylist);
	let openAlbum = $derived(ctx.openAlbum);
	let openArtist = $derived(ctx.openArtist);
	let openPlaylist = $derived(ctx.openPlaylist);
</script>

		<!-- LIBRARY -->

		{#if currentView === 'library'}
			<header class="page-header">
				<div>
					<span class="eyebrow">
						YOUR MUSIC
					</span>

					<h1>
						Library
					</h1>
				</div>

				<button
					class="primary-button"
					onclick={() => setUiState('playlistModalOpen', true)}
				>
					<Plus size={18} />
					New Playlist
				</button>
			</header>

			<section class="library-section">
				<div class="section-heading">
					<div>
						<span class="eyebrow">
							PLAYLISTS
						</span>

						<h2>
							Your Playlists
						</h2>
					</div>
				</div>

				{#if customPlaylists.length}
					<div class="playlist-grid">
						{#each customPlaylists as playlist}
							<div class="playlist-card-wrapper">
								<button
									class="playlist-card"
									onclick={() =>
										openCustomPlaylist(
											playlist
										)}
								>
									<div class="playlist-mosaic">
										{#each playlist.tracks.slice(0, 4) as track}
											<div>
												{#if track.album?.images?.[0]}
													<img
														src={track.album.images[0].url}
														alt=""
													/>
												{/if}
											</div>
										{/each}

										{#if !playlist.tracks.length}
											<ListMusic
												size={39}
											/>
										{/if}
									</div>

									<strong>
										{playlist.name}
									</strong>

									<span>
										{playlist.tracks.length}
										songs
									</span>
								</button>

								<button
									class="playlist-delete"
									onclick={() =>
										deleteCustomPlaylist(
											playlist
										)}
								>
									<Trash2
										size={16}
									/>
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<div class="library-empty">
						<ListMusic size={33} />

						<h3>
							No playlists yet
						</h3>

						<p>
							Create one and start building your collection.
						</p>
					</div>
				{/if}
			</section>

			<section class="library-section">
				<div class="section-heading">
					<div>
						<span class="eyebrow">SMART VYRA</span>
						<h2>Made From Your Listening</h2>
					</div>
				</div>

				<div class="smart-grid">
					<button
						class="smart-card smart-recent"
						onclick={() => playSmartPlaylist(getRecentlyPlayedSmartPlaylist())}
					>
						<div><History size={23} /></div>
						<strong>Recently Played</strong>
						<span>Your latest unique tracks</span>
					</button>

					<button
						class="smart-card smart-repeat"
						onclick={() => playSmartPlaylist(getOnRepeatSmartPlaylist())}
					>
						<div><Repeat size={23} /></div>
						<strong>On Repeat</strong>
						<span>Your most replayed tracks</span>
					</button>

					<button
						class="smart-card smart-liked"
						onclick={() => playSmartPlaylist(likedSongs.slice(0, 40))}
					>
						<div><Heart size={23} fill="currentColor" /></div>
						<strong>Recently Liked</strong>
						<span>Your newest Spotify saves</span>
					</button>

					<button
						class="smart-card smart-forgotten"
						onclick={() => playSmartPlaylist(getForgottenFavoritesSmartPlaylist())}
					>
						<div><Sparkles size={23} /></div>
						<strong>Forgotten Favorites</strong>
						<span>Liked songs you have not heard lately</span>
					</button>
					<button class="smart-card smart-week" onclick={() => playSmartPlaylist(getThisWeekSmartPlaylist())}>
						<div><Clock3 size={23} /></div><strong>This Week</strong><span>What shaped your last seven days</span>
					</button>

					<button class="smart-card smart-night" onclick={() => playSmartPlaylist(getLateNightSmartPlaylist())}>
						<div><Moon size={23} /></div><strong>Late Night</strong><span>Tracks you reach for after dark</span>
					</button>

				</div>
			</section>

			{#if spotifyPlaylists.length}
				<section class="library-section">
					<div class="section-heading">
						<div>
							<span class="eyebrow">SPOTIFY</span>
							<h2>Your Spotify Playlists</h2>
						</div>
					</div>

					<div class="media-grid">
						{#each spotifyPlaylists as playlist}
							<button
								class="media-card"
								onclick={() => openPlaylist(playlist)}
							>
								<div>
									{#if playlist.images?.[0]}
										<img src={playlist.images[0].url} alt={playlist.name} />
									{:else}
										<ListMusic size={35} />
									{/if}
								</div>
								<strong>{playlist.name}</strong>
								<small>{playlist.owner?.display_name ?? 'Spotify'}</small>
							</button>
						{/each}
					</div>
				</section>
			{/if}

			{#if libraryLoading}
				<div class="library-sync-status">
					<LoaderCircle size={15} class="spin" />
					Syncing Spotify library…
				</div>
			{:else if spotifyLibraryReady}
				<div class="library-sync-status ready">
					<Check size={15} />
					Spotify library synced
				</div>
			{/if}

			{#if savedAlbums.length}
				<section class="library-section">
					<div class="section-heading">
						<div>
							<span class="eyebrow">
								ALBUMS
							</span>

							<h2>
								Saved Albums
							</h2>
						</div>
					</div>

					<div class="media-grid">
						{#each savedAlbums as album}
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
									{album.artists?.[0]?.name}
								</small>
							</button>
						{/each}
					</div>
				</section>
			{/if}

			{#if savedArtists.length}
				<section class="library-section">
					<div class="section-heading">
						<div>
							<span class="eyebrow">
								ARTISTS
							</span>

							<h2>
								Saved Artists
							</h2>
						</div>
					</div>

					<div class="artist-grid">
						{#each savedArtists as artist}
							<button
								class="artist-card"
								onclick={() =>
									openArtist(artist)}
							>
								<div>
									{#if artist.images?.[0]}
										<img
											src={artist.images[0].url}
											alt={artist.name}
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
				</section>
			{/if}
		{/if}

