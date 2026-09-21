<script>
	import { onMount } from 'svelte';
	import {
		clearSpotifyPkceVerifier,
		getAccessToken,
		hasSpotifyPkceVerifier,
		loginWithSpotify
	} from '$lib/spotify';

	let status = $state('Logging you in...');
	let canRetry = $state(false);

	function cleanCallbackUrl() {
		window.history.replaceState({}, '', '/callback');
	}

	async function restartLogin() {
		canRetry = false;
		status = 'Restarting Spotify sign-in...';
		clearSpotifyPkceVerifier();
		cleanCallbackUrl();
		await loginWithSpotify();
	}

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get('code');
		const error = params.get('error');

		if (error) {
			cleanCallbackUrl();
			status = `Spotify login failed: ${error}`;
			canRetry = true;
			return;
		}

		if (!code) {
			status = 'No Spotify authorization code was received.';
			canRetry = true;
			return;
		}

		// A restored/old callback URL can outlive the PKCE verifier that created it.
		// Never try to exchange that stale code; start a fresh PKCE login instead.
		if (!hasSpotifyPkceVerifier()) {
			status = 'Your Spotify login session expired. Starting a fresh sign-in...';
			cleanCallbackUrl();

			try {
				await loginWithSpotify();
			} catch (loginError) {
				console.error(loginError);
				status = 'Spotify sign-in needs to be restarted.';
				canRetry = true;
			}
			return;
		}

		try {
			await getAccessToken(code);
			// Authorization codes are single-use. Remove them before leaving callback.
			cleanCallbackUrl();
			window.location.replace('/app');
		} catch (tokenError) {
			console.error(tokenError);
			clearSpotifyPkceVerifier();
			cleanCallbackUrl();
			status = 'Spotify login expired or could not be completed. Sign in again.';
			canRetry = true;
		}
	});
</script>

<svelte:head>
	<title>Connecting Spotify · VYRA</title>
</svelte:head>

<main class="callback-shell">
	<div class="callback-card">
		<div class="callback-mark" aria-hidden="true">V</div>
		<h1>Connecting Spotify</h1>
		<p>{status}</p>

		{#if canRetry}
			<button type="button" onclick={restartLogin}>Sign in with Spotify</button>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #050505;
		color: #f5f5f7;
		font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
	}

	.callback-shell {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 24px;
		box-sizing: border-box;
	}

	.callback-card {
		width: min(420px, 100%);
		text-align: center;
		padding: 34px 28px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.045);
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
	}

	.callback-mark {
		width: 58px;
		height: 58px;
		margin: 0 auto 18px;
		display: grid;
		place-items: center;
		border-radius: 17px;
		background: #f5f5f7;
		color: #090909;
		font-size: 27px;
		font-weight: 800;
		letter-spacing: -0.06em;
	}

	h1 {
		margin: 0;
		font-size: 28px;
		letter-spacing: -0.04em;
	}

	p {
		margin: 12px auto 0;
		max-width: 330px;
		color: #a1a1a6;
		line-height: 1.5;
	}

	button {
		margin-top: 22px;
		min-height: 44px;
		padding: 0 20px;
		border: 0;
		border-radius: 999px;
		background: #f5f5f7;
		color: #090909;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	button:active {
		transform: scale(0.98);
	}
</style>
