<script>
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let likedSongs = $derived(ctx.likedSongs);
	let listeningHistory = $derived(ctx.listeningHistory);
	let tracksPlayed = $derived(ctx.tracksPlayed);
	let streakDays = $derived(ctx.streakDays);
	let formatListeningTime = $derived(ctx.formatListeningTime);
</script>

		<!-- STATS -->

		{#if currentView === 'stats'}
			<header class="page-header">
				<div>
					<span class="eyebrow">
						VYRA INSIGHTS
					</span>

					<h1>
						Your Listening
					</h1>
				</div>
			</header>

			<section class="stats-grid">
				<div class="glass stat-card">
					<span>
						Listening Time
					</span>

					<strong>
						{formatListeningTime()}
					</strong>

					<small>
						Tracked in VYRA
					</small>
				</div>

				<div class="glass stat-card">
					<span>
						Tracks Played
					</span>

					<strong>
						{tracksPlayed}
					</strong>

					<small>
						Track changes
					</small>
				</div>

				<div class="glass stat-card">
					<span>
						Listening Streak
					</span>

					<strong>
						{streakDays}
					</strong>

					<small>
						days
					</small>
				</div>

				<div class="glass stat-card">
					<span>
						Liked Songs
					</span>

					<strong>
						{likedSongs.length}
					</strong>

					<small>
						in your collection
					</small>
				</div>
			</section>

			{#if listeningHistory.length}
				<section class="stats-recent">
					<div class="section-heading">
						<div>
							<span class="eyebrow">
								LATEST
							</span>

							<h2>
								Recent Activity
							</h2>
						</div>
					</div>

					<div class="recent-grid">
						{#each listeningHistory.slice(0, 6) as item}
							<div>
								{#if item.image}
									<img
										src={item.image}
										alt={item.name}
									/>
								{/if}

								<strong>
									{item.name}
								</strong>

								<span>
									{item.artist}
								</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/if}

