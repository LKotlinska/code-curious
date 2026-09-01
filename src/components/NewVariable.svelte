<!-- NewVariable is the 'Variable' button in the Editor. Picking a type asks the Editor to open the matching new-variable panel below the button row. -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	const dispatch = createEventDispatcher();

	let showMenu = false;
	const toggleMenu = () => {
		showMenu = !showMenu;
	};

	const pick = (type: string) => {
		showMenu = false;
		dispatch('pick', type);
	};
</script>

<div class="flex">
	<div>
		<button on:click={toggleMenu} class="btn btn-sm bg-primary-900 flex gap-2">
			<FontAwesomeIcon icon={faPlus} /> Variable
		</button>
	</div>
	{#if showMenu}
		<div class="flex flex-wrap">
			<button class="btn btn-sm" on:click={() => pick('string')}>String</button>
			<button class="btn btn-sm" on:click={() => pick('number')}>Number</button>
			<button class="btn btn-sm" on:click={() => pick('boolean')}>Boolean</button>
			<button class="btn btn-sm" on:click={() => pick('object')}>Object</button>
			<button class="btn btn-sm" on:click={() => pick('array')}>Array</button>
		</div>
	{/if}
</div>
