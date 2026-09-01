<script lang="ts">
	import { currentPanel } from '$lib/stores/store';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props(); // Import the store
</script>

{@render children?.()}

<!-- Mobile Buttons for Panel Toggle (shared) -->
<div class="bg-tertiary-800 fixed flex justify-center bottom-0 inset-x-0 lg:hidden z-50">
	<class class="flex justify-center m-2">
		<!-- The $ prefix is shorthand for subscribing to a store in Svelte. -->
		<button
			type="button"
			onclick={() => ($currentPanel = 1)}
			class="btn btn-sm {$currentPanel === 1 ? 'preset-filled-surface-500' : ''}">Lesson</button
		>

		<button
			type="button"
			onclick={() => ($currentPanel = 2)}
			class="btn btn-sm {$currentPanel === 2 ? 'preset-filled-surface-500' : ''}"
			>Editor & Console</button
		>
		<button
			type="button"
			onclick={() => ($currentPanel = 3)}
			class="btn btn-sm {$currentPanel === 3 ? 'preset-filled-surface-500' : ''}">Playfield</button
		>
	</class>
</div>
