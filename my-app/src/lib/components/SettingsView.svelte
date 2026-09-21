<script>
	import { Check, Droplets, Gauge, MoonStar, Palette, Sparkles, Type, WandSparkles, Zap } from 'lucide-svelte';

	/** @type {Record<string, any>} */
	let { ctx = {} } = $props();
	let currentView = $derived(ctx.currentView);
	let visualEffects = $derived(ctx.visualEffects);
	let density = $derived(ctx.density);
	let dynamicColors = $derived(ctx.dynamicColors);
	let animatedBackgrounds = $derived(ctx.animatedBackgrounds);
	let autoOpenLyrics = $derived(ctx.autoOpenLyrics);
	let lyricsSize = $derived(ctx.lyricsSize);
	let updatePreference = $derived(ctx.updatePreference);
	let developerMode = $derived(ctx.developerMode);
	let toggleDeveloperMode = $derived(ctx.toggleDeveloperMode);
	let playerReady = $derived(ctx.playerReady);
	let deviceId = $derived(ctx.deviceId);
	let getTokenExpiry = $derived(ctx.getTokenExpiry);
	let themePreset = $derived(ctx.themePreset);
	let accentIntensity = $derived(ctx.accentIntensity);
	let motionIntensity = $derived(ctx.motionIntensity);
	let glassIntensity = $derived(ctx.glassIntensity);
	let autoTheme = $derived(ctx.autoTheme);
	let adaptivePerformance = $derived(ctx.adaptivePerformance);
</script>

