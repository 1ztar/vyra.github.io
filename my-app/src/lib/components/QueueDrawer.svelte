<script>
	import { LoaderCircle, Play, RotateCcw, Trash2, X } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let loading = $derived(ctx.loading);
	let artists = $derived(ctx.artists);
	let queue = $derived(ctx.queue);
	let queueOpen = $derived(ctx.queueOpen);
	let queueLoading = $derived(ctx.queueLoading);
	let draggedQueueIndex = $derived(ctx.draggedQueueIndex);
	let playTrackList = $derived(ctx.playTrackList);
	let loadQueue = $derived(ctx.loadQueue);
	let startQueueDrag = $derived(ctx.startQueueDrag);
	let dropQueueItem = $derived(ctx.dropQueueItem);
	let clearVyraQueueView = $derived(ctx.clearVyraQueueView);
	let playVyraQueueOrder = $derived(ctx.playVyraQueueOrder);
</script>

	<!-- ========================================================
	     QUEUE
	     ======================================================== -->

	{#if queueOpen}
		<button
			class="drawer-backdrop"
			onclick={() => setUiState('queueOpen', false)}
			aria-label="Close queue"
		></button>

		<aside class="drawer">
			<div class="drawer-header">
				<div>
					<span>
						UP NEXT
					</span>

					<h2>
						Queue
					</h2>
				</div>

				<div>
					<button
						onclick={clearVyraQueueView}
						title="Clear VYRA queue view"
					>
						<Trash2 size={16} />
					</button>

					<button
						onclick={loadQueue}
						title="Refresh Spotify queue"
					>
						<RotateCcw
							size={17}
						/>
					</button>

					<button
						onclick={() => setUiState('queueOpen', false)}
					>
						<X size={19} />
					</button>
				</div>
			</div>

			{#if queueLoading}
				<div class="drawer-loading">
					<LoaderCircle
						size={24}
						class="spin"
					/>
				</div>
			{:else}
				<div class="queue-list">
					{#each queue as item, index}
						<button
							draggable="true"
							class:dragging={draggedQueueIndex === index}
							ondragstart={() => startQueueDrag(index)}
							ondragend={() => setUiState('draggedQueueIndex', -1)}
							ondragover={(event) => event.preventDefault()}
							ondrop={(event) => {
								event.preventDefault();
								dropQueueItem(index);
							}}
							onclick={() =>
								playTrackList(
									queue,
									item
								)}
						>
							<span>
								{index + 1}
							</span>

							<div>
								{#if item.album?.images?.[0]}
									<img
										src={item.album.images[0].url}
										alt={item.name}
									/>
								{/if}
							</div>

							<span>
								<strong>
									{item.name}
								</strong>

								<small>
									{item.artists?.[0]?.name}
								</small>
							</span>
						</button>
					{/each}

					{#if queue.length}
						<div class="queue-apply">
							<span>Drag songs to reorder them inside VYRA.</span>
							<button onclick={playVyraQueueOrder}>
								<Play size={15} fill="currentColor" />
								Play this order
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</aside>
	{/if}

