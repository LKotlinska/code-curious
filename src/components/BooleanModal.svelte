<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import InlinePanel from './InlinePanel.svelte';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { BooleanVariable } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store
	import { checkIfDeletable } from '$lib/utils/checkIfDeletable';

	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	export let editMode: boolean;
	export let isOpen: boolean;
	export let variableId;
	let variable: BooleanVariable;
	let errorMsg: string = '';

	// The value of the radio button must be a string. Is converted to boolean when saving.
	let _boolString: string;

	$: _snapshot = $snapshot;

	if (variableId) {
		variable = $snapshot.find((v) => v.id === variableId) as BooleanVariable;
		_boolString = variable.value ? 'true' : 'false';
	} else {
		variable = {
			id: Date.now(),
			blockType: 'variable',
			name: '',
			type: 'boolean',
			value: false,
		};
		_boolString = 'false';
	}

	const dispatch = createEventDispatcher();

	const closeModal = () => {
		dispatch('close');
	};

	const deleteVariable = () => {
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is being used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		dispatch('close');
	};

	const onSave = () => {
		// Add default name and or value, if empty
		if (variable.name === '') variable.name = 'new boolean';
		if (!variable.value) variable.value = false;
		if (editMode) {
			// Convert string to boolean and update variable value
			variable.value = _boolString === 'true';
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			dispatch('close');
			return;
		} else {
			// Convert string to boolean and update variable value
			variable.value = _boolString === 'true';
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		dispatch('close');
	};

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	const handleValueChange = (event: Event) => {
		_boolString = (event.target as HTMLInputElement).value;
	};
</script>

<InlinePanel {isOpen} on:close={closeModal}>
	<div slot="header" class="card-header flex justify-between items-start">
		<div class="flex flex-col">
			{#if editMode}
				<h3 class="text-sm text-secondary-500">Boolean</h3>{/if}
			<h4 class="text-lg font-semibold">
				{editMode ? variable.name : 'New Boolean'}
			</h4>
		</div>
		<button on:click={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
	</div>
	<form
		slot="content"
		on:submit|preventDefault={onSave}
		class="px-4 flex flex-col gap-4 items-start"
	>
		<!-- Variable Name Input -->
		<label class="label">
			<span>Label</span>
			<input
				class="input"
				type="text"
				bind:value={variable.name}
				on:input={handleNameChange}
				name="name"
				autocomplete="off"
				required
				maxlength="25"
			/>
		</label>
		<!-- Value Input -->
		<div class="flex flex-col gap-1">
			<span>Value</span>
			<RadioGroup>
				<RadioItem
					bind:group={_boolString}
					name="justify"
					value={'true'}
					on:change={handleValueChange}>True</RadioItem
				>
				<RadioItem
					bind:group={_boolString}
					name="justify"
					value={'false'}
					on:change={handleValueChange}>False</RadioItem
				>
			</RadioGroup>
		</div>
		<!-- Hidden Submit Button -->
		<button type="submit" class="sr-only">Submit</button>
	</form>
	<div slot="footer">
		<div class="card-footer flex flex-col">
			<div class="flex justify-between">
				{#if editMode}
					<button
						type="button"
						on:click={deleteVariable}
						class="btn btn-sm bg-primary-700 flex gap-2"
					>
						<FontAwesomeIcon icon={faTrash} /> Delete
					</button>
				{:else}
					<div></div>
				{/if}
				<div class="flex">
					<button on:click={closeModal} class="btn"> Cancel </button>
					<button on:click={onSave} class="btn btn-sm bg-secondary-700 flex gap-2">
						<FontAwesomeIcon icon={faFloppyDisk} /> Save
					</button>
				</div>
			</div>
			{#if errorMsg !== ''}
				<aside class="alert variant-ghost-error mt-4">
					<p class="flex gap-4 items-center text-sm sm:text-lg">
						<span class="hidden sm:inline-block"
							><FontAwesomeIcon icon={faExclamationTriangle} /></span
						>{errorMsg}
					</p>
				</aside>
			{/if}
		</div>
	</div>
</InlinePanel>
