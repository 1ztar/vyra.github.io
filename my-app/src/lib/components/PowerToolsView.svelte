<script>
	import { ArchiveRestore, BookmarkPlus, Database, Download, ListFilter, ListRestart, Play, Plus, Save, Search, Sparkles, Trash2, Upload, Wrench } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let savedSearches = $derived(ctx.savedSearches ?? []);
	let queueSnapshots = $derived(ctx.queueSnapshots ?? []);
	let discoveryQueue = $derived(ctx.discoveryQueue ?? []);
	let listeningHistory = $derived(ctx.listeningHistory ?? []);
	let memoryTracks = $derived(ctx.memoryTracks ?? []);
	let currentTrack = $derived(ctx.currentTrack);
	let runSavedSearch = $derived(ctx.runSavedSearch);
	let saveSearchQuery = $derived(ctx.saveSearchQuery);
	let deleteSavedSearch = $derived(ctx.deleteSavedSearch);
	let saveQueueSnapshot = $derived(ctx.saveQueueSnapshot);
	let restoreQueueSnapshot = $derived(ctx.restoreQueueSnapshot);
	let deleteQueueSnapshot = $derived(ctx.deleteQueueSnapshot);
	let addCurrentToDiscovery = $derived(ctx.addCurrentToDiscovery);
	let removeDiscoveryTrack = $derived(ctx.removeDiscoveryTrack);
	let playDiscoveryQueue = $derived(ctx.playDiscoveryQueue);
	let exportVyraBackup = $derived(ctx.exportVyraBackup);
	let importVyraBackup = $derived(ctx.importVyraBackup);
	let repairVyraData = $derived(ctx.repairVyraData);
	let clearVyraCaches = $derived(ctx.clearVyraCaches);
	let createRulePlaylist = $derived(ctx.createRulePlaylist);
	let quickSearch = $derived(ctx.quickSearch);

	let searchDraft = $state('');
	let ruleField = $state('plays');
	let ruleOperator = $state('gte');
	let ruleValue = $state('3');
	let ruleName = $state('Smart Mix');
	let importInput = $state(null);

	let localResults = $derived.by(() => {
		const query = searchDraft.trim();
		if (!query) return [];
		let items = [...memoryTracks];
		const artist = query.match(/artist:([^\s]+)/i)?.[1]?.replaceAll('_', ' ');
		const album = query.match(/album:([^\s]+)/i)?.[1]?.replaceAll('_', ' ');
		const plays = query.match(/plays:([><=]+)?(\d+)/i);
		const plain = query.replace(/(?:artist|album):[^\s]+/gi, '').replace(/plays:[><=]*\d+/gi, '').trim().toLowerCase();
		if (artist) items = items.filter((item) => item.artist?.toLowerCase().includes(artist.toLowerCase()));
		if (album) items = items.filter((item) => item.album?.toLowerCase().includes(album.toLowerCase()));
		if (plays) {
			const op = plays[1] || '>=';
			const n = Number(plays[2]);
			items = items.filter((item) => op.includes('<') ? item.plays < n : op.includes('>') ? item.plays > n : item.plays === n);
		}
		if (plain) items = items.filter((item) => `${item.name} ${item.artist} ${item.album}`.toLowerCase().includes(plain));
		return items.slice(0, 12);
	});

	function submitSavedSearch() {
		if (!searchDraft.trim()) return;
		saveSearchQuery(searchDraft.trim());
		searchDraft = '';
	}
</script>

