export const clientId = 'b1b8e704e348442aa6d34c1233806c04';
export const redirectUri = 'http://https://vyra-github-io-lpgt.vercel.app/callback';

export const scopes = [
	'streaming',
	'user-read-email',
	'user-read-private',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-library-read',
	'user-library-modify',
	'user-follow-read',
	'user-follow-modify',
	'playlist-read-private',
	'user-read-recently-played'
];

const TOKEN_SKEW_MS = 60_000;
const PKCE_VERIFIER_KEY = 'spotify_code_verifier';

export function hasSpotifyPkceVerifier() {
	return Boolean(localStorage.getItem(PKCE_VERIFIER_KEY));
}

export function clearSpotifyPkceVerifier() {
	localStorage.removeItem(PKCE_VERIFIER_KEY);
}

/** @type {Promise<string> | null} */
let refreshPromise = null;

/**
 * @param {number} length
 */
function generateRandomString(length) {
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	const values = crypto.getRandomValues(new Uint8Array(length));

	return values.reduce(
		(acc, x) => acc + possible[x % possible.length],
		''
	);
}

/**
 * @param {string} plain
 */
async function sha256(plain) {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);

	return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * @param {ArrayBuffer} input
 */
function base64encode(input) {
	return btoa(String.fromCharCode(...new Uint8Array(input)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

/**
 * @param {{
 * 	access_token:string,
 * 	expires_in:number,
 * 	refresh_token?:string
 * }} data
 */
function storeTokenResponse(data) {
	localStorage.setItem(
		'spotify_access_token',
		data.access_token
	);

	if (data.refresh_token) {
		localStorage.setItem(
			'spotify_refresh_token',
			data.refresh_token
		);
	}

	localStorage.setItem(
		'spotify_token_expires',
		String(
			Date.now() +
				data.expires_in * 1000
		)
	);
}

export async function loginWithSpotify() {
	const codeVerifier =
		generateRandomString(64);

	const hashed =
		await sha256(codeVerifier);

	const codeChallenge =
		base64encode(hashed);

	localStorage.setItem(
		PKCE_VERIFIER_KEY,
		codeVerifier
	);

	const authUrl =
		new URL(
			'https://accounts.spotify.com/authorize'
		);

	authUrl.search =
		new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			scope: scopes.join(' '),
			code_challenge_method: 'S256',
			code_challenge: codeChallenge,
			redirect_uri: redirectUri
		}).toString();

	window.location.href =
		authUrl.toString();
}

/**
 * @param {string} code
 */
export async function getAccessToken(code) {
	const codeVerifier =
		localStorage.getItem(
			PKCE_VERIFIER_KEY
		);

	if (!codeVerifier) {
		const error = new Error(
			'Spotify login session expired. Please sign in again.'
		);
		// @ts-ignore - custom error code used by the callback route.
		error.code = 'SPOTIFY_PKCE_MISSING';
		throw error;
	}

	const body =
		new URLSearchParams({
			client_id: clientId,
			grant_type:
				'authorization_code',
			code,
			redirect_uri:
				redirectUri,
			code_verifier:
				codeVerifier
		});

	const response =
		await fetch(
			'https://accounts.spotify.com/api/token',
			{
				method: 'POST',

				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded'
				},

				body
			}
		);

	const data =
		await response.json();

	if (!response.ok) {
		console.error(
			'Spotify token error:',
			data
		);

		throw new Error(
			data?.error_description ??
				data?.error ??
				'Could not get Spotify access token'
		);
	}

	storeTokenResponse(data);

	clearSpotifyPkceVerifier();

	return data.access_token;
}

export function getStoredToken() {
	return localStorage.getItem(
		'spotify_access_token'
	);
}

export function getTokenExpiry() {
	return Number(
		localStorage.getItem(
			'spotify_token_expires'
		) ?? '0'
	);
}

export async function refreshAccessToken() {
	if (refreshPromise) {
		return refreshPromise;
	}

	const refreshToken =
		localStorage.getItem(
			'spotify_refresh_token'
		);

	if (!refreshToken) {
		throw new Error(
			'Spotify refresh token missing. Please sign in again.'
		);
	}

	refreshPromise =
		(async () => {
			const body =
				new URLSearchParams({
					client_id:
						clientId,

					grant_type:
						'refresh_token',

					refresh_token:
						refreshToken
				});

			const response =
				await fetch(
					'https://accounts.spotify.com/api/token',
					{
						method:
							'POST',

						headers: {
							'Content-Type':
								'application/x-www-form-urlencoded'
						},

						body
					}
				);

			const data =
				await response.json();

			if (!response.ok) {
				throw new Error(
					data?.error_description ??
						data?.error ??
						'Could not refresh Spotify access token'
				);
			}

			storeTokenResponse(
				data
			);

			return data.access_token;
		})();

	try {
		return await refreshPromise;
	} finally {
		refreshPromise = null;
	}
}

/**
 * @param {boolean} [forceRefresh]
 */
export async function getValidAccessToken(
	forceRefresh = false
) {
	const accessToken =
		getStoredToken();

	const expiresAt =
		getTokenExpiry();

	const shouldRefresh =
		forceRefresh ||
		!accessToken ||
		!expiresAt ||
		Date.now() >=
			expiresAt -
				TOKEN_SKEW_MS;

	if (
		!shouldRefresh &&
		accessToken
	) {
		return accessToken;
	}

	return refreshAccessToken();
}

export function logout() {
	localStorage.removeItem(
		'spotify_access_token'
	);

	localStorage.removeItem(
		'spotify_refresh_token'
	);

	localStorage.removeItem(
		'spotify_token_expires'
	);

	clearSpotifyPkceVerifier();
}
