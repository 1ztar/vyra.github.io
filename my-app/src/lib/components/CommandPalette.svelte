<script>
	import { Album, ArrowRight, LoaderCircle, Music2, Search, UserRound } from 'lucide-svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let commandOpen = $derived(ctx.commandOpen);
	let commandSearch = $derived(ctx.commandSearch);
	let filteredCommands = $derived(ctx.filteredCommands);
	let runCommand = $derived(ctx.runCommand);
	let commandMusicResults = $derived(ctx.commandMusicResults);
	let commandMusicLoading = $derived(ctx.commandMusicLoading);
	let updateCommandSearch = $derived(ctx.updateCommandSearch);
	let runCommandMusicResult = $derived(ctx.runCommandMusicResult);
	let selectedIndex = $state(0);
	/** @type {HTMLInputElement | null} */
	let commandInput = $state(null);

	$effect(() => {
		if (!commandOpen || !commandInput) return;
		queueMicrotask(() => commandInput?.focus());
	});

	function allItems() {
		return [...commandMusicResults.map(/** @param {any} result */ (result) => ({ kind: 'music', value: result })), ...filteredCommands().map(/** @param {any} command */ (command) => ({ kind: 'command', value: command }))];
	}

	function runSelected() {
		const item = allItems()[selectedIndex];
		if (!item) return;
		if (item.kind === 'music') runCommandMusicResult(item.value); else runCommand(item.value);
	}
</script>

{#if commandOpen}
	<button class="modal-backdrop" onclick={() => setUiState('commandOpen', false)} aria-label="Close command palette"></button>
	<div class="command-palette command-palette-v2">
		<div class="command-search">
			<Search size={19} />
			<input bind:this={commandInput} value={commandSearch} oninput={(event) => { selectedIndex = 0; updateCommandSearch(event.currentTarget.value); }} onkeydown={(event) => { const count = allItems().length; if (event.key === 'ArrowDown') { event.preventDefault(); selectedIndex = Math.min(Math.max(0, count - 1), selectedIndex + 1); } else if (event.key === 'ArrowUp') { event.preventDefault(); selectedIndex = Math.max(0, selectedIndex - 1); } else if (event.key === 'Enter') { event.preventDefault(); runSelected(); } }} placeholder="Search music or VYRA actions…" />
			{#if commandMusicLoading}<LoaderCircle class="spin" size={16} />{:else}<kbd>ESC</kbd>{/if}
		</div>
		<div class="command-results">
			{#if commandMusicResults.length}
				<div class="command-section-label">Music</div>
				{#each commandMusicResults as result, index}
					<button class:selected={selectedIndex === index} onclick={() => runCommandMusicResult(result)}>
						<div class="command-result-art">
							{#if result.type === 'track' && result.item.album?.images?.[2]?.url}<img src={result.item.album.images[2].url} alt="" />
							{:else if result.item.images?.[2]?.url || result.item.images?.[0]?.url}<img src={result.item.images?.[2]?.url ?? result.item.images?.[0]?.url} alt="" />
							{:else if result.type === 'artist'}<UserRound size={17} />{:else if result.type === 'album'}<Album size={17} />{:else}<Music2 size={17} />{/if}
						</div>
						<span><strong>{result.item.name}</strong><small>{result.type === 'track' ? result.item.artists?.[0]?.name : result.type}</small></span>
						<ArrowRight size={14} />
					</button>
				{/each}
			{/if}
			<div class="command-section-label">Actions</div>
			{#each filteredCommands() as command, index}
				{@const absoluteIndex = commandMusicResults.length + index}
				<button class:selected={selectedIndex === absoluteIndex} onclick={() => runCommand(command)}><span>{command.name}</span><ArrowRight size={15} /></button>
			{/each}
		</div>
	</div>
{/if}
