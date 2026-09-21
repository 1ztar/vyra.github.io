<script>
	import {
		ArrowRight,
		Brain,
		ChevronRight,
		Command,
		Heart,
		History,
		ListMusic,
		LoaderCircle,
		Maximize2,
		Music2,
		Pause,
		Search,
		SlidersHorizontal,
		SkipBack,
		SkipForward
	} from 'lucide-svelte';

	import PlayGlyph from './PlayGlyph.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();

	let setUiState = $derived(ctx.setUiState);
	let currentView = $derived(ctx.currentView);
	let search = $derived(ctx.search);
	let loading = $derived(ctx.loading);
	let recentSearches = $derived(ctx.recentSearches);
	let likedSongs = $derived(ctx.likedSongs);
	let customPlaylists = $derived(ctx.customPlaylists);
	let suggestions = $derived(ctx.suggestions);
	let suggestionsLoading = $derived(ctx.suggestionsLoading);
	let suggestionsOpen = $derived(ctx.suggestionsOpen);
	let listeningHistory = $derived(ctx.listeningHistory);
	let currentTrack = $derived(ctx.currentTrack);
	let isPlaying = $derived(ctx.isPlaying);
	let smoothPosition = $derived(ctx.smoothPosition);
	let duration = $derived(ctx.duration);
	let memoryTracks = $derived(ctx.memoryTracks ?? []);
	let continueListening = $derived(ctx.continueListening ?? []);
	let discoveryQueue = $derived(ctx.discoveryQueue ?? []);

	let searchSpotify = $derived(ctx.searchSpotify);
	let handleSearchInput = $derived(ctx.handleSearchInput);
	let selectSuggestion = $derived(ctx.selectSuggestion);
	let quickSearch = $derived(ctx.quickSearch);
	let openCustomPlaylist = $derived(ctx.openCustomPlaylist);
	let openLibrary = $derived(ctx.openLibrary);
	let openHistory = $derived(ctx.openHistory);
	let openLikedSongs = $derived(ctx.openLikedSongs);
	let openMemory = $derived(ctx.openMemory);
	let openTools = $derived(ctx.openTools);
	let loadLyrics = $derived(ctx.loadLyrics);
	let togglePlayback = $derived(ctx.togglePlayback);
	let previousTrack = $derived(ctx.previousTrack);
	let nextTrack = $derived(ctx.nextTrack);
	let seek = $derived(ctx.seek);
	let showFullscreenControls = $derived(ctx.showFullscreenControls);
	let formatTime = $derived(ctx.formatTime);

	/** @param {any} item */
	function returningFavorite(item) { return item.plays > 1; }
</script>