{#if currentView === 'settings'}
	<section class="settings-view">
		<header class="settings-header">
			<div>
				<span class="settings-kicker">VYRA</span>
				<h1>Settings</h1>
				<p>Fine-tune how VYRA looks and feels.</p>
			</div>
		</header>

		<div class="settings-groups">
			<section class="settings-group">
				<div class="settings-group-heading">
					<div class="settings-icon"><Sparkles size={18} /></div>
					<div><h2>Visual effects</h2><p>Choose how much glass, blur and motion VYRA uses.</p></div>
				</div>
				<div class="segmented-control three-way" role="radiogroup" aria-label="Visual effects">
					{#each ['full', 'balanced', 'reduced'] as option}
						<button class:active={visualEffects === option} onclick={() => updatePreference('visualEffects', option)}>
							{#if visualEffects === option}<Check size={14} />{/if}
							<span>{option[0].toUpperCase() + option.slice(1)}</span>
						</button>
					{/each}
				</div>
			</section>

			<section class="settings-group">
				<div class="settings-group-heading">
					<div class="settings-icon"><Gauge size={18} /></div>
					<div><h2>Interface density</h2><p>Comfortable gives artwork more room. Compact fits more music on screen.</p></div>
				</div>
				<div class="segmented-control" role="radiogroup" aria-label="Interface density">
					{#each ['comfortable', 'compact'] as option}
						<button class:active={density === option} onclick={() => updatePreference('density', option)}>
							{#if density === option}<Check size={14} />{/if}
							<span>{option[0].toUpperCase() + option.slice(1)}</span>
						</button>
					{/each}
				</div>
			</section>

			<section class="settings-group settings-list-group">
				<div class="settings-row">
					<div class="settings-row-icon"><Palette size={17} /></div>
					<div><strong>Dynamic album colors</strong><span>Let artwork gently tint VYRA.</span></div>
					<button class="switch" class:on={dynamicColors} onclick={() => updatePreference('dynamicColors', !dynamicColors)} aria-label="Toggle dynamic album colors"><span></span></button>
				</div>
				<div class="settings-row">
					<div class="settings-row-icon"><WandSparkles size={17} /></div>
					<div><strong>Animated backgrounds</strong><span>Use subtle ambient movement behind the interface.</span></div>
					<button class="switch" class:on={animatedBackgrounds} onclick={() => updatePreference('animatedBackgrounds', !animatedBackgrounds)} aria-label="Toggle animated backgrounds"><span></span></button>
				</div>
			</section>


			<section class="settings-group">
				<div class="settings-group-heading"><div class="settings-icon"><MoonStar size={18}/></div><div><h2>Theme</h2><p>Keep VYRA dark, but change the character of the surfaces.</p></div></div>
				<div class="segmented-control four-way" role="radiogroup" aria-label="Theme preset">
					{#each ['graphite', 'midnight', 'oled', 'black'] as option}<button class:active={themePreset === option} onclick={() => updatePreference('themePreset', option)}>{#if themePreset === option}<Check size={14}/>{/if}<span>{option[0].toUpperCase()+option.slice(1)}</span></button>{/each}
				</div>
				<div class="settings-row inset-row"><div><strong>Auto theme by time</strong><span>Use a deeper OLED look late at night.</span></div><button class="switch" class:on={autoTheme} onclick={() => updatePreference('autoTheme', !autoTheme)} aria-label="Toggle automatic theme by time"><span></span></button></div>
			</section>

			<section class="settings-group">
				<div class="settings-group-heading"><div class="settings-icon"><Droplets size={18}/></div><div><h2>Material</h2><p>Control accent presence, motion and glass without changing the layout.</p></div></div>
				<div class="settings-label">Accent intensity</div>
				<div class="segmented-control three-way">{#each ['subtle','normal','expressive'] as option}<button class:active={accentIntensity === option} onclick={() => updatePreference('accentIntensity', option)}>{#if accentIntensity === option}<Check size={14}/>{/if}<span>{option[0].toUpperCase()+option.slice(1)}</span></button>{/each}</div>
				<div class="settings-label">Motion</div>
				<div class="segmented-control three-way">{#each ['low','default','expressive'] as option}<button class:active={motionIntensity === option} onclick={() => updatePreference('motionIntensity', option)}>{#if motionIntensity === option}<Check size={14}/>{/if}<span>{option[0].toUpperCase()+option.slice(1)}</span></button>{/each}</div>
				<div class="settings-label">Glass</div>
				<div class="segmented-control three-way">{#each ['off','light','full'] as option}<button class:active={glassIntensity === option} onclick={() => updatePreference('glassIntensity', option)}>{#if glassIntensity === option}<Check size={14}/>{/if}<span>{option[0].toUpperCase()+option.slice(1)}</span></button>{/each}</div>
			</section>

			<section class="settings-group settings-list-group">
				<div class="settings-row"><div class="settings-row-icon"><Zap size={17}/></div><div><strong>Adaptive performance</strong><span>Let VYRA reduce expensive ambient effects when the UI is under load.</span></div><button class="switch" class:on={adaptivePerformance} onclick={() => updatePreference('adaptivePerformance', !adaptivePerformance)} aria-label="Toggle adaptive performance"><span></span></button></div>
			</section>
			<section class="settings-group">
				<div class="settings-group-heading">
					<div class="settings-icon"><Type size={18} /></div>
					<div><h2>Lyrics</h2><p>Adjust lyric presentation without changing playback timing.</p></div>
				</div>
				<div class="settings-row inset-row">
					<div><strong>Auto-open lyrics</strong><span>Open the lyrics drawer when the song changes.</span></div>
					<button class="switch" class:on={autoOpenLyrics} onclick={() => updatePreference('autoOpenLyrics', !autoOpenLyrics)} aria-label="Toggle auto-open lyrics"><span></span></button>
				</div>
				<div class="settings-label">Text size</div>
				<div class="segmented-control three-way" role="radiogroup" aria-label="Lyrics text size">
					{#each ['small', 'normal', 'large'] as option}
						<button class:active={lyricsSize === option} onclick={() => updatePreference('lyricsSize', option)}>
							{#if lyricsSize === option}<Check size={14} />{/if}
							<span>{option[0].toUpperCase() + option.slice(1)}</span>
						</button>
					{/each}
				</div>
			</section>
		</div>
	
		<div class="settings-group developer-settings">
			<div class="settings-group-title"><h2>Advanced</h2><p>Useful while building VYRA.</p></div>
			<div class="settings-row"><div><strong>Developer mode</strong><span>Show playback and authorization diagnostics.</span></div><button class="settings-toggle" class:on={developerMode} onclick={toggleDeveloperMode} aria-pressed={developerMode} aria-label="Toggle developer mode"><i></i></button></div>
			{#if developerMode}
				<div class="developer-panel"><code>player: {playerReady ? 'ready' : 'connecting'}</code><code>device: {deviceId || 'none'}</code><code>token expires: {new Date(getTokenExpiry()).toLocaleString()}</code></div>
			{/if}
		</div>
</section>
{/if}
