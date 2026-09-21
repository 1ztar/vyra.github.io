<script>
	import { Heart, Home, Library, Search } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let search = $derived(ctx.search);
	let goHome = $derived(ctx.goHome);
	let goSearch = $derived(ctx.goSearch);
	let openLibrary = $derived(ctx.openLibrary);
	let openLikedSongs = $derived(ctx.openLikedSongs);
</script>

	<!-- ========================================================
	     MOBILE DOCK
	     ======================================================== -->

	<nav class="mobile-dock">
		<button
			class:active={
				currentView === 'home'
			}
			onclick={goHome}
		>
			<Home size={19} />
			<span>Home</span>
		</button>

		<button
			class:active={
				currentView === 'search'
			}
			onclick={goSearch}
		>
			<Search size={19} />
			<span>Search</span>
		</button>

		<button
			class:active={
				currentView === 'liked'
			}
			onclick={openLikedSongs}
		>
			<Heart size={19} />
			<span>Liked</span>
		</button>

		<button
			class:active={
				currentView === 'library'
			}
			onclick={openLibrary}
		>
			<Library size={19} />
			<span>Library</span>
		</button>
	</nav>

