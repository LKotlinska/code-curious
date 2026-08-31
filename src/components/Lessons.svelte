<script lang="ts">
	import { marked } from 'marked';
	import Parser from './Parser.svelte';
	import { fetchLessonTitle } from '$lib/utils/fetchLessonTitle';
	import { fade } from 'svelte/transition';
	import NavButton from './NavButton.svelte';

	// Expose the data prop to receive the data from the parent +page.svelte
	export let data;
	let nextTitle = '';
	let previousTitle = '';
	let titlesLoaded: boolean = false;

	// When data changes, update the next and previous lesson titles using the fetchLessonTitle function
	$: {
		(async () => {
			titlesLoaded = false; // Set loading flag
			if (data.nextLesson) {
				const result = await fetchLessonTitle(data.nextLesson);
				nextTitle = result ? result.title : '';
			}
			if (data.prevLesson) {
				const result = await fetchLessonTitle(data.prevLesson);
				previousTitle = result ? result.title : '';
			}
			titlesLoaded = true; // Titles are now loaded
		})();
	}

	// Helper function to split placeholder at , into an array
	const parsePlaceholder = (placeholder: string) => {
		let placeholderArray: string[] = placeholder.split('|').map((item) => item.trim());
		placeholderArray[0] = placeholderArray[0].replace('{{', '');
		return placeholderArray;
	};
</script>

<div class="p-4 mb-[48px] md:mb-[58px] lg:mb-0 md:overflow-x-scroll">
	<div class="h-6 lg:h-8 mb-4">
		{#if titlesLoaded}
			<div class="flex justify-between" in:fade={{ duration: 250 }}>
				{#if data.prevLesson && previousTitle}
					<NavButton
						styles={'anchor'}
						path={data.prevLesson}
						label={previousTitle}
						arrows={'left'}
					/>
				{/if}
				{#if data.nextLesson && data.nextLesson !== 'lesson-1'}
					<NavButton 
						styles={"anchor hidden lg:inline"}
						path={data.nextLesson}
						label={nextTitle}
						arrows={"right"}
					/>
				{/if}
			</div>
		{/if}
	</div>
	<h3 class="mb-2 text-3xl">{data.title}</h3>
	<div>
		{#each data.content as content}
			{#if content.startsWith('{{')}
				<Parser placeholder={parsePlaceholder(content)} />
			{:else}
				<div class="markdown">
					{@html marked(content)}
				</div>
			{/if}
		{/each}
	</div>
	<div>
		{#if titlesLoaded}
			<div in:fade={{ duration: 250 }} class="flex justify-end my-8">
				{#if data.nextLesson === 'lesson-1'}
					<NavButton styles={"anchor"} path={data.nextLesson} label={"Start the first lesson"} arrows={"right"}/>
				{:else if data.nextLesson}
					<NavButton styles={"anchor"} path={data.nextLesson} label={nextTitle} arrows={"right"} />
				{/if}
			</div>
		{/if}
	</div>
</div>
