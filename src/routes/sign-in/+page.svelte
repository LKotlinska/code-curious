<script lang="ts">
	import { signIn, user } from '$lib/auth';
	import { goto } from '$app/navigation';

	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faExclamationTriangle, faRightToBracket } from '@fortawesome/free-solid-svg-icons';

	$effect(() => {
		if ($user) {
			goto('/dashboard');
		}
	});

	let email = $state('');
	let password = $state('');
	let errorMsg = $state('');

	async function handleSignIn() {
		const error = await signIn(email, password);
		if (error) {
			errorMsg = error.message;
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="h-full w-full flex justify-center">
	<div class="card mt-4 md:mt-12 max-w-96 md:w-96">
		<header class="card-header">
			<h2 class="h2">Sign In</h2>
		</header>
		<hr class="opacity-50 mt-4" />
		<section class="p-4">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSignIn();
				}}
				class="flex flex-col gap-4"
			>
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
				<div class="flex items-start">
					<button type="submit" class="btn bg-primary-700 flex gap-2"
						><FontAwesomeIcon icon={faRightToBracket} />Sign In</button
					>
				</div>
				{#if errorMsg}
					<hr class="opacity-50" />
					<aside
						class="flex flex-col items-start gap-2 rounded-lg border border-error-500 bg-error-500/20 p-4"
					>
						<!-- Icon -->
						<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
						<!-- Message -->
						<div class="flex-1">
							<p>{errorMsg}</p>
						</div>
					</aside>
				{/if}
			</form>
			<hr class="opacity-50 my-4" />
			<footer>
				Don't have an account? <a href="/sign-up" class="anchor">Sign up</a>
			</footer>
		</section>
	</div>
</div>
