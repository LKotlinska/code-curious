<script lang="ts">
	import { onMount } from 'svelte';
	import { Progress } from '@skeletonlabs/skeleton-svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
	import { fetchLessons, type LessonSummary } from '$lib/utils/fetchLessons';
	import LessonCard from '../../components/LessonCard.svelte';

	// Fallbacks for lessons that don't have description/duration set in the DB yet
	const DEFAULT_DESCRIPTION = 'No description yet — jump in and see what this lesson covers!';
	const DEFAULT_DURATION_MINUTES = 10;

	let lessons = $state<LessonSummary[]>([]);
	let loading = $state(true);
	let hasError = $state(false);

	onMount(async () => {
		const data = await fetchLessons();
		if (!data) {
			hasError = true;
			loading = false;
			return;
		}
		lessons = data;
		loading = false;
	});
</script>

<svelte:head>
	<title>Lessons | Code Curious</title>
</svelte:head>

<section class="p-4 md:p-8 max-w-6xl mx-auto w-full">
	<h2 class="h2 mb-2">Lessons</h2>
	<p class="opacity-80 mb-6">Pick a lesson to get started. You can jump around any time.</p>

	{#if hasError}
		<aside
			class="flex flex-col items-start gap-2 rounded-lg border border-warning-500 bg-warning-500/20 p-4"
		>
			<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
			<div class="flex-1">
				<p>Failed to load lessons. Please try again later.</p>
			</div>
		</aside>
	{:else if loading}
		<div class="w-full p-4">
			<Progress value={null}>
				<Progress.Track>
					<Progress.Range />
				</Progress.Track>
			</Progress>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each lessons as lesson}
				<LessonCard
					slug={lesson.slug}
					title={lesson.title}
					description={lesson.description ?? DEFAULT_DESCRIPTION}
					duration_minutes={lesson.duration_minutes ?? DEFAULT_DURATION_MINUTES}
				/>
			{/each}
		</div>
	{/if}
</section>
