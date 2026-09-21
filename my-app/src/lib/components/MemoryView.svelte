<script>
	import { Bookmark, CalendarDays, Clock3, Download, Heart, History, Music2, NotebookPen, Sparkles, Tag } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let listeningHistory = $derived(ctx.listeningHistory ?? []);
	let memoryTracks = $derived(ctx.memoryTracks ?? []);
	let currentTrack = $derived(ctx.currentTrack);
	let trackNotes = $derived(ctx.trackNotes ?? {});
	let quickSearch = $derived(ctx.quickSearch);
	let exportHistoryCsv = $derived(ctx.exportHistoryCsv);
	let openTrackInfo = $derived(ctx.openTrackInfo);
	let saveCurrentMoment = $derived(ctx.saveCurrentMoment);

	let monthOffset = $state(0);

	let monthDate = $derived.by(() => {
		const date = new Date();
		date.setDate(1);
		date.setMonth(date.getMonth() + monthOffset);
		return date;
	});

	let monthLabel = $derived(monthDate.toLocaleDateString([], { month: 'long', year: 'numeric' }));

	let calendarDays = $derived.by(() => {
		const year = monthDate.getFullYear();
		const month = monthDate.getMonth();
		const first = new Date(year, month, 1);
		const count = new Date(year, month + 1, 0).getDate();
		const prefix = (first.getDay() + 6) % 7;
		const days = [];
		for (let i = 0; i < prefix; i += 1) days.push(null);
		for (let day = 1; day <= count; day += 1) {
			const start = new Date(year, month, day).getTime();
			const end = start + 86400000;
			const plays = listeningHistory.filter((item) => item.playedAt >= start && item.playedAt < end);
			days.push({ day, plays, art: plays[0]?.image ?? '' });
		}
		return days;
	});

	let totalDaysThisMonth = $derived(calendarDays.filter((day) => day?.plays?.length).length);
	let monthPlays = $derived(calendarDays.reduce((sum, day) => sum + (day?.plays?.length ?? 0), 0));

	let onThisDay = $derived.by(() => {
		const now = new Date();
		return listeningHistory.filter((item) => {
			const date = new Date(item.playedAt);
			return date.getMonth() === now.getMonth() && date.getDate() === now.getDate() && date.getFullYear() !== now.getFullYear();
		}).slice(0, 8);
	});

	let tagCounts = $derived.by(() => {
		const map = new Map();
		for (const value of Object.values(trackNotes)) for (const tag of value?.tags ?? []) map.set(tag, (map.get(tag) ?? 0) + 1);
		return [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0, 12);
	});

	function firstSeenLabel(value) {
		if (!value) return '—';
		return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

{#if currentView === 'memory'}
	<section class="memory-view v11-view">
		<header class="v11-page-header">
			<div>
				<span class="settings-kicker">PERSONAL ARCHIVE</span>
				<h1>Music Memory</h1>
				<p>Your listening history, favorite moments and the songs that keep coming back.</p>
			</div>
			<div class="v11-header-actions">
				{#if currentTrack}<button class="v11-primary" onclick={saveCurrentMoment}><Bookmark size={16}/>Save this moment</button>{/if}
				<button onclick={exportHistoryCsv}><Download size={16}/>Export history</button>
			</div>
		</header>

		<div class="memory-summary-grid">
			<div><CalendarDays size={18}/><span><strong>{totalDaysThisMonth}</strong><small>active days this month</small></span></div>
			<div><History size={18}/><span><strong>{monthPlays}</strong><small>plays this month</small></span></div>
			<div><NotebookPen size={18}/><span><strong>{Object.keys(trackNotes).length}</strong><small>songs with memories</small></span></div>
			<div><Sparkles size={18}/><span><strong>{memoryTracks.filter((item) => item.plays > 1).length}</strong><small>returning favorites</small></span></div>
		</div>

		{#if onThisDay.length}
			<section class="v11-panel memory-on-this-day">
				<div class="v11-section-heading"><div><h2>On this day</h2><p>Music you played on this date in a previous year.</p></div></div>
				<div class="memory-on-this-day-grid">{#each onThisDay as item}<button onclick={() => quickSearch(item.name)}>{#if item.image}<img src={item.image} alt="" loading="lazy" />{/if}<span><strong>{item.name}</strong><small>{item.artist} · {new Date(item.playedAt).getFullYear()}</small></span></button>{/each}</div>
			</section>
		{/if}

		{#if tagCounts.length}
			<section class="memory-tag-shelf">
				{#each tagCounts as [tag,count]}<span><Tag size={11}/>{tag}<small>{count}</small></span>{/each}
			</section>
		{/if}

		<section class="memory-calendar-section v11-panel">
			<div class="v11-section-heading">
				<div><h2>Listening calendar</h2><p>Artwork marks the first thing you played that day.</p></div>
				<div class="memory-month-nav"><button onclick={() => monthOffset -= 1}>‹</button><strong>{monthLabel}</strong><button disabled={monthOffset >= 0} onclick={() => monthOffset += 1}>›</button></div>
			</div>
			<div class="memory-weekdays">{#each ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as day}<span>{day}</span>{/each}</div>
			<div class="memory-calendar-grid">
				{#each calendarDays as item}
					{#if item}
						<div class:active={item.plays.length} class="memory-day" title={item.plays.length ? `${item.plays.length} plays` : 'No plays'}>
							{#if item.art}<img src={item.art} alt="" loading="lazy" decoding="async" />{/if}
							<span>{item.day}</span>
							{#if item.plays.length}<small>{item.plays.length}</small>{/if}
						</div>
					{:else}<div class="memory-day empty"></div>{/if}
				{/each}
			</div>
		</section>

		<section class="v11-panel">
			<div class="v11-section-heading"><div><h2>Tracks that stayed with you</h2><p>Built only from your local VYRA listening history.</p></div></div>
			<div class="memory-track-list">
				{#each memoryTracks.slice(0, 18) as item}
					<button onclick={() => quickSearch(item.name)}>
						<div class="memory-art">{#if item.image}<img src={item.image} alt="" loading="lazy" decoding="async" />{:else}<Music2 size={18}/>{/if}</div>
						<div class="memory-track-copy"><strong>{item.name}</strong><span>{item.artist}</span></div>
						<div class="memory-metric"><strong>{item.plays}</strong><span>plays</span></div>
						<div class="memory-date"><span>First played</span><strong>{firstSeenLabel(item.firstPlayed)}</strong></div>
						{#if trackNotes[item.uri]?.note || trackNotes[item.uri]?.tags?.length}<div class="memory-note-dot" title="You saved a memory for this song"><NotebookPen size={14}/></div>{/if}
					</button>
				{/each}
			</div>
		</section>

		<section class="v11-panel memory-saved-section">
			<div class="v11-section-heading"><div><h2>Saved memories</h2><p>Notes, tags and exact moments you chose to keep.</p></div></div>
			<div class="saved-memory-grid">
				{#each Object.entries(trackNotes).filter(([, value]) => value?.note || value?.tags?.length || value?.moments?.length).slice(0, 12) as [uri, value]}
					<article>
						<div class="saved-memory-top"><NotebookPen size={16}/><strong>{value.title ?? 'Saved song'}</strong></div>
						{#if value.artist}<span>{value.artist}</span>{/if}
						{#if value.note}<p>{value.note}</p>{/if}
						{#if value.tags?.length}<div class="memory-tags">{#each value.tags as tag}<span><Tag size={11}/>{tag}</span>{/each}</div>{/if}
						{#if value.moments?.length}<small><Clock3 size={12}/>{value.moments.length} saved moment{value.moments.length === 1 ? '' : 's'}</small>{/if}
					</article>
				{/each}
				{#if !Object.values(trackNotes).some((value) => value?.note || value?.tags?.length || value?.moments?.length)}
					<div class="v11-empty"><Heart size={22}/><strong>No saved memories yet</strong><span>Open Song Info and add a note, tag, or favorite moment.</span></div>
				{/if}
			</div>
		</section>
	</section>
{/if}
