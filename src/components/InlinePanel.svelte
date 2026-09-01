<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	// Props
	export let isOpen: boolean = false; // Panel visibility control
	const dispatch = createEventDispatcher();

	// The parent mounts/unmounts this component, so `isOpen` is already true on the
	// first render and the intro transition never runs. Flip a local flag after
	// mount so the {#if} genuinely goes false -> true and slides in.
	let visible = false;

	// Close panel on escape key press
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dispatch('close');
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
	<div
		transition:slide={{ duration: 400 }}
		class="w-full card text-token rounded-lg p-4 space-y-3"
	>
		<header>
			<slot name="header"></slot>
		</header>
		<hr class="opacity-50" />
		<section><slot name="content"></slot></section>
		<hr class="opacity-50" />
		<footer>
			<slot name="footer"></slot>
		</footer>
	</div>
{/if}
