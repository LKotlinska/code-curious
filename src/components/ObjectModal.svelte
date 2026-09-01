<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import ObjectEdit from './ObjectEdit.svelte';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { ObjectVariable } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store
	import { checkIfDeletable } from '$lib/utils/checkIfDeletable';

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		variableId: any;
		onclose: () => void;
	}

	let { editMode, isOpen, variableId, onclose }: Props = $props();

	// In edit mode, clone the variable to avoid directly modifying the store object.
	function buildVariable(): ObjectVariable {
		if (editMode && variableId) {
			return { ...$snapshot.find((v) => v.id === variableId) } as ObjectVariable;
		}
		return { id: Date.now(), blockType: 'variable', name: '', type: 'object', value: { key1: '' } };
	}

	let variable = $state<ObjectVariable>(buildVariable());
	let errorMsg = $state('');

	let _snapshot = $derived($snapshot);

	const closeModal = () => {
		onclose();
	};

	const deleteVariable = () => {
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is being used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		onclose();
	};

	const onSave = () => {
		// Add default name, if empty
		if (variable.name === '') variable.name = 'new object';
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

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	// Listen for object updates from ObjectEdit component
	const handleObjectUpdate = (updatedObject: any) => {
		variable.value = updatedObject.value;
	};
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				<!-- Display item type if in edit mode -->
				{#if editMode}
					<h4 class="text-sm text-secondary-500">Object</h4>
				{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? variable.name : 'New Object'}
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
			class="px-2 lg:px-2 flex flex-col gap-4 items-start"
		>
			<!-- Variable Name Input -->
			<label class="label px-2">
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
			<!-- Value Input -->
			{#if !editMode}
				<ObjectEdit objectVariable={null} onupdate={(v) => handleObjectUpdate(v)} />
			{/if}
			{#if editMode}
				<ObjectEdit
					objectVariable={variable
						? {
								id: Date.now(),
								blockType: 'variable',
								name: '',
								type: 'object',
								value: { ...variable.value },
							}
						: null}
					onupdate={(v) => handleObjectUpdate(v)}
				/>
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
