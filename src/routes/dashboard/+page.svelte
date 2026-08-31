<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user, signOut } from '$lib/auth';
	import { onMount } from 'svelte';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { fetchLesson } from '$lib/utils/fetchLesson';
	import ConfirmButton from '../../components/ConfirmButton.svelte';

	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faArrowRight,
		faFloppyDisk,
		faExclamationTriangle,
		faRightFromBracket,
	} from '@fortawesome/free-solid-svg-icons';

	interface Snapshot {
		id: string;
		lesson_slug: string;
		snapshot_data: any;
		lesson_title?: string;
	}

	interface Lesson {
		id: string;
		slug: string;
		title: string;
	}

	const snapshots = writable<Snapshot[]>([]);
	const lessons = writable<Lesson[]>([]);
	const msg = writable<string | null>(null); // Initialize msg as writable
	const errorMsg = writable<string | null>(null); // Initialize errorMsg as writable
	let msgTimeout: ReturnType<typeof setTimeout> | undefined; // Declare a timeout for clearing msg
	let errorMsgTimeout: ReturnType<typeof setTimeout> | undefined; // Declare a timeout for clearing errorMsg

	let displayName = '';
	let displayNameError = '';

	let loading = true;
	let authLoading = true;
	let hasError = false;

	onMount(async () => {
		try {
			// Existing authentication and load setup
			await checkUserAuthentication();
			// Fetch lessons in try catch block
			let fetchedLessons: Lesson[] | null = null;
			fetchedLessons = await fetchLessons();
			// Sort lessons by ID, ascending
			lessons.set(
				fetchedLessons ? fetchedLessons.sort((a, b) => parseInt(a.id) - parseInt(b.id)) : [],
			);
		} catch (error: any) {
			console.error('Error during initialization:', error.message);
			displayErrorMessage('Failed to load data. Please try again.');
			hasError = true;
			return;
		} finally {
			authLoading = false;
		}
	});

	const fetchLessons = async (): Promise<Lesson[] | null> => {
		try {
			const { data: lessonsData, error } = await supabase.from('lessons').select('*');
			if (error) throw error;
			return lessonsData;
		} catch (error: any) {
			console.error('Error fetching lessons:', error.message);
			displayErrorMessage('Failed to load lessons.');
			return null;
		}
	};

	async function checkUserAuthentication() {
		try {
			const { data: authData, error } = await supabase.auth.getUser();
			if (error) throw error;

			if (authData.user) {
				user.set(authData.user);
				await loadSnapshots();
				displayName = (await getDisplayName()) || '';
			} else {
				user.set(null);
				goto('/sign-in');
			}
		} catch (error: any) {
			console.error('Error during authentication:', error.message);
			displayErrorMessage('Failed to authenticate. Redirecting to sign-in.');
			goto('/sign-in');
		} finally {
			loading = false;
		}
	}

	async function loadSnapshots() {
		if ($user) {
			try {
				const { data: snapshotsData, error } = await supabase
					.from('snapshots')
					.select('*')
					.eq('user_id', $user.id);

				if (error) throw error;

				const snapshotsWithTitles = await Promise.all(
					snapshotsData.map(async (snapshot) => {
						const lesson = await fetchLesson(snapshot.lesson_slug);
						return {
							...snapshot,
							lesson_title: lesson?.title || 'Unknown Lesson',
						};
					}),
				);

				snapshots.set(snapshotsWithTitles);
			} catch (error: any) {
				console.error('Error fetching snapshots:', error.message);
				displayErrorMessage('Failed to load snapshots.');
				snapshots.set([]); // Ensure default state
			}
		}
	}

	const getDisplayName = async (): Promise<string | null> => {
		try {
			const { data, error } = await supabase.auth.getUser();
			if (error) throw error;
			return data.user.user_metadata.display_name || '';
		} catch (error: any) {
			console.error('Error fetching display name:', error.message);
			return null;
		}
	};

	// Display message utility function
	function displayMessage(message: string) {
		msg.set(message); // Set the message
		clearTimeout(msgTimeout); // Clear any existing timeout
		msgTimeout = setTimeout(() => msg.set(null), 5000); // Clear message after duration
	}

	function displayErrorMessage(message: string) {
		errorMsg.set(message);
		clearTimeout(errorMsgTimeout);
		errorMsgTimeout = setTimeout(() => errorMsg.set(null), 5000);
	}

	async function updateDisplayName() {
		try {
			const { error } = await supabase.auth.updateUser({
				data: { display_name: displayName },
			});
			if (error) throw error;

			displayMessage('Username updated successfully!');
		} catch (error: any) {
			console.error('Error updating display name:', error.message);
			displayErrorMessage('Error updating display name.');
		}
	}

	async function deleteSnapshot(lessonSlug: string) {
		const { error } = await supabase.from('snapshots').delete().eq('lesson_slug', lessonSlug);
		if (error) {
			console.error(error);
			displayMessage('Error deleting snapshot.');
		} else {
			const updatedSnapshots = $snapshots.filter((snapshot) => snapshot.lesson_slug !== lessonSlug);
			snapshots.set(updatedSnapshots);
			displayMessage('Snapshot deleted successfully!');
		}
	}

	$: if (!$user && !authLoading) {
		goto('/sign-in');
	}
