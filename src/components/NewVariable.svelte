<!-- NewVariable is the 'Variable' button in the Editor. Picking a type asks the Editor to open the matching new-variable panel below the button row. -->
<script lang="ts">
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	interface Props {
		onpick: (type: string) => void;
	}

	let { onpick }: Props = $props();

	let showMenu = $state(false);
	const toggleMenu = () => {
		showMenu = !showMenu;
	};

	const pick = (type: string) => {
		showMenu = false;
		onpick(type);
	};
</script>

<div class="flex">
	<div>
		<button onclick={toggleMenu} class="btn btn-sm bg-primary-900 flex gap-2">
			<FontAwesomeIcon icon={faPlus} /> Variable
		</button>
	</div>
	{#if showMenu}
		<div class="flex flex-wrap">
			<button class="btn btn-sm" onclick={() => pick('string')}>String</button>
			<button class="btn btn-sm" onclick={() => pick('number')}>Number</button>
			<button class="btn btn-sm" onclick={() => pick('boolean')}>Boolean</button>
			<button class="btn btn-sm" onclick={() => pick('object')}>Object</button>
			<button class="btn btn-sm" onclick={() => pick('array')}>Array</button>
		</div>
	{/if}
</div>
