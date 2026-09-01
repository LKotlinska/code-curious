<!-- NewLog is the '+ Console Log' button in the Editor. When clicked, it asks the Editor to open a new-log panel below the button row. -->
<script lang="ts">
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	interface Props {
		onpick: (type: string) => void;
	}

	let { onpick }: Props = $props();
</script>

<button onclick={() => onpick('log')} class="btn btn-sm bg-primary-900 flex gap-2">
	<FontAwesomeIcon icon={faPlus} /> Console Log
</button>
