<script>
	import { BarChart3, Bookmark, Brain, ChevronLeft, ChevronRight, Heart, History, Home, Library, ListMusic, LogOut, Pin, Plus, Search, Settings2, SlidersHorizontal, Waves } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let currentView = $derived(ctx.currentView);
	let likedSongs = $derived(ctx.likedSongs);
	let customPlaylists = $derived(ctx.customPlaylists);
	let playerReady = $derived(ctx.playerReady);
	let openCustomPlaylist = $derived(ctx.openCustomPlaylist);
	let goHome = $derived(ctx.goHome);
	let goSearch = $derived(ctx.goSearch);
	let openLibrary = $derived(ctx.openLibrary);
	let openHistory = $derived(ctx.openHistory);
	let openStats = $derived(ctx.openStats);
	let openSettings = $derived(ctx.openSettings);
	let openMemory = $derived(ctx.openMemory);
	let openTools = $derived(ctx.openTools);
	let pinnedPlaylistIds = $derived(ctx.pinnedPlaylistIds ?? []);
	let togglePinPlaylist = $derived(ctx.togglePinPlaylist);
	let openLikedSongs = $derived(ctx.openLikedSongs);
	let handleLogout = $derived(ctx.handleLogout);
	let sidebarCollapsed = $derived(ctx.sidebarCollapsed);
	let toggleSidebar = $derived(ctx.toggleSidebar);
	let sidebarWidth = $derived(ctx.sidebarWidth ?? 226);
	let setSidebarWidth = $derived(ctx.setSidebarWidth);
	let resizing = $state(false);

	/** @param {PointerEvent} event */
	function beginResize(event) {
		if (sidebarCollapsed || event.pointerType === 'touch') return;
		resizing = true;
		/** @type {HTMLElement | null} */ (event.currentTarget)?.setPointerCapture?.(event.pointerId);
	}

	/** @param {PointerEvent} event */
	function resizeSidebar(event) {
		if (!resizing) return;
		setSidebarWidth?.(event.clientX);
	}

	function endResize() { resizing = false; }
</script>

<aside class="sidebar polished-sidebar" class:collapsed={sidebarCollapsed}>
	<div>
		<div class="brand polished-brand">
			<div class="brand-icon"><Waves size={19} /></div>
			<strong>VYRA</strong>
		</div>
		<button class="sidebar-collapse" onclick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{#if sidebarCollapsed}<ChevronRight size={15} />{:else}<ChevronLeft size={15} />{/if}</button>

		<nav class="nav polished-nav" aria-label="Main navigation">
			<button class:active={currentView === 'home'} onclick={goHome}><Home size={18} /><span>Home</span></button>
			<button class:active={currentView === 'search'} onclick={goSearch}><Search size={18} /><span>Search</span></button>
		</nav>

		<div class="sidebar-divider"></div>
		<div class="sidebar-label">Library</div>

		<nav class="nav polished-nav secondary-nav" aria-label="Library navigation">
			<button class:active={currentView === 'library' || currentView === 'custom-playlist'} onclick={openLibrary}><Library size={18} /><span>Library</span></button>
			<button class:active={currentView === 'liked'} onclick={openLikedSongs}><Heart size={18} /><span>Liked Songs</span>{#if likedSongs.length}<small>{likedSongs.length}</small>{/if}</button>
			<button class:active={currentView === 'history'} onclick={openHistory}><History size={18} /><span>Recently Played</span></button>
			<button class:active={currentView === 'stats'} onclick={openStats}><BarChart3 size={18} /><span>Listening Stats</span></button>
			<button class:active={currentView === 'memory'} onclick={openMemory}><Brain size={18} /><span>Music Memory</span></button>
			<button class:active={currentView === 'tools'} onclick={openTools}><SlidersHorizontal size={18} /><span>Power Tools</span></button>
			<button class:active={currentView === 'settings'} onclick={openSettings}><Settings2 size={18} /><span>Settings</span></button>
		</nav>

		<div class="sidebar-group polished-playlists">
			<div class="sidebar-group-title">
				<span>Playlists</span>
				<button onclick={() => setUiState('playlistModalOpen', true)} aria-label="New playlist"><Plus size={15} /></button>
			</div>

			{#if pinnedPlaylistIds.length}
				<div class="sidebar-mini-label"><Pin size={11}/>Pinned</div>
				{#each customPlaylists.filter(/** @param {any} playlist */ (playlist) => pinnedPlaylistIds.includes(playlist.id)).slice(0, 5) as playlist}
					<div class="playlist-nav-row">
						<button class="playlist-nav polished-playlist-nav" onclick={() => openCustomPlaylist(playlist)}><Bookmark size={14}/><span>{playlist.name}</span></button>
						<button class="playlist-pin active" onclick={() => togglePinPlaylist(playlist.id)} aria-label={`Unpin ${playlist.name}`}><Pin size={12} fill="currentColor"/></button>
					</div>
				{/each}
			{/if}
			{#each customPlaylists.filter(/** @param {any} playlist */ (playlist) => !pinnedPlaylistIds.includes(playlist.id)).slice(0, 8) as playlist}
				<div class="playlist-nav-row">
					<button class="playlist-nav polished-playlist-nav" onclick={() => openCustomPlaylist(playlist)}>
						<ListMusic size={15} /><span>{playlist.name}</span>
					</button>
					<button class="playlist-pin" onclick={() => togglePinPlaylist(playlist.id)} aria-label={`Pin ${playlist.name}`}><Pin size={12}/></button>
				</div>
			{/each}
		</div>
	</div>

	<div class="sidebar-footer">
		<div class="spotify-status" title={playerReady ? 'Spotify connected' : 'Spotify connecting'}>
			<i class:ready={playerReady}></i>
			<span>{playerReady ? 'Spotify connected' : 'Connecting…'}</span>
		</div>
		<button class="logout polished-logout" onclick={handleLogout}><LogOut size={15} /><span>Sign out</span></button>
	</div>
	{#if !sidebarCollapsed}
		<button type="button" class="sidebar-resize-handle" class:active={resizing} aria-label="Resize sidebar" title="Resize sidebar" onpointerdown={beginResize} onpointermove={resizeSidebar} onpointerup={endResize} onpointercancel={endResize} onkeydown={(event) => { if (event.key === 'ArrowLeft') setSidebarWidth?.(sidebarWidth - 8); if (event.key === 'ArrowRight') setSidebarWidth?.(sidebarWidth + 8); }}></button>
	{/if}
</aside>
