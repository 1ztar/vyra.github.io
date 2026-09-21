<script>
	import { Heart, Info, Laptop, ListEnd, Maximize2, Mic2, Moon, PanelRightOpen, Pause, Repeat, Repeat1, Share2, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-svelte';
	import PlayGlyph from './PlayGlyph.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let queueOpen = $derived(ctx.queueOpen);
	let fullscreenPlayer = $derived(ctx.fullscreenPlayer);
	let lyricsOpen = $derived(ctx.lyricsOpen);
	let currentTrack = $derived(ctx.currentTrack);
	let isPlaying = $derived(ctx.isPlaying);
	let smoothPosition = $derived(ctx.smoothPosition);
	let duration = $derived(ctx.duration);
	let volume = $derived(ctx.volume);
	let shuffleEnabled = $derived(ctx.shuffleEnabled);
	let repeatMode = $derived(ctx.repeatMode);
	let sleepTimerEnd = $derived(ctx.sleepTimerEnd);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let openLyrics = $derived(ctx.openLyrics);
	let loadLyrics = $derived(ctx.loadLyrics);
	let togglePlayback = $derived(ctx.togglePlayback);
	let previousTrack = $derived(ctx.previousTrack);
	let nextTrack = $derived(ctx.nextTrack);
	let toggleShuffle = $derived(ctx.toggleShuffle);
	let cycleRepeat = $derived(ctx.cycleRepeat);
	let loadQueue = $derived(ctx.loadQueue);
	let seek = $derived(ctx.seek);
	let changeVolume = $derived(ctx.changeVolume);
	let toggleMute = $derived(ctx.toggleMute);
	let showFullscreenControls = $derived(ctx.showFullscreenControls);
	let formatTime = $derived(ctx.formatTime);
	let loadDevices = $derived(ctx.loadDevices);
	let openCurrentTrackInfo = $derived(ctx.openCurrentTrackInfo);
	let shareCurrentTrack = $derived(ctx.shareCurrentTrack);
	let inspectorOpen = $derived(ctx.inspectorOpen);
</script>

{#if currentTrack && !fullscreenPlayer}
	<div class="player polished-player">
		<div class="player-left polished-player-left">
			<button
				class="player-art"
				onclick={() => {
					setUiState('fullscreenPlayer', true);
					setUiState('fullscreenLyrics', true);
					loadLyrics();
					showFullscreenControls();
				}}
				aria-label="Open fullscreen player"
			>
				<img src={currentTrack.album?.images?.[0]?.url} alt={currentTrack.name} decoding="async" />
				<span><Maximize2 size={16} /></span>
			</button>

			<div class="player-copy">
				<strong>{currentTrack.name}</strong>
				<span>
					{currentTrack.artists
						?.map(
							/** @param {any} artist */
							(artist) => artist.name
						)
						.join(', ')}
				</span>
			</div>

			<button class="player-like" class:active={isLiked(currentTrack)} onclick={() => toggleLike(currentTrack)} aria-label="Like song">
				<Heart size={18} fill={isLiked(currentTrack) ? 'currentColor' : 'none'} />
			</button>
		</div>

		<div class="player-center polished-player-center">
			<div class="player-controls">
				<button class:active={shuffleEnabled} onclick={toggleShuffle} aria-label="Shuffle"><Shuffle size={16} /></button>
				<button onclick={previousTrack} aria-label="Previous track"><SkipBack size={21} fill="currentColor" /></button>
				<button class="player-play" onclick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
					{#if isPlaying}<Pause size={22} fill="currentColor" />{:else}<PlayGlyph size={18} class="transport-play-icon" />{/if}
				</button>
				<button onclick={nextTrack} aria-label="Next track"><SkipForward size={21} fill="currentColor" /></button>
				<button class:active={repeatMode !== 'off'} onclick={cycleRepeat} aria-label="Repeat">
					{#if repeatMode === 'track'}<Repeat1 size={16} />{:else}<Repeat size={16} />{/if}
				</button>
			</div>

			<div class="player-progress-compact">
				<span>{formatTime(smoothPosition)}</span>
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
				<span>{formatTime(duration)}</span>
			</div>
		</div>

		<div class="player-right polished-player-right">
			<button class:active={inspectorOpen} onclick={() => setUiState('inspectorOpen', !inspectorOpen)} aria-label="Toggle inspector" title="Inspector"><PanelRightOpen size={17} /></button>
			<button onclick={openCurrentTrackInfo} aria-label="Track information" title="Song info"><Info size={17} /></button>
			<button onclick={loadDevices} aria-label="Spotify devices" title="Spotify Connect"><Laptop size={17} /></button>
			<button onclick={shareCurrentTrack} aria-label="Share track" title="Share"><Share2 size={17} /></button>
			<button onclick={() => setUiState('sleepTimerOpen', true)} class:active={sleepTimerEnd > 0} aria-label="Sleep timer"><Moon size={17} /></button>
			<button class:active={lyricsOpen} onclick={openLyrics} aria-label="Lyrics"><Mic2 size={17} /></button>
			<button class:active={queueOpen} onclick={loadQueue} aria-label="Queue"><ListEnd size={17} /></button>
			<div class="volume-control">
				<button onclick={toggleMute} aria-label="Mute">
					{#if volume === 0}<VolumeX size={17} />{:else if volume < 45}<Volume1 size={17} />{:else}<Volume2 size={17} />{/if}
				</button>
				<input type="range" class="range" min="0" max="100" value={volume} oninput={changeVolume} style={`--fill:${volume}%`} aria-label="Volume" />
			</div>
		</div>
	</div>
{/if}
