<script lang="ts">
	import ActionModal from './ActionModal.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faBolt } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		// Props for block details and functions to handle activation
		block: any;
		onActivate: () => void;
		showActionButton?: boolean;
	}

	let { block, onActivate, showActionButton = false }: Props = $props();

	let isOpen: boolean = $state(false);

	const openAction = () => {
		isOpen = true;
	};

	const closeAction = () => {
		isOpen = false;
	};
</script>

<div class="flex">
	<button onclick={onActivate} type="button">
		<div class="p-1 flex border border-secondary-900 text-sm font-normal">
			<div class="px-2 py-1 flex gap-2 items-center">
				<span class="badge preset-filled text-md font-bold rounded-none">{block.name}</span>
			</div>
			<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
				{#if block.type === 'object'}
					{JSON.stringify(block.value).substring(0, 30)} ...
				{:else if block.type === 'array'}
					{#if Array.isArray(block.value)}
						{#each block.value as item, i}
							{#if typeof item === 'object' && i === 0}
								{JSON.stringify(item).substring(0, 30)} ...
							{:else if typeof item !== 'object'}
								{#if i < block.value.length - 1}
									{item}<span class="inline mx-0.25 text-zinc-700">|</span>
								{:else}
									{item}
								{/if}
							{/if}
						{/each}
					{/if}
				{:else}
					{block.value}
				{/if}
			</div>
		</div>
	</button>

	{#if showActionButton}
		<button onclick={openAction} type="button" class="btn btn-sm">
			<FontAwesomeIcon icon={faBolt} /> <span class="sr-only">Add Action</span>
		</button>
	{/if}
</div>

{#if isOpen}
	<ActionModal
		editMode={false}
		{isOpen}
		variableId={block.id}
		actionId={null}
		onclose={closeAction}
	/>
{/if}
