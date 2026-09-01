<script lang="ts">
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

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		variableId: any;
		onclose: () => void;
	}

	let { editMode, isOpen, variableId, onclose }: Props = $props();

	// In edit mode, clone the variable to avoid directly modifying the store object.
	function buildVariable(): StringVariable {
		if (editMode && variableId !== undefined) {
			return { ...$snapshot.find((v) => v.id === variableId) } as StringVariable;
		}
		return { id: Date.now(), blockType: 'variable', name: '', type: 'string', value: '' };
	}

	let variable = $state<StringVariable>(buildVariable());
	let showColorPicker = $state(false);
	let errorMsg = $state('');

	// Snapshot store
	let _snapshot = $derived($snapshot);

	const closeModal = () => {
		onclose();
	};

	const deleteVariable = () => {
		// Check if variable is deletable
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is being used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		onclose();
	};

	const onSave = () => {
		// Add default name and or value, if empty
		if (variable.name === '') variable.name = 'new string';
		if (variable.value === '') variable.value = 'value';
		if (editMode) {
			// Update variable in snapshot store
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			onclose();
			return;
		} else {
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		onclose();
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

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				<!-- Display item type if in edit mode -->
				{#if editMode}
					<h4 class="text-sm text-secondary-500">String</h4>
				{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? variable.name : 'New String'}
				</h4>
			</div>
			<button onclick={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
		</div>
	{/snippet}
	{#snippet content()}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				onSave();
			}}
			class="px-4 flex flex-col gap-4 items-start"
		>
			<!-- Variable Name Input -->
			<label class="label">
				<span>Label</span>
				<input
					class="input"
					type="text"
					bind:value={variable.name}
					oninput={handleNameChange}
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
						oninput={handleValueChange}
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
	{/snippet}
	{#snippet footer()}
		<div>
			<div class="card-footer flex flex-col">
				<div class="flex justify-between">
					{#if editMode}
						<button
							type="button"
							onclick={deleteVariable}
							class="btn btn-sm bg-primary-700 flex gap-2"
						>
							<FontAwesomeIcon icon={faTrash} /> Delete
						</button>
					{:else}
						<div></div>
					{/if}
					<div class="flex">
						<button onclick={closeModal} class="btn"> Cancel </button>
						<button onclick={onSave} class="btn btn-sm bg-secondary-700 flex gap-2">
							<FontAwesomeIcon icon={faFloppyDisk} /> Save
						</button>
					</div>
				</div>
				{#if errorMsg !== ''}
					<aside
						class="mt-4 flex flex-col items-start gap-2 rounded-lg border border-error-500 bg-error-500/20 p-4"
					>
						<p class="flex gap-4 items-center text-sm sm:text-lg">
							<span class="hidden sm:inline-block"
								><FontAwesomeIcon icon={faExclamationTriangle} /></span
							>{errorMsg}
						</p>
					</aside>
				{/if}
			</div>
		</div>
	{/snippet}
</InlinePanel>
