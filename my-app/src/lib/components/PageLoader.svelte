<script>
	import { LoaderCircle } from 'lucide-svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let pageLoading = $derived(ctx.pageLoading);
</script>

{#if pageLoading}
	<div class="page-loader">
		<LoaderCircle size={26} class="spin" />
		Loading...
	</div>
{/if}
