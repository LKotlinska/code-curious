<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import InlinePanel from './InlinePanel.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import type { StringVariable } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store

	import { checkIfDeletable } from '$lib/utils/checkIfDeletable';
	import { colors } from '$lib/utils/colors';

	export let editMode: boolean;
	export let isOpen: boolean;
	export let variableId;
	let variable: StringVariable;
	let showColorPicker: boolean = false;
	let errorMsg: string = '';

	// Snapshot store
	$: _snapshot = $snapshot;

	if (editMode && variableId !== undefined) {
		// Clone the variable to avoid directly modifying the store object
		variable = { ...$snapshot.find((v) => v.id === variableId) } as StringVariable;
	} else {
		// If not in edit mode, create a new variable
		variable = {
			id: Date.now(),
			blockType: 'variable',
			name: '',
			type: 'string',
			value: '',
		};
	}

	const dispatch = createEventDispatcher();

	const closeModal = () => {
		dispatch('close');
	};

	const deleteVariable = () => {
		// Check if variable is deletable
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is being used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		dispatch('close');
	};

	const onSave = () => {
		// Add default name and or value, if empty
		if (variable.name === '') variable.name = 'new string';
		if (variable.value === '') variable.value = 'value';
		if (editMode) {
			// Update variable in snapshot store
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			dispatch('close');
			return;
		} else {
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		dispatch('close');
	};

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	const handleValueChange = (event: Event) => {
		variable.value = (event.target as HTMLInputElement).value;
	};

	// Get color from colors.json
	const getColor = (value: string) => {
		const key: string | undefined = value.replace(/\s/g, '');
		// Check if key exists in colors, if not return null
		return colors[key] ? colors[key][0] : null;
	};
</script>

<InlinePanel {isOpen} on:close={closeModal}>
	<div slot="header" class="card-header flex justify-between items-start">
		<div class="flex flex-col">
			<!-- Display item type if in edit mode -->
			{#if editMode}
				<h4 class="text-sm text-secondary-500">String</h4>
			{/if}
			<h4 class="text-lg font-semibold">
				{editMode ? variable.name : 'New String'}
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
		<div class="flex gap-4 items-end">
			<!-- Value Input -->
			<label class="label">
				<span>Value</span>
				<input
					class="input"
					type="text"
					bind:value={variable.value}
					on:input={handleValueChange}
					name="text"
					required
					maxlength="50"
				/>
			</label>
			{#if showColorPicker && getColor(variable.value)}
				<div
					class="w-[45px] h-[45px] rounded-full border-2 border-white"
					style={'background-color: ' + getColor(variable.value)}
				></div>
			{/if}
		</div>
		<label class="flex items-center space-x-2">
			<input class="checkbox" type="checkbox" name="colorPicker" bind:checked={showColorPicker} />
			<p>Show color picker</p>
		</label>

		<!-- Color Picker -->
		{#if showColorPicker}
			<div class="label">
				<span>Color Picker</span>
				<ColorPicker bind:value={variable.value} />
			</div>
		{/if}
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
