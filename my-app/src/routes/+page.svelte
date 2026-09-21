<script>
	import { loginWithSpotify } from '$lib/spotify';
</script>

<svelte:head>
	<title>VYRA</title>
</svelte:head>

<main>
	<h1>VYRA</h1>

	<p>Your music. Your way.</p>

	<button onclick={loginWithSpotify}>
		Login with Spotify
	</button>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0a0a0a;
		color: white;
		font-family: Arial, sans-serif;
	}

	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h1 {
		font-size: 64px;
		margin: 0;
	}

	p {
		color: #999;
	}

	button {
		margin-top: 20px;
		padding: 14px 24px;
		border: none;
		border-radius: 999px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
	}
</style>