<script lang="ts">
	import type { Snippet } from 'svelte';
	import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	interface Props {
		open?: boolean;
		topBorder?: boolean;
		rounded?: boolean;
		color?: string;
		summary?: Snippet;
		summaryButton?: Snippet;
		content?: Snippet;
	}

	let {
		open = false,
		topBorder = false,
		rounded = false,
		color = '',
		summary,
		summaryButton,
		content,
	}: Props = $props();

	// Local `isOpen` state for each instance, seeded once from the `open` prop
	// svelte-ignore state_referenced_locally
	let isOpen = $state(open);

	// Generate a unique ID for accessibility attributes
	const uniqueId = `accordion-${Math.random().toString(36)}`;

	// Toggle open/close state
	function toggleAccordion() {
		isOpen = !isOpen;
	}
</script>

<button
	type="button"
	class="w-full flex items-center justify-between space-x-4 py-3 px-4 {color} {topBorder
		? 'border-t border-zinc-700'
		: ''} {rounded ? 'rounded-t-xl' : ''} {rounded && !isOpen ? 'rounded-b-xl' : ''}"
	onclick={toggleAccordion}
	aria-expanded={isOpen}
	aria-controls={`${uniqueId}-content`}
	aria-label={isOpen ? 'Collapse details' : 'Expand details'}
>
	<span id={`${uniqueId}-summary`}>{@render summary?.()}</span>
	{@render summaryButton?.()}
	{#if isOpen}
		<FontAwesomeIcon icon={faAngleUp} />
	{:else}
		<FontAwesomeIcon icon={faAngleDown} />
	{/if}
</button>

<!-- Conditionally apply hidden class and add role for screen readers -->
<div
	class:!hidden={!isOpen}
	id={`${uniqueId}-content`}
	role="region"
	aria-labelledby={`${uniqueId}-summary`}
>
	<div>
		{@render content?.()}
	</div>
</div>
