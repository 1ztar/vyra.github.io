<script>
	import { ListMusic } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let playlistModalOpen = $derived(ctx.playlistModalOpen);
	let playlistNameDraft = $derived(ctx.playlistNameDraft);
	let playlistDescriptionDraft = $derived(ctx.playlistDescriptionDraft);
	let createPlaylist = $derived(ctx.createPlaylist);
</script>

	<!-- ========================================================
	     PLAYLIST CREATE MODAL
	     ======================================================== -->

	{#if playlistModalOpen}
		<button
			class="modal-backdrop"
			onclick={() => setUiState('playlistModalOpen', false)}
			aria-label="Close"
		></button>

		<div class="small-modal">
			<div class="modal-icon">
				<ListMusic size={24} />
			</div>

			<h2>
				New Playlist
			</h2>

			<p>
				Create a playlist stored inside VYRA.
			</p>

			<input
				value={playlistNameDraft}
				oninput={(event) => setUiState('playlistNameDraft', event.currentTarget.value)}
				placeholder="Playlist name"
			/>

			<textarea
				value={playlistDescriptionDraft}
				oninput={(event) => setUiState('playlistDescriptionDraft', event.currentTarget.value)}
				placeholder="Description"
			></textarea>

			<div>
				<button
					onclick={() => setUiState('playlistModalOpen', false)}
				>
					Cancel
				</button>

				<button
					class="primary-button"
					onclick={createPlaylist}
				>
					Create
				</button>
			</div>
		</div>
	{/if}

