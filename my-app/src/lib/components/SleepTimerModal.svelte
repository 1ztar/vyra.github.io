<script>
	import { Moon } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let sleepTimerOpen = $derived(ctx.sleepTimerOpen);
	let sleepTimerEnd = $derived(ctx.sleepTimerEnd);
	let sleepTimerLabel = $derived(ctx.sleepTimerLabel);
	let sleep = $derived(ctx.sleep);
	let cancelSleepTimer = $derived(ctx.cancelSleepTimer);
	let setSleepTimer = $derived(ctx.setSleepTimer);
</script>

	<!-- ========================================================
	     SLEEP TIMER
	     ======================================================== -->

	{#if sleepTimerOpen}
		<button
			class="modal-backdrop"
			onclick={() => setUiState('sleepTimerOpen', false)}
			aria-label="Close"
		></button>

		<div class="small-modal sleep-modal">
			<div class="modal-icon">
				<Moon size={24} />
			</div>

			<h2>
				Sleep Timer
			</h2>

			<p>
				Stop playback automatically.
			</p>

			<div class="sleep-options">
				<button
					onclick={() =>
						setSleepTimer(15)}
				>
					15 min
				</button>

				<button
					onclick={() =>
						setSleepTimer(30)}
				>
					30 min
				</button>

				<button
					onclick={() =>
						setSleepTimer(45)}
				>
					45 min
				</button>

				<button
					onclick={() =>
						setSleepTimer(60)}
				>
					1 hour
				</button>
			</div>

			{#if sleepTimerEnd}
				<button
					class="cancel-sleep"
					onclick={cancelSleepTimer}
				>
					Cancel current timer ({sleepTimerLabel})
				</button>
			{/if}
		</div>
	{/if}

