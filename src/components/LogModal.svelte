<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import { faFloppyDisk, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { Log } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		variableId: number | null;
		onclose: () => void;
	}

	let { editMode, isOpen, variableId, onclose }: Props = $props();

	let _snapshot = $derived($snapshot);

	// To determine if to show the variable selection dropdown
	let variableCount = $derived($snapshot.filter((v) => v.blockType === 'variable').length);

	function buildInitialState() {
		if (editMode && variableId) {
			// Clone the variable to avoid directly modifying the store object
			const v = { ...$snapshot.find((b) => b.id === variableId) } as Log;
			let object: Record<string, any> = {};
			let length = 0;
			// An array is being logged
			if (v.selectedType === 'array') {
				const selected = $snapshot.find((b) => b.id === v.selectedId);
				length = selected.value.length;
				// If the selected variable is an array of objects, seed the object with array[0]
				if (selected.value[0] && typeof selected.value[0] === 'object') {
					object = { ...selected.value[0] };
				}
			}
			// An object is being logged
			if (v.selectedType === 'object') {
				const selected = $snapshot.find((b) => b.id === v.selectedId);
				object = { ...selected.value };
			}
			return { variable: v, selectedObject: object, arrayLength: length };
		}
		// If not in edit mode, create a new variable
		return {
			variable: {
				id: Date.now(),
				blockType: 'log',
				selectedId: null,
				selectedIndex: 0,
				selectedKey: null,
				useIndex: false,
				useKey: false,
			} as Log,
			selectedObject: {} as Record<string, any>,
			arrayLength: 0,
		};
	}

	const initial = buildInitialState();
	let variable = $state<Log>(initial.variable);
	let selectedObject = $state<Record<string, any>>(initial.selectedObject);
	let arrayLength = $state(initial.arrayLength);

	const closeModal = () => {
		onclose();
	};

	const deleteVariable = () => {
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		onclose();
	};

	const onSave = () => {
		if (editMode) {
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			onclose();
			return;
		} else {
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		onclose();
	};

	const handleMessageChange = (event: Event) => {
		variable.message = (event.target as HTMLInputElement).value;
	};

	const updateSelectedVariable = () => {
		const selectedVariable = _snapshot.find((v) => v.id === variable.selectedId);
		// Update the selected variable type
		variable.selectedType = selectedVariable.type;
		// If variable is an array, get the length
		if (selectedVariable.type === 'array') {
			arrayLength = selectedVariable.value.length;
			// If the selected variable is an array of objects, set selectedObject to {}
			if (selectedVariable.value[0] && typeof selectedVariable.value[0] === 'object') {
				selectedObject = { ...selectedVariable.value[0] };
			}
		}
		//If the selected variable is an object, clone it to selectedObject
		if (selectedVariable.type === 'object') {
			selectedObject = { ...selectedVariable.value };
		}
	};
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				<!-- Display item type if in edit mode -->
				{#if editMode}
					<h4 class="text-sm text-secondary-500">Edit</h4>
				{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? 'Console Log' : 'New Console Log'}
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
			<!-- Message Input -->
			<label class="label">
				<span>Message</span>
				<input
					class="input"
					type="text"
					bind:value={variable.message}
					oninput={handleMessageChange}
					name="text"
					placeholder="Hello, World!"
					required
					maxlength="50"
				/>
			</label>
			<!-- Check if there is a variable to log -->
			{#if variableCount > 0}
				<div class="flex gap-4">
					<!-- Select variable to log -->
					<div class="label">
						<span>Variable</span>
						<!-- Select Dropdown: when a variable to log is selected (by id), we need
				 to look up that variable in to determine its type -->
						<select
							name="variable"
							class="select"
							bind:value={variable.selectedId}
							onchange={updateSelectedVariable}
						>
							{#each _snapshot as block (block.id)}
								<!-- Exclude variables of type log -->
								{#if block.blockType === 'variable'}
									<option value={block.id}>{block.name}</option>
								{/if}
							{/each}
						</select>
					</div>
					{#if variable.selectedType === 'array'}
						<label class="flex items-center space-x-2">
							<input
								class="checkbox"
								type="checkbox"
								name="use-index"
								bind:checked={variable.useIndex}
							/>
							<p>Index</p>
						</label>
					{/if}
					{#if variable.selectedType === 'object'}
						<label class="flex items-center space-x-2">
							<input
								class="checkbox"
								type="checkbox"
								name="use-key"
								bind:checked={variable.useKey}
							/>
							<p>Use key</p>
						</label>
					{/if}
				</div>
			{/if}
			<!-- Index Input -->
			{#if variable.selectedType === 'array' && variable.useIndex}
				<div class="flex gap-4">
					<label class="label w-20">
						<span>Index</span>
						<input
							class="input"
							type="number"
							min="0"
							max={arrayLength - 1}
							bind:value={variable.selectedIndex}
							name="index"
						/>
					</label>
					<!-- If it's an array of objects, option to select Key -->
					{#if variable.useIndex && selectedObject}
						<label class="flex items-center space-x-2">
							<input
								class="checkbox"
								type="checkbox"
								name="use-object-key"
								bind:checked={variable.useKey}
							/>
							<p>Key</p>
						</label>
					{/if}
				</div>
			{/if}
			<!-- Key selection for objects -->
			{#if variable.selectedType === 'object' && variable.useKey}
				<div class="label">
					<span>Key</span>
					<!-- Select Dropdown: when an object is selected for console logging, and the user has opted to specify a key to log, we need to display the available keys -->
					<select
						name="key"
						class="select"
						bind:value={variable.selectedKey}
						size={Object.keys(selectedObject).length + 1}
					>
						{#each Object.entries(selectedObject) as [key]}
							<option value={key}>{key}</option>
						{/each}
					</select>
				</div>
			{/if}
			<!-- Key selection for array of objects -->
			{#if variable.selectedType === 'array' && variable.useIndex && variable.useKey}
				<div class="label">
					<span>Key</span>
					<!-- Select Dropdown: when an object is selected for console logging, and the user has opted to specify a key to log, we need to display the available keys -->
					<select
						name="key"
						class="select"
						bind:value={variable.selectedKey}
						size={Object.keys(selectedObject).length + 1}
					>
						{#each Object.entries(selectedObject) as [key]}
							<option value={key}>{key}</option>
						{/each}
					</select>
				</div>
			{/if}
			<!-- Hidden Submit Button -->
			<button type="submit" class="sr-only">Submit</button>
		</form>
	{/snippet}
	{#snippet footer()}
		<div>
			<div class="card-footer flex justify-between">
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
		</div>
	{/snippet}
</InlinePanel>
