<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		// Props
		isOpen?: boolean; // Modal visibility control
		onclose: () => void;
		header?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let { isOpen = false, onclose, header, content, footer }: Props = $props();

	// Close modal on escape key press
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
			//isOpen = false;
		}
	}

	let modalContainer: HTMLDivElement | null = $state(null);

	// Close modal on outside click
	function handleClickOutside(event: MouseEvent) {
		if (isOpen && event.target === modalContainer) {
			onclose();
		}
	}

	onMount(() => {
		// Add event listener to handle "Escape" key close
		window.addEventListener('keydown', handleKeydown);
		// Add event listener to handle outside click close
		window.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('click', handleClickOutside);
		};
	});
</script>

{#if isOpen}
	<!-- Background overlay -->
	<div
		bind:this={modalContainer}
		class="fixed inset-0 bg-neutral-900/50 z-50 flex items-start justify-center pt-0 md:pt-2"
		role="dialog"
	>
		<!-- Modal container -->
		<dialog
			open
			class="m-2 card w-full text-token space-y-4 rounded-lg shadow-lg overflow-hidden max-w-md z-50 relative"
		>
			<header>
				{@render header?.()}
			</header>
			<hr class="opacity-50" />
			<section>{@render content?.()}</section>
			<hr class="opacity-50" />
			<footer>
				{@render footer?.()}
			</footer>
		</dialog>
	</div>
{/if}
