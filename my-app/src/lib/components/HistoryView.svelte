<script>
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let listeningHistory = $derived(ctx.listeningHistory);
	let quickSearch = $derived(ctx.quickSearch);
	let formatHistoryTime = $derived(ctx.formatHistoryTime);
</script>

		<!-- HISTORY -->

		{#if currentView === 'history'}
			<header class="page-header">
				<div>
					<span class="eyebrow">
						YOUR LISTENING
					</span>

					<h1>
						History
					</h1>
				</div>
			</header>

			<section class="history-list">
				{#each listeningHistory as item}
					<button
						onclick={() =>
							quickSearch(
								item.name
							)}
					>
						<div>
							{#if item.image}
								<img
									src={item.image}
									alt={item.name}
								/>
							{/if}
						</div>

						<span>
							<strong>
								{item.name}
							</strong>

							<small>
								{item.artist}
							</small>
						</span>

						<span>
							{item.album}
						</span>

						<time>
							{formatHistoryTime(
								item.playedAt
							)}
						</time>
					</button>
				{/each}
			</section>
		{/if}

