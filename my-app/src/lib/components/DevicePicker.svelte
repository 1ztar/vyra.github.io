<script>
	import { Check, Laptop, LoaderCircle, MonitorSpeaker, RefreshCw, Smartphone, Speaker, X } from 'lucide-svelte';
	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let setUiState = $derived(ctx.setUiState);
	let devicePickerOpen = $derived(ctx.devicePickerOpen);
	let devicesLoading = $derived(ctx.devicesLoading);
	let devices = $derived(ctx.devices);
	let deviceId = $derived(ctx.deviceId);
	let loadDevices = $derived(ctx.loadDevices);
	let transferPlayback = $derived(ctx.transferPlayback);

	function iconFor(type) {
		const value = String(type ?? '').toLowerCase();
		if (value.includes('smartphone') || value.includes('phone')) return Smartphone;
		if (value.includes('speaker')) return Speaker;
		if (value.includes('computer')) return Laptop;
		return MonitorSpeaker;
	}
</script>

{#if devicePickerOpen}
	<button class="modal-backdrop" onclick={() => setUiState('devicePickerOpen', false)} aria-label="Close devices"></button>
	<section class="connect-sheet" aria-label="Spotify devices">
		<header>
			<div>
				<span>Spotify Connect</span>
				<h2>Play on a device</h2>
			</div>
			<div class="sheet-actions">
				<button onclick={loadDevices} aria-label="Refresh devices"><RefreshCw size={16} /></button>
				<button onclick={() => setUiState('devicePickerOpen', false)} aria-label="Close"><X size={18} /></button>
			</div>
		</header>

		{#if devicesLoading}
			<div class="sheet-loading"><LoaderCircle class="spin" size={22} /> Finding devices…</div>
		{:else if devices.length}
			<div class="device-list">
				{#each devices as device}
					{@const Icon = iconFor(device.type)}
					<button class:active={device.is_active || device.id === deviceId} disabled={device.is_restricted} onclick={() => transferPlayback(device.id)}>
						<div class="device-icon"><Icon size={20} /></div>
						<span>
							<strong>{device.name}</strong>
							<small>{device.type || 'Spotify device'}{device.is_restricted ? ' · Restricted' : ''}</small>
						</span>
						{#if device.is_active || device.id === deviceId}<Check size={17} />{/if}
					</button>
				{/each}
			</div>
		{:else}
			<div class="sheet-empty">No Spotify Connect devices found.</div>
		{/if}
	</section>
{/if}
