<script>
	import { onMount } from 'svelte';
	import '$lib/styles/vyra.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import HomeView from '$lib/components/HomeView.svelte';
	import SearchView from '$lib/components/SearchView.svelte';
	import LikedView from '$lib/components/LikedView.svelte';
	import LibraryView from '$lib/components/LibraryView.svelte';
	import CustomPlaylistView from '$lib/components/CustomPlaylistView.svelte';
	import HistoryView from '$lib/components/HistoryView.svelte';
	import StatsView from '$lib/components/StatsView.svelte';
	import AlbumView from '$lib/components/AlbumView.svelte';
	import ArtistView from '$lib/components/ArtistView.svelte';
	import PlaylistView from '$lib/components/PlaylistView.svelte';
	import BottomPlayer from '$lib/components/BottomPlayer.svelte';
	import MobileDock from '$lib/components/MobileDock.svelte';
	import FullscreenPlayer from '$lib/components/FullscreenPlayer.svelte';
	import LyricsDrawer from '$lib/components/LyricsDrawer.svelte';
	import QueueDrawer from '$lib/components/QueueDrawer.svelte';
	import ContextMenu from '$lib/components/ContextMenu.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import PlaylistCreateModal from '$lib/components/PlaylistCreateModal.svelte';
	import AddToPlaylistModal from '$lib/components/AddToPlaylistModal.svelte';
	import SleepTimerModal from '$lib/components/SleepTimerModal.svelte';
	import ToastStack from '$lib/components/ToastStack.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import SettingsView from '$lib/components/SettingsView.svelte';
	import DevicePicker from '$lib/components/DevicePicker.svelte';
	import TrackInfoSheet from '$lib/components/TrackInfoSheet.svelte';
	import FocusLyrics from '$lib/components/FocusLyrics.svelte';
	import MemoryView from '$lib/components/MemoryView.svelte';
	import PowerToolsView from '$lib/components/PowerToolsView.svelte';
	import Inspector from '$lib/components/Inspector.svelte';
	import { getStoredToken, getValidAccessToken, logout } from '$lib/spotify';
	import { findActiveLyricIndex, getLyricLineProgress } from '$lib/lyricsEngine';



	/* ============================================================
	   TYPES
	   ============================================================ */

	/**
	 * @typedef {{
	 *   time:number,
	 *   text:string
	 * }} SyncedLyricLine
	 */

	/**
	 * @typedef {{
	 *   id:string,
	 *   name:string,
	 *   description:string,
	 *   createdAt:number,
	 *   tracks:any[]
	 * }} VyraPlaylist
	 */

	/**
	 * @typedef {{
	 *   uri:string,
	 *   name:string,
	 *   artist:string,
	 *   album:string,
	 *   image:string,
	 *   playedAt:number
	 * }} HistoryItem
	 */

	/* ============================================================
	   APP STATE
	   ============================================================ */

	/** @type {string | null} */
	let token = $state(null);

	let currentView = $state('home');
	let previousView = $state('home');

	let activeTab = $state('all');

	let search = $state('');
	let loading = $state(false);
	let pageLoading = $state(false);
	let errorMessage = $state('');

	/** @type {any[]} */
	let tracks = $state([]);

	/** @type {any[]} */
	let albums = $state([]);

	/** @type {any[]} */
	let artists = $state([]);

	/** @type {any[]} */
	let playlists = $state([]);

	/** @type {any} */
	let selectedAlbum = $state(null);

	/** @type {any[]} */
	let albumTracks = $state([]);

	/** @type {any} */
	let selectedArtist = $state(null);

	/** @type {any[]} */
	let artistAlbums = $state([]);

	/** @type {any[]} */
	let artistPopularTracks = $state([]);

	/** @type {any} */
	let selectedPlaylist = $state(null);

	/** @type {any[]} */
	let playlistTracks = $state([]);

	let playlistItemsUnavailable = $state(false);

	/** @type {string[]} */
	let recentSearches = $state([]);

	/* ============================================================
	   LIKES / LIBRARY
	   ============================================================ */

	/** @type {any[]} */
	let likedSongs = $state([]);

	/** @type {any[]} */
	let savedAlbums = $state([]);

	/** @type {any[]} */
	let savedArtists = $state([]);

	/** @type {any[]} */
	let spotifyPlaylists = $state([]);

	let libraryLoading = $state(false);
	let spotifyLibraryReady = $state(false);

	/** @type {VyraPlaylist[]} */
	let customPlaylists = $state([]);

	/** @type {VyraPlaylist | null} */
	let selectedCustomPlaylist = $state(null);

	let playlistModalOpen = $state(false);
	let playlistNameDraft = $state('');
	let playlistDescriptionDraft = $state('');

	let addToPlaylistOpen = $state(false);

	/** @type {any} */
	let addToPlaylistTrack = $state(null);

	/* ============================================================
	   SEARCH SUGGESTIONS
	   ============================================================ */

	/** @type {any[]} */
	let suggestions = $state([]);

	let suggestionsLoading = $state(false);
	let suggestionsOpen = $state(false);

	/** @type {ReturnType<typeof setTimeout> | null} */
	let suggestionTimer = null;

	/* ============================================================
	   HISTORY / STATS
	   ============================================================ */

	/** @type {HistoryItem[]} */
	let listeningHistory = $state([]);

	let listeningSeconds = $state(0);
	let tracksPlayed = $state(0);
	let streakDays = $state(0);

	let lastTrackedSecond = 0;

	/* ============================================================
	   QUEUE
	   ============================================================ */

	/** @type {any[]} */
	let queue = $state([]);

	let queueOpen = $state(false);
	let queueLoading = $state(false);

	let draggedQueueIndex = $state(-1);

	/* ============================================================
	   FULLSCREEN PLAYER
	   ============================================================ */

	let fullscreenPlayer = $state(false);
	let fullscreenLyrics = $state(true);

	let fullscreenControlsVisible = $state(true);

	/** @type {ReturnType<typeof setTimeout> | null} */
	let controlsHideTimer = null;

	/* ============================================================
	   LYRICS
	   ============================================================ */

	let lyricsOpen = $state(false);
	let lyricsLoading = $state(false);
	let lyricsError = $state('');
	let lyricsSynced = $state(false);

	/** @type {SyncedLyricLine[]} */
	let syncedLyrics = $state([]);

	/** @type {string[]} */
	let plainLyrics = $state([]);

	let lyricsTrackUri = $state('');
	let activeLyricIndex = $state(-1);

	let lyricOffset = $state(0);
	let lyricOffsetFlash = $state(false);

	/** @type {ReturnType<typeof setTimeout> | null} */
	let lyricOffsetFlashTimer = null;
	/** @type {AbortController | null} */
	let lyricsController = null;


	/* ============================================================
	   PLAYER
	   ============================================================ */

	/** @type {any} */
	let player = null;

	/** @type {any} */
	let currentTrack = $state(null);

	let playerReady = $state(false);
	let deviceId = $state('');

	let isPlaying = $state(false);

	let position = $state(0);
	let smoothPosition = $state(0);
	let duration = $state(0);

	let playbackAnchorPosition = $state(0);
	let playbackAnchorTime = $state(0);

	let volume = $state(72);

	let shuffleEnabled = $state(false);
	let repeatMode = $state('off');

	/** @type {ReturnType<typeof setInterval> | null} */
	let progressTimer = null;

	/** @type {number | null} */
	let animationFrame = null;

	/* ============================================================
	   PERFORMANCE
	   ============================================================ */

	const UI_FRAME_MS = 50; // Global UI state updates at ~20fps; precision lyrics use their own RAF clock without rerendering the whole app.
	const CACHE_TTL_MS = 5 * 60 * 1000;

	let lastUiFrame = 0;
	let lastStatsSaveAt = 0;
	let lastMediaPositionUpdateAt = 0;

	/** @type {AbortController | null} */
	let searchController = null;

	/** @type {Map<string, {time:number, data:any}>} */
	const spotifyCache = new Map();

	/** @type {Map<string, {time:number, data:any}>} */
	const searchCache = new Map();

	/** @type {Map<string, string>} */
	const artworkColorCache = new Map();

	/* ============================================================
	   DYNAMIC ART / TRANSITIONS
	   ============================================================ */

	let previousArtwork = $state('');
	let artworkChanging = $state(false);

	let accentRgb = $state('97, 202, 255');

	/* ============================================================
	   APPEARANCE SETTINGS
	   ============================================================ */

	let visualEffects = $state('balanced');
	let density = $state('comfortable');
	let dynamicColors = $state(true);
	let animatedBackgrounds = $state(true);
	let autoOpenLyrics = $state(false);
	let lyricsSize = $state('normal');

	/* ============================================================
	   SLEEP TIMER
	   ============================================================ */

	let sleepTimerOpen = $state(false);

	/** @type {ReturnType<typeof setTimeout> | null} */
	let sleepTimer = null;

	let sleepTimerEnd = $state(0);
	let sleepTimerLabel = $state('');

	/* ============================================================
	   COMMAND PALETTE
	   ============================================================ */

	let commandOpen = $state(false);
	let commandSearch = $state('');

	/** @type {any[]} */
	let commandMusicResults = $state([]);
	let commandMusicLoading = $state(false);
	/** @type {ReturnType<typeof setTimeout> | null} */
	let commandSearchTimer = null;

	/* ============================================================
	   PRODUCT POLISH / SHEETS
	   ============================================================ */

	let sidebarCollapsed = $state(false);
	let sidebarWidth = $state(226);
	let devicePickerOpen = $state(false);
	let devicesLoading = $state(false);
	/** @type {any[]} */
	let devices = $state([]);
	let trackInfoOpen = $state(false);
	/** @type {any} */
	let trackInfoTrack = $state(null);
	let focusLyricsOpen = $state(false);
	let inspectorOpen = $state(false);
	let inspectorTab = $state('lyrics');
	let inspectorWidth = $state(360);
	let developerMode = $state(false);

	/* ============================================================
	   V11 PERSONAL MEMORY + POWER TOOLS
	   ============================================================ */

	/** @type {Record<string, any>} */
	let trackNotes = $state({});
	/** @type {string[]} */
	let savedSearches = $state([]);
	/** @type {any[]} */
	let queueSnapshots = $state([]);
	/** @type {any[]} */
	let discoveryQueue = $state([]);
	/** @type {string[]} */
	let pinnedPlaylistIds = $state([]);
	let themePreset = $state('graphite');
	let accentIntensity = $state('normal');
	let motionIntensity = $state('default');
	let glassIntensity = $state('light');
	let autoTheme = $state(false);
	let adaptivePerformance = $state(true);
	const effectiveTheme = $derived(autoTheme && (new Date().getHours() >= 22 || new Date().getHours() < 6) ? 'oled' : themePreset);

	const memoryTracks = $derived.by(() => {
		const map = new Map();
		for (const item of listeningHistory) {
			const key = item.uri || `${item.name}::${item.artist}`;
			const existing = map.get(key);
			if (existing) {
				existing.plays += 1;
				existing.firstPlayed = Math.min(existing.firstPlayed, item.playedAt || Date.now());
				existing.lastPlayed = Math.max(existing.lastPlayed, item.playedAt || 0);
			} else {
				map.set(key, { ...item, uri: key, plays: 1, firstPlayed: item.playedAt || Date.now(), lastPlayed: item.playedAt || 0 });
			}
		}
		return [...map.values()].sort((a, b) => b.plays - a.plays || b.lastPlayed - a.lastPlayed);
	});


	const continueListening = $derived.by(() => {
		const groups = new Map();
		for (const item of listeningHistory) {
			const album = String(item.album ?? '').trim();
			if (!album) continue;
			const key = `${album}::${item.artist ?? ''}`;
			const existing = groups.get(key);
			if (!existing) {
				groups.set(key, { album, artist: item.artist ?? '', image: item.image ?? '', lastPlayed: item.playedAt ?? 0, tracks: new Set([item.uri || item.name]) });
			} else {
				existing.lastPlayed = Math.max(existing.lastPlayed, item.playedAt ?? 0);
				existing.tracks.add(item.uri || item.name);
				if (!existing.image && item.image) existing.image = item.image;
			}
		}
		return [...groups.values()]
			.filter((item) => item.tracks.size >= 2)
			.sort((a, b) => b.lastPlayed - a.lastPlayed)
			.slice(0, 8)
			.map((item) => ({ ...item, trackCount: item.tracks.size }));
	});


	/* ============================================================
	   CONTEXT MENU
	   ============================================================ */

	let contextMenuOpen = $state(false);
	let contextX = $state(0);
	let contextY = $state(0);

	/** @type {any} */
	let contextTrack = $state(null);

	/* ============================================================
	   TOASTS
	   ============================================================ */

	/**
	 * @typedef {{
	 *   id:number,
	 *   message:string,
	 *   icon:string,
	 *   actionLabel?:string,
	 *   action?:() => void
	 * }} Toast
	 */

	/** @type {Toast[]} */
	let toasts = $state([]);

	let toastCounter = 0;

	/* ============================================================
	   INIT
	   ============================================================ */

	onMount(() => {
		token = getStoredToken();

		if (!token) {
			window.location.href = '/';
			return;
		}

		loadAppearanceSettings();
		loadV11Data();
		sidebarCollapsed = localStorage.getItem('vyra_sidebar_collapsed') === '1';
		sidebarWidth = Math.max(200, Math.min(320, Number(localStorage.getItem('vyra_sidebar_width') ?? '226')));
		developerMode = localStorage.getItem('vyra_developer_mode') === '1';
		inspectorOpen = localStorage.getItem('vyra_inspector_open') === '1';
		inspectorTab = localStorage.getItem('vyra_inspector_tab') ?? 'lyrics';
		inspectorWidth = Math.max(300, Math.min(520, Number(localStorage.getItem('vyra_inspector_width') ?? '360')));
		loadRecentSearches();
		loadLikedSongs();
		loadLibrary();
		loadCustomPlaylists();
		loadHistory();
		loadStats();
		calculateStreak();
		hydrateSpotifyData();
		restoreViewFromUrl();
		setupMediaSession();
		loadSpotifySDK();

		const handleVisibility = () => {
			if (document.hidden) {
				stopPlaybackAnimation();
			} else {
				syncPlaybackAnimation();
			}
		};

		document.addEventListener('visibilitychange', handleVisibility);

		/**
		 * @param {KeyboardEvent} event
		 */
		const handleKeyboard = (event) => {
			const target =
				/** @type {HTMLElement | null} */ (event.target);

			const typing =
				target?.tagName === 'INPUT' ||
				target?.tagName === 'TEXTAREA' ||
				target?.isContentEditable;

			if (
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === 'k'
			) {
				event.preventDefault();

				commandOpen = !commandOpen;
				commandSearch = '';

				return;
			}

			if (!typing && event.key === '/') {
				event.preventDefault();
				goSearch();
				return;
			}

			if (event.key === 'Escape') {
				if (commandOpen) {
					commandOpen = false;
					return;
				}

				if (contextMenuOpen) {
					contextMenuOpen = false;
					return;
				}

				if (fullscreenPlayer) {
					fullscreenPlayer = false;
					return;
				}

				queueOpen = false;
				lyricsOpen = false;
				sleepTimerOpen = false;
				addToPlaylistOpen = false;
				playlistModalOpen = false;
			}

			if (typing) return;

			if (event.code === 'Space') {
				event.preventDefault();
				togglePlayback();
			}

			if (event.ctrlKey && event.code === 'ArrowRight') {
				nextTrack();
			}

			if (event.ctrlKey && event.code === 'ArrowLeft') {
				previousTrack();
			}

			if (event.key.toLowerCase() === 'l' && currentTrack) {
				toggleLike(currentTrack);
			}

			if (event.key.toLowerCase() === 'f' && currentTrack) {
				fullscreenPlayer = !fullscreenPlayer;

				if (fullscreenPlayer) {
					loadLyrics();
				}
			}

			if (event.key === '[') {
				adjustLyricOffset(-100);
			}

			if (event.key === ']') {
				adjustLyricOffset(100);
			}

			if (event.key === '\\') {
				resetLyricOffset();
			}
		};

		/**
		 * @param {MouseEvent} event
		 */
		const closeContextMenu = (event) => {
			const target =
				/** @type {HTMLElement | null} */ (event.target);

			if (!target?.closest('.context-menu')) {
				contextMenuOpen = false;
			}
		};

		const handlePopState = () => {
			restoreViewFromUrl(false);
		};

		window.addEventListener('keydown', handleKeyboard);
		window.addEventListener('mousedown', closeContextMenu);
		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('keydown', handleKeyboard);
			window.removeEventListener('mousedown', closeContextMenu);
			document.removeEventListener('visibilitychange', handleVisibility);
			window.removeEventListener('popstate', handlePopState);

			if (progressTimer) {
				clearInterval(progressTimer);
			}

			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			if (suggestionTimer) {
				clearTimeout(suggestionTimer);
			}

			if (commandSearchTimer) {
				clearTimeout(commandSearchTimer);
			}

			if (controlsHideTimer) {
				clearTimeout(controlsHideTimer);
			}

			if (sleepTimer) {
				clearTimeout(sleepTimer);
			}

			searchController?.abort();
			player?.disconnect();
		};
	});

	/* ============================================================
	   SPOTIFY SDK
	   ============================================================ */

	function loadSpotifySDK() {
		const win = /** @type {any} */ (window);

		const existing =
			document.getElementById('spotify-player-sdk');

		if (existing) {
			if (win.Spotify) {
				initializePlayer();
			} else {
				win.onSpotifyWebPlaybackSDKReady = initializePlayer;
			}

			return;
		}

		const script = document.createElement('script');

		script.id = 'spotify-player-sdk';
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;

		win.onSpotifyWebPlaybackSDKReady = initializePlayer;

		document.body.appendChild(script);
	}

	function initializePlayer() {
		if (player) return;

		const win = /** @type {any} */ (window);

		if (!win.Spotify) {
			errorMessage = 'Spotify player failed to load.';
			return;
		}

		player = new win.Spotify.Player({
			name: 'VYRA',

			/**
			 * @param {(accessToken:string) => void} cb
			 */
			getOAuthToken: (cb) => {
				getValidAccessToken()
					.then((accessToken) => cb(accessToken))
					.catch((error) => {
						console.error(error);
						logout();
						window.location.href = '/';
					});
			},

			volume: 0.72
		});

		player.addListener(
			'ready',

			/**
			 * @param {{device_id:string}} data
			 */
			async (data) => {
				deviceId = data.device_id;
				playerReady = true;

				try {
					const currentVolume = await player.getVolume();

					volume = Math.round(currentVolume * 100);
				} catch (error) {
					console.error(error);
				}

				startProgressTimer();
			}
		);

		player.addListener(
			'not_ready',

			/**
			 * @param {{device_id:string}} data
			 */
			(data) => {
				console.log('Spotify device offline:', data.device_id);

				playerReady = false;
			}
		);

		player.addListener(
			'player_state_changed',

			/**
			 * @param {any} state
			 */
			(state) => {
				if (!state) return;

				updatePlayerState(state);
			}
		);

		player.addListener(
			'autoplay_failed',
			() => {
				showToast(
					'Browser blocked autoplay — press play once.',
					'play'
				);
			}
		);

		player.addListener(
			'initialization_error',

			/**
			 * @param {{message:string}} data
			 */
			(data) => {
				errorMessage = `Player error: ${data.message}`;
			}
		);

		player.addListener(
			'authentication_error',

			/**
			 * @param {{message:string}} data
			 */
			(data) => {
				errorMessage = `Spotify login error: ${data.message}`;
			}
		);

		player.addListener(
			'account_error',
			() => {
				errorMessage =
					'Spotify Premium is required for playback.';
			}
		);

		player.addListener(
			'playback_error',

			/**
			 * @param {{message:string}} data
			 */
			(data) => {
				errorMessage = `Playback error: ${data.message}`;
			}
		);

		player.connect();
	}

	/**
	 * @param {any} state
	 */
	function updatePlayerState(state) {
		const nextTrack =
			state.track_window?.current_track ?? null;

		const changed =
			nextTrack?.uri &&
			nextTrack.uri !== currentTrack?.uri;

		const spotifyPosition =
			state.position ?? 0;

		const nextPlaying =
			!state.paused;

		if (changed && currentTrack?.album?.images?.[0]?.url) {
			previousArtwork =
				currentTrack.album.images[0].url;
		}

		currentTrack = nextTrack;

		duration =
			state.duration ?? 0;

		isPlaying =
			nextPlaying;

		position =
			spotifyPosition;

		smoothPosition =
			spotifyPosition;

		playbackAnchorPosition =
			spotifyPosition;

		playbackAnchorTime =
			performance.now();

		if (changed) {
			artworkChanging = true;

			setTimeout(() => {
				artworkChanging = false;
			}, 500);

			lyricsTrackUri = '';
			syncedLyrics = [];
			plainLyrics = [];

			activeLyricIndex = -1;
			lyricsError = '';

			loadSavedLyricOffset();

			recordHistory(nextTrack);

			tracksPlayed += 1;
			saveStats();

			updateAccentFromArtwork();

			setTimeout(() => {
				loadLyrics();
			}, 100);
		}

		updateActiveLyric(smoothPosition);
		syncPlaybackAnimation();

		if (changed && autoOpenLyrics) {
			lyricsOpen = true;
		}

		updateMediaSession();
	}

	function getInterpolatedPosition() {
		if (!isPlaying) {
			return playbackAnchorPosition;
		}

		const elapsed =
			performance.now() -
			playbackAnchorTime;

		return Math.min(
			duration || Infinity,
			playbackAnchorPosition + elapsed
		);
	}

	function startProgressTimer() {
		if (progressTimer) {
			clearInterval(progressTimer);
		}

		syncPlaybackAnimation();

		progressTimer = setInterval(
			async () => {
				if (!player || !playerReady) {
					return;
				}

				try {
					const state =
						await player.getCurrentState();

					if (!state) return;

					const actual =
						state.position ?? 0;

					const estimated =
						getInterpolatedPosition();

					const drift = Math.abs(actual - estimated);
					const playbackMismatch = state.paused === isPlaying;

					if (playbackMismatch || drift > 300) {
						updatePlayerState(state);
					} else {
						duration = state.duration ?? duration;
						isPlaying = !state.paused;

						// Keep the high-resolution playback anchor tight for timestamped lyrics
						// without publishing another whole-app state update.
						if (drift > 60) {
							playbackAnchorPosition = actual;
							playbackAnchorTime = performance.now();
						}
					}
				} catch (error) {
					console.error(error);
				}
			},
			750
		);
	}

	function stopPlaybackAnimation() {
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
	}

	function syncPlaybackAnimation() {
		if (!isPlaying || document.hidden) {
			stopPlaybackAnimation();
			smoothPosition = playbackAnchorPosition;
			position = playbackAnchorPosition;
			return;
		}

		if (animationFrame === null) {
			startPlaybackAnimation();
		}
	}

	function startPlaybackAnimation() {
		stopPlaybackAnimation();
		lastUiFrame = 0;

		/** @param {number} now */
		const tick = (now) => {
			if (!isPlaying || document.hidden) {
				animationFrame = null;
				return;
			}

			const precisePosition = getInterpolatedPosition();

			if (now - lastUiFrame >= UI_FRAME_MS) {
				smoothPosition = precisePosition;
				position = precisePosition;
				updateActiveLyric(precisePosition);
				trackListeningStats();
				lastUiFrame = now;
			}

			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);
	}

	/* ============================================================
	   MEDIA SESSION
	   ============================================================ */

	function setupMediaSession() {
		if (!('mediaSession' in navigator)) return;

		const mediaSession = navigator.mediaSession;

		/** @param {MediaSessionAction} action @param {MediaSessionActionHandler | null} handler */
		const safeHandler = (action, handler) => {
			try {
				mediaSession.setActionHandler(action, handler);
			} catch {
				// Browser does not support this Media Session action.
			}
		};

		safeHandler('play', () => {
			if (!isPlaying) togglePlayback();
		});
		safeHandler('pause', () => {
			if (isPlaying) togglePlayback();
		});
		safeHandler('previoustrack', () => previousTrack());
		safeHandler('nexttrack', () => nextTrack());
		safeHandler('seekbackward', (details) => {
			const amount = details.seekOffset ?? 10;
			seekToPosition(Math.max(0, smoothPosition - amount * 1000));
		});
		safeHandler('seekforward', (details) => {
			const amount = details.seekOffset ?? 10;
			seekToPosition(Math.min(duration, smoothPosition + amount * 1000));
		});
		safeHandler('seekto', (details) => {
			if (details.seekTime == null) return;
			seekToPosition(details.seekTime * 1000);
		});
	}

	function updateMediaSession() {
		if (!('mediaSession' in navigator) || !currentTrack) return;

		try {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentTrack.name ?? 'Unknown Track',
				artist:
					currentTrack.artists
						?.map(
							/** @param {any} artist */
							(artist) => artist.name
						)
						.join(', ') ?? '',
				album: currentTrack.album?.name ?? '',
				artwork:
					currentTrack.album?.images
						?.filter(
							/** @param {any} image */
							(image) => Boolean(image?.url)
						)
						.map(
							/** @param {any} image */
							(image) => ({ src: image.url })) ?? []
			});

			navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
			updateMediaPositionState();
		} catch (error) {
			console.debug('Media Session metadata unavailable:', error);
		}
	}

	function updateMediaPositionState() {
		if (!('mediaSession' in navigator) || !duration) return;

		try {
			navigator.mediaSession.setPositionState({
				duration: Math.max(0.001, duration / 1000),
				playbackRate: 1,
				position: Math.min(duration, Math.max(0, smoothPosition)) / 1000
			});
		} catch {
			// setPositionState is optional in some browsers.
		}
	}

	/**
	 * @param {number} target
	 */
	async function seekToPosition(target) {
		if (!player) return;

		const safeTarget = Math.max(0, Math.min(duration || target, target));

		position = safeTarget;
		smoothPosition = safeTarget;
		playbackAnchorPosition = safeTarget;
		playbackAnchorTime = performance.now();

		await player.seek(safeTarget);
		updateActiveLyric(safeTarget);
		updateMediaPositionState();
	}

	/* ============================================================
	   API
	   ============================================================ */

	/**
	 * @param {string} path
	 * @param {RequestInit} [options]
	 * @param {boolean} [retry]
	 * @param {boolean} [refreshed]
	 */
	async function spotifyFetch(
		path,
		options = {},
		retry = true,
		refreshed = false
	) {
		const accessToken =
			await getValidAccessToken();

		const headers =
			new Headers(options.headers ?? {});

		headers.set(
			'Authorization',
			`Bearer ${accessToken}`
		);

		if (
			options.body &&
			!headers.has('Content-Type')
		) {
			headers.set(
				'Content-Type',
				'application/json'
			);
		}

		const response = await fetch(
			`https://api.spotify.com/v1${path}`,
			{
				...options,
				headers
			}
		);

		if (
			response.status === 401 &&
			!refreshed
		) {
			try {
				await getValidAccessToken(true);

				return spotifyFetch(
					path,
					options,
					retry,
					true
				);
			} catch (error) {
				console.error(error);
				logout();
				window.location.href = '/';

				throw new Error(
					'Spotify session expired.'
				);
			}
		}

		if (
			response.status === 429 &&
			retry
		) {
			const retryAfter =
				Math.max(
					1,
					Number(
						response.headers.get(
							'Retry-After'
						) ?? '1'
					)
				);

			showToast(
				`Spotify rate limit — retrying in ${retryAfter}s`,
				'warning'
			);

			await sleep(
				retryAfter * 1000
			);

			return spotifyFetch(
				path,
				options,
				false,
				refreshed
			);
		}

		if (
			response.status === 204 ||
			response.status === 205
		) {
			return null;
		}

		let data = null;

		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok) {
			throw new Error(
				data?.error?.message ??
					data?.error_description ??
					`Spotify request failed (${response.status})`
			);
		}

		return data;
	}

	/**
	 * Cache read-only Spotify responses for a short period.
	 * @param {string} path
	 * @param {number} [maxAge]
	 */
	async function cachedSpotifyFetch(path, maxAge = CACHE_TTL_MS) {
		const cached = spotifyCache.get(path);

		if (cached && Date.now() - cached.time < maxAge) {
			return cached.data;
		}

		const data = await spotifyFetch(path);
		spotifyCache.set(path, { time: Date.now(), data });
		return data;
	}

	/**
	 * @param {number} ms
	 */
	function sleep(ms) {
		return new Promise(
			(resolve) =>
				setTimeout(resolve, ms)
		);
	}

	/* ============================================================
	   SEARCH
	   ============================================================ */

	/** @param {boolean} [syncUrl] */
	async function searchSpotify(syncUrl = true) {
		const query = search.trim();

		if (!query) return;

		loading = true;
		errorMessage = '';

		previousView = currentView;
		currentView = 'search';

		if (syncUrl) updateViewUrl('search');

		tracks = [];
		albums = [];
		artists = [];
		playlists = [];

		activeTab = 'all';

		suggestionsOpen = false;

		saveRecentSearch(query);

		try {
			const cacheKey = `search:${query.toLowerCase()}`;
			const cached = searchCache.get(cacheKey);
			let data;

			if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
				data = cached.data;
			} else {
				searchController?.abort();
				searchController = new AbortController();

				data = await spotifyFetch(
					`/search?q=${encodeURIComponent(
						query
					)}&type=track,album,artist,playlist&limit=10`,
					{ signal: searchController.signal }
				);

				searchCache.set(cacheKey, { time: Date.now(), data });
			}

			tracks =
				data?.tracks?.items?.filter(
					Boolean
				) ?? [];

			albums =
				data?.albums?.items?.filter(
					Boolean
				) ?? [];

			artists =
				data?.artists?.items?.filter(
					Boolean
				) ?? [];

			playlists =
				data?.playlists?.items?.filter(
					Boolean
				) ?? [];
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				handleError(error, 'Search failed.');
			}
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {Event} event
	 */
	function handleSearchInput(event) {
		const input =
			/** @type {HTMLInputElement} */ (
				event.currentTarget
			);

		search =
			input.value;

		if (suggestionTimer) {
			clearTimeout(
				suggestionTimer
			);
		}

		if (search.trim().length < 2) {
			suggestions = [];
			suggestionsOpen = false;

			return;
		}

		suggestionTimer =
			setTimeout(
				() =>
					loadSuggestions(
						search.trim()
					),
				280
			);
	}

	/**
	 * @param {string} query
	 */
	async function loadSuggestions(query) {
		suggestionsLoading = true;
		suggestionsOpen = true;

		try {
			const data =
				await spotifyFetch(
					`/search?q=${encodeURIComponent(
						query
					)}&type=track,artist,album&limit=5`
				);

			suggestions = [
				...(data?.tracks?.items ?? [])
					.filter(Boolean)
					.slice(0, 3)
					.map(
						/**
						 * @param {any} item
						 */
						(item) => ({
							type: 'track',
							item
						})
					),

				...(data?.artists?.items ?? [])
					.filter(Boolean)
					.slice(0, 2)
					.map(
						/**
						 * @param {any} item
						 */
						(item) => ({
							type: 'artist',
							item
						})
					),

				...(data?.albums?.items ?? [])
					.filter(Boolean)
					.slice(0, 2)
					.map(
						/**
						 * @param {any} item
						 */
						(item) => ({
							type: 'album',
							item
						})
					)
			];
		} catch (error) {
			console.error(error);
		} finally {
			suggestionsLoading = false;
		}
	}

	/**
	 * @param {any} suggestion
	 */
	function selectSuggestion(suggestion) {
		suggestionsOpen = false;

		if (suggestion.type === 'track') {
			search =
				suggestion.item.name;

			tracks = [
				suggestion.item
			];

			albums = [];
			artists = [];
			playlists = [];

			currentView = 'search';

			return;
		}

		if (suggestion.type === 'artist') {
			openArtist(
				suggestion.item
			);

			return;
		}

		if (suggestion.type === 'album') {
			openAlbum(
				suggestion.item
			);
		}
	}

	/**
	 * @param {string} value
	 */
	function quickSearch(value) {
		search = value;

		searchSpotify();
	}

	function loadRecentSearches() {
		try {
			const stored =
				JSON.parse(
					localStorage.getItem(
						'vyra_recent_searches'
					) ?? '[]'
				);

			recentSearches =
				Array.isArray(stored)
					? stored.slice(0, 8)
					: [];
		} catch {
			recentSearches = [];
		}
	}

	/**
	 * @param {string} value
	 */
	function saveRecentSearch(value) {
		recentSearches = [
			value,

			...recentSearches.filter(
				/**
				 * @param {string} item
				 */
				(item) =>
					item.toLowerCase() !==
					value.toLowerCase()
			)
		].slice(0, 8);

		localStorage.setItem(
			'vyra_recent_searches',
			JSON.stringify(
				recentSearches
			)
		);
	}

	function clearRecentSearches() {
		recentSearches = [];

		localStorage.removeItem(
			'vyra_recent_searches'
		);
	}

	/* ============================================================
	   LIKES / LIBRARY
	   ============================================================ */

	function loadLikedSongs() {
		try {
			const stored = JSON.parse(
				localStorage.getItem('vyra_liked_songs') ?? '[]'
			);

			likedSongs = Array.isArray(stored) ? stored : [];
		} catch {
			likedSongs = [];
		}
	}

	function saveLikedSongs() {
		localStorage.setItem(
			'vyra_liked_songs',
			JSON.stringify(likedSongs)
		);
	}

	function loadLibrary() {
		try {
			const cachedAlbums = JSON.parse(
				localStorage.getItem('vyra_saved_albums') ?? '[]'
			);
			const cachedArtists = JSON.parse(
				localStorage.getItem('vyra_saved_artists') ?? '[]'
			);
			const cachedPlaylists = JSON.parse(
				localStorage.getItem('vyra_spotify_playlists') ?? '[]'
			);

			savedAlbums = Array.isArray(cachedAlbums) ? cachedAlbums : [];
			savedArtists = Array.isArray(cachedArtists) ? cachedArtists : [];
			spotifyPlaylists = Array.isArray(cachedPlaylists)
				? cachedPlaylists
				: [];
		} catch {
			savedAlbums = [];
			savedArtists = [];
			spotifyPlaylists = [];
		}
	}

	/**
	 * @param {string} firstPath
	 * @param {(data:any) => {items:any[], next:string | null}} getPage
	 * @param {number} [maxPages]
	 */
	async function fetchAllSpotifyPages(firstPath, getPage, maxPages = 20) {
		/** @type {any[]} */
		const collected = [];
		let nextPath = firstPath;
		let page = 0;

		while (nextPath && page < maxPages) {
			const data = await spotifyFetch(nextPath);
			const parsed = getPage(data);

			collected.push(...parsed.items.filter(Boolean));
			page += 1;

			if (!parsed.next) break;

			const nextUrl = new URL(parsed.next);
			nextPath = `${nextUrl.pathname.replace('/v1', '')}${nextUrl.search}`;
		}

		return collected;
	}

	async function hydrateSpotifyData() {
		libraryLoading = true;

		try {
			const [trackResult, albumResult, artistResult, playlistResult, recentResult] =
				await Promise.allSettled([
					fetchAllSpotifyPages(
						'/me/tracks?limit=50',
						(data) => ({
							items: data?.items ?? [],
							next: data?.next ?? null
						})
					),
					fetchAllSpotifyPages(
						'/me/albums?limit=50',
						(data) => ({
							items: data?.items ?? [],
							next: data?.next ?? null
						})
					),
					fetchAllSpotifyPages(
						'/me/following?type=artist&limit=50',
						(data) => ({
							items: data?.artists?.items ?? [],
							next: data?.artists?.next ?? null
						}),
						10
					),
					fetchAllSpotifyPages(
						'/me/playlists?limit=50',
						(data) => ({
							items: data?.items ?? [],
							next: data?.next ?? null
						}),
						10
					),
					spotifyFetch('/me/player/recently-played?limit=50')
				]);

			if (trackResult.status === 'fulfilled') {
				likedSongs = trackResult.value
					.map(
						/** @param {any} item */
						(item) => item?.track
					)
					.filter(Boolean)
					.map(
						/** @param {any} track */
						(track) => cleanTrack(track)
					);

				saveLikedSongs();
			}

			if (albumResult.status === 'fulfilled') {
				savedAlbums = albumResult.value
					.map(
						/** @param {any} item */
						(item) => item?.album
					)
					.filter(Boolean);

				localStorage.setItem(
					'vyra_saved_albums',
					JSON.stringify(savedAlbums)
				);
			}

			if (artistResult.status === 'fulfilled') {
				savedArtists = artistResult.value.filter(Boolean);

				localStorage.setItem(
					'vyra_saved_artists',
					JSON.stringify(savedArtists)
				);
			}

			if (playlistResult.status === 'fulfilled') {
				spotifyPlaylists = playlistResult.value.filter(Boolean);

				localStorage.setItem(
					'vyra_spotify_playlists',
					JSON.stringify(spotifyPlaylists)
				);
			}

			if (recentResult.status === 'fulfilled') {
				mergeSpotifyHistory(recentResult.value?.items ?? []);
			}

			spotifyLibraryReady = true;
		} catch (error) {
			console.error('Spotify library sync failed:', error);
		} finally {
			libraryLoading = false;
		}
	}

	/**
	 * @param {any[]} recentItems
	 */
	function mergeSpotifyHistory(recentItems) {
		const spotifyHistory = recentItems
			.map(
				/** @param {any} item */
				(item) => {
					const track = item?.track;

					if (!track?.uri) return null;

					return {
						uri: track.uri,
						name: track.name,
						artist:
							track.artists
								?.map(
									/** @param {any} artist */
									(artist) => artist.name
								)
								.join(', ') ?? '',
						album: track.album?.name ?? '',
						image: track.album?.images?.[0]?.url ?? '',
						playedAt: Date.parse(item.played_at) || Date.now()
					};
				}
			)
			.filter(Boolean);

		const deduped = new Map();

		for (const item of [...spotifyHistory, ...listeningHistory]) {
			if (!item) continue;

			const key = `${item.uri}:${Math.floor(item.playedAt / 1000)}`;
			deduped.set(key, item);
		}

		listeningHistory = [...deduped.values()]
			.sort((a, b) => b.playedAt - a.playedAt)
			.slice(0, 300);

		localStorage.setItem('vyra_history', JSON.stringify(listeningHistory));
		calculateStreak();
	}

	/**
	 * @param {any} track
	 */
	function isLiked(track) {
		if (!track?.uri) return false;

		return likedSongs.some(
			/** @param {any} item */
			(item) => item.uri === track.uri
		);
	}

	/**
	 * @param {any} track
	 */
	async function toggleLike(track) {
		if (!track?.uri) return;

		const wasLiked = isLiked(track);
		const snapshot = [...likedSongs];

		likedSongs = wasLiked
			? likedSongs.filter(
					/** @param {any} item */
					(item) => item.uri !== track.uri
				)
			: [cleanTrack(track), ...likedSongs];

		saveLikedSongs();

		try {
			await spotifyFetch(
				`/me/library?uris=${encodeURIComponent(track.uri)}`,
				{ method: wasLiked ? 'DELETE' : 'PUT' }
			);

			showToast(
				wasLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
				'heart',
				'Undo',
				() => toggleLike(track)
			);
		} catch (error) {
			likedSongs = snapshot;
			saveLikedSongs();
			handleError(error, 'Could not update Spotify library.');
		}
	}

	/**
	 * @param {any} track
	 */
	function cleanTrack(track) {
		return {
			id: track.id,
			uri: track.uri,
			name: track.name,
			duration_ms: track.duration_ms ?? duration,
			artists: track.artists ?? [],
			album: track.album ?? null,
			external_urls: track.external_urls ?? {}
		};
	}

	/**
	 * @param {any} album
	 */
	async function toggleSaveAlbum(album) {
		if (!album?.uri) return;

		const exists = savedAlbums.some(
			/** @param {any} item */
			(item) => item.id === album.id
		);
		const snapshot = [...savedAlbums];

		savedAlbums = exists
			? savedAlbums.filter(
					/** @param {any} item */
					(item) => item.id !== album.id
				)
			: [album, ...savedAlbums];

		try {
			await spotifyFetch(
				`/me/library?uris=${encodeURIComponent(album.uri)}`,
				{ method: exists ? 'DELETE' : 'PUT' }
			);

			localStorage.setItem('vyra_saved_albums', JSON.stringify(savedAlbums));
			showToast(exists ? 'Album removed from library' : 'Album saved', 'library');
		} catch (error) {
			savedAlbums = snapshot;
			handleError(error, 'Could not update saved album.');
		}
	}

	/**
	 * @param {any} artist
	 */
	async function toggleSaveArtist(artist) {
		if (!artist?.uri) return;

		const exists = savedArtists.some(
			/** @param {any} item */
			(item) => item.id === artist.id
		);
		const snapshot = [...savedArtists];

		savedArtists = exists
			? savedArtists.filter(
					/** @param {any} item */
					(item) => item.id !== artist.id
				)
			: [artist, ...savedArtists];

		try {
			await spotifyFetch(
				`/me/library?uris=${encodeURIComponent(artist.uri)}`,
				{ method: exists ? 'DELETE' : 'PUT' }
			);

			localStorage.setItem('vyra_saved_artists', JSON.stringify(savedArtists));
			showToast(exists ? 'Artist removed from library' : 'Artist saved', 'library');
		} catch (error) {
			savedArtists = snapshot;
			handleError(error, 'Could not update saved artist.');
		}
	}

	function getRecentlyPlayedSmartPlaylist() {
		const seen = new Set();

		return listeningHistory
			.filter((item) => {
				if (!item?.uri || seen.has(item.uri)) return false;
				seen.add(item.uri);
				return true;
			})
			.slice(0, 40)
			.map(historyItemToTrack);
	}

	function getOnRepeatSmartPlaylist() {
		const counts = new Map();
		const firstByUri = new Map();

		for (const item of listeningHistory) {
			if (!item?.uri) continue;
			counts.set(item.uri, (counts.get(item.uri) ?? 0) + 1);
			if (!firstByUri.has(item.uri)) firstByUri.set(item.uri, item);
		}

		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 40)
			.map(([uri]) => historyItemToTrack(firstByUri.get(uri)));
	}

	function getForgottenFavoritesSmartPlaylist() {
		const recentUris = new Set(
			listeningHistory.slice(0, 80).map((item) => item.uri)
		);

		return likedSongs
			.filter(
				/** @param {any} track */
				(track) => !recentUris.has(track.uri)
			)
			.slice(0, 40);
	}

	/**
	 * @param {HistoryItem | undefined} item
	 */
	function historyItemToTrack(item) {
		if (!item) return null;

		return {
			uri: item.uri,
			name: item.name,
			duration_ms: 0,
			artists: [{ name: item.artist }],
			album: {
				name: item.album,
				images: item.image ? [{ url: item.image }] : []
			}
		};
	}

	/**
	 * @param {any[]} items
	 */
	async function playSmartPlaylist(items) {
		const uris = items
			.filter(
				/** @param {any} item */
				(item) => Boolean(item?.uri)
			)
			.map(
				/** @param {any} item */
				(item) => item.uri
			);

		if (!uris.length) {
			showToast('Nothing to play yet', 'playlist');
			return;
		}

		await startPlayback({ uris });
	}

	/* ============================================================
	   CUSTOM PLAYLISTS
	   ============================================================ */

	function loadCustomPlaylists() {
		try {
			const stored =
				JSON.parse(
					localStorage.getItem(
						'vyra_playlists'
					) ?? '[]'
				);

			customPlaylists =
				Array.isArray(stored)
					? stored
					: [];
		} catch {
			customPlaylists = [];
		}
	}

	function saveCustomPlaylists() {
		localStorage.setItem(
			'vyra_playlists',
			JSON.stringify(
				customPlaylists
			)
		);
	}

	function createPlaylist() {
		const name =
			playlistNameDraft.trim();

		if (!name) {
			return;
		}

		/** @type {VyraPlaylist} */
		const playlist = {
			id:
				crypto.randomUUID(),
			name,
			description:
				playlistDescriptionDraft.trim(),
			createdAt:
				Date.now(),
			tracks: []
		};

		customPlaylists = [
			playlist,
			...customPlaylists
		];

		saveCustomPlaylists();

		playlistModalOpen = false;
		playlistNameDraft = '';
		playlistDescriptionDraft = '';

		showToast(
			`Created ${playlist.name}`,
			'playlist'
		);
	}

	/**
	 * @param {VyraPlaylist} playlist
	 * @param {boolean} [syncUrl]
	 */
	function openCustomPlaylist(playlist, syncUrl = true) {
		selectedCustomPlaylist =
			playlist;

		previousView =
			currentView;

		currentView =
			'custom-playlist';

		if (syncUrl) updateViewUrl('custom-playlist', playlist.id);
	}

	/**
	 * @param {VyraPlaylist} playlist
	 */
	function deleteCustomPlaylist(playlist) {
		const previous = [...customPlaylists];
		customPlaylists =
			customPlaylists.filter(
				(item) =>
					item.id !== playlist.id
			);

		saveCustomPlaylists();

		if (
			selectedCustomPlaylist?.id ===
			playlist.id
		) {
			selectedCustomPlaylist = null;
			currentView = 'library';
		}

		showToast(
			'Playlist deleted',
			'trash',
			'Undo',
			() => { customPlaylists = previous; saveCustomPlaylists(); }
		);
	}

	/**
	 * @param {any} track
	 */
	function openAddToPlaylist(track) {
		addToPlaylistTrack =
			track;

		addToPlaylistOpen =
			true;
	}

	/**
	 * @param {VyraPlaylist} playlist
	 */
	function addTrackToCustomPlaylist(playlist) {
		if (!addToPlaylistTrack) {
			return;
		}

		const existing =
			playlist.tracks.some(
				/**
				 * @param {any} item
				 */
				(item) =>
					item.uri ===
					addToPlaylistTrack.uri
			);

		if (existing) {
			showToast(
				'Already in playlist',
				'playlist'
			);

			return;
		}

		customPlaylists =
			customPlaylists.map(
				(item) =>
					item.id === playlist.id
						? {
								...item,

								tracks: [
									...item.tracks,
									cleanTrack(
										addToPlaylistTrack
									)
								]
							}
						: item
			);

		saveCustomPlaylists();

		addToPlaylistOpen =
			false;

		showToast(
			`Added to ${playlist.name}`,
			'playlist'
		);
	}

	/**
	 * @param {VyraPlaylist} playlist
	 * @param {any} track
	 */
	function removeFromCustomPlaylist(
		playlist,
		track
	) {
		customPlaylists =
			customPlaylists.map(
				(item) =>
					item.id === playlist.id
						? {
								...item,

								tracks:
									item.tracks.filter(
										/**
										 * @param {any} savedTrack
										 */
										(savedTrack) =>
											savedTrack.uri !==
											track.uri
									)
							}
						: item
			);

		saveCustomPlaylists();

		selectedCustomPlaylist =
			customPlaylists.find(
				(item) =>
					item.id === playlist.id
			) ?? null;
	}

	async function playSelectedCustomPlaylist() {
		const playlist = selectedCustomPlaylist;
		if (!playlist) return;
		await playSmartPlaylist(playlist.tracks);
	}

	/** @param {any} track */
	async function playSelectedCustomTrack(track) {
		const playlist = selectedCustomPlaylist;
		if (!playlist) return;
		await playTrackList(playlist.tracks, track);
	}

	/** @param {any} track */
	function removeFromSelectedCustomPlaylist(track) {
		const playlist = selectedCustomPlaylist;
		if (!playlist) return;
		removeFromCustomPlaylist(playlist, track);
	}

	/* ============================================================
	   HISTORY / STATS
	   ============================================================ */

	function loadHistory() {
		try {
			const stored =
				JSON.parse(
					localStorage.getItem(
						'vyra_history'
					) ?? '[]'
				);

			listeningHistory =
				Array.isArray(stored)
					? stored
					: [];
		} catch {
			listeningHistory = [];
		}
	}

	/**
	 * @param {any} track
	 */
	function recordHistory(track) {
		if (!track?.uri) return;

		const item = {
			uri: track.uri,
			name: track.name,
			artist:
				track.artists
					?.map(
						/**
						 * @param {any} artist
						 */
						(artist) =>
							artist.name
					)
					.join(', ') ?? '',
			album:
				track.album?.name ?? '',
			image:
				track.album?.images?.[0]
					?.url ?? '',
			playedAt:
				Date.now()
		};

		listeningHistory = [
			item,
			...listeningHistory
		].slice(0, 250);

		localStorage.setItem(
			'vyra_history',
			JSON.stringify(
				listeningHistory
			)
		);

		calculateStreak();
	}

	function loadStats() {
		listeningSeconds =
			Number(
				localStorage.getItem(
					'vyra_listening_seconds'
				) ?? '0'
			);

		tracksPlayed =
			Number(
				localStorage.getItem(
					'vyra_tracks_played'
				) ?? '0'
			);
	}

	function saveStats() {
		localStorage.setItem(
			'vyra_listening_seconds',
			String(
				Math.floor(
					listeningSeconds
				)
			)
		);

		localStorage.setItem(
			'vyra_tracks_played',
			String(
				tracksPlayed
			)
		);
	}

	function trackListeningStats() {
		if (!isPlaying) {
			lastTrackedSecond =
				Math.floor(
					smoothPosition /
						1000
				);

			return;
		}

		const second =
			Math.floor(
				smoothPosition /
					1000
			);

		if (
			second !==
				lastTrackedSecond &&
			second >= 0
		) {
			const difference =
				Math.min(
					3,
					Math.max(
						0,
						second -
							lastTrackedSecond
					)
				);

			if (lastTrackedSecond > 0) {
				listeningSeconds += difference;

				const now = Date.now();
				if (now - lastStatsSaveAt >= 15000) {
					saveStats();
					lastStatsSaveAt = now;
				}
			}

			const now = Date.now();
			if (now - lastMediaPositionUpdateAt >= 3000) {
				updateMediaPositionState();
				lastMediaPositionUpdateAt = now;
			}

			lastTrackedSecond =
				second;
		}
	}

	function calculateStreak() {
		const days =
			new Set(
				listeningHistory.map(
					(item) =>
						new Date(
							item.playedAt
						).toDateString()
				)
			);

		let streak = 0;

		const date =
			new Date();

		while (
			days.has(
				date.toDateString()
			)
		) {
			streak += 1;

			date.setDate(
				date.getDate() -
					1
			);
		}

		streakDays =
			streak;
	}

	function formatListeningTime() {
		const hours =
			Math.floor(
				listeningSeconds /
					3600
			);

		const minutes =
			Math.floor(
				(listeningSeconds %
					3600) /
					60
			);

		if (hours) {
			return `${hours}h ${minutes}m`;
		}

		return `${minutes}m`;
	}

	/* ============================================================
	   LYRICS
	   ============================================================ */

	async function openLyrics() {
		if (!currentTrack) {
			showToast(
				'Play a song first',
				'lyrics'
			);

			return;
		}

		queueOpen = false;
		lyricsOpen = true;

		await loadLyrics();
	}

	/**
	 * Fetch LRCLIB with a short retry for temporary server/rate-limit errors.
	 * 404 is a normal "no exact match" result and is returned as null.
	 *
	 * @param {string} url
	 * @param {AbortSignal} signal
	 * @param {number} [attempt]
	 * @returns {Promise<any | null>}
	 */
	async function fetchLyricsJson(url, signal, attempt = 0) {
		const response = await fetch(url, {
			signal,
			headers: {
				'Lrclib-Client': 'VYRA Music/1.0'
			}
		});

		if (response.status === 404) {
			return null;
		}

		if (
			[429, 502, 503, 504].includes(response.status) &&
			attempt < 2
		) {
			const retryAfter = Number(response.headers.get('Retry-After') ?? '1');
			const delay = Math.min(3000, Math.max(500, retryAfter * 1000));

			await sleep(delay);
			return fetchLyricsJson(url, signal, attempt + 1);
		}

		if (!response.ok) {
			throw new Error(`Lyrics request failed (${response.status})`);
		}

		return response.json();
	}

	/**
	 * @param {string} value
	 */
	function normalizeLyricText(value) {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	/**
	 * @param {any[]} results
	 * @param {string} trackName
	 * @param {string} artistName
	 * @param {number} durationSeconds
	 */
	function chooseLyricsSearchResult(results, trackName, artistName, durationSeconds) {
		if (!Array.isArray(results) || !results.length) return null;

		const wantedTrack = normalizeLyricText(trackName);
		const wantedArtist = normalizeLyricText(artistName);

		const ranked = results
			.map((item) => {
				const itemTrack = normalizeLyricText(item?.trackName ?? item?.name ?? '');
				const itemArtist = normalizeLyricText(item?.artistName ?? '');
				const itemDuration = Number(item?.duration ?? 0);
				let score = 0;

				if (itemTrack === wantedTrack) score += 100;
				else if (itemTrack.includes(wantedTrack) || wantedTrack.includes(itemTrack)) score += 45;

				if (itemArtist === wantedArtist) score += 70;
				else if (itemArtist.includes(wantedArtist) || wantedArtist.includes(itemArtist)) score += 30;

				if (itemDuration && durationSeconds) {
					const difference = Math.abs(itemDuration - durationSeconds);
					if (difference <= 2) score += 45;
					else if (difference <= 5) score += 25;
					else if (difference <= 10) score += 8;
				}

				return { item, score };
			})
			.sort((a, b) => b.score - a.score);

		return ranked[0]?.score >= 70 ? ranked[0].item : null;
	}

	async function loadLyrics() {
		if (!currentTrack) return;

		if (
			lyricsTrackUri === currentTrack.uri &&
			(syncedLyrics.length || plainLyrics.length)
		) {
			return;
		}

		const requestedTrackUri = currentTrack.uri;
		const requestedTrackName = currentTrack.name;
		const artistName = currentTrack.artists?.[0]?.name ?? '';
		const albumName = currentTrack.album?.name ?? '';
		const durationSeconds = Math.max(
			1,
			Math.round((currentTrack.duration_ms ?? duration) / 1000)
		);

		lyricsController?.abort();
		lyricsController = new AbortController();
		const { signal } = lyricsController;

		lyricsLoading = true;
		lyricsError = '';

		try {
			const exactParams = new URLSearchParams({
				track_name: requestedTrackName,
				artist_name: artistName,
				album_name: albumName,
				duration: String(durationSeconds)
			});

			let data = await fetchLyricsJson(
				`https://lrclib.net/api/get?${exactParams.toString()}`,
				signal
			);

			// Exact matching can legitimately 404 for alternate releases.
			// Fall back to LRCLIB search and choose the closest safe match.
			if (!data) {
				const searchParams = new URLSearchParams({
					track_name: requestedTrackName,
					artist_name: artistName
				});

				const results = await fetchLyricsJson(
					`https://lrclib.net/api/search?${searchParams.toString()}`,
					signal
				);

				data = chooseLyricsSearchResult(
					Array.isArray(results) ? results : [],
					requestedTrackName,
					artistName,
					durationSeconds
				);
			}

			if (signal.aborted || currentTrack?.uri !== requestedTrackUri) {
				return;
			}

			if (!data) {
				lyricsTrackUri = requestedTrackUri;
				lyricsSynced = false;
				syncedLyrics = [];
				plainLyrics = [];
				lyricsError = 'Lyrics are not available for this version of the song.';
				return;
			}

			if (data.instrumental) {
				plainLyrics = ['Instrumental'];
				syncedLyrics = [];
				lyricsSynced = false;
				lyricsTrackUri = requestedTrackUri;
				return;
			}

			if (data.syncedLyrics?.trim()) {
				syncedLyrics = parseSyncedLyrics(data.syncedLyrics);
				plainLyrics = syncedLyrics.map(
					/** @param {SyncedLyricLine} line */
					(line) => line.text
				);
				lyricsSynced = syncedLyrics.length > 0;
			} else if (data.plainLyrics?.trim()) {
				plainLyrics = data.plainLyrics
					.split('\n')
					.map(
						/** @param {string} line */
						(line) => line.trim()
					);
				syncedLyrics = [];
				lyricsSynced = false;
			} else {
				lyricsSynced = false;
				syncedLyrics = [];
				plainLyrics = [];
				lyricsError = 'Lyrics are not available for this version of the song.';
			}

			lyricsTrackUri = requestedTrackUri;
			updateActiveLyric(smoothPosition);
		} catch (error) {
			if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
				return;
			}

			console.warn('LRCLIB temporarily unavailable:', error);

			if (currentTrack?.uri === requestedTrackUri) {
				lyricsError = 'Lyrics are temporarily unavailable. Try again in a moment.';
				syncedLyrics = [];
				plainLyrics = [];
			}
		} finally {
			if (currentTrack?.uri === requestedTrackUri) {
				lyricsLoading = false;
			}
		}
	}

	/**
	 * @param {string} raw
	 * @returns {SyncedLyricLine[]}
	 */
	function parseSyncedLyrics(raw) {
		const parsed = [];

		for (
			const line of raw.split(
				'\n'
			)
		) {
			const match =
				line.match(
					/^\[(\d+):(\d+(?:\.\d+)?)\]\s?(.*)$/
				);

			if (!match) continue;

			const minutes =
				Number(match[1]);

			const seconds =
				Number(match[2]);

			const text =
				match[3]?.trim() ??
				'';

			parsed.push({
				time:
					(minutes * 60 +
						seconds) *
					1000,

				text
			});
		}

		return parsed;
	}

	/**
	 * @param {number} currentPosition
	 */
	function updateActiveLyric(currentPosition = smoothPosition) {
		if (!syncedLyrics.length) {
			activeLyricIndex = -1;
			return;
		}

		const lyricPosition = currentPosition - lyricOffset;
		const nextIndex = findActiveLyricIndex(syncedLyrics, lyricPosition);
		if (nextIndex !== activeLyricIndex) activeLyricIndex = nextIndex;
	}

	function getCurrentLyricProgress() {
		return getLyricLineProgress(
			syncedLyrics,
			activeLyricIndex,
			smoothPosition - lyricOffset
		);
	}

	function getLyricOffsetKey() {
		if (!currentTrack?.uri) {
			return '';
		}

		return `vyra_lyric_offset_${currentTrack.uri}`;
	}

	function loadSavedLyricOffset() {
		const key =
			getLyricOffsetKey();

		if (!key) {
			lyricOffset = 0;
			return;
		}

		lyricOffset =
			Number(
				localStorage.getItem(
					key
				) ?? '0'
			);
	}

	function saveLyricOffset() {
		const key =
			getLyricOffsetKey();

		if (!key) return;

		localStorage.setItem(
			key,
			String(lyricOffset)
		);
	}

	/**
	 * @param {number} amount
	 */
	function adjustLyricOffset(amount) {
		lyricOffset =
			Math.max(
				-3000,
				Math.min(
					3000,
					lyricOffset +
						amount
				)
			);

		saveLyricOffset();

		lyricOffsetFlash = true;

		if (lyricOffsetFlashTimer) {
			clearTimeout(
				lyricOffsetFlashTimer
			);
		}

		lyricOffsetFlashTimer =
			setTimeout(
				() => {
					lyricOffsetFlash =
						false;
				},
				800
			);
	}

	function resetLyricOffset() {
		lyricOffset = 0;

		saveLyricOffset();

		showToast(
			'Lyric timing reset',
			'lyrics'
		);
	}

	/**
	 * @param {number} lyricTime
	 */
	async function seekToLyric(
		lyricTime
	) {
		if (!player) return;

		const target =
			Math.max(
				0,
				lyricTime +
					lyricOffset
			);

		position = target;
		smoothPosition = target;

		playbackAnchorPosition =
			target;

		playbackAnchorTime =
			performance.now();

		try {
			await player.seek(
				target
			);

			updateActiveLyric(
				target
			);
		} catch (error) {
			console.error(error);
		}
	}

	/* ============================================================
	   URL / BROWSER NAVIGATION
	   ============================================================ */

	/**
	 * @param {string} view
	 * @param {string} [id]
	 * @param {boolean} [replace]
	 */
	function updateViewUrl(view, id = '', replace = false) {
		const url = new URL(window.location.href);

		if (view === 'home') {
			url.searchParams.delete('view');
			url.searchParams.delete('id');
			url.searchParams.delete('q');
		} else {
			url.searchParams.set('view', view);

			if (id) url.searchParams.set('id', id);
			else url.searchParams.delete('id');

			if (view === 'search' && search.trim()) {
				url.searchParams.set('q', search.trim());
			} else if (view !== 'search') {
				url.searchParams.delete('q');
			}
		}

		const currentDepth = Number(window.history.state?.vyraDepth ?? 0);
		const state = {
			vyra: true,
			vyraDepth: replace ? currentDepth : currentDepth + 1,
			view,
			id
		};

		if (replace) {
			window.history.replaceState(state, '', url);
		} else {
			window.history.pushState(state, '', url);
		}
	}

	/**
	 * @param {boolean} [replaceState]
	 */
	async function restoreViewFromUrl(replaceState = true) {
		const params = new URLSearchParams(window.location.search);
		const view = params.get('view') ?? 'home';
		const id = params.get('id') ?? '';
		const query = params.get('q') ?? '';

		if (replaceState) {
			window.history.replaceState({ vyra: true, vyraDepth: 0, view, id }, '', window.location.href);
		}

		try {
			if (view === 'album' && id) {
				await openAlbum({ id }, false);
				return;
			}

			if (view === 'artist' && id) {
				const artist = await spotifyFetch(`/artists/${id}`);
				await openArtist(artist, false);
				return;
			}

			if (view === 'playlist' && id) {
				await openPlaylist({ id }, false);
				return;
			}

			if (view === 'custom-playlist' && id) {
				const playlist = customPlaylists.find((item) => item.id === id);

				if (playlist) {
					openCustomPlaylist(playlist, false);
					return;
				}
			}

			if (view === 'search') {
				search = query;
				currentView = 'search';

				if (query) await searchSpotify(false);
				return;
			}

			if (['liked', 'library', 'history', 'stats', 'settings', 'memory', 'tools'].includes(view)) {
				currentView = view;
				return;
			}

			currentView = 'home';
		} catch (error) {
			console.error('Could not restore VYRA URL state:', error);
			currentView = 'home';
		}
	}

	/* ============================================================
	   APPEARANCE
	   ============================================================ */

	function loadAppearanceSettings() {
		try {
			visualEffects = localStorage.getItem('vyra_visual_effects') || 'balanced';
			density = localStorage.getItem('vyra_density') || 'comfortable';
			dynamicColors = localStorage.getItem('vyra_dynamic_colors') !== 'false';
			animatedBackgrounds = localStorage.getItem('vyra_animated_backgrounds') !== 'false';
			autoOpenLyrics = localStorage.getItem('vyra_auto_open_lyrics') === 'true';
			lyricsSize = localStorage.getItem('vyra_lyrics_size') || 'normal';
		} catch {
			// localStorage may be unavailable in strict browser contexts.
		}
	}

	/** @param {string} key @param {any} value */
	function updatePreference(key, value) {
		switch (key) {
			case 'visualEffects': visualEffects = String(value); localStorage.setItem('vyra_visual_effects', visualEffects); break;
			case 'density': density = String(value); localStorage.setItem('vyra_density', density); break;
			case 'dynamicColors': dynamicColors = Boolean(value); localStorage.setItem('vyra_dynamic_colors', String(dynamicColors)); break;
			case 'animatedBackgrounds': animatedBackgrounds = Boolean(value); localStorage.setItem('vyra_animated_backgrounds', String(animatedBackgrounds)); break;
			case 'autoOpenLyrics': autoOpenLyrics = Boolean(value); localStorage.setItem('vyra_auto_open_lyrics', String(autoOpenLyrics)); break;
			case 'lyricsSize': lyricsSize = String(value); localStorage.setItem('vyra_lyrics_size', lyricsSize); break;
			case 'themePreset': themePreset = String(value); localStorage.setItem('vyra_theme_preset', themePreset); break;
			case 'accentIntensity': accentIntensity = String(value); localStorage.setItem('vyra_accent_intensity', accentIntensity); break;
			case 'motionIntensity': motionIntensity = String(value); localStorage.setItem('vyra_motion_intensity', motionIntensity); break;
			case 'glassIntensity': glassIntensity = String(value); localStorage.setItem('vyra_glass_intensity', glassIntensity); break;
			case 'autoTheme': autoTheme = Boolean(value); localStorage.setItem('vyra_auto_theme', String(autoTheme)); break;
			case 'adaptivePerformance': adaptivePerformance = Boolean(value); localStorage.setItem('vyra_adaptive_performance', String(adaptivePerformance)); break;
		}
	}


	/* ============================================================
	   V11 LOCAL MEMORY / POWER TOOLS
	   ============================================================ */

	function loadV11Data() {
		/** @param {string} key @param {any} fallback */
		const read = (key, fallback) => {
			try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
			catch { return fallback; }
		};
		trackNotes = read('vyra_track_notes', {});
		savedSearches = read('vyra_saved_searches', []);
		queueSnapshots = read('vyra_queue_snapshots', []);
		discoveryQueue = read('vyra_discovery_queue', []);
		pinnedPlaylistIds = read('vyra_pinned_playlists', []);
		themePreset = localStorage.getItem('vyra_theme_preset') || 'graphite';
		accentIntensity = localStorage.getItem('vyra_accent_intensity') || 'normal';
		motionIntensity = localStorage.getItem('vyra_motion_intensity') || 'default';
		glassIntensity = localStorage.getItem('vyra_glass_intensity') || 'light';
		autoTheme = localStorage.getItem('vyra_auto_theme') === 'true';
		adaptivePerformance = localStorage.getItem('vyra_adaptive_performance') !== 'false';
	}

	/** @param {string} key @param {any} value */
	function persistV11(key, value) {
		try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn('VYRA local save failed', error); }
	}

	/** @param {any} track */
	function getTrackMemory(track) {
		if (!track?.uri) return { note: '', tags: [], moments: [] };
		return trackNotes[track.uri] ?? { title: track.name, artist: track.artists?.[0]?.name ?? '', note: '', tags: [], moments: [] };
	}

	/** @param {any} track @param {Record<string, any>} patch */
	function saveTrackMemory(track, patch) {
		if (!track?.uri) return;
		const current = getTrackMemory(track);
		trackNotes = {
			...trackNotes,
			[track.uri]: {
				...current,
				title: track.name,
				artist: track.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(', ') ?? '',
				image: track.album?.images?.[0]?.url ?? current.image ?? '',
				updatedAt: Date.now(),
				...patch
			}
		};
		persistV11('vyra_track_notes', trackNotes);
	}

	function saveCurrentMoment() {
		if (!currentTrack?.uri) return;
		const current = getTrackMemory(currentTrack);
		const moment = { time: Math.round(smoothPosition), label: `Saved at ${formatTime(smoothPosition)}`, createdAt: Date.now() };
		saveTrackMemory(currentTrack, { moments: [...(current.moments ?? []), moment] });
		showToast(`Saved ${currentTrack.name} at ${formatTime(smoothPosition)}`, 'bookmark');
	}

	/** @param {any} track @param {any} note */
	function updateTrackNote(track, note) {
		saveTrackMemory(track, { note: String(note ?? '') });
		showToast('Song note saved', 'note');
	}

	/** @param {any} track @param {any} rawTags */
	function updateTrackTags(track, rawTags) {
		const tags = String(rawTags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
		saveTrackMemory(track, { tags });
		showToast('Song tags updated', 'tag');
	}

	/** @param {any} query */
	function saveSearchQuery(query) {
		const clean = String(query ?? '').trim();
		if (!clean) return;
		savedSearches = [clean, ...savedSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 20);
		persistV11('vyra_saved_searches', savedSearches);
		showToast('Search saved', 'search');
	}

	/** @param {string} query */
	function deleteSavedSearch(query) {
		savedSearches = savedSearches.filter((item) => item !== query);
		persistV11('vyra_saved_searches', savedSearches);
	}

	/** @param {string} query */
	function runSavedSearch(query) {
		const plain = String(query)
			.replace(/artist:[^\s]+/gi, '')
			.replace(/album:[^\s]+/gi, '')
			.replace(/plays:[><=]*\d+/gi, '')
			.trim();
		if (plain) quickSearch(plain);
		else {
			search = query.replace(/(?:artist|album|plays):/gi, ' ').replace(/[><=]/g, ' ').trim();
			goSearch();
			searchSpotify();
		}
	}

	function saveQueueSnapshot() {
		if (!queue.length) { showToast('Queue is empty', 'queue'); return; }
		const snapshot = { id: crypto.randomUUID?.() ?? String(Date.now()), name: `Queue · ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`, createdAt: Date.now(), tracks: [...queue] };
		queueSnapshots = [snapshot, ...queueSnapshots].slice(0, 12);
		persistV11('vyra_queue_snapshots', queueSnapshots);
		showToast('Queue snapshot saved', 'queue');
	}

	/** @param {any} snapshot */
	function restoreQueueSnapshot(snapshot) {
		if (!snapshot?.tracks?.length) return;
		queue = [...snapshot.tracks];
		showToast(`Restored ${snapshot.tracks.length} queued songs`, 'queue');
	}

	/** @param {string} id */
	function deleteQueueSnapshot(id) {
		queueSnapshots = queueSnapshots.filter((item) => item.id !== id);
		persistV11('vyra_queue_snapshots', queueSnapshots);
	}

	function addCurrentToDiscovery() {
		if (!currentTrack?.uri) return;
		if (discoveryQueue.some((track) => track.uri === currentTrack.uri)) { showToast('Already in Listen Later', 'bookmark'); return; }
		discoveryQueue = [currentTrack, ...discoveryQueue].slice(0, 100);
		persistV11('vyra_discovery_queue', discoveryQueue);
		showToast('Saved to Listen Later', 'bookmark');
	}

	/** @param {string} uri */
	function removeDiscoveryTrack(uri) {
		discoveryQueue = discoveryQueue.filter((track) => track.uri !== uri);
		persistV11('vyra_discovery_queue', discoveryQueue);
	}

	function playDiscoveryQueue() {
		if (discoveryQueue.length) playTrackList(discoveryQueue, 0);
	}

	/** @param {string} id */
	function togglePinPlaylist(id) {
		pinnedPlaylistIds = pinnedPlaylistIds.includes(id) ? pinnedPlaylistIds.filter((item) => item !== id) : [...pinnedPlaylistIds, id].slice(0, 12);
		persistV11('vyra_pinned_playlists', pinnedPlaylistIds);
	}

	/** @param {any} rule */
	function createRulePlaylist(rule) {
		const grouped = memoryTracks;
		let matches = grouped;
		const value = String(rule?.value ?? '').trim();
		if (rule?.field === 'plays') {
			const number = Number(value) || 0;
			matches = grouped.filter((item) => rule.operator === 'lte' ? item.plays <= number : item.plays >= number);
		} else if (rule?.field === 'artist') {
			matches = grouped.filter((item) => item.artist?.toLowerCase().includes(value.toLowerCase()));
		} else if (rule?.field === 'album') {
			matches = grouped.filter((item) => item.album?.toLowerCase().includes(value.toLowerCase()));
		}
		const sourceTracks = matches.map((item) => likedSongs.find((track) => track.uri === item.uri) || tracks.find((track) => track.uri === item.uri) || historyItemToTrack(item)).filter(Boolean);
		if (!sourceTracks.length) { showToast('No locally loaded tracks matched that rule', 'sparkles'); return; }
		const playlist = { id: crypto.randomUUID?.() ?? String(Date.now()), name: rule?.name?.trim() || 'Smart Mix', description: 'Created from a VYRA rule', createdAt: Date.now(), tracks: sourceTracks };
		customPlaylists = [playlist, ...customPlaylists];
		saveCustomPlaylists();
		showToast(`Created ${playlist.name}`, 'playlist');
	}

	/** @param {string} filename @param {string} content @param {string} [type] */
	function downloadText(filename, content, type = 'application/json') {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url; link.download = filename; link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	function exportHistoryCsv() {
		/** @param {any} value */
		const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
		const rows = [['played_at','track','artist','album','uri'], ...listeningHistory.map((item) => [new Date(item.playedAt).toISOString(), item.name, item.artist, item.album, item.uri])];
		downloadText(`vyra-history-${new Date().toISOString().slice(0,10)}.csv`, rows.map((row) => row.map(escapeCsv).join(',')).join('\n'), 'text/csv');
	}

	function exportVyraBackup() {
		/** @type {Record<string, string | null>} */
		const data = {};
		for (let i = 0; i < localStorage.length; i += 1) {
			const key = localStorage.key(i);
			if (key?.startsWith('vyra_') || key?.startsWith('spotify_')) data[key] = localStorage.getItem(key);
		}
		downloadText(`vyra-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({ version: 11, exportedAt: Date.now(), data }, null, 2));
		showToast('VYRA backup exported', 'download');
	}

	/** @param {Event} event */
	async function importVyraBackup(event) {
		/** @type {HTMLInputElement} */
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const file = input?.files?.[0];
		if (!file) return;
		try {
			const parsed = JSON.parse(await file.text());
			if (!parsed?.data || typeof parsed.data !== 'object') throw new Error('Invalid backup');
			for (const [key, value] of Object.entries(parsed.data)) if (typeof value === 'string' && (key.startsWith('vyra_') || key.startsWith('spotify_'))) localStorage.setItem(key, value);
			showToast('Backup restored — reload VYRA to apply everything', 'upload');
		} catch (error) { handleError(error, 'Could not import VYRA backup'); }
		finally { if (input) input.value = ''; }
	}

	function repairVyraData() {
		const arrayKeys = ['vyra_saved_searches','vyra_queue_snapshots','vyra_discovery_queue','vyra_pinned_playlists'];
		for (const key of arrayKeys) {
			try { const parsed = JSON.parse(localStorage.getItem(key) || '[]'); if (!Array.isArray(parsed)) localStorage.setItem(key, '[]'); }
			catch { localStorage.setItem(key, '[]'); }
		}
		try { const parsed = JSON.parse(localStorage.getItem('vyra_track_notes') || '{}'); if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') localStorage.setItem('vyra_track_notes', '{}'); } catch { localStorage.setItem('vyra_track_notes', '{}'); }
		loadV11Data();
		showToast('Local VYRA data checked and repaired', 'wrench');
	}

	async function clearVyraCaches() {
		const preserve = new Set(['vyra_track_notes','vyra_saved_searches','vyra_queue_snapshots','vyra_discovery_queue','vyra_pinned_playlists','vyra_custom_playlists','vyra_history','vyra_liked_songs']);
		for (let i = localStorage.length - 1; i >= 0; i -= 1) {
			const key = localStorage.key(i);
			if (key?.startsWith('vyra_cache_') && !preserve.has(key)) localStorage.removeItem(key);
		}
		if ('caches' in window) { const names = await caches.keys(); await Promise.all(names.filter((name) => name.includes('vyra')).map((name) => caches.delete(name))); }
		showToast('VYRA caches cleared', 'trash');
	}

	/* ============================================================
	   NAVIGATION
	   ============================================================ */

	function goHome() {
		previousView = currentView;
		currentView = 'home';
		closePanels();
		updateViewUrl('home');
	}

	function goSearch() {
		previousView = currentView;
		currentView = 'search';
		closePanels();
		updateViewUrl('search');

		setTimeout(() => {
			const input = /** @type {HTMLInputElement | null} */ (
				document.querySelector('[data-search-input]')
			);
			input?.focus();
		}, 50);
	}

	function openLibrary() {
		previousView = currentView;
		currentView = 'library';
		closePanels();
		updateViewUrl('library');
	}

	function openHistory() {
		previousView = currentView;
		currentView = 'history';
		closePanels();
		updateViewUrl('history');
	}

	function openStats() {
		previousView = currentView;
		currentView = 'stats';
		closePanels();
		updateViewUrl('stats');
	}

	function openSettings() {
		previousView = currentView;
		currentView = 'settings';
		closePanels();
		updateViewUrl('settings');
	}

	function openMemory() {
		previousView = currentView;
		currentView = 'memory';
		closePanels();
		updateViewUrl('memory');
	}

	function openTools() {
		previousView = currentView;
		currentView = 'tools';
		closePanels();
		updateViewUrl('tools');
	}

	function openLikedSongs() {
		previousView = currentView;
		currentView = 'liked';
		closePanels();
		updateViewUrl('liked');
	}

	function goBack() {
		const depth = Number(window.history.state?.vyraDepth ?? 0);

		if (window.history.state?.vyra && depth > 0) {
			window.history.back();
			return;
		}

		currentView = 'home';
		updateViewUrl('home', '', true);
	}

	function closePanels() {
		queueOpen = false;
		lyricsOpen = false;
		commandOpen = false;
		contextMenuOpen = false;
	}

	/* ============================================================
	   ALBUM / ARTIST / PLAYLIST
	   ============================================================ */

	/**
	 * @param {any} album
	 * @param {boolean} [syncUrl]
	 */
	async function openAlbum(album, syncUrl = true) {
		if (!album?.id) return;

		previousView =
			currentView;

		currentView = 'album';

		if (syncUrl) updateViewUrl('album', album.id);

		pageLoading = true;

		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});

		try {
			const [
				albumData,
				tracksData
			] = await Promise.all([
				cachedSpotifyFetch(
					`/albums/${album.id}`
				),

				cachedSpotifyFetch(
					`/albums/${album.id}/tracks?limit=50`
				)
			]);

			selectedAlbum =
				albumData;

			albumTracks =
				tracksData?.items?.filter(
					Boolean
				) ?? [];
		} catch (error) {
			handleError(
				error,
				'Could not load album.'
			);
		} finally {
			pageLoading = false;
		}
	}

	/**
	 * @param {any} artist
	 * @param {boolean} [syncUrl]
	 */
	async function openArtist(artist, syncUrl = true) {
		if (!artist?.id) return;

		previousView =
			currentView;

		currentView = 'artist';

		if (syncUrl) updateViewUrl('artist', artist.id);

		pageLoading = true;

		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});

		try {
			const [
				artistData,
				albumsData,
				popularData
			] = await Promise.all([
				cachedSpotifyFetch(
					`/artists/${artist.id}`
				),

				cachedSpotifyFetch(
					`/artists/${artist.id}/albums?include_groups=album,single&limit=10`
				),

				spotifyFetch(
					`/search?q=${encodeURIComponent(
						`artist:"${artist.name}"`
					)}&type=track&limit=10`
				)
			]);

			selectedArtist =
				artistData;

			artistAlbums =
				uniqueById(
					albumsData?.items?.filter(
						Boolean
					) ?? []
				);

			artistPopularTracks =
				popularData?.tracks?.items
					?.filter(Boolean)
					.filter(
						/**
						 * @param {any} track
						 */
						(track) =>
							track.artists?.some(
								/**
								 * @param {any} item
								 */
								(item) =>
									item.id ===
									artist.id
							)
					) ?? [];
		} catch (error) {
			handleError(
				error,
				'Could not load artist.'
			);
		} finally {
			pageLoading = false;
		}
	}

	/**
	 * @param {any[]} items
	 */
	function uniqueById(items) {
		const seen =
			new Set();

		return items.filter(
			/**
			 * @param {any} item
			 */
			(item) => {
				if (
					!item?.id ||
					seen.has(item.id)
				) {
					return false;
				}

				seen.add(item.id);

				return true;
			}
		);
	}

	/**
	 * @param {any} playlist
	 * @param {boolean} [syncUrl]
	 */
	async function openPlaylist(playlist, syncUrl = true) {
		if (!playlist?.id) return;

		previousView = currentView;
		currentView = 'playlist';

		if (syncUrl) updateViewUrl('playlist', playlist.id);

		pageLoading = true;
		playlistItemsUnavailable = false;
		playlistTracks = [];

		try {
			selectedPlaylist = await spotifyFetch(`/playlists/${playlist.id}`);

			try {
				const itemRows = await fetchAllSpotifyPages(
					`/playlists/${playlist.id}/items?limit=50`,
					(data) => ({
						items: data?.items ?? [],
						next: data?.next ?? null
					}),
					10
				);

				playlistTracks = itemRows
					.map(
						/** @param {any} row */
						(row) => row?.item ?? row?.track ?? null
					)
					.filter(
						/** @param {any} item */
						(item) => item?.type === 'track' && Boolean(item?.uri)
					);
			} catch (itemError) {
				console.info('Playlist items are not available for this playlist:', itemError);
				playlistItemsUnavailable = true;
			}
		} catch (error) {
			selectedPlaylist = playlist;
			playlistTracks = [];
			handleError(error, 'Could not load playlist.');
		} finally {
			pageLoading = false;
		}
	}

	/* ============================================================
	   PLAYBACK
	   ============================================================ */

	/**
	 * @param {any[]} source
	 * @param {any} selected
	 */
	async function playTrackList(
		source,
		selected
	) {
		const playable =
			source.filter(
				/**
				 * @param {any} item
				 */
				(item) => item?.uri
			);

		const index =
			playable.findIndex(
				/**
				 * @param {any} item
				 */
				(item) =>
					item.uri ===
					selected.uri
			);

		if (index < 0) return;

		const ordered = [
			...playable.slice(index),
			...playable.slice(0, index)
		];

		await startPlayback({
			uris: ordered.map(
				/**
				 * @param {any} item
				 */
				(item) => item.uri
			)
		});
	}

	/**
	 * @param {any} track
	 */
	async function playSearchTrack(track) {
		await playTrackList(
			tracks,
			track
		);
	}

	/**
	 * @param {any} album
	 * @param {number} index
	 */
	async function playAlbumTrack(
		album,
		index
	) {
		if (!album?.uri) return;

		await startPlayback({
			context_uri:
				album.uri,

			offset: {
				position:
					index
			},

			position_ms: 0
		});
	}

	/**
	 * @param {any} artist
	 */
	async function playArtist(artist) {
		if (
			selectedArtist?.id ===
				artist?.id &&
			artistPopularTracks.length
		) {
			await startPlayback({
				uris:
					artistPopularTracks
						.filter(
							/**
							 * @param {any} item
							 */
							(item) =>
								item?.uri
						)
						.map(
							/**
							 * @param {any} item
							 */
							(item) =>
								item.uri
						)
			});

			return;
		}

		if (artist?.uri) {
			await startPlayback({
				context_uri:
					artist.uri
			});
		}
	}

	/**
	 * @param {any} playlist
	 */
	async function playPlaylist(playlist) {
		if (!playlist?.uri) return;

		await startPlayback({
			context_uri:
				playlist.uri
		});
	}

	async function playSelectedSpotifyPlaylist() {
		const playlist = selectedPlaylist;
		if (!playlist) return;
		await playPlaylist(playlist);
	}

	/**
	 * @param {Record<string, any>} body
	 */
	async function startPlayback(body) {
		if (
			!playerReady ||
			!deviceId
		) {
			showToast(
				'VYRA is still connecting',
				'warning'
			);

			return;
		}

		try {
			if (
				player?.activateElement
			) {
				await player.activateElement();
			}

			await spotifyFetch(
				`/me/player/play?device_id=${encodeURIComponent(
					deviceId
				)}`,
				{
					method: 'PUT',
					body:
						JSON.stringify(
							body
						)
				}
			);

			setTimeout(
				refreshPlayer,
				220
			);
		} catch (error) {
			handleError(
				error,
				'Could not start playback.'
			);
		}
	}

	async function refreshPlayer() {
		if (!player) return;

		try {
			const state =
				await player.getCurrentState();

			if (state) {
				updatePlayerState(
					state
				);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function togglePlayback() {
		if (!player) return;

		try {
			await player.togglePlay();
		} catch (error) {
			console.error(error);
		}
	}

	async function previousTrack() {
		if (!player) return;

		await player.previousTrack();
	}

	async function nextTrack() {
		if (!player) return;

		await player.nextTrack();
	}

	async function toggleShuffle() {
		if (!deviceId) return;

		const next =
			!shuffleEnabled;

		await spotifyFetch(
			`/me/player/shuffle?state=${next}&device_id=${encodeURIComponent(
				deviceId
			)}`,
			{
				method: 'PUT'
			}
		);

		shuffleEnabled = next;
	}

	async function cycleRepeat() {
		const next =
			repeatMode === 'off'
				? 'context'
				: repeatMode ===
					  'context'
					? 'track'
					: 'off';

		await spotifyFetch(
			`/me/player/repeat?state=${next}&device_id=${encodeURIComponent(
				deviceId
			)}`,
			{
				method: 'PUT'
			}
		);

		repeatMode = next;
	}

	/* ============================================================
	   QUEUE
	   ============================================================ */

	async function loadQueue() {
		queueOpen = true;
		lyricsOpen = false;

		queueLoading = true;

		try {
			const data =
				await spotifyFetch(
					'/me/player/queue'
				);

			queue =
				data?.queue?.filter(
					/**
					 * @param {any} item
					 */
					(item) =>
						item?.type ===
						'track'
				) ?? [];
		} catch (error) {
			handleError(
				error,
				'Could not load queue.'
			);
		} finally {
			queueLoading = false;
		}
	}

	/**
	 * @param {string} uri
	 */
	async function addToQueue(uri) {
		if (!deviceId) return;

		await spotifyFetch(
			`/me/player/queue?uri=${encodeURIComponent(
				uri
			)}&device_id=${encodeURIComponent(
				deviceId
			)}`,
			{
				method: 'POST'
			}
		);

		showToast(
			'Playing next',
			'queue'
		);

		if (queueOpen) {
			setTimeout(() => loadQueue(), 250);
		}
	}

	/**
	 * @param {number} index
	 */
	function startQueueDrag(index) {
		draggedQueueIndex = index;
	}

	/**
	 * @param {number} targetIndex
	 */
	function dropQueueItem(targetIndex) {
		if (
			draggedQueueIndex < 0 ||
			draggedQueueIndex === targetIndex
		) {
			draggedQueueIndex = -1;
			return;
		}

		const nextQueue = [...queue];
		const [moved] = nextQueue.splice(draggedQueueIndex, 1);

		if (!moved) {
			draggedQueueIndex = -1;
			return;
		}

		nextQueue.splice(targetIndex, 0, moved);
		queue = nextQueue;
		draggedQueueIndex = -1;

		showToast(
			'VYRA queue order updated',
			'queue'
		);
	}

	function clearVyraQueueView() {
		queue = [];
		showToast('Queue view cleared', 'queue');
	}

	async function playVyraQueueOrder() {
		if (!queue.length) {
			showToast('Queue is empty', 'queue');
			return;
		}

		await playSmartPlaylist(queue);
		showToast('Playing VYRA queue order', 'queue');
	}

	/* ============================================================
	   SEEK / VOLUME
	   ============================================================ */

	/**
	 * @param {Event} event
	 */
	async function seek(event) {
		if (!player) return;

		const input =
			/** @type {HTMLInputElement} */ (
				event.currentTarget
			);

		const value =
			Number(input.value);

		position = value;
		smoothPosition = value;

		playbackAnchorPosition =
			value;

		playbackAnchorTime =
			performance.now();

		updateActiveLyric(value);

		await player.seek(value);
	}

	/**
	 * @param {Event} event
	 */
	async function changeVolume(event) {
		if (!player) return;

		const input =
			/** @type {HTMLInputElement} */ (
				event.currentTarget
			);

		volume =
			Number(input.value);

		await player.setVolume(
			volume / 100
		);
	}

	async function toggleMute() {
		if (!player) return;

		if (volume > 0) {
			localStorage.setItem(
				'vyra_previous_volume',
				String(volume)
			);

			volume = 0;

			await player.setVolume(0);

			return;
		}

		const previous =
			Number(
				localStorage.getItem(
					'vyra_previous_volume'
				) ?? '72'
			);

		volume = previous;

		await player.setVolume(
			previous / 100
		);
	}

	/* ============================================================
	   DYNAMIC ARTWORK COLOR
	   ============================================================ */

	async function updateAccentFromArtwork() {
		const images = currentTrack?.album?.images ?? [];
		const url = images[images.length - 1]?.url ?? images[0]?.url;

		if (!url) return;

		const cachedColor = artworkColorCache.get(url);
		if (cachedColor) {
			accentRgb = cachedColor;
			return;
		}

		try {
			const image =
				new Image();

			image.crossOrigin =
				'anonymous';

			image.src = url;

			await image.decode();

			const canvas =
				document.createElement(
					'canvas'
				);

			canvas.width = 24;
			canvas.height = 24;

			const ctx =
				canvas.getContext('2d');

			if (!ctx) return;

			ctx.drawImage(
				image,
				0,
				0,
				24,
				24
			);

			const data =
				ctx.getImageData(
					0,
					0,
					24,
					24
				).data;

			let r = 0;
			let g = 0;
			let b = 0;
			let count = 0;

			for (
				let i = 0;
				i < data.length;
				i += 16
			) {
				const rr = data[i];
				const gg = data[i + 1];
				const bb = data[i + 2];

				const brightness =
					(rr + gg + bb) /
					3;

				if (
					brightness < 25 ||
					brightness > 235
				) {
					continue;
				}

				r += rr;
				g += gg;
				b += bb;
				count++;
			}

			if (!count) return;

			r = Math.round(r / count);
			g = Math.round(g / count);
			b = Math.round(b / count);

			accentRgb = `${r}, ${g}, ${b}`;
			artworkColorCache.set(url, accentRgb);
		} catch {
			accentRgb =
				'97, 202, 255';
		}
	}

	/* ============================================================
	   SLEEP TIMER
	   ============================================================ */

	function cancelSleepTimer() {
		if (sleepTimer) {
			clearTimeout(sleepTimer);
		}

		sleepTimer = null;
		sleepTimerEnd = 0;
		sleepTimerLabel = '';

		showToast(
			'Sleep timer cancelled',
			'sleep'
		);
	}

	/**
	 * @param {number} minutes
	 */
	function setSleepTimer(minutes) {
		if (sleepTimer) {
			clearTimeout(sleepTimer);
		}

		sleepTimerEnd =
			Date.now() +
			minutes * 60 * 1000;

		sleepTimerLabel =
			`${minutes} min`;

		sleepTimer =
			setTimeout(
				async () => {
					if (
						isPlaying &&
						player
					) {
						await player.pause();
					}

					sleepTimer = null;
					sleepTimerEnd = 0;
					sleepTimerLabel = '';

					showToast(
						'Sleep timer finished',
						'sleep'
					);
				},
				minutes * 60 * 1000
			);

		sleepTimerOpen = false;

		showToast(
			`Sleep timer set for ${minutes} min`,
			'sleep'
		);
	}

	/* ============================================================
	   FULLSCREEN AUTO HIDE
	   ============================================================ */

	function showFullscreenControls() {
		fullscreenControlsVisible = true;

		if (controlsHideTimer) {
			clearTimeout(
				controlsHideTimer
			);
		}

		controlsHideTimer =
			setTimeout(
				() => {
					if (
						fullscreenPlayer &&
						isPlaying
					) {
						fullscreenControlsVisible =
							false;
					}
				},
				2800
			);
	}

	/* ============================================================
	   CONTEXT MENU
	   ============================================================ */

	/**
	 * @param {MouseEvent} event
	 * @param {any} track
	 */
	function openTrackContext(
		event,
		track
	) {
		event.preventDefault();

		contextTrack = track;

		contextX =
			Math.min(
				event.clientX,
				window.innerWidth -
					240
			);

		contextY =
			Math.min(
				event.clientY,
				window.innerHeight -
					360
			);

		contextMenuOpen = true;
	}

	/* ============================================================
	   PRODUCT POLISH / CONNECT / QUICK LOOK
	   ============================================================ */

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
		localStorage.setItem('vyra_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
	}

	/** @param {number} width */
	function setSidebarWidth(width) {
		sidebarWidth = Math.max(200, Math.min(320, Math.round(width)));
		localStorage.setItem('vyra_sidebar_width', String(sidebarWidth));
	}

	/** @param {number} width */
	function setInspectorWidth(width) {
		inspectorWidth = Math.max(300, Math.min(520, Math.round(width)));
		localStorage.setItem('vyra_inspector_width', String(inspectorWidth));
	}

	async function loadDevices() {
		devicePickerOpen = true;
		devicesLoading = true;
		try {
			const data = await spotifyFetch('/me/player/devices');
			devices = data?.devices?.filter(Boolean) ?? [];
		} catch (error) {
			handleError(error, 'Could not load Spotify devices.');
		} finally {
			devicesLoading = false;
		}
	}

	/** @param {string} targetDeviceId */
	async function transferPlayback(targetDeviceId) {
		if (!targetDeviceId) return;
		try {
			await spotifyFetch('/me/player', {
				method: 'PUT',
				body: JSON.stringify({ device_ids: [targetDeviceId], play: isPlaying })
			});
			devicePickerOpen = false;
			showToast('Playback moved', 'device');
			setTimeout(refreshPlayer, 350);
		} catch (error) {
			handleError(error, 'Could not move playback.');
		}
	}

	/** @param {any} track */
	function openTrackInfo(track) {
		if (!track) return;
		trackInfoTrack = track;
		trackInfoOpen = true;
		contextMenuOpen = false;
	}

	function openCurrentTrackInfo() {
		if (currentTrack) openTrackInfo(currentTrack);
	}

	function openFocusLyrics() {
		if (!currentTrack) return;
		focusLyricsOpen = true;
		loadLyrics();
	}

	async function shareCurrentTrack() {
		if (!currentTrack) return;
		const title = `${currentTrack.name} — ${currentTrack.artists?.map(/** @param {any} artist */ (artist) => artist.name).join(', ') ?? ''}`;
		const url = currentTrack.external_urls?.spotify ?? '';
		try {
			if (navigator.share) {
				await navigator.share({ title, text: `Listening on VYRA: ${title}`, url });
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(url || title);
				showToast('Track link copied', 'share');
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') return;
			console.error(error);
		}
	}

	function toggleDeveloperMode() {
		developerMode = !developerMode;
		localStorage.setItem('vyra_developer_mode', developerMode ? '1' : '0');
	}

	function getThisWeekSmartPlaylist() {
		const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
		const seen = new Set();
		return listeningHistory
			.filter((item) => {
				if (!item?.uri || item.playedAt < since || seen.has(item.uri)) return false;
				seen.add(item.uri);
				return true;
			})
			.slice(0, 50)
			.map(historyItemToTrack)
			.filter(Boolean);
	}

	function getLateNightSmartPlaylist() {
		const seen = new Set();
		return listeningHistory
			.filter((item) => {
				const hour = new Date(item.playedAt).getHours();
				if (hour < 21 && hour > 4) return false;
				if (!item.uri || seen.has(item.uri)) return false;
				seen.add(item.uri);
				return true;
			})
			.slice(0, 40)
			.map(historyItemToTrack)
			.filter(Boolean);
	}

	/** @param {string} value */
	function updateCommandSearch(value) {
		commandSearch = value;
		if (commandSearchTimer) clearTimeout(commandSearchTimer);
		if (value.trim().length < 2) {
			commandMusicResults = [];
			commandMusicLoading = false;
			return;
		}
		commandSearchTimer = setTimeout(() => searchCommandMusic(value.trim()), 220);
	}

	/** @param {string} query */
	async function searchCommandMusic(query) {
		commandMusicLoading = true;
		try {
			const data = await cachedSpotifyFetch(
				`/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=5`,
				60_000
			);
			commandMusicResults = [
				...(data?.tracks?.items ?? []).filter(Boolean).slice(0, 4).map((/** @type {any} */ item) => ({ type: 'track', item })),
				...(data?.artists?.items ?? []).filter(Boolean).slice(0, 3).map((/** @type {any} */ item) => ({ type: 'artist', item })),
				...(data?.albums?.items ?? []).filter(Boolean).slice(0, 3).map((/** @type {any} */ item) => ({ type: 'album', item }))
			];
		} catch (error) {
			console.error(error);
			commandMusicResults = [];
		} finally {
			commandMusicLoading = false;
		}
	}

	/** @param {{type:string,item:any}} result */
	async function runCommandMusicResult(result) {
		commandOpen = false;
		commandSearch = '';
		commandMusicResults = [];
		if (result.type === 'track') {
			await playTrackList([result.item], result.item);
		} else if (result.type === 'artist') {
			await openArtist(result.item);
		} else if (result.type === 'album') {
			await openAlbum(result.item);
		}
	}

	/* ============================================================
	   COMMAND PALETTE
	   ============================================================ */

	const commands = [
		{
			name: 'Home',
			keywords: 'home start',
			action: goHome
		},
		{
			name: 'Search Music',
			keywords: 'search find discover',
			action: goSearch
		},
		{
			name: 'Liked Songs',
			keywords: 'liked favorites heart',
			action: openLikedSongs
		},
		{
			name: 'Library',
			keywords: 'library playlists albums artists',
			action: openLibrary
		},
		{
			name: 'Listening History',
			keywords: 'history recently played',
			action: openHistory
		},
		{
			name: 'Listening Stats',
			keywords: 'stats analytics listening',
			action: openStats
		},
		{
			name: 'Settings',
			keywords: 'settings appearance performance effects density',
			action: openSettings
		},
		{ name: 'Music Memory', keywords: 'memory timeline calendar journal notes moments', action: openMemory },
		{ name: 'Power Tools', keywords: 'tools backup smart playlist saved search discovery', action: openTools },
		{ name: 'Save Current Moment', keywords: 'bookmark moment timestamp favorite', action: saveCurrentMoment },
		{ name: 'Save to Listen Later', keywords: 'discover backlog later bookmark', action: addCurrentToDiscovery },
		{ name: 'Save Queue Snapshot', keywords: 'queue save snapshot restore', action: saveQueueSnapshot },
		{ name: 'Export VYRA Backup', keywords: 'backup export data json', action: exportVyraBackup },
		{
			name: 'Play / Pause',
			keywords: 'play pause music',
			action: togglePlayback
		},
		{
			name: 'Next Track',
			keywords: 'skip next',
			action: nextTrack
		},
		{
			name: 'Previous Track',
			keywords: 'previous back song',
			action: previousTrack
		},
		{
			name: 'Open Lyrics',
			keywords: 'lyrics karaoke words',
			action: openLyrics
		},
		{
			name: 'Open Queue',
			keywords: 'queue up next',
			action: loadQueue
		},
		{
			name: 'Fullscreen Player',
			keywords: 'fullscreen player now playing',
			action: () => {
				if (!currentTrack) return;

				fullscreenPlayer = true;

				loadLyrics();
			}
		},
		{
			name: 'Create Playlist',
			keywords: 'playlist new create',
			action: () => {
				playlistModalOpen = true;
			}
		},
		{
			name: 'Spotify Devices',
			keywords: 'spotify connect device speaker output',
			action: loadDevices
		},
		{
			name: 'Focus Lyrics',
			keywords: 'lyrics focus karaoke fullscreen words',
			action: openFocusLyrics
		},
		{
			name: 'Track Info',
			keywords: 'song info details album release spotify',
			action: openCurrentTrackInfo
		},
		{
			name: 'Toggle Sidebar',
			keywords: 'sidebar compact collapse expand',
			action: toggleSidebar
		},
		{
			name: 'Sleep Timer',
			keywords: 'sleep timer stop',
			action: () => {
				sleepTimerOpen = true;
			}
		}
	];

	function filteredCommands() {
		const query =
			commandSearch
				.trim()
				.toLowerCase();

		if (!query) {
			return commands;
		}

		return commands.filter(
			(command) =>
				command.name
					.toLowerCase()
					.includes(query) ||
				command.keywords.includes(
					query
				)
		);
	}

	/**
	 * @param {any} command
	 */
	function runCommand(command) {
		commandOpen = false;
		commandSearch = '';

		command.action();
	}

	/* ============================================================
	   TOAST
	   ============================================================ */

	/**
	 * @param {string} message
	 * @param {string} [icon]
	 * @param {string} [actionLabel]
	 * @param {(() => void) | null} [action]
	 */
	function showToast(
		message,
		icon = 'check',
		actionLabel = '',
		action = null
	) {
		const id =
			++toastCounter;

		toasts = [
			...toasts,
			{
				id,
				message,
				icon,
				actionLabel,
				action: action ?? undefined
			}
		];

		setTimeout(
			() => {
				toasts =
					toasts.filter(
						(item) =>
							item.id !== id
					);
			},
			2800
		);
	}

	/* ============================================================
	   HELPERS
	   ============================================================ */

	/**
	 * @param {number} ms
	 */
	function formatTime(ms) {
		if (!ms || ms < 0) {
			return '0:00';
		}

		const seconds =
			Math.floor(ms / 1000);

		const minutes =
			Math.floor(seconds / 60);

		return `${minutes}:${String(
			seconds % 60
		).padStart(2, '0')}`;
	}

	/**
	 * @param {number} timestamp
	 */
	function formatHistoryTime(timestamp) {
		const date =
			new Date(timestamp);

		const today =
			new Date();

		if (
			date.toDateString() ===
			today.toDateString()
		) {
			return `Today ${date.toLocaleTimeString(
				[],
				{
					hour: '2-digit',
					minute: '2-digit'
				}
			)}`;
		}

		return date.toLocaleDateString(
			[],
			{
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}
		);
	}

	/**
	 * @param {any} error
	 * @param {string} fallback
	 */
	function handleError(
		error,
		fallback
	) {
		console.error(error);

		errorMessage =
			error instanceof Error
				? error.message
				: fallback;
	}

	function handleLogout() {
		player?.disconnect();

		logout();

		window.location.href = '/';
	}


	/**
	 * Mutate UI-only state from child components without creating
	 * broken local copies of parent state.
	 * @param {string} key
	 * @param {any} value
	 */
	function setUiState(key, value) {
		switch (key) {
			case 'playlistModalOpen': playlistModalOpen = Boolean(value); break;
			case 'fullscreenPlayer': fullscreenPlayer = Boolean(value); break;
			case 'fullscreenLyrics': fullscreenLyrics = Boolean(value); break;
			case 'commandOpen': commandOpen = Boolean(value); break;
			case 'suggestionsOpen': suggestionsOpen = Boolean(value); break;
			case 'activeTab': activeTab = String(value); break;
			case 'sleepTimerOpen': sleepTimerOpen = Boolean(value); break;
			case 'lyricsOpen': lyricsOpen = Boolean(value); break;
			case 'queueOpen': queueOpen = Boolean(value); break;
			case 'contextMenuOpen': contextMenuOpen = Boolean(value); break;
			case 'addToPlaylistOpen': addToPlaylistOpen = Boolean(value); break;
			case 'commandSearch': updateCommandSearch(String(value ?? '')); break;
			case 'playlistNameDraft': playlistNameDraft = String(value ?? ''); break;
			case 'playlistDescriptionDraft': playlistDescriptionDraft = String(value ?? ''); break;
			case 'draggedQueueIndex': draggedQueueIndex = Number(value); break;
			case 'devicePickerOpen': devicePickerOpen = Boolean(value); break;
			case 'trackInfoOpen': trackInfoOpen = Boolean(value); break;
			case 'focusLyricsOpen': focusLyricsOpen = Boolean(value); break;
			case 'inspectorOpen': inspectorOpen = Boolean(value); localStorage.setItem('vyra_inspector_open', inspectorOpen ? '1' : '0'); break;
			case 'inspectorTab': inspectorTab = String(value ?? 'lyrics'); localStorage.setItem('vyra_inspector_tab', inspectorTab); break;
		}
	}

	/* ============================================================
	   COMPONENT CONTEXTS
	   Keep each child subscribed only to the state it actually uses.
	   ============================================================ */

	const sidebarCtx = $derived.by(() => ({
		setUiState,
		currentView,
		search,
		likedSongs,
		customPlaylists,
		playlistModalOpen,
		playerReady,
		openCustomPlaylist,
		goHome,
		goSearch,
		openLibrary,
		openHistory,
		openStats,
		openSettings,
		openMemory,
		openTools,
		pinnedPlaylistIds,
		togglePinPlaylist,
		openLikedSongs,
		handleLogout,
		sidebarCollapsed,
		toggleSidebar,
		sidebarWidth,
		setSidebarWidth,
	}));

	const homeViewCtx = $derived.by(() => ({
		setUiState,
		currentView,
		search,
		loading,
		tracks,
		albums,
		artists,
		playlists,
		recentSearches,
		likedSongs,
		customPlaylists,
		suggestions,
		suggestionsLoading,
		suggestionsOpen,
		listeningHistory,
		streakDays,
		fullscreenPlayer,
		fullscreenLyrics,
		lyricsSynced,
		currentTrack,
		isPlaying,
		smoothPosition,
		duration,
		commandOpen,
		searchSpotify,
		handleSearchInput,
		selectSuggestion,
		quickSearch,
		openCustomPlaylist,
		formatListeningTime,
		openLyrics,
		loadLyrics,
		openLibrary,
		openHistory,
		openStats,
		openLikedSongs,
		togglePlayback,
		previousTrack,
		nextTrack,
		seek,
		showFullscreenControls,
		formatTime,
		getThisWeekSmartPlaylist,
		getLateNightSmartPlaylist,
		playSmartPlaylist,
		memoryTracks, discoveryQueue, openMemory, openTools, continueListening,
	}));

	const searchViewCtx = $derived.by(() => ({
		setUiState,
		currentView,
		activeTab,
		search,
		loading,
		tracks,
		albums,
		artists,
		playlists,
		suggestions,
		suggestionsOpen,
		currentTrack,
		isPlaying,
		searchSpotify,
		handleSearchInput,
		selectSuggestion,
		isLiked,
		toggleLike,
		openAlbum,
		openArtist,
		openPlaylist,
		playSearchTrack,
		openTrackContext,
		formatTime,
	}));

	const likedViewCtx = $derived.by(() => ({
		currentView,
		artists,
		likedSongs,
		currentTrack,
		toggleLike,
		playTrackList,
		startPlayback,
		openTrackContext,
		addToQueue,
		formatTime,
	}));

	const libraryViewCtx = $derived.by(() => ({
		setUiState,
		currentView,
		tracks,
		artists,
		playlists,
		likedSongs,
		savedAlbums,
		savedArtists,
		spotifyPlaylists,
		libraryLoading,
		spotifyLibraryReady,
		customPlaylists,
		playlistModalOpen,
		getRecentlyPlayedSmartPlaylist,
		getOnRepeatSmartPlaylist,
		getForgottenFavoritesSmartPlaylist,
		getThisWeekSmartPlaylist,
		getLateNightSmartPlaylist,
		playSmartPlaylist,
		openCustomPlaylist,
		deleteCustomPlaylist,
		openAlbum,
		openArtist,
		openPlaylist,
	}));

	const customPlaylistViewCtx = $derived.by(() => ({
		currentView,
		tracks,
		artists,
		selectedCustomPlaylist,
		playSelectedCustomPlaylist,
		playSelectedCustomTrack,
		removeFromSelectedCustomPlaylist,
		playTrackList,
		addToQueue,
		currentTrack,
		openLibrary,
		formatTime,
	}));

	const historyViewCtx = $derived.by(() => ({
		currentView,
		listeningHistory,
		quickSearch,
		formatHistoryTime,
	}));

	const statsViewCtx = $derived.by(() => ({
		currentView,
		likedSongs,
		listeningHistory,
		tracksPlayed,
		streakDays,
		formatListeningTime,
	}));

	const settingsViewCtx = $derived.by(() => ({
		currentView,
		visualEffects,
		density,
		dynamicColors,
		animatedBackgrounds,
		autoOpenLyrics,
		lyricsSize,
		updatePreference,
		developerMode,
		toggleDeveloperMode,
		playerReady,
		deviceId,
		getTokenExpiry: () => Number(localStorage.getItem('spotify_token_expires') ?? '0'),
		themePreset, accentIntensity, motionIntensity, glassIntensity, autoTheme, adaptivePerformance,
	}));

	const albumViewCtx = $derived.by(() => ({
		currentView,
		pageLoading,
		tracks,
		artists,
		selectedAlbum,
		albumTracks,
		savedAlbums,
		toggleSaveAlbum,
		goBack,
		playAlbumTrack,
		addToQueue,
		openTrackInfo,
		formatTime,
	}));

	const artistViewCtx = $derived.by(() => ({
		currentView,
		pageLoading,
		selectedArtist,
		artistAlbums,
		artistPopularTracks,
		savedArtists,
		isLiked,
		toggleLike,
		toggleSaveArtist,
		goBack,
		openAlbum,
		playTrackList,
		playArtist,
		openTrackContext,
		formatTime,
	}));

	const playlistViewCtx = $derived.by(() => ({
		currentView,
		pageLoading,
		artists,
		playlists,
		selectedPlaylist,
		playlistTracks,
		playlistItemsUnavailable,
		goBack,
		playTrackList,
		playSelectedSpotifyPlaylist,
		addToQueue,
		openTrackContext,
		formatTime,
	}));

	const bottomPlayerCtx = $derived.by(() => ({
		setUiState,
		artists,
		queueOpen,
		fullscreenPlayer,
		fullscreenLyrics,
		lyricsOpen,
		player,
		currentTrack,
		isPlaying,
		smoothPosition,
		duration,
		volume,
		shuffleEnabled,
		repeatMode,
		artworkChanging,
		sleepTimerOpen,
		sleepTimerEnd,
		isLiked,
		toggleLike,
		openLyrics,
		loadLyrics,
		togglePlayback,
		previousTrack,
		nextTrack,
		toggleShuffle,
		cycleRepeat,
		loadQueue,
		seek,
		changeVolume,
		toggleMute,
		showFullscreenControls,
		formatTime,
		loadDevices,
		openCurrentTrackInfo,
		shareCurrentTrack,
		inspectorOpen,
		inspectorTab,
	}));

	const mobileDockCtx = $derived.by(() => ({
		currentView,
		search,
		goHome,
		goSearch,
		openLibrary,
		openLikedSongs,
	}));

	const fullscreenPlayerCtx = $derived.by(() => ({
		setUiState,
		loading,
		artists,
		fullscreenPlayer,
		fullscreenLyrics,
		fullscreenControlsVisible,
		lyricsLoading,
		lyricsError,
		lyricsSynced,
		syncedLyrics,
		plainLyrics,
		activeLyricIndex,
		lyricOffset,
		lyricOffsetFlash,
		player,
		currentTrack,
		isPlaying,
		smoothPosition,
		duration,
		shuffleEnabled,
		repeatMode,
		isLiked,
		toggleLike,
		loadLyrics,
		getCurrentLyricProgress,
		adjustLyricOffset,
		seekToLyric,
		togglePlayback,
		previousTrack,
		nextTrack,
		toggleShuffle,
		cycleRepeat,
		seek,
		showFullscreenControls,
		formatTime,
		openFocusLyrics,
		shareCurrentTrack,
		getPrecisePlaybackPosition: getInterpolatedPosition,
	}));

	const lyricsDrawerCtx = $derived.by(() => ({
		setUiState,
		loading,
		lyricsOpen,
		lyricsLoading,
		lyricsSynced,
		syncedLyrics,
		plainLyrics,
		activeLyricIndex,
		lyricOffset,
		smoothPosition,
		adjustLyricOffset,
		seekToLyric,
		isPlaying,
		getPrecisePlaybackPosition: getInterpolatedPosition,
	}));

	const queueDrawerCtx = $derived.by(() => ({
		setUiState,
		loading,
		artists,
		queue,
		queueOpen,
		queueLoading,
		draggedQueueIndex,
		playTrackList,
		loadQueue,
		startQueueDrag,
		dropQueueItem,
		clearVyraQueueView,
		playVyraQueueOrder,
	}));

	const contextMenuCtx = $derived.by(() => ({
		setUiState,
		artists,
		contextMenuOpen,
		contextX,
		contextY,
		contextTrack,
		isLiked,
		toggleLike,
		openAddToPlaylist,
		openAlbum,
		openArtist,
		playTrackList,
		addToQueue,
		openTrackInfo,
	}));

	const commandPaletteCtx = $derived.by(() => ({
		setUiState,
		search,
		commandOpen,
		commandSearch,
		filteredCommands,
		runCommand,
		commandMusicResults,
		commandMusicLoading,
		updateCommandSearch,
		runCommandMusicResult,
	}));

	const playlistCreateModalCtx = $derived.by(() => ({
		setUiState,
		playlistModalOpen,
		playlistNameDraft,
		playlistDescriptionDraft,
		createPlaylist,
	}));

	const addToPlaylistModalCtx = $derived.by(() => ({
		setUiState,
		tracks,
		customPlaylists,
		playlistModalOpen,
		addToPlaylistOpen,
		addTrackToCustomPlaylist,
	}));

	const sleepTimerModalCtx = $derived.by(() => ({
		setUiState,
		sleepTimerOpen,
		sleepTimerEnd,
		sleepTimerLabel,
		sleep,
		cancelSleepTimer,
		setSleepTimer,
	}));

	const toastStackCtx = $derived.by(() => ({
		queue,
		toasts,
		sleep,
	}));


	const devicePickerCtx = $derived.by(() => ({
		setUiState,
		devicePickerOpen,
		devicesLoading,
		devices,
		deviceId,
		loadDevices,
		transferPlayback,
	}));

	const trackInfoCtx = $derived.by(() => ({
		setUiState,
		trackInfoOpen,
		trackInfoTrack,
		isLiked,
		toggleLike,
		addToQueue,
		openAddToPlaylist,
		openAlbum,
		openArtist,
		formatTime,
		getTrackMemory, updateTrackNote, updateTrackTags, saveCurrentMoment, smoothPosition, currentTrack,
	}));

	const focusLyricsCtx = $derived.by(() => ({
		setUiState,
		focusLyricsOpen,
		currentTrack,
		syncedLyrics,
		plainLyrics,
		activeLyricIndex,
		lyricsLoading,
		lyricsError,
		lyricOffset,
		adjustLyricOffset,
		seekToLyric,
		isPlaying,
		togglePlayback,
		getPrecisePlaybackPosition: getInterpolatedPosition,
	}));

	const memoryViewCtx = $derived.by(() => ({
		currentView, listeningHistory, memoryTracks, currentTrack, trackNotes, quickSearch, exportHistoryCsv, openTrackInfo, saveCurrentMoment,
	}));

	const powerToolsCtx = $derived.by(() => ({
		currentView, savedSearches, queueSnapshots, discoveryQueue, listeningHistory, memoryTracks, currentTrack,
		runSavedSearch, saveSearchQuery, deleteSavedSearch, saveQueueSnapshot, restoreQueueSnapshot, deleteQueueSnapshot,
		addCurrentToDiscovery, removeDiscoveryTrack, playDiscoveryQueue, exportVyraBackup, importVyraBackup, repairVyraData, clearVyraCaches, createRulePlaylist, quickSearch,
	}));

	const inspectorCtx = $derived.by(() => ({
		setUiState, inspectorOpen, inspectorTab, inspectorWidth, setInspectorWidth,
		currentTrack, queue, syncedLyrics, plainLyrics, lyricsLoading, lyricOffset, isPlaying,
		loadLyrics, seekToLyric, formatTime, getPrecisePlaybackPosition: getInterpolatedPosition,
	}));

	const pageLoaderCtx = $derived.by(() => ({
		pageLoading,
	}));

</script>

<svelte:head>
	<title>VYRA Music</title>
	<meta name="description" content="VYRA Music" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#000000" />
</svelte:head>

<div
	class="app effects-{visualEffects} density-{density} lyrics-{lyricsSize} theme-{effectiveTheme} accent-{accentIntensity} motion-{motionIntensity} glass-{glassIntensity}"
	class:no-dynamic-colors={!dynamicColors}
	class:no-animated-backgrounds={!animatedBackgrounds}
	class:sidebar-collapsed={sidebarCollapsed}
	class:inspector-open={inspectorOpen}
	style={`--accent:${dynamicColors ? accentRgb : '97, 202, 255'};--sidebar-width:${sidebarCollapsed ? 74 : sidebarWidth}px;--inspector-width:${inspectorWidth}px`}
>
	<div class="global-bg">
		<div class="global-glow"></div>
		<div class="global-noise"></div>
	</div>

	<Sidebar ctx={sidebarCtx} />

	<main>
		<HomeView ctx={homeViewCtx} />
		<SearchView ctx={searchViewCtx} />
		<LikedView ctx={likedViewCtx} />
		<LibraryView ctx={libraryViewCtx} />
		<CustomPlaylistView ctx={customPlaylistViewCtx} />
		<HistoryView ctx={historyViewCtx} />
		<StatsView ctx={statsViewCtx} />
		<SettingsView ctx={settingsViewCtx} />
		<MemoryView ctx={memoryViewCtx} />
		<PowerToolsView ctx={powerToolsCtx} />
		<AlbumView ctx={albumViewCtx} />
		<ArtistView ctx={artistViewCtx} />
		<PlaylistView ctx={playlistViewCtx} />
		<PageLoader ctx={pageLoaderCtx} />
	</main>

	<BottomPlayer ctx={bottomPlayerCtx} />
	<MobileDock ctx={mobileDockCtx} />
	<FullscreenPlayer ctx={fullscreenPlayerCtx} />
	<LyricsDrawer ctx={lyricsDrawerCtx} />
	<QueueDrawer ctx={queueDrawerCtx} />
	<ContextMenu ctx={contextMenuCtx} />
	<CommandPalette ctx={commandPaletteCtx} />
	<PlaylistCreateModal ctx={playlistCreateModalCtx} />
	<AddToPlaylistModal ctx={addToPlaylistModalCtx} />
	<SleepTimerModal ctx={sleepTimerModalCtx} />
	<DevicePicker ctx={devicePickerCtx} />
	<TrackInfoSheet ctx={trackInfoCtx} />
	<FocusLyrics ctx={focusLyricsCtx} />
	<Inspector ctx={inspectorCtx} />
	<ToastStack ctx={toastStackCtx} />
</div>
