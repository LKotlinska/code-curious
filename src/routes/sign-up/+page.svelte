<script lang="ts">
	import { register, user } from '$lib/auth';
	import { goto } from '$app/navigation';

	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

	$: if ($user) {
		goto('/dashboard')
	}

	let email = '';
	let password = '';
	let confirmPassword = '';
	let errorMsg = '';

	async function handleRegister() {
		// Check if passwords match
		if (password !== confirmPassword) {
			errorMsg = 'Passwords do not match.';
			return;
		}

		const error = await register(email, password);
		if (error) {
			errorMsg = error.message;
		} else {
			goto('/sign-in');
		}
	}
</script>

<div class="h-full w-full flex justify-center">
	<div class="card mt-4 md:mt-12 max-w-96 md:w-96">
		<header class="card-header">
			<h2 class="h2">Sign Up</h2>
		</header>
		<hr class="opacity-50 mt-2" />
		<section class="p-4">
			<form on:submit|preventDefault={handleRegister} class="flex flex-col gap-4">
				<label class="label"
					><span>Email</span><input
						class="input"
						name="email"
						bind:value={email}
						type="email"
						autocomplete="email"
						required
					/></label
				>
				<label class="label"
					><span>Password</span><input
						class="input"
						name="password"
						bind:value={password}
						type="password"
						autocomplete="current-password"
						required
					/></label
				>
				<label class="label"
					><span>Confirm Password</span><input
						class="input"
						name="confirm"
						bind:value={confirmPassword}
						type="password"
						autocomplete="off"
						required
					/></label
				>
				<div class="flex items-start">
					<button type="submit" class="btn bg-primary-700">Sign Up</button>
				</div>
			</form>
		</section>
		{#if errorMsg}
			<hr class="opacity-50 mb-4" />
			<footer class="card-footer">
				<aside class="alert variant-ghost-error">
					<!-- Icon -->
					<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
					<!-- Message -->
					<div class="alert-message">
						<p>{errorMsg}</p>
					</div>
				</aside>
			</footer>
		{/if}
	</div>
</div>
