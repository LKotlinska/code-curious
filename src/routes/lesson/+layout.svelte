<script lang="ts">
	import { currentPanel } from '$lib/stores/store'; // Import the store
</script>

<slot></slot>

<!-- Mobile Buttons for Panel Toggle (shared) -->
<div class="bg-tertiary-800 fixed flex justify-center bottom-0 inset-x-0 lg:hidden z-50">
	<class class="flex justify-center m-2">
		<!-- The $ prefix is shorthand for subscribing to a store in Svelte. -->
		<button
			type="button"
			on:click={() => ($currentPanel = 1)}
			class="btn btn-sm {$currentPanel === 1
				? 'variant-filled-surface focus:variant-filled-surface'
				: ''}">Lesson</button
		>

		<button
			type="button"
			on:click={() => ($currentPanel = 2)}
			class="btn btn-sm {$currentPanel === 2
				? 'variant-filled-surface focus:variant-filled-surface'
				: ''}">Editor & Console</button
		>
		<button
			type="button"
			on:click={() => ($currentPanel = 3)}
			class="btn btn-sm {$currentPanel === 3
				? 'variant-filled-surface focus:variant-filled-surface'
				: ''}">Playfield</button
		>
	</class>
</div>
