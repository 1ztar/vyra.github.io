<script>
	import { Check, Heart, Laptop, ListEnd, ListMusic, Moon, Share2, Trash2 } from 'lucide-svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let toasts = $derived(ctx.toasts);
</script>

<div class="toast-stack">
	{#each toasts as toast}
		<div class="toast">
			<div>
				{#if toast.icon === 'heart'}<Heart size={16} fill="currentColor" />
				{:else if toast.icon === 'playlist'}<ListMusic size={16} />
				{:else if toast.icon === 'queue'}<ListEnd size={16} />
				{:else if toast.icon === 'sleep'}<Moon size={16} />
				{:else if toast.icon === 'device'}<Laptop size={16} />
				{:else if toast.icon === 'share'}<Share2 size={16} />
				{:else if toast.icon === 'trash'}<Trash2 size={16} />
				{:else}<Check size={16} />{/if}
			</div>
			<span>{toast.message}</span>
			{#if toast.action && toast.actionLabel}
				<button onclick={toast.action}>{toast.actionLabel}</button>
			{/if}
		</div>
	{/each}
</div>
