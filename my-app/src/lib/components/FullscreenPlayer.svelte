<script>
	import { Heart, LoaderCircle, Maximize, Mic2, Minimize2, Pause, Repeat, Share2, Shuffle, SkipBack, SkipForward, Waves } from 'lucide-svelte';
	import PlayGlyph from './PlayGlyph.svelte';
	import SyncedLyrics from './SyncedLyrics.svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let loading = $derived(ctx.loading);
	let artists = $derived(ctx.artists);
	let fullscreenPlayer = $derived(ctx.fullscreenPlayer);
	let fullscreenLyrics = $derived(ctx.fullscreenLyrics);
	let fullscreenControlsVisible = $derived(ctx.fullscreenControlsVisible);
	let lyricsLoading = $derived(ctx.lyricsLoading);
	let lyricsError = $derived(ctx.lyricsError);
	let lyricsSynced = $derived(ctx.lyricsSynced);
	let syncedLyrics = $derived(ctx.syncedLyrics);
	let plainLyrics = $derived(ctx.plainLyrics);
	let activeLyricIndex = $derived(ctx.activeLyricIndex);
	let lyricOffset = $derived(ctx.lyricOffset);
	let lyricOffsetFlash = $derived(ctx.lyricOffsetFlash);
	let player = $derived(ctx.player);
	let currentTrack = $derived(ctx.currentTrack);
	let isPlaying = $derived(ctx.isPlaying);
	let smoothPosition = $derived(ctx.smoothPosition);
	let duration = $derived(ctx.duration);
	let shuffleEnabled = $derived(ctx.shuffleEnabled);
	let repeatMode = $derived(ctx.repeatMode);
	let isLiked = $derived(ctx.isLiked);
	let toggleLike = $derived(ctx.toggleLike);
	let loadLyrics = $derived(ctx.loadLyrics);
	let getCurrentLyricProgress = $derived(ctx.getCurrentLyricProgress);
	let adjustLyricOffset = $derived(ctx.adjustLyricOffset);
	let seekToLyric = $derived(ctx.seekToLyric);
	let togglePlayback = $derived(ctx.togglePlayback);
	let previousTrack = $derived(ctx.previousTrack);
	let nextTrack = $derived(ctx.nextTrack);
	let toggleShuffle = $derived(ctx.toggleShuffle);
	let cycleRepeat = $derived(ctx.cycleRepeat);
	let seek = $derived(ctx.seek);
	let showFullscreenControls = $derived(ctx.showFullscreenControls);
	let formatTime = $derived(ctx.formatTime);
	let openFocusLyrics = $derived(ctx.openFocusLyrics);
	let shareCurrentTrack = $derived(ctx.shareCurrentTrack);

	let swipeStartY = 0;

	/** @param {PointerEvent} event */
	function startFullscreenSwipe(event) { swipeStartY = event.clientY; }
	/** @param {PointerEvent} event */
	function endFullscreenSwipe(event) {
		if (event.pointerType !== 'touch') return;
		if (event.clientY - swipeStartY > 110) setUiState('fullscreenPlayer', false);
	}
