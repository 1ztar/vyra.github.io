<script>
	import { ChevronRight, ListMusic, Plus } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let tracks = $derived(ctx.tracks);
	let customPlaylists = $derived(ctx.customPlaylists);
	let playlistModalOpen = $derived(ctx.playlistModalOpen);
	let addToPlaylistOpen = $derived(ctx.addToPlaylistOpen);
	let addTrackToCustomPlaylist = $derived(ctx.addTrackToCustomPlaylist);
</script>

	<!-- ========================================================
	     ADD TO PLAYLIST
	     ======================================================== -->

	{#if addToPlaylistOpen}
		<button
			class="modal-backdrop"
			onclick={() => setUiState('addToPlaylistOpen', false)}
			aria-label="Close"
		></button>

		<div class="small-modal playlist-picker">
			<h2>
				Add to Playlist
			</h2>

			{#if customPlaylists.length}
				<div class="playlist-picker-list">
					{#each customPlaylists as playlist}
						<button
							onclick={() =>
								addTrackToCustomPlaylist(
									playlist
								)}
						>
							<div>
								<ListMusic
									size={18}
								/>
							</div>

							<span>
								<strong>
									{playlist.name}
								</strong>

								<small>
									{playlist.tracks.length}
									songs
								</small>
							</span>

							<ChevronRight
								size={16}
							/>
						</button>
					{/each}
				</div>
			{:else}
				<p>
					Create a playlist first.
				</p>

				<button
					class="primary-button"
					onclick={() => {
						setUiState('addToPlaylistOpen', false);

						setUiState('playlistModalOpen', true);
					}}
				>
					<Plus size={17} />
					Create Playlist
				</button>
			{/if}
		</div>
	{/if}