{#if currentView === 'tools'}
	<section class="tools-view v11-view">
		<header class="v11-page-header">
			<div><span class="settings-kicker">POWER USER</span><h1>VYRA Tools</h1><p>Deep search, queue snapshots, discovery backlog and local data controls.</p></div>
			<div class="v11-header-actions">{#if currentTrack}<button class="v11-primary" onclick={addCurrentToDiscovery}><BookmarkPlus size={16}/>Save for later</button>{/if}</div>
		</header>

		<div class="tools-grid">
			<section class="v11-panel tools-wide">
				<div class="v11-section-heading"><div><h2>Saved searches</h2><p>Use simple filters like <code>artist:yeat</code>, <code>album:2093</code>, <code>plays:&gt;3</code> or plain text.</p></div><Search size={18}/></div>
				<div class="tools-inline-form"><input bind:value={searchDraft} placeholder="artist:yeat plays:>2" onkeydown={(e) => e.key === 'Enter' && submitSavedSearch()} /><button onclick={submitSavedSearch}><Plus size={15}/>Save</button></div>
				{#if searchDraft.trim()}
					<div class="local-search-results">
						{#each localResults as item}<button onclick={() => quickSearch(item.name)}><span><strong>{item.name}</strong><small>{item.artist} · {item.album}</small></span><em>{item.plays}×</em></button>{/each}
						{#if !localResults.length}<span class="local-search-empty">No local history matches.</span>{/if}
					</div>
				{/if}
				<div class="saved-search-list">
					{#each savedSearches as query}<div><button onclick={() => runSavedSearch(query)}><Search size={14}/><span>{query}</span></button><button class="icon-only" onclick={() => deleteSavedSearch(query)} aria-label="Delete saved search"><Trash2 size={14}/></button></div>{/each}
					{#if !savedSearches.length}<div class="v11-empty compact"><ListFilter size={20}/><span>No saved searches yet.</span></div>{/if}
				</div>
			</section>

			<section class="v11-panel">
				<div class="v11-section-heading"><div><h2>Rule playlist</h2><p>Create a local playlist from your own history.</p></div><Sparkles size={18}/></div>
				<div class="rule-builder">
					<input bind:value={ruleName} placeholder="Playlist name" />
					<div><select bind:value={ruleField}><option value="plays">Play count</option><option value="artist">Artist</option><option value="album">Album</option></select><select bind:value={ruleOperator}><option value="gte">is at least</option><option value="contains">contains</option><option value="lte">is at most</option></select></div>
					<input bind:value={ruleValue} placeholder="Value" />
					<button class="v11-primary" onclick={() => createRulePlaylist({ name: ruleName, field: ruleField, operator: ruleOperator, value: ruleValue })}><Plus size={15}/>Create smart playlist</button>
				</div>
			</section>

			<section class="v11-panel">
				<div class="v11-section-heading"><div><h2>Queue snapshots</h2><p>Save your current VYRA queue and restore it later.</p></div><Save size={18}/></div>
				<button class="full-row-action" onclick={saveQueueSnapshot}><Save size={15}/>Save current queue</button>
				<div class="snapshot-list">{#each queueSnapshots as snap}<div><button onclick={() => restoreQueueSnapshot(snap)}><ArchiveRestore size={15}/><span><strong>{snap.name}</strong><small>{snap.tracks.length} songs · {new Date(snap.createdAt).toLocaleDateString()}</small></span></button><button class="icon-only" onclick={() => deleteQueueSnapshot(snap.id)}><Trash2 size={14}/></button></div>{/each}</div>
			</section>

			<section class="v11-panel tools-wide">
				<div class="v11-section-heading"><div><h2>Discovery queue</h2><p>A separate “listen later” backlog that does not touch playback until you want it to.</p></div><BookmarkPlus size={18}/></div>
				<div class="discovery-toolbar"><button onclick={playDiscoveryQueue} disabled={!discoveryQueue.length}><Play size={15}/>Play all</button><span>{discoveryQueue.length} saved</span></div>
				<div class="discovery-list">{#each discoveryQueue as track}<div><button onclick={() => quickSearch(track.name)}>{#if track.album?.images?.[2]?.url}<img src={track.album.images[2].url} alt="" loading="lazy" />{/if}<span><strong>{track.name}</strong><small>{track.artists?.[0]?.name ?? ''}</small></span></button><button class="icon-only" onclick={() => removeDiscoveryTrack(track.uri)}><Trash2 size={14}/></button></div>{/each}</div>
			</section>

			<section class="v11-panel tools-wide">
				<div class="v11-section-heading"><div><h2>Local data</h2><p>Backup, restore and repair VYRA's local playlists, settings, history, notes and lyric offsets.</p></div><Database size={18}/></div>
				<div class="data-tools-grid">
					<button onclick={exportVyraBackup}><Download size={17}/><span><strong>Export backup</strong><small>Download VYRA data as JSON</small></span></button>
					<button onclick={() => importInput?.click()}><Upload size={17}/><span><strong>Import backup</strong><small>Restore a VYRA JSON backup</small></span></button>
					<button onclick={repairVyraData}><Wrench size={17}/><span><strong>Repair local data</strong><small>Validate arrays and remove malformed entries</small></span></button>
					<button onclick={clearVyraCaches}><ListRestart size={17}/><span><strong>Clear caches</strong><small>Keep your personal library and history</small></span></button>
				</div>
				<input class="hidden-file-input" bind:this={importInput} type="file" accept="application/json,.json" onchange={importVyraBackup} />
			</section>
		</div>
	</section>
{/if}