</script>

	<!-- ========================================================
	     FULLSCREEN PLAYER
	     ======================================================== -->

	{#if fullscreenPlayer && currentTrack}
		<div
			class="fullscreen-player"
			role="dialog"
			aria-modal="true"
			aria-label="Now playing"
			tabindex="-1"
			onmousemove={showFullscreenControls}
			ontouchstart={showFullscreenControls}
			onpointerdown={startFullscreenSwipe}
			onpointerup={endFullscreenSwipe}
		>
			<div class="fullscreen-art-bg">
				<img
					src={currentTrack.album?.images?.[0]?.url}
					alt=""
				/>
			</div>

			<div class="fullscreen-dark"></div>

			<header
				class="fullscreen-header"
				class:hidden={
					!fullscreenControlsVisible
				}
			>
				<div class="fullscreen-brand">
					<Waves size={18} />
					VYRA
				</div>

				<div class="fullscreen-tabs">
					<button
						class:active={
							!fullscreenLyrics
						}
						onclick={() => setUiState('fullscreenLyrics', false)}
					>
						Now Playing
					</button>

					<button
						class:active={
							fullscreenLyrics
						}
						onclick={() => {
							setUiState('fullscreenLyrics', true);

							loadLyrics();
						}}
					>
						Lyrics
					</button>
				</div>

				<div class="fullscreen-utility">
					<button onclick={openFocusLyrics} aria-label="Focus lyrics" title="Focus lyrics"><Maximize size={18} /></button>
					<button onclick={shareCurrentTrack} aria-label="Share" title="Share"><Share2 size={18} /></button>
				</div>

				<button
					class="close-fullscreen"
					onclick={() => setUiState('fullscreenPlayer', false)}
				>
					<Minimize2 size={20} />
				</button>
			</header>

			<div
				class="fullscreen-body"
				class:lyrics={
					fullscreenLyrics
				}
			>
				<div class="fullscreen-art-column">
					<div
						class="fullscreen-art"
						class:playing={
							isPlaying
						}
					>
						<img
							src={currentTrack.album?.images?.[0]?.url}
							alt={currentTrack.name}
						/>
					</div>

					<div class="fullscreen-song">
						<div>
							<strong>
								{currentTrack.name}
							</strong>

							<span>
								{currentTrack.artists
									?.map(
										/** @param {any} artist */
										(artist) =>
											artist.name
									)
									.join(', ')}
							</span>
						</div>

						<button
							class:active={
								isLiked(
									currentTrack
								)
							}
							onclick={() =>
								toggleLike(
									currentTrack
								)}
						>
							<Heart
								size={23}
								fill={
									isLiked(
										currentTrack
									)
										? 'currentColor'
										: 'none'
								}
							/>
						</button>
					</div>

					<div class="fullscreen-progress">
						<input
							type="range"
							class="range fullscreen-range"
							min="0"
							max={duration || 1}
							value={smoothPosition}
							oninput={seek}
							style={`--fill:${
								duration
									? (smoothPosition /
											duration) *
										100
									: 0
							}%`}
						/>

						<div>
							<span>
								{formatTime(
									smoothPosition
								)}
							</span>

							<span>
								-{formatTime(
									Math.max(
										0,
										duration -
											smoothPosition
									)
								)}
							</span>
						</div>
					</div>

					<div
						class="fullscreen-controls"
						class:hidden={
							!fullscreenControlsVisible
						}
					>
						<button
							class:active={
								shuffleEnabled
							}
							onclick={toggleShuffle}
						>
							<Shuffle size={22} />
						</button>

						<button
							onclick={previousTrack}
						>
							<SkipBack
								size={32}
								fill="currentColor"
							/>
						</button>

						<button
							class="fullscreen-play"
							onclick={togglePlayback}
						>
							{#if isPlaying}
								<Pause
									size={35}
									fill="currentColor"
								/>
							{:else}
								<PlayGlyph size={22} class="transport-play-icon fullscreen-play-icon" />
							{/if}
						</button>

						<button
							onclick={nextTrack}
						>
							<SkipForward
								size={32}
								fill="currentColor"
							/>
						</button>

						<button
							class:active={
								repeatMode !==
								'off'
							}
							onclick={cycleRepeat}
						>
							<Repeat size={22} />
						</button>
					</div>
				</div>

				{#if fullscreenLyrics}
					<div class="fullscreen-lyrics">
						<div class="lyric-sync-toolbar">
							<div>
								<span>
									PRECISION LYRICS
								</span>

								{#if lyricsSynced}
									<small>
										<i></i>
										Line synced
									</small>
								{/if}
							</div>

							<div>
								<button
									onclick={() =>
										adjustLyricOffset(
											-100
										)}
								>
									−100
								</button>

								<strong
									class:flash={
										lyricOffsetFlash
									}
								>
									{lyricOffset > 0
										? '+'
										: ''}
									{lyricOffset}ms
								</strong>

								<button
									onclick={() =>
										adjustLyricOffset(
											100
										)}
								>
									+100
								</button>
							</div>
						</div>

						{#if lyricsLoading}
							<div class="lyrics-loading">
								<LoaderCircle
									size={27}
									class="spin"
								/>

								Loading lyrics...
							</div>
						{:else if lyricsError}
							<div class="lyrics-empty">
								<Mic2 size={37} />

								<h3>
									Lyrics unavailable
								</h3>

								<p>
									{lyricsError}
								</p>
							</div>
						{:else if syncedLyrics.length}
							<SyncedLyrics ctx={ctx} variant="fullscreen" />
						{:else}
							<div class="plain-lyrics">
								{#each plainLyrics as line}
									{#if line}
										<p>
											{line}
										</p>
									{:else}
										<div></div>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}