<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		// Props
		isOpen?: boolean; // Panel visibility control
		onclose: () => void;
		header?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let { isOpen = false, onclose, header, content, footer }: Props = $props();

	// The parent mounts/unmounts this component, so `isOpen` is already true on the
	// first render and the intro transition never runs. Flip a local flag after
	// mount so the {#if} genuinely goes false -> true and slides in.
	let visible = $state(false);

	// Close panel on escape key press
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}

	onMount(() => {
		visible = true;
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if isOpen && visible}
	<div transition:slide={{ duration: 400 }} class="w-full card text-token rounded-lg p-4 space-y-3">
		<header>
			{@render header?.()}
		</header>
		<hr class="opacity-50" />
		<section>{@render content?.()}</section>
		<hr class="opacity-50" />
		<footer>
			{@render footer?.()}
		</footer>
	</div>
{/if}