{#if currentView === 'home'}
	<header class="home-topbar editorial-topbar">
		<div>
			<h1>Listen Now</h1>
		</div>

		<button
			class="command-button editorial-command"
			onclick={() => setUiState('commandOpen', true)}
			aria-label="Open command palette"
		>
			<Command size={15} />
			<span>Quick actions</span>
			<kbd>⌘K</kbd>
		</button>
	</header>

	<section class="home-search-row editorial-search-row">
		<div class="home-search-box editorial-search-box">
			<Search size={17} />
			<input
				data-search-input
				value={search}
				placeholder="Search music"
				oninput={handleSearchInput}
				onfocus={() => {
					if (suggestions.length) setUiState('suggestionsOpen', true);
				}}
				onkeydown={(event) => {
					if (event.key === 'Enter') searchSpotify();
				}}
			/>
			<button onclick={searchSpotify} aria-label="Search">
				{#if loading}
					<LoaderCircle size={16} class="spin" />
				{:else}
					<ArrowRight size={16} />
				{/if}
			</button>

			{#if suggestionsOpen}
				<div class="suggestions home-suggestions">
					{#if suggestionsLoading}
						<div class="suggestion-loader">
							<LoaderCircle size={16} class="spin" />
							Searching…
						</div>
					{:else}
						{#each suggestions as suggestion}
							<button onclick={() => selectSuggestion(suggestion)}>
								<div>
									{#if suggestion.type === 'track' && suggestion.item.album?.images?.[0]}
										<img src={suggestion.item.album.images[0].url} alt="" loading="lazy" decoding="async" />
									{:else if suggestion.item.images?.[0]}
										<img src={suggestion.item.images[0].url} alt="" loading="lazy" decoding="async" />
									{:else}
										<Music2 size={17} />
									{/if}
								</div>
								<span>
									<strong>{suggestion.item.name}</strong>
									<small>{suggestion.type === 'track' ? suggestion.item.artists?.[0]?.name : suggestion.type}</small>
								</span>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>

		{#if recentSearches.length}
			<div class="home-recent-searches editorial-recent-searches" aria-label="Recent searches">
				<span>Recent</span>
				{#each recentSearches.slice(0, 4) as item}
					<button onclick={() => quickSearch(item)}>{item}</button>
				{/each}
			</div>
		{/if}
	</section>

	{#if currentTrack}
		<section class="home-now-playing editorial-now-playing">
			<div class="editorial-now-bg" aria-hidden="true">
				{#if currentTrack.album?.images?.[2]?.url || currentTrack.album?.images?.[0]?.url}
					<img src={currentTrack.album?.images?.[2]?.url ?? currentTrack.album?.images?.[0]?.url} alt="" decoding="async" />
				{/if}
			</div>

			<button
				class="home-now-art editorial-now-art"
				onclick={() => {
					setUiState('fullscreenPlayer', true);
					setUiState('fullscreenLyrics', true);
					loadLyrics();
					showFullscreenControls();
				}}
				aria-label="Open fullscreen player"
			>
				<img src={currentTrack.album?.images?.[0]?.url} alt={currentTrack.name} decoding="async" />
				<span><Maximize2 size={17} /></span>
			</button>

			<div class="home-now-main editorial-now-main">
				<div class="home-now-copy editorial-now-copy">
					<span class="now-status"><i class:playing={isPlaying}></i>{isPlaying ? 'Playing' : 'Paused'}</span>
					<strong>{currentTrack.name}</strong>
					<p>
						{currentTrack.artists
							?.map(
								/** @param {any} artist */
								(artist) => artist.name
							)
							.join(', ')}
					</p>
					{#if currentTrack.album?.name}
						<small>{currentTrack.album.name}</small>
					{/if}
				</div>

				<div class="home-now-progress editorial-now-progress">
					<input
						type="range"
						class="range"
						min="0"
						max={duration || 1}
						value={smoothPosition}
						oninput={seek}
						style={`--fill:${duration ? (smoothPosition / duration) * 100 : 0}%`}
						aria-label="Track progress"
					/>
					<div>
						<span>{formatTime(smoothPosition)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				<div class="home-now-controls editorial-now-controls">
					<button onclick={previousTrack} aria-label="Previous"><SkipBack size={19} fill="currentColor" /></button>
					<button class="home-now-play" onclick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
						{#if isPlaying}
							<Pause size={21} fill="currentColor" />
						{:else}
							<PlayGlyph size={16} class="transport-play-icon" />
						{/if}
					</button>
					<button onclick={nextTrack} aria-label="Next"><SkipForward size={19} fill="currentColor" /></button>
				</div>
			</div>
		</section>
	{/if}

	{#if listeningHistory.length}
		<section class="home-section editorial-section">
			<div class="section-heading clean-heading editorial-heading">
				<h2>Recently played</h2>
				<button onclick={openHistory}>See all <ChevronRight size={14} /></button>
			</div>

			<div class="recent-grid polished-grid editorial-cover-grid">
				{#each listeningHistory.slice(0, 6) as item}
					<button onclick={() => quickSearch(item.name)}>
						<div class="editorial-cover">
							{#if item.image}
								<img src={item.image} alt={item.name} loading="lazy" decoding="async" />
							{/if}
						</div>
						<strong>{item.name}</strong>
						<span>{item.artist}</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if continueListening.length}
		<section class="home-section editorial-section continue-listening-section">
			<div class="section-heading clean-heading editorial-heading">
				<div><h2>Continue Listening</h2><span class="section-subtle">Pick up an album you were spending time with</span></div>
			</div>
			<div class="continue-listening-grid">
				{#each continueListening.slice(0, 5) as item}
					<button onclick={() => quickSearch(item.album)} aria-label={`Continue ${item.album}`}>
						<div class="continue-art">
							{#if item.image}<img src={item.image} alt={item.album} loading="lazy" decoding="async" />{:else}<Music2 size={24} />{/if}
							<span class="continue-progress"><i style={`width:${Math.min(88, Math.max(24, item.trackCount * 12))}%`}></i></span>
						</div>
						<strong>{item.album}</strong>
						<span>{item.artist} · {item.trackCount} recent tracks</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if memoryTracks.filter(returningFavorite).length}
		<section class="home-section editorial-section">
			<div class="section-heading clean-heading editorial-heading"><h2>Rediscover</h2><button onclick={openMemory}>Your memory <ChevronRight size={14}/></button></div>
			<div class="recent-grid polished-grid editorial-cover-grid">
				{#each memoryTracks.filter(returningFavorite).slice(0, 6) as item}
					<button onclick={() => quickSearch(item.name)}><div class="editorial-cover">{#if item.image}<img src={item.image} alt={item.name} loading="lazy" decoding="async" />{:else}<Music2 size={20}/>{/if}</div><strong>{item.name}</strong><span>{item.artist} · {item.plays} plays</span></button>
				{/each}
			</div>
		</section>
	{/if}

	<section class="home-section quick-library-section editorial-section">
		<div class="section-heading clean-heading editorial-heading">
			<h2>Library</h2>
			<button onclick={openLibrary}>See all <ChevronRight size={14} /></button>
		</div>

		<div class="quick-library-list editorial-library-list">
			<button onclick={openLikedSongs}>
				<div class="quick-library-icon liked"><Heart size={18} fill="currentColor" /></div>
				<div><strong>Liked Songs</strong><span>{likedSongs.length} songs</span></div>
				<ChevronRight size={15} />
			</button>
			<button onclick={openHistory}>
				<div class="quick-library-icon"><History size={18} /></div>
				<div><strong>Recently Played</strong><span>{listeningHistory.length} entries</span></div>
				<ChevronRight size={15} />
			</button>
			<button onclick={openMemory}>
				<div class="quick-library-icon"><Brain size={18} /></div>
				<div><strong>Music Memory</strong><span>{memoryTracks.length} remembered tracks</span></div>
				<ChevronRight size={15} />
			</button>
			<button onclick={openTools}>
				<div class="quick-library-icon"><SlidersHorizontal size={18} /></div>
				<div><strong>Power Tools</strong><span>{discoveryQueue.length} saved for later</span></div>
				<ChevronRight size={15} />
			</button>
			{#if customPlaylists[0]}
				<button onclick={() => openCustomPlaylist(customPlaylists[0])}>
					<div class="quick-library-icon"><ListMusic size={18} /></div>
					<div><strong>{customPlaylists[0].name}</strong><span>{customPlaylists[0].tracks.length} songs</span></div>
					<ChevronRight size={15} />
				</button>
			{/if}
		</div>
	</section>

	{#if customPlaylists.length}
		<section class="home-section editorial-section">
			<div class="section-heading clean-heading editorial-heading">
				<h2>Your playlists</h2>
				<button onclick={openLibrary}>See all <ChevronRight size={14} /></button>
			</div>

			<div class="playlist-grid polished-grid editorial-cover-grid playlist-cover-grid">
				{#each customPlaylists.slice(0, 5) as playlist}
					<button class="playlist-card" onclick={() => openCustomPlaylist(playlist)}>
						<div class="playlist-mosaic editorial-playlist-cover">
							{#each playlist.tracks.slice(0, 4) as track}
								<div>
									{#if track.album?.images?.[0]}
										<img src={track.album.images[0].url} alt="" loading="lazy" decoding="async" />
									{:else}
										<Music2 size={17} />
									{/if}
								</div>
							{/each}
							{#if !playlist.tracks.length}<ListMusic size={34} />{/if}
						</div>
						<strong>{playlist.name}</strong>
						<span>{playlist.tracks.length} songs</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}
{/if}
