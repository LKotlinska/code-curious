<script lang="ts">
	import StringModal from './StringModal.svelte';
	import NumberModal from './NumberModal.svelte';
	import BooleanModal from './BooleanModal.svelte';
	import ObjectModal from './ObjectModal.svelte';
	import ArrayModal from './ArrayModal.svelte';
	import NewVariable from './NewVariable.svelte';
	import LogModal from './LogModal.svelte';
	import NewLog from './NewLog.svelte';
	import VariableBlock from './VariableBlock.svelte';
	import ActionModal from './ActionModal.svelte';
	import ConfirmButton from './ConfirmButton.svelte';

	import {
		faBolt,
		faCircleExclamation,
		faEye,
		faPlus,
		faRotateRight,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	import { page } from '$app/stores';
	import { currentPanel, isRunning, resetMatterFlag } from '$lib/stores/store';
	import { snapshot, saveSnapshot, loadSnapshot } from '$lib/stores/snapshots';
	import { beforeNavigate } from '$app/navigation';

	interface Props {
		data: any;
		runner: () => Promise<void>;
	}

	let { data, runner }: Props = $props();

	let lessonSlug = $derived($page.params.lessonId);

	// Load snapshot data for the current lesson when the component mounts or lessonSlug changes
	$effect(() => {
		if (lessonSlug) {
			loadSnapshot(lessonSlug, data.snapshot);
		}
	});

	// Save the current snapshot before navigating to another route
	beforeNavigate(() => {
		if (lessonSlug) {
			saveSnapshot(lessonSlug, $snapshot);
		}
	});

	// ID of the block whose edit panel is currently open (blocks share one id space)
	let activeEditId: number | null = $state(null);
	// Type of the new block whose create panel is currently open, or null
	let newType: string | null = $state(null);

	const handleClose = () => {
		activeEditId = null;
		newType = null;
	};

	// Open a create panel below the button row (closing any edit panel first)
	const startNew = (type: string) => {
		activeEditId = null;
		newType = type;
	};

	// Get name of variable with the given ID
	const getVariableName = (id: number) => {
		const variable = $snapshot.find((v) => v.id === id);
		return variable ? variable.name : '';
	};

	function activateBlock(block: Record<string, any>) {
		newType = null;
		activeEditId = block.id;
	}

	// Reset Editor, either clear or load the default lesson snapshot--never the user's snapshot
	const resetEditor = () => {
		// Check in the fetched lesson data if there is a snapshot for the current lesson
		if (data.snapshot) {
			$snapshot = data.snapshot;
		} else $snapshot = [];
		// Toggle the flag to reset the Matter.js simulation
		resetMatterFlag.update((flag) => (flag = true));
	};
</script>

<div class="min-h-[320px] md:min-h-[360px] lg:min-h-[400px] flex flex-col justify-start gap-2">
	<section class="w-full flex justify-between items-center h-8">
		<ConfirmButton initiateText="Reset Editor" confirmText="Reset" onConfirm={resetEditor} />
		<!-- Run button, only show if currentPanel is 2, that is, not on desktop -->
		<button
			onclick={runner}
			type="button"
			disabled={$isRunning}
			class="btn btn-sm bg-primary-900 flex gap-2 {$currentPanel !== 2 ? 'hidden' : ''} lg:hidden"
		>
			{#if $isRunning}
				<FontAwesomeIcon icon={faCircleExclamation} /> Running
			{/if}
			{#if !$isRunning}
				<FontAwesomeIcon icon={faRotateRight} /> Run
			{/if}
		</button>
	</section>
	<hr class="opacity-50" />

	<section class="flex flex-col items-start gap-2 py-2">
		<!--- Loop through each object in snapshot -->
		{#if $snapshot.length > 0}
			{#each $snapshot as block (block.id)}
				<!-- Variable block -->
				{#if block.blockType === 'variable'}
					<VariableBlock {block} onActivate={() => activateBlock(block)} showActionButton={true} />
				{/if}
				<!-- Log block -->
				{#if block.blockType === 'log'}
					<button
						onclick={() => {
							activateBlock(block);
						}}
						type="button"
					>
						<div class="p-1 flex border border-secondary-900 text-sm font-normal">
							<div class="flex gap-2 font-bold text-sm items-center px-2 py-1">
								<FontAwesomeIcon icon={faEye} /> Log
							</div>

							{#if block.message}
								<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
									{`"${block.message}"`}
								</div>
							{/if}
							{#if block.selectedId}
								<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
									<span class="badge preset-filled text-md font-bold rounded-none"
										>{getVariableName(block.selectedId)}</span
									>
								</div>
							{/if}
							{#if block.useIndex}
								<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
									{block.useIndex ? `index: ${block.selectedIndex}` : ``}
								</div>{/if}
							{#if block.useKey}
								<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
									{block.useKey ? `key: ${block.selectedKey}` : ``}
								</div>
							{/if}
						</div>
					</button>
				{/if}
				<!-- Action block -->
				{#if block.blockType === 'action'}
					<button
						onclick={() => {
							activateBlock(block);
						}}
						type="button"
					>
						<div class="p-1 flex border border-secondary-900 text-sm font-normal">
							<div class="flex gap-2 font-bold text-sm items-center px-2 py-1">
								<FontAwesomeIcon icon={faBolt} />
								<!-- {block.action.charAt(0).toUpperCase() + block.action.slice(1)} -->
								{block.action}
							</div>
							<div class="px-2 py-1 flex gap-2 items-center border-l-[1px] border-secondary-900">
								<span class="badge preset-filled text-md font-bold rounded-none">
									{getVariableName(block.variableId)}
								</span>
							</div>
						</div>
					</button>
				{/if}

				<!-- Edit panel, opens attached to the block being edited -->
				{#if activeEditId === block.id}
					<div class="w-full pl-4 border-l-2 border-secondary-900">
						{#if block.blockType === 'log'}
							<LogModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{:else if block.blockType === 'action'}
							<ActionModal
								editMode={true}
								isOpen
								variableId={null}
								actionId={block.id}
								onclose={handleClose}
							/>
						{:else if block.type === 'string'}
							<StringModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{:else if block.type === 'number'}
							<NumberModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{:else if block.type === 'boolean'}
							<BooleanModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{:else if block.type === 'object'}
							<ObjectModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{:else if block.type === 'array'}
							<ArrayModal editMode={true} isOpen variableId={block.id} onclose={handleClose} />
						{/if}
					</div>
				{/if}
			{/each}
		{/if}
	</section>
	<hr class="opacity-50" />

	<!-- Add-block buttons: always their own line, never pushed around by an open panel -->
	<section class="flex flex-wrap gap-2 lg:gap-4 items-start pt-2">
		<NewVariable onpick={(type) => startNew(type)} />
		<NewLog onpick={(type) => startNew(type)} />
		<button
			onclick={() => startNew('action')}
			type="button"
			class="btn btn-sm bg-primary-900 flex gap-2"
		>
			<FontAwesomeIcon icon={faPlus} /> Action
		</button>
	</section>

	<!-- New-block form: full width, in its own space below the buttons -->
	{#if newType}
		<div class="w-full mt-4">
			{#if newType === 'string'}
				<StringModal editMode={false} isOpen variableId={undefined} onclose={handleClose} />
			{:else if newType === 'number'}
				<NumberModal editMode={false} isOpen variableId={undefined} onclose={handleClose} />
			{:else if newType === 'boolean'}
				<BooleanModal editMode={false} isOpen variableId={null} onclose={handleClose} />
			{:else if newType === 'object'}
				<ObjectModal editMode={false} isOpen variableId={null} onclose={handleClose} />
			{:else if newType === 'array'}
				<ArrayModal editMode={false} isOpen variableId={null} onclose={handleClose} />
			{:else if newType === 'log'}
				<LogModal editMode={false} isOpen variableId={null} onclose={handleClose} />
			{:else if newType === 'action'}
				<ActionModal
					editMode={false}
					isOpen
					variableId={null}
					actionId={null}
					onclose={handleClose}
				/>
			{/if}
		</div>
	{/if}
</div>