</script>

<div class="h-full w-full flex flex-col items-center">
	<div class="card mt-0 sm:mt-4 md:mt-12 md:w-1/2 rounded-none sm:rounded-2xl">
		{#if hasError}
			<section class="w-full p-4 flex justify-center items-start">
				<aside class="alert variant-ghost-warning mt-4">
					<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
					<div class="alert-message">
						<p>Failed to load content. Please try again later.</p>
					</div>
				</aside>
			</section>
		{:else if !hasError}
			{#if authLoading || loading}
				<header class="card-header">
					<div class="w-full p-4">
						<ProgressBar />
					</div>
				</header>
				<section class="p-4">
					<p>Please wait while we load your dashboard.</p>
				</section>
			{:else if $user}
				<header class="card-header">
					<h2 class="h2">Dashboard</h2>
				</header>
				<hr class="opacity-50 mt-4" />
				<!-- USER -->
				<section class="p-4 flex flex-col items-start gap-4">
					<h3 class="text-xl">User</h3>
					<form on:submit|preventDefault={updateDisplayName}>
						<label class="label">
							<span>Username</span>
							<div class="flex">
								<input
									id="displayName"
									class="input"
									type="text"
									bind:value={displayName}
									placeholder="Choose a username"
									autocomplete="off"
									maxlength="25"
								/>
								<button type="submit" class="btn-icon bg-initial ml-6">
									<FontAwesomeIcon icon={faFloppyDisk} />
									<span>Save <span class="sr-only">Username</span></span>
								</button>
							</div>
						</label>

						{#if displayNameError}
							<p class="error">{displayNameError}</p>
						{/if}
					</form>
				</section>
				<hr class="opacity-50" />
				<!-- LESSONS -->
				<section class="p-4 flex flex-col items-start gap-4">
					<h3 class="text-xl">Lessons</h3>
					<!-- Loop through lessons and display each in a list -->

					<nav class="list-nav">
						<ul>
							{#each $lessons as lesson}
								<li class="flex items-center">
									<a href={`/lesson/${lesson.slug}`}>
										<span class="badge"><FontAwesomeIcon icon={faArrowRight} /></span>
										<span class="flex items-center gap-4">{lesson.title} </span>
									</a>
									<!-- Check if there is a user snapshot saved for the current lesson -->
									{#if $snapshots.find((snapshot) => snapshot.lesson_slug === lesson.slug)}
										<ConfirmButton
											initiateText="Snapshot"
											initiateClass="btn btn-sm flex items-center gap-2"
											confirmText="Delete"
											confirmClass="btn btn-sm variant-outline-warning flex items-center gap-2"
											onConfirm={() => deleteSnapshot(lesson.slug)}
										></ConfirmButton>
									{/if}
								</li>
								<!-- If it's not the last iteration, ad an HR -->
								{#if lesson !== $lessons[$lessons.length - 1]}
									<hr class="opacity-50" />
								{/if}
							{/each}
						</ul>
					</nav>
				</section>
				<hr class="opacity-50 mb-4" />
				<footer class="card-footer">
					<button class="btn bg-primary-700 flex gap-2" type="button" on:click={signOut}
						><FontAwesomeIcon icon={faRightFromBracket} />Sign Out</button
					>
				</footer>
			{:else}
				<section class="p-4">Please log in to view your dashboard.</section>
			{/if}
		{/if}
	</div>
	<!-- Display the message if it exists -->
	{#if $msg}
		<aside class="alert variant-ghost-success mt-4">
			<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
			<div class="alert-message">
				<p>{$msg}</p>
			</div>
		</aside>
	{/if}
	{#if $errorMsg}
		<aside class="alert variant-ghost-error mt-4">
			<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
			<div class="alert-message">
				<p>{$errorMsg}</p>
			</div>
		</aside>
	{/if}
</div>
